import axios from "axios";
import { useState } from "react";
import "./CreateClass.css";

function CreateClass() {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage(
        "Vous devez être connecté en tant que professeur pour créer une classe."
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "/api/classes",
        { nom, description },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      setMessage(
        `Classe créée avec succès! Code de la classe : ${response.data.class.code}`
      );
      setNom("");
      setDescription("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de la création de la classe.";
      setMessage(errorMessage);
      console.error(
        "Erreur création classe :",
        error.response?.data || error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-class-container">
      <div className="create-class-card">
        <div className="create-class-header">
          <h2>Créer une Nouvelle Classe</h2>
          <p>Remplissez les détails de votre nouvelle classe pour commencer</p>
        </div>

        <form onSubmit={handleSubmit} className="create-class-form">
          <div className="form-group">
            <label htmlFor="nom">
              Nom de la classe <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Mathématiques Avancées"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Décrivez les objectifs de cette classe..."
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className={isLoading ? "loading" : ""}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Création en cours...
                </>
              ) : (
                "Créer la classe"
              )}
            </button>
          </div>
        </form>

        {message && (
          <div className={`message ${message.includes("Erreur") ? "error" : "success"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateClass;