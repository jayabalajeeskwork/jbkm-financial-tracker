import { useEffect, useState } from "react";
import {
  getNotificationSettings,
  savePhoneNumber,
} from "../services/notificationSettingsService";
import "./NotificationSettings.css";
export default function NotificationSettings({ userId }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getNotificationSettings(userId);
        setPhoneNumber(settings.phoneNumber || "");
      } catch (error) {
        setMessage(error.message || "Unable to load settings.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadSettings();
    }
  }, [userId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const savedNumber = await savePhoneNumber(userId, phoneNumber);

      setPhoneNumber(savedNumber);
      setMessage("Phone number saved successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to save phone number.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading notification settings...</p>;
  }

  return (
    <section className="notification-settings">
      <h3>Notification Settings</h3>

      <label htmlFor="notificationPhone">Mobile Number</label>

      <input
        id="notificationPhone"
        type="tel"
        value={phoneNumber}
        onChange={(event) =>
          setPhoneNumber(event.target.value.replace(/\D/g, "").slice(0, 10))
        }
        placeholder="Enter 10-digit mobile number"
        maxLength={10}
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || phoneNumber.length !== 10}
      >
        {saving ? "Saving..." : "Save Number"}
      </button>

      {message && <p>{message}</p>}
    </section>
  );
}
