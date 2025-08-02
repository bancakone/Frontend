import axios from "axios";
import { useEffect, useState } from "react";
import "./AssignTask.css";

function AssignTask() {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [dateLimite, setDateLimite] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [professorClasses, setProfessorClasses] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfessorClasses = async () => {
      const token = localStorage.getItem("token");
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      setUser(loggedInUser);

      if (!token || !loggedInUser || loggedInUser.role !== "professeur") {
        setMessage(
          "Vous devez être connecté en tant que professeur pour assigner des tâches."
        );
        setProfessorClasses([]);
        return;
      }

      try {
        const response = await axios.get("/api/classes/professeur", {
          headers: { "x-auth-token": token },
        });
        setProfessorClasses(response.data);
        if (response.data.length > 0) {
          setSelectedClass(response.data[0].id);
        } else {
          setMessage(
            "Vous n'avez pas encore créé de classes pour assigner des tâches."
          );
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Erreur lors du chargement de vos classes.";
        setMessage(errorMessage);
        console.error(
          "Erreur chargement classes professeur:",
          error.response?.data || error.message
        );
      }
    };

    fetchProfessorClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!user || user.role !== "professeur") {
      setMessage(
        "Accès non autorisé. Seuls les professeurs peuvent assigner des tâches."
      );
      setLoading(false);
      return;
    }

    if (!selectedClass) {
      setMessage("Veuillez sélectionner une classe.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/tasks",
        {
          class_id: selectedClass,
          titre,
          description,
          date_limite: dateLimite,
        },
        { headers: { "x-auth-token": token } }
      );

      setMessage(response.data.message);
      setTitre("");
      setDescription("");
      setDateLimite("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de l'assignation de la tâche.";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (user && user.role !== "professeur") {
    return (
      <div className="assign-task-container">
        <p className="message-info error">
          Vous n'avez pas l'autorisation d'assigner des tâches.
        </p>
      </div>
    );
  }

  return (
    <div className="assign-task-container">
      <h2>Assigner une Tâche</h2>

      {message && (
        <p
          className={`message-info ${
            message.includes("non autorisé") ? "error" : ""
          }`}
        >
          {message}
        </p>
      )}

      {professorClasses.length > 0 ? (
        <form onSubmit={handleSubmit} className="assign-task-form">
          <div className="form-group">
            <label htmlFor="selectClassTask">Sélectionnez la classe :</label>
            <select
              id="selectClassTask"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-select"
              required
              disabled={loading}
            >
              {professorClasses.map((cla) => (
                <option key={cla.id} value={cla.id}>
                  {cla.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="titreTask">Titre de la tâche :</label>
            <input
              type="text"
              id="titreTask"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="descriptionTask">Description (optionnel) :</label>
            <textarea
              id="descriptionTask"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows="5"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateLimite">Date Limite :</label>
            <input
              type="datetime-local"
              id="dateLimite"
              value={dateLimite}
              onChange={(e) => setDateLimite(e.target.value)}
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="assign-task-button"
            disabled={loading}
          >
            {loading ? "Envoi en cours..." : "Assigner la Tâche"}
          </button>
        </form>
      ) : (
        user?.role === "professeur" &&
        !message.includes("Vous n'avez pas encore créé") && (
          <p className="loading-text">Chargement de vos classes...</p>
        )
      )}
    </div>
  );
}

export default AssignTask;
