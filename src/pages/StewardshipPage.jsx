import { useStewardship } from "../hooks/useStewardship";
import { formatMoneyAmount } from "../utils/personBalanceCalculations";
import StewardshipAddEntryForm from "../components/StewardshipAddEntryForm";
import StewardshipPersonCard from "../components/StewardshipPersonCard";
import "./StewardshipPage.css";

export default function StewardshipPage({ loggedInUser }) {
  const {
    personBalances,
    totalAmountHeldForOthers,
    isLoadingStewardship,
    stewardshipErrorMessage,
    receiveMoney,
    returnMoney,
  } = useStewardship(loggedInUser.userId);

  const existingPersonNames = personBalances.map(
    (personBalance) => personBalance.personName,
  );

  const summaryMessage =
    totalAmountHeldForOthers > 0
      ? "This money belongs to others. Do not spend it. Give it back to the people listed below."
      : "No one has given you money to hold.";

  return (
    <div className="stewardship-page">
      <section className="stewardship-summary">
        <p className="stewardship-summary__label">
          Total money you are holding
        </p>
        <p className="stewardship-summary__amount">
          {formatMoneyAmount(totalAmountHeldForOthers)}
        </p>
        <p className="stewardship-summary__message">{summaryMessage}</p>
      </section>

      <StewardshipAddEntryForm
        existingPersonNames={existingPersonNames}
        onReceiveMoney={receiveMoney}
      />

      {stewardshipErrorMessage && (
        <p className="stewardship-page__error">{stewardshipErrorMessage}</p>
      )}

      {isLoadingStewardship ? (
        <p className="stewardship-page__status-text">Loading...</p>
      ) : personBalances.length === 0 ? (
        <p className="stewardship-page__status-text">No entries yet.</p>
      ) : (
        <div className="stewardship-person-list">
          {personBalances.map((personBalance) => (
            <StewardshipPersonCard
              key={personBalance.personNameKey}
              personBalance={personBalance}
              onReturnMoney={returnMoney}
            />
          ))}
        </div>
      )}
    </div>
  );
}
