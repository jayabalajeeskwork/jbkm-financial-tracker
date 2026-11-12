import { useEffect, useState } from "react";
import {
  getDefaultExpenseDateForMonth,
  getFirstDateOfMonth,
  getMaximumSelectableDateForMonth,
} from "../utils/monthUtilities";
import "../styles/AddExpenseForm.css";

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
    <form className="card add-expense-form" onSubmit={handleSubmit}>
      <h3 className="add-expense-form__title">Add expense</h3>

      {existingCategoryNames.length > 0 && (
        <div className="add-expense-form__chip-list">
          <span className="add-expense-form__chip-label">Tap to reuse:</span>
          {existingCategoryNames.map((existingCategoryName) => (
            <button
              type="button"
              className="add-expense-form__chip"
              key={existingCategoryName}
              onClick={() => setCategoryNameInput(existingCategoryName)}
            >
              {existingCategoryName}
            </button>
          ))}
        </div>
      )}

      <div className="add-expense-form__fields">
        <input
          className="text-input"
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
          className="text-input"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="Amount"
          value={amountInput}
          onChange={(event) => setAmountInput(event.target.value)}
        />

        <input
          className="text-input"
          type="date"
          value={expenseDateInput}
          min={getFirstDateOfMonth(selectedMonthKey)}
          max={getMaximumSelectableDateForMonth(selectedMonthKey)}
          onChange={(event) => setExpenseDateInput(event.target.value)}
        />

        <button className="button" type="submit">
          Add
        </button>
      </div>

      {formErrorMessage && <p className="error-message">{formErrorMessage}</p>}
    </form>
  );
}