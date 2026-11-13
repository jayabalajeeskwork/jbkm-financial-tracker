
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { firestoreDatabase } from "./firebaseConfiguration";

export const WALLET_TRANSACTION_TYPE_DEPOSIT = "deposit";
export const WALLET_TRANSACTION_TYPE_WITHDRAW = "withdraw";

const buildWalletCollectionReference = (userId) =>
  collection(firestoreDatabase, "users", userId, "walletTransactions");

export const subscribeToWalletTransactions = ({
  userId,
  onTransactionsChanged,
  onLoadingError,
}) =>
  onSnapshot(
    buildWalletCollectionReference(userId),
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

export const addWalletTransaction = async ({
  userId,
  sourceName,
  transactionType,
  amount,
  note,
  transactionDate,
}) => {
  await addDoc(buildWalletCollectionReference(userId), {
    sourceName: sourceName.trim(),
    transactionType,
    amount: Number(amount),
    note: note.trim(),
    transactionDate,
    createdAt: serverTimestamp(),
  });
};

export const updateWalletTransaction = async ({
  userId,
  transactionId,
  sourceName,
  transactionType,
  amount,
  note,
  transactionDate,
}) => {
  await updateDoc(
    doc(
      firestoreDatabase,
      "users",
      userId,
      "walletTransactions",
      transactionId
    ),
    {
      sourceName: sourceName.trim(),
      transactionType,
      amount: Number(amount),
      note: note.trim(),
      transactionDate,
    }
  );
};

export const deleteWalletTransaction = async ({
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
      "walletTransactions",
      transactionId
    )
  );
};
