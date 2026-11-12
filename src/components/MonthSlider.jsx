import {
  formatMonthLabel,
  getCurrentMonthKey,
  getPreviousMonthKey,
  shiftMonthKey,
} from "../utils/monthUtilities";

export default function MonthSlider({ selectedMonthKey, onMonthChange }) {
  const isPreviousMonthButtonDisabled =
    selectedMonthKey === getPreviousMonthKey();
  // Next is disabled on the current month, so future months can never be opened
  const isNextMonthButtonDisabled = selectedMonthKey === getCurrentMonthKey();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <button
        disabled={isPreviousMonthButtonDisabled}
        onClick={() => onMonthChange(shiftMonthKey(selectedMonthKey, -1))}
      >
        ◀
      </button>
      <strong style={{ minWidth: 160, textAlign: "center" }}>
        {formatMonthLabel(selectedMonthKey)}
      </strong>
      <button
        disabled={isNextMonthButtonDisabled}
        onClick={() => onMonthChange(shiftMonthKey(selectedMonthKey, 1))}
      >
        ▶
      </button>
    </div>
  );
}
