
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { firestoreDatabase } from "./firebaseConfiguration";

export const STEWARDSHIP_TRANSACTION_TYPE_RECEIVED = "received";
export const STEWARDSHIP_TRANSACTION_TYPE_RETURNED = "returned";

const buildStewardshipCollectionReference = (userId) =>
  collection(firestoreDatabase, "users", userId, "stewardshipTransactions");

// Subscribe to transactions
export const subscribeToStewardshipTransactions = ({
  userId,
  onTransactionsChanged,
  onLoadingError,
}) =>
  onSnapshot(
    buildStewardshipCollectionReference(userId),
    (querySnapshot) => {
      const transactions = querySnapshot.docs.map((documentSnapshot) => {
        const documentData = documentSnapshot.data();

        return {
          transactionId: documentSnapshot.id,
          ...documentData,
          createdAtMilliseconds: documentData.createdAt?.toMillis
            ? documentData.createdAt.toMillis()
            : Date.now(),
        };
      });

      onTransactionsChanged(transactions);
    },
    onLoadingError
  );

// Add transaction
export const addStewardshipTransaction = async ({
  userId,
  personName,
  transactionType,
  amount,
  note,
  transactionDate,
}) => {
  await addDoc(buildStewardshipCollectionReference(userId), {
    personName: personName.trim(),
    transactionType,
    amount: Number(amount),
    note: (note || "").trim(),
    transactionDate,
    createdAt: serverTimestamp(),
  });
};

// Delete individual transaction
export const deleteStewardshipTransaction = async ({
  userId,
  transactionId,
}) => {
  if (!userId || !transactionId) {
    throw new Error("User ID or transaction ID is missing.");
  }

  await deleteDoc(
    doc(
      firestoreDatabase,
      "users",
      userId,
      "stewardshipTransactions",
      transactionId
    )
  );
};