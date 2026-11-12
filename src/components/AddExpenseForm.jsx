import { useEffect, useState } from "react";
import {
  getDefaultExpenseDateForMonth,
  getFirstDateOfMonth,
  getMaximumSelectableDateForMonth,
} from "../utils/monthUtilities";

export default function AddExpenseForm({
  selectedMonthKey,
  existingCategoryNames,
  onAddExpense,
}) {
  const [categoryNameInput, setCategoryNameInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [expenseDateInput, setExpenseDateInput] = useState(
    getDefaultExpenseDateForMonth(selectedMonthKey)
  );
  const [formErrorMessage, setFormErrorMessage] = useState("");

  // When the month changes, reset the date to a valid date inside that month
  useEffect(() => {
    setExpenseDateInput(getDefaultExpenseDateForMonth(selectedMonthKey));
    setFormErrorMessage("");
  }, [selectedMonthKey]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedCategoryName = categoryNameInput.trim();
    const parsedAmount = Number(amountInput);

    if (!trimmedCategoryName) {
      setFormErrorMessage("Enter a category name, for example Food");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setFormErrorMessage("Enter an amount greater than 0");
      return;
    }
    if (
      expenseDateInput < getFirstDateOfMonth(selectedMonthKey) ||
      expenseDateInput > getMaximumSelectableDateForMonth(selectedMonthKey)
    ) {
      setFormErrorMessage("Date must be inside the selected month and not in the future");
      return;
    }

    onAddExpense({
      monthKey: selectedMonthKey,
      categoryName: trimmedCategoryName,
      amount: parsedAmount,
      expenseDate: expenseDateInput,
    });

    setCategoryNameInput("");
    setAmountInput("");
    setFormErrorMessage("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: "24px 0" }}>
      {existingCategoryNames.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <small>Existing categories: </small>
          {existingCategoryNames.map((existingCategoryName) => (
            <button
              type="button"
              key={existingCategoryName}
              onClick={() => setCategoryNameInput(existingCategoryName)}
              style={{ marginRight: 6 }}
            >
              {existingCategoryName}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          list="existing-category-suggestions"
          placeholder="Category (e.g. Food)"
          value={categoryNameInput}
          onChange={(event) => setCategoryNameInput(event.target.value)}
        />
        <datalist id="existing-category-suggestions">
          {existingCategoryNames.map((existingCategoryName) => (
            <option key={existingCategoryName} value={existingCategoryName} />
          ))}
        </datalist>

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          value={amountInput}
          onChange={(event) => setAmountInput(event.target.value)}
        />

        <input
          type="date"
          value={expenseDateInput}
          min={getFirstDateOfMonth(selectedMonthKey)}
          max={getMaximumSelectableDateForMonth(selectedMonthKey)}
          onChange={(event) => setExpenseDateInput(event.target.value)}
        />

        <button type="submit">Add Expense</button>
      </div>

      {formErrorMessage && <p style={{ color: "crimson" }}>{formErrorMessage}</p>}
    </form>
  );
}