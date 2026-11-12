
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
export const addInvestmentEntry = async (investmentData) => {
  const {
    userId,
    investmentName,
    purchaseAmount,
    purchaseDate,
  } = investmentData || {};

  if (!userId) {
    throw new Error("User ID is missing.");
  }

  if (typeof investmentName !== "string" || !investmentName.trim()) {
    throw new Error("Investment name is missing or invalid.");
  }

  if (purchaseAmount === "" || Number(purchaseAmount) <= 0) {
    throw new Error("Enter a valid purchase amount.");
  }

  await addDoc(buildInvestmentEntriesCollection(userId), {
    investmentName: investmentName.trim(),
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
export const addInvestmentValuation = async (valuationData) => {
  const {
    userId,
    investmentName,
    currentValuePerEntry,
    valuationDate,
  } = valuationData || {};

  if (!userId) {
    throw new Error("User ID is missing.");
  }

  if (typeof investmentName !== "string" || !investmentName.trim()) {
    throw new Error("Investment name is missing or invalid.");
  }

  if (
    currentValuePerEntry === "" ||
    currentValuePerEntry === undefined ||
    Number(currentValuePerEntry) <= 0
  ) {
    throw new Error("Enter a valid current value.");
  }

  await addDoc(buildInvestmentValuationsCollection(userId), {
    investmentName: investmentName.trim(),
    currentValuePerEntry: Number(currentValuePerEntry),
    valuationDate,
    createdAt: serverTimestamp(),
  });
};
