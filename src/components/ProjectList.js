import axios from "axios";
import { useEffect, useState } from "react";
import "./ProjectList.css";

function ProjectList() {
  const [userClasses, setUserClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [showGroupForm, setShowGroupForm] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [allStudentsInClass, setAllStudentsInClass] = useState([]);
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      setUserRole(user?.role || "");

      if (!token || !user) {
        setMessage("Vous devez être connecté pour voir les projets.");
        setLoading(false);
        return;
      }

      try {
        const classesResponse = await axios.get("/api/classes/me", {
          headers: { "x-auth-token": token },
        });
        setUserClasses(classesResponse.data);
        if (classesResponse.data.length > 0) {
          setSelectedClassId(classesResponse.data[0].id);
        } else {
          setMessage("Vous n'êtes membre d'aucune classe.");
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Erreur lors du chargement de vos classes."
        );
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchProjectsAndStudents = async () => {
      if (!selectedClassId) return;

      setLoading(true);
      setMessage("");
      const token = localStorage.getItem("token");

      try {
        // Fetch projects
        const projectsResponse = await axios.get(
          `/api/projects/class/${selectedClassId}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        const fetchedProjects = projectsResponse.data;

        // Fetch groups for each project
        for (let project of fetchedProjects) {
          const groupsResponse = await axios.get(
            `/api/groups/project/${project.id}`,
            {
              headers: { "x-auth-token": token },
            }
          );
          project.groups = groupsResponse.data;
        }
        setProjects(fetchedProjects);

        // Fetch students if professor/coordinator
        if (["Professeur", "Coordinateur"].includes(userRole)) {
          const studentsResponse = await axios.get(
            `/api/classes/${selectedClassId}/students`,
            {
              headers: { "x-auth-token": token },
            }
          );
          setAllStudentsInClass(studentsResponse.data);
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Erreur lors du chargement des projets."
        );
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndStudents();
  }, [selectedClassId, userRole]);

  const handleCreateGroup = async (projectId) => {
    if (!newGroupName.trim()) {
      setMessage("Le nom du groupe est requis.");
      return;
    }

    setMessage("");
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "/api/groups",
        {
          projet_id: projectId,
          nom_groupe: newGroupName,
          description: newGroupDescription,
        },
        { headers: { "x-auth-token": token } }
      );

      // Refresh data
      const updatedProjects = await axios.get(
        `/api/projects/class/${selectedClassId}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setProjects(updatedProjects.data);
      setNewGroupName("");
      setNewGroupDescription("");
      setShowGroupForm(null);
      setMessage("Groupe créé avec succès !");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Erreur lors de la création du groupe."
      );
      console.error("Erreur:", error);
    }
  };

  const handleAddMemberToGroup = async (groupId) => {
    if (!selectedStudentToAdd) {
      setMessage("Veuillez sélectionner un étudiant.");
      return;
    }

    setMessage("");
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `/api/groups/${groupId}/members`,
        {
          user_id_to_add: selectedStudentToAdd,
        },
        { headers: { "x-auth-token": token } }
      );

      // Refresh data
      const updatedProjects = await axios.get(
        `/api/projects/class/${selectedClassId}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setProjects(updatedProjects.data);
      setSelectedStudentToAdd("");
      setMessage("Membre ajouté avec succès !");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Erreur lors de l'ajout du membre."
      );
      console.error("Erreur:", error);
    }
  };

  const handleRemoveMemberFromGroup = async (groupId, userId) => {
    if (!window.confirm("Supprimer ce membre du groupe ?")) return;

    setMessage("");
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`/api/groups/${groupId}/members/${userId}`, {
        headers: { "x-auth-token": token },
      });

      // Refresh data
      const updatedProjects = await axios.get(
        `/api/projects/class/${selectedClassId}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setProjects(updatedProjects.data);
      setMessage("Membre supprimé avec succès !");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Erreur lors de la suppression du membre."
      );
      console.error("Erreur:", error);
    }
  };

  const canManageGroups = ["Professeur", "Coordinateur"].includes(userRole);

  if (loading) {
    return (
      <div className="projects-loading">
        <div className="loading-spinner"></div>
        <span>Chargement des projets...</span>
      </div>
    );
  }

  return (
    <div className="projects-dashboard">
      <div className="dashboard-header">
        <h2>Gestion des Projets</h2>
        <div className="header-divider"></div>
      </div>

      {message && (
        <div
          className={`status-message ${
            message.includes("Erreur") ? "error" : "success"
          }`}
        >
          {message}
        </div>
      )}

      {userClasses.length > 0 ? (
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
      ) : (
        <div className="no-classes-message">
          Vous n'êtes membre d'aucune classe.
        </div>
      )}

      {selectedClassId && projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="card-header">
                <h3>{project.titre}</h3>
                <div className="project-meta">
                  <span className="date-range">
                    {new Date(project.date_debut).toLocaleDateString()} -{" "}
                    {new Date(project.date_fin).toLocaleDateString()}
                  </span>
                  <span
                    className={`status-badge ${project.statut.toLowerCase()}`}
                  >
                    {project.statut}
                  </span>
                </div>
              </div>

              {project.description && (
                <div className="project-description">
                  <p>{project.description}</p>
                </div>
              )}

              <div className="groups-section">
                <h4>Groupes</h4>
                {project.groups?.length > 0 ? (
                  <div className="groups-list">
                    {project.groups.map((group) => (
                      <div key={group.id} className="group-card">
                        <div className="group-header">
                          <h5>{group.nom_groupe}</h5>
                          {group.description && (
                            <p className="group-description">
                              {group.description}
                            </p>
                          )}
                        </div>

                        <div className="members-list">
                          <h6>Membres :</h6>
                          {group.members?.length > 0 ? (
                            <ul>
                              {group.members.map((member) => (
                                <li key={member.id} className="member-item">
                                  <span>
                                    {member.prenom} {member.nom}
                                  </span>
                                  {canManageGroups && (
                                    <button
                                      className="remove-member"
                                      onClick={() =>
                                        handleRemoveMemberFromGroup(
                                          group.id,
                                          member.id
                                        )
                                      }
                                      title="Retirer du groupe"
                                    >
                                      ×
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="no-members">Aucun membre</p>
                          )}

                          {canManageGroups && (
                            <div className="add-member-form">
                              <select
                                value={selectedStudentToAdd}
                                onChange={(e) =>
                                  setSelectedStudentToAdd(e.target.value)
                                }
                              >
                                <option value="">Ajouter un membre...</option>
                                {allStudentsInClass
                                  .filter(
                                    (s) =>
                                      !group.members?.some((m) => m.id === s.id)
                                  )
                                  .map((student) => (
                                    <option key={student.id} value={student.id}>
                                      {student.prenom} {student.nom}
                                    </option>
                                  ))}
                              </select>
                              <button
                                className="add-button"
                                onClick={() => handleAddMemberToGroup(group.id)}
                              >
                                Ajouter
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-groups">Aucun groupe créé</p>
                )}

                {canManageGroups && (
                  <div className="group-actions">
                    <button
                      className={`toggle-form-button ${
                        showGroupForm === project.id ? "active" : ""
                      }`}
                      onClick={() =>
                        setShowGroupForm(
                          showGroupForm === project.id ? null : project.id
                        )
                      }
                    >
                      {showGroupForm === project.id
                        ? "Annuler"
                        : "Créer un groupe"}
                    </button>

                    {showGroupForm === project.id && (
                      <div className="create-group-form">
                        <h5>Nouveau Groupe</h5>
                        <input
                          type="text"
                          placeholder="Nom du groupe*"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          required
                        />
                        <textarea
                          placeholder="Description (optionnel)"
                          value={newGroupDescription}
                          onChange={(e) =>
                            setNewGroupDescription(e.target.value)
                          }
                          rows="3"
                        />
                        <button
                          className="create-button"
                          onClick={() => handleCreateGroup(project.id)}
                        >
                          Créer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        selectedClassId &&
        !loading && (
          <div className="no-projects">
            Aucun projet disponible pour cette classe.
          </div>
        )
      )}
    </div>
  );
}

export default ProjectList;
