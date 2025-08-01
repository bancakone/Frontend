import React, { useState } from 'react';

const Login = ({ onLoginSuccess, onAuthSwitch }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate a login request
        if (email === 'test@example.com' && password === 'password') {
            const userData = { name: 'Test User', role: 'Professeur' }; // Example user data
            onLoginSuccess(userData);
        } else {
            setError('Identifiants invalides. Veuillez réessayer.');
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Connexion</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <button type="submit" className="login-button">Se connecter</button>
            </form>
            <p className="auth-switch">
                Pas encore de compte? <button onClick={() => onAuthSwitch('Inscription')} className="auth-switch-button">Inscrivez-vous</button>
            </p>
        </div>
    );
};

export default Login;