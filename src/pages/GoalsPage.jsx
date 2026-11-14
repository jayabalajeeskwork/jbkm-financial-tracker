
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
  // Financial summary
  const {
    netWorth,
    amountForProcess,
    goalBudget,
    investmentValue,
    includeInvestments,
    setIncludeInvestments,
    isLoading: isLoadingFinancials,
  } = useGoalFinancials(userId);

  // Goals data and operations
  const {
    activeGoals,
    achievedGoals,
    isLoadingGoals,
    goalErrorMessage,
    saveNewGoal,
    editGoal,
    markGoalAsAchieved,
    removeGoal,
  } = useGoals(userId);

  // Form states
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalNote, setGoalNote] = useState("");

  // Other states
  const [notification, setNotification] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);

  // Sort active goals by highest readiness percentage
  const sortedActiveGoals = useMemo(() => {
    return [...activeGoals].sort((a, b) => {
      const aAmount = Number(a.goalAmount);
      const bAmount = Number(b.goalAmount);

      const aReadiness = aAmount > 0 ? goalBudget / aAmount : 0;
      const bReadiness = bAmount > 0 ? goalBudget / bAmount : 0;

      return bReadiness - aReadiness;
    });
  }, [activeGoals, goalBudget]);

  // Calculate goal readiness
  const getReadiness = (amount) => {
    const goalPrice = Number(amount);

    if (!goalPrice || goalPrice <= 0) return 0;

    return Math.min((goalBudget / goalPrice) * 100, 100);
  };

  // Reset form
  const resetGoalForm = () => {
    setGoalName("");
    setGoalAmount("");
    setGoalNote("");
    setEditingGoalId(null);
  };

  // Add a new goal or update an existing goal
  const handleSaveGoal = async (event) => {
    event.preventDefault();

    setNotification("");

    if (!goalName.trim() || !goalAmount || Number(goalAmount) <= 0) {
      setNotification("Please enter a valid goal name and amount.");
      return;
    }

    let isSaved = false;

    try {
      if (editingGoalId) {
        // Update existing active goal
        isSaved = await editGoal(editingGoalId, {
          goalName: goalName.trim(),
          goalAmount: Number(goalAmount),
          note: goalNote.trim(),
        });

        if (isSaved) {
          setNotification("Goal updated successfully.");
        }
      } else {
        // Confirm before adding a new goal
        const confirmed = window.confirm(
          `Are you sure you want to add "${goalName.trim()}" as a goal?`
        );

        if (!confirmed) return;

        isSaved = await saveNewGoal({
          goalName: goalName.trim(),
          goalAmount: Number(goalAmount),
          note: goalNote.trim(),
        });

        if (isSaved) {
          setNotification("Goal added successfully.");
        }
      }

      if (isSaved) {
        resetGoalForm();
      }
    } catch (error) {
      console.error("Goal save error:", error);
      setNotification("Could not save the goal. Please try again.");
    }
  };

  // Start editing an active goal
  const handleEditGoal = (goal) => {
    setEditingGoalId(goal.goalId);
    setGoalName(goal.goalName);
    setGoalAmount(String(goal.goalAmount));
    setGoalNote(goal.note || "");
    setNotification("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    resetGoalForm();
    setNotification("");
  };

  // Mark an active goal as achieved
  const handleAchieveGoal = async (goal) => {
    const confirmed = window.confirm(
      `Have you achieved "${goal.goalName}"? This will move it to your achievement history.`
    );

    if (!confirmed) return;

    try {
      const isAchieved = await markGoalAsAchieved(goal.goalId);

      if (isAchieved) {
        if (editingGoalId === goal.goalId) {
          resetGoalForm();
        }

        setNotification(`${goal.goalName} marked as achieved!`);
      }
    } catch (error) {
      console.error("Goal achievement error:", error);
      setNotification("Could not update the goal. Please try again.");
    }
  };

  // Delete an active goal
  const handleDeleteGoal = async (goal) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${goal.goalName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const isDeleted = await removeGoal(goal.goalId);

      if (isDeleted) {
        if (editingGoalId === goal.goalId) {
          resetGoalForm();
        }

        setNotification(`${goal.goalName} deleted successfully.`);
      }
    } catch (error) {
      console.error("Active goal deletion error:", error);
      setNotification("Could not delete the goal. Please try again.");
    }
  };

  // Delete an achieved goal from achievement history
  const handleDeleteAchievedGoal = async (goal) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${goal.goalName}" from your achievement history? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const isDeleted = await removeGoal(goal.goalId);

      if (isDeleted) {
        setNotification(
          `${goal.goalName} removed from achievement history.`
        );
      }
    } catch (error) {
      console.error("Achieved goal deletion error:", error);
      setNotification("Could not delete the achieved goal. Please try again.");
    }
  };

  const isLoading = isLoadingFinancials || isLoadingGoals;

  return (
    <div className="goals-page">
      {/* Page header */}
      <div className="goals-page__header">
        <div>
          <h1>My Goals</h1>
          <p>Plan your money and track what you want to achieve.</p>
        </div>
      </div>

      {/* Notification */}
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

      {/* Error */}
      {goalErrorMessage && (
        <div className="goals-error">
          {goalErrorMessage}
        </div>
      )}

      {isLoading ? (
        <p className="goals-loading">
          Loading your financial data...
        </p>
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

          {/* Add / Edit goal form */}
          <section className="goals-form-section">
            <h2>
              {editingGoalId ? "Edit Goal" : "Add a New Goal"}
            </h2>

            <form
              onSubmit={handleSaveGoal}
              className="goals-form"
            >
              <div className="goals-form__field">
                <label htmlFor="goalName">
                  Goal Name
                </label>

                <input
                  id="goalName"
                  type="text"
                  value={goalName}
                  onChange={(event) => setGoalName(event.target.value)}
                  placeholder="Example: White Sofa"
                  required
                />
              </div>

              <div className="goals-form__field">
                <label htmlFor="goalAmount">
                  Goal Amount (₹)
                </label>

                <input
                  id="goalAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={goalAmount}
                  onChange={(event) => setGoalAmount(event.target.value)}
                  placeholder="Example: 25000"
                  required
                />
              </div>

              <div className="goals-form__field">
                <label htmlFor="goalNote">
                  Note / Link (Optional)
                </label>

                <input
                  id="goalNote"
                  type="text"
                  value={goalNote}
                  onChange={(event) => setGoalNote(event.target.value)}
                  placeholder="Product link or additional details"
                />
              </div>

              <div className="goal-form__actions">
                <button
                  type="submit"
                  className="goals-button"
                >
                  {editingGoalId ? "Update Goal" : "Add Goal"}
                </button>

                {editingGoalId && (
                  <button
                    type="button"
                    className="goals-button goals-button--cancel"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
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
                          className="goals-button goals-button--edit"
                          onClick={() => handleEditGoal(goal)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="goals-button goals-button--achieve"
                          onClick={() => handleAchieveGoal(goal)}
                        >
                          Achieved
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

                      <div className="goal-history-card__actions">
                        <strong>
                          {formatCurrency(goal.goalAmount)}
                        </strong>

                        <button
                          type="button"
                          className="goals-button goals-button--delete"
                          onClick={() => handleDeleteAchievedGoal(goal)}
                        >
                          Delete
                        </button>
                      </div>
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
