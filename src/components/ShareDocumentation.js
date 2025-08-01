// src/components/ShareDocumentation.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ShareDocumentation.css'; // Pour les styles CSS purs

function ShareDocumentation() {
    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [filePath, setFilePath] = useState(''); // Pour le chemin du fichier/URL
    const [selectedClass, setSelectedClass] = useState(''); // ID de la classe sélectionnée
    const [professorClasses, setProfessorClasses] = useState([]); // Classes du professeur
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfessorClasses = async () => {
            const token = localStorage.getItem('token');
            const loggedInUser = JSON.parse(localStorage.getItem('user'));
            setUser(loggedInUser);

            if (!token || !loggedInUser || loggedInUser.role !== 'Professeur') {
                setMessage('Vous devez être connecté en tant que professeur pour partager de la documentation.');
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
                console.error('Erreur chargement classes professeur (Documentation) :', error.response?.data || error.message);
            }
        };

        fetchProfessorClasses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Réinitialiser le message précédent

        if (!user || user.role !== 'Professeur') {
            setMessage('Accès non autorisé. Seuls les professeurs peuvent partager de la documentation.');
            return;
        }

        if (!selectedClass) {
            setMessage('Veuillez sélectionner une classe.');
            return;
        }

        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(
                '/api/documentations',
                { class_id: selectedClass, titre, description, file_path: filePath },
                {
                    headers: {
                        'x-auth-token': token
                    }
                }
            );
            setMessage(response.data.message);
            setTitre('');
            setDescription('');
            setFilePath('');
            console.log('Documentation partagée :', response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors du partage de la documentation.';
            setMessage(errorMessage);
            console.error('Erreur partage documentation :', error.response?.data || error.message);
        }
    };

    if (user && user.role !== 'Professeur') {
        return <div className="share-documentation-container"><p className="message-info error">Vous n'avez pas l'autorisation de partager de la documentation.</p></div>;
    }

    return (
        <div className="share-documentation-container">
            <h2>Partager une Documentation</h2>
            {message && <p className="message-info">{message}</p>}

            {professorClasses.length > 0 ? (
                <form onSubmit={handleSubmit} className="share-documentation-form">
                    <div className="form-group">
                        <label htmlFor="selectClassDoc">Sélectionnez la classe :</label>
                        <select
                            id="selectClassDoc"
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
                        <label htmlFor="titreDoc">Titre de la documentation :</label>
                        <input
                            type="text"
                            id="titreDoc"
                            value={titre}
                            onChange={(e) => setTitre(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="descriptionDoc">Description (optionnel) :</label>
                        <textarea
                            id="descriptionDoc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="form-textarea"
                            rows="4"
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="filePathDoc">Lien/Chemin du fichier (URL) :</label>
                        <input
                            type="url" // Utiliser le type "url" pour une meilleure validation du navigateur
                            id="filePathDoc"
                            value={filePath}
                            onChange={(e) => setFilePath(e.target.value)}
                            className="form-input"
                            placeholder="ex: https://docs.google.com/document/d/..."
                        />
                    </div>
                    <button type="submit" className="share-documentation-button">
                        Partager la Documentation
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

export default ShareDocumentation;