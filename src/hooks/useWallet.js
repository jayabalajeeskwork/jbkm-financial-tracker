
import { useEffect, useMemo, useState } from "react";

import {
  WALLET_TRANSACTION_TYPE_DEPOSIT,
  WALLET_TRANSACTION_TYPE_WITHDRAW,
  addWalletTransaction,
  updateWalletTransaction,
  deleteWalletTransaction,
  subscribeToWalletTransactions,
} from "../services/walletFirestoreService";

export const useWallet = (userId) => {
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [walletErrorMessage, setWalletErrorMessage] = useState("");

  useEffect(() => {
    setIsLoadingWallet(true);

    const unsubscribeFromTransactions = subscribeToWalletTransactions({
      userId,

      onTransactionsChanged: (transactions) => {
        setWalletTransactions(transactions);
        setIsLoadingWallet(false);
      },

      onLoadingError: (error) => {
        console.error(error);
        setWalletErrorMessage("Could not load wallet data");
        setIsLoadingWallet(false);
      },
    });

    return unsubscribeFromTransactions;
  }, [userId]);

  const walletSources = useMemo(() => {
    const sourceMap = new Map();

    walletTransactions.forEach((transaction) => {
      const sourceKey = transaction.sourceName.trim().toLowerCase();

      if (!sourceMap.has(sourceKey)) {
        sourceMap.set(sourceKey, {
          sourceName: transaction.sourceName,
          sourceKey,
          currentBalance: 0,
          sourceTransactions: [],
        });
      }

      const source = sourceMap.get(sourceKey);

      if (
        transaction.transactionType === WALLET_TRANSACTION_TYPE_DEPOSIT
      ) {
        source.currentBalance += Number(transaction.amount);
      } else if (
        transaction.transactionType === WALLET_TRANSACTION_TYPE_WITHDRAW
      ) {
        source.currentBalance -= Number(transaction.amount);
      }

      source.sourceTransactions.push(transaction);
    });

    return Array.from(sourceMap.values())
      .map((source) => ({
        ...source,
        sourceTransactions: [...source.sourceTransactions].sort(
          (a, b) =>
            String(b.transactionDate).localeCompare(
              String(a.transactionDate)
            ) ||
            b.createdAtMilliseconds - a.createdAtMilliseconds
        ),
      }))
      .sort((a, b) => a.sourceName.localeCompare(b.sourceName));
  }, [walletTransactions]);

  const totalWalletBalance = useMemo(
    () =>
      walletSources.reduce(
        (total, source) => total + source.currentBalance,
        0
      ),
    [walletSources]
  );

  const saveWalletTransaction = async (
    transactionDetails,
    transactionId = null
  ) => {
    try {
      setWalletErrorMessage("");

      const sourceName = transactionDetails.sourceName.trim();
      const amount = Number(transactionDetails.amount);

      if (!sourceName || !amount || amount <= 0 || !Number.isFinite(amount)) {
        setWalletErrorMessage("Enter a valid source name and amount.");
        return false;
      }

      const sourceKey = sourceName.toLowerCase();

      // Calculate the balance excluding the transaction being edited.
      const availableBalance = walletTransactions
        .filter(
          (transaction) =>
            transaction.sourceName.trim().toLowerCase() === sourceKey &&
            transaction.transactionId !== transactionId
        )
        .reduce((balance, transaction) => {
          if (
            transaction.transactionType === WALLET_TRANSACTION_TYPE_DEPOSIT
          ) {
            return balance + Number(transaction.amount);
          }

          return balance - Number(transaction.amount);
        }, 0);

      if (
        transactionDetails.transactionType ===
          WALLET_TRANSACTION_TYPE_WITHDRAW &&
        amount > availableBalance
      ) {
        setWalletErrorMessage(
          `Insufficient balance. Available balance is ₹${availableBalance.toFixed(2)}.`
        );
        return false;
      }

      const details = {
        userId,
        ...transactionDetails,
        sourceName,
        amount,
      };

      if (transactionId) {
        await updateWalletTransaction({
          ...details,
          transactionId,
        });
      } else {
        await addWalletTransaction(details);
      }

      return true;
    } catch (error) {
      console.error(error);
      setWalletErrorMessage("Could not save transaction. Please try again.");
      return false;
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      setWalletErrorMessage("");

      await deleteWalletTransaction({
        userId,
        transactionId,
      });

      return true;
    } catch (error) {
      console.error(error);
      setWalletErrorMessage("Could not delete transaction. Please try again.");
      return false;
    }
  };

  return {
    walletTransactions,
    walletSources,
    totalWalletBalance,
    isLoadingWallet,
    walletErrorMessage,
    saveWalletTransaction,
    deleteTransaction,
  };
};
