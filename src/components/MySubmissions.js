import axios from "axios";
import { useEffect, useState } from "react";
import MySubmissionView from "./MySubmissionView";
import "./MySubmissions.css";

function MySubmissions() {
  const [state, setState] = useState({
    submissions: [],
    loading: true,
    error: "",
    user: null,
  });

  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Veuillez vous connecter pour accéder à vos soumissions",
        }));
        return;
      }

      if (user.role !== "Etudiant") {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Réservé aux étudiants",
        }));
        return;
      }

      try {
        const response = await axios.get("/api/users/me/submissions", {
          headers: { "x-auth-token": token },
        });

        setState((prev) => ({
          ...prev,
          submissions: response.data,
          user,
          loading: false,
          error: response.data.length === 0 ? "Aucune soumission trouvée" : "",
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.response?.data?.message || "Erreur lors du chargement",
        }));
      }
    };

    fetchSubmissions();
  }, []);

  if (selectedSubmissionId) {
    return (
      <MySubmissionView
        submissionId={selectedSubmissionId}
        onClose={() => setSelectedSubmissionId(null)}
      />
    );
  }

  if (state.loading) {
    return (
      <div className="submissions-loading">
        <div className="loader"></div>
        <p>Chargement de vos soumissions...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="submissions-error">
        <div className="error-icon">!</div>
        <p>{state.error}</p>
        {state.error === "Réservé aux étudiants" && (
          <button className="back-button" onClick={() => window.history.back()}>
            Retour
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="submissions-container">
      <header className="submissions-header">
        <h1>Mes Soumissions</h1>
        <p>Historique de vos travaux rendus</p>
      </header>

      {state.submissions.length > 0 ? (
        <div className="submissions-grid">
          {state.submissions.map((submission) => (
            <div key={submission.id} className="submission-card">
              <div className="card-header">
                <h3>{submission.taskTitre}</h3>
                <span
                  className={`status-badge ${
                    submission.grade !== null
                      ? "graded"
                      : submission.correction_feedback
                      ? "feedback"
                      : "pending"
                  }`}
                >
                  {submission.grade !== null
                    ? "Noté"
                    : submission.correction_feedback
                    ? "Feedback"
                    : "En attente"}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span>Classe</span>
                  <span>{submission.className}</span>
                </div>
                <div className="info-row">
                  <span>Date de soumission</span>
                  <span>
                    {new Date(submission.submitted_at).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
                {submission.grade !== null && (
                  <div className="info-row highlight">
                    <span>Note</span>
                    <span className="grade-value">{submission.grade}/100</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedSubmissionId(submission.id)}
                className="details-button"
              >
                <span>Voir détails</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="submissions-empty">
          <img
            src="/images/empty-submissions.svg"
            alt="Aucune soumission"
            width="150"
          />
          <p>Vous n'avez pas encore soumis de travail</p>
        </div>
      )}
    </div>
  );
}

export default MySubmissions;
