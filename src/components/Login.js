// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Importe le fichier CSS pour les styles

function Login({ onLoginSuccess, onAuthSwitch }) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        motDePasse,
      });
      setMessage(response.data.message);
      localStorage.setItem('token', response.data.token);
      // Note : Il est préférable de gérer l'état utilisateur via App.js
      // plutôt que via localStorage pour les besoins d'affichage.
      
      console.log('Connexion réussie :', response.data);

      // --- CHANGEMENT CRUCIAL ICI ---
      // L'API doit retourner un objet 'user' dans la réponse.
      // Nous passons cet objet à la fonction onLoginSuccess.
      if (onLoginSuccess && response.data.user) {
        onLoginSuccess(response.data.user); // Passe les données utilisateur à App.js
      }
      // --- FIN DU CHANGEMENT CRUCIAL ---
      
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erreur lors de la connexion.');
      console.error('Erreur connexion :', error.response?.data || error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Email :</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Mot de passe :</label>
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="login-button">
          Se connecter
        </button>
      </form>
      {message && <p className="message-info">{message}</p>}
      {/* Ajout du bouton de bascule vers l'inscription */}
      <p className="switch-auth">
        Pas encore de compte ?{' '}
        <button type="button" onClick={() => onAuthSwitch('Inscription')} className="link-button">
          S'inscrire
        </button>
      </p>
    </div>
  );
}

export default Login;
