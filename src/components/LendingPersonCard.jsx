import { useState } from "react";
import { formatMoneyAmount } from "../utils/personBalanceCalculations";
import { formatTransactionDateForDisplay } from "../utils/transactionDateHelpers";
import "./LendingPersonCard.css";

export default function LendingPersonCard({
  personBalance,
  onReceiveRepayment,
  onDeleteTransaction,
}) {
  const [repaymentAmountInput, setRepaymentAmountInput] = useState("");
  const [repaymentErrorMessage, setRepaymentErrorMessage] = useState("");
  const [isSavingRepayment, setIsSavingRepayment] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [deletingTransactionId, setDeletingTransactionId] = useState(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

  const isSettled = personBalance.currentBalance <= 0;

  const handleRepaymentSubmit = async (event) => {
    event.preventDefault();
    const repaymentAmount = Number(repaymentAmountInput);

    if (!repaymentAmount || repaymentAmount <= 0) {
      setRepaymentErrorMessage("Enter an amount greater than 0");
      return;
    }

    if (repaymentAmount > personBalance.currentBalance) {
      setRepaymentErrorMessage(
        `${personBalance.personName} only owes you ${formatMoneyAmount(personBalance.currentBalance)}`,
      );
      return;
    }

    const confirmed = window.confirm(
      `Confirm receiving ${formatMoneyAmount(repaymentAmount)} from ${personBalance.personName}?`,
    );

    if (!confirmed) return;

    setIsSavingRepayment(true);

    const wasSaved = await onReceiveRepayment({
      personName: personBalance.personName,
      amount: repaymentAmount,
    });

    setIsSavingRepayment(false);

    if (wasSaved) {
      setRepaymentAmountInput("");
      setRepaymentErrorMessage("");
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    const transactionLabel =
      transaction.transactionType === "lent" ? "Lent" : "Repaid";

    const confirmed = window.confirm(
      `Are you sure you want to delete this ${transactionLabel} entry of ${formatMoneyAmount(transaction.amount)} for ${personBalance.personName}?`,
    );

    if (!confirmed) return;

    setDeletingTransactionId(transaction.transactionId);
    setDeleteErrorMessage("");

    const wasDeleted = await onDeleteTransaction(transaction.transactionId);

    setDeletingTransactionId(null);

    if (!wasDeleted) {
      setDeleteErrorMessage("Could not delete this entry. Please try again.");
    }
  };

  return (
    <article
      className={
        isSettled
          ? "lending-person-card lending-person-card--settled"
          : "lending-person-card"
      }
    >
      <header className="lending-person-card__header">
        <div>
          <h3 className="lending-person-card__name">
            {personBalance.personName}
          </h3>
          <p className="lending-person-card__caption">
            {isSettled ? "Paid back fully" : "Owes you"}
          </p>
        </div>
        <strong className="lending-person-card__balance">
          {formatMoneyAmount(personBalance.currentBalance)}
        </strong>
      </header>

      {!isSettled && (
        <form
          className="lending-person-card__repayment-form"
          onSubmit={handleRepaymentSubmit}
        >
          <input
            className="lending-person-card__repayment-input"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="Amount received back"
            aria-label={`Amount received back from ${personBalance.personName}`}
            value={repaymentAmountInput}
            onChange={(event) => setRepaymentAmountInput(event.target.value)}
          />
          <button
            className="lending-person-card__repayment-button"
            type="submit"
            disabled={isSavingRepayment}
          >
            {isSavingRepayment ? "..." : "Update"}
          </button>
        </form>
      )}

      {repaymentErrorMessage && (
        <p className="lending-person-card__error">{repaymentErrorMessage}</p>
      )}

      <button
        type="button"
        className="lending-person-card__history-toggle"
        onClick={() => setIsHistoryOpen((previousValue) => !previousValue)}
      >
        {isHistoryOpen
          ? "Hide history ▲"
          : `Show history (${personBalance.personTransactions.length}) ▼`}
      </button>

      {isHistoryOpen && (
        <ul className="lending-person-card__history">
          {personBalance.personTransactions.map((transaction) => {
            const isLent = transaction.transactionType === "lent";

            return (
              <li
                className="lending-person-card__history-item"
                key={transaction.transactionId}
              >
                <div>
                  <p className="lending-person-card__history-date">
                    {formatTransactionDateForDisplay(
                      transaction.transactionDate,
                    )}{" "}
                    · {isLent ? "Lent" : "Repaid"}
                  </p>

                  {transaction.note && (
                    <p className="lending-person-card__history-note">
                      {transaction.note}
                    </p>
                  )}
                </div>

                <strong
                  className={
                    isLent
                      ? "lending-person-card__history-amount lending-person-card__history-amount--lent"
                      : "lending-person-card__history-amount lending-person-card__history-amount--repaid"
                  }
                >
                  {isLent ? "+" : "−"}
                  {formatMoneyAmount(transaction.amount)}
                </strong>

                <button
                  type="button"
                  className="lending-person-card__delete-button"
                  disabled={Boolean(deletingTransactionId)}
                  onClick={() => handleDeleteTransaction(transaction)}
                >
                  {deletingTransactionId === transaction.transactionId
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {deleteErrorMessage && (
        <p className="lending-person-card__error">{deleteErrorMessage}</p>
      )}
    </article>
  );
}
