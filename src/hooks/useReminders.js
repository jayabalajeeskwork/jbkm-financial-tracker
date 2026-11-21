
import { useEffect, useMemo, useState } from "react";

import {
  subscribeToReminders,
  addReminder,
  updateReminder,
  deleteReminder,
} from "../services/reminderFirestoreService";

// Get today's date in local YYYY-MM-DD format
const getTodayDateKey = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Convert YYYY-MM-DD into a number for accurate date comparison
const getDateNumber = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);

  return Date.UTC(year, month - 1, day);
};

// Calculate how many calendar days remain
const getDaysUntilDeadline = (deadline, today) => {
  const deadlineNumber = getDateNumber(deadline);
  const todayNumber = getDateNumber(today);

  return Math.round(
    (deadlineNumber - todayNumber) / (1000 * 60 * 60 * 24),
  );
};

// Check whether a reminder has expired
const isReminderExpired = (reminder, today) => {
  return reminder.deadline < today;
};

// Sort reminders by earliest deadline first
const sortByDeadline = (reminders) => {
  return [...reminders].sort((first, second) => {
    const deadlineDifference = first.deadline.localeCompare(
      second.deadline,
    );

    if (deadlineDifference !== 0) {
      return deadlineDifference;
    }

    // If deadlines match, show recently created reminders first
    const firstCreated = first.createdAt?.toMillis?.() || 0;
    const secondCreated = second.createdAt?.toMillis?.() || 0;

    return secondCreated - firstCreated;
  });
};

export default function useReminders(userId) {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Listen for real-time reminder changes from Firestore
  useEffect(() => {
    if (!userId) {
      setReminders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const unsubscribe = subscribeToReminders(
      userId,
      (reminderList) => {
        setReminders(reminderList);
        setIsLoading(false);
      },
      (error) => {
        setErrorMessage("Unable to load reminders. Please try again.");
        setIsLoading(false);
        console.error(error);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  // Calculate active, expired and urgent reminders
const [today, setToday] = useState(getTodayDateKey());

useEffect(() => {
  const intervalId = setInterval(() => {
    setToday(getTodayDateKey());
  }, 60000);

  return () => clearInterval(intervalId);
}, []);

  const activeReminders = useMemo(() => {
    return sortByDeadline(
      reminders.filter(
        (reminder) => !isReminderExpired(reminder, today),
      ),
    );
  }, [reminders, today]);

  const expiredReminders = useMemo(() => {
    return sortByDeadline(
      reminders.filter(
        (reminder) => isReminderExpired(reminder, today),
      ),
    );
  }, [reminders, today]);

  // Reminders with deadlines within the next five days
  const urgentReminders = useMemo(() => {
    return activeReminders.filter((reminder) => {
      const daysRemaining = getDaysUntilDeadline(
        reminder.deadline,
        today,
      );

      return daysRemaining >= 0 && daysRemaining <= 5;
    });
  }, [activeReminders, today]);

  // Total money needed for active reminders only
  const totalMoneyNeeded = useMemo(() => {
    return activeReminders.reduce((total, reminder) => {
      return total + Number(reminder.moneyNeeded || 0);
    }, 0);
  }, [activeReminders]);

  // Add a new reminder
  const saveNewReminder = async (reminderDetails) => {
    try {
      setErrorMessage("");

      return await addReminder(userId, reminderDetails);
    } catch (error) {
      setErrorMessage(error.message || "Unable to add reminder.");
      throw error;
    }
  };

  // Edit an existing reminder
  const editReminder = async (reminderId, reminderDetails) => {
    try {
      setErrorMessage("");

      return await updateReminder(
        userId,
        reminderId,
        reminderDetails,
      );
    } catch (error) {
      setErrorMessage(error.message || "Unable to update reminder.");
      throw error;
    }
  };

  // Delete a reminder
  const removeReminder = async (reminderId) => {
    try {
      setErrorMessage("");

      return await deleteReminder(userId, reminderId);
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete reminder.");
      throw error;
    }
  };

  return {
    reminders,
    activeReminders,
    expiredReminders,
    urgentReminders,
    totalMoneyNeeded,
    isLoading,
    errorMessage,

    saveNewReminder,
    editReminder,
    removeReminder,

    getDaysUntilDeadline: (deadline) =>
      getDaysUntilDeadline(deadline, today),
  };
}
