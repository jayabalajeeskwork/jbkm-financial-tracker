
import { useEffect, useMemo, useState } from "react";

import {
  subscribeToAllExpenseEntriesForUser,
} from "../services/expenseFirestoreService";

export const useYearlyExpenses = (userId) => {
  const [allExpenseEntries, setAllExpenseEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!userId) {
      setAllExpenseEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const unsubscribe = subscribeToAllExpenseEntriesForUser({
      userId,

      onExpenseEntriesChanged: (entries) => {
        setAllExpenseEntries(entries);
        setIsLoading(false);
      },

      onLoadingError: (error) => {
        console.error("Yearly expense loading error:", error);
        setErrorMessage("Could not load yearly expenses.");
        setIsLoading(false);
      },
    });

    return unsubscribe;
  }, [userId]);

  // Calculate the latest 12 months
  const monthlyExpenses = useMemo(() => {
    const today = new Date();

    const months = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - 11 + index,
        1
      );

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");

      return {
        monthKey: `${year}-${month}`,
        monthLabel: date.toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        totalAmount: 0,
      };
    });

    const monthlyTotals = {};

    months.forEach((month) => {
      monthlyTotals[month.monthKey] = 0;
    });

    allExpenseEntries.forEach((expense) => {
      const monthKey =
        expense.monthKey || expense.expenseDate?.slice(0, 7);

      if (Object.prototype.hasOwnProperty.call(monthlyTotals, monthKey)) {
        monthlyTotals[monthKey] += Number(expense.amount) || 0;
      }
    });

    return months.map((month) => ({
      ...month,
      totalAmount: monthlyTotals[month.monthKey],
    }));
  }, [allExpenseEntries]);

  const totalYearExpense = monthlyExpenses.reduce(
    (total, month) => total + month.totalAmount,
    0
  );

  return {
    monthlyExpenses,
    totalYearExpense,
    isLoadingYearlyExpenses: isLoading,
    yearlyExpenseError: errorMessage,
  };
};
