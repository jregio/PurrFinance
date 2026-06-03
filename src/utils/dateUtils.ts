import type { MonthKey } from "../types";

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

const compactMonthFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  year: "numeric",
});

export function getCurrentMonthKey(): MonthKey {
  const now = new Date();
  return toMonthKey(now.getFullYear(), now.getMonth() + 1);
}

export function formatMonthLabel(monthKey: MonthKey): string {
  return monthFormatter.format(parseMonthKey(monthKey));
}

export function formatCompactMonthLabel(monthKey: MonthKey): string {
  return compactMonthFormatter.format(parseMonthKey(monthKey));
}

export function getPreviousMonthKey(monthKey: MonthKey): MonthKey {
  return getMonthOffset(monthKey, -1);
}

export function getNextMonthKey(monthKey: MonthKey): MonthKey {
  return getMonthOffset(monthKey, 1);
}

export function getMonthOffset(monthKey: MonthKey, offset: number): MonthKey {
  const date = parseMonthKey(monthKey);
  date.setMonth(date.getMonth() + offset);
  return toMonthKey(date.getFullYear(), date.getMonth() + 1);
}

export function getRecentMonthKeys(centerMonth: MonthKey, count: number): MonthKey[] {
  return Array.from({ length: count }, (_, index) =>
    getMonthOffset(centerMonth, index - count + 1),
  );
}

export function getMonthRange(centerMonth: MonthKey, before: number, after: number): MonthKey[] {
  return Array.from({ length: before + after + 1 }, (_, index) =>
    getMonthOffset(centerMonth, index - before),
  );
}

function parseMonthKey(monthKey: MonthKey): Date {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function toMonthKey(year: number, month: number): MonthKey {
  return `${year}-${String(month).padStart(2, "0")}`;
}
