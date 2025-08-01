// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

function Register() {
  // Définition des états du composant avec des noms de variables harmonisés
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState(''); 
  const [role, setRole] = useState('Etudiant'); 
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Fonction de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    try {
      // Construction de l'objet de données à envoyer au backend
      // Les clés ici doivent correspondre EXACTEMENT aux noms des variables attendues par le backend
      const dataToSend = {
        nom,
        prenom,
        email,
        motDePasse, // Utilisation de la clé 'motDePasse'
        role,
      };

      // La requête est faite vers /api/auth/register
      const response = await axios.post('/api/auth/register', dataToSend);

      // Traitement du succès de l'inscription
      setMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      setIsSuccess(true);
      console.log('Inscription réussie :', response.data);

      // Réinitialiser les champs du formulaire
      setNom('');
      setPrenom('');
      setEmail('');
      setMotDePasse('');
      setRole('Etudiant');

    } catch (error) {
      // Traitement des erreurs
      setMessage(error.response?.data?.message || 'Erreur lors de l\'inscription.');
      setIsSuccess(false);
      console.error('Erreur inscription :', error.response?.data || error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Inscription</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Nom :</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Prénom :</label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Email :</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Mot de passe :</label>
          <input
            type="password"
            value={motDePasse} 
            onChange={(e) => setMotDePasse(e.target.value)} 
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Rôle :</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="Etudiant">Étudiant</option>
            <option value="Professeur">Professeur</option>
            <option value="Coordinateur">Coordinateur</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          S'inscrire
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Register;
