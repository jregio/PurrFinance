import { useState } from "react";
import type { FinanceItem, MonthKey } from "../types";
import {
  getItemMonthValueState,
  getItemValue,
  getSubItemMonthValueState,
} from "../utils/financeCalculations";
import { formatCurrency } from "../utils/formatters";
import { FinancialInput } from "./FinancialInput";

type FinanceItemRowProps = {
  categoryId: string;
  item: FinanceItem;
  selectedMonth: MonthKey;
  onAmountChange: (targetId: string, amount: number | null) => void;
};

export function FinanceItemRow({
  categoryId,
  item,
  selectedMonth,
  onAmountChange,
}: FinanceItemRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const total = getItemValue(item, selectedMonth);
  const rowId = `${categoryId}-${item.id}-${selectedMonth}`;

  if (item.subItems?.length) {
    return (
      <div className="finance-item-row">
        <button
          className="item-summary"
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <span className="toggle-mark" aria-hidden="true">
            {isExpanded ? "-" : "+"}
          </span>
          <span>{item.name}</span>
          <strong>{formatCurrency(total)}</strong>
        </button>

        {isExpanded && (
          <div className="subitem-list">
            {item.subItems.map((subItem) => {
              const valueState = getSubItemMonthValueState(subItem, selectedMonth);
              const inputId = `${rowId}-${subItem.id}`;

              return (
                <div className="subitem-row" key={subItem.id}>
                  <div>
                    <span>{subItem.name}</span>
                    {!valueState.hasValue && <small>No value entered</small>}
                  </div>
                  <FinancialInput
                    id={inputId}
                    label={`${subItem.name} for ${selectedMonth}`}
                    value={valueState.value}
                    hasValue={valueState.hasValue}
                    isNull={valueState.isNull}
                    onChange={(amount) => onAmountChange(`subitem:${subItem.id}`, amount)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const valueState = getItemMonthValueState(item, selectedMonth);

  return (
    <div className="finance-item-row direct-item-row">
      <div className="direct-item-copy">
        <span>{item.name}</span>
        {!valueState.hasValue && <small>No value entered</small>}
      </div>
      <FinancialInput
        id={rowId}
        label={`${item.name} for ${selectedMonth}`}
        value={valueState.value}
        hasValue={valueState.hasValue}
        isNull={valueState.isNull}
        onChange={(amount) => onAmountChange(`item:${item.id}`, amount)}
      />
    </div>
  );
}
