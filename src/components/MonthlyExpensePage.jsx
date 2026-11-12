import { useState } from "react";
import { useMonthlyExpenses } from "../hooks/useMonthlyExpenses";
import { getCurrentMonthKey } from "../utils/monthUtilities";
import {
  calculateMonthTotalAmount,
  formatAmountAsCurrency,
  groupExpensesByCategory,
} from "../utils/expenseCalculations";
import MonthSlider from "./MonthSlider";
import AddExpenseForm from "./AddExpenseForm";
import ExpenseCategoryList from "./ExpenseCategoryList";

export default function MonthlyExpensePage({ loggedInUser, onLogout }) {
  const [selectedMonthKey, setSelectedMonthKey] = useState(getCurrentMonthKey());

  const {
    expenseEntriesForSelectedMonth,
    isLoadingExpenses,
    expenseErrorMessage,
    addExpenseEntry,
    deleteExpenseEntry,
  } = useMonthlyExpenses(loggedInUser.userId, selectedMonthKey);

  const categoryGroups = groupExpensesByCategory(expenseEntriesForSelectedMonth);
  const monthTotalAmount = calculateMonthTotalAmount(expenseEntriesForSelectedMonth);
  const existingCategoryNames = categoryGroups.map((categoryGroup) => categoryGroup.categoryName);

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Hello, {loggedInUser.displayName}</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      <MonthSlider selectedMonthKey={selectedMonthKey} onMonthChange={setSelectedMonthKey} />

      <AddExpenseForm
        selectedMonthKey={selectedMonthKey}
        existingCategoryNames={existingCategoryNames}
        onAddExpense={addExpenseEntry}
      />

      {expenseErrorMessage && <p style={{ color: "crimson" }}>{expenseErrorMessage}</p>}

      <h3>Total this month: {formatAmountAsCurrency(monthTotalAmount)}</h3>

      {isLoadingExpenses ? (
        <p>Loading expenses...</p>
      ) : (
        <ExpenseCategoryList
          categoryGroups={categoryGroups}
          onDeleteExpenseEntry={deleteExpenseEntry}
        />
      )}
    </div>
  );
}