// src/components/CreateAnnouncement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateAnnouncement.css'; // Pour les styles CSS purs

function CreateAnnouncement() {
    const [titre, setTitre] = useState('');
    const [contenu, setContenu] = useState('');
    const [selectedClass, setSelectedClass] = useState(''); // Pour stocker l'ID de la classe sélectionnée
    const [professorClasses, setProfessorClasses] = useState([]); // Pour stocker les classes du professeur
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfessorClasses = async () => {
            const token = localStorage.getItem('token');
            const loggedInUser = JSON.parse(localStorage.getItem('user'));
            setUser(loggedInUser);

            if (!token || !loggedInUser || loggedInUser.role !== 'Professeur') {
                setMessage('Vous devez être connecté en tant que professeur pour gérer les annonces.');
                setProfessorClasses([]);
                return;
            }

            try {
                const response = await axios.get(
                    '/api/classes/professeur',
                    {
                        headers: {
                            'x-auth-token': token
                        }
                    }
                );
                setProfessorClasses(response.data);
                if (response.data.length > 0) {
                    setSelectedClass(response.data[0].id); // Sélectionne la première classe par défaut
                } else {
                    setMessage('Vous n\'avez pas encore créé de classes.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement de vos classes.';
                setMessage(errorMessage);
                console.error('Erreur chargement classes professeur :', error.response?.data || error.message);
            }
        };

        fetchProfessorClasses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Réinitialiser le message précédent

        if (!user || user.role !== 'Professeur') {
            setMessage('Accès non autorisé. Seuls les professeurs peuvent créer des annonces.');
            return;
        }

        if (!selectedClass) {
            setMessage('Veuillez sélectionner une classe.');
            return;
        }

        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(
                '/api/announcements',
                { class_id: selectedClass, titre, contenu },
                {
                    headers: {
                        'x-auth-token': token
                    }
                }
            );
            setMessage(response.data.message);
            setTitre('');
            setContenu('');
            console.log('Annonce créée :', response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la création de l\'annonce.';
            setMessage(errorMessage);
            console.error('Erreur création annonce :', error.response?.data || error.message);
        }
    };

    if (user && user.role !== 'Professeur') {
        return <div className="create-announcement-container"><p className="message-info error">Vous n'avez pas l'autorisation de créer des annonces.</p></div>;
    }

    return (
        <div className="create-announcement-container">
            <h2>Créer une Annonce</h2>
            {message && <p className="message-info">{message}</p>}

            {professorClasses.length > 0 ? (
                <form onSubmit={handleSubmit} className="create-announcement-form">
                    <div className="form-group">
                        <label htmlFor="selectClass">Sélectionnez la classe :</label>
                        <select
                            id="selectClass"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="form-select"
                            required
                        >
                            {professorClasses.map(cla => (
                                <option key={cla.id} value={cla.id}>{cla.nom}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="titre">Titre de l'annonce :</label>
                        <input
                            type="text"
                            id="titre"
                            value={titre}
                            onChange={(e) => setTitre(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="contenu">Contenu de l'annonce :</label>
                        <textarea
                            id="contenu"
                            value={contenu}
                            onChange={(e) => setContenu(e.target.value)}
                            className="form-textarea"
                            rows="6"
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="create-announcement-button">
                        Publier l'Annonce
                    </button>
                </form>
            ) : (
                user && user.role === 'Professeur' && !message.includes("Vous n'avez pas encore créé") && (
                    <p className="message-info">Chargement de vos classes...</p>
                )
            )}
        </div>
    );
}

export default CreateAnnouncement;