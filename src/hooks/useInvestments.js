
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
    if (!userId) return;

    setIsLoadingInvestments(true);
    setInvestmentErrorMessage("");

    let entriesLoaded = false;
    let valuationsLoaded = false;

    const handleLoadingError = (error) => {
      console.error("Investment loading error:", error);
      setInvestmentErrorMessage(error.message || "Unable to load investments.");
      setIsLoadingInvestments(false);
    };

    const checkLoadingComplete = () => {
      if (entriesLoaded && valuationsLoaded) {
        setIsLoadingInvestments(false);
      }
    };

    const unsubscribeEntries = subscribeToInvestmentEntries({
      userId,
      onDataChanged: (entries) => {
        setInvestmentEntries(entries);
        entriesLoaded = true;
        checkLoadingComplete();
      },
      onError: handleLoadingError,
    });

    const unsubscribeValuations = subscribeToInvestmentValuations({
      userId,
      onDataChanged: (valuations) => {
        setInvestmentValuations(valuations);
        valuationsLoaded = true;
        checkLoadingComplete();
      },
      onError: handleLoadingError,
    });

    return () => {
      unsubscribeEntries();
      unsubscribeValuations();
    };
  }, [userId]);

  const addEntry = async (investmentData) => {
    try {
      setInvestmentErrorMessage("");

      await addInvestmentEntryToFirestore({
        userId,
        ...investmentData,
      });
    } catch (error) {
      setInvestmentErrorMessage(error.message || "Unable to add investment.");
      throw error;
    }
  };

  const deleteEntry = async (investmentEntryId) => {
    try {
      setInvestmentErrorMessage("");

      await deleteInvestmentEntryFromFirestore({
        userId,
        investmentEntryId,
      });
    } catch (error) {
      setInvestmentErrorMessage(error.message || "Unable to delete investment.");
    }
  };

  const saveValuation = async (valuationData) => {
    try {
      setInvestmentErrorMessage("");

      await addInvestmentValuationToFirestore({
        userId,
        ...valuationData,
      });
    } catch (error) {
      setInvestmentErrorMessage(error.message || "Unable to save valuation.");
      throw error;
    }
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
