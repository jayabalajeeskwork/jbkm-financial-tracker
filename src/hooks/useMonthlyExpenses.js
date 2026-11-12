import { useEffect, useState } from "react";
import {
  addExpenseEntryToFirestore,
  deleteExpenseEntryFromFirestore,
  subscribeToExpenseEntriesForMonth,
  subscribeToAllExpenseEntriesForUser,
} from "../services/expenseFirestoreService";

export const useMonthlyExpenses = (userId, selectedMonthKey) => {
  const [expenseEntriesForSelectedMonth, setExpenseEntriesForSelectedMonth] = useState([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [expenseErrorMessage, setExpenseErrorMessage] = useState("");
const [allExpenseEntries, setAllExpenseEntries] = useState([]);
  useEffect(() => {
    setIsLoadingExpenses(true);

    const unsubscribeFromExpenseEntries = subscribeToExpenseEntriesForMonth({
      userId,
      monthKey: selectedMonthKey,
      onExpenseEntriesChanged: (expenseEntries) => {
        setExpenseEntriesForSelectedMonth(expenseEntries);
        setIsLoadingExpenses(false);
      },
      onLoadingError: (error) => {
        console.error(error);
        setExpenseErrorMessage("Could not load expenses");
        setIsLoadingExpenses(false);
      },
    });

    return unsubscribeFromExpenseEntries;
  }, [userId, selectedMonthKey]);

// All months
useEffect(() => {
  if (!userId) return;

  return subscribeToAllExpenseEntriesForUser({
    userId,
    onExpenseEntriesChanged: setAllExpenseEntries,
    onLoadingError: (error) => {
      console.error(error);
      setExpenseErrorMessage("Could not load all expenses");
    },
  });
}, [userId]);

// Selected month
useEffect(() => {
  if (!userId) return;

  setIsLoadingExpenses(true);

  return subscribeToExpenseEntriesForMonth({
    userId,
    monthKey: selectedMonthKey,
    onExpenseEntriesChanged: (entries) => {
      setExpenseEntriesForSelectedMonth(entries);
      setIsLoadingExpenses(false);
    },
    onLoadingError: (error) => {
      console.error(error);
      setExpenseErrorMessage("Could not load expenses");
      setIsLoadingExpenses(false);
    },
  });
}, [userId, selectedMonthKey]);
  const addExpenseEntry = async (newExpenseDetails) => {
    try {
      setExpenseErrorMessage("");
      await addExpenseEntryToFirestore({ userId, ...newExpenseDetails });
    } catch (error) {
      console.error(error);
      setExpenseErrorMessage("Could not save the expense. Try again.");
    }
  };

  const deleteExpenseEntry = async (expenseEntryId) => {
    try {
      setExpenseErrorMessage("");
      await deleteExpenseEntryFromFirestore({ userId, expenseEntryId });
    } catch (error) {
      console.error(error);
      setExpenseErrorMessage("Could not delete the expense. Try again.");
    }
  };

  return {
    expenseEntriesForSelectedMonth,
    isLoadingExpenses,
     allExpenseEntries,
    expenseErrorMessage,
    addExpenseEntry,
    deleteExpenseEntry,
  };
};