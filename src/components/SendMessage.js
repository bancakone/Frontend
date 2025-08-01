// src/components/SendMessage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SendMessage.css';

function SendMessage() {
    const [messageType, setMessageType] = useState('private'); // 'private' ou 'public'
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedReceiverId, setSelectedReceiverId] = useState('');
    const [content, setContent] = useState('');
    const [userClasses, setUserClasses] = useState([]); // Classes où l'utilisateur est professeur/coordinateur
    const [allUsers, setAllUsers] = useState([]); // Tous les utilisateurs pour les messages privés
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        setUserRole(user ? user.role : '');
        setCurrentUserId(user ? user.id : null);

        if (!token || !user) {
            setMessage('Vous devez être connecté pour envoyer un message.');
            return;
        }

        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Fetch classes for public messages (only if Professor or Coordinator)
                if (user.role === 'Professeur' || user.role === 'Coordinateur') {
                    const classesResponse = await axios.get(
                        '/api/classes/professeur', // Cette route liste les classes où l'utilisateur est professeur. Si coordinateur peut envoyer à toutes les classes, il faudrait une autre route. Pour l'instant, on se base sur les classes "possédées".
                        { headers: { 'x-auth-token': token } }
                    );
                    setUserClasses(classesResponse.data);
                    if (classesResponse.data.length > 0) {
                        setSelectedClassId(classesResponse.data[0].id);
                    }
                }

                // Fetch all users for private messages
                const usersResponse = await axios.get(
                    '/api/users/all', // Nous aurons besoin de créer cette route API si elle n'existe pas
                    { headers: { 'x-auth-token': token } }
                );
                // Filtrer l'utilisateur courant de la liste des destinataires possibles
                setAllUsers(usersResponse.data.filter(u => u.id !== user.id));
                if (usersResponse.data.length > 1) { // Au moins un autre utilisateur
                    setSelectedReceiverId(usersResponse.data.filter(u => u.id !== user.id)[0].id);
                }

            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des données initiales.';
                setMessage(errorMessage);
                console.error('Erreur chargement données initiales (SendMessage) :', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('token');

        if (!content.trim()) {
            setMessage('Le message ne peut pas être vide.');
            return;
        }

        let payload = { content, message_type: messageType };

        if (messageType === 'private') {
            if (!selectedReceiverId) {
                setMessage('Veuillez sélectionner un destinataire.');
                return;
            }
            payload.receiver_id = selectedReceiverId;
        } else { // public
            if (!selectedClassId) {
                setMessage('Veuillez sélectionner une classe.');
                return;
            }
            payload.class_id = selectedClassId;
        }

        try {
            const response = await axios.post(
                '/api/messages',
                payload,
                { headers: { 'x-auth-token': token } }
            );
            setMessage(response.data.message);
            setContent('');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de l\'envoi du message.';
            setMessage(errorMessage);
            console.error('Erreur envoi message :', error.response?.data || error.message);
        }
    };

    const canSendPublicMessage = userRole === 'Professeur' || userRole === 'Coordinateur';

    if (loading) {
        return <div className="send-message-container"><p>Chargement des données...</p></div>;
    }

    return (
        <div className="send-message-container">
            <h2>Envoyer un Message</h2>
            {message && <p className="message-info">{message}</p>}

            <form onSubmit={handleSubmit} className="send-message-form">
                <div className="form-group message-type-selection">
                    <label>Type de message :</label>
                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                value="private"
                                checked={messageType === 'private'}
                                onChange={() => setMessageType('private')}
                            /> Privé
                        </label>
                        {canSendPublicMessage && (
                            <label>
                                <input
                                    type="radio"
                                    value="public"
                                    checked={messageType === 'public'}
                                    onChange={() => setMessageType('public')}
                                /> Public (à une classe)
                            </label>
                        )}
                    </div>
                </div>

                {messageType === 'private' && (
                    <div className="form-group">
                        <label htmlFor="receiverSelect">Destinataire :</label>
                        <select
                            id="receiverSelect"
                            value={selectedReceiverId}
                            onChange={(e) => setSelectedReceiverId(e.target.value)}
                            className="form-select"
                            required
                        >
                            <option value="">-- Sélectionner un utilisateur --</option>
                            {allUsers.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.prenom} {user.nom} ({user.role})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {messageType === 'public' && canSendPublicMessage && (
                    <div className="form-group">
                        <label htmlFor="classSelect">Classe :</label>
                        <select
                            id="classSelect"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="form-select"
                            required
                        >
                            <option value="">-- Sélectionner une classe --</option>
                            {userClasses.map(cla => (
                                <option key={cla.id} value={cla.id}>{cla.nom}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="messageContent">Contenu du message :</label>
                    <textarea
                        id="messageContent"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="form-textarea"
                        rows="5"
                        required
                    ></textarea>
                </div>

                <button type="submit" className="send-message-button">
                    Envoyer le Message
                </button>
            </form>
        </div>
    );
}

export default SendMessage;