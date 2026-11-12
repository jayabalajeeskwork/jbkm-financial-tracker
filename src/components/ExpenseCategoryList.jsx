import { formatAmountAsCurrency } from "../utils/expenseCalculations";

export default function ExpenseCategoryList({ categoryGroups, onDeleteExpenseEntry }) {
  if (categoryGroups.length === 0) {
    return <p>No expenses added for this month yet.</p>;
  }

  return (
    <div>
      {categoryGroups.map((categoryGroup) => (
        <div
          key={categoryGroup.categoryName}
          style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{categoryGroup.categoryName}</strong>
            <strong>{formatAmountAsCurrency(categoryGroup.categoryTotalAmount)}</strong>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
            {categoryGroup.categoryEntries.map((expenseEntry) => (
              <li
                key={expenseEntry.expenseEntryId}
                style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}
              >
                <span>{expenseEntry.expenseDate}</span>
                <span>
                  {formatAmountAsCurrency(expenseEntry.amount)}{" "}
                  <button onClick={() => onDeleteExpenseEntry(expenseEntry.expenseEntryId)}>
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