import { useEffect, useMemo, useState } from "react";
import {
  STEWARDSHIP_TRANSACTION_TYPE_RECEIVED,
  STEWARDSHIP_TRANSACTION_TYPE_RETURNED,
  addStewardshipTransaction,
  subscribeToStewardshipTransactions,
} from "../services/stewardshipFirestoreService";
import {
  calculateTotalBalance,
  groupTransactionsByPerson,
} from "../utils/personBalanceCalculations";
import { getTodayDateInputValue } from "../utils/transactionDateHelpers";

export const useStewardship = (userId) => {
  const [stewardshipTransactions, setStewardshipTransactions] = useState([]);
  const [isLoadingStewardship, setIsLoadingStewardship] = useState(true);
  const [stewardshipErrorMessage, setStewardshipErrorMessage] = useState("");

  useEffect(() => {
    setIsLoadingStewardship(true);

    const unsubscribeFromTransactions = subscribeToStewardshipTransactions({
      userId,
      onTransactionsChanged: (transactions) => {
        setStewardshipTransactions(transactions);
        setIsLoadingStewardship(false);
      },
      onLoadingError: (error) => {
        console.error(error);
        setStewardshipErrorMessage("Could not load stewardship data");
        setIsLoadingStewardship(false);
      },
    });

    return unsubscribeFromTransactions;
  }, [userId]);

  const personBalances = useMemo(
    () =>
      groupTransactionsByPerson({
        transactions: stewardshipTransactions,
        increaseTransactionType: STEWARDSHIP_TRANSACTION_TYPE_RECEIVED,
        decreaseTransactionType: STEWARDSHIP_TRANSACTION_TYPE_RETURNED,
      }),
    [stewardshipTransactions]
  );

  const totalAmountHeldForOthers = useMemo(
    () => calculateTotalBalance(personBalances),
    [personBalances]
  );

  // Returns true when saved, false when failed
  const saveTransaction = async (transactionDetails) => {
    try {
      setStewardshipErrorMessage("");
      await addStewardshipTransaction({ userId, ...transactionDetails });
      return true;
    } catch (error) {
      console.error(error);
      setStewardshipErrorMessage("Could not save. Please try again.");
      return false;
    }
  };

  const receiveMoney = ({ personName, amount, note, transactionDate }) =>
    saveTransaction({
      personName,
      amount,
      note,
      transactionDate,
      transactionType: STEWARDSHIP_TRANSACTION_TYPE_RECEIVED,
    });

  const returnMoney = ({ personName, amount }) =>
    saveTransaction({
      personName,
      amount,
      note: "",
      transactionDate: getTodayDateInputValue(),
      transactionType: STEWARDSHIP_TRANSACTION_TYPE_RETURNED,
    });

  return {
    personBalances,
    totalAmountHeldForOthers,
    isLoadingStewardship,
    stewardshipErrorMessage,
    receiveMoney,
    returnMoney,
  };
};