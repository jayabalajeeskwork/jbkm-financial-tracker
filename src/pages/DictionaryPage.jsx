
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  formatDictionaryMonth,
  getCurrentMonthKey,
  useDictionary,
} from "../hooks/useDictionary";

import "./DictionaryPage.css";

export default function DictionaryPage({ userId }) {
  const navigate = useNavigate();

  const {
    dictionaryWords,
    isLoading,
    errorMessage,
    saveNewWord,
    editWord,
  } = useDictionary(userId);

  const currentMonthKey = getCurrentMonthKey();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState("latest");

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [note, setNote] = useState("");

  const [editingWordId, setEditingWordId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const isCurrentMonth = selectedMonth === currentMonthKey;

  // Show months containing words, along with the current month.
  const monthOptions = useMemo(() => {
    const months = new Set([currentMonthKey]);

    dictionaryWords.forEach((item) => {
      if (item.monthKey && item.monthKey <= currentMonthKey) {
        months.add(item.monthKey);
      }
    });

    return [...months].sort((a, b) => b.localeCompare(a));
  }, [dictionaryWords, currentMonthKey]);

  // Get words belonging to the selected month.
  const monthlyWords = useMemo(() => {
    let filteredWords = dictionaryWords.filter(
      (item) => item.monthKey === selectedMonth,
    );

    const keyword = searchText.trim().toLowerCase();

    if (keyword) {
      filteredWords = filteredWords.filter((item) => {
        return (
          item.word?.toLowerCase().includes(keyword) ||
          item.meaning?.toLowerCase().includes(keyword) ||
          item.note?.toLowerCase().includes(keyword)
        );
      });
    }

    if (sortType === "az") {
      filteredWords.sort((a, b) =>
        (a.word || "").localeCompare(b.word || ""),
      );
    } else {
      filteredWords.sort((a, b) => {
        const firstDate = a.createdAt?.toMillis?.() || 0;
        const secondDate = b.createdAt?.toMillis?.() || 0;

        return secondDate - firstDate;
      });
    }

    return filteredWords;
  }, [dictionaryWords, selectedMonth, searchText, sortType]);

  const resetForm = () => {
    setWord("");
    setMeaning("");
    setNote("");
    setEditingWordId(null);
    setFormError("");
  };

  const handleEdit = (item) => {
    if (!isCurrentMonth) return;

    setEditingWordId(item.wordId);
    setWord(item.word);
    setMeaning(item.meaning);
    setNote(item.note);

    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isCurrentMonth) {
      setFormError("You can only add or edit words in the current month.");
      return;
    }

    if (!word.trim() || !meaning.trim() || !note.trim()) {
      setFormError("Please fill in all three fields.");
      return;
    }

    setIsSaving(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const wordDetails = {
        word,
        meaning,
        note,
        monthKey: currentMonthKey,
      };

      if (editingWordId) {
        const existingWord = dictionaryWords.find(
          (item) => item.wordId === editingWordId,
        );

        if (!existingWord || existingWord.monthKey !== currentMonthKey) {
          throw new Error("This word can no longer be edited.");
        }

        await editWord(editingWordId, wordDetails);
        setSuccessMessage("Word updated successfully.");
      } else {
        await saveNewWord(wordDetails);
        setSuccessMessage("New word added successfully.");
      }

      resetForm();
    } catch (error) {
      console.error("Dictionary save error:", error);
      setFormError(error.message || "Unable to save this word.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dictionary-page">
      <div className="dictionary-page__header">
        <div>
          <h1>📖 Dictionary</h1>
          <p>Learn new words and improve your vocabulary.</p>
        </div>

        <button
          type="button"
          className="dictionary-button dictionary-button--secondary"
          onClick={() => navigate("/dictionary/all")}
        >
          My Dictionary
        </button>
      </div>

      <div className="dictionary-toolbar">
        <div className="dictionary-month">
          <label htmlFor="dictionary-month">Select Month</label>

          <select
            id="dictionary-month"
            value={selectedMonth}
            onChange={(event) => {
              setSelectedMonth(event.target.value);
              resetForm();
              setSuccessMessage("");
            }}
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {formatDictionaryMonth(month)}
              </option>
            ))}
          </select>
        </div>

        <div className="dictionary-month-status">
          {isCurrentMonth ? "Current month — Editing available" : "Read-only month"}
        </div>
      </div>

      {isCurrentMonth && (
        <form className="dictionary-form" onSubmit={handleSubmit}>
          <h2>{editingWordId ? "Edit Word" : "Add New Word"}</h2>

          <div className="dictionary-form__field">
            <label htmlFor="dictionary-word">Word *</label>
            <input
              id="dictionary-word"
              type="text"
              value={word}
              onChange={(event) => setWord(event.target.value)}
              placeholder="Enter a new word"
              required
            />
          </div>

          <div className="dictionary-form__field">
            <label htmlFor="dictionary-meaning">Meaning *</label>
            <textarea
              id="dictionary-meaning"
              value={meaning}
              onChange={(event) => setMeaning(event.target.value)}
              placeholder="Enter the meaning"
              rows="2"
              required
            />
          </div>

          <div className="dictionary-form__field">
            <label htmlFor="dictionary-note">Note / Where to use *</label>
            <textarea
              id="dictionary-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Write where or how you can use this word"
              rows="3"
              required
            />
          </div>

          {formError && (
            <p className="dictionary-message dictionary-message--error">
              {formError}
            </p>
          )}

          {successMessage && (
            <p className="dictionary-message dictionary-message--success">
              {successMessage}
            </p>
          )}

          <div className="dictionary-form__actions">
            <button
              type="submit"
              className="dictionary-button dictionary-button--primary"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingWordId
                  ? "Update Word"
                  : "Add Word"}
            </button>

            {editingWordId && (
              <button
                type="button"
                className="dictionary-button dictionary-button--secondary"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      <div className="dictionary-list-section">
        <div className="dictionary-list-section__header">
          <div>
            <h2>{formatDictionaryMonth(selectedMonth)} Words</h2>
            <p>{monthlyWords.length} words found</p>
          </div>
        </div>

        <div className="dictionary-search-toolbar">
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search word, meaning or note..."
          />

          <select
            value={sortType}
            onChange={(event) => setSortType(event.target.value)}
            aria-label="Sort dictionary words"
          >
            <option value="latest">Last Added</option>
            <option value="az">A–Z Name</option>
          </select>
        </div>

        {isLoading ? (
          <p className="dictionary-empty-message">Loading dictionary...</p>
        ) : errorMessage ? (
          <p className="dictionary-message dictionary-message--error">
            {errorMessage}
          </p>
        ) : monthlyWords.length === 0 ? (
          <p className="dictionary-empty-message">
            No words found for this month.
          </p>
        ) : (
          <div className="dictionary-word-list">
            {monthlyWords.map((item) => (
              <article className="dictionary-word-card" key={item.wordId}>
                <div className="dictionary-word-card__header">
                  <h3>{item.word}</h3>

                  {isCurrentMonth && (
                    <button
                      type="button"
                      className="dictionary-edit-button"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                  )}
                </div>

                <div className="dictionary-word-card__section">
                  <h4>Learn It</h4>
                  <p>{item.meaning}</p>
                </div>

                <div className="dictionary-word-card__section">
                  <h4>Use It</h4>
                  <p>{item.note}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
