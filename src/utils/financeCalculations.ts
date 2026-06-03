import type {
  FinanceCategory,
  FinanceItem,
  FinanceSubItem,
  MonthlyAmount,
  MonthKey,
  MonthlySummary,
  TrendOption,
  TrendPoint,
} from "../types";
import { formatCompactMonthLabel } from "./dateUtils";

export function getSubItemValue(subItem: FinanceSubItem, monthKey: MonthKey): number {
  return coerceMonthlyAmount(subItem.monthlyAmounts[monthKey]);
}

export function getItemValue(item: FinanceItem, monthKey: MonthKey): number {
  if (item.subItems?.length) {
    return item.subItems.reduce((total, subItem) => total + getSubItemValue(subItem, monthKey), 0);
  }

  return coerceMonthlyAmount(item.monthlyAmounts?.[monthKey]);
}

export function getCategoryValue(category: FinanceCategory, monthKey: MonthKey): number {
  return category.items.reduce((total, item) => total + getItemValue(item, monthKey), 0);
}

export function getCategoryById(
  categories: FinanceCategory[],
  categoryId: string,
): FinanceCategory | undefined {
  return categories.find((category) => category.id === categoryId);
}

export function getMonthlySummary(
  categories: FinanceCategory[],
  monthKey: MonthKey,
): MonthlySummary {
  const totalEarnings = getItemValueById(categories, "total-earnings", monthKey);
  const totalDeductions = getItemValueById(categories, "total-deductions", monthKey);
  const totalTaxes = getItemValueById(categories, "total-taxes", monthKey);
  const totalApartment = getCategoryValueById(categories, "apartment", monthKey);
  const totalExpenses = getCategoryValueById(categories, "expenses", monthKey);
  const totalHondaCrv = getCategoryValueById(categories, "honda-crv", monthKey);
  const totalBankTransfers = getCategoryValueById(categories, "bank-transfers", monthKey);
  const netPosition =
    totalEarnings -
    totalDeductions -
    totalTaxes -
    totalApartment -
    totalExpenses -
    totalHondaCrv -
    totalBankTransfers;

  return {
    monthKey,
    totalEarnings,
    totalDeductions,
    totalTaxes,
    totalApartment,
    totalExpenses,
    totalHondaCrv,
    totalBankTransfers,
    netPosition,
  };
}

export function getTrendValue(
  categories: FinanceCategory[],
  targetId: string,
  monthKey: MonthKey,
): number | null {
  if (targetId === "summary:net-position") {
    if (!hasNetPositionMonthData(categories, monthKey)) {
      return null;
    }

    return getMonthlySummary(categories, monthKey).netPosition;
  }

  const target = findTrendTarget(categories, targetId);

  if (!target) {
    return 0;
  }

  if (target.type === "category") {
    if (!categoryHasNumericMonthValue(target.category, monthKey)) {
      return null;
    }

    return getCategoryValue(target.category, monthKey);
  }

  if (target.type === "item") {
    if (!itemHasNumericMonthValue(target.item, monthKey)) {
      return null;
    }

    if (!target.item.subItems?.length && target.item.monthlyAmounts?.[monthKey] === null) {
      return null;
    }

    return getItemValue(target.item, monthKey);
  }

  if (target.subItem.monthlyAmounts[monthKey] === null) {
    return null;
  }

  return getSubItemValue(target.subItem, monthKey);
}

export function hasTrendValue(
  categories: FinanceCategory[],
  targetId: string,
  monthKey: MonthKey,
): boolean {
  if (targetId === "summary:net-position") {
    return hasMonthData(categories, monthKey);
  }

  const target = findTrendTarget(categories, targetId);

  if (!target) {
    return false;
  }

  if (target.type === "category") {
    return target.category.items.some((item) => itemHasMonthValue(item, monthKey));
  }

  if (target.type === "item") {
    return itemHasMonthValue(target.item, monthKey);
  }

  return Object.prototype.hasOwnProperty.call(target.subItem.monthlyAmounts, monthKey);
}

export function getTrendSeries(
  categories: FinanceCategory[],
  targetId: string,
  monthKeys: MonthKey[],
): TrendPoint[] {
  return monthKeys.map((monthKey) => ({
    monthKey,
    label: formatCompactMonthLabel(monthKey),
    value: getTrendValue(categories, targetId, monthKey),
  }));
}

export function getTrendMonthKeys(categories: FinanceCategory[], targetId: string): MonthKey[] {
  if (targetId === "summary:net-position") {
    return getAllMonthKeys(categories);
  }

  const target = findTrendTarget(categories, targetId);

  if (!target) {
    return [];
  }

  const monthKeys = new Set<MonthKey>();

  if (target.type === "category") {
    target.category.items.forEach((item) => collectItemMonthKeys(item, monthKeys));
  } else if (target.type === "item") {
    collectItemMonthKeys(target.item, monthKeys);
  } else {
    collectMonthlyAmountKeys(target.subItem.monthlyAmounts, monthKeys);
  }

  return [...monthKeys].sort();
}

export function getTrendSeriesFromData(
  categories: FinanceCategory[],
  targetId: string,
): TrendPoint[] {
  return getTrendMonthKeys(categories, targetId).map((monthKey) => ({
    monthKey,
    label: formatCompactMonthLabel(monthKey),
    value: getTrendValue(categories, targetId, monthKey),
  }));
}

export function getFlattenedTrendOptions(categories: FinanceCategory[]): TrendOption[] {
  const summaryOption: TrendOption = {
    id: "summary:net-position",
    label: "Net Position",
    type: "summary",
    path: ["Net Position"],
  };

  return [
    summaryOption,
    ...categories.flatMap((category) => {
      const categoryOption: TrendOption = {
        id: `category:${category.id}`,
        label: category.name,
        type: "category",
        categoryId: category.id,
        path: getTrendPath(category),
      };

      const itemOptions = category.items.flatMap((item) => {
        const itemOption: TrendOption = {
          id: `item:${item.id}`,
          label: item.name,
          type: "item",
          categoryId: category.id,
          itemId: item.id,
          path: [...getTrendPath(category), item.name],
        };

        const subItemOptions =
          item.subItems?.map((subItem) => ({
            id: `subitem:${subItem.id}`,
            label: subItem.name,
            type: "subItem" as const,
            categoryId: category.id,
            itemId: item.id,
            subItemId: subItem.id,
            path: [...getTrendPath(category), item.name, subItem.name],
          })) ?? [];

        return [itemOption, ...subItemOptions];
      });

      return [categoryOption, ...itemOptions];
    }),
  ];
}

export function updateMonthlyAmount(
  categories: FinanceCategory[],
  targetId: string,
  monthKey: MonthKey,
  amount: number | null,
): FinanceCategory[] {
  const [targetType, rawId] = targetId.split(":");

  return categories.map((category) => ({
    ...category,
    items: category.items.map((item) => {
      if (targetType === "item" && item.id === rawId && !item.subItems?.length) {
        return {
          ...item,
          monthlyAmounts: getNextMonthlyAmounts(item.monthlyAmounts ?? {}, monthKey, amount),
        };
      }

      if (!item.subItems?.length) {
        return item;
      }

      return {
        ...item,
        subItems: item.subItems.map((subItem) => {
          if (targetType !== "subitem" || subItem.id !== rawId) {
            return subItem;
          }

          return {
            ...subItem,
            monthlyAmounts: getNextMonthlyAmounts(subItem.monthlyAmounts, monthKey, amount),
          };
        }),
      };
    }),
  }));
}

function getNextMonthlyAmounts(
  monthlyAmounts: Record<MonthKey, MonthlyAmount>,
  monthKey: MonthKey,
  amount: number | null,
): Record<MonthKey, MonthlyAmount> {
  const nextMonthlyAmounts = { ...monthlyAmounts };

  if (amount === null || !Number.isFinite(amount)) {
    nextMonthlyAmounts[monthKey] = null;
    return nextMonthlyAmounts;
  }

  nextMonthlyAmounts[monthKey] = amount;
  return nextMonthlyAmounts;
}

export function hasMonthData(categories: FinanceCategory[], monthKey: MonthKey): boolean {
  return categories.some((category) =>
    category.items.some((item) => itemHasMonthValue(item, monthKey)),
  );
}

export function itemHasMonthValue(item: FinanceItem, monthKey: MonthKey): boolean {
  if (item.subItems?.length) {
    return item.subItems.some((subItem) =>
      Object.prototype.hasOwnProperty.call(subItem.monthlyAmounts, monthKey),
    );
  }

  return Object.prototype.hasOwnProperty.call(item.monthlyAmounts ?? {}, monthKey);
}

function categoryHasNumericMonthValue(category: FinanceCategory, monthKey: MonthKey): boolean {
  return category.items.some((item) => itemHasNumericMonthValue(item, monthKey));
}

function hasNetPositionMonthData(categories: FinanceCategory[], monthKey: MonthKey): boolean {
  return categories
    .filter((category) => !isAccountCategory(category))
    .some((category) => categoryHasNumericMonthValue(category, monthKey));
}

function getTrendPath(category: FinanceCategory): string[] {
  return isAccountCategory(category) ? ["Accounts", category.name] : [category.name];
}

function isAccountCategory(category: FinanceCategory): boolean {
  return category.id.startsWith("account-");
}

function itemHasNumericMonthValue(item: FinanceItem, monthKey: MonthKey): boolean {
  if (item.subItems?.length) {
    return item.subItems.some(
      (subItem) =>
        typeof subItem.monthlyAmounts[monthKey] === "number" &&
        Number.isFinite(subItem.monthlyAmounts[monthKey]),
    );
  }

  return (
    typeof item.monthlyAmounts?.[monthKey] === "number" &&
    Number.isFinite(item.monthlyAmounts[monthKey])
  );
}

function collectItemMonthKeys(item: FinanceItem, monthKeys: Set<MonthKey>) {
  if (item.subItems?.length) {
    item.subItems.forEach((subItem) => collectMonthlyAmountKeys(subItem.monthlyAmounts, monthKeys));
    return;
  }

  collectMonthlyAmountKeys(item.monthlyAmounts ?? {}, monthKeys);
}

function collectMonthlyAmountKeys(
  monthlyAmounts: Record<MonthKey, MonthlyAmount>,
  monthKeys: Set<MonthKey>,
) {
  Object.keys(monthlyAmounts).forEach((monthKey) => monthKeys.add(monthKey));
}

function getAllMonthKeys(categories: FinanceCategory[]): MonthKey[] {
  const monthKeys = new Set<MonthKey>();

  categories.forEach((category) => {
    category.items.forEach((item) => collectItemMonthKeys(item, monthKeys));
  });

  return [...monthKeys].sort();
}

export function getItemMonthValueState(item: FinanceItem, monthKey: MonthKey) {
  const rawValue = item.monthlyAmounts?.[monthKey];

  return {
    value: getItemValue(item, monthKey),
    hasValue: itemHasMonthValue(item, monthKey),
    isNull: rawValue === null,
  };
}

export function getSubItemMonthValueState(subItem: FinanceSubItem, monthKey: MonthKey) {
  const rawValue = subItem.monthlyAmounts[monthKey];

  return {
    value: getSubItemValue(subItem, monthKey),
    hasValue: Object.prototype.hasOwnProperty.call(subItem.monthlyAmounts, monthKey),
    isNull: rawValue === null,
  };
}

function coerceMonthlyAmount(amount: MonthlyAmount | undefined): number {
  return typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
}

function getCategoryValueById(
  categories: FinanceCategory[],
  categoryId: string,
  monthKey: MonthKey,
): number {
  const category = categories.find((candidate) => candidate.id === categoryId);
  return category ? getCategoryValue(category, monthKey) : 0;
}

function getItemValueById(
  categories: FinanceCategory[],
  itemId: string,
  monthKey: MonthKey,
): number {
  for (const category of categories) {
    const item = category.items.find((candidate) => candidate.id === itemId);

    if (item) {
      return getItemValue(item, monthKey);
    }
  }

  return 0;
}

type FoundTrendTarget =
  | { type: "category"; category: FinanceCategory }
  | { type: "item"; category: FinanceCategory; item: FinanceItem }
  | {
      type: "subItem";
      category: FinanceCategory;
      item: FinanceItem;
      subItem: FinanceSubItem;
    };

function findTrendTarget(
  categories: FinanceCategory[],
  targetId: string,
): FoundTrendTarget | undefined {
  const [targetType, rawId] = targetId.split(":");

  for (const category of categories) {
    if (targetType === "category" && category.id === rawId) {
      return { type: "category", category };
    }

    for (const item of category.items) {
      if (targetType === "item" && item.id === rawId) {
        return { type: "item", category, item };
      }

      const subItem = item.subItems?.find((candidate) => candidate.id === rawId);

      if (targetType === "subitem" && subItem) {
        return { type: "subItem", category, item, subItem };
      }
    }
  }

  return undefined;
}
