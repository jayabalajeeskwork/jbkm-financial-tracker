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

  // Latest 13 calendar-month labels: same month last year through current month
  const monthlyExpenses = useMemo(() => {
    const today = new Date();

    const months = Array.from({ length: 13 }, (_, index) => {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - 12 + index,
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

  // Average monthly expense, using a 12-month average
  const averageMonthlyExpense = totalYearExpense / 12;

  // Count entries by category within the displayed date range
  const categoryExpenseSummary = useMemo(() => {
    const validMonthKeys = new Set(
      monthlyExpenses.map((month) => month.monthKey)
    );

    const categoryGroups = {};

    allExpenseEntries.forEach((expense) => {
      const monthKey =
        expense.monthKey || expense.expenseDate?.slice(0, 7);

      if (!validMonthKeys.has(monthKey)) return;

      const categoryName = expense.categoryName?.trim() || "Other";
      const categoryKey = categoryName.toLowerCase();

      if (!categoryGroups[categoryKey]) {
        categoryGroups[categoryKey] = {
          categoryName,
          totalEntries: 0,
        };
      }

      categoryGroups[categoryKey].totalEntries += 1;
    });

    return Object.values(categoryGroups).sort(
      (a, b) => b.totalEntries - a.totalEntries
    );
  }, [allExpenseEntries, monthlyExpenses]);

  return {
    monthlyExpenses,
    totalYearExpense,
    averageMonthlyExpense,
    categoryExpenseSummary,
    isLoadingYearlyExpenses: isLoading,
    yearlyExpenseError: errorMessage,
  };
};