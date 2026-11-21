
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

// Use the same Firestore import path as reminderFirestoreService.js
import { firestoreDatabase } from "./firebaseConfiguration";


const getNotificationDocument = (userId) => {
  return doc(
    firestoreDatabase,
    "users",
    userId,
    "settings",
    "notifications"
  );
};

// Get notification settings
export const getNotificationSettings = async (userId) => {
  const settingsDocument = getNotificationDocument(userId);

  const snapshot = await getDoc(settingsDocument);

  if (!snapshot.exists()) {
    return {
      phoneNumber: "",
      telegramConnected: false,
      telegramChatId: "",
    };
  }

  return snapshot.data();
};

// Save phone number
export const savePhoneNumber = async (userId, phoneNumber) => {
  if (!userId) {
    throw new Error("User is not logged in.");
  }

  const cleanedNumber = phoneNumber.replace(/\D/g, "");

  if (!/^[6-9]\d{9}$/.test(cleanedNumber)) {
    throw new Error("Enter a valid 10-digit Indian mobile number.");
  }

  await setDoc(
    getNotificationDocument(userId),
    {
      phoneNumber: cleanedNumber,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return cleanedNumber;
};
