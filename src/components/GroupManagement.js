import axios from "axios";
import { useEffect, useState } from "react";
import "./GroupManagement.css";

function GroupManagement() {
  const [state, setState] = useState({
    groups: [],
    users: [],
    loading: true,
    error: null,
    newGroupName: "",
    selectedGroupId: "",
    selectedUserId: "",
    isCoordinator: false,
  });

  const [messages, setMessages] = useState({
    groupCreation: "",
    memberAddition: "",
  });

  const token = localStorage.getItem("token");

  // Fonctions de récupération des données
  const fetchData = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const [usersRes, groupsRes] = await Promise.all([
        axios.get("/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/groups", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setState((prev) => ({
        ...prev,
        users: usersRes.data.users,
        groups: groupsRes.data.groups,
        error: null,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "Erreur lors du chargement des données",
      }));
      console.error(err);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // Gestion des formulaires
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!state.newGroupName.trim()) {
      setMessages({
        ...messages,
        groupCreation: "Le nom du groupe est requis",
      });
      return;
    }

    try {
      await axios.post(
        "/api/groups",
        { nomGroupe: state.newGroupName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages({
        ...messages,
        groupCreation: "✅ Groupe créé avec succès",
      });

      setState((prev) => ({
        ...prev,
        newGroupName: "",
      }));

      fetchData();
    } catch (err) {
      setMessages({
        ...messages,
        groupCreation: "❌ Erreur lors de la création",
      });
      console.error(err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!state.selectedGroupId || !state.selectedUserId) {
      setMessages({ ...messages, memberAddition: "Sélection incomplète" });
      return;
    }

    try {
      await axios.post(
        `/api/groups/${state.selectedGroupId}/members`,
        {
          userId: state.selectedUserId,
          isGroupCoordinator: state.isCoordinator,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages({
        ...messages,
        memberAddition: "✅ Membre ajouté avec succès",
      });

      setState((prev) => ({
        ...prev,
        selectedGroupId: "",
        selectedUserId: "",
        isCoordinator: false,
      }));
    } catch (err) {
      setMessages({
        ...messages,
        memberAddition: "❌ Erreur lors de l'ajout",
      });
      console.error(err);
    }
  };

  if (state.loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{state.error}</p>
        <button onClick={fetchData} className="retry-button">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="group-management-container">
      <header className="management-header">
        <h1>Gestion des Groupes</h1>
        <p>Créez et organisez vos groupes pédagogiques</p>
      </header>

      <div className="management-sections">
        {/* Section création de groupe */}
        <section className="creation-section">
          <div className="section-header">
            <h2>Nouveau Groupe</h2>
            <div className="section-divider"></div>
          </div>

          <form onSubmit={handleCreateGroup} className="group-form">
            <div className="form-group">
              <label>Nom du groupe</label>
              <input
                type="text"
                name="newGroupName"
                value={state.newGroupName}
                onChange={handleInputChange}
                placeholder="Ex: Promotion 2023"
                required
              />
            </div>

            <button type="submit" className="submit-button create">
              Créer le groupe
            </button>

            {messages.groupCreation && (
              <div
                className={`form-message ${
                  messages.groupCreation.includes("✅") ? "success" : "error"
                }`}
              >
                {messages.groupCreation}
              </div>
            )}
          </form>
        </section>

        {/* Section ajout de membre */}
        <section className="addition-section">
          <div className="section-header">
            <h2>Ajouter un Membre</h2>
            <div className="section-divider"></div>
          </div>

          <form onSubmit={handleAddMember} className="group-form">
            <div className="form-group">
              <label>Groupe cible</label>
              <select
                name="selectedGroupId"
                value={state.selectedGroupId}
                onChange={handleInputChange}
                required
              >
                <option value="">Sélectionnez un groupe</option>
                {state.groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Utilisateur</label>
              <select
                name="selectedUserId"
                value={state.selectedUserId}
                onChange={handleInputChange}
                required
              >
                <option value="">Sélectionnez un utilisateur</option>
                {state.users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.prenom} {user.nom} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isCoordinator"
                name="isCoordinator"
                checked={state.isCoordinator}
                onChange={handleInputChange}
              />
              <label htmlFor="isCoordinator">Responsable de classe</label>
            </div>

            <button type="submit" className="submit-button add">
              Ajouter le membre
            </button>

            {messages.memberAddition && (
              <div
                className={`form-message ${
                  messages.memberAddition.includes("✅") ? "success" : "error"
                }`}
              >
                {messages.memberAddition}
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}

export default GroupManagement;
