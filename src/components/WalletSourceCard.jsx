
import { useState } from "react";
import { formatMoneyAmount } from "../utils/personBalanceCalculations";
import { formatTransactionDateForDisplay } from "../utils/transactionDateHelpers";
import {
  WALLET_TRANSACTION_TYPE_DEPOSIT,
} from "../services/walletFirestoreService";
import "./WalletSourceCard.css";

export default function WalletSourceCard({
  source,
  onEditTransaction,
  onDeleteTransaction,
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [deletingTransactionId, setDeletingTransactionId] = useState(null);

  const handleDelete = async (transaction) => {
    const typeLabel =
      transaction.transactionType === WALLET_TRANSACTION_TYPE_DEPOSIT
        ? "Deposit"
        : "Withdrawal";

    const confirmed = window.confirm(
      `Are you sure you want to delete this ${typeLabel}?\n\nSource: ${source.sourceName}\nAmount: ${formatMoneyAmount(transaction.amount)}`
    );

    if (!confirmed) return;

    setDeletingTransactionId(transaction.transactionId);

    await onDeleteTransaction(transaction.transactionId);

    setDeletingTransactionId(null);
  };

  return (
    <article className="wallet-source-card">
      <header className="wallet-source-card__header">
        <div>
          <h3 className="wallet-source-card__name">
            {source.sourceName}
          </h3>
          <p className="wallet-source-card__caption">
            Current Balance
          </p>
        </div>

        <strong className="wallet-source-card__balance">
          {formatMoneyAmount(source.currentBalance)}
        </strong>
      </header>

      <button
        type="button"
        className="wallet-source-card__history-toggle"
        onClick={() => setIsHistoryOpen((previous) => !previous)}
      >
        {isHistoryOpen
          ? "Hide transactions ▲"
          : `Show transactions (${source.sourceTransactions.length}) ▼`}
      </button>

      {isHistoryOpen && (
        <ul className="wallet-source-card__history">
          {source.sourceTransactions.map((transaction) => {
            const isDeposit =
              transaction.transactionType ===
              WALLET_TRANSACTION_TYPE_DEPOSIT;

            return (
              <li
                className="wallet-source-card__history-item"
                key={transaction.transactionId}
              >
                <div className="wallet-source-card__details">
                  <p className="wallet-source-card__date">
                    {formatTransactionDateForDisplay(
                      transaction.transactionDate
                    )}
                    {" · "}
                    {isDeposit ? "Deposit" : "Withdraw"}
                  </p>

                  {transaction.note && (
                    <p className="wallet-source-card__note">
                      {transaction.note}
                    </p>
                  )}
                </div>

                <div className="wallet-source-card__right">
                  <strong
                    className={
                      isDeposit
                        ? "wallet-source-card__amount wallet-source-card__amount--deposit"
                        : "wallet-source-card__amount wallet-source-card__amount--withdraw"
                    }
                  >
                    {isDeposit ? "+" : "−"}
                    {formatMoneyAmount(transaction.amount)}
                  </strong>

                  <div className="wallet-source-card__actions">
                    <button
                      type="button"
                      className="wallet-source-card__edit-button"
                      onClick={() => onEditTransaction(transaction)}
                      disabled={Boolean(deletingTransactionId)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="wallet-source-card__delete-button"
                      onClick={() => handleDelete(transaction)}
                      disabled={Boolean(deletingTransactionId)}
                    >
                      {deletingTransactionId === transaction.transactionId
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
