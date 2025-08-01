import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateAnnouncement.css';

function CreateAnnouncement() {
    const [titre, setTitre] = useState('');
    const [contenu, setContenu] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [professorClasses, setProfessorClasses] = useState([]);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingClasses, setIsFetchingClasses] = useState(true);

    useEffect(() => {
        const fetchProfessorClasses = async () => {
            const token = localStorage.getItem('token');
            const loggedInUser = JSON.parse(localStorage.getItem('user'));
            setUser(loggedInUser);

            if (!token || !loggedInUser || loggedInUser.role !== 'Professeur') {
                setMessage('Vous devez être connecté en tant que professeur pour gérer les annonces.');
                setProfessorClasses([]);
                setIsFetchingClasses(false);
                return;
            }

            try {
                const response = await axios.get('/api/classes/professeur', {
                    headers: { 'x-auth-token': token }
                });
                setProfessorClasses(response.data);
                if (response.data.length > 0) {
                    setSelectedClass(response.data[0].id);
                } else {
                    setMessage('Vous n\'avez pas encore créé de classes.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement de vos classes.';
                setMessage(errorMessage);
                console.error('Erreur chargement classes professeur :', error.response?.data || error.message);
            } finally {
                setIsFetchingClasses(false);
            }
        };

        fetchProfessorClasses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        if (!user || user.role !== 'Professeur') {
            setMessage('Accès non autorisé. Seuls les professeurs peuvent créer des annonces.');
            setIsLoading(false);
            return;
        }

        if (!selectedClass) {
            setMessage('Veuillez sélectionner une classe.');
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(
                '/api/announcements',
                { class_id: selectedClass, titre, contenu },
                { headers: { 'x-auth-token': token } }
            );
            setMessage(response.data.message);
            setTitre('');
            setContenu('');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la création de l\'annonce.';
            setMessage(errorMessage);
            console.error('Erreur création annonce :', error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (user && user.role !== 'Professeur') {
        return (
            <div className="unauthorized-container">
                <div className="unauthorized-message">
                    Vous n'avez pas l'autorisation de créer des annonces.
                </div>
            </div>
        );
    }

    return (
        <div className="create-announcement-container">
            <div className="announcement-card">
                <div className="announcement-header">
                    <h2>Créer une Annonce</h2>
                    <p>Publiez une annonce pour informer les étudiants de votre classe</p>
                </div>

                {message && (
                    <div className={`message ${message.includes('Erreur') || message.includes('non autorisé') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                {isFetchingClasses ? (
                    <div className="loading-spinner"></div>
                ) : professorClasses.length > 0 ? (
                    <form onSubmit={handleSubmit} className="announcement-form">
                        <div className="form-group">
                            <label htmlFor="selectClass">
                                Classe <span className="required">*</span>
                            </label>
                            <select
                                id="selectClass"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                required
                            >
                                {professorClasses.map(cla => (
                                    <option key={cla.id} value={cla.id}>{cla.nom}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="titre">
                                Titre <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="titre"
                                value={titre}
                                onChange={(e) => setTitre(e.target.value)}
                                placeholder="Ex: Devoir à rendre pour la semaine prochaine"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contenu">
                                Contenu <span className="required">*</span>
                            </label>
                            <textarea
                                id="contenu"
                                value={contenu}
                                onChange={(e) => setContenu(e.target.value)}
                                rows="6"
                                placeholder="Détails de l'annonce..."
                                required
                            ></textarea>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={isLoading ? 'loading' : ''}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Publication en cours...
                                    </>
                                ) : (
                                    'Publier l\'Annonce'
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    !isFetchingClasses && (
                        <div className="warning-message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <p>{message || "Vous n'avez pas encore créé de classes. Veuillez créer une classe avant de pouvoir publier des annonces."}</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default CreateAnnouncement;