import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuthentication } from "../services/firebaseConfiguration";

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
        enteredPassword,
      );
      // App.jsx detects the login automatically
    } catch (error) {
      setLoginErrorMessage("Wrong email or password");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <form
      onSubmit={handleLoginSubmit}
      style={{ maxWidth: 320, margin: "80px auto" }}
    >
      <h2>Financial Tracker</h2>
      <input
        type="email"
        placeholder="Email"
        value={enteredEmail}
        onChange={(event) => setEnteredEmail(event.target.value)}
        style={{ display: "block", width: "100%", marginBottom: 8 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={enteredPassword}
        onChange={(event) => setEnteredPassword(event.target.value)}
        style={{ display: "block", width: "100%", marginBottom: 8 }}
      />
      {loginErrorMessage && (
        <p style={{ color: "crimson" }}>{loginErrorMessage}</p>
      )}
      <button type="submit" disabled={isLoggingIn}>
        {isLoggingIn ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
