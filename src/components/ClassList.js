// src/components/ClassList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClassList.css'; // Pour les styles CSS purs

function ClassList() {
    const [classes, setClasses] = useState([]);
    const [message, setMessage] = useState('');
    const [userRole, setUserRole] = useState(null); // Pour stocker le rôle de l'utilisateur

    useEffect(() => {
        const fetchClasses = async () => {
            setMessage('');
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            if (!token || !user) {
                setMessage('Vous devez être connecté pour voir les classes.');
                setClasses([]);
                return;
            }

            setUserRole(user.role); // Définir le rôle de l'utilisateur

            let apiUrl = '';
            if (user.role === 'Professeur') {
                apiUrl = '/api/classes/professeur'; // Route pour les classes créées par le professeur
            } else if (user.role === 'Etudiant') {
                apiUrl = '/api/classes/me'; // Route pour les classes auxquelles l'étudiant est inscrit
            } else {
                setMessage('Rôle utilisateur non reconnu.');
                setClasses([]);
                return;
            }

            try {
                const response = await axios.get(
                    apiUrl,
                    {
                        headers: {
                            'x-auth-token': token
                        }
                    }
                );
                setClasses(response.data);
                if (response.data.length === 0) {
                    setMessage(`Aucune classe trouvée pour votre rôle de ${user.role}.`);
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des classes.';
                setMessage(errorMessage);
                setClasses([]);
                console.error('Erreur chargement classes :', error.response?.data || error.message);
            }
        };

        fetchClasses();

        // Optionnel: Recharger les classes si le token ou le rôle change
        // Attention: cela peut entraîner des re-renderings excessifs, à ajuster si nécessaire
        // L'idée est que quand l'utilisateur se connecte/déconnecte, la liste se mette à jour
    }, [userRole]); // Déclencher le useEffect si le rôle de l'utilisateur change

    return (
        <div className="class-list-container">
            <h2>Mes Classes</h2>
            {message && <p className="message-info">{message}</p>}

            {classes.length > 0 ? (
                <div className="classes-grid">
                    {classes.map((cla) => ( // 'cla' pour éviter conflit avec 'class' mot-clé
                        <div key={cla.id} className="class-card">
                            <h3>{cla.nom}</h3>
                            <p className="class-description">{cla.description}</p>
                            <p className="class-code">Code : <strong>{cla.code}</strong></p>
                            {userRole === 'Etudiant' && (
                                <p className="class-professor">Professeur : {cla.professeurNom} {cla.professeurPrenom}</p>
                            )}
                            {/* Plus de détails ou actions peuvent être ajoutés ici */}
                        </div>
                    ))}
                </div>
            ) : (
                !message && <p>Chargement des classes ou aucune classe disponible.</p>
            )}
        </div>
    );
}

export default ClassList;