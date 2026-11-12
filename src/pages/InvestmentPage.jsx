
import { useMemo, useState } from "react";

import { useInvestments } from "../hooks/useInvestments";
import "../styles/InvestmentPage.css";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
  } = useInvestments(loggedInUser.userId);

  const [form, setForm] = useState({
    investmentType: "",
    quantity: "",
    unit: "Gram",
    purchaseAmount: "",
    purchaseDate: getTodayDate(),
  });

  const [valuationInputs, setValuationInputs] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Group all purchases by investment type
  const investmentGroups = useMemo(() => {
    const groups = {};

    investmentEntries.forEach((entry) => {
      const key = entry.investmentType.trim().toLowerCase();

      if (!groups[key]) {
        groups[key] = {
          investmentType: entry.investmentType,
          totalInvested: 0,
          quantityByUnit: {},
          entries: [],
        };
      }

      groups[key].totalInvested += Number(entry.purchaseAmount) || 0;

      const unit = entry.unit || "Unit";

      groups[key].quantityByUnit[unit] =
        (groups[key].quantityByUnit[unit] || 0) +
        (Number(entry.quantity) || 0);

      groups[key].entries.push(entry);
    });

    return Object.values(groups).map((group) => {
      const categoryValuations = investmentValuations
        .filter(
          (valuation) =>
            valuation.investmentType.trim().toLowerCase() ===
            group.investmentType.trim().toLowerCase()
        )
        .sort((a, b) =>
          (b.valuationDate || "").localeCompare(a.valuationDate || "")
        );

      const latestValuation = categoryValuations[0] || null;
      const currentValue = latestValuation
        ? Number(latestValuation.currentValue)
        : null;

      const profitLoss =
        currentValue === null ? null : currentValue - group.totalInvested;

      const returnPercentage =
        currentValue === null || group.totalInvested === 0
          ? null
          : (profitLoss / group.totalInvested) * 100;

      return {
        ...group,
        latestValuation,
        currentValue,
        profitLoss,
        returnPercentage,
        valuationHistory: categoryValuations,
      };
    });
  }, [investmentEntries, investmentValuations]);

  const totalInvested = investmentGroups.reduce(
    (total, group) => total + group.totalInvested,
    0
  );

  const totalCurrentValue = investmentGroups.reduce(
    (total, group) => total + (group.currentValue ?? 0),
    0
  );

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleAddInvestment = async (event) => {
    event.preventDefault();

    if (
      !form.investmentType.trim() ||
      !form.quantity ||
      !form.purchaseAmount ||
      !form.purchaseDate
    ) {
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");

    try {
      await addEntry(form);

      setForm((previousForm) => ({
        ...previousForm,
        investmentType: "",
        quantity: "",
        purchaseAmount: "",
      }));

      setSuccessMessage("Investment purchase added successfully.");
    } catch {
      // Error is displayed from the hook.
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveValuation = async (group) => {
    const currentValue = valuationInputs[group.investmentType];

    if (currentValue === undefined || currentValue === "") {
      return;
    }

    if (!Number.isFinite(Number(currentValue)) || Number(currentValue) < 0) {
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");

    try {
      await saveValuation({
        investmentType: group.investmentType,
        currentValue,
        valuationDate: getTodayDate(),
      });

      setValuationInputs((previous) => ({
        ...previous,
        [group.investmentType]: "",
      }));

      setSuccessMessage(
        `${group.investmentType} current value saved successfully.`
      );
    } catch {
      // Error is displayed from the hook.
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-stack investment-page">
      <div className="investment-page__heading">
        <h2>Investment Tracker</h2>
        <p>Record purchases and track the current value of your investments.</p>
      </div>

      <section className="investment-summary">
        <div className="card investment-summary__card">
          <p className="investment-summary__label">Total invested</p>
          <p className="investment-summary__amount">
            {formatCurrency(totalInvested)}
          </p>
        </div>

        <div className="card investment-summary__card">
          <p className="investment-summary__label">Latest total value</p>
          <p className="investment-summary__amount">
            {formatCurrency(totalCurrentValue)}
          </p>
        </div>

        <div className="card investment-summary__card">
          <p className="investment-summary__label">Overall profit / loss</p>
          <p
            className={`investment-summary__amount ${
              totalCurrentValue - totalInvested >= 0
                ? "investment-profit"
                : "investment-loss"
            }`}
          >
            {formatCurrency(totalCurrentValue - totalInvested)}
          </p>
        </div>
      </section>

      <form className="card investment-form" onSubmit={handleAddInvestment}>
        <h3 className="investment-section-title">Add Investment Purchase</h3>

        <div className="investment-form__fields">
          <label>
            Investment name
            <input
              className="text-input"
              type="text"
              name="investmentType"
              placeholder="Gold, Silver, Mutual Fund..."
              value={form.investmentType}
              onChange={handleFormChange}
              required
            />
          </label>

          <label>
            Quantity
            <input
              className="text-input"
              type="number"
              name="quantity"
              min="0.001"
              step="any"
              placeholder="Example: 1"
              value={form.quantity}
              onChange={handleFormChange}
              required
            />
          </label>

          <label>
            Unit
            <select
              className="text-input"
              name="unit"
              value={form.unit}
              onChange={handleFormChange}
            >
              <option value="Gram">Gram</option>
              <option value="Kg">Kg</option>
              <option value="Unit">Unit</option>
              <option value="Share">Share</option>
              <option value="Coin">Coin</option>
              <option value="Quantity">Quantity</option>
            </select>
          </label>

          <label>
            Purchase amount (₹)
            <input
              className="text-input"
              type="number"
              name="purchaseAmount"
              min="0.01"
              step="0.01"
              placeholder="Example: 7000"
              value={form.purchaseAmount}
              onChange={handleFormChange}
              required
            />
          </label>

          <label>
            Purchase date
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

        <button className="button" type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Add Investment"}
        </button>
      </form>

      {successMessage && (
        <p className="investment-success-message">{successMessage}</p>
      )}

      {investmentErrorMessage && (
        <p className="error-message">{investmentErrorMessage}</p>
      )}

      <section className="investment-tracker">
        <div className="investment-tracker__heading">
          <h3 className="investment-section-title">My Investments</h3>
          <p>Category-wise purchase totals and current valuations.</p>
        </div>

        {isLoadingInvestments ? (
          <p className="loading-message">Loading investments...</p>
        ) : investmentGroups.length === 0 ? (
          <div className="card investment-empty">
            <p>No investments added yet.</p>
            <p>Add your first purchase using the form above.</p>
          </div>
        ) : (
          <div className="investment-group-list">
            {investmentGroups.map((group) => (
              <article
                className="card investment-group"
                key={group.investmentType.toLowerCase()}
              >
                <div className="investment-group__header">
                  <h3>{group.investmentType}</h3>
                  <span>
                    {group.entries.length} purchase
                    {group.entries.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="investment-group__stats">
                  <div>
                    <span>Total quantity</span>
                    <strong>
                      {Object.entries(group.quantityByUnit)
                        .map(([unit, quantity]) => `${quantity} ${unit}`)
                        .join(" + ")}
                    </strong>
                  </div>

                  <div>
                    <span>Total invested</span>
                    <strong>{formatCurrency(group.totalInvested)}</strong>
                  </div>

                  <div>
                    <span>Current total value</span>
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

                <div className="investment-valuation">
                  <label>
                    Update total current value (₹)
                    <input
                      className="text-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter value of all holdings"
                      value={valuationInputs[group.investmentType] ?? ""}
                      onChange={(event) =>
                        setValuationInputs((previous) => ({
                          ...previous,
                          [group.investmentType]: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <button
                    className="button button--small"
                    type="button"
                    disabled={
                      isSaving ||
                      valuationInputs[group.investmentType] === undefined ||
                      valuationInputs[group.investmentType] === ""
                    }
                    onClick={() => handleSaveValuation(group)}
                  >
                    Save current value
                  </button>

                  {group.latestValuation && (
                    <p className="investment-valuation__date">
                      Last updated:{" "}
                      {formatDate(group.latestValuation.valuationDate)}
                    </p>
                  )}
                </div>

                <details className="investment-history">
                  <summary>Purchase history ({group.entries.length})</summary>

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
                              {entry.quantity} {entry.unit}
                            </strong>
                            <span>{formatDate(entry.purchaseDate)}</span>
                          </div>

                          <div className="investment-history__right">
                            <strong>
                              {formatCurrency(entry.purchaseAmount)}
                            </strong>

                            <button
                              type="button"
                              className="investment-delete-button"
                              aria-label="Delete investment purchase"
                              onClick={() =>
                                deleteEntry(entry.investmentEntryId)
                              }
                            >
                              ✕
                            </button>
                          </div>
                        </li>
                      ))}
                  </ul>

                  {group.valuationHistory.length > 0 && (
                    <div className="investment-history__valuations">
                      <strong>Valuation history</strong>

                      {group.valuationHistory.map((valuation) => (
                        <p key={valuation.valuationId}>
                          {formatDate(valuation.valuationDate)} —{" "}
                          {formatCurrency(valuation.currentValue)}
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
