// Month key format: "YYYY-MM", for example "2026-11"

const padWithZero = (number) => String(number).padStart(2, "0");

export const buildMonthKeyFromDate = (dateObject) =>
  `${dateObject.getFullYear()}-${padWithZero(dateObject.getMonth() + 1)}`;

export const getCurrentMonthKey = () => buildMonthKeyFromDate(new Date());

export const shiftMonthKey = (monthKey, numberOfMonthsToShift) => {
  const [yearNumber, monthNumber] = monthKey.split("-").map(Number);
  const shiftedDate = new Date(yearNumber, monthNumber - 1 + numberOfMonthsToShift, 1);
  return buildMonthKeyFromDate(shiftedDate);
};

export const getPreviousMonthKey = () => shiftMonthKey(getCurrentMonthKey(), -1);

// Only the current month and the previous month are allowed
export const isMonthKeyAllowed = (monthKey) =>
  monthKey === getCurrentMonthKey() || monthKey === getPreviousMonthKey();

export const formatMonthLabel = (monthKey) => {
  const [yearNumber, monthNumber] = monthKey.split("-").map(Number);
  return new Date(yearNumber, monthNumber - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

const buildDateInputValue = (yearNumber, monthNumber, dayNumber) =>
  `${yearNumber}-${padWithZero(monthNumber)}-${padWithZero(dayNumber)}`;

export const getFirstDateOfMonth = (monthKey) => `${monthKey}-01`;

export const getLastDateOfMonth = (monthKey) => {
  const [yearNumber, monthNumber] = monthKey.split("-").map(Number);
  const lastDayNumber = new Date(yearNumber, monthNumber, 0).getDate();
  return buildDateInputValue(yearNumber, monthNumber, lastDayNumber);
};

// Current month: default is today. Previous month: default is its last day.
// The date input also blocks future dates within the current month.
export const getDefaultExpenseDateForMonth = (monthKey) => {
  if (monthKey === getCurrentMonthKey()) {
    const today = new Date();
    return buildDateInputValue(today.getFullYear(), today.getMonth() + 1, today.getDate());
  }
  return getLastDateOfMonth(monthKey);
};

export const getMaximumSelectableDateForMonth = (monthKey) =>
  monthKey === getCurrentMonthKey()
    ? getDefaultExpenseDateForMonth(monthKey)
    : getLastDateOfMonth(monthKey);