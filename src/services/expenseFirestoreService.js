import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { firestoreDatabase } from "./firebaseConfiguration";

const buildExpenseEntriesCollectionReference = (userId) =>
  collection(firestoreDatabase, "users", userId, "expenseEntries");

// Live listener: updates automatically whenever data changes
export const subscribeToExpenseEntriesForMonth = ({
  userId,
  monthKey,
  onExpenseEntriesChanged,
  onLoadingError,
}) => {
  const expenseEntriesQuery = query(
    buildExpenseEntriesCollectionReference(userId),
    where("monthKey", "==", monthKey)
  );

  return onSnapshot(
    expenseEntriesQuery,
    (querySnapshot) => {
      const expenseEntries = querySnapshot.docs.map((documentSnapshot) => ({
        expenseEntryId: documentSnapshot.id,
        ...documentSnapshot.data(),
      }));
      onExpenseEntriesChanged(expenseEntries);
    },
    onLoadingError
  );
};

export const addExpenseEntryToFirestore = async ({
  userId,
  monthKey,
  categoryName,
  amount,
  expenseDate,
}) => {
  await addDoc(buildExpenseEntriesCollectionReference(userId), {
    monthKey,
    categoryName: categoryName.trim(),
    amount: Number(amount),
    expenseDate,
    createdAt: serverTimestamp(),
  });
};

export const deleteExpenseEntryFromFirestore = async ({ userId, expenseEntryId }) => {
  await deleteDoc(doc(firestoreDatabase, "users", userId, "expenseEntries", expenseEntryId));
};