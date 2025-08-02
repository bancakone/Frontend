import axios from "axios";
import { useEffect, useState } from "react";
import "./CreateProject.css";

function CreateProject() {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [userClasses, setUserClasses] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchUserClasses = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      setUserRole(user ? user.role : "");

      if (
        !token ||
        !user ||
        !["professeur", "Coordinateur"].includes(user.role)
      ) {
        setMessage("Vous n'avez pas la permission de créer un projet.");
        setLoading(false);
        return;
      }

      try {
        const classesApiRoute =
          user.role === "professeur"
            ? "/api/classes/professeur"
            : "/api/classes/me";
        const response = await axios.get(classesApiRoute, {
          headers: { "x-auth-token": token },
        });

        setUserClasses(response.data);
        if (response.data.length > 0) {
          setSelectedClassId(response.data[0].id);
        } else {
          setMessage("Vous ne gérez aucune classe pour créer un projet.");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Erreur lors du chargement de vos classes.";
        setMessage(errorMessage);
        console.error(
          "Erreur chargement classes:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUserClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);

    if (!titre || !selectedClassId || !dateDebut || !dateFin) {
      setMessage("Veuillez remplir tous les champs obligatoires.");
      setSubmitting(false);
      return;
    }

    if (new Date(dateDebut) > new Date(dateFin)) {
      setMessage(
        "La date de début ne peut pas être postérieure à la date de fin."
      );
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/projects",
        {
          class_id: selectedClassId,
          titre,
          description,
          date_debut: dateDebut,
          date_fin: dateFin,
        },
        { headers: { "x-auth-token": token } }
      );

      setMessage(response.data.message);
      setTitre("");
      setDescription("");
      setDateDebut("");
      setDateFin("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de la création du projet.";
      setMessage(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="create-project-container">
        <p className="loading-text">Chargement des données...</p>
      </div>
    );
  }

  if (!["professeur", "Coordinateur"].includes(userRole)) {
    return (
      <div className="create-project-container">
        <p className="message-info error">
          Vous n'avez pas la permission de créer un projet.
        </p>
      </div>
    );
  }

  return (
    <div className="create-project-container">
      <h2>Créer un Nouveau Projet</h2>

      {message && (
        <p
          className={`message-info ${
            message.includes("permission") ? "error" : ""
          }`}
        >
          {message}
        </p>
      )}

      {userClasses.length === 0 && !loading && (
        <p className="message-info warning">
          Vous n'êtes associé à aucune classe. Créez-en une ou rejoignez-en une
          en tant que Professeur/Coordinateur pour pouvoir créer un projet.
        </p>
      )}

      {userClasses.length > 0 && (
        <form onSubmit={handleSubmit} className="create-project-form">
          <div className="form-group">
            <label htmlFor="classSelect">Sélectionnez une classe :</label>
            <select
              id="classSelect"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="form-select"
              required
              disabled={submitting}
            >
              {userClasses.map((cla) => (
                <option key={cla.id} value={cla.id}>
                  {cla.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="titre">Titre du Projet :</label>
            <input
              type="text"
              id="titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="form-input"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description :</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows="4"
              disabled={submitting}
            />
          </div>

          <div className="date-inputs">
            <div className="form-group">
              <label htmlFor="dateDebut">Date de Début :</label>
              <input
                type="date"
                id="dateDebut"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="form-input"
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateFin">Date de Fin :</label>
              <input
                type="date"
                id="dateFin"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="form-input"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="create-project-button"
            disabled={submitting}
          >
            {submitting ? "Création en cours..." : "Créer le Projet"}
          </button>
        </form>
      )}
    </div>
  );
}

export default CreateProject;
