import { useLending } from "../hooks/useLending";
import { formatMoneyAmount } from "../utils/personBalanceCalculations";
import LendingAddEntryForm from "../components/LendingAddEntryForm";
import LendingPersonCard from "../components/LendingPersonCard";
import "./LendingPage.css";

export default function LendingPage({ loggedInUser }) {
  const {
    personBalances,
    totalAmountOwedToYou,
    isLoadingLending,
    lendingErrorMessage,
    lendMoney,
    receiveRepayment,
  } = useLending(loggedInUser.userId);

  const existingPersonNames = personBalances.map(
    (personBalance) => personBalance.personName,
  );

  const summaryMessage =
    totalAmountOwedToYou > 0
      ? "This is the money you still need to get back from the people listed below."
      : "Everyone has paid you back.";

  return (
    <div className="lending-page">
      <section className="lending-summary">
        <p className="lending-summary__label">Total money to receive</p>
        <p className="lending-summary__amount">
          {formatMoneyAmount(totalAmountOwedToYou)}
        </p>
        <p className="lending-summary__message">{summaryMessage}</p>
      </section>

      <LendingAddEntryForm
        existingPersonNames={existingPersonNames}
        onLendMoney={lendMoney}
      />

      {lendingErrorMessage && (
        <p className="lending-page__error">{lendingErrorMessage}</p>
      )}

      {isLoadingLending ? (
        <p className="lending-page__status-text">Loading...</p>
      ) : personBalances.length === 0 ? (
        <p className="lending-page__status-text">No entries yet.</p>
      ) : (
        <div className="lending-person-list">
          {personBalances.map((personBalance) => (
            <LendingPersonCard
              key={personBalance.personNameKey}
              personBalance={personBalance}
              onReceiveRepayment={receiveRepayment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
