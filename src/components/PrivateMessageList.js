// src/components/PrivateMessageList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PrivateMessageList.css';

function PrivateMessageList() {
    const [privateMessages, setPrivateMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const fetchPrivateMessages = async () => {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            setCurrentUserId(user ? user.id : null);

            if (!token || !user) {
                setMessage('Vous devez être connecté pour voir vos messages privés.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    '/api/messages/private/me', // Cette route backend est déjà créée
                    { headers: { 'x-auth-token': token } }
                );
                setPrivateMessages(response.data);
                if (response.data.length === 0) {
                    setMessage('Vous n\'avez aucun message privé.');
                } else {
                    setMessage('');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement de vos messages privés.';
                setMessage(errorMessage);
                console.error('Erreur chargement messages privés :', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPrivateMessages();
    }, []); // Exécute une fois au chargement du composant

    if (loading) {
        return <div className="private-message-list-container"><p>Chargement de vos messages privés...</p></div>;
    }

    return (
        <div className="private-message-list-container">
            <h2>Mes Messages Privés</h2>
            {message && <p className="message-info">{message}</p>}

            {privateMessages.length > 0 ? (
                <div className="messages-list">
                    {privateMessages.map(msg => (
                        <div key={msg.id} className={`message-item ${msg.senderId === currentUserId ? 'sent' : 'received'}`}>
                            <div className="message-header">
                                {msg.senderId === currentUserId ? (
                                    <span className="sender-info">À : <strong>{msg.receiverPrenom} {msg.receiverNom}</strong> ({msg.receiverRole})</span>
                                ) : (
                                    <span className="sender-info">De : <strong>{msg.senderPrenom} {msg.senderNom}</strong> ({msg.senderRole})</span>
                                )}
                                <span className="message-date">{new Date(msg.created_at).toLocaleString()}</span>
                            </div>
                            <p className="message-content">{msg.content}</p>
                        </div>
                    ))}
                </div>
            ) : (
                !message && <p className="no-messages-found">Aucun message privé à afficher.</p>
            )}
        </div>
    );
}

export default PrivateMessageList;