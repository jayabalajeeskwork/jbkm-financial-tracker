
import {
  doc,
  setDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

import { firestoreDatabase } from "./firebaseConfiguration";

export const generateTelegramConnectionCode = async (userId) => {
  if (!userId) {
    throw new Error("User is not logged in.");
  }

  // Generate a unique connection code
  const connectionCode = crypto.randomUUID().replaceAll("-", "");

  // Code expires after 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const connectionDocument = doc(
    firestoreDatabase,
    "users",
    userId,
    "telegramConnectionCodes",
    connectionCode
  );

  await setDoc(connectionDocument, {
    userId,
    connectionCode,
    used: false,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  });

  return {
    connectionCode,
    expiresAt,
  };
};
