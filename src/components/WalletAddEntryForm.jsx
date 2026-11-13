
import { useEffect, useState } from "react";
import { getTodayDateInputValue } from "../utils/transactionDateHelpers";
import {
  WALLET_TRANSACTION_TYPE_DEPOSIT,
  WALLET_TRANSACTION_TYPE_WITHDRAW,
} from "../services/walletFirestoreService";
import "./WalletAddEntryForm.css";

export default function WalletAddEntryForm({
  editingTransaction,
  onSaveTransaction,
  onCancelEdit,
}) {
  const [sourceName, setSourceName] = useState("");
  const [transactionType, setTransactionType] = useState(
    WALLET_TRANSACTION_TYPE_DEPOSIT
  );
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    getTodayDateInputValue()
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState("");

  useEffect(() => {
    if (editingTransaction) {
      setSourceName(editingTransaction.sourceName);
      setTransactionType(editingTransaction.transactionType);
      setAmount(String(editingTransaction.amount));
      setNote(editingTransaction.note || "");
      setTransactionDate(editingTransaction.transactionDate);
    } else {
      resetForm();
    }

    setFormErrorMessage("");
  }, [editingTransaction]);

  const resetForm = () => {
    setSourceName("");
    setTransactionType(WALLET_TRANSACTION_TYPE_DEPOSIT);
    setAmount("");
    setNote("");
    setTransactionDate(getTodayDateInputValue());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormErrorMessage("");

    if (!sourceName.trim()) {
      setFormErrorMessage("Enter a source name.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setFormErrorMessage("Enter an amount greater than 0.");
      return;
    }

    if (!transactionDate) {
      setFormErrorMessage("Select a transaction date.");
      return;
    }

    const action = editingTransaction ? "update" : "add";
    const typeLabel =
      transactionType === WALLET_TRANSACTION_TYPE_DEPOSIT
        ? "Deposit"
        : "Withdrawal";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this ${typeLabel}?\n\nSource: ${sourceName}\nAmount: ₹${Number(amount).toFixed(2)}`
    );

    if (!confirmed) return;

    setIsSaving(true);

    const wasSaved = await onSaveTransaction(
      {
        sourceName,
        transactionType,
        amount,
        note,
        transactionDate,
      },
      editingTransaction?.transactionId || null
    );

    setIsSaving(false);

    if (wasSaved) {
      resetForm();
      setFormErrorMessage("");

      if (editingTransaction) {
        onCancelEdit();
      }
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setFormErrorMessage("");
    onCancelEdit();
  };

  return (
    <section className="wallet-form-section">
      <h2 className="wallet-form-section__title">
        {editingTransaction ? "Edit Transaction" : "Add Wallet Entry"}
      </h2>

      <form className="wallet-form" onSubmit={handleSubmit}>
        <div className="wallet-form__field">
          <label htmlFor="wallet-source-name">Source / Account Name</label>
          <input
            id="wallet-source-name"
            type="text"
            placeholder="Example: SBI Bank"
            value={sourceName}
            onChange={(event) => setSourceName(event.target.value)}
          />
        </div>

        <div className="wallet-form__field">
          <label htmlFor="wallet-transaction-type">Transaction Type</label>
          <select
            id="wallet-transaction-type"
            value={transactionType}
            onChange={(event) => setTransactionType(event.target.value)}
          >
            <option value={WALLET_TRANSACTION_TYPE_DEPOSIT}>
              Deposit
            </option>
            <option value={WALLET_TRANSACTION_TYPE_WITHDRAW}>
              Withdraw
            </option>
          </select>
        </div>

        <div className="wallet-form__field">
          <label htmlFor="wallet-amount">Amount</label>
          <input
            id="wallet-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>

        <div className="wallet-form__field">
          <label htmlFor="wallet-note">Note</label>
          <input
            id="wallet-note"
            type="text"
            placeholder="Example: Salary"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <div className="wallet-form__field">
          <label htmlFor="wallet-date">Date</label>
          <input
            id="wallet-date"
            type="date"
            value={transactionDate}
            onChange={(event) => setTransactionDate(event.target.value)}
          />
        </div>

        {formErrorMessage && (
          <p className="wallet-form__error">{formErrorMessage}</p>
        )}

        <div className="wallet-form__actions">
          <button
            type="submit"
            className="wallet-form__submit"
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : editingTransaction
                ? "Update Transaction"
                : "Add Transaction"}
          </button>

          {editingTransaction && (
            <button
              type="button"
              className="wallet-form__cancel"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
