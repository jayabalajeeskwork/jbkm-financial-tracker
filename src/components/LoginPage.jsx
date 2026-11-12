import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuthentication } from "../services/firebaseConfiguration";
import "../styles/LoginPage.css";

const friendlyMessageByErrorCode = {
  "auth/invalid-credential": "Wrong email or password",
  "auth/invalid-email": "The email format is not valid",
  "auth/user-disabled": "This user is disabled",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again",
  "auth/network-request-failed": "Network problem. Check your internet connection",
};

export default function LoginPage() {
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginErrorMessage("");

    try {
      await signInWithEmailAndPassword(
        firebaseAuthentication,
        enteredEmail.trim(),
        enteredPassword
      );
      // App.jsx detects the login automatically
    } catch (error) {
      console.error("Login error:", error.code);
      setLoginErrorMessage(
        friendlyMessageByErrorCode[error.code] || `Login failed: ${error.code}`
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleLoginSubmit}>
        <h1 className="login-card__title">Financial Tracker</h1>
        <p className="login-card__subtitle">Login to manage your expenses</p>

        <input
          className="text-input"
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={enteredEmail}
          onChange={(event) => setEnteredEmail(event.target.value)}
        />
        <input
          className="text-input"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={enteredPassword}
          onChange={(event) => setEnteredPassword(event.target.value)}
        />

        {loginErrorMessage && <p className="error-message">{loginErrorMessage}</p>}

        <button className="button" type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}