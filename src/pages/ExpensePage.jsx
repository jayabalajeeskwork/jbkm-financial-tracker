import { useState } from "react";
import { useMonthlyExpenses } from "../hooks/useMonthlyExpenses";
import { getCurrentMonthKey } from "../utils/monthUtilities";
import {
  calculateMonthTotalAmount,
  formatAmountAsCurrency,
  groupExpensesByCategory,
} from "../utils/expenseCalculations";
import MonthSlider from "../components/MonthSlider";
import AddExpenseForm from "../components/AddExpenseForm";
import ExpenseCategoryList from "../components/ExpenseCategoryList";
import "./ExpensePage.css";

export default function ExpensePage({ loggedInUser }) {
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
    <div className="page-stack">
      <MonthSlider selectedMonthKey={selectedMonthKey} onMonthChange={setSelectedMonthKey} />

      <section className="card expense-total-card">
        <p className="expense-total-card__label">Total this month</p>
        <p className="expense-total-card__amount">{formatAmountAsCurrency(monthTotalAmount)}</p>
      </section>

      <AddExpenseForm
        selectedMonthKey={selectedMonthKey}
        existingCategoryNames={existingCategoryNames}
        onAddExpense={addExpenseEntry}
      />

      {expenseErrorMessage && <p className="error-message">{expenseErrorMessage}</p>}

      {isLoadingExpenses ? (
        <p className="loading-message">Loading expenses...</p>
      ) : (
        <ExpenseCategoryList
          categoryGroups={categoryGroups}
          onDeleteExpenseEntry={deleteExpenseEntry}
        />
      )}
    </div>
  );
}