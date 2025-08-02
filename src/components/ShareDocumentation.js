import axios from "axios";
import { useEffect, useState } from "react";
import "./ShareDocumentation.css";

function ShareDocumentation() {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [filePath, setFilePath] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [professorClasses, setProfessorClasses] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingClasses, setIsFetchingClasses] = useState(true);

  useEffect(() => {
    const fetchProfessorClasses = async () => {
      setIsFetchingClasses(true);
      const token = localStorage.getItem("token");
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      setUser(loggedInUser);

      if (!token || !loggedInUser || loggedInUser.role !== "professeur") {
        setMessage(
          "Vous devez être connecté en tant que professeur pour partager de la documentation."
        );
        setProfessorClasses([]);
        setIsFetchingClasses(false);
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
          setMessage("Vous n'avez pas encore créé de classes.");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Erreur lors du chargement de vos classes.";
        setMessage(errorMessage);
        console.error(
          "Erreur chargement classes professeur (Documentation) :",
          error.response?.data || error.message
        );
      } finally {
        setIsFetchingClasses(false);
      }
    };

    fetchProfessorClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    if (!user || user.role !== "professeur") {
      setMessage(
        "Accès non autorisé. Seuls les professeurs peuvent partager de la documentation."
      );
      setIsLoading(false);
      return;
    }

    if (!selectedClass) {
      setMessage("Veuillez sélectionner une classe.");
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "/api/documentations",
        { class_id: selectedClass, titre, description, file_path: filePath },
        { headers: { "x-auth-token": token } }
      );
      setMessage(response.data.message);
      setTitre("");
      setDescription("");
      setFilePath("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors du partage de la documentation.";
      setMessage(errorMessage);
      console.error(
        "Erreur partage documentation :",
        error.response?.data || error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (user && user.role !== "professeur") {
    return (
      <div className="documentation-unauthorized-container">
        <div className="documentation-unauthorized-message">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clipRule="evenodd"
            />
          </svg>
          <p>Vous n'avez pas l'autorisation de partager de la documentation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="documentation-container">
      <div className="documentation-card">
        <div className="documentation-header">
          <h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
            </svg>
            Partager une Documentation
          </h2>
          <p>Ajoutez des ressources pédagogiques pour vos étudiants</p>
        </div>

        {message && (
          <div
            className={`documentation-message ${
              message.includes("Erreur") || message.includes("non autorisé")
                ? "error"
                : "success"
            }`}
          >
            {message}
          </div>
        )}

        {isFetchingClasses ? (
          <div className="documentation-loading">
            <div className="spinner"></div>
          </div>
        ) : professorClasses.length > 0 ? (
          <form onSubmit={handleSubmit} className="documentation-form">
            <div className="form-group">
              <label htmlFor="selectClassDoc">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.644 1.59a.75.75 0 01.712 0l9.75 5.25a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.712 0l-9.75-5.25a.75.75 0 010-1.32l9.75-5.25z" />
                  <path d="M3.265 10.602l7.668 4.129a2.25 2.25 0 002.134 0l7.668-4.13 1.37.739a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.71 0l-9.75-5.25a.75.75 0 010-1.32l1.37-.738z" />
                  <path d="M10.933 19.231l-7.668-4.13-1.37.739a.75.75 0 000 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 000-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 01-2.134-.001z" />
                </svg>
                Classe <span className="required">*</span>
              </label>
              <select
                id="selectClassDoc"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                required
              >
                {professorClasses.map((cla) => (
                  <option key={cla.id} value={cla.id}>
                    {cla.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="titreDoc">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
                    clipRule="evenodd"
                  />
                  <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                </svg>
                Titre de la documentation <span className="required">*</span>
              </label>
              <input
                type="text"
                id="titreDoc"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex: Cours d'introduction à React"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="descriptionDoc">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                    clipRule="evenodd"
                  />
                </svg>
                Description (optionnel)
              </label>
              <textarea
                id="descriptionDoc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                placeholder="Décrivez le contenu de cette documentation..."
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="filePathDoc">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M19.5 21a3 3 0 003-3V9a3 3 0 00-3-3h-5.379a.75.75 0 01-.53-.22L11.47 3.66A2.25 2.25 0 009.879 3H4.5a3 3 0 00-3 3v12a3 3 0 003 3h15zm-6.75-10.5a.75.75 0 00-1.5 0v4.19l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V10.5z"
                    clipRule="evenodd"
                  />
                </svg>
                Lien/Chemin du fichier (URL) <span className="required">*</span>
              </label>
              <input
                type="url"
                id="filePathDoc"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="https://docs.google.com/document/d/..."
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Partage en cours...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                    Partager la Documentation
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          !isFetchingClasses && (
            <div className="documentation-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <p>
                {message ||
                  "Vous n'avez pas encore créé de classes. Veuillez créer une classe avant de pouvoir partager des documents."}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default ShareDocumentation;
