import { useState } from "react";
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiUser,
  FiX,
} from "react-icons/fi";
import {
  MdAnnouncement,
  MdAssignment,
  MdClass,
  MdCreate,
  MdDocumentScanner,
  MdEmail,
  MdGroups,
  MdMessage,
  MdRateReview,
  MdSchool,
  MdSettings,
  MdTask,
} from "react-icons/md";
import "./App.css";

// Import des composants
import AnnouncementList from "./components/AnnouncementList";
import AssignTask from "./components/AssignTask";
import ClassList from "./components/ClassList";
import CreateAnnouncement from "./components/CreateAnnouncement";
import CreateClass from "./components/CreateClass";
import CreateProject from "./components/CreateProject";
import DocumentationList from "./components/DocumentationList";
import JoinClass from "./components/JoinClass";
import Login from "./components/Login";
import MySubmissions from "./components/MySubmissions";
import PrivateMessageList from "./components/PrivateMessageList";
import ProjectList from "./components/ProjectList";
import PublicMessageList from "./components/PublicMessageList";
import Register from "./components/Register";
import SendMessage from "./components/SendMessage";
import ShareDocumentation from "./components/ShareDocumentation";
import SubmissionReview from "./components/SubmissionReview";
import TaskList from "./components/TaskList";
import UserManagement from "./components/UserManagement";

// Configuration des menus par rôle avec icônes
const menuConfig = {
  Professeur: [
    { name: "Liste des Classes", component: ClassList, icon: <MdClass /> },
    { name: "Créer une Classe", component: CreateClass, icon: <MdCreate /> },
    {
      name: "Créer une Annonce",
      component: CreateAnnouncement,
      icon: <MdAnnouncement />,
    },
    {
      name: "Liste des Annonces",
      component: AnnouncementList,
      icon: <MdAnnouncement />,
    },
    {
      name: "Partager un Document",
      component: ShareDocumentation,
      icon: <MdDocumentScanner />,
    },
    {
      name: "Liste des Documents",
      component: DocumentationList,
      icon: <MdDocumentScanner />,
    },
    {
      name: "Attribuer une Tâche",
      component: AssignTask,
      icon: <MdAssignment />,
    },
    { name: "Liste des Tâches", component: TaskList, icon: <MdTask /> },
    {
      name: "Corriger les Soumissions",
      component: SubmissionReview,
      icon: <MdRateReview />,
    },
    { name: "Envoyer un Message", component: SendMessage, icon: <MdEmail /> },
    {
      name: "Messages Publics",
      component: PublicMessageList,
      icon: <MdMessage />,
    },
    {
      name: "Messages Privés",
      component: PrivateMessageList,
      icon: <MdEmail />,
    },
    { name: "Créer un Projet", component: CreateProject, icon: <MdCreate /> },
    { name: "Liste des Projets", component: ProjectList, icon: <MdGroups /> },
  ],
  Étudiant: [
    { name: "Mes Classes", component: ClassList, icon: <MdClass /> },
    { name: "Rejoindre une Classe", component: JoinClass, icon: <MdSchool /> },
    {
      name: "Liste des Annonces",
      component: AnnouncementList,
      icon: <MdAnnouncement />,
    },
    {
      name: "Liste des Documents",
      component: DocumentationList,
      icon: <MdDocumentScanner />,
    },
    { name: "Liste des Tâches", component: TaskList, icon: <MdTask /> },
    {
      name: "Mes Soumissions",
      component: MySubmissions,
      icon: <MdAssignment />,
    },
    { name: "Envoyer un Message", component: SendMessage, icon: <MdEmail /> },
    {
      name: "Messages Publics",
      component: PublicMessageList,
      icon: <MdMessage />,
    },
    {
      name: "Messages Privés",
      component: PrivateMessageList,
      icon: <MdEmail />,
    },
    { name: "Liste des Projets", component: ProjectList, icon: <MdGroups /> },
  ],
  Coordinateur: [
    {
      name: "Gestion des Utilisateurs",
      component: UserManagement,
      icon: <MdSettings />,
    },
    { name: "Liste des Classes", component: ClassList, icon: <MdClass /> },
    { name: "Créer une Classe", component: CreateClass, icon: <MdCreate /> },
    {
      name: "Liste des Annonces",
      component: AnnouncementList,
      icon: <MdAnnouncement />,
    },
    {
      name: "Liste des Documents",
      component: DocumentationList,
      icon: <MdDocumentScanner />,
    },
    { name: "Liste des Tâches", component: TaskList, icon: <MdTask /> },
    { name: "Liste des Projets", component: ProjectList, icon: <MdGroups /> },
    {
      name: "Messages Publics",
      component: PublicMessageList,
      icon: <MdMessage />,
    },
    {
      name: "Messages Privés",
      component: PrivateMessageList,
      icon: <MdEmail />,
    },
  ],
};

function App() {
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState("Connexion");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    const defaultComponents = {
      Professeur: "Liste des Annonces",
      Étudiant: "Liste des Annonces",
      Coordinateur: "Gestion des Utilisateurs",
    };
    setActiveComponent(
      defaultComponents[userData.role] || "Liste des Annonces"
    );
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveComponent("Connexion");
    setMobileMenuOpen(false);
  };

  const renderActiveComponent = () => {
    if (!user) {
      switch (activeComponent) {
        case "Connexion":
          return <Login onLoginSuccess={handleLoginSuccess} />;
        case "Inscription":
          return (
            <Register onAuthSwitch={() => setActiveComponent("Connexion")} />
          );
        default:
          return (
            <div className="auth-required">
              <h2>Authentification requise</h2>
              <p>Veuillez vous connecter pour accéder à l'application.</p>
            </div>
          );
      }
    }

    const currentMenu = menuConfig[user.role] || [];
    const menuItem = currentMenu.find((item) => item.name === activeComponent);

    if (!menuItem) {
      return (
        <div className="component-not-found">
          <h2>Composant non disponible</h2>
          <p>Cette fonctionnalité n'est pas accessible avec votre rôle.</p>
        </div>
      );
    }

    const Component = menuItem.component;
    return <Component user={user} />;
  };

  return (
    <div className="app-container">
      {/* Sidebar Desktop */}
      <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <h1>Classroom</h1>
          <button
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            <FiX />
          </button>
        </div>

        <div className="sidebar-content">
          {user ? (
            <>
              <div className="user-profile">
                <div className="avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{user.name}</h3>
                  <span className="role-badge">{user.role}</span>
                </div>
              </div>

              <nav>
                <ul>
                  {menuConfig[user.role].map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => {
                          setActiveComponent(item.name);
                          setMobileMenuOpen(false);
                        }}
                        className={
                          activeComponent === item.name ? "active" : ""
                        }
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <nav>
              <ul>
                <li>
                  <button
                    onClick={() => setActiveComponent("Connexion")}
                    className={activeComponent === "Connexion" ? "active" : ""}
                  >
                    <FiUser />
                    <span>Connexion</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveComponent("Inscription")}
                    className={
                      activeComponent === "Inscription" ? "active" : ""
                    }
                  >
                    <FiUser />
                    <span>Inscription</span>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>

        <div className="sidebar-footer">
          © {new Date().getFullYear()} Classroom App
        </div>
      </aside>

      {/* Overlay Mobile */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Top Navigation */}
        <header className="app-header">
          <div className="header-left">
            <button
              className="menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FiMenu className="menu-icon" />
            </button>

            <div className="breadcrumb">
              <span className="app-name">Classroom</span>
              {user && (
                <>
                  <span className="divider">/</span>
                  <span className="current-page">{activeComponent}</span>
                </>
              )}
            </div>
          </div>

          <div className="header-right">
            {user ? (
              <>
                <div className="search-bar">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="search-input"
                  />
                </div>

                <button className="notification-btn">
                  <FiBell className="notification-icon" />
                  <span className="notification-badge">3</span>
                </button>

                <div className="user-dropdown">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role">{user.role}</span>
                  </div>
                  <FiChevronDown className="dropdown-arrow" />

                  <div className="dropdown-menu">
                    <button className="dropdown-item">
                      <FiUser className="item-icon" />
                      <span>Mon profil</span>
                    </button>
                    <button
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <FiLogOut className="item-icon" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <button
                  onClick={() => setActiveComponent("Connexion")}
                  className={`auth-btn login-btn ${
                    activeComponent === "Connexion" ? "active" : ""
                  }`}
                >
                  Connexion
                </button>
                <button
                  onClick={() => setActiveComponent("Inscription")}
                  className={`auth-btn register-btn ${
                    activeComponent === "Inscription" ? "active" : ""
                  }`}
                >
                  Inscription
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {user && (
            <div className="welcome-banner">
              <h2 className="welcome-title">
                Bon retour, <span className="user-name">{user.name}</span> !
              </h2>
              <p className="welcome-subtitle">
                Vous êtes connecté en tant que{" "}
                <span className="user-role">{user.role.toLowerCase()}</span>.
                Dernière connexion : Aujourd'hui à{" "}
                {new Date().toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}

          <div className="component-container">{renderActiveComponent()}</div>
        </div>
      </main>
    </div>
  );
}

export default App;
