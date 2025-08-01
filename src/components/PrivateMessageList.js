import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PrivateMessageList.css';

function PrivateMessageList() {
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState({ loading: true, message: '' });
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            setCurrentUser(user);

            if (!token || !user) {
                setStatus({ loading: false, message: 'Connectez-vous pour voir vos messages' });
                return;
            }

            try {
                const response = await axios.get('/api/messages/private/me', {
                    headers: { 'x-auth-token': token }
                });
                
                setMessages(response.data);
                setStatus({
                    loading: false,
                    message: response.data.length === 0 ? 'Aucun message privé' : ''
                });
            } catch (error) {
                setStatus({
                    loading: false,
                    message: error.response?.data?.message || 'Erreur de chargement'
                });
                console.error('Erreur:', error);
            }
        };

        fetchMessages();
    }, []);

    if (status.loading) {
        return (
            <div className="messages-loading">
                <div className="loading-spinner"></div>
                <span>Chargement des messages...</span>
            </div>
        );
    }

    return (
        <div className="messages-container">
            <div className="messages-header">
                <h2>Messages Privés</h2>
                <div className="header-divider"></div>
            </div>

            {status.message && (
                <div className={`status-message ${status.message.includes('Erreur') ? 'error' : 'info'}`}>
                    {status.message}
                </div>
            )}

            {messages.length > 0 ? (
                <div className="messages-list">
                    {messages.map(msg => (
                        <div key={msg.id} className={`message ${msg.senderId === currentUser?.id ? 'sent' : 'received'}`}>
                            <div className="message-header">
                                <div className="sender-info">
                                    {msg.senderId === currentUser?.id ? (
                                        <>
                                            <span className="label">À :</span>
                                            <span className="name">{msg.receiverPrenom} {msg.receiverNom}</span>
                                            <span className="role">{msg.receiverRole}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="label">De :</span>
                                            <span className="name">{msg.senderPrenom} {msg.senderNom}</span>
                                            <span className="role">{msg.senderRole}</span>
                                        </>
                                    )}
                                </div>
                                <div className="message-date">
                                    {new Date(msg.created_at).toLocaleString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            <div className="message-content">
                                <p>{msg.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                !status.message && (
                    <div className="empty-state">
                        <p>Vous n'avez aucun message</p>
                    </div>
                )
            )}
        </div>
    );
}

export default PrivateMessageList;