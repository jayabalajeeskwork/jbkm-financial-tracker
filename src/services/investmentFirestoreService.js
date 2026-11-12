
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { firestoreDatabase } from "./firebaseConfiguration";

const buildInvestmentEntriesCollection = (userId) =>
  collection(firestoreDatabase, "users", userId, "investmentEntries");

const buildInvestmentValuationsCollection = (userId) =>
  collection(firestoreDatabase, "users", userId, "investmentValuations");

// Subscribe to all purchases
export const subscribeToInvestmentEntries = ({
  userId,
  onDataChanged,
  onError,
}) => {
  return onSnapshot(
    buildInvestmentEntriesCollection(userId),
    (snapshot) => {
      const investmentEntries = snapshot.docs.map((item) => ({
        investmentEntryId: item.id,
        ...item.data(),
      }));

      onDataChanged(investmentEntries);
    },
    onError
  );
};

// Subscribe to all saved valuations
export const subscribeToInvestmentValuations = ({
  userId,
  onDataChanged,
  onError,
}) => {
  return onSnapshot(
    buildInvestmentValuationsCollection(userId),
    (snapshot) => {
      const valuations = snapshot.docs.map((item) => ({
        valuationId: item.id,
        ...item.data(),
      }));

      onDataChanged(valuations);
    },
    onError
  );
};

// Add a purchase
export const addInvestmentEntry = async ({
  userId,
  investmentType,
  quantity,
  unit,
  purchaseAmount,
  purchaseDate,
}) => {
  await addDoc(buildInvestmentEntriesCollection(userId), {
    investmentType: investmentType.trim(),
    quantity: Number(quantity),
    unit,
    purchaseAmount: Number(purchaseAmount),
    purchaseDate,
    createdAt: serverTimestamp(),
  });
};

// Delete a purchase
export const deleteInvestmentEntry = async ({
  userId,
  investmentEntryId,
}) => {
  await deleteDoc(
    doc(
      firestoreDatabase,
      "users",
      userId,
      "investmentEntries",
      investmentEntryId
    )
  );
};

// Save a new valuation. Each update is preserved as history.
export const addInvestmentValuation = async ({
  userId,
  investmentType,
  currentValue,
  valuationDate,
}) => {
  await addDoc(buildInvestmentValuationsCollection(userId), {
    investmentType: investmentType.trim(),
    currentValue: Number(currentValue),
    valuationDate,
    createdAt: serverTimestamp(),
  });
};
