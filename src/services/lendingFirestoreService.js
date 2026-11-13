import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firestoreDatabase } from "./firebaseConfiguration";

export const LENDING_TRANSACTION_TYPE_LENT = "lent";
export const LENDING_TRANSACTION_TYPE_REPAID = "repaid";

const buildLendingCollectionReference = (userId) =>
  collection(firestoreDatabase, "users", userId, "lendingTransactions");

export const subscribeToLendingTransactions = ({
  userId,
  onTransactionsChanged,
  onLoadingError,
}) =>
  onSnapshot(
    buildLendingCollectionReference(userId),
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

export const addLendingTransaction = async ({
  userId,
  personName,
  transactionType,
  amount,
  note,
  transactionDate,
}) => {
  await addDoc(buildLendingCollectionReference(userId), {
    personName: personName.trim(),
    transactionType,
    amount: Number(amount),
    note: note.trim(),
    transactionDate,
    createdAt: serverTimestamp(),
  });
};

export const deleteLendingTransaction = async ({
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
      "lendingTransactions",
      transactionId
    )
  );
};