import { useEffect, useMemo, useState } from "react";
import {
  LENDING_TRANSACTION_TYPE_LENT,
  LENDING_TRANSACTION_TYPE_REPAID,
  addLendingTransaction,
  subscribeToLendingTransactions,
} from "../services/lendingFirestoreService";
import {
  calculateTotalBalance,
  groupTransactionsByPerson,
} from "../utils/personBalanceCalculations";
import { getTodayDateInputValue } from "../utils/transactionDateHelpers";

export const useLending = (userId) => {
  const [lendingTransactions, setLendingTransactions] = useState([]);
  const [isLoadingLending, setIsLoadingLending] = useState(true);
  const [lendingErrorMessage, setLendingErrorMessage] = useState("");

  useEffect(() => {
    setIsLoadingLending(true);

    const unsubscribeFromTransactions = subscribeToLendingTransactions({
      userId,
      onTransactionsChanged: (transactions) => {
        setLendingTransactions(transactions);
        setIsLoadingLending(false);
      },
      onLoadingError: (error) => {
        console.error(error);
        setLendingErrorMessage("Could not load lending data");
        setIsLoadingLending(false);
      },
    });

    return unsubscribeFromTransactions;
  }, [userId]);

  const personBalances = useMemo(
    () =>
      groupTransactionsByPerson({
        transactions: lendingTransactions,
        increaseTransactionType: LENDING_TRANSACTION_TYPE_LENT,
        decreaseTransactionType: LENDING_TRANSACTION_TYPE_REPAID,
      }),
    [lendingTransactions]
  );

  const totalAmountOwedToYou = useMemo(
    () => calculateTotalBalance(personBalances),
    [personBalances]
  );

  // Returns true when saved, false when failed
  const saveTransaction = async (transactionDetails) => {
    try {
      setLendingErrorMessage("");
      await addLendingTransaction({ userId, ...transactionDetails });
      return true;
    } catch (error) {
      console.error(error);
      setLendingErrorMessage("Could not save. Please try again.");
      return false;
    }
  };

  const lendMoney = ({ personName, amount, note, transactionDate }) =>
    saveTransaction({
      personName,
      amount,
      note,
      transactionDate,
      transactionType: LENDING_TRANSACTION_TYPE_LENT,
    });

  const receiveRepayment = ({ personName, amount }) =>
    saveTransaction({
      personName,
      amount,
      note: "",
      transactionDate: getTodayDateInputValue(),
      transactionType: LENDING_TRANSACTION_TYPE_REPAID,
    });

  return {
    personBalances,
    totalAmountOwedToYou,
    isLoadingLending,
    lendingErrorMessage,
    lendMoney,
    receiveRepayment,
  };
};