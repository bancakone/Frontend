import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DocumentationList.css';

function DocumentationList() {
    const [userClasses, setUserClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [documentations, setDocumentations] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserClasses = async () => {
            setMessage('');
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            if (!token || !user) {
                setMessage('Vous devez être connecté pour voir la documentation.');
                setUserClasses([]);
                setDocumentations([]);
                return;
            }

            try {
                const response = await axios.get('/api/classes/me', {
                    headers: { 'x-auth-token': token }
                });
                setUserClasses(response.data);
                if (response.data.length > 0 && !selectedClassId) {
                    setSelectedClassId(response.data[0].id);
                } else if (response.data.length === 0) {
                    setMessage('Vous n\'êtes inscrit à aucune classe pour le moment.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement de vos classes.';
                setMessage(errorMessage);
                setUserClasses([]);
                setDocumentations([]);
                console.error('Erreur chargement classes utilisateur:', error.response?.data || error.message);
            }
        };

        fetchUserClasses();
    }, []);

    useEffect(() => {
        const fetchDocumentations = async () => {
            if (!selectedClassId) {
                setDocumentations([]);
                return;
            }

            setLoading(true);
            setMessage('');

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`/api/documentations/${selectedClassId}`, {
                    headers: { 'x-auth-token': token }
                });
                setDocumentations(response.data);
                if (response.data.length === 0) {
                    setMessage('Aucune documentation pour cette classe.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement de la documentation.';
                setMessage(errorMessage);
                setDocumentations([]);
                console.error('Erreur chargement documentation:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDocumentations();
    }, [selectedClassId]);

    return (
        <div className="documentation-list-container">
            <h2>Documentation des Classes</h2>
            
            {message && <p className="message-info">{message}</p>}

            {userClasses.length > 0 && (
                <div className="class-select-group">
                    <label htmlFor="selectClassDocToView">Voir la documentation pour :</label>
                    <select
                        id="selectClassDocToView"
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
                <p className="loading-text">Chargement de la documentation...</p>
            ) : (
                selectedClassId && documentations.length > 0 ? (
                    <div className="documentations-grid">
                        {documentations.map(doc => (
                            <div key={doc.id} className="documentation-card">
                                <h3>{doc.titre}</h3>
                                {doc.description && <p className="documentation-description">{doc.description}</p>}
                                {doc.file_path && (
                                    <p className="documentation-link">
                                        <a href={doc.file_path} target="_blank" rel="noopener noreferrer">
                                            Voir le document
                                        </a>
                                    </p>
                                )}
                                <p className="documentation-meta">
                                    Partagé par {doc.professeurNom} {doc.professeurPrenom} le {new Date(doc.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    selectedClassId && !message && <p>Sélectionnez une classe pour voir sa documentation.</p>
                )
            )}
        </div>
    );
}

export default DocumentationList;