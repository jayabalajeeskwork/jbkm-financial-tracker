
import { useYearlyExpenses } from "../hooks/useYearlyExpenses";
import { formatMoneyAmount } from "../utils/personBalanceCalculations";

import "./YearlyExpenseChart.css";

export default function YearlyExpenseChart({ userId }) {
  const {
    monthlyExpenses,
    totalYearExpense,
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

  return (
    <section className="card yearly-expense-chart">

      <div className="yearly-expense-chart__header">
        <div>
          <h2>Yearly Expenses</h2>
          <p>Monthly spending over the last 12 months</p>
        </div>

        <div className="yearly-expense-chart__total">
          <span>Total Expenses</span>
          <strong>{formatMoneyAmount(totalYearExpense)}</strong>
        </div>
      </div>

      {/* Chart */}
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
                      style={{
                        height: `${barHeight}%`,
                      }}
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
          No expenses recorded in the last 12 months.
        </p>
      )}

    </section>
  );
}
