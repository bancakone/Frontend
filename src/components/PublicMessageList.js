import axios from "axios";
import { useEffect, useState } from "react";
import "./PublicMessageList.css";

function PublicMessageList() {
  const [userClasses, setUserClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [publicMessages, setPublicMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserClasses = async () => {
      const token = localStorage.getItem("token");
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      setUser(loggedInUser);

      if (!token || !loggedInUser) {
        setMessage("Vous devez être connecté pour voir les messages publics.");
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get("/api/classes/me", {
          headers: { "x-auth-token": token },
        });
        setUserClasses(response.data);
        if (response.data.length > 0) {
          setSelectedClassId(response.data[0].id);
        } else {
          setMessage("Vous n'êtes membre d'aucune classe pour le moment.");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Erreur lors du chargement de vos classes.";
        setMessage(errorMessage);
        console.error(
          "Erreur chargement classes utilisateur :",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUserClasses();
  }, []);

  useEffect(() => {
    const fetchPublicMessages = async () => {
      if (!selectedClassId) return;

      setLoading(true);
      setMessage("");
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `/api/messages/public/class/${selectedClassId}`,
          { headers: { "x-auth-token": token } }
        );
        setPublicMessages(response.data);
        if (response.data.length === 0) {
          setMessage("Aucun message public pour cette classe.");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Erreur lors du chargement des messages publics.";
        setMessage(errorMessage);
        setPublicMessages([]);
        console.error(
          "Erreur chargement messages publics :",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPublicMessages();
  }, [selectedClassId]);

  if (!user) {
    return (
      <div className="public-message-list-container">
        <div className="auth-required-message">
          🔒 Connectez-vous pour accéder aux messages publics
        </div>
      </div>
    );
  }

  return (
    <div className="public-message-list-container">
      <div className="public-messages-header">
        <h2>Messages Publics</h2>
        <p className="subtitle">Discussions partagées avec votre classe</p>
      </div>

      {message && (
        <div
          className={`message-banner ${
            message.includes("Erreur") ? "error" : "info"
          }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Chargement en cours...</p>
        </div>
      ) : (
        userClasses.length > 0 && (
          <div className="class-selector-container">
            <label htmlFor="classSelectMessages" className="selector-label">
              Sélectionnez une classe
            </label>
            <select
              id="classSelectMessages"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="class-selector"
            >
              {userClasses.map((cla) => (
                <option key={cla.id} value={cla.id}>
                  {cla.nom}
                </option>
              ))}
            </select>
          </div>
        )
      )}

      <div className="messages-container">
        {publicMessages.length > 0
          ? publicMessages.map((msg) => (
              <div key={msg.id} className="message-card">
                <div className="message-header">
                  <div className="sender-info">
                    <span className="sender-avatar">
                      {msg.senderPrenom.charAt(0)}
                      {msg.senderNom.charAt(0)}
                    </span>
                    <div>
                      <h3 className="sender-name">
                        {msg.senderPrenom} {msg.senderNom}
                      </h3>
                      <span className="sender-role">{msg.senderRole}</span>
                    </div>
                  </div>
                  <span className="message-date">
                    {new Date(msg.created_at).toLocaleString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))
          : selectedClassId &&
            !message &&
            !loading && (
              <div className="empty-state">
                <img
                  src="/images/empty-messages.svg"
                  alt="Aucun message"
                  width="120"
                />
                <p>Aucun message public dans cette classe</p>
              </div>
            )}
      </div>
    </div>
  );
}

export default PublicMessageList;
