
import { useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { formatMoneyAmount } from "../utils/personBalanceCalculations";
import WalletAddEntryForm from "../components/WalletAddEntryForm";
import WalletSourceCard from "../components/WalletSourceCard";
import "./WalletPage.css";

export default function WalletPage({ loggedInUser }) {
  const {
    walletSources,
    totalWalletBalance,
    isLoadingWallet,
    walletErrorMessage,
    saveWalletTransaction,
    deleteTransaction,
  } = useWallet(loggedInUser.userId);

  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleSaveTransaction = async (details, transactionId) => {
    const wasSaved = await saveWalletTransaction(details, transactionId);

    return wasSaved;
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  return (
    <main className="wallet-page">
      <section className="wallet-summary">
        <p className="wallet-summary__label">
          Total Available Balance
        </p>

        <h1 className="wallet-summary__amount">
          {formatMoneyAmount(totalWalletBalance)}
        </h1>

        <p className="wallet-summary__message">
          Total balance across all your sources
        </p>

        <div className="wallet-summary__source-count">
          {walletSources.length}{" "}
          {walletSources.length === 1 ? "Source" : "Sources"}
        </div>
      </section>

      <WalletAddEntryForm
        editingTransaction={editingTransaction}
        onSaveTransaction={handleSaveTransaction}
        onCancelEdit={handleCancelEdit}
      />

      {walletErrorMessage && (
        <p className="wallet-page__error">
          {walletErrorMessage}
        </p>
      )}

      <section className="wallet-sources-section">
        <h2 className="wallet-sources-section__title">
          Your Wallet Sources
        </h2>

        {isLoadingWallet ? (
          <p className="wallet-page__status">
            Loading wallet...
          </p>
        ) : walletSources.length === 0 ? (
          <p className="wallet-page__status">
            No wallet entries yet. Add your first deposit above.
          </p>
        ) : (
          <div className="wallet-source-list">
            {walletSources.map((source) => (
              <WalletSourceCard
                key={source.sourceKey}
                source={source}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={deleteTransaction}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
