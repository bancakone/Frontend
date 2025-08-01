// src/components/CreateProject.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateProject.css';

function CreateProject() {
    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [userClasses, setUserClasses] = useState([]); // Classes gérées par le prof/coordinateur
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const fetchUserClasses = async () => {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            setUserRole(user ? user.role : '');

            if (!token || !user || (!['Professeur', 'Coordinateur'].includes(user.role))) {
                setMessage('Vous n\'avez pas la permission de créer un projet.');
                setLoading(false);
                return;
            }

            try {
                // Les professeurs voient leurs classes créées, les coordinateurs toutes les classes où ils sont membres
                const classesApiRoute = user.role === 'Professeur' ? '/api/classes/professeur' : '/api/classes/me';
                const response = await axios.get(
                    classesApiRoute,
                    { headers: { 'x-auth-token': token } }
                );
                setUserClasses(response.data);
                if (response.data.length > 0) {
                    setSelectedClassId(response.data[0].id);
                } else {
                    setMessage('Vous ne gérez aucune classe pour créer un projet.');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement de vos classes.';
                setMessage(errorMessage);
                console.error('Erreur chargement classes (CreateProject) :', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserClasses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('token');

        if (!titre || !selectedClassId || !dateDebut || !dateFin) {
            setMessage('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        if (new Date(dateDebut) > new Date(dateFin)) {
            setMessage('La date de début ne peut pas être postérieure à la date de fin.');
            return;
        }

        try {
            const response = await axios.post(
                '/api/projects',
                {
                    class_id: selectedClassId,
                    titre,
                    description,
                    date_debut: dateDebut,
                    date_fin: dateFin
                },
                { headers: { 'x-auth-token': token } }
            );
            setMessage(response.data.message);
            setTitre('');
            setDescription('');
            setDateDebut('');
            setDateFin('');
            // Optionally, refresh project list if one is present on the same page
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la création du projet.';
            setMessage(errorMessage);
            console.error('Erreur création projet :', error.response?.data || error.message);
        }
    };

    if (loading) {
        return <div className="create-project-container"><p>Chargement des données...</p></div>;
    }

    if (!['Professeur', 'Coordinateur'].includes(userRole)) {
        return <div className="create-project-container"><p className="message-info error">Vous n'avez pas la permission de créer un projet.</p></div>;
    }

    return (
        <div className="create-project-container">
            <h2>Créer un Nouveau Projet</h2>
            {message && <p className="message-info">{message}</p>}

            {userClasses.length === 0 && !loading && (
                <p className="message-info no-classes">Vous n'êtes associé à aucune classe. Créez-en une ou rejoignez-en une en tant que Professeur/Coordinateur pour pouvoir créer un projet.</p>
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
                        >
                            <option value="">-- Sélectionner une classe --</option>
                            {userClasses.map(cla => (
                                <option key={cla.id} value={cla.id}>{cla.nom}</option>
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
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="dateDebut">Date de Début :</label>
                        <input
                            type="date"
                            id="dateDebut"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.target.value)}
                            className="form-input"
                            required
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
                        />
                    </div>

                    <button type="submit" className="create-project-button">
                        Créer le Projet
                    </button>
                </form>
            )}
        </div>
    );
}

export default CreateProject;