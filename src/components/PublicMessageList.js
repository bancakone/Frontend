// src/components/PublicMessageList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PublicMessageList.css';

function PublicMessageList() {
    const [userClasses, setUserClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [publicMessages, setPublicMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserClasses = async () => {
            const token = localStorage.getItem('token');
            const loggedInUser = JSON.parse(localStorage.getItem('user'));
            setUser(loggedInUser);

            if (!token || !loggedInUser) {
                setMessage('Vous devez être connecté pour voir les messages publics.');
                return;
            }

            setLoading(true);
            try {
                // Tous les utilisateurs (étudiants, professeurs, coordinateurs) peuvent voir les messages publics de leurs classes.
                // Donc, nous listons toutes les classes dont l'utilisateur est membre.
                const response = await axios.get(
                    '/api/classes/me', // Cette route doit exister pour lister les classes de l'utilisateur.
                                        // Si elle n'existe pas encore, nous devrons la créer dans le backend.
                    { headers: { 'x-auth-token': token } }
                );
                setUserClasses(response.data);
                if (response.data.length > 0) {
                    setSelectedClassId(response.data[0].id); // Sélectionne la première classe par défaut
                } else {
                    setMessage('Vous n\'êtes membre d\'aucune classe pour le moment.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement de vos classes.';
                setMessage(errorMessage);
                console.error('Erreur chargement classes utilisateur (PublicMessageList) :', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserClasses();
    }, []);

    useEffect(() => {
        const fetchPublicMessages = async () => {
            if (!selectedClassId) {
                setPublicMessages([]);
                return;
            }
            setLoading(true);
            setMessage('');
            const token = localStorage.getItem('token');

            try {
                const response = await axios.get(
                    `/api/messages/public/class/${selectedClassId}`,
                    { headers: { 'x-auth-token': token } }
                );
                setPublicMessages(response.data);
                if (response.data.length === 0) {
                    setMessage('Aucun message public pour cette classe.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des messages publics.';
                setMessage(errorMessage);
                setPublicMessages([]);
                console.error('Erreur chargement messages publics :', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        if (selectedClassId) {
            fetchPublicMessages();
        }
    }, [selectedClassId]);

    if (!user) {
        return <div className="public-message-list-container"><p className="message-info error">Vous devez être connecté pour voir les messages.</p></div>;
    }

    return (
        <div className="public-message-list-container">
            <h2>Messages Publics des Classes</h2>
            {message && <p className="message-info">{message}</p>}

            {loading ? (
                <p>Chargement des données...</p>
            ) : (
                userClasses.length > 0 && (
                    <div className="form-group class-select">
                        <label htmlFor="classSelectMessages">Sélectionnez une classe :</label>
                        <select
                            id="classSelectMessages"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="form-select"
                        >
                            {userClasses.map(cla => (
                                <option key={cla.id} value={cla.id}>{cla.nom}</option>
                            ))}
                        </select>
                    </div>
                )
            )}

            {selectedClassId && publicMessages.length > 0 ? (
                <div className="messages-grid">
                    {publicMessages.map(msg => (
                        <div key={msg.id} className="message-card">
                            <p className="message-sender">
                                De : <strong>{msg.senderPrenom} {msg.senderNom}</strong> ({msg.senderRole})
                            </p>
                            <p className="message-content">{msg.content}</p>
                            <p className="message-date">Envoyé le : {new Date(msg.created_at).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            ) : (
                selectedClassId && !message && !loading && (
                    <p className="no-messages-found">Aucun message public trouvé pour cette classe.</p>
                )
            )}
        </div>
    );
}

export default PublicMessageList;