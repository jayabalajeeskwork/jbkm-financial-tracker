import { useYearlyExpenses } from "../hooks/useYearlyExpenses";
import { formatMoneyAmount } from "../utils/personBalanceCalculations";

import "./YearlyExpenseChart.css";

export default function YearlyExpenseChart({ userId }) {
  const {
    monthlyExpenses,
    totalYearExpense,
    averageMonthlyExpense,
    categoryExpenseSummary,
    isLoadingYearlyExpenses,
    yearlyExpenseError,
  } = useYearlyExpenses(userId);

  const highestExpense = Math.max(
    ...monthlyExpenses.map((month) => month.totalAmount),
    0
  );

  if (isLoadingYearlyExpenses) {
    return (
      <section className="card yearly-expense-chart">
        <h2>Yearly Expenses</h2>
        <p>Loading expense chart...</p>
      </section>
    );
  }

  if (yearlyExpenseError) {
    return (
      <section className="card yearly-expense-chart">
        <h2>Yearly Expenses</h2>
        <p className="error-message">{yearlyExpenseError}</p>
      </section>
    );
  }

  const firstMonth = monthlyExpenses[0]?.monthKey;
  const lastMonth = monthlyExpenses[monthlyExpenses.length - 1]?.monthKey;

  const formatMonthRange = (monthKey) => {
    if (!monthKey) return "";

    return new Date(`${monthKey}-01T00:00:00`).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  const expensePeriodLabel = `${formatMonthRange(firstMonth)} to ${formatMonthRange(lastMonth)}`;

  return (
    <>
      {/* Yearly Expense Chart */}
      <section className="card yearly-expense-chart">
        <div className="yearly-expense-chart__header">
          <div>
            <h2>Yearly Expenses</h2>
            <p>Monthly spending – {expensePeriodLabel}</p>
          </div>

          <div className="yearly-expense-chart__total">
            <span>Total Expenses</span>
            <strong>{formatMoneyAmount(totalYearExpense)}</strong>
          </div>
        </div>

        <div className="yearly-expense-chart__scroll">
          <div className="yearly-expense-chart__bars">
            {monthlyExpenses.map((month) => {
              const barHeight =
                highestExpense > 0
                  ? (month.totalAmount / highestExpense) * 100
                  : 0;

              return (
                <div
                  className="yearly-expense-chart__month"
                  key={month.monthKey}
                >
                  <div className="yearly-expense-chart__bar-area">
                    {month.totalAmount > 0 && (
                      <span className="yearly-expense-chart__amount">
                        {formatMoneyAmount(month.totalAmount)}
                      </span>
                    )}

                    <div className="yearly-expense-chart__bar-background">
                      <div
                        className="yearly-expense-chart__bar"
                        style={{ height: `${barHeight}%` }}
                        title={`${month.monthLabel}: ${formatMoneyAmount(
                          month.totalAmount
                        )}`}
                      />
                    </div>
                  </div>

                  <span className="yearly-expense-chart__month-label">
                    {month.monthLabel}
                  </span>

                  <span className="yearly-expense-chart__month-total">
                    {formatMoneyAmount(month.totalAmount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {totalYearExpense === 0 && (
          <p className="yearly-expense-chart__empty">
            No expenses recorded in this period.
          </p>
        )}
      </section>

   {/* Category Expense Summary */}
<section className="card expense-category-summary">
  <div className="expense-category-summary__header">
    <div>
      <h2>Expense Category Summary</h2>
      <p>Most frequently used categories</p>
    </div>
  </div>

  {/* Average Monthly Expense */}
  <div className="expense-category-summary__average">
    <span>Average Monthly Expense</span>
    <strong>{formatMoneyAmount(averageMonthlyExpense)}</strong>
    <small>Based on total expenses divided by 12 months</small>
  </div>

{/* Category List Dropdown */}
{/* Category List Dropdown */}
{categoryExpenseSummary.length > 0 ? (
  <details className="expense-category-summary__dropdown">
    <summary className="expense-category-summary__dropdown-header">
      <span>View All Categories</span>

      <span className="expense-category-summary__dropdown-count">
        {categoryExpenseSummary.length} Categories
      </span>
    </summary>

    <ul className="expense-category-summary__list">
      {categoryExpenseSummary.map((category) => (
        <li
          className="expense-category-summary__list-item"
          key={category.categoryName.toLowerCase()}
        >
          <div>
            <strong>{category.categoryName}</strong>

            <small>
              Average: {formatMoneyAmount(category.averagePerEntry)}
            </small>
          </div>

          <strong>
            {category.totalEntries}{" "}
            {category.totalEntries === 1 ? "Entry" : "Entries"}
          </strong>
        </li>
      ))}
    </ul>
  </details>
) : (
  <p className="expense-category-summary__empty">
    No expense categories recorded in this period.
  </p>
)}
</section>
      
    </>
  );
}