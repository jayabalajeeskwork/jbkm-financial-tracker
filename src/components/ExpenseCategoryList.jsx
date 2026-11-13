
import { formatAmountAsCurrency } from "../utils/expenseCalculations";
import "../styles/ExpenseCategoryList.css";

const formatEntryDateForDisplay = (expenseDate) =>
  new Date(`${expenseDate}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

export default function ExpenseCategoryList({
  categoryGroups,
  onDeleteExpenseEntry,
}) {
  // Total entries in the selected month
  const totalEntries = categoryGroups.reduce(
    (total, group) => total + group.categoryEntries.length,
    0
  );

  if (categoryGroups.length === 0) {
    return (
      <p className="card expense-category-list__empty">
        No expenses added for this month yet.
      </p>
    );
  }

  return (
    <div className="expense-category-list">

      {/* Overall entry count */}
      <div className="expense-category-list__summary">
        <strong>Expense Categories{" "}<span>
          {totalEntries}{" "}
          {totalEntries === 1 ? "Entry" : "Entries"}
        </span></strong>

        
      </div>
      <br/>

      {categoryGroups.map((categoryGroup) => (
        <details
          className="card expense-category-list__category"
          key={categoryGroup.categoryName}
        >
          {/* Category heading */}
          <summary className="expense-category-list__header">

            <div className="expense-category-list__header-left">
              <strong className="expense-category-list__name">
                {categoryGroup.categoryName}
              </strong>

              <span className="expense-category-list__count">
                {categoryGroup.categoryEntries.length}{" "}
                {categoryGroup.categoryEntries.length === 1
                  ? "Entry"
                  : "Entries"}
              </span>
            </div>

            <div className="expense-category-list__header-right">
              <strong className="expense-category-list__total">
                {formatAmountAsCurrency(
                  categoryGroup.categoryTotalAmount
                )}
              </strong>

              <span className="expense-category-list__arrow">
                ▼
              </span>
            </div>

          </summary>

          {/* Dropdown entries */}
          <ul className="expense-category-list__entries">

            {categoryGroup.categoryEntries.map((expenseEntry) => (
              <li
                className="expense-category-list__entry"
                key={expenseEntry.expenseEntryId}
              >
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
                    onClick={() =>
                      onDeleteExpenseEntry(expenseEntry.expenseEntryId)
                    }
                  >
                    ✕
                  </button>

                </span>
              </li>
            ))}

          </ul>

        </details>
      ))}

    </div>
  );
}
