// src/components/MySubmissions.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MySubmissionView from './MySubmissionView'; // Pour afficher le détail
import './MySubmissions.css';

function MySubmissions() {
    const [mySubmissions, setMySubmissions] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Pour afficher le détail d'une soumission
    const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

    useEffect(() => {
        const fetchMySubmissions = async () => {
            const token = localStorage.getItem('token');
            const loggedInUser = JSON.parse(localStorage.getItem('user'));
            setUser(loggedInUser);

            if (!token || !loggedInUser || loggedInUser.role !== 'Etudiant') {
                setMessage('Vous devez être connecté en tant qu\'étudiant pour voir vos soumissions.');
                setLoading(false);
                return;
            }

            try {
                // Nous avons besoin d'une nouvelle API backend pour lister toutes les soumissions d'un étudiant.
                // Pour l'instant, je vais simuler cette API et vous devrez l'ajouter au backend.
                // Sinon, nous devrions modifier TaskList pour pré-charger la soumission de l'étudiant.
                // Créons une nouvelle API backend `GET /api/users/me/submissions` pour simplifier.

                // *** NOTE IMPORTANTE *** :
                // Cette ligne fera une erreur 404 tant que l'API n'est pas ajoutée au backend.
                // Je vous donnerai le code backend juste après.
                const response = await axios.get(
                    '/api/users/me/submissions',
                    {
                        headers: {
                            'x-auth-token': token
                        }
                    }
                );
                setMySubmissions(response.data);
                if (response.data.length === 0) {
                    setMessage('Vous n\'avez pas encore fait de soumissions.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement de vos soumissions.';
                setMessage(errorMessage);
                console.error('Erreur chargement soumissions de l\'étudiant :', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMySubmissions();
    }, []);

    if (user && user.role !== 'Etudiant') {
        return <div className="my-submissions-container"><p className="message-info error">Vous n'avez pas l'autorisation de voir cette page.</p></div>;
    }

    if (selectedSubmissionId) {
        return <MySubmissionView submissionId={selectedSubmissionId} onClose={() => setSelectedSubmissionId(null)} />;
    }

    return (
        <div className="my-submissions-container">
            <h2>Mes Soumissions</h2>
            {message && <p className="message-info">{message}</p>}

            {loading ? (
                <p>Chargement de vos soumissions...</p>
            ) : (
                mySubmissions.length > 0 ? (
                    <div className="submissions-grid">
                        {mySubmissions.map(submission => (
                            <div key={submission.id} className="submission-card">
                                <h3>{submission.taskTitre}</h3>
                                <p>Classe : {submission.className}</p>
                                <p>Soumis le : {new Date(submission.submitted_at).toLocaleDateString()}</p>
                                {submission.grade !== null && (
                                    <p className="submission-grade">Note : {submission.grade} / 100</p>
                                )}
                                {submission.correction_feedback && (
                                    <p className="submission-feedback">Feedback reçu</p>
                                )}
                                {!submission.grade && !submission.correction_feedback && (
                                    <p className="no-grade-message">En attente de correction</p>
                                )}
                                <button
                                    onClick={() => setSelectedSubmissionId(submission.id)}
                                    className="view-details-button"
                                >
                                    Voir les détails
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    !message && <p>Aucune soumission à afficher pour le moment.</p>
                )
            )}
        </div>
    );
}

export default MySubmissions;