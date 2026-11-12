import {
  formatMonthLabel,
  getCurrentMonthKey,
  getPreviousMonthKey,
  shiftMonthKey,
} from "../utils/monthUtilities";
import "../styles/MonthSlider.css";

export default function MonthSlider({ selectedMonthKey, onMonthChange }) {
  const isPreviousMonthButtonDisabled = selectedMonthKey === getPreviousMonthKey();
  // Next is disabled on the current month, so future months can never be opened
  const isNextMonthButtonDisabled = selectedMonthKey === getCurrentMonthKey();

  return (
    <div className="card month-slider">
      <button
        className="month-slider__arrow"
        aria-label="Previous month"
        disabled={isPreviousMonthButtonDisabled}
        onClick={() => onMonthChange(shiftMonthKey(selectedMonthKey, -1))}
      >
        ◀
      </button>

      <strong className="month-slider__label">{formatMonthLabel(selectedMonthKey)}</strong>

      <button
        className="month-slider__arrow"
        aria-label="Next month"
        disabled={isNextMonthButtonDisabled}
        onClick={() => onMonthChange(shiftMonthKey(selectedMonthKey, 1))}
      >
        ▶
      </button>
    </div>
  );
}