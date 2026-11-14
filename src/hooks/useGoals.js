
import { useEffect, useMemo, useState } from "react";

import {
  GOAL_STATUS_ACTIVE,
  GOAL_STATUS_ACHIEVED,
  addGoal,
  updateGoal,
  achieveGoal,
  deleteGoal,
  subscribeToGoals,
} from "../services/goalFirestoreService";

export const useGoals = (userId) => {
  const [goals, setGoals] = useState([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [goalErrorMessage, setGoalErrorMessage] = useState("");

  // Subscribe to goals in Firestore
  useEffect(() => {
    if (!userId) {
      setGoals([]);
      setIsLoadingGoals(false);
      return;
    }

    setIsLoadingGoals(true);
    setGoalErrorMessage("");

    const unsubscribeFromGoals = subscribeToGoals({
      userId,

      onGoalsChanged: (updatedGoals) => {
        setGoals(updatedGoals);
        setIsLoadingGoals(false);
      },

      onLoadingError: (error) => {
        console.error(error);
        setGoalErrorMessage("Could not load goals.");
        setIsLoadingGoals(false);
      },
    });

    return unsubscribeFromGoals;
  }, [userId]);

  // Active goals
  const activeGoals = useMemo(
    () =>
      goals
        .filter((goal) => goal.status === GOAL_STATUS_ACTIVE)
        .sort((a, b) => {
          const aAmount = Number(a.goalAmount) || 0;
          const bAmount = Number(b.goalAmount) || 0;

          return aAmount - bAmount;
        }),
    [goals]
  );

  // Achieved goals - latest achieved first
  const achievedGoals = useMemo(
    () =>
      goals
        .filter((goal) => goal.status === GOAL_STATUS_ACHIEVED)
        .sort(
          (a, b) =>
            b.achievedAtMilliseconds - a.achievedAtMilliseconds
        ),
    [goals]
  );

  // Check whether an active goal with the same name exists
  const isDuplicateActiveGoal = (goalName, excludedGoalId = null) => {
    const normalizedName = goalName.trim().toLowerCase();

    return activeGoals.some(
      (goal) =>
        goal.goalName.trim().toLowerCase() === normalizedName &&
        goal.goalId !== excludedGoalId
    );
  };

  // Add a new goal
  const saveNewGoal = async (goalDetails) => {
    try {
      setGoalErrorMessage("");

      const goalName = goalDetails.goalName?.trim();
      const goalAmount = Number(goalDetails.goalAmount);

      if (!goalName) {
        setGoalErrorMessage("Enter a goal name.");
        return false;
      }

      if (
        !goalAmount ||
        goalAmount <= 0 ||
        !Number.isFinite(goalAmount)
      ) {
        setGoalErrorMessage("Enter a valid goal amount.");
        return false;
      }

      if (isDuplicateActiveGoal(goalName)) {
        setGoalErrorMessage(
          "An active goal with this name already exists."
        );
        return false;
      }

      await addGoal({
        userId,
        goalName,
        goalAmount,
        note: goalDetails.note || "",
      });

      return true;
    } catch (error) {
      console.error(error);
      setGoalErrorMessage("Could not add goal. Please try again.");
      return false;
    }
  };

  // Edit an active goal
  const editGoal = async (goalId, goalDetails) => {
    try {
      setGoalErrorMessage("");

      const goalName = goalDetails.goalName?.trim();
      const goalAmount = Number(goalDetails.goalAmount);

      if (!goalName) {
        setGoalErrorMessage("Enter a goal name.");
        return false;
      }

      if (
        !goalAmount ||
        goalAmount <= 0 ||
        !Number.isFinite(goalAmount)
      ) {
        setGoalErrorMessage("Enter a valid goal amount.");
        return false;
      }

      if (isDuplicateActiveGoal(goalName, goalId)) {
        setGoalErrorMessage(
          "Another active goal already uses this name."
        );
        return false;
      }

      await updateGoal({
        userId,
        goalId,
        goalName,
        goalAmount,
        note: goalDetails.note || "",
      });

      return true;
    } catch (error) {
      console.error(error);
      setGoalErrorMessage("Could not update goal. Please try again.");
      return false;
    }
  };

  // Mark an active goal as achieved
  const markGoalAsAchieved = async (goalId) => {
    try {
      setGoalErrorMessage("");

      await achieveGoal({
        userId,
        goalId,
      });

      return true;
    } catch (error) {
      console.error(error);
      setGoalErrorMessage("Could not update goal. Please try again.");
      return false;
    }
  };

  // Delete a goal
  const removeGoal = async (goalId) => {
    try {
      setGoalErrorMessage("");

      await deleteGoal({
        userId,
        goalId,
      });

      return true;
    } catch (error) {
      console.error(error);
      setGoalErrorMessage("Could not delete goal. Please try again.");
      return false;
    }
  };

  return {
    goals,
    activeGoals,
    achievedGoals,

    isLoadingGoals,
    goalErrorMessage,

    isDuplicateActiveGoal,

    saveNewGoal,
    editGoal,
    markGoalAsAchieved,
    removeGoal,
  };
};
