
import { useEffect, useState } from "react";

import {
  addInvestmentEntry as addInvestmentEntryToFirestore,
  addInvestmentValuation as addInvestmentValuationToFirestore,
  deleteInvestmentEntry as deleteInvestmentEntryFromFirestore,
  subscribeToInvestmentEntries,
  subscribeToInvestmentValuations,
} from "../services/investmentFirestoreService";

export function useInvestments(userId) {
  const [investmentEntries, setInvestmentEntries] = useState([]);
  const [investmentValuations, setInvestmentValuations] = useState([]);
  const [isLoadingInvestments, setIsLoadingInvestments] = useState(true);
  const [investmentErrorMessage, setInvestmentErrorMessage] = useState("");

  useEffect(() => {
    if (!userId) {
      setIsLoadingInvestments(false);
      return;
    }

    setIsLoadingInvestments(true);
    setInvestmentErrorMessage("");

    let entriesLoaded = false;
    let valuationsLoaded = false;

    const checkLoadingComplete = () => {
      if (entriesLoaded && valuationsLoaded) {
        setIsLoadingInvestments(false);
      }
    };

    const handleError = (error) => {
      console.error("Investment loading error:", error);
      setInvestmentErrorMessage(
        error.message || "Unable to load investments."
      );
      setIsLoadingInvestments(false);
    };

    const unsubscribeEntries = subscribeToInvestmentEntries({
      userId,
      onDataChanged: (entries) => {
        setInvestmentEntries(entries);
        entriesLoaded = true;
        checkLoadingComplete();
      },
      onError: handleError,
    });

    const unsubscribeValuations = subscribeToInvestmentValuations({
      userId,
      onDataChanged: (valuations) => {
        setInvestmentValuations(valuations);
        valuationsLoaded = true;
        checkLoadingComplete();
      },
      onError: handleError,
    });

    return () => {
      unsubscribeEntries();
      unsubscribeValuations();
    };
  }, [userId]);

 const addEntry = async (investmentData) => {
  console.log("Investment data received in hook:", investmentData);

  if (!investmentData?.investmentName) {
    throw new Error("Investment name is missing.");
  }

  await addInvestmentEntryToFirestore({
    userId,
    investmentName: investmentData.investmentName,
    purchaseAmount: investmentData.purchaseAmount,
    purchaseDate: investmentData.purchaseDate,
  });
};

  const deleteEntry = async (investmentEntryId) => {
    await deleteInvestmentEntryFromFirestore({
      userId,
      investmentEntryId,
    });
  };

  const saveValuation = async (valuationData) => {
    await addInvestmentValuationToFirestore({
      userId,
      ...valuationData,
    });
  };

  return {
    investmentEntries,
    investmentValuations,
    isLoadingInvestments,
    investmentErrorMessage,
    addEntry,
    deleteEntry,
    saveValuation,
  };
}
