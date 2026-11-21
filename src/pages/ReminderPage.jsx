import { useState } from "react";
import useReminders from "../hooks/useReminders";
import "./ReminderPage.css";
import NotificationSettings from "../components/NotificationSettings";
import TelegramConnection from "../components/TelegramConnection";

const reminderCategories = [
  "Banking Exams",
  "Railway Exams",
  "SSC Exams",
  "UPSC Exams",
  "TNPSC / State Government Exams",
  "Other Government Exams",
  "Personal",
  "Other",
];

const emptyForm = {
  topic: "",
  category: "",
  note: "",
  deadline: "",
  moneyNeeded: "0",
};

const formatDate = (dateString) => {
  if (!dateString) return "-";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (amount) => {
  return Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

export default function ReminderPage({ userId }) {
  const {
    activeReminders,
    expiredReminders,
    urgentReminders,
    totalMoneyNeeded,
    isLoading,
    errorMessage,
    saveNewReminder,
    editReminder,
    removeReminder,
    getDaysUntilDeadline,
  } = useReminders(userId);

  const [formData, setFormData] = useState(emptyForm);
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingReminderId(null);
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!formData.topic.trim()) {
      setFormError("Please enter a reminder topic.");
      return;
    }

    if (!formData.category) {
      setFormError("Please select a category.");
      return;
    }

    if (!formData.note.trim()) {
      setFormError("Please enter the reminder details.");
      return;
    }

    if (!formData.deadline) {
      setFormError("Please select a deadline.");
      return;
    }

    if (
      formData.moneyNeeded === "" ||
      !Number.isFinite(Number(formData.moneyNeeded)) ||
      Number(formData.moneyNeeded) < 0
    ) {
      setFormError("Enter a valid non-negative money amount.");
      return;
    }

    const action = editingReminderId ? "update" : "add";

    const confirmed = window.confirm(
      editingReminderId
        ? "Are you sure you want to update this reminder?"
        : "Are you sure you want to add this reminder?",
    );

    if (!confirmed) return;

    try {
      setIsSaving(true);

      if (editingReminderId) {
        await editReminder(editingReminderId, formData);
        window.alert("Reminder updated successfully.");
      } else {
        await saveNewReminder(formData);
        window.alert("Reminder added successfully.");
      }

      resetForm();
    } catch (error) {
      setFormError(error.message || `Unable to ${action} reminder.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminderId(reminder.reminderId);

    setFormData({
      topic: reminder.topic || "",
      category: reminder.category || "",
      note: reminder.note || "",
      deadline: reminder.deadline || "",
      moneyNeeded: String(reminder.moneyNeeded ?? 0),
    });

    setFormError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (reminder) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${reminder.topic}"?`,
    );

    if (!confirmed) return;

    try {
      await removeReminder(reminder.reminderId);

      if (editingReminderId === reminder.reminderId) {
        resetForm();
      }

      window.alert("Reminder deleted successfully.");
    } catch (error) {
      window.alert(error.message || "Unable to delete reminder.");
    }
  };

  const getDeadlineLabel = (deadline) => {
    const days = getDaysUntilDeadline(deadline);

    if (days === 0) return "Due today";
    if (days === 1) return "Tomorrow";
    if (days > 1) return `${days} days left`;

    return "Expired";
  };

  const renderReminder = (reminder, isExpired = false) => {
    const daysRemaining = getDaysUntilDeadline(reminder.deadline);

    return (
      <article
        className={`reminder-card ${isExpired ? "expired-card" : ""}`}
        key={reminder.reminderId}
      >
        <div className="reminder-card-header">
          <div>
            <span className="reminder-category">{reminder.category}</span>

            <h3>{reminder.topic}</h3>
          </div>

          <span
            className={`deadline-status ${
              !isExpired && daysRemaining <= 5 ? "urgent-status" : ""
            }`}
          >
            {getDeadlineLabel(reminder.deadline)}
          </span>
        </div>

        <p className="reminder-note">{reminder.note}</p>

        <div className="reminder-details">
          <div>
            <span>Deadline</span>
            <strong>{formatDate(reminder.deadline)}</strong>
          </div>

          <div>
            <span>Money needed</span>
            <strong>{formatMoney(reminder.moneyNeeded)}</strong>
          </div>
        </div>

        <div className="reminder-actions">
          <button
            type="button"
            className="edit-reminder-button"
            onClick={() => handleEdit(reminder)}
          >
            Edit
          </button>

          <button
            type="button"
            className="delete-reminder-button"
            onClick={() => handleDelete(reminder)}
          >
            Delete
          </button>
        </div>
      </article>
    );
  };

  if (isLoading) {
    return (
      <main className="reminder-page">
        <p>Loading reminders...</p>
      </main>
    );
  }

  return (
    <main className="reminder-page">
      <header className="reminder-page-header">
        <div>
          <h1>Deadline Reminders</h1>
          <p>Track your exams, applications and important deadlines.</p>
        </div>
      </header>

      <section className="reminder-summary">
        <div className="summary-card">
          <span>Active Reminders</span>
          <strong>{activeReminders.length}</strong>
        </div>

        <div className="summary-card">
          <span>Urgent Reminders</span>
          <strong>{urgentReminders.length}</strong>
        </div>

        <div className="summary-card">
          <span>Expired Reminders</span>
          <strong>{expiredReminders.length}</strong>
        </div>

        <div className="summary-card money-summary">
          <span>Total Money Needed</span>
          <strong>{formatMoney(totalMoneyNeeded)}</strong>
        </div>
      </section>
      <NotificationSettings userId={userId} />
      <TelegramConnection userId={userId} />
      <section className="reminder-form-section">
        <h2>{editingReminderId ? "Edit Reminder" : "Add New Reminder"}</h2>

        <form onSubmit={handleSubmit} className="reminder-form">
          <div className="reminder-form-group">
            <label htmlFor="topic">Reminder Topic *</label>
            <input
              id="topic"
              type="text"
              name="topic"
              placeholder="Example: SBI Clerk Application"
              value={formData.topic}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="reminder-form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select category</option>

              {reminderCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="reminder-form-group full-width">
            <label htmlFor="note">Full Details / Notes *</label>
            <textarea
              id="note"
              name="note"
              rows="4"
              placeholder="Enter exam details, application information, documents required, etc."
              value={formData.note}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="reminder-form-group">
            <label htmlFor="deadline">Deadline Date *</label>
            <input
              id="deadline"
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="reminder-form-group">
            <label htmlFor="moneyNeeded">Money Needed (₹)</label>
            <input
              id="moneyNeeded"
              type="number"
              name="moneyNeeded"
              min="0"
              step="0.01"
              placeholder="Enter 0 if no money is needed"
              value={formData.moneyNeeded}
              onChange={handleInputChange}
            />
          </div>

          {formError && (
            <p className="reminder-form-error full-width">{formError}</p>
          )}

          <div className="reminder-form-actions full-width">
            <button
              type="submit"
              className="save-reminder-button"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingReminderId
                  ? "Update Reminder"
                  : "Add Reminder"}
            </button>

            {editingReminderId && (
              <button
                type="button"
                className="cancel-reminder-button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      {errorMessage && <p className="reminder-page-error">{errorMessage}</p>}

      <section className="reminder-list-section">
        <h2>Active Reminders</h2>
        <p className="section-description">
          Sorted by the earliest deadline first.
        </p>

        {activeReminders.length === 0 ? (
          <p className="empty-reminder-message">
            No active reminders. Add your first reminder above.
          </p>
        ) : (
          <div className="reminder-list">
            {activeReminders.map((reminder) => renderReminder(reminder))}
          </div>
        )}
      </section>

      <section className="reminder-list-section expired-section">
        <h2>Expired Reminders</h2>
        <p className="section-description">
          These reminders are kept for reference. Their money is not included in
          the active total.
        </p>

        {expiredReminders.length === 0 ? (
          <p className="empty-reminder-message">No expired reminders.</p>
        ) : (
          <div className="reminder-list">
            {expiredReminders.map((reminder) => renderReminder(reminder, true))}
          </div>
        )}
      </section>
    </main>
  );
}
