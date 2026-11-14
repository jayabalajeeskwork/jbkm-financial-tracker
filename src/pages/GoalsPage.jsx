
import { useMemo, useState } from "react";

import { useGoals } from "../hooks/useGoals";
import { useGoalFinancials } from "../hooks/useGoalFinancials";

import "./GoalsPage.css";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const GoalsPage = ({ userId }) => {
  const {
    netWorth,
    amountForProcess,
    goalBudget,
    investmentValue,
    includeInvestments,
    setIncludeInvestments,
    isLoading: isLoadingFinancials,
  } = useGoalFinancials(userId);

  const {
    activeGoals,
    achievedGoals,
    isLoadingGoals,
    goalErrorMessage,
    saveNewGoal,
    markGoalAsAchieved,
    removeGoal,
  } = useGoals(userId);

  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalNote, setGoalNote] = useState("");

  const [notification, setNotification] = useState("");

  const [showHistory, setShowHistory] = useState(false);

  // Sort goals by highest readiness percentage
  const sortedActiveGoals = useMemo(() => {
    return [...activeGoals].sort((a, b) => {
      const aReadiness =
        (goalBudget / Number(a.goalAmount)) * 100;

      const bReadiness =
        (goalBudget / Number(b.goalAmount)) * 100;

      return bReadiness - aReadiness;
    });
  }, [activeGoals, goalBudget]);

  // Calculate readiness percentage
  const getReadiness = (amount) => {
    const goalPrice = Number(amount);

    if (!goalPrice || goalPrice <= 0) return 0;

    return Math.min((goalBudget / goalPrice) * 100, 100);
  };

  // Add a new goal
  const handleAddGoal = async (event) => {
    event.preventDefault();

    if (!goalName.trim() || !goalAmount) {
      setNotification("Please enter the goal name and amount.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to add "${goalName.trim()}" as a goal?`
    );

    if (!confirmed) return;

    const isSaved = await saveNewGoal({
      goalName,
      goalAmount,
      note: goalNote,
    });

    if (isSaved) {
      setGoalName("");
      setGoalAmount("");
      setGoalNote("");
      setNotification("Goal added successfully.");
    }
  };

  // Mark a goal as achieved
  const handleAchieveGoal = async (goal) => {
    const confirmed = window.confirm(
      `Have you achieved "${goal.goalName}"? This will move it to your achievement history.`
    );

    if (!confirmed) return;

    const isAchieved = await markGoalAsAchieved(goal.goalId);

    if (isAchieved) {
      setNotification(`${goal.goalName} marked as achieved!`);
    }
  };

  // Delete a goal
  const handleDeleteGoal = async (goal) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${goal.goalName}"?`
    );

    if (!confirmed) return;

    const isDeleted = await removeGoal(goal.goalId);

    if (isDeleted) {
      setNotification(`${goal.goalName} deleted successfully.`);
    }
  };

  const isLoading = isLoadingFinancials || isLoadingGoals;

  return (
    <div className="goals-page">
      <div className="goals-page__header">
        <div>
          <h1>My Goals</h1>
          <p>Plan your money and track what you want to achieve.</p>
        </div>
      </div>

      {notification && (
        <div className="goals-notification">
          <span>{notification}</span>

          <button
            type="button"
            onClick={() => setNotification("")}
          >
            ×
          </button>
        </div>
      )}

      {goalErrorMessage && (
        <div className="goals-error">
          {goalErrorMessage}
        </div>
      )}

      {isLoading ? (
        <p className="goals-loading">Loading your financial data...</p>
      ) : (
        <>
          {/* Financial summary */}
          <section className="goals-summary">
            <div className="goals-summary__card">
              <span>My Net Worth</span>
              <h2>{formatCurrency(netWorth)}</h2>
              <small>Including investments</small>
            </div>

            <div className="goals-summary__card">
              <span>Amount for Process</span>
              <h2>{formatCurrency(amountForProcess)}</h2>

              <label className="goals-investment-toggle">
                <input
                  type="checkbox"
                  checked={includeInvestments}
                  onChange={(event) =>
                    setIncludeInvestments(event.target.checked)
                  }
                />

                Include investments
              </label>

              <small>
                Investment value: {formatCurrency(investmentValue)}
              </small>
            </div>

            <div className="goals-summary__card goals-summary__card--highlight">
              <span>Money Ready for Goals</span>
              <h2>{formatCurrency(goalBudget)}</h2>
              <small>30% of amount for process</small>
            </div>
          </section>

          {/* Add goal form */}
          <section className="goals-form-section">
            <h2>Add a New Goal</h2>

            <form onSubmit={handleAddGoal} className="goals-form">
              <div className="goals-form__field">
                <label htmlFor="goalName">Goal Name</label>

                <input
                  id="goalName"
                  type="text"
                  value={goalName}
                  onChange={(event) => setGoalName(event.target.value)}
                  placeholder="Example: White Sofa"
                />
              </div>

              <div className="goals-form__field">
                <label htmlFor="goalAmount">Goal Amount (₹)</label>

                <input
                  id="goalAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={goalAmount}
                  onChange={(event) => setGoalAmount(event.target.value)}
                  placeholder="Example: 25000"
                />
              </div>

              <div className="goals-form__field">
                <label htmlFor="goalNote">Note / Link (Optional)</label>

                <input
                  id="goalNote"
                  type="text"
                  value={goalNote}
                  onChange={(event) => setGoalNote(event.target.value)}
                  placeholder="Product link or additional details"
                />
              </div>

              <button type="submit" className="goals-button">
                Add Goal
              </button>
            </form>
          </section>

          {/* Active goals */}
          <section className="active-goals-section">
            <div className="goals-section__header">
              <div>
                <h2>Active Goals</h2>
                <p>{activeGoals.length} goals in progress</p>
              </div>
            </div>

            {sortedActiveGoals.length === 0 ? (
              <div className="goals-empty">
                No active goals yet. Add your first goal above.
              </div>
            ) : (
              <div className="goals-list">
                {sortedActiveGoals.map((goal) => {
                  const readiness = getReadiness(goal.goalAmount);

                  return (
                    <article
                      className="goal-card"
                      key={goal.goalId}
                    >
                      <div className="goal-card__top">
                        <div>
                          <h3>{goal.goalName}</h3>

                          {goal.note && (
                            <p className="goal-card__note">
                              {/^https?:\/\//i.test(goal.note) ? (
                                <a
                                  href={goal.note}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View details
                                </a>
                              ) : (
                                goal.note
                              )}
                            </p>
                          )}
                        </div>

                        <strong>
                          {formatCurrency(goal.goalAmount)}
                        </strong>
                      </div>

                      <div className="goal-readiness">
                        <div className="goal-readiness__labels">
                          <span>Goal readiness</span>
                          <strong>{readiness.toFixed(0)}%</strong>
                        </div>

                        <div className="goal-readiness__track">
                          <div
                            className="goal-readiness__fill"
                            style={{ width: `${readiness}%` }}
                          />
                        </div>

                        <small>
                          Based on your shared goal budget of{" "}
                          {formatCurrency(goalBudget)}
                        </small>
                      </div>

                      <div className="goal-card__actions">
                        <button
                          type="button"
                          className="goals-button goals-button--achieve"
                          onClick={() => handleAchieveGoal(goal)}
                        >
                          Achieve
                        </button>

                        <button
                          type="button"
                          className="goals-button goals-button--delete"
                          onClick={() => handleDeleteGoal(goal)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Achievement history */}
          <section className="goals-history-section">
            <button
              type="button"
              className="goals-history-toggle"
              onClick={() => setShowHistory((previous) => !previous)}
            >
              <span>
                Achievement History ({achievedGoals.length})
              </span>

              <span>{showHistory ? "−" : "+"}</span>
            </button>

            {showHistory && (
              <div className="goals-history-list">
                {achievedGoals.length === 0 ? (
                  <p>No achieved goals yet.</p>
                ) : (
                  achievedGoals.map((goal) => (
                    <article
                      className="goal-history-card"
                      key={goal.goalId}
                    >
                      <div>
                        <h3>{goal.goalName}</h3>

                        <small>
                          Achieved on:{" "}
                          {goal.achievedAtMilliseconds
                            ? new Date(
                                goal.achievedAtMilliseconds
                              ).toLocaleString("en-IN")
                            : "Date unavailable"}
                        </small>
                      </div>

                      <strong>
                        {formatCurrency(goal.goalAmount)}
                      </strong>
                    </article>
                  ))
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default GoalsPage;
