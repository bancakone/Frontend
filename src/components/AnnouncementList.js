// src/components/AnnouncementList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AnnouncementList.css'; // Pour les styles CSS purs

function AnnouncementList() {
    const [userClasses, setUserClasses] = useState([]); // Classes de l'utilisateur (pour le sélecteur)
    const [selectedClassId, setSelectedClassId] = useState(''); // ID de la classe sélectionnée
    const [announcements, setAnnouncements] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserClasses = async () => {
            setMessage('');
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            if (!token || !user) {
                setMessage('Vous devez être connecté pour voir les annonces.');
                setUserClasses([]);
                setAnnouncements([]);
                return;
            }

            try {
                // Récupère toutes les classes auxquelles l'utilisateur est inscrit (prof ou étudiant)
                const response = await axios.get(
                    '/api/classes/me',
                    {
                        headers: {
                            'x-auth-token': token
                        }
                    }
                );
                setUserClasses(response.data);
                if (response.data.length > 0) {
                    // Sélectionnez la première classe si aucune n'est déjà sélectionnée
                    if (!selectedClassId) {
                        setSelectedClassId(response.data[0].id);
                    }
                } else {
                    setMessage('Vous n\'êtes inscrit à aucune classe pour le moment.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement de vos classes.';
                setMessage(errorMessage);
                setUserClasses([]);
                setAnnouncements([]);
                console.error('Erreur chargement classes utilisateur :', error.response?.data || error.message);
            }
        };

        fetchUserClasses();
    }, []); // Se déclenche une fois au montage

    useEffect(() => {
        const fetchAnnouncements = async () => {
            if (!selectedClassId) {
                setAnnouncements([]);
                return;
            }

            setLoading(true);
            setMessage('');
            const token = localStorage.getItem('token');

            try {
                const response = await axios.get(
                    `/api/announcements/${selectedClassId}`,
                    {
                        headers: {
                            'x-auth-token': token
                        }
                    }
                );
                setAnnouncements(response.data);
                if (response.data.length === 0) {
                    setMessage('Aucune annonce pour cette classe.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des annonces.';
                setMessage(errorMessage);
                setAnnouncements([]);
                console.error('Erreur chargement annonces :', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        // Ne charge les annonces que si une classe est sélectionnée
        if (selectedClassId) {
            fetchAnnouncements();
        }
    }, [selectedClassId]); // Se déclenche quand la classe sélectionnée change

    return (
        <div className="announcement-list-container">
            <h2>Annonces des Classes</h2>
            {message && <p className="message-info">{message}</p>}

            {userClasses.length > 0 && (
                <div className="class-select-group">
                    <label htmlFor="selectClassToView">Voir les annonces pour :</label>
                    <select
                        id="selectClassToView"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="form-select"
                    >
                        {userClasses.map(cla => (
                            <option key={cla.id} value={cla.id}>{cla.nom}</option>
                        ))}
                    </select>
                </div>
            )}

            {loading ? (
                <p>Chargement des annonces...</p>
            ) : (
                selectedClassId && announcements.length > 0 ? (
                    <div className="announcements-grid">
                        {announcements.map(announcement => (
                            <div key={announcement.id} className="announcement-card">
                                <h3>{announcement.titre}</h3>
                                <p className="announcement-content">{announcement.contenu}</p>
                                <p className="announcement-meta">
                                    Publié par {announcement.professeurNom} {announcement.professeurPrenom} le {new Date(announcement.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    selectedClassId && !message && <p>Sélectionnez une classe pour voir ses annonces.</p>
                )
            )}
        </div>
    );
}

export default AnnouncementList;