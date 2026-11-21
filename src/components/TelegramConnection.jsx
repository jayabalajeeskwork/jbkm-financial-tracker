import { useState } from "react";
import { generateTelegramConnectionCode } from "../services/telegramConnectionService";
import "./TelegramConnection.css";
export default function TelegramConnection({ userId }) {
  const [connectionCode, setConnectionCode] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleConnect = async () => {
    try {
      setLoading(true);
      setMessage("");
      setConnectionCode("");

      const result = await generateTelegramConnectionCode(userId);

      setConnectionCode(result.connectionCode);
      setExpiresAt(result.expiresAt);
      setMessage("Connection code generated successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to generate connection code.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`/connect ${connectionCode}`);
      setMessage("Connection command copied.");
    } catch {
      setMessage("Unable to copy. Please copy the code manually.");
    }
  };

  return (
    <section className="telegram-connection">
      <h3>Telegram Notifications</h3>

      <p>Connect your Telegram account to receive your personal reminders.</p>

      <button
        type="button"
        onClick={handleConnect}
        disabled={loading || !userId}
      >
        {loading ? "Generating..." : "Generate Telegram Connection Code"}
      </button>

      {connectionCode && (
        <div className="telegram-code">
          <p>Your connection code:</p>

          <strong>{connectionCode}</strong>

          <button type="button" onClick={handleCopy}>
            Copy /connect command
          </button>

          <p>Expires at: {expiresAt?.toLocaleTimeString("en-IN")}</p>

          <p>Open @jbkm_deadline_tracker_bot and send:</p>

          <code>/connect {connectionCode}</code>
        </div>
      )}

      {message && <p>{message}</p>}
    </section>
  );
}
