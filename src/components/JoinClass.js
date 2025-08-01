import React, { useState } from 'react';
import axios from 'axios';
import './JoinClass.css';

function JoinClass({ onClassJoined }) {
    const [classCode, setClassCode] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user) {
            setMessage('Vous devez être connecté pour rejoindre une classe.');
            setIsLoading(false);
            return;
        }

        if (user.role !== 'Etudiant') {
            setMessage('Seuls les étudiants peuvent rejoindre une classe par code.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                '/api/classes/join',
                { code: classCode },
                { headers: { 'x-auth-token': token } }
            );
            
            setMessage(response.data.message);
            setClassCode('');
            
            if (onClassJoined) onClassJoined();

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription à la classe.';
            setMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="join-class-card">
            <div className="card-header">
                <h2>Rejoindre une Classe</h2>
                <div className="decorative-line"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="join-class-form">
                <div className="input-group">
                    <label htmlFor="classCode">Code d'accès</label>
                    <input
                        type="text"
                        id="classCode"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                        placeholder="Ex: ABC123"
                        className="modern-input"
                        required
                        maxLength="6"
                    />
                    <span className="input-hint">6 caractères maximum</span>
                </div>
                
                <button 
                    type="submit" 
                    className="primary-button"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="button-loader"></span>
                    ) : 'Rejoindre la classe'}
                </button>
            </form>
            
            {message && (
                <div className={`message-bubble ${message.includes('Erreur') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default JoinClass;