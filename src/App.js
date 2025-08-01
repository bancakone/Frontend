// src/App.js - Gestion de l'affichage des composants après la connexion
import React, { useState } from 'react';
import './App.css'; // Fichier CSS pour les styles

// Importez vos composants
import Register from './components/Register';
import Login from './components/Login';
import CreateClass from './components/CreateClass';
import ClassList from './components/ClassList';
import JoinClass from './components/JoinClass';
import CreateAnnouncement from './components/CreateAnnouncement';
import AnnouncementList from './components/AnnouncementList';
import ShareDocumentation from './components/ShareDocumentation';
import DocumentationList from './components/DocumentationList';
import AssignTask from './components/AssignTask';
import TaskList from './components/TaskList';
import SubmissionReview from './components/SubmissionReview';
import MySubmissions from './components/MySubmissions';
import SendMessage from './components/SendMessage';
import PublicMessageList from './components/PublicMessageList';
import PrivateMessageList from './components/PrivateMessageList';
import CreateProject from './components/CreateProject';
import ProjectList from './components/ProjectList';
import UserManagement from './components/UserManagement';

// Mappage des composants pour les enseignants (Professeurs)
const teacherComponentsMap = {
    'Classements': ClassList,
    'Créer une Classe': CreateClass,
    'Créer une Annonce': CreateAnnouncement,
    'Liste des Annonces': AnnouncementList,
    'Partager un Document': ShareDocumentation,
    'Liste des Documents': DocumentationList,
    'Attribuer une Tâche': AssignTask,
    'Liste des Tâches': TaskList,
    'Réviser les Soumissions': SubmissionReview,
    'Envoyer un Message': SendMessage,
    'Messages Publics': PublicMessageList,
    'Messages Privés': PrivateMessageList,
    'Créer un Projet': CreateProject,
    'Liste des Projets': ProjectList,
};

// Mappage des composants pour les étudiants
const studentComponentsMap = {
    'Classements': ClassList,
    'Rejoindre une Classe': JoinClass,
    'Liste des Annonces': AnnouncementList,
    'Liste des Documents': DocumentationList,
    'Liste des Tâches': TaskList,
    'Mes Soumissions': MySubmissions,
    'Envoyer un Message': SendMessage,
    'Messages Publics': PublicMessageList,
    'Messages Privés': PrivateMessageList,
    'Liste des Projets': ProjectList,
};

// Mappage des composants pour les coordinateurs (nouveau rôle)
const coordinateurComponentsMap = {
    'Gestion des Utilisateurs': UserManagement,
    'Classements': ClassList,
    'Créer une Classe': CreateClass,
    'Liste des Annonces': AnnouncementList,
    'Liste des Documents': DocumentationList,
    'Liste des Tâches': TaskList,
    'Liste des Projets': ProjectList,
    'Messages Publics': PublicMessageList,
    'Messages Privés': PrivateMessageList,
};


function App() {
    // État pour gérer les informations de l'utilisateur. Initialisé à null.
    const [user, setUser] = useState(null);
    // État pour suivre le nom du composant actif. Initialisé à 'Connexion'.
    const [activeComponent, setActiveComponent] = useState('Connexion');

    // Fonction pour obtenir le ComponentMap en fonction du rôle de l'utilisateur
    const getComponentMap = (role) => {
        if (role === 'Professeur') {
            return teacherComponentsMap;
        } else if (role === 'Étudiant') {
            return studentComponentsMap;
        } else if (role === 'Coordinateur') {
            return coordinateurComponentsMap;
        }
        return {};
    };

    // Callback pour gérer la connexion réussie.
    // Accepte maintenant les données de l'utilisateur en paramètre.
    const handleLoginSuccess = (userData) => {
        setUser(userData);
        // Après la connexion, affiche le composant par défaut en fonction du rôle
        if (userData.role === 'Professeur') {
            setActiveComponent('Liste des Annonces'); 
        } else if (userData.role === 'Étudiant') {
            setActiveComponent('Liste des Annonces');
        } else if (userData.role === 'Coordinateur') {
            setActiveComponent('Gestion des Utilisateurs');
        } else {
            setActiveComponent('Liste des Annonces');
        }
    };

    // Callback pour gérer la déconnexion.
    const handleLogout = () => {
        setUser(null);
        setActiveComponent('Connexion');
    };

    // Callback pour basculer entre Inscription et Connexion.
    const handleAuthSwitch = (componentName) => {
        setActiveComponent(componentName);
    };

    // Fonction pour rendre le composant actif dynamiquement.
    const renderActiveComponent = () => {
        const componentMap = getComponentMap(user?.role);
        const ComponentToRender = componentMap[activeComponent];
        
        const commonProps = {
            onLoginSuccess: handleLoginSuccess,
            onAuthSwitch: handleAuthSwitch,
            user: user, // Passe les informations utilisateur aux composants enfants
        };

        if (user) {
            // Utilisateur connecté, rend le composant de l'application
            if (ComponentToRender) {
                return <ComponentToRender {...commonProps} />;
            } else {
                return <div>Composant non trouvé pour votre rôle.</div>;
            }
        } else {
            // Utilisateur non connecté, rend les composants d'authentification
            switch (activeComponent) {
                case 'Connexion':
                    return <Login {...commonProps} />;
                case 'Inscription':
                    return <Register {...commonProps} />;
                default:
                    return <div>Veuillez vous connecter ou vous inscrire.</div>;
            }
        }
    };

    // Le contenu de la barre latérale dépend maintenant de l'état de l'utilisateur
    const sidebarContent = user ? (
        <>
            <ul>
                {Object.keys(getComponentMap(user.role)).map(key => (
                    <li key={key} className="nav-item">
                        <button
                            onClick={() => setActiveComponent(key)}
                            className={`nav-link ${activeComponent === key ? 'active' : ''}`}
                        >
                            {key}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="nav-link logout-button">
                    Déconnexion
                </button>
            </div>
        </>
    ) : (
        <ul>
            <li className="nav-item">
                <button
                    onClick={() => handleAuthSwitch('Connexion')}
                    className={`nav-link ${activeComponent === 'Connexion' ? 'active' : ''}`}
                >
                    Connexion
                </button>
            </li>
            <li className="nav-item">
                <button
                    onClick={() => handleAuthSwitch('Inscription')}
                    className={`nav-link ${activeComponent === 'Inscription' ? 'active' : ''}`}
                >
                    Inscription
                </button>
            </li>
        </ul>
    );

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div>
                    <h1 className="sidebar-title">Classroom</h1>
                    <nav>
                        {sidebarContent}
                    </nav>
                </div>
                <div className="sidebar-footer">
                    © React Classroom App
                </div>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <h1 className="main-title">{user ? activeComponent : 'Bienvenue'}</h1>
                    <p className="main-subtitle">
                        {user ? `Bienvenue, ${user.name} !` : 'Veuillez vous connecter ou vous inscrire.'}
                    </p>
                </header>
                <div className="content-area">
                    {renderActiveComponent()}
                </div>
            </main>
        </div>
    );
}

export default App;
