// src/components/JoinClass.js
import React, { useState } from 'react';
import axios from 'axios';
import './JoinClass.css'; // Pour les styles CSS purs

function JoinClass({ onClassJoined }) { // onClassJoined est une prop optionnelle pour rafraîchir la liste
    const [classCode, setClassCode] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Réinitialiser le message précédent

        const token = localStorage.getItem('token'); // Récupérer le token JWT
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user) {
            setMessage('Vous devez être connecté pour rejoindre une classe.');
            return;
        }

        if (user.role !== 'Etudiant') {
            setMessage('Seuls les étudiants peuvent rejoindre une classe par code.');
            return;
        }

        try {
            const response = await axios.post(
                '/api/classes/join',
                { code: classCode },
                {
                    headers: {
                        'x-auth-token': token // Envoyer le token dans les headers
                    }
                }
            );
            setMessage(response.data.message);
            setClassCode(''); // Vider le champ après succès
            console.log('Classe rejointe :', response.data);

            // Si une fonction de rafraîchissement est passée en prop, l'appeler
            if (onClassJoined) {
                onClassJoined();
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription à la classe.';
            setMessage(errorMessage);
            console.error('Erreur inscription classe :', error.response?.data || error.message);
        }
    };

    return (
        <div className="join-class-container">
            <h2>Rejoindre une Classe</h2>
            <form onSubmit={handleSubmit} className="join-class-form">
                <div className="form-group">
                    <label htmlFor="classCode">Code de la classe :</label>
                    <input
                        type="text"
                        id="classCode"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value.toUpperCase())} // Convertir en majuscules
                        className="form-input"
                        required
                        maxLength="6" // Limite à 6 caractères pour le code
                    />
                </div>
                <button type="submit" className="join-class-button">
                    Rejoindre
                </button>
            </form>
            {message && <p className="message-info">{message}</p>}
        </div>
    );
}

export default JoinClass;