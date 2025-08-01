// src/components/UserManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');
    const [editUserId, setEditUserId] = useState(null); // ID de l'utilisateur en cours d'édition
    const [newRole, setNewRole] = useState(''); // Nouveau rôle sélectionné

    // Rôles disponibles (ajustez si vous en avez d'autres)
    const roles = ['Etudiant', 'Professeur', 'Coordinateur'];

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            setUserRole(user ? user.role : '');

            if (!token || !user || user.role !== 'Coordinateur') {
                setMessage('Accès refusé. Seul un Coordinateur peut gérer les utilisateurs.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    '/api/users/all', // Cette route doit être restreinte au coordinateur sur le backend
                    { headers: { 'x-auth-token': token } }
                );
                setUsers(response.data);
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des utilisateurs.';
                setMessage(errorMessage);
                console.error('Erreur chargement utilisateurs :', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId) => {
        setMessage('');
        const token = localStorage.getItem('token');

        if (!newRole) {
            setMessage('Veuillez sélectionner un nouveau rôle.');
            return;
        }

        // Empêcher un coordinateur de se rétrograder lui-même
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (userId === currentUser.id && newRole !== 'Coordinateur') {
            setMessage('Vous ne pouvez pas vous rétrograder vous-même en tant que Coordinateur.');
            return;
        }

        try {
            // Cette route nécessite une API pour la modification de rôle (nous l'ajouterons si elle n'existe pas)
            const response = await axios.put(
                `/api/users/${userId}/role`, // Nouvelle route à créer/modifier pour le backend
                { role: newRole },
                { headers: { 'x-auth-token': token } }
            );
            setMessage(response.data.message);
            setEditUserId(null); // Masquer le formulaire d'édition
            setNewRole(''); // Réinitialiser le rôle sélectionné

            // Rafraîchir la liste des utilisateurs
            const updatedUsersResponse = await axios.get('/api/users/all', { headers: { 'x-auth-token': token } });
            setUsers(updatedUsersResponse.data);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la modification du rôle.';
            setMessage(errorMessage);
            console.error('Erreur modification rôle :', error.response?.data || error.message);
        }
    };

    const handleDeleteUser = async (userId, userNom, userPrenom) => {
        setMessage('');
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('user'));

        // Empêcher un coordinateur de se supprimer lui-même
        if (userId === currentUser.id) {
            setMessage('Vous ne pouvez pas supprimer votre propre compte.');
            return;
        }

        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userPrenom} ${userNom} ? Cette action est irréversible.`)) {
            try {
                // Cette route nécessite une API pour la suppression d'utilisateur (nous l'ajouterons si elle n'existe pas)
                const response = await axios.delete(
                    `/api/users/${userId}`, // Nouvelle route à créer/modifier pour le backend
                    { headers: { 'x-auth-token': token } }
                );
                setMessage(response.data.message);
                // Mettre à jour la liste des utilisateurs en filtrant l'utilisateur supprimé
                setUsers(users.filter(user => user.id !== userId));
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur.';
                setMessage(errorMessage);
                console.error('Erreur suppression utilisateur :', error.response?.data || error.message);
            }
        }
    };

    if (loading) {
        return <div className="user-management-container"><p>Chargement des utilisateurs...</p></div>;
    }

    if (userRole !== 'Coordinateur') {
        return <div className="user-management-container"><p className="message-info error">{message || 'Accès refusé. Vous n\'êtes pas autorisé à gérer les utilisateurs.'}</p></div>;
    }

    return (
        <div className="user-management-container">
            <h2>Gestion des Utilisateurs</h2>
            {message && <p className="message-info">{message}</p>}

            {users.length > 0 ? (
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Prénom</th>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.prenom}</td>
                                <td>{user.nom}</td>
                                <td>{user.email}</td>
                                <td>
                                    {editUserId === user.id ? (
                                        <select
                                            value={newRole || user.role} // Pré-sélectionne le rôle actuel
                                            onChange={(e) => setNewRole(e.target.value)}
                                        >
                                            {roles.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        user.role
                                    )}
                                </td>
                                <td>
                                    {editUserId === user.id ? (
                                        <>
                                            <button onClick={() => handleRoleChange(user.id)} className="save-button">
                                                Enregistrer
                                            </button>
                                            <button onClick={() => setEditUserId(null)} className="cancel-button">
                                                Annuler
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => { setEditUserId(user.id); setNewRole(user.role); }} className="edit-button">
                                            Modifier Rôle
                                        </button>
                                    )}
                                    {user.role !== 'Coordinateur' && ( // Empêcher la suppression directe d'un coordinateur (sauf si on est seul coordinateur)
                                        <button onClick={() => handleDeleteUser(user.id, user.nom, user.prenom)} className="delete-button">
                                            Supprimer
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="no-users-found">Aucun utilisateur enregistré.</p>
            )}
        </div>
    );
}

export default UserManagement;