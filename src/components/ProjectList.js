// src/components/ProjectList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectList.css';

function ProjectList() {
    const [userClasses, setUserClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [projects, setProjects] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');
    const [showGroupForm, setShowGroupForm] = useState(null); // projectId for which group form is open
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [allStudentsInClass, setAllStudentsInClass] = useState([]); // Students to add to groups
    const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            setUserRole(user ? user.role : '');

            if (!token || !user) {
                setMessage('Vous devez être connecté pour voir les projets.');
                setLoading(false);
                return;
            }

            try {
                // Fetch classes the user is a member of (any role can see projects in their classes)
                const classesResponse = await axios.get(
                    '/api/classes/me',
                    { headers: { 'x-auth-token': token } }
                );
                setUserClasses(classesResponse.data);
                if (classesResponse.data.length > 0) {
                    setSelectedClassId(classesResponse.data[0].id);
                } else {
                    setMessage('Vous n\'êtes membre d\'aucune classe.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement de vos classes.';
                setMessage(errorMessage);
                console.error('Erreur chargement classes (ProjectList) :', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchProjectsAndStudents = async () => {
            if (!selectedClassId) {
                setProjects([]);
                setAllStudentsInClass([]);
                return;
            }
            setLoading(true);
            setMessage('');
            const token = localStorage.getItem('token');

            try {
                // Fetch projects for the selected class
                const projectsResponse = await axios.get(
                    `/api/projects/class/${selectedClassId}`,
                    { headers: { 'x-auth-token': token } }
                );
                const fetchedProjects = projectsResponse.data;

                // Fetch groups and their members for each project
                for (let project of fetchedProjects) {
                    const groupsResponse = await axios.get(
                        `/api/groups/project/${project.id}`,
                        { headers: { 'x-auth-token': token } }
                    );
                    project.groups = groupsResponse.data;
                }
                setProjects(fetchedProjects);

                if (fetchedProjects.length === 0) {
                    setMessage('Aucun projet trouvé pour cette classe.');
                }

                // Fetch all students in this class for group management (Prof/Coord only)
                if (userRole === 'Professeur' || userRole === 'Coordinateur') {
                    const studentsResponse = await axios.get(
                        `/api/classes/${selectedClassId}/students`, // This route needs to be created
                        { headers: { 'x-auth-token': token } }
                    );
                    setAllStudentsInClass(studentsResponse.data);
                }

            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des projets ou des groupes.';
                setMessage(errorMessage);
                setProjects([]);
                console.error('Erreur chargement projets/groupes :', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        if (selectedClassId) {
            fetchProjectsAndStudents();
        }
    }, [selectedClassId, userRole]); // Re-run when class changes or userRole is set

    const handleCreateGroup = async (projectId) => {
        setMessage('');
        const token = localStorage.getItem('token');
        if (!newGroupName.trim()) {
            setMessage('Le nom du groupe ne peut pas être vide.');
            return;
        }

        try {
            const response = await axios.post(
                '/api/groups',
                { projet_id: projectId, nom_groupe: newGroupName, description: newGroupDescription },
                { headers: { 'x-auth-token': token } }
            );
            setMessage(response.data.message);
            setNewGroupName('');
            setNewGroupDescription('');
            setShowGroupForm(null); // Close form
            // Refresh projects for the selected class
            const updatedProjects = await axios.get(
                `/api/projects/class/${selectedClassId}`,
                { headers: { 'x-auth-token': token } }
            );
            for (let project of updatedProjects.data) {
                const groupsResponse = await axios.get(
                    `/api/groups/project/${project.id}`,
                    { headers: { 'x-auth-token': token } }
                );
                project.groups = groupsResponse.data;
            }
            setProjects(updatedProjects.data);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la création du groupe.';
            setMessage(errorMessage);
            console.error('Erreur création groupe :', error.response?.data || error.message);
        }
    };

    const handleAddMemberToGroup = async (groupId) => {
        setMessage('');
        const token = localStorage.getItem('token');
        if (!selectedStudentToAdd) {
            setMessage('Veuillez sélectionner un étudiant à ajouter.');
            return;
        }

        try {
            const response = await axios.post(
                `/api/groups/${groupId}/members`,
                { user_id_to_add: selectedStudentToAdd },
                { headers: { 'x-auth-token': token } }
            );
            setMessage(response.data.message);
            setSelectedStudentToAdd('');
            // Refresh projects for the selected class to update members list
            const updatedProjects = await axios.get(
                `/api/projects/class/${selectedClassId}`,
                { headers: { 'x-auth-token': token } }
            );
            for (let project of updatedProjects.data) {
                const groupsResponse = await axios.get(
                    `/api/groups/project/${project.id}`,
                    { headers: { 'x-auth-token': token } }
                );
                project.groups = groupsResponse.data;
            }
            setProjects(updatedProjects.data);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de l\'ajout du membre au groupe.';
            setMessage(errorMessage);
            console.error('Erreur ajout membre groupe :', error.response?.data || error.message);
        }
    };

    const handleRemoveMemberFromGroup = async (groupId, userId) => {
        setMessage('');
        const token = localStorage.getItem('token');

        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre du groupe ?')) {
            try {
                const response = await axios.delete(
                    `/api/groups/${groupId}/members/${userId}`,
                    { headers: { 'x-auth-token': token } }
                );
                setMessage(response.data.message);
                // Refresh projects for the selected class to update members list
                const updatedProjects = await axios.get(
                    `/api/projects/class/${selectedClassId}`,
                    { headers: { 'x-auth-token': token } }
                );
                for (let project of updatedProjects.data) {
                    const groupsResponse = await axios.get(
                        `/api/groups/project/${project.id}`,
                        { headers: { 'x-auth-token': token } }
                    );
                    project.groups = groupsResponse; // Fix: Should be .data
                    project.groups = groupsResponse.data;
                }
                setProjects(updatedProjects.data);

            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression du membre du groupe.';
                setMessage(errorMessage);
                console.error('Erreur suppression membre groupe :', error.response?.data || error.message);
            }
        }
    };

    const canManageProjects = userRole === 'Professeur' || userRole === 'Coordinateur';

    if (!userRole) { // If userRole is not yet loaded or user not logged in
        return <div className="project-list-container"><p className="message-info error">Chargement de votre rôle...</p></div>;
    }

    if (loading) {
        return <div className="project-list-container"><p>Chargement des projets...</p></div>;
    }

    return (
        <div className="project-list-container">
            <h2>Liste des Projets</h2>
            {message && <p className="message-info">{message}</p>}

            {userClasses.length > 0 ? (
                <div className="form-group class-select">
                    <label htmlFor="classSelectProjects">Sélectionnez une classe :</label>
                    <select
                        id="classSelectProjects"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="form-select"
                    >
                        {userClasses.map(cla => (
                            <option key={cla.id} value={cla.id}>{cla.nom}</option>
                        ))}
                    </select>
                </div>
            ) : (
                !loading && <p className="message-info no-classes">Vous n'êtes membre d'aucune classe pour voir les projets.</p>
            )}

            {selectedClassId && projects.length > 0 ? (
                <div className="projects-grid">
                    {projects.map(project => (
                        <div key={project.id} className="project-card">
                            <h3>{project.titre}</h3>
                            <p className="project-description">{project.description}</p>
                            <p className="project-dates">
                                Du {new Date(project.date_debut).toLocaleDateString()} au {new Date(project.date_fin).toLocaleDateString()}
                            </p>
                            <p className="project-status">Statut : <span className={`status-${project.statut}`}>{project.statut}</span></p>

                            <div className="project-groups">
                                <h4>Groupes :</h4>
                                {project.groups && project.groups.length > 0 ? (
                                    <ul>
                                        {project.groups.map(group => (
                                            <li key={group.id} className="group-item">
                                                <strong>{group.nom_groupe}</strong> ({group.description})
                                                <div className="group-members">
                                                    Membres :
                                                    {group.members && group.members.length > 0 ? (
                                                        <ul>
                                                            {group.members.map(member => (
                                                                <li key={member.id} className="member-item">
                                                                    {member.prenom} {member.nom}
                                                                    {canManageProjects && (
                                                                        <button
                                                                            className="remove-member-button"
                                                                            onClick={() => handleRemoveMemberFromGroup(group.id, member.id)}
                                                                            title="Supprimer du groupe"
                                                                        >
                                                                            &times;
                                                                        </button>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="no-members">Aucun membre dans ce groupe.</p>
                                                    )}
                                                    {canManageProjects && (
                                                        <div className="add-member-form">
                                                            <select
                                                                value={selectedStudentToAdd}
                                                                onChange={(e) => setSelectedStudentToAdd(e.target.value)}
                                                            >
                                                                <option value="">Ajouter un étudiant...</option>
                                                                {allStudentsInClass.filter(s =>
                                                                    !group.members.some(m => m.id === s.id) // Filter out students already in this group
                                                                ).map(student => (
                                                                    <option key={student.id} value={student.id}>
                                                                        {student.prenom} {student.nom}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <button onClick={() => handleAddMemberToGroup(group.id)}>Ajouter</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-groups">Aucun groupe pour ce projet.</p>
                                )}

                                {canManageProjects && (
                                    <button
                                        className="toggle-group-form-button"
                                        onClick={() => setShowGroupForm(showGroupForm === project.id ? null : project.id)}
                                    >
                                        {showGroupForm === project.id ? 'Annuler' : 'Créer un nouveau groupe'}
                                    </button>
                                )}

                                {showGroupForm === project.id && canManageProjects && (
                                    <div className="create-group-form">
                                        <h4>Nouveau Groupe :</h4>
                                        <input
                                            type="text"
                                            placeholder="Nom du groupe"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                        />
                                        <textarea
                                            placeholder="Description du groupe (optionnel)"
                                            value={newGroupDescription}
                                            onChange={(e) => setNewGroupDescription(e.target.value)}
                                        />
                                        <button onClick={() => handleCreateGroup(project.id)}>Créer le groupe</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                selectedClassId && !message && !loading && (
                    <p className="no-projects-found">Aucun projet trouvé pour cette classe.</p>
                )
            )}
        </div>
    );
}

export default ProjectList;