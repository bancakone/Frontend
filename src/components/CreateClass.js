// src/components/CreateClass.js
import React, { useState } from 'react';
import axios from 'axios';
import './CreateClass.css'; // Pour les styles CSS purs

function CreateClass() {
    const [nom, setNom] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Réinitialiser le message précédent

        const token = localStorage.getItem('token'); // Récupérer le token JWT

        if (!token) {
            setMessage('Vous devez être connecté en tant que professeur pour créer une classe.');
            return;
        }

        try {
            const response = await axios.post(
                '/api/classes',
                { nom, description },
                {
                    headers: {
                        'x-auth-token': token // Envoyer le token dans les headers
                    }
                }
            );
            setMessage(response.data.message + ` Code de la classe : ${response.data.class.code}`);
            setNom('');
            setDescription('');
            console.log('Classe créée :', response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la création de la classe.';
            setMessage(errorMessage);
            console.error('Erreur création classe :', error.response?.data || error.message);
        }
    };

    return (
        <div className="create-class-container">
            <h2>Créer une Nouvelle Classe</h2>
            <form onSubmit={handleSubmit} className="create-class-form">
                <div className="form-group">
                    <label htmlFor="nom">Nom de la classe :</label>
                    <input
                        type="text"
                        id="nom"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description :</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form-textarea"
                        rows="4"
                    ></textarea>
                </div>
                <button type="submit" className="create-class-button">
                    Créer la classe
                </button>
            </form>
            {message && <p className="message-info">{message}</p>}
        </div>
    );
}

export default CreateClass;