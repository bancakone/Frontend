import axios from "axios";
import { useEffect, useState } from "react";
import "./SendMessage.css";

function SendMessage() {
  const [messageType, setMessageType] = useState("private");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedReceiverId, setSelectedReceiverId] = useState("");
  const [content, setContent] = useState("");
  const [userClasses, setUserClasses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [status, setStatus] = useState({ loading: false, message: "" });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);

    if (!token || !user) {
      setStatus({
        loading: false,
        message: "Connectez-vous pour envoyer des messages",
      });
      return;
    }

    const fetchInitialData = async () => {
      setStatus({ ...status, loading: true });
      try {
        // Fetch classes if professor/coordinator
        if (["Professeur", "Coordinateur"].includes(user.role)) {
          const classesResponse = await axios.get("/api/classes/professeur", {
            headers: { "x-auth-token": token },
          });
          setUserClasses(classesResponse.data);
          if (classesResponse.data.length > 0) {
            setSelectedClassId(classesResponse.data[0].id);
          }
        }

        // Fetch all users
        const usersResponse = await axios.get("/api/users/all", {
          headers: { "x-auth-token": token },
        });
        const filteredUsers = usersResponse.data.filter(
          (u) => u.id !== user.id
        );
        setAllUsers(filteredUsers);
        if (filteredUsers.length > 0) {
          setSelectedReceiverId(filteredUsers[0].id);
        }
      } catch (error) {
        setStatus({
          loading: false,
          message:
            error.response?.data?.message || "Erreur de chargement des données",
        });
        console.error("Erreur:", error);
      } finally {
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchInitialData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setStatus({ ...status, message: "Le message ne peut pas être vide" });
      return;
    }

    setStatus({ ...status, loading: true });
    const token = localStorage.getItem("token");

    try {
      const payload = {
        content,
        message_type: messageType,
        ...(messageType === "private"
          ? { receiver_id: selectedReceiverId }
          : { class_id: selectedClassId }),
      };

      await axios.post("/api/messages", payload, {
        headers: { "x-auth-token": token },
      });

      setContent("");
      setStatus({
        loading: false,
        message: "Message envoyé avec succès !",
      });
    } catch (error) {
      setStatus({
        loading: false,
        message: error.response?.data?.message || "Erreur lors de l'envoi",
      });
      console.error("Erreur:", error);
    }
  };

  const canSendPublicMessage = ["Professeur", "Coordinateur"].includes(
    currentUser?.role
  );

  if (status.loading) {
    return (
      <div className="message-loading">
        <div className="loading-spinner"></div>
        <span>Chargement...</span>
      </div>
    );
  }

  return (
    <div className="message-composer">
      <div className="composer-header">
        <h2>Nouveau Message</h2>
        <div className="header-divider"></div>
      </div>

      {status.message && (
        <div
          className={`status-message ${
            status.message.includes("Erreur") ? "error" : "success"
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-form">
        <div className="form-section">
          <label className="section-label">Type de message</label>
          <div className="type-selector">
            <button
              type="button"
              className={`type-option ${
                messageType === "private" ? "active" : ""
              }`}
              onClick={() => setMessageType("private")}
            >
              <span className="option-icon">🔒</span>
              <span className="option-label">Privé</span>
            </button>

            {canSendPublicMessage && (
              <button
                type="button"
                className={`type-option ${
                  messageType === "public" ? "active" : ""
                }`}
                onClick={() => setMessageType("public")}
              >
                <span className="option-icon">📢</span>
                <span className="option-label">Public</span>
              </button>
            )}
          </div>
        </div>

        <div className="form-section">
          {messageType === "private" ? (
            <>
              <label htmlFor="receiverSelect" className="section-label">
                Destinataire
              </label>
              <select
                id="receiverSelect"
                value={selectedReceiverId}
                onChange={(e) => setSelectedReceiverId(e.target.value)}
                className="form-select"
                required
              >
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.prenom} {user.nom} ({user.role})
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label htmlFor="classSelect" className="section-label">
                Classe
              </label>
              <select
                id="classSelect"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="form-select"
                required
              >
                {userClasses.map((cla) => (
                  <option key={cla.id} value={cla.id}>
                    {cla.nom}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="form-section">
          <label htmlFor="messageContent" className="section-label">
            Votre message
          </label>
          <textarea
            id="messageContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="message-textarea"
            rows="6"
            placeholder="Écrivez votre message ici..."
            required
          />
        </div>

        <button type="submit" className="send-button">
          Envoyer
        </button>
      </form>
    </div>
  );
}

export default SendMessage;
