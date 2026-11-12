
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

// Common collection reference for a particular user
const buildExpenseEntriesCollectionReference = (userId) =>
  collection(firestoreDatabase, "users", userId, "expenseEntries");


// 1. Get ALL expenses for the user (all months)
// Used for reusable category suggestions
export const subscribeToAllExpenseEntriesForUser = ({
  userId,
  onExpenseEntriesChanged,
  onLoadingError,
}) => {
  const allExpensesQuery = query(
    buildExpenseEntriesCollectionReference(userId)
  );

  return onSnapshot(
    allExpensesQuery,
    (snapshot) => {
      const expenseEntries = snapshot.docs.map((document) => ({
        expenseEntryId: document.id,
        ...document.data(),
      }));

      onExpenseEntriesChanged(expenseEntries);
    },
    onLoadingError
  );
};


// 2. Get expenses for the selected month only
// Used for monthly expense list and total
export const subscribeToExpenseEntriesForMonth = ({
  userId,
  monthKey,
  onExpenseEntriesChanged,
  onLoadingError,
}) => {
  const monthlyExpensesQuery = query(
    buildExpenseEntriesCollectionReference(userId),
    where("monthKey", "==", monthKey)
  );

  return onSnapshot(
    monthlyExpensesQuery,
    (snapshot) => {
      const expenseEntries = snapshot.docs.map((document) => ({
        expenseEntryId: document.id,
        ...document.data(),
      }));

      onExpenseEntriesChanged(expenseEntries);
    },
    onLoadingError
  );
};


// 3. Add a new expense
export const addExpenseEntryToFirestore = async ({
  userId,
  monthKey,
  categoryName,
  amount,
  expenseDate,
}) => {
  await addDoc(
    buildExpenseEntriesCollectionReference(userId),
    {
      monthKey,
      categoryName: categoryName.trim(),
      amount: Number(amount),
      expenseDate,
      createdAt: serverTimestamp(),
    }
  );
};


// 4. Delete an expense
export const deleteExpenseEntryFromFirestore = async ({
  userId,
  expenseEntryId,
}) => {
  await deleteDoc(
    doc(
      firestoreDatabase,
      "users",
      userId,
      "expenseEntries",
      expenseEntryId
    )
  );
};
