import { useEffect, useState } from "react";
import {
  addExpenseEntryToFirestore,
  deleteExpenseEntryFromFirestore,
  subscribeToExpenseEntriesForMonth,
} from "../services/expenseFirestoreService";

export const useMonthlyExpenses = (userId, selectedMonthKey) => {
  const [expenseEntriesForSelectedMonth, setExpenseEntriesForSelectedMonth] = useState([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [expenseErrorMessage, setExpenseErrorMessage] = useState("");

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
    expenseErrorMessage,
    addExpenseEntry,
    deleteExpenseEntry,
  };
};