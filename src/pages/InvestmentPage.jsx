
import { useMemo, useState } from "react";

import { useInvestments } from "../hooks/useInvestments";
import "../styles/InvestmentPage.css";

const getTodayDate = () => {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Supports old investment records
const getInvestmentName = (entry) => {
  if (entry.investmentName) {
    return entry.investmentName.trim();
  }

  if (entry.investmentType && entry.quantity && entry.unit) {
    return `${entry.quantity} ${entry.unit} ${entry.investmentType}`.trim();
  }

  return entry.investmentType?.trim() || "Other Investment";
};

export default function InvestmentPage({ loggedInUser }) {
  const {
    investmentEntries,
    investmentValuations,
    isLoadingInvestments,
    investmentErrorMessage,
    addEntry,
    deleteEntry,
    saveValuation,
  } = useInvestments(loggedInUser?.userId);

  const [form, setForm] = useState({
    investmentName: "",
    purchaseAmount: "",
    purchaseDate: getTodayDate(),
  });

  const [valuationInputs, setValuationInputs] = useState({});

  const [isSaving, setIsSaving] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");

  // Group purchases using investment name
  const investmentGroups = useMemo(() => {
    const groups = {};

    investmentEntries.forEach((entry) => {
      const investmentName = getInvestmentName(entry);
      const key = investmentName.toLowerCase();

      if (!groups[key]) {
        groups[key] = {
          investmentName,
          totalInvested: 0,
          entries: [],
        };
      }

      groups[key].totalInvested += Number(entry.purchaseAmount) || 0;
      groups[key].entries.push(entry);
    });

    return Object.values(groups).map((group) => {
      const history = investmentValuations
        .filter(
          (valuation) =>
            (valuation.investmentName || "").trim().toLowerCase() ===
            group.investmentName.toLowerCase()
        )
        .sort((a, b) =>
          (b.valuationDate || "").localeCompare(a.valuationDate || "")
        );

      const latestValuation = history[0] || null;

      const currentValuePerEntry = latestValuation
        ? Number(latestValuation.currentValuePerEntry)
        : null;

      const currentValue =
        currentValuePerEntry === null
          ? null
          : currentValuePerEntry * group.entries.length;

      const profitLoss =
        currentValue === null
          ? null
          : currentValue - group.totalInvested;

      const returnPercentage =
        currentValue === null || group.totalInvested === 0
          ? null
          : (profitLoss / group.totalInvested) * 100;

      return {
        ...group,
        currentValuePerEntry,
        currentValue,
        profitLoss,
        returnPercentage,
        latestValuation,
        valuationHistory: history,
      };
    });
  }, [investmentEntries, investmentValuations]);

  // Summary calculations
  const totalInvested = investmentGroups.reduce(
    (total, group) => total + group.totalInvested,
    0
  );

  const valuedGroups = investmentGroups.filter(
    (group) => group.currentValue !== null
  );

  const totalCurrentValue = valuedGroups.reduce(
    (total, group) => total + group.currentValue,
    0
  );

  const valuedInvestmentTotal = valuedGroups.reduce(
    (total, group) => total + group.totalInvested,
    0
  );

  const totalProfitLoss = totalCurrentValue - valuedInvestmentTotal;

  const totalReturnPercentage =
    valuedInvestmentTotal > 0
      ? (totalProfitLoss / valuedInvestmentTotal) * 100
      : 0;

  const existingInvestmentNames = [
    ...new Set(investmentEntries.map(getInvestmentName)),
  ];

  // Form change
  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setActionError("");
    setSuccessMessage("");
  };

  // Add investment
  const handleAddInvestment = async (event) => {
    event.preventDefault();

    const investmentName = form.investmentName.trim();
    const purchaseAmount = Number(form.purchaseAmount);

    if (!investmentName) {
      setActionError("Please enter an investment name.");
      return;
    }

    if (!Number.isFinite(purchaseAmount) || purchaseAmount <= 0) {
      setActionError("Please enter a valid purchase amount.");
      return;
    }

    if (!form.purchaseDate) {
      setActionError("Please select a purchase date.");
      return;
    }

    setIsSaving(true);
    setActionError("");
    setSuccessMessage("");

    try {
      await addEntry({
        investmentName,
        purchaseAmount,
        purchaseDate: form.purchaseDate,
      });

      setForm({
        investmentName: "",
        purchaseAmount: "",
        purchaseDate: getTodayDate(),
      });

      setSuccessMessage("Investment added successfully.");
    } catch (error) {
      console.error("Add investment error:", error);

      setActionError(
        error.message || "Unable to add investment. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Update current value
  const handleSaveValuation = async (group) => {
    const currentValue = valuationInputs[group.investmentName];

    if (
      currentValue === undefined ||
      currentValue === "" ||
      !Number.isFinite(Number(currentValue)) ||
      Number(currentValue) < 0
    ) {
      setActionError("Please enter a valid current value.");
      return;
    }

    setIsSaving(true);
    setActionError("");
    setSuccessMessage("");

    try {
      await saveValuation({
        investmentName: group.investmentName,
        currentValuePerEntry: Number(currentValue),
        valuationDate: getTodayDate(),
      });

      setValuationInputs((previous) => ({
        ...previous,
        [group.investmentName]: "",
      }));

      setSuccessMessage(
        `${group.investmentName} current value updated successfully.`
      );
    } catch (error) {
      console.error("Save valuation error:", error);

      setActionError(
        error.message || "Unable to update current value."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Delete purchase entry
  const handleDeleteInvestment = async (investmentEntryId) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this investment entry?"
    );

    if (!shouldDelete) return;

    setDeletingEntryId(investmentEntryId);
    setActionError("");
    setSuccessMessage("");

    try {
      await deleteEntry(investmentEntryId);

      setSuccessMessage("Investment entry deleted successfully.");
    } catch (error) {
      console.error("Delete investment error:", error);

      setActionError(
        error.message || "Unable to delete investment entry."
      );
    } finally {
      setDeletingEntryId("");
    }
  };

  return (
    <div className="page-stack investment-page">

      {/* Page heading */}
      <div className="investment-page__heading">
        <h2>Investment</h2>
        <p>Track your purchases, current value and profit or loss.</p>
      </div>

      {/* Summary cards */}
      <section className="investment-summary">

        <div className="card investment-summary__card">
          <p className="investment-summary__label">Total Investment</p>
          <p className="investment-summary__amount">
            {formatCurrency(totalInvested)}
          </p>
        </div>

        <div className="card investment-summary__card">
          <p className="investment-summary__label">Current Value</p>
          <p className="investment-summary__amount">
            {formatCurrency(totalCurrentValue)}
          </p>
          <small className="investment-summary__note">
            {valuedGroups.length} of {investmentGroups.length} investment
            categories valued
          </small>
        </div>

        <div className="card investment-summary__card">
          <p className="investment-summary__label">
            Profit / Loss
          </p>

          <p
            className={`investment-summary__amount ${
              totalProfitLoss >= 0
                ? "investment-profit"
                : "investment-loss"
            }`}
          >
            {formatCurrency(totalProfitLoss)}
          </p>

          <small className="investment-summary__note">
            {valuedInvestmentTotal > 0
              ? `${totalReturnPercentage.toFixed(2)}% return on valued investments`
              : "Update current values to calculate"}
          </small>
        </div>

      </section>

      {/* Add investment form */}
      <form
        className="card investment-form"
        onSubmit={handleAddInvestment}
      >
        <h3 className="investment-section-title">
          Add Investment
        </h3>

        <div className="investment-form__fields">

          <label>
            Investment Name

            <input
              className="text-input"
              type="text"
              name="investmentName"
              list="investment-name-suggestions"
              placeholder="Example: 1 Gram Gold"
              value={form.investmentName}
              onChange={handleFormChange}
              required
            />

            <datalist id="investment-name-suggestions">
              {existingInvestmentNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>

          <label>
            Purchase Amount (₹)

            <input
              className="text-input"
              type="number"
              name="purchaseAmount"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              value={form.purchaseAmount}
              onChange={handleFormChange}
              required
            />
          </label>

          <label>
            Purchase Date

            <input
              className="text-input"
              type="date"
              name="purchaseDate"
              value={form.purchaseDate}
              max={getTodayDate()}
              onChange={handleFormChange}
              required
            />
          </label>

        </div>

        <button
          className="button investment-submit-button"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Add Investment"}
        </button>
      </form>

      {/* Messages */}
      {successMessage && (
        <p className="investment-success-message">
          {successMessage}
        </p>
      )}

      {(actionError || investmentErrorMessage) && (
        <p className="error-message">
          {actionError || investmentErrorMessage}
        </p>
      )}

      {/* Investment tracker */}
      <section className="investment-tracker">

        <div className="investment-tracker__heading">
          <h3 className="investment-section-title">
            My Investments
          </h3>

          <p>
            All your previous purchases are included automatically.
          </p>
        </div>

        {isLoadingInvestments ? (
          <p className="loading-message">
            Loading investments...
          </p>
        ) : investmentGroups.length === 0 ? (
          <div className="card investment-empty">
            <p>No investments added yet.</p>
            <p>Add your first investment entry above.</p>
          </div>
        ) : (

          <div className="investment-group-list">

            {investmentGroups.map((group) => (

              <article
                className="card investment-group"
                key={group.investmentName.toLowerCase()}
              >

                {/* Investment heading */}
                <div className="investment-group__header">
                  <h3>{group.investmentName}</h3>

                  <span>
                    {group.entries.length}{" "}
                    {group.entries.length === 1 ? "Entry" : "Entries"}
                  </span>
                </div>

                {/* Investment statistics */}
                <div className="investment-group__stats">

                  <div>
                    <span>Total Entries</span>
                    <strong>{group.entries.length}</strong>
                  </div>

                  <div>
                    <span>Total Investment</span>
                    <strong>
                      {formatCurrency(group.totalInvested)}
                    </strong>
                  </div>

                  <div>
                    <span>Value Per Entry</span>
                    <strong>
                      {group.currentValuePerEntry === null
                        ? "Not updated"
                        : formatCurrency(group.currentValuePerEntry)}
                    </strong>
                  </div>

                  <div>
                    <span>Total Current Value</span>
                    <strong>
                      {group.currentValue === null
                        ? "Not updated"
                        : formatCurrency(group.currentValue)}
                    </strong>
                  </div>

                  {group.currentValue !== null && (
                    <>
                      <div>
                        <span>Profit / Loss</span>

                        <strong
                          className={
                            group.profitLoss >= 0
                              ? "investment-profit"
                              : "investment-loss"
                          }
                        >
                          {formatCurrency(group.profitLoss)}
                        </strong>
                      </div>

                      <div>
                        <span>Return</span>

                        <strong
                          className={
                            group.returnPercentage >= 0
                              ? "investment-profit"
                              : "investment-loss"
                          }
                        >
                          {group.returnPercentage.toFixed(2)}%
                        </strong>
                      </div>
                    </>
                  )}

                </div>

                {/* Update current value */}
                <div className="investment-valuation">

                  <label>
                    Current Value of One Entry (₹)

                    <input
                      className="text-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Example: 8500"
                      value={valuationInputs[group.investmentName] ?? ""}
                      onChange={(event) => {
                        setValuationInputs((previous) => ({
                          ...previous,
                          [group.investmentName]: event.target.value,
                        }));

                        setActionError("");
                        setSuccessMessage("");
                      }}
                    />
                  </label>

                  <button
                    className="button button--small"
                    type="button"
                    disabled={
                      isSaving ||
                      valuationInputs[group.investmentName] === undefined ||
                      valuationInputs[group.investmentName] === ""
                    }
                    onClick={() => handleSaveValuation(group)}
                  >
                    {isSaving
                      ? "Saving..."
                      : "Update Current Value"}
                  </button>

                  {group.latestValuation && (
                    <p className="investment-valuation__date">
                      Last updated:{" "}
                      {formatDate(group.latestValuation.valuationDate)}
                    </p>
                  )}

                </div>

                {/* Purchase and valuation history */}
                <details className="investment-history">

                  <summary>
                    Purchase History ({group.entries.length})
                  </summary>

                  <ul>
                    {group.entries
                      .slice()
                      .sort((a, b) =>
                        (b.purchaseDate || "").localeCompare(
                          a.purchaseDate || ""
                        )
                      )
                      .map((entry) => (

                        <li key={entry.investmentEntryId}>

                          <div>
                            <strong>
                              {formatDate(entry.purchaseDate)}
                            </strong>
                          </div>

                          <div className="investment-history__right">

                            <strong>
                              {formatCurrency(entry.purchaseAmount)}
                            </strong>

                            <button
                              type="button"
                              className="investment-delete-button"
                              aria-label="Delete investment entry"
                              disabled={
                                deletingEntryId === entry.investmentEntryId
                              }
                              onClick={() =>
                                handleDeleteInvestment(
                                  entry.investmentEntryId
                                )
                              }
                            >
                              {deletingEntryId === entry.investmentEntryId
                                ? "..."
                                : "✕"}
                            </button>

                          </div>

                        </li>
                      ))}
                  </ul>

                  {/* Valuation history */}
                  {group.valuationHistory.length > 0 && (

                    <div className="investment-history__valuations">

                      <strong>Value History</strong>

                      {group.valuationHistory.map((valuation) => (

                        <p key={valuation.valuationId}>
                          {formatDate(valuation.valuationDate)}
                          {" — "}
                          {formatCurrency(
                            Number(valuation.currentValuePerEntry) *
                              group.entries.length
                          )}
                        </p>

                      ))}

                    </div>

                  )}

                </details>

              </article>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}
