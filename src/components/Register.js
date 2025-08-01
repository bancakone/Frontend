import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

function Register({ onAuthSwitch }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: 'Etudiant'
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await axios.post('/api/auth/register', formData);
      
      setMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      setIsSuccess(true);
      
      // Réinitialisation du formulaire
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
        role: 'Etudiant'
      });

      // Redirection automatique après 2 secondes
      setTimeout(() => {
        onAuthSwitch('Connexion');
      }, 2000);

    } catch (error) {
      setMessage(error.response?.data?.message || 'Erreur lors de l\'inscription.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Créer un compte</h2>
          <p>Rejoignez notre communauté éducative</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                placeholder="Votre nom"
              />
            </div>

            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                placeholder="Votre prénom"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="exemple@email.com"
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="motDePasse"
              value={formData.motDePasse}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label>Rôle</label>
            <div className="role-selector">
              {['Etudiant', 'Professeur', 'Coordinateur'].map((roleOption) => (
                <label key={roleOption} className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value={roleOption}
                    checked={formData.role === roleOption}
                    onChange={handleChange}
                  />
                  <span>{roleOption}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        {message && (
          <div className={`message ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="auth-switch">
          <p>Déjà un compte ?</p>
          <button 
            type="button" 
            onClick={() => onAuthSwitch('Connexion')}
            className="switch-button"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;