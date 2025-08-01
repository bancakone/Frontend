import React, { useState } from 'react';

const Register = ({ onLoginSuccess, onAuthSwitch }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate a registration API call
        if (name && email && password) {
            const userData = { name, email, role: 'Étudiant' }; // Default role for new users
            onLoginSuccess(userData);
        } else {
            setError('Veuillez remplir tous les champs.');
        }
    };

    return (
        <div className="register-container">
            <h2>Inscription</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Nom:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Mot de passe:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">S'inscrire</button>
            </form>
            <p>
                Déjà inscrit? <button onClick={() => onAuthSwitch('Connexion')}>Connexion</button>
            </p>
        </div>
    );
};

export default Register;