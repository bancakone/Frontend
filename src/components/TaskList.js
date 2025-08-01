// src/components/TaskList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskList.css'; // Pour les styles CSS purs
import MySubmissionView from './MySubmissionView'; // <-- AJOUTEZ CETTE LIGNE

function TaskList() {
    const [userClasses, setUserClasses] = useState([]); // Classes de l'utilisateur
    const [selectedClassId, setSelectedClassId] = useState(''); // ID de la classe sélectionnée
    const [tasks, setTasks] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState('');

    // Pour la soumission d'une tâche
    const [submittingTaskId, setSubmittingTaskId] = useState(null);
    const [submissionFilePath, setSubmissionFilePath] = useState('');
    const [submissionContent, setSubmissionContent] = useState('');
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [viewingSubmissionId, setViewingSubmissionId] = useState(null); // Nouvel état

    useEffect(() => {
        const fetchUserClasses = async () => {
            setMessage('');
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            setUserRole(user ? user.role : '');

            if (!token || !user) {
                setMessage('Vous devez être connecté pour voir les tâches.');
                setUserClasses([]);
                setTasks([]);
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
                    if (!selectedClassId) {
                        setSelectedClassId(response.data[0].id); // Sélectionne la première classe par défaut
                    }
                } else {
                    setMessage('Vous n\'êtes inscrit à aucune classe pour le moment.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement de vos classes.';
                setMessage(errorMessage);
                setUserClasses([]);
                setTasks([]);
                console.error('Erreur chargement classes utilisateur (TaskList) :', error.response?.data || error.message);
            }
        };

        fetchUserClasses();
    }, []); // Se déclenche une fois au montage

    useEffect(() => {
    const fetchTasks = async () => {
        if (!selectedClassId) {
            setTasks([]);
            return;
        }

        setLoading(true);
        setMessage('');
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user')); // Récupérer l'utilisateur ici

        try {
            const response = await axios.get(
                `/api/tasks/class/${selectedClassId}`,
                {
                    headers: {
                        'x-auth-token': token
                    }
                }
            );

            // Pour chaque tâche, vérifier si l'utilisateur (étudiant) a déjà soumis
            const tasksWithSubmissionStatus = await Promise.all(
                response.data.map(async (task) => {
                    if (user && user.role === 'Etudiant') {
                        try {
                            // Cette route API devrait être celle pour obtenir la soumission de l'étudiant pour une tâche spécifique
                            // Nous n'avons pas encore une route dédiée pour "ma soumission pour cette tâche",
                            // donc nous allons devoir ruser un peu en essayant d'obtenir la soumission complète
                            // ou en créant une nouvelle route backend si nécessaire.
                            // Pour l'instant, on va simuler en appelant l'API 'get a specific submission by id'
                            // ce qui n'est pas idéal si on n'a pas l'ID de la soumission.

                            // **Alternative plus simple pour l'UX sans nouvelle API** :
                            // L'étudiant peut voir sa soumission seulement APRÈS l'avoir faite.
                            // Pour le moment, nous allons simplement afficher un bouton de soumission,
                            // et nous ferons un composant séparé pour "Mes Soumissions" qui liste toutes les soumissions
                            // de l'étudiant avec leur statut.

                            // Plutôt que d'essayer de pré-fetcher ici, laissons l'étudiant cliquer sur un bouton "Voir mes soumissions"
                            // dans son tableau de bord, ou "Voir ma soumission" à côté de la tâche si elle est déjà soumise.
                            // Pour cela, nous aurions besoin d'une API '/api/tasks/:taskId/mySubmission'
                            // ou plus simplement, une API '/api/users/me/submissions' qui liste toutes les soumissions de l'étudiant.

                            // **Simplifions pour l'instant :**
                            // Le bouton de soumission est toujours là pour les étudiants.
                            // Nous allons créer un autre composant global "MySubmissions" (similaire à ClassList)
                            // qui listera toutes les soumissions faites par l'étudiant, avec leurs détails.
                            // C'est plus simple que de tenter de pré-détecter les soumissions ici.
                            return { ...task, hasSubmitted: false }; // Pas de détection ici pour l'instant
                        } catch (error) {
                            // Pas de soumission ou erreur
                            return { ...task, hasSubmitted: false };
                        }
                    }
                    return { ...task, hasSubmitted: false };
                })
            );
            setTasks(tasksWithSubmissionStatus);
            if (response.data.length === 0) {
                setMessage('Aucune tâche assignée pour cette classe.');
            }
        } catch (error) {
            // ... gestion des erreurs
        } finally {
            setLoading(false);
        }
    };

    if (selectedClassId) {
        fetchTasks();
    }
}, [selectedClassId]); // Se déclenche quand la classe sélectionnée change

    const handleSubmissionClick = (taskId) => {
        setSubmittingTaskId(taskId);
        setSubmissionFilePath('');
        setSubmissionContent('');
        setSubmissionMessage('');
    };

    const handleSubmission = async (e) => {
        e.preventDefault();
        setSubmissionMessage('');
        const token = localStorage.getItem('token');

        if (!submissionFilePath && !submissionContent) {
            setSubmissionMessage('Veuillez fournir un lien/chemin ou un contenu pour la soumission.');
            return;
        }

        try {
            const response = await axios.post(
                `/api/tasks/${submittingTaskId}/submit`,
                { file_path: submissionFilePath, content: submissionContent },
                {
                    headers: {
                        'x-auth-token': token
                    }
                }
            );
            setSubmissionMessage(response.data.message);
            setSubmittingTaskId(null); // Fermer le formulaire après soumission
            // Optionnel: rafraîchir la liste des tâches pour montrer le statut de soumission si implémenté
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la soumission de la tâche.';
            setSubmissionMessage(errorMessage);
            console.error('Erreur soumission tâche :', error.response?.data || error.message);
        }
    };

    return (
        <div className="task-list-container">
            <h2>Tâches des Classes</h2>
            {message && <p className="message-info">{message}</p>}

            {userClasses.length > 0 && (
                <div className="class-select-group">
                    <label htmlFor="selectClassTaskToView">Voir les tâches pour :</label>
                    <select
                        id="selectClassTaskToView"
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
                <p>Chargement des tâches...</p>
            ) : (
                selectedClassId && tasks.length > 0 ? (
                    <div className="tasks-grid">
                        {tasks.map(task => (
                            <div key={task.id} className="task-card">
                                <h3>{task.titre}</h3>
                                {task.description && <p className="task-description">{task.description}</p>}
                                <p className="task-meta">
                                    Date limite : {new Date(task.date_limite).toLocaleString()}
                                </p>
                                <p className="task-meta">
                                    Assigné par {task.professeurNom} {task.professeurPrenom} le {new Date(task.created_at).toLocaleDateString()}
                                </p>

                                {userRole === 'Etudiant' && (
                                    <button
                                        className="submit-task-button"
                                        onClick={() => handleSubmissionClick(task.id)}
                                    >
                                        Soumettre le travail
                                    </button>
                                )}

                                {submittingTaskId === task.id && userRole === 'Etudiant' && (
                                    <form onSubmit={handleSubmission} className="submission-form">
                                        <h4>Soumettre pour "{task.titre}"</h4>
                                        <div className="form-group">
                                            <label htmlFor={`filePath-${task.id}`}>Lien/Chemin du fichier (URL) :</label>
                                            <input
                                                type="url"
                                                id={`filePath-${task.id}`}
                                                value={submissionFilePath}
                                                onChange={(e) => setSubmissionFilePath(e.target.value)}
                                                className="form-input"
                                                placeholder="ex: https://github.com/mon-projet"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor={`content-${task.id}`}>Contenu textuel (optionnel) :</label>
                                            <textarea
                                                id={`content-${task.id}`}
                                                value={submissionContent}
                                                onChange={(e) => setSubmissionContent(e.target.value)}
                                                className="form-textarea"
                                                rows="3"
                                                placeholder="Vos commentaires ou réponse directe..."
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="submit-button">Envoyer la soumission</button>
                                        <button type="button" className="cancel-button" onClick={() => setSubmittingTaskId(null)}>Annuler</button>
                                        {submissionMessage && <p className="submission-message">{submissionMessage}</p>}
                                    </form>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    selectedClassId && !message && <p>Sélectionnez une classe pour voir ses tâches.</p>
                )
            )}
        </div>
    );
}

export default TaskList;