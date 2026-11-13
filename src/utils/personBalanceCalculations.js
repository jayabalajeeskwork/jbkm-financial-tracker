const roundToTwoDecimalPlaces = (numberValue) => Math.round(numberValue * 100) / 100;

// "appa", "Appa " and "APPA" are treated as the same person
export const normalizePersonName = (personName) =>
  personName.trim().replace(/\s+/g, " ").toLowerCase();

export const formatPersonNameForDisplay = (personName) => {
  const cleanedPersonName = personName.trim().replace(/\s+/g, " ");
  return cleanedPersonName.charAt(0).toUpperCase() + cleanedPersonName.slice(1);
};

export const formatMoneyAmount = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const sortTransactionsNewestFirst = (firstTransaction, secondTransaction) =>
  secondTransaction.transactionDate.localeCompare(firstTransaction.transactionDate) ||
  secondTransaction.createdAtMilliseconds - firstTransaction.createdAtMilliseconds;

// Groups transactions by person and calculates each person's balance.
// Result is sorted with the highest balance on top.
export const groupTransactionsByPerson = ({
  transactions,
  increaseTransactionType,
  decreaseTransactionType,
}) => {
  const personGroupsByNameKey = {};

  transactions.forEach((transaction) => {
    const personNameKey = normalizePersonName(transaction.personName);

    if (!personGroupsByNameKey[personNameKey]) {
      personGroupsByNameKey[personNameKey] = {
        personNameKey,
        personName: formatPersonNameForDisplay(transaction.personName),
        totalIncreaseAmount: 0,
        totalDecreaseAmount: 0,
        currentBalance: 0,
        personTransactions: [],
      };
    }

    const personGroup = personGroupsByNameKey[personNameKey];

    if (transaction.transactionType === increaseTransactionType) {
      personGroup.totalIncreaseAmount += transaction.amount;
    } else if (transaction.transactionType === decreaseTransactionType) {
      personGroup.totalDecreaseAmount += transaction.amount;
    }

    personGroup.personTransactions.push(transaction);
  });

  return Object.values(personGroupsByNameKey)
    .map((personGroup) => ({
      ...personGroup,
      totalIncreaseAmount: roundToTwoDecimalPlaces(personGroup.totalIncreaseAmount),
      totalDecreaseAmount: roundToTwoDecimalPlaces(personGroup.totalDecreaseAmount),
      currentBalance: roundToTwoDecimalPlaces(
        personGroup.totalIncreaseAmount - personGroup.totalDecreaseAmount
      ),
      personTransactions: [...personGroup.personTransactions].sort(sortTransactionsNewestFirst),
    }))
    .sort(
      (firstPerson, secondPerson) =>
        secondPerson.currentBalance - firstPerson.currentBalance ||
        firstPerson.personName.localeCompare(secondPerson.personName)
    );
};

export const calculateTotalBalance = (personBalances) =>
  roundToTwoDecimalPlaces(
    personBalances.reduce((runningTotal, personBalance) => runningTotal + personBalance.currentBalance, 0)
  );