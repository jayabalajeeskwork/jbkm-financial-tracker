
import { useMemo } from "react";

import { useWallet } from "../hooks/useWallet";
import { useLending } from "../hooks/useLending";
import { useStewardship } from "../hooks/useStewardship";
import { useInvestments } from "../hooks/useInvestments";

import { formatMoneyAmount } from "../utils/personBalanceCalculations";
import "./DashboardPage.css";
import YearlyExpenseChart from "../components/YearlyExpenseChart";
// Supports older investment records too
const getInvestmentName = (entry) => {
  if (entry.investmentName) {
    return entry.investmentName.trim();
  }

  if (entry.investmentType && entry.quantity && entry.unit) {
    return `${entry.quantity} ${entry.unit} ${entry.investmentType}`.trim();
  }

  return entry.investmentType?.trim() || "Other Investment";
};

export default function DashboardPage({ loggedInUser }) {
  const userId = loggedInUser?.userId;

  // Wallet
  const {
    walletSources,
    totalWalletBalance,
    isLoadingWallet,
  } = useWallet(userId);

  // Lending
  const {
    totalAmountOwedToYou,
    isLoadingLending,
  } = useLending(userId);

  // Stewardship
  const {
    totalAmountHeldForOthers,
    isLoadingStewardship,
  } = useStewardship(userId);

  // Investments
  const {
    investmentEntries,
    investmentValuations,
    isLoadingInvestments,
  } = useInvestments(userId);

  // Calculate current investment value
  const investmentSummary = useMemo(() => {
    const groups = {};

    investmentEntries.forEach((entry) => {
      const name = getInvestmentName(entry);
      const key = name.toLowerCase();

      if (!groups[key]) {
        groups[key] = {
          investmentName: name,
          totalInvested: 0,
          entryCount: 0,
        };
      }

      groups[key].totalInvested += Number(entry.purchaseAmount) || 0;
      groups[key].entryCount += 1;
    });

    let totalCurrentValue = 0;
    let totalInvestedInValuedGroups = 0;
    let unvaluedInvestmentAmount = 0;
    let valuedGroupCount = 0;

    Object.values(groups).forEach((group) => {
      const history = investmentValuations
        .filter(
          (valuation) =>
            (valuation.investmentName || "").trim().toLowerCase() ===
            group.investmentName.toLowerCase()
        )
        .sort((a, b) =>
          (b.valuationDate || "").localeCompare(a.valuationDate || "")
        );

      const latestValuation = history[0];

      if (latestValuation) {
        const valuePerEntry =
          Number(latestValuation.currentValuePerEntry) || 0;

        totalCurrentValue += valuePerEntry * group.entryCount;
        totalInvestedInValuedGroups += group.totalInvested;
        valuedGroupCount += 1;
      } else {
        unvaluedInvestmentAmount += group.totalInvested;
      }
    });

    return {
      totalCurrentValue,
      totalInvestedInValuedGroups,
      unvaluedInvestmentAmount,
      valuedGroupCount,
      totalInvestmentGroups: Object.keys(groups).length,
    };
  }, [investmentEntries, investmentValuations]);

  // Net worth calculation
  const totalAssets =
    totalWalletBalance +
    totalAmountOwedToYou +
    investmentSummary.totalCurrentValue;

  const totalLiabilities = totalAmountHeldForOthers;

  const netWorth = totalAssets - totalLiabilities;

  const isLoading =
    isLoadingWallet ||
    isLoadingLending ||
    isLoadingStewardship ||
    isLoadingInvestments;

  if (isLoading) {
    return (
      <div className="page-stack dashboard-page">
        <h1 className="dashboard-heading">Dashboard</h1>
        <p className="loading-message">Loading your financial overview...</p>
      </div>
    );
  }

  return (
    <div className="page-stack dashboard-page">

      <div className="dashboard-page__heading">
        <h1>Dashboard</h1>
        <p>Your complete financial overview.</p>
      </div>

      {/* Net Worth */}
      <section className="dashboard-net-worth">
        <p className="dashboard-net-worth__label">Your Net Worth</p>

        <h2 className="dashboard-net-worth__amount">
          {formatMoneyAmount(netWorth)}
        </h2>

        <p className="dashboard-net-worth__note">
          Total assets minus total liabilities
        </p>
      </section>

      {/* Assets */}
      <section className="dashboard-section">
        <h2 className="dashboard-section__title">Your Assets</h2>

        <div className="dashboard-card-grid">

          <article className="card dashboard-finance-card">
            <p>Wallet Balance</p>
            <h3>{formatMoneyAmount(totalWalletBalance)}</h3>
            <small>{walletSources.length} wallet sources</small>
          </article>

          <article className="card dashboard-finance-card">
            <p>Money to Receive</p>
            <h3>{formatMoneyAmount(totalAmountOwedToYou)}</h3>
            <small>Outstanding lending balance</small>
          </article>

          <article className="card dashboard-finance-card">
            <p>Investment Current Value</p>
            <h3>
              {formatMoneyAmount(investmentSummary.totalCurrentValue)}
            </h3>
            <small>
              {investmentSummary.valuedGroupCount} of{" "}
              {investmentSummary.totalInvestmentGroups} categories valued
            </small>
          </article>

        </div>
      </section>

      {/* Liabilities */}
      <section className="dashboard-section">
        <h2 className="dashboard-section__title">Your Liabilities</h2>

        <div className="dashboard-card-grid">

          <article className="card dashboard-finance-card dashboard-finance-card--liability">
            <p>Stewardship</p>
            <h3>{formatMoneyAmount(totalAmountHeldForOthers)}</h3>
            <small>Money you are holding for others</small>
          </article>

        </div>
      </section>

      {/* Financial Summary */}
      <section className="card dashboard-breakdown">
        <h2>Net Worth Breakdown</h2>

        <div className="dashboard-breakdown__row">
          <span>Total Assets</span>
          <strong>{formatMoneyAmount(totalAssets)}</strong>
        </div>

        <div className="dashboard-breakdown__row">
          <span>Total Liabilities</span>
          <strong className="dashboard-negative">
            − {formatMoneyAmount(totalLiabilities)}
          </strong>
        </div>

        <div className="dashboard-breakdown__row dashboard-breakdown__row--total">
          <span>Net Worth</span>
          <strong>{formatMoneyAmount(netWorth)}</strong>
        </div>
      </section>

      {/* Investments not yet valued */}
      {investmentSummary.unvaluedInvestmentAmount > 0 && (
        <section className="dashboard-unvalued">
          <strong>Investments waiting for valuation</strong>
          <p>
            Purchase amount not yet included in net worth:{" "}
            {formatMoneyAmount(investmentSummary.unvaluedInvestmentAmount)}
          </p>
          <small>
            Update their current values in your Investment page for a more
            complete net worth calculation.
          </small>
        </section>

      )}



{/* Last 12 Months Expense Chart */}
<YearlyExpenseChart userId={userId} />
    </div>
  );
}
