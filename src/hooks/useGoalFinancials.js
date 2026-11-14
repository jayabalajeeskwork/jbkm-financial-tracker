
import { useState, useMemo } from "react";

import { useWallet } from "./useWallet";
import { useLending } from "./useLending";
import { useStewardship } from "./useStewardship";
import { useInvestments } from "./useInvestments";

export function useGoalFinancials(userId) {

    const [includeInvestments, setIncludeInvestments] = useState(false);

    const {
        totalWalletBalance,
        isLoadingWallet
    } = useWallet(userId);

    const {
        totalAmountOwedToYou,
        isLoadingLending
    } = useLending(userId);

    const {
        totalAmountHeldForOthers,
        isLoadingStewardship
    } = useStewardship(userId);

    const {
        investmentEntries,
        investmentValuations,
        isLoadingInvestments
    } = useInvestments(userId);


    // Calculate investment current value
    const investmentValue = useMemo(() => {

        const groups = {};

        investmentEntries.forEach((entry) => {

            const name = entry.investmentName
                ? entry.investmentName.trim()
                : entry.investmentType?.trim() || "Other Investment";

            const key = name.toLowerCase();

            if (!groups[key]) {
                groups[key] = {
                    name,
                    count: 0
                };
            }

            groups[key].count += 1;

        });

        let total = 0;

        Object.values(groups).forEach((group) => {

            const history = investmentValuations
                .filter(
                    (valuation) =>
                        (valuation.investmentName || "")
                            .trim()
                            .toLowerCase() === group.name.toLowerCase()
                )
                .sort((a, b) =>
                    (b.valuationDate || "").localeCompare(a.valuationDate || "")
                );

            if (history[0]) {

                total +=
                    (Number(history[0].currentValuePerEntry) || 0) *
                    group.count;

            }

        });

        return total;

    }, [investmentEntries, investmentValuations]);


    // Actual net worth - never changes with toggle
    const netWorth =
        totalWalletBalance +
        totalAmountOwedToYou +
        investmentValue -
        totalAmountHeldForOthers;


    // Amount available for goal calculation
    const amountForProcess = includeInvestments
        ? netWorth
        : netWorth - investmentValue;


    // 30% goal allocation
    const goalBudget = Math.max(0, amountForProcess * 0.30);


    const isLoading =
        isLoadingWallet ||
        isLoadingLending ||
        isLoadingStewardship ||
        isLoadingInvestments;


    return {

        netWorth,

        amountForProcess,

        investmentValue,

        goalBudget,

        includeInvestments,

        setIncludeInvestments,

        isLoading

    };

}
