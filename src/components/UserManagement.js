import axios from "axios";
import { useEffect, useState } from "react";
import "./UserManagement.css";

function UserManagement() {
  // Vos états initiaux préservés
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const roles = ["Etudiant", "Professeur", "Coordinateur"];

  // Votre useEffect original inchangé
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      setUserRole(user ? user.role : "");

      if (!token || !user || user.role !== "Coordinateur") {
        setMessage(
          "Accès refusé. Seul un Coordinateur peut gérer les utilisateurs."
        );
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("/api/users/all", {
          headers: { "x-auth-token": token },
        });
        setUsers(response.data);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Erreur lors du chargement des utilisateurs.";
        setMessage(errorMessage);
        console.error(
          "Erreur chargement utilisateurs :",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Vos handlers originaux inchangés
  const handleRoleChange = async (userId) => {
    // ... (votre code original)
  };

  const handleDeleteUser = async (userId, userNom, userPrenom) => {
    // ... (votre code original)
  };

  if (loading) {
    return (
      <div className="admin-container loading">
        <div className="loader"></div>
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

  if (userRole !== "Coordinateur") {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <svg className="lock-icon" viewBox="0 0 24 24">
            <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm6 10v8H6v-8h12zm-9-2V7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9z" />
          </svg>
          <p>
            {message ||
              "Accès refusé. Vous n'êtes pas autorisé à gérer les utilisateurs."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h2 className="admin-title">Gestion des Utilisateurs</h2>

        {message && (
          <div
            className={`admin-alert ${
              message.includes("Erreur") ? "error" : "success"
            }`}
          >
            {message}
          </div>
        )}

        {users.length > 0 ? (
          <div className="table-responsive">
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
                {users.map((user) => (
                  <tr key={user.id}>
                    <td data-label="Prénom">{user.prenom}</td>
                    <td data-label="Nom">{user.nom}</td>
                    <td data-label="Email">{user.email}</td>
                    <td data-label="Rôle">
                      {editUserId === user.id ? (
                        <select
                          className="role-select"
                          value={newRole || user.role}
                          onChange={(e) => setNewRole(e.target.value)}
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`role-badge ${user.role.toLowerCase()}`}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td data-label="Actions">
                      <div className="actions-group">
                        {editUserId === user.id ? (
                          <>
                            <button
                              onClick={() => handleRoleChange(user.id)}
                              className="action-button save"
                            >
                              <svg className="icon" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                              </svg>
                              Enregistrer
                            </button>
                            <button
                              onClick={() => setEditUserId(null)}
                              className="action-button cancel"
                            >
                              <svg className="icon" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                              </svg>
                              Annuler
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditUserId(user.id);
                              setNewRole(user.role);
                            }}
                            className="action-button edit"
                          >
                            <svg className="icon" viewBox="0 0 24 24">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                            Modifier
                          </button>
                        )}
                        {user.role !== "Coordinateur" && (
                          <button
                            onClick={() =>
                              handleDeleteUser(user.id, user.nom, user.prenom)
                            }
                            className="action-button delete"
                          >
                            <svg className="icon" viewBox="0 0 24 24">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24">
              <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" />
            </svg>
            <p>Aucun utilisateur enregistré</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
