import axios from "axios";
import { useEffect, useState } from "react";
import "./SubmissionReview.css";

function SubmissionReview() {
  const [state, setState] = useState({
    classes: [],
    tasks: [],
    submissions: [],
    selectedClassId: "",
    selectedTaskId: "",
    loading: false,
    error: "",
    user: null,
  });

  const [grading, setGrading] = useState({
    submissionId: null,
    grade: "",
    feedback: "",
    message: "",
  });

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user || user.role !== "Professeur") {
        setState((prev) => ({
          ...prev,
          error: "Accès réservé aux professeurs",
          user,
        }));
        return;
      }

      try {
        const response = await axios.get("/api/classes/professeur", {
          headers: { "x-auth-token": token },
        });

        setState((prev) => ({
          ...prev,
          classes: response.data,
          user,
          selectedClassId: response.data[0]?.id || "",
          error: response.data.length === 0 ? "Aucune classe assignée" : "",
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error.response?.data?.message || "Erreur de chargement",
          user,
        }));
      }
    };

    fetchData();
  }, []);

  // Charger les tâches quand la classe change
  useEffect(() => {
    const fetchTasks = async () => {
      if (!state.selectedClassId) return;

      setState((prev) => ({ ...prev, loading: true }));

      try {
        const response = await axios.get(
          `/api/tasks/class/${state.selectedClassId}`,
          {
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );

        setState((prev) => ({
          ...prev,
          tasks: response.data,
          selectedTaskId: "",
          submissions: [],
          error: response.data.length === 0 ? "Aucune tâche trouvée" : "",
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error.response?.data?.message || "Erreur de chargement",
        }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchTasks();
  }, [state.selectedClassId]);

  // Charger les soumissions quand la tâche change
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!state.selectedTaskId) return;

      setState((prev) => ({ ...prev, loading: true }));

      try {
        const response = await axios.get(
          `/api/tasks/${state.selectedTaskId}/submissions`,
          {
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );

        setState((prev) => ({
          ...prev,
          submissions: response.data,
          error: response.data.length === 0 ? "Aucune soumission trouvée" : "",
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error.response?.data?.message || "Erreur de chargement",
        }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchSubmissions();
  }, [state.selectedTaskId]);

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setGrading((prev) => ({ ...prev, message: "" }));

    try {
      const response = await axios.put(
        `/api/submissions/${grading.submissionId}/grade`,
        {
          grade: parseInt(grading.grade),
          feedback: grading.feedback,
        },
        { headers: { "x-auth-token": localStorage.getItem("token") } }
      );

      setGrading((prev) => ({
        ...prev,
        message: response.data.message,
        submissionId: null,
      }));

      // Mise à jour locale
      setState((prev) => ({
        ...prev,
        submissions: prev.submissions.map((sub) =>
          sub.id === grading.submissionId
            ? {
                ...sub,
                grade: parseInt(grading.grade),
                correction_feedback: grading.feedback,
              }
            : sub
        ),
      }));
    } catch (error) {
      setGrading((prev) => ({
        ...prev,
        message: error.response?.data?.message || "Erreur lors de la notation",
      }));
    }
  };

  if (state.user && state.user.role !== "professeur") {
    return (
      <div className="unauthorized-container">
        <div className="unauthorized-content">
          <h2>Accès non autorisé</h2>
          <p>Cette fonctionnalité est réservée aux professeurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-review-container">
      <header className="review-header">
        <h1>Correction des Soumissions</h1>
        <p>Évaluez les travaux rendus par vos étudiants</p>
      </header>

      {state.error && (
        <div
          className={`alert-message ${
            state.error.includes("Aucune") ? "info" : "error"
          }`}
        >
          {state.error}
        </div>
      )}

      <div className="selection-panel">
        <div className="select-group">
          <label>Classe</label>
          <select
            value={state.selectedClassId}
            onChange={(e) =>
              setState((prev) => ({ ...prev, selectedClassId: e.target.value }))
            }
            disabled={state.loading}
          >
            {state.classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nom}
              </option>
            ))}
          </select>
        </div>

        {state.selectedClassId && (
          <div className="select-group">
            <label>Tâche</label>
            <select
              value={state.selectedTaskId}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  selectedTaskId: e.target.value,
                }))
              }
              disabled={state.loading || state.tasks.length === 0}
            >
              <option value="">Sélectionnez une tâche</option>
              {state.tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.titre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {state.loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Chargement en cours...</p>
        </div>
      ) : (
        state.selectedTaskId && (
          <div className="submissions-section">
            <h2>Soumissions à corriger</h2>

            {state.submissions.length > 0 ? (
              <div className="submissions-grid">
                {state.submissions.map((submission) => (
                  <div key={submission.id} className="submission-card">
                    <div className="card-header">
                      <h3>
                        {submission.studentPrenom} {submission.studentNom}
                      </h3>
                      <span className="submission-date">
                        {new Date(submission.submitted_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </div>

                    <div className="card-content">
                      {submission.file_path && (
                        <a
                          href={submission.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-link"
                        >
                          📄 Voir le fichier soumis
                        </a>
                      )}
                      {submission.content && (
                        <div className="submission-text">
                          <p>{submission.content}</p>
                        </div>
                      )}
                    </div>

                    {grading.submissionId === submission.id ? (
                      <form
                        onSubmit={handleGradeSubmit}
                        className="grading-form"
                      >
                        <div className="form-group">
                          <label>Note (0-100)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={grading.grade}
                            onChange={(e) =>
                              setGrading((prev) => ({
                                ...prev,
                                grade: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Feedback</label>
                          <textarea
                            value={grading.feedback}
                            onChange={(e) =>
                              setGrading((prev) => ({
                                ...prev,
                                feedback: e.target.value,
                              }))
                            }
                            rows="4"
                          />
                        </div>
                        <div className="form-actions">
                          <button type="submit" className="primary-button">
                            Enregistrer
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              setGrading((prev) => ({
                                ...prev,
                                submissionId: null,
                              }))
                            }
                          >
                            Annuler
                          </button>
                        </div>
                        {grading.message && (
                          <div
                            className={`form-message ${
                              grading.message.includes("succès")
                                ? "success"
                                : "error"
                            }`}
                          >
                            {grading.message}
                          </div>
                        )}
                      </form>
                    ) : (
                      <div className="grading-status">
                        {submission.grade !== null ? (
                          <div className="graded-info">
                            <span className="grade-badge">
                              Note: {submission.grade}/100
                            </span>
                            <button
                              className="edit-button"
                              onClick={() =>
                                setGrading({
                                  submissionId: submission.id,
                                  grade: submission.grade,
                                  feedback:
                                    submission.correction_feedback || "",
                                  message: "",
                                })
                              }
                            >
                              Modifier
                            </button>
                          </div>
                        ) : (
                          <button
                            className="grade-button"
                            onClick={() =>
                              setGrading({
                                submissionId: submission.id,
                                grade: "",
                                feedback: "",
                                message: "",
                              })
                            }
                          >
                            Noter cette soumission
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Aucune soumission à afficher pour cette tâche</p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

export default SubmissionReview;
