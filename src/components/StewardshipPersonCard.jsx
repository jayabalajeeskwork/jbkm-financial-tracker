import { useState } from "react";
import { formatMoneyAmount } from "../utils/personBalanceCalculations";
import { formatTransactionDateForDisplay } from "../utils/transactionDateHelpers";
import "./StewardshipPersonCard.css";

export default function StewardshipPersonCard({
  personBalance,
  onReturnMoney,
  onDeleteTransaction,
}) {
  const [returnAmountInput, setReturnAmountInput] = useState("");
  const [returnErrorMessage, setReturnErrorMessage] = useState("");
  const [isSavingReturn, setIsSavingReturn] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState(null);

  const isSettled = personBalance.currentBalance <= 0;

  const handleReturnSubmit = async (event) => {
    event.preventDefault();
    const returnAmount = Number(returnAmountInput);

    if (!returnAmount || returnAmount <= 0) {
      setReturnErrorMessage("Enter an amount greater than 0");
      return;
    }

    if (returnAmount > personBalance.currentBalance) {
      setReturnErrorMessage(
        `You are only holding ${formatMoneyAmount(personBalance.currentBalance)} for ${personBalance.personName}`,
      );
      return;
    }

    setIsSavingReturn(true);
    const wasSaved = await onReturnMoney({
      personName: personBalance.personName,
      amount: returnAmount,
    });
    setIsSavingReturn(false);

    if (wasSaved) {
      setReturnAmountInput("");
      setReturnErrorMessage("");
    }
  };

  // Delete individual history entry
  const handleDeleteTransaction = async (transaction) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${transaction.transactionType} entry of ${formatMoneyAmount(transaction.amount)} for ${personBalance.personName}?`,
    );

    if (!confirmed) return;

    setDeletingTransactionId(transaction.transactionId);

    const wasDeleted = await onDeleteTransaction(transaction.transactionId);

    setDeletingTransactionId(null);

    if (!wasDeleted) {
      setReturnErrorMessage("Could not delete this entry. Please try again.");
    } else {
      setReturnErrorMessage("");
    }
  };

  return (
    <article
      className={
        isSettled
          ? "stewardship-person-card stewardship-person-card--settled"
          : "stewardship-person-card"
      }
    >
      <header className="stewardship-person-card__header">
        <div>
          <h3 className="stewardship-person-card__name">
            {personBalance.personName}
          </h3>
          <p className="stewardship-person-card__caption">
            {isSettled ? "Settled" : "You need to give back"}
          </p>
        </div>
        <strong className="stewardship-person-card__balance">
          {formatMoneyAmount(personBalance.currentBalance)}
        </strong>
      </header>

      {!isSettled && (
        <form
          className="stewardship-person-card__return-form"
          onSubmit={handleReturnSubmit}
        >
          <input
            className="stewardship-person-card__return-input"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="Amount returned"
            aria-label={`Amount returned to ${personBalance.personName}`}
            value={returnAmountInput}
            onChange={(event) => setReturnAmountInput(event.target.value)}
          />
          <button
            className="stewardship-person-card__return-button"
            type="submit"
            disabled={isSavingReturn}
          >
            {isSavingReturn ? "..." : "Update"}
          </button>
        </form>
      )}

      {returnErrorMessage && (
        <p className="stewardship-person-card__error">{returnErrorMessage}</p>
      )}

      <button
        type="button"
        className="stewardship-person-card__history-toggle"
        onClick={() => setIsHistoryOpen((previousValue) => !previousValue)}
      >
        {isHistoryOpen
          ? "Hide history ▲"
          : `Show history (${personBalance.personTransactions.length}) ▼`}
      </button>

      {isHistoryOpen && (
        <ul className="stewardship-person-card__history">
          {personBalance.personTransactions.map((transaction) => {
            const isReceived = transaction.transactionType === "received";
            const isDeleting =
              deletingTransactionId === transaction.transactionId;

            return (
              <li
                className="stewardship-person-card__history-item"
                key={transaction.transactionId}
              >
                <div>
                  <p className="stewardship-person-card__history-date">
                    {formatTransactionDateForDisplay(
                      transaction.transactionDate,
                    )}{" "}
                    · {isReceived ? "Received" : "Returned"}
                  </p>

                  {transaction.note && (
                    <p className="stewardship-person-card__history-note">
                      {transaction.note}
                    </p>
                  )}
                </div>

                <strong
                  className={
                    isReceived
                      ? "stewardship-person-card__history-amount stewardship-person-card__history-amount--received"
                      : "stewardship-person-card__history-amount stewardship-person-card__history-amount--returned"
                  }
                >
                  {isReceived ? "+" : "−"}
                  {formatMoneyAmount(transaction.amount)}
                </strong>

                <button
                  type="button"
                  className="stewardship-person-card__delete-button"
                  disabled={isDeleting || Boolean(deletingTransactionId)}
                  onClick={() => handleDeleteTransaction(transaction)}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
