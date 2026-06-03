import { useState } from "react";
import type { FinanceCategory, MonthKey } from "../types";
import { getCategoryValue } from "../utils/financeCalculations";
import { formatCurrency } from "../utils/formatters";
import { FinanceItemRow } from "./FinanceItemRow";

type CategorySectionProps = {
  category: FinanceCategory;
  selectedMonth: MonthKey;
  onAmountChange: (targetId: string, amount: number | null) => void;
};

export function CategorySection({ category, selectedMonth, onAmountChange }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const total = getCategoryValue(category, selectedMonth);

  return (
    <section className="category-section" aria-label={category.name}>
      <button
        className="category-header"
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <span className="category-icon" aria-hidden="true">
          {category.icon ?? category.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="category-title">{category.name}</span>
        <strong>{formatCurrency(total)}</strong>
        <span className="toggle-mark" aria-hidden="true">
          {isExpanded ? "-" : "+"}
        </span>
      </button>

      {isExpanded && (
        <div className="category-body">
          {category.items.map((item) => (
            <FinanceItemRow
              key={item.id}
              categoryId={category.id}
              item={item}
              selectedMonth={selectedMonth}
              onAmountChange={onAmountChange}
            />
          ))}
        </div>
      )}
    </section>
  );
}
