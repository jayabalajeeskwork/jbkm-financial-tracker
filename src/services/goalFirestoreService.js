
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { firestoreDatabase } from "./firebaseConfiguration";

export const GOAL_STATUS_ACTIVE = "active";
export const GOAL_STATUS_ACHIEVED = "achieved";

const buildGoalCollectionReference = (userId) =>
  collection(firestoreDatabase, "users", userId, "goals");

// Subscribe to all goals
export const subscribeToGoals = ({
  userId,
  onGoalsChanged,
  onLoadingError,
}) =>
  onSnapshot(
    buildGoalCollectionReference(userId),
    (querySnapshot) => {
      const goals = querySnapshot.docs.map((documentSnapshot) => {
        const documentData = documentSnapshot.data();

        return {
          goalId: documentSnapshot.id,
          ...documentData,

          createdAtMilliseconds: documentData.createdAt?.toMillis
            ? documentData.createdAt.toMillis()
            : 0,

          achievedAtMilliseconds: documentData.achievedAt?.toMillis
            ? documentData.achievedAt.toMillis()
            : 0,
        };
      });

      onGoalsChanged(goals);
    },
    onLoadingError
  );

// Add a new goal
export const addGoal = async ({
  userId,
  goalName,
  goalAmount,
  note,
}) => {
  await addDoc(buildGoalCollectionReference(userId), {
    goalName: goalName.trim(),
    goalAmount: Number(goalAmount),
    note: note?.trim() || "",

    status: GOAL_STATUS_ACTIVE,

    createdAt: serverTimestamp(),
    achievedAt: null,
  });
};

// Update an existing goal
export const updateGoal = async ({
  userId,
  goalId,
  goalName,
  goalAmount,
  note,
}) => {
  await updateDoc(
    doc(firestoreDatabase, "users", userId, "goals", goalId),
    {
      goalName: goalName.trim(),
      goalAmount: Number(goalAmount),
      note: note?.trim() || "",
    }
  );
};

// Mark a goal as achieved
export const achieveGoal = async ({
  userId,
  goalId,
}) => {
  await updateDoc(
    doc(firestoreDatabase, "users", userId, "goals", goalId),
    {
      status: GOAL_STATUS_ACHIEVED,
      achievedAt: serverTimestamp(),
    }
  );
};

// Delete a goal
export const deleteGoal = async ({
  userId,
  goalId,
}) => {
  if (!userId || !goalId) {
    throw new Error("User ID or goal ID is missing.");
  }

  await deleteDoc(
    doc(firestoreDatabase, "users", userId, "goals", goalId)
  );
};
