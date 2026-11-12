export const normalizeCategoryName = (categoryName) =>
  categoryName.trim().replace(/\s+/g, " ").toLowerCase();

export const formatCategoryNameForDisplay = (categoryName) => {
  const trimmedName = categoryName.trim().replace(/\s+/g, " ");
  return trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1);
};

// "food" and "Food " are treated as the same category
export const groupExpensesByCategory = (expenseEntries) => {
  const categoryGroupsByNormalizedName = {};

  expenseEntries.forEach((expenseEntry) => {
    const normalizedCategoryName = normalizeCategoryName(expenseEntry.categoryName);

    if (!categoryGroupsByNormalizedName[normalizedCategoryName]) {
      categoryGroupsByNormalizedName[normalizedCategoryName] = {
        categoryName: formatCategoryNameForDisplay(expenseEntry.categoryName),
        categoryTotalAmount: 0,
        categoryEntries: [],
      };
    }

    const categoryGroup = categoryGroupsByNormalizedName[normalizedCategoryName];
    categoryGroup.categoryTotalAmount += expenseEntry.amount;
    categoryGroup.categoryEntries.push(expenseEntry);
  });

  return Object.values(categoryGroupsByNormalizedName)
    .map((categoryGroup) => ({
      ...categoryGroup,
      categoryEntries: [...categoryGroup.categoryEntries].sort((firstEntry, secondEntry) =>
        firstEntry.expenseDate.localeCompare(secondEntry.expenseDate)
      ),
    }))
    .sort((firstGroup, secondGroup) => secondGroup.categoryTotalAmount - firstGroup.categoryTotalAmount);
};

export const calculateMonthTotalAmount = (expenseEntries) =>
  expenseEntries.reduce((runningTotal, expenseEntry) => runningTotal + expenseEntry.amount, 0);

export const formatAmountAsCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);