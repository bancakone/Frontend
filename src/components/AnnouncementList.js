import axios from "axios";
import { useEffect, useState } from "react";
import "./AnnouncementList.css";

function AnnouncementList() {
  const [userClasses, setUserClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    const fetchUserClasses = async () => {
      setMessage("");
      setLoadingClasses(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        setMessage("Vous devez être connecté pour voir les annonces.");
        setUserClasses([]);
        setAnnouncements([]);
        setLoadingClasses(false);
        return;
      }

      try {
        const response = await axios.get("/api/classes/me", {
          headers: { "x-auth-token": token },
        });
        setUserClasses(response.data);
        if (response.data.length > 0 && !selectedClassId) {
          setSelectedClassId(response.data[0].id);
        } else if (response.data.length === 0) {
          setMessage("Vous n'êtes inscrit à aucune classe pour le moment.");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Erreur lors du chargement de vos classes.";
        setMessage(errorMessage);
        setUserClasses([]);
        setAnnouncements([]);
        console.error(
          "Erreur chargement classes utilisateur :",
          error.response?.data || error.message
        );
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchUserClasses();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!selectedClassId) {
        setAnnouncements([]);
        return;
      }

      setLoading(true);
      setMessage("");

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `/api/announcements/${selectedClassId}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        setAnnouncements(response.data);
        if (response.data.length === 0) {
          setMessage("Aucune annonce pour cette classe.");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Erreur lors du chargement des annonces.";
        setMessage(errorMessage);
        setAnnouncements([]);
        console.error(
          "Erreur chargement annonces :",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    if (selectedClassId) {
      fetchAnnouncements();
    }
  }, [selectedClassId]);

  return (
    <div className="announcement-list-container">
      <div className="announcement-list-card">
        <div className="announcement-list-header">
          <h2>Annonces des Classes</h2>
          <p>Consultez les dernières annonces de vos classes</p>
        </div>

        {message && (
          <div className={`message ${message.includes("Erreur") || message.includes("connecté") ? "error" : "info"}`}>
            {message}
          </div>
        )}

        {loadingClasses ? (
          <div className="loading-spinner"></div>
        ) : userClasses.length > 0 ? (
          <div className="announcement-list-content">
            <div className="class-selector">
              <label htmlFor="selectClassToView">Sélectionnez une classe</label>
              <select
                id="selectClassToView"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {userClasses.map((cla) => (
                  <option key={cla.id} value={cla.id}>
                    {cla.nom}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="loading-spinner"></div>
            ) : announcements.length > 0 ? (
              <div className="announcements-grid">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="announcement-card">
                    <div className="announcement-content">
                      <h3>{announcement.titre}</h3>
                      <p>{announcement.contenu}</p>
                      <div className="announcement-meta">
                        <span className="author">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          {announcement.professeurNom} {announcement.professeurPrenom}
                        </span>
                        <span className="date">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          {new Date(announcement.created_at).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              selectedClassId && (
                <div className="empty-state">
                  Aucune annonce disponible pour cette classe.
                </div>
              )
            )}
          </div>
        ) : (
          !loadingClasses && (
            <div className="warning-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <p>{message || "Vous n'êtes inscrit à aucune classe."}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default AnnouncementList;