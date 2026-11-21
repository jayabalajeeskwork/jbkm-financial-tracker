
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { firestoreDatabase } from "./firebaseConfiguration";

const getDictionaryCollection = (userId) => {
  return collection(
    firestoreDatabase,
    "users",
    userId,
    "dictionaryWords",
  );
};

// Get all dictionary words for the logged-in user
export const subscribeToDictionaryWords = (userId, callback, onError) => {
  if (!userId) {
    return () => {};
  }

  return onSnapshot(
    getDictionaryCollection(userId),
    (snapshot) => {
      const words = snapshot.docs.map((document) => ({
        wordId: document.id,
        ...document.data(),
      }));

      callback(words);
    },
    onError,
  );
};

// Add a new word
export const addDictionaryWord = async (userId, wordDetails) => {
  return addDoc(getDictionaryCollection(userId), {
    word: wordDetails.word.trim(),
    meaning: wordDetails.meaning.trim(),
    note: wordDetails.note.trim(),
    monthKey: wordDetails.monthKey,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Edit an existing word
export const updateDictionaryWord = async (
  userId,
  wordId,
  wordDetails,
) => {
  const wordReference = doc(
    firestoreDatabase,
    "users",
    userId,
    "dictionaryWords",
    wordId,
  );

  return updateDoc(wordReference, {
    word: wordDetails.word.trim(),
    meaning: wordDetails.meaning.trim(),
    note: wordDetails.note.trim(),
    updatedAt: serverTimestamp(),
  });
};
