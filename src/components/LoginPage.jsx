import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuthentication } from "../services/firebaseConfiguration";
import "../styles/LoginPage.css";

const friendlyMessageByErrorCode = {
  "auth/invalid-credential": "Wrong email or password",
  "auth/invalid-email": "The email format is not valid",
  "auth/user-disabled": "This user is disabled",
  "auth/too-many-requests":
    "Too many attempts. Wait a few minutes and try again",
  "auth/network-request-failed":
    "Network problem. Check your internet connection",
};

const pricingOptions = [
  {
    title: "Daily Review",
    duration: "Per Day",
    price: "₹1000",
    description:
      "Not the complete working project. Live website for project review and interview preparation purposes only. ",
  },
  {
    title: "College Project",
    duration: "3 Months",
    price: "₹6,000",
    description:
      "Project without source code. Only for managing your project reviews.",
    extra: "Documentation: +₹1,000",
  },
  {
    title: "College Project",
    duration: "6 Months",
    price: "12,000",
    description: "Only important code files. Not the complete project. Only for managing your project reviews.",
    extra: "Documentation: +₹500",
  },
  {
    title: "Complete Project",
    duration: "No fixed duration",
    price: "₹10,000",
    description: "Complete project with all source code.",
  },
  {
    title: "Project + Documentation",
    duration: "Complete Package",
    price: "₹10,500",
    description: "Complete project with documentation.",
  },
  {
    title: "Project + Demo + Documentation",
    duration: "Complete Package",
    price: "₹11,500",
    description: "Complete project, project demonstration and documentation.",
  },
  {
    title: "Project with Changes",
    duration: "Custom",
    price: "₹12,000",
    description: "Complete project with requested modifications.",
    extra: "Additional changes: ₹1,000 per change.",
  },
];

export default function LoginPage() {
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

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
    } catch (error) {
      console.error("Login error:", error.code);
      setLoginErrorMessage(
        friendlyMessageByErrorCode[error.code] || `Login failed: ${error.code}`,
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        {/* LOGIN */}
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
            required
          />

          <input
            className="text-input"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={enteredPassword}
            onChange={(event) => setEnteredPassword(event.target.value)}
            required
          />

          {loginErrorMessage && (
            <p className="error-message">{loginErrorMessage}</p>
          )}

          <button className="button" type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* DEMO CREDENTIALS */}
        <div className="info-section">
          <button
            className="demo-toggle"
            type="button"
            onClick={() => setShowDemoCredentials(!showDemoCredentials)}
          >
            <span>Demo Credentials</span>
            <span>{showDemoCredentials ? "−" : "+"}</span>
          </button>

          {showDemoCredentials && (
            <div className="demo-details">
              <p>
                <strong>jbd301002@gmail.com</strong>
              </p>
              <p>
                <strong>JBDemo@123</strong>
              </p>
            </div>
          )}
        </div>

        {/* PRICING */}
        <section className="pricing-section">
          <h2>Project Pricing & Services</h2>
          <p className="pricing-subtitle">
            Available project services and pricing details
          </p>

          <div className="pricing-grid">
            {pricingOptions.map((option, index) => (
              <div className="pricing-card" key={index}>
                <h3>{option.title}</h3>
                <span className="pricing-duration">{option.duration}</span>

                <h2>{option.price}</h2>

                <p>{option.description}</p>

                {option.extra && (
                  <p className="pricing-extra">{option.extra}</p>
                )}
              </div>
            ))}
          </div>

          <p className="pricing-note">
            Note: Modifications pricing may vary by ₹500–₹1,000 depending on project duration,
            requirements and requested modifications.
          </p>
        </section>

        {/* CONTACT */}
<div className="contact-section">
  <h3>For More Details & Enquiries</h3>
  <p>Contact us through email</p>
  <a href="mailto:work.jayabalajeesk@gmail.com">
    work.jayabalajeesk@gmail.com
  </a>
</div>
      </div>
    </div>
  );
}
