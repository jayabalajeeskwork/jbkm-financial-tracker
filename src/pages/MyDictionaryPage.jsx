
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDictionary } from "../hooks/useDictionary";

import "./DictionaryPage.css";

export default function MyDictionaryPage({ userId }) {
  const navigate = useNavigate();

  const {
    dictionaryWords,
    isLoading,
    errorMessage,
  } = useDictionary(userId);

  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState("latest");

  const filteredWords = useMemo(() => {
    let words = [...dictionaryWords];

    const keyword = searchText.trim().toLowerCase();

    if (keyword) {
      words = words.filter((item) => {
        return (
          item.word?.toLowerCase().includes(keyword) ||
          item.meaning?.toLowerCase().includes(keyword) ||
          item.note?.toLowerCase().includes(keyword)
        );
      });
    }

    if (sortType === "az") {
      words.sort((a, b) =>
        (a.word || "").localeCompare(b.word || ""),
      );
    } else {
      words.sort((a, b) => {
        const firstDate = a.createdAt?.toMillis?.() || 0;
        const secondDate = b.createdAt?.toMillis?.() || 0;

        return secondDate - firstDate;
      });
    }

    return words;
  }, [dictionaryWords, searchText, sortType]);

  return (
    <div className="dictionary-page">
      <div className="dictionary-page__header">
        <div>
          <h1>📚 My Dictionary</h1>
          <p>All the words you have learned so far.</p>
        </div>

        <button
          type="button"
          className="dictionary-button dictionary-button--secondary"
          onClick={() => navigate("/dictionary")}
        >
          ← Back to Dictionary
        </button>
      </div>

      <div className="dictionary-list-section">
        <div className="dictionary-list-section__header">
          <div>
            <h2>All My Words</h2>
            <p>{filteredWords.length} words found</p>
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
        ) : filteredWords.length === 0 ? (
          <p className="dictionary-empty-message">
            No dictionary words found.
          </p>
        ) : (
          <div className="dictionary-word-list">
            {filteredWords.map((item) => (
              <article className="dictionary-word-card" key={item.wordId}>
                <div className="dictionary-word-card__header">
                  <h3>{item.word}</h3>
                  <span className="dictionary-word-month">
                    {item.monthKey}
                  </span>
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
