import { useState } from "react";
import { getTodayDateInputValue } from "../utils/transactionDateHelpers";
import "./StewardshipAddEntryForm.css";

export default function StewardshipAddEntryForm({
  existingPersonNames,
  onReceiveMoney,
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
    const wasSaved = await onReceiveMoney({
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
    <form className="stewardship-add-form" onSubmit={handleSubmit}>
      <h3 className="stewardship-add-form__title">
        Money received from someone
      </h3>

      {existingPersonNames.length > 0 && (
        <div className="stewardship-add-form__chip-row">
          <span className="stewardship-add-form__chip-label">
            Tap to reuse:
          </span>
          {existingPersonNames.map((existingPersonName) => (
            <button
              type="button"
              className="stewardship-add-form__chip"
              key={existingPersonName}
              onClick={() => setPersonNameInput(existingPersonName)}
            >
              {existingPersonName}
            </button>
          ))}
        </div>
      )}

      <div className="stewardship-add-form__fields">
        <label className="stewardship-add-form__field">
          <span className="stewardship-add-form__field-label">Person name</span>
          <input
            className="stewardship-add-form__input"
            list="stewardship-existing-person-names"
            placeholder="e.g. Appa"
            value={personNameInput}
            onChange={(event) => setPersonNameInput(event.target.value)}
          />
          <datalist id="stewardship-existing-person-names">
            {existingPersonNames.map((existingPersonName) => (
              <option key={existingPersonName} value={existingPersonName} />
            ))}
          </datalist>
        </label>

        <label className="stewardship-add-form__field">
          <span className="stewardship-add-form__field-label">Amount</span>
          <input
            className="stewardship-add-form__input"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="e.g. 50000"
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
          />
        </label>

        <label className="stewardship-add-form__field">
          <span className="stewardship-add-form__field-label">
            Note (optional)
          </span>
          <input
            className="stewardship-add-form__input"
            placeholder="e.g. For Service"
            value={noteInput}
            onChange={(event) => setNoteInput(event.target.value)}
          />
        </label>

        <label className="stewardship-add-form__field">
          <span className="stewardship-add-form__field-label">Date</span>
          <input
            className="stewardship-add-form__input"
            type="date"
            max={getTodayDateInputValue()}
            value={transactionDateInput}
            onChange={(event) => setTransactionDateInput(event.target.value)}
          />
        </label>
      </div>

      {formErrorMessage && (
        <p className="stewardship-add-form__error">{formErrorMessage}</p>
      )}

      <button
        className="stewardship-add-form__submit-button"
        type="submit"
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Add entry"}
      </button>
    </form>
  );
}
