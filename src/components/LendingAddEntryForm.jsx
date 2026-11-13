import { useState } from "react";
import { getTodayDateInputValue } from "../utils/transactionDateHelpers";
import "./LendingAddEntryForm.css";

export default function LendingAddEntryForm({
  existingPersonNames,
  onLendMoney,
}) {
  const [personNameInput, setPersonNameInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [transactionDateInput, setTransactionDateInput] = useState(
    getTodayDateInputValue(),
  );
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedPersonName = personNameInput.trim();
    const parsedAmount = Number(amountInput);

    if (!trimmedPersonName) {
      setFormErrorMessage("Enter the person's name");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setFormErrorMessage("Enter an amount greater than 0");
      return;
    }
    if (
      !transactionDateInput ||
      transactionDateInput > getTodayDateInputValue()
    ) {
      setFormErrorMessage("Date cannot be in the future");
      return;
    }

    setIsSaving(true);
    const wasSaved = await onLendMoney({
      personName: trimmedPersonName,
      amount: parsedAmount,
      note: noteInput,
      transactionDate: transactionDateInput,
    });
    setIsSaving(false);

    if (wasSaved) {
      setPersonNameInput("");
      setAmountInput("");
      setNoteInput("");
      setTransactionDateInput(getTodayDateInputValue());
      setFormErrorMessage("");
    }
  };

  return (
    <form className="lending-add-form" onSubmit={handleSubmit}>
      <h3 className="lending-add-form__title">Money you lent to someone</h3>

      {existingPersonNames.length > 0 && (
        <div className="lending-add-form__chip-row">
          <span className="lending-add-form__chip-label">Tap to reuse:</span>
          {existingPersonNames.map((existingPersonName) => (
            <button
              type="button"
              className="lending-add-form__chip"
              key={existingPersonName}
              onClick={() => setPersonNameInput(existingPersonName)}
            >
              {existingPersonName}
            </button>
          ))}
        </div>
      )}

      <div className="lending-add-form__fields">
        <label className="lending-add-form__field">
          <span className="lending-add-form__field-label">Person name</span>
          <input
            className="lending-add-form__input"
            list="lending-existing-person-names"
            placeholder="e.g. Tharun"
            value={personNameInput}
            onChange={(event) => setPersonNameInput(event.target.value)}
          />
          <datalist id="lending-existing-person-names">
            {existingPersonNames.map((existingPersonName) => (
              <option key={existingPersonName} value={existingPersonName} />
            ))}
          </datalist>
        </label>

        <label className="lending-add-form__field">
          <span className="lending-add-form__field-label">Amount</span>
          <input
            className="lending-add-form__input"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="e.g. 5000"
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
          />
        </label>

        <label className="lending-add-form__field">
          <span className="lending-add-form__field-label">Note (optional)</span>
          <input
            className="lending-add-form__input"
            placeholder="e.g. For bike repair"
            value={noteInput}
            onChange={(event) => setNoteInput(event.target.value)}
          />
        </label>

        <label className="lending-add-form__field">
          <span className="lending-add-form__field-label">Date</span>
          <input
            className="lending-add-form__input"
            type="date"
            max={getTodayDateInputValue()}
            value={transactionDateInput}
            onChange={(event) => setTransactionDateInput(event.target.value)}
          />
        </label>
      </div>

      {formErrorMessage && (
        <p className="lending-add-form__error">{formErrorMessage}</p>
      )}

      <button
        className="lending-add-form__submit-button"
        type="submit"
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Add entry"}
      </button>
    </form>
  );
}
