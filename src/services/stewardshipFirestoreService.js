import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { firestoreDatabase } from "./firebaseConfiguration";

export const STEWARDSHIP_TRANSACTION_TYPE_RECEIVED = "received";
export const STEWARDSHIP_TRANSACTION_TYPE_RETURNED = "returned";

const buildStewardshipCollectionReference = (userId) =>
  collection(firestoreDatabase, "users", userId, "stewardshipTransactions");

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
          // createdAt is empty for a moment right after saving, so fall back to now
          createdAtMilliseconds: documentData.createdAt?.toMillis
            ? documentData.createdAt.toMillis()
            : Date.now(),
        };
      });
      onTransactionsChanged(transactions);
    },
    onLoadingError
  );

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
    note: note.trim(),
    transactionDate,
    createdAt: serverTimestamp(),
  });
};