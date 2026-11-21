
import { useEffect, useState } from "react";

import {
  addDictionaryWord,
  subscribeToDictionaryWords,
  updateDictionaryWord,
} from "../services/dictionaryFirestoreService";

export const getCurrentMonthKey = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

export const formatDictionaryMonth = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

export const useDictionary = (userId) => {
  const [dictionaryWords, setDictionaryWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!userId) {
      setDictionaryWords([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = subscribeToDictionaryWords(
      userId,
      (words) => {
        setDictionaryWords(words);
        setIsLoading(false);
        setErrorMessage("");
      },
      (error) => {
        console.error("Dictionary loading error:", error);
        setErrorMessage("Unable to load dictionary words.");
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  const saveNewWord = async (wordDetails) => {
    if (!userId) {
      throw new Error("User is not logged in.");
    }

    return addDictionaryWord(userId, wordDetails);
  };

  const editWord = async (wordId, wordDetails) => {
    if (!userId) {
      throw new Error("User is not logged in.");
    }

    return updateDictionaryWord(userId, wordId, wordDetails);
  };

  return {
    dictionaryWords,
    isLoading,
    errorMessage,
    saveNewWord,
    editWord,
  };
};
