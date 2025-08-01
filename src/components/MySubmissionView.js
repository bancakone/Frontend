import axios from "axios";
import { useEffect, useState } from "react";
import "./MySubmissionView.css";

function MySubmissionView({ submissionId, onClose }) {
  const [state, setState] = useState({
    submission: null,
    loading: true,
    error: "",
    userRole: "",
  });

  useEffect(() => {
    const fetchSubmission = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user || !submissionId) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Informations de connexion manquantes",
          userRole: user?.role || "",
        }));
        return;
      }

      try {
        const response = await axios.get(`/api/submissions/${submissionId}`, {
          headers: { "x-auth-token": token },
        });

        setState((prev) => ({
          ...prev,
          submission: response.data,
          userRole: user.role,
          loading: false,
          error: "",
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.response?.data?.message || "Erreur lors du chargement",
          userRole: user.role,
        }));
      }
    };

    fetchSubmission();
  }, [submissionId]);

  if (state.loading) {
    return (
      <div className="submission-view-loading">
        <div className="loader"></div>
        <p>Chargement de votre soumission...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="submission-view-error">
        <div className="error-icon">!</div>
        <p>{state.error}</p>
        <button onClick={onClose} className="close-button">
          Fermer
        </button>
      </div>
    );
  }

  if (!state.submission) {
    return (
      <div className="submission-view-empty">
        <p>Aucune soumission trouvée</p>
        <button onClick={onClose} className="close-button">
          Fermer
        </button>
      </div>
    );
  }

  return (
    <div className="submission-view-container">
      <div className="submission-view-header">
        <h1>Détail de votre soumission</h1>
        <p className="task-title">{state.submission.taskTitre}</p>
      </div>

      <div className="submission-details">
        <div className="detail-card">
          <h3>Informations générales</h3>
          <div className="detail-row">
            <span className="detail-label">Description</span>
            <p>{state.submission.taskDescription || "Non spécifiée"}</p>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date limite</span>
            <p>
              {new Date(state.submission.taskDateLimite).toLocaleDateString(
                "fr-FR",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </p>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date de soumission</span>
            <p>
              {new Date(state.submission.submitted_at).toLocaleDateString(
                "fr-FR",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </p>
          </div>
        </div>

        <div className="detail-card">
          <h3>Votre travail</h3>
          {state.submission.file_path && (
            <div className="detail-row">
              <span className="detail-label">Fichier joint</span>
              <a
                href={state.submission.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="file-link"
              >
                📄 Télécharger le fichier
              </a>
            </div>
          )}
          {state.submission.content && (
            <div className="detail-row">
              <span className="detail-label">Contenu texte</span>
              <div className="content-text">{state.submission.content}</div>
            </div>
          )}
        </div>

        {state.submission.grade !== null ||
        state.submission.correction_feedback ? (
          <div
            className={`detail-card feedback-card ${
              state.submission.grade !== null ? "graded" : "feedback-only"
            }`}
          >
            <h3>Correction</h3>
            {state.submission.grade !== null && (
              <div className="detail-row">
                <span className="detail-label">Note</span>
                <div className="grade-display">
                  <span className="grade-value">{state.submission.grade}</span>
                  <span className="grade-max">/100</span>
                </div>
              </div>
            )}
            {state.submission.correction_feedback && (
              <div className="detail-row">
                <span className="detail-label">Feedback</span>
                <div className="feedback-text">
                  {state.submission.correction_feedback}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="detail-card pending-card">
            <h3>Correction</h3>
            <div className="pending-message">
              <div className="pending-icon">⏳</div>
              <p>En attente de correction par le professeur</p>
            </div>
          </div>
        )}
      </div>

      <button onClick={onClose} className="close-button">
        Fermer
      </button>
    </div>
  );
}

export default MySubmissionView;
