import { useEffect, useMemo, useRef, useState } from "react";
import type { MonthKey } from "../types";

type MonthSelectorProps = {
  selectedMonth: MonthKey;
  onMonthChange: (monthKey: MonthKey) => void;
};

type OpenMenu = "month" | "year" | undefined;

const startYear = 2026;
const endYear = 2036;
const startMonth = 5;
const endMonth = 5;
const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>();
  const selectorRef = useRef<HTMLDivElement>(null);
  const selectedYear = Number(selectedMonth.slice(0, 4));
  const selectedMonthNumber = Number(selectedMonth.slice(5, 7));
  const yearOptions = useMemo(
    () => Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index),
    [],
  );
  const availableMonths = getAvailableMonths(selectedYear);

  useEffect(() => {
    function handleDocumentMouseDown(event: MouseEvent) {
      if (!selectorRef.current?.contains(event.target as Node)) {
        setOpenMenu(undefined);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(undefined);
      }
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleMonthChange(month: number) {
    onMonthChange(toMonthKey(selectedYear, month));
    setOpenMenu(undefined);
  }

  function handleYearChange(year: number) {
    onMonthChange(toMonthKey(year, clampMonthForYear(year, selectedMonthNumber)));
    setOpenMenu(undefined);
  }

  return (
    <div className="month-selector" aria-label="Month and year selector" ref={selectorRef}>
      <div className="month-picker">
        <button
          className="month-picker-button"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={openMenu === "month"}
          onClick={() => setOpenMenu(openMenu === "month" ? undefined : "month")}
        >
          <span>{monthOptions[selectedMonthNumber - 1]}</span>
        </button>

        {openMenu === "month" && (
          <div className="month-picker-menu is-month" role="listbox" aria-label="Choose month">
            {availableMonths.map((month) => (
              <button
                key={month}
                className={
                  month === selectedMonthNumber
                    ? "month-picker-option is-selected"
                    : "month-picker-option"
                }
                type="button"
                role="option"
                aria-selected={month === selectedMonthNumber}
                onClick={() => handleMonthChange(month)}
              >
                {monthOptions[month - 1]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="month-picker">
        <button
          className="month-picker-button is-year"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={openMenu === "year"}
          onClick={() => setOpenMenu(openMenu === "year" ? undefined : "year")}
        >
          <span>{selectedYear}</span>
        </button>

        {openMenu === "year" && (
          <div className="month-picker-menu is-year" role="listbox" aria-label="Choose year">
            {yearOptions.map((year) => (
              <button
                key={year}
                className={
                  year === selectedYear
                    ? "month-picker-option is-selected"
                    : "month-picker-option"
                }
                type="button"
                role="option"
                aria-selected={year === selectedYear}
                onClick={() => handleYearChange(year)}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getAvailableMonths(year: number): number[] {
  const firstMonth = year === startYear ? startMonth : 1;
  const lastMonth = year === endYear ? endMonth : 12;

  return Array.from({ length: lastMonth - firstMonth + 1 }, (_, index) => firstMonth + index);
}

function clampMonthForYear(year: number, month: number): number {
  const availableMonths = getAvailableMonths(year);
  return Math.min(Math.max(month, availableMonths[0]), availableMonths[availableMonths.length - 1]);
}

function toMonthKey(year: number, month: number): MonthKey {
  return `${year}-${String(month).padStart(2, "0")}`;
}
