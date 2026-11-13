const padWithZero = (numberValue) => String(numberValue).padStart(2, "0");

export const getTodayDateInputValue = () => {
  const today = new Date();
  return `${today.getFullYear()}-${padWithZero(today.getMonth() + 1)}-${padWithZero(today.getDate())}`;
};

export const formatTransactionDateForDisplay = (transactionDate) =>
  new Date(`${transactionDate}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });