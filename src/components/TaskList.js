import axios from "axios";
import { useEffect, useState } from "react";
import "./TaskList.css";

function TaskList() {
  const [userClasses, setUserClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");

  // État pour la soumission
  const [submittingTaskId, setSubmittingTaskId] = useState(null);
  const [submissionFilePath, setSubmissionFilePath] = useState("");
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");

  useEffect(() => {
    const fetchUserClasses = async () => {
      setMessage("");
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      setUserRole(user?.role || "");

      if (!token || !user) {
        setMessage("Vous devez être connecté pour voir les tâches.");
        return;
      }

      try {
        const response = await axios.get("/api/classes/me", {
          headers: { "x-auth-token": token },
        });
        setUserClasses(response.data);
        if (response.data.length > 0 && !selectedClassId) {
          setSelectedClassId(response.data[0].id);
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Erreur lors du chargement de vos classes."
        );
        console.error("Erreur:", error);
      }
    };

    fetchUserClasses();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedClassId) return;

      setLoading(true);
      setMessage("");
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `/api/tasks/class/${selectedClassId}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        setTasks(response.data);
        if (response.data.length === 0) {
          setMessage("Aucune tâche assignée pour cette classe.");
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Erreur lors du chargement des tâches."
        );
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [selectedClassId]);

  const handleSubmission = async (e) => {
    e.preventDefault();
    setSubmissionMessage("");
    const token = localStorage.getItem("token");

    if (!submissionFilePath && !submissionContent) {
      setSubmissionMessage(
        "Veuillez fournir un lien ou un contenu pour votre soumission."
      );
      return;
    }

    try {
      const response = await axios.post(
        `/api/tasks/${submittingTaskId}/submit`,
        { file_path: submissionFilePath, content: submissionContent },
        { headers: { "x-auth-token": token } }
      );
      setSubmissionMessage(response.data.message);
      setSubmittingTaskId(null);
      setSubmissionFilePath("");
      setSubmissionContent("");
    } catch (error) {
      setSubmissionMessage(
        error.response?.data?.message || "Erreur lors de la soumission."
      );
      console.error("Erreur:", error);
    }
  };

  return (
    <div className="task-management-container">
      <div className="task-header">
        <h2>Gestion des Tâches</h2>
        <div className="header-divider"></div>
      </div>

      {message && (
        <div
          className={`status-message ${
            message.includes("Erreur") ? "error" : "info"
          }`}
        >
          {message}
        </div>
      )}

      {userClasses.length > 0 && (
        <div className="class-selector">
          <div className="selector-label">
            <span>Classe :</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={loading}
            >
              {userClasses.map((cla) => (
                <option key={cla.id} value={cla.id}>
                  {cla.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Chargement des tâches...</span>
        </div>
      ) : (
        <div className="tasks-container">
          {tasks.length > 0
            ? tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <h3>{task.titre}</h3>
                    <span className="deadline-badge">
                      {new Date(task.date_limite).toLocaleDateString()}
                    </span>
                  </div>

                  {task.description && (
                    <div className="task-description">
                      <p>{task.description}</p>
                    </div>
                  )}

                  <div className="task-meta">
                    <span className="meta-item">
                      <i className="icon-user"></i>
                      {task.professeurNom} {task.professeurPrenom}
                    </span>
                    <span className="meta-item">
                      <i className="icon-calendar"></i>
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {userRole === "Etudiant" && (
                    <div className="task-actions">
                      <button
                        onClick={() => setSubmittingTaskId(task.id)}
                        className="action-button primary"
                      >
                        <i className="icon-upload"></i> Soumettre
                      </button>
                    </div>
                  )}

                  {submittingTaskId === task.id && (
                    <div className="submission-form-container">
                      <form
                        onSubmit={handleSubmission}
                        className="submission-form"
                      >
                        <h4>Soumission pour "{task.titre}"</h4>

                        <div className="form-group">
                          <label>Lien vers votre travail</label>
                          <input
                            type="url"
                            value={submissionFilePath}
                            onChange={(e) =>
                              setSubmissionFilePath(e.target.value)
                            }
                            placeholder="https://github.com/votre-projet"
                          />
                        </div>

                        <div className="form-group">
                          <label>Contenu textuel (optionnel)</label>
                          <textarea
                            value={submissionContent}
                            onChange={(e) =>
                              setSubmissionContent(e.target.value)
                            }
                            rows="3"
                            placeholder="Décrivez votre travail ou incluez votre réponse..."
                          ></textarea>
                        </div>

                        <div className="form-actions">
                          <button type="submit" className="submit-button">
                            Envoyer
                          </button>
                          <button
                            type="button"
                            className="cancel-button"
                            onClick={() => setSubmittingTaskId(null)}
                          >
                            Annuler
                          </button>
                        </div>

                        {submissionMessage && (
                          <div className="submission-message">
                            {submissionMessage}
                          </div>
                        )}
                      </form>
                    </div>
                  )}
                </div>
              ))
            : selectedClassId && (
                <div className="empty-state">
                  Aucune tâche disponible pour cette classe.
                </div>
              )}
        </div>
      )}
    </div>
  );
}

export default TaskList;
