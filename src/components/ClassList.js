import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClassList.css';

function ClassList() {
    const [classes, setClasses] = useState([]);
    const [message, setMessage] = useState('');
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            setMessage('');
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            if (!token || !user) {
                setMessage('Vous devez être connecté pour voir les classes.');
                setLoading(false);
                return;
            }

            setUserRole(user.role);

            try {
                const apiUrl = user.role === 'Professeur' 
                    ? '/api/classes/professeur' 
                    : '/api/classes/me';
                
                const response = await axios.get(apiUrl, {
                    headers: { 'x-auth-token': token }
                });

                setClasses(response.data);
                if (response.data.length === 0) {
                    setMessage(`Aucune classe ${user.role === 'Professeur' ? 'créée' : 'disponible'}.`);
                }
            } catch (error) {
                setMessage(error.response?.data?.message || 'Erreur lors du chargement des classes.');
                console.error('Erreur:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [userRole]);

    return (
        <div className="classes-dashboard">
            <div className="dashboard-header">
                <h2>Mes Classes</h2>
                <div className="header-decoration"></div>
            </div>

            {message && (
                <div className={`status-alert ${message.includes('Erreur') ? 'error' : 'info'}`}>
                    {message}
                </div>
            )}

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <span>Chargement en cours...</span>
                </div>
            ) : (
                <div className="classes-container">
                    {classes.length > 0 ? (
                        classes.map(cla => (
                            <div key={cla.id} className="class-item">
                                <div className="class-header">
                                    <h3>{cla.nom}</h3>
                                    {userRole === 'Professeur' && (
                                        <span className="creator-badge">Votre classe</span>
                                    )}
                                </div>
                                
                                {cla.description && (
                                    <p className="class-description">{cla.description}</p>
                                )}
                                
                                <div className="class-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Code d'accès:</span>
                                        <span className="detail-value code-highlight">{cla.code}</span>
                                    </div>
                                    
                                    {userRole === 'Etudiant' && cla.professeurNom && (
                                        <div className="detail-item">
                                            <span className="detail-label">Professeur:</span>
                                            <span className="detail-value">
                                                {cla.professeurPrenom} {cla.professeurNom}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="class-actions">
                                    <button className="action-button view-button">
                                        Voir les détails
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        !message && (
                            <div className="empty-state">
                                <p>Aucune classe disponible pour le moment.</p>
                                <button className="action-button primary">
                                    {userRole === 'Professeur' ? 'Créer une classe' : 'Rejoindre une classe'}
                                </button>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export default ClassList;