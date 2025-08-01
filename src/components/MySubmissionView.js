// src/components/MySubmissionView.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MySubmissionView.css'; // Pour les styles CSS purs

function MySubmissionView({ submissionId, onClose }) {
    const [submission, setSubmission] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const fetchSubmission = async () => {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            setUserRole(user ? user.role : '');

            if (!token || !user || !submissionId) {
                setMessage('Informations de connexion ou de soumission manquantes.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `/api/submissions/${submissionId}`,
                    {
                        headers: {
                            'x-auth-token': token
                        }
                    }
                );
                setSubmission(response.data);
                setMessage('');
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement de la soumission.';
                setMessage(errorMessage);
                console.error('Erreur chargement soumission spécifique :', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [submissionId]); // Re-déclenche si l'ID de soumission change

    if (loading) {
        return <div className="my-submission-view-container"><p>Chargement de votre soumission...</p></div>;
    }

    if (message) {
        return <div className="my-submission-view-container"><p className="message-info error">{message}</p><button onClick={onClose} className="close-button">Fermer</button></div>;
    }

    if (!submission) {
        return <div className="my-submission-view-container"><p className="message-info">Aucune soumission trouvée.</p><button onClick={onClose} className="close-button">Fermer</button></div>;
    }

    return (
        <div className="my-submission-view-container">
            <h2>Votre Soumission pour "{submission.taskTitre}"</h2>
            <div className="submission-details-card">
                <p><strong>Description de la tâche :</strong> {submission.taskDescription || 'N/A'}</p>
                <p><strong>Date limite de la tâche :</strong> {new Date(submission.taskDateLimite).toLocaleString()}</p>
                <p><strong>Soumis le :</strong> {new Date(submission.submitted_at).toLocaleString()}</p>

                {submission.file_path && (
                    <p><strong>Lien/Fichier :</strong> <a href={submission.file_path} target="_blank" rel="noopener noreferrer">Voir le travail soumis</a></p>
                )}
                {submission.content && <p><strong>Votre contenu :</strong> <span className="submission-content-text">{submission.content}</span></p>}

                {submission.grade !== null && (
                    <p className="grade-result"><strong>Note :</strong> {submission.grade} / 100</p>
                )}
                {submission.correction_feedback && (
                    <p className="feedback-result"><strong>Feedback du professeur :</strong> <span className="feedback-text">{submission.correction_feedback}</span></p>
                )}

                {submission.grade === null && !submission.correction_feedback && (
                    <p className="no-correction-message">Cette soumission n'a pas encore été corrigée par le professeur.</p>
                )}
            </div>
            <button onClick={onClose} className="close-button">Fermer</button>
        </div>
    );
}

export default MySubmissionView;