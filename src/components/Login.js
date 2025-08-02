import axios from "axios";
import { useState } from "react";
import "./Login.css";

function Login({ onLoginSuccess, onAuthSwitch }) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        motDePasse,
      });
      setMessage(response.data.message);
      localStorage.setItem("token", response.data.token);

      if (onLoginSuccess && response.data.user) {
        onLoginSuccess(response.data.user);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Erreur lors de la connexion."
      );
      console.error(
        "Erreur connexion :",
        error.response?.data || error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Connexion</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse email"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Mot de passe"
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {message && (
          <p
            className={`message-info ${
              message.includes("Erreur") ? "error" : "success"
            }`}
          >
            {message}
          </p>
        )}

        <div className="auth-switch">
          <p>Pas encore de compte ?</p>
          <button
            type="button"
            onClick={() => onAuthSwitch("Inscription")}
            className="switch-button"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
