
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { firestoreDatabase } from "./firebaseConfiguration";

// Get the logged-in user's reminders collection
const getRemindersCollection = (userId) => {
  if (!userId || typeof userId !== "string") {
    throw new Error("Valid user ID is required.");
  }

  return collection(
    firestoreDatabase,
    "users",
    userId,
    "reminders",
  );
};

// Get one reminder document reference
const getReminderDocument = (userId, reminderId) => {
  if (!reminderId || typeof reminderId !== "string") {
    throw new Error("Valid reminder ID is required.");
  }

  return doc(
    firestoreDatabase,
    "users",
    userId,
    "reminders",
    reminderId,
  );
};

// Listen to all reminders belonging to a user
export const subscribeToReminders = (
  userId,
  callback,
  onError,
) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  return onSnapshot(
    getRemindersCollection(userId),
    (snapshot) => {
      const reminders = snapshot.docs.map((document) => ({
        reminderId: document.id,
        ...document.data(),
      }));

      callback(reminders);
    },
    (error) => {
      console.error("Reminder loading error:", error);

      if (onError) {
        onError(error);
      }
    },
  );
};

// Validate reminder details
const validateReminderDetails = (reminderDetails) => {
  if (!reminderDetails.topic?.trim()) {
    throw new Error("Reminder topic is required.");
  }

  if (!reminderDetails.category?.trim()) {
    throw new Error("Please select a category.");
  }

  if (!reminderDetails.note?.trim()) {
    throw new Error("Reminder note is required.");
  }

  if (!reminderDetails.deadline) {
    throw new Error("Deadline is required.");
  }

  if (
    !Number.isFinite(Number(reminderDetails.moneyNeeded)) ||
    Number(reminderDetails.moneyNeeded) < 0
  ) {
    throw new Error("Money needed must be a valid non-negative amount.");
  }
};

// Add a new reminder
export const addReminder = async (userId, reminderDetails) => {
  validateReminderDetails(reminderDetails);

  const remindersCollection = getRemindersCollection(userId);

  return addDoc(remindersCollection, {
    topic: reminderDetails.topic.trim(),
    category: reminderDetails.category.trim(),
    note: reminderDetails.note.trim(),

    // Store date as YYYY-MM-DD
    deadline: reminderDetails.deadline,

    // Store money as a number
    moneyNeeded: Number(reminderDetails.moneyNeeded || 0),

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Update an existing reminder
export const updateReminder = async (
  userId,
  reminderId,
  reminderDetails,
) => {
  validateReminderDetails(reminderDetails);

  const reminderReference = getReminderDocument(
    userId,
    reminderId,
  );

  return updateDoc(reminderReference, {
    topic: reminderDetails.topic.trim(),
    category: reminderDetails.category.trim(),
    note: reminderDetails.note.trim(),
    deadline: reminderDetails.deadline,
    moneyNeeded: Number(reminderDetails.moneyNeeded || 0),
    updatedAt: serverTimestamp(),
  });
};

// Delete a reminder
export const deleteReminder = async (userId, reminderId) => {
  const reminderReference = getReminderDocument(
    userId,
    reminderId,
  );

  return deleteDoc(reminderReference);
};
