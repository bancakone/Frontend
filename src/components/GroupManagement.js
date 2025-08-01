import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GroupManagement() {
  // États pour gérer les données et l'interface utilisateur
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour la création d'un nouveau groupe
  const [newGroupName, setNewGroupName] = useState('');
  const [groupCreationMessage, setGroupCreationMessage] = useState('');

  // États pour l'ajout d'un membre à un groupe
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [memberAdditionMessage, setMemberAdditionMessage] = useState('');

  // Assurez-vous que votre token JWT est stocké ici, par exemple dans localStorage
  const token = localStorage.getItem('token');

  // Fonction pour récupérer la liste de tous les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Supposons une route API '/api/users' qui renvoie tous les utilisateurs
      const response = await axios.get('/api/auth/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des utilisateurs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer la liste de tous les groupes
  const fetchGroups = async () => {
    try {
      setLoading(true);
      // Supposons une route API '/api/groups'
      const response = await axios.get('/api/groups', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setGroups(response.data.groups);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des groupes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Utilisation de useEffect pour charger les données au montage du composant
  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchGroups();
    }
  }, [token]);

  // Gestion de la création d'un groupe
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setGroupCreationMessage('');
    if (!newGroupName.trim()) {
      setGroupCreationMessage('Le nom du groupe ne peut pas être vide.');
      return;
    }

    try {
      await axios.post('/api/groups', { nomGroupe: newGroupName }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setGroupCreationMessage('Groupe créé avec succès !');
      setNewGroupName('');
      fetchGroups(); // Recharger la liste des groupes
    } catch (err) {
      setGroupCreationMessage('Erreur lors de la création du groupe.');
      console.error(err);
    }
  };

  // Gestion de l'ajout d'un membre à un groupe
  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberAdditionMessage('');
    if (!selectedGroupId || !selectedUserId) {
      setMemberAdditionMessage('Veuillez sélectionner un groupe et un utilisateur.');
      return;
    }

    try {
      await axios.post(`/api/groups/${selectedGroupId}/members`, {
        userId: selectedUserId,
        isGroupCoordinator: isCoordinator
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMemberAdditionMessage('Membre ajouté avec succès au groupe !');
      // Réinitialiser les champs du formulaire après l'ajout
      setSelectedGroupId('');
      setSelectedUserId('');
      setIsCoordinator(false);
    } catch (err) {
      setMemberAdditionMessage('Erreur lors de l\'ajout du membre.');
      console.error(err);
    }
  };

  // Affichage d'un message de chargement
  if (loading) {
    return <div className="text-center mt-10">Chargement...</div>;
  }

  // Affichage d'un message d'erreur général
  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Gestion des groupes</h1>

      {/* Section pour la création d'un nouveau groupe */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Créer un nouveau groupe</h2>
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label htmlFor="newGroupName" className="block text-gray-700 text-sm font-bold mb-2">Nom du groupe :</label>
            <input
              type="text"
              id="newGroupName"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Créer le groupe
          </button>
        </form>
        {groupCreationMessage && (
          <p className="mt-4 text-center text-sm font-medium text-green-600">{groupCreationMessage}</p>
        )}
      </div>

      {/* Section pour l'ajout de membres à un groupe existant */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Ajouter un membre à un groupe</h2>
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label htmlFor="selectGroup" className="block text-gray-700 text-sm font-bold mb-2">Sélectionner un groupe :</label>
            <select
              id="selectGroup"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">-- Choisir un groupe --</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="selectUser" className="block text-gray-700 text-sm font-bold mb-2">Sélectionner un utilisateur :</label>
            <select
              id="selectUser"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">-- Choisir un utilisateur --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.nom} {user.prenom} ({user.role})</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isCoordinator"
              checked={isCoordinator}
              onChange={(e) => setIsCoordinator(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="isCoordinator" className="ml-2 block text-gray-700 text-sm font-bold">
              Désigner comme responsable de classe
            </label>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Ajouter au groupe
          </button>
        </form>
        {memberAdditionMessage && (
          <p className="mt-4 text-center text-sm font-medium text-blue-600">{memberAdditionMessage}</p>
        )}
      </div>
    </div>
  );
}

export default GroupManagement;
