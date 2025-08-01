// src/components/SubmissionReview.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SubmissionReview.css'; // Pour les styles CSS purs

function SubmissionReview() {
    const [professorClasses, setProfessorClasses] = useState([]); // Classes du professeur
    const [selectedClassId, setSelectedClassId] = useState(''); // Classe sélectionnée
    const [tasks, setTasks] = useState([]); // Tâches de la classe sélectionnée
    const [selectedTaskId, setSelectedTaskId] = useState(''); // Tâche sélectionnée
    const [submissions, setSubmissions] = useState([]); // Soumissions pour la tâche sélectionnée
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Pour la notation
    const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [gradingMessage, setGradingMessage] = useState('');

    // Charger les classes du professeur au montage
    useEffect(() => {
        const fetchProfessorClasses = async () => {
            const token = localStorage.getItem('token');
            const loggedInUser = JSON.parse(localStorage.getItem('user'));
            setUser(loggedInUser);

            if (!token || !loggedInUser || loggedInUser.role !== 'Professeur') {
                setMessage('Vous devez être connecté en tant que professeur pour corriger les soumissions.');
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
                    setSelectedClassId(response.data[0].id); // Sélectionne la première classe par défaut
                } else {
                    setMessage('Vous n\'avez pas encore créé de classes.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement de vos classes.';
                setMessage(errorMessage);
                console.error('Erreur chargement classes professeur (SubmissionReview) :', error.response?.data || error.message);
            }
        };

        fetchProfessorClasses();
    }, []);

    // Charger les tâches lorsque la classe sélectionnée change
    useEffect(() => {
        const fetchTasks = async () => {
            if (!selectedClassId) {
                setTasks([]);
                setSubmissions([]);
                return;
            }
            setLoading(true);
            setMessage('');
            const token = localStorage.getItem('token');

            try {
                const response = await axios.get(
                    `/api/tasks/class/${selectedClassId}`,
                    {
                        headers: {
                            'x-auth-token': token
                        }
                    }
                );
                setTasks(response.data);
                if (response.data.length > 0) {
                    setSelectedTaskId(''); // Réinitialise la tâche sélectionnée quand la classe change
                    setSubmissions([]); // Réinitialise les soumissions
                    setMessage('');
                } else {
                    setMessage('Aucune tâche assignée pour cette classe.');
                    setSelectedTaskId('');
                    setSubmissions([]);
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des tâches.';
                setMessage(errorMessage);
                setTasks([]);
                setSelectedTaskId('');
                setSubmissions([]);
                console.error('Erreur chargement tâches (SubmissionReview) :', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        if (selectedClassId) {
            fetchTasks();
        }
    }, [selectedClassId]);

    // Charger les soumissions lorsque la tâche sélectionnée change
    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!selectedTaskId) {
                setSubmissions([]);
                return;
            }
            setLoading(true);
            setMessage('');
            const token = localStorage.getItem('token');

            try {
                const response = await axios.get(
                    `/api/tasks/${selectedTaskId}/submissions`,
                    {
                        headers: {
                            'x-auth-token': token
                        }
                    }
                );
                setSubmissions(response.data);
                if (response.data.length === 0) {
                    setMessage('Aucune soumission pour cette tâche.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des soumissions.';
                setMessage(errorMessage);
                setSubmissions([]);
                console.error('Erreur chargement soumissions :', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        if (selectedTaskId) {
            fetchSubmissions();
        }
    }, [selectedTaskId]);

    const handleGradeClick = (submissionId, currentGrade, currentFeedback) => {
        setGradingSubmissionId(submissionId);
        setGrade(currentGrade || '');
        setFeedback(currentFeedback || '');
        setGradingMessage('');
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        setGradingMessage('');
        const token = localStorage.getItem('token');

        try {
            const response = await axios.put(
                `/api/submissions/${gradingSubmissionId}/grade`,
                { grade: parseInt(grade), feedback },
                {
                    headers: {
                        'x-auth-token': token
                    }
                }
            );
            setGradingMessage(response.data.message);
            setGradingSubmissionId(null); // Fermer le formulaire après soumission

            // Mettre à jour la soumission dans la liste localement
            setSubmissions(prevSubmissions =>
                prevSubmissions.map(sub =>
                    sub.id === gradingSubmissionId
                        ? { ...sub, grade: parseInt(grade), correction_feedback: feedback }
                        : sub
                )
            );
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la notation de la soumission.';
            setGradingMessage(errorMessage);
            console.error('Erreur notation soumission :', error.response?.data || error.message);
        }
    };

    if (user && user.role !== 'Professeur') {
        return <div className="submission-review-container"><p className="message-info error">Vous n'avez pas l'autorisation de corriger les soumissions.</p></div>;
    }

    return (
        <div className="submission-review-container">
            <h2>Corriger les Soumissions</h2>
            {message && <p className="message-info">{message}</p>}

            {professorClasses.length > 0 ? (
                <>
                    <div className="class-task-select-group">
                        <label htmlFor="selectClassReview">Sélectionnez la classe :</label>
                        <select
                            id="selectClassReview"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="form-select"
                            required
                        >
                            {professorClasses.map(cla => (
                                <option key={cla.id} value={cla.id}>{cla.nom}</option>
                            ))}
                        </select>
                    </div>

                    {selectedClassId && tasks.length > 0 && (
                        <div className="class-task-select-group">
                            <label htmlFor="selectTaskReview">Sélectionnez la tâche :</label>
                            <select
                                id="selectTaskReview"
                                value={selectedTaskId}
                                onChange={(e) => setSelectedTaskId(e.target.value)}
                                className="form-select"
                                required
                            >
                                <option value="">-- Sélectionnez une tâche --</option>
                                {tasks.map(task => (
                                    <option key={task.id} value={task.id}>{task.titre}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {loading ? (
                        <p>Chargement des données...</p>
                    ) : (
                        selectedTaskId && submissions.length > 0 ? (
                            <div className="submissions-grid">
                                {submissions.map(submission => (
                                    <div key={submission.id} className="submission-card">
                                        <h3>Soumission de {submission.studentPrenom} {submission.studentNom}</h3>
                                        <p>Soumis le : {new Date(submission.submitted_at).toLocaleString()}</p>
                                        {submission.file_path && (
                                            <p><a href={submission.file_path} target="_blank" rel="noopener noreferrer">Voir le fichier soumis</a></p>
                                        )}
                                        {submission.content && <p className="submission-content">**Contenu :** {submission.content}</p>}

                                        {submission.grade !== null && <p className="grade-display">Note : {submission.grade} / 100</p>}
                                        {submission.correction_feedback && <p className="feedback-display">Feedback : {submission.correction_feedback}</p>}

                                        {gradingSubmissionId === submission.id ? (
                                            <form onSubmit={handleGradeSubmit} className="grading-form">
                                                <h4>Noter la soumission</h4>
                                                <div className="form-group">
                                                    <label htmlFor={`grade-${submission.id}`}>Note (0-100) :</label>
                                                    <input
                                                        type="number"
                                                        id={`grade-${submission.id}`}
                                                        value={grade}
                                                        onChange={(e) => setGrade(e.target.value)}
                                                        className="form-input"
                                                        min="0"
                                                        max="100"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor={`feedback-${submission.id}`}>Feedback :</label>
                                                    <textarea
                                                        id={`feedback-${submission.id}`}
                                                        value={feedback}
                                                        onChange={(e) => setFeedback(e.target.value)}
                                                        className="form-textarea"
                                                        rows="4"
                                                    ></textarea>
                                                </div>
                                                <button type="submit" className="grade-button">Enregistrer la note</button>
                                                <button type="button" className="cancel-button" onClick={() => setGradingSubmissionId(null)}>Annuler</button>
                                                {gradingMessage && <p className="grading-message">{gradingMessage}</p>}
                                            </form>
                                        ) : (
                                            <button
                                                className="grade-button"
                                                onClick={() => handleGradeClick(submission.id, submission.grade, submission.correction_feedback)}
                                            >
                                                {submission.grade !== null ? 'Modifier Note/Feedback' : 'Noter cette soumission'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            selectedTaskId && !message && <p>Sélectionnez une tâche pour voir ses soumissions ou aucune soumission n'a été faite.</p>
                        )
                    )}
                </>
            ) : (
                user && user.role === 'Professeur' && !message.includes("Vous n'avez pas encore créé") && (
                    <p className="message-info">Chargement de vos classes...</p>
                )
            )}
        </div>
    );
}

export default SubmissionReview;