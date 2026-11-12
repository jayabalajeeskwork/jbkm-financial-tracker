import { formatAmountAsCurrency } from "../utils/expenseCalculations";
import "../styles/ExpenseCategoryList.css";

const formatEntryDateForDisplay = (expenseDate) =>
  new Date(`${expenseDate}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

export default function ExpenseCategoryList({ categoryGroups, onDeleteExpenseEntry }) {
  if (categoryGroups.length === 0) {
    return <p className="card expense-category-list__empty">No expenses added for this month yet.</p>;
  }

  return (
    <div className="expense-category-list">
      {categoryGroups.map((categoryGroup) => (
        <div className="card" key={categoryGroup.categoryName}>
          <div className="expense-category-list__header">
            <strong className="expense-category-list__name">{categoryGroup.categoryName}</strong>
            <strong className="expense-category-list__total">
              {formatAmountAsCurrency(categoryGroup.categoryTotalAmount)}
            </strong>
          </div>

          <ul className="expense-category-list__entries">
            {categoryGroup.categoryEntries.map((expenseEntry) => (
              <li className="expense-category-list__entry" key={expenseEntry.expenseEntryId}>
                <span className="expense-category-list__date">
                  {formatEntryDateForDisplay(expenseEntry.expenseDate)}
                </span>
                <span className="expense-category-list__entry-right">
                  <span className="expense-category-list__amount">
                    {formatAmountAsCurrency(expenseEntry.amount)}
                  </span>
                  <button
                    className="expense-category-list__delete-button"
                    aria-label={`Delete ${categoryGroup.categoryName} expense`}
                    onClick={() => onDeleteExpenseEntry(expenseEntry.expenseEntryId)}
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}