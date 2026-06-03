import { type CSSProperties, useState } from "react";
import type { FinanceCategory, MonthKey } from "../types";
import { categoryLogoAssets, netLogoAsset } from "../assets/assets";
import {
  getCategoryValue,
  getItemValue,
  getMonthlySummary,
} from "../utils/financeCalculations";
import { formatCurrency } from "../utils/formatters";
import { MetricRing, type RingSegment } from "./MetricRing";
import { MonthSelector } from "./MonthSelector";

type OverviewCardProps = {
  categories: FinanceCategory[];
  selectedMonth: MonthKey;
  onMonthChange: (monthKey: MonthKey) => void;
  selectedTargetId: string;
  onTargetChange: (targetId: string) => void;
};

type BreakdownPoint = {
  id: string;
  label: string;
  value: number;
  color: string;
};

const fallbackItemColors = [
  "#ffd84d",
  "#62f29a",
  "#7ab8ff",
  "#ff7a7a",
  "#ffb020",
  "#b99cff",
  "#60ead3",
  "#fff3c4",
];

const itemColorsByCategory: Record<string, string[]> = {
  "pittsburgh-pirates": ["#62f29a", "#7ab8ff", "#ff7a7a"],
  apartment: ["#ffd84d", "#ff8f3f", "#60ead3", "#b99cff"],
  expenses: ["#ffcf6a", "#62f29a", "#ff7a7a", "#7ab8ff", "#b99cff"],
  "honda-crv": ["#ffd84d", "#7ab8ff", "#ffb020", "#ff7a7a"],
  "bank-transfers": ["#62f29a", "#ffd84d", "#ff7a7a"],
  "account-savings": ["#ffcf6a", "#7ab8ff"],
  "account-retirement": ["#62f29a"],
};

const categoryColors = ["#ffd84d", "#62f29a", "#7ab8ff", "#ff7a7a", "#b99cff", "#ffcf6a"];
const subItemColors = ["#fff3c4", "#ffd84d", "#62f29a", "#7ab8ff", "#ff7a7a", "#b99cff"];

export function OverviewCard({
  categories,
  selectedMonth,
  onMonthChange,
  selectedTargetId,
  onTargetChange,
}: OverviewCardProps) {
  const summary = getMonthlySummary(categories, selectedMonth);
  const netCategories = categories.filter((category) => !isAccountCategory(category));
  const accountCategories = categories.filter((category) => isAccountCategory(category));
  const selectedCategory = getOverviewSelection(categories, selectedTargetId).category;
  const isAccountsView = selectedTargetId === "summary:accounts" || (selectedCategory ? isAccountCategory(selectedCategory) : false);
  const ringCategories = isAccountsView ? accountCategories : netCategories;
  const selection = getOverviewSelection(ringCategories, selectedTargetId);
  const activeCategory = selection.category ?? ringCategories[0];
  const categorySegments = ringCategories.map((category, index) => ({
    id: `category:${category.id}`,
    label: category.name,
    value: getCategoryValue(category, selectedMonth),
    color: categoryColors[index % categoryColors.length],
  }));
  const itemPoints = activeCategory ? getItemPoints(activeCategory, selectedMonth) : [];
  const subItemPoints = selection.item?.subItems?.map((subItem, index) => ({
    id: `subitem:${subItem.id}`,
    label: subItem.name,
    value: subItem.monthlyAmounts[selectedMonth] ?? 0,
    color: subItemColors[index % subItemColors.length],
  })) ?? [];

  return (
    <section className="dashboard-card overview-card" aria-label="Overview">
      <div className="overview-control-row">
        <MonthSelector selectedMonth={selectedMonth} onMonthChange={onMonthChange} />
        <div
          className={
            summary.netPosition >= 0
              ? "overview-net-inline is-positive"
              : "overview-net-inline is-negative"
          }
        >
          <span>Net</span>
          <strong>{formatCurrency(summary.netPosition)}</strong>
        </div>
      </div>

      <div className="overview-diagram" aria-label="Monthly category flow">
        <div className="overview-ring-stage">
          <MetricRing
            segments={categorySegments}
            centerLabel={isAccountsView ? "Accounts" : "Net"}
            centerImage={isAccountsView ? categoryLogoAssets.accounts : netLogoAsset}
            activeSegmentId={selection.category ? `category:${selection.category.id}` : undefined}
            showLegend
            showSegmentTitles={false}
            onSegmentClick={onTargetChange}
          />
        </div>

        <div className="overview-breakdown-charts" aria-label="Monthly breakdown charts">
          <OverviewSegmentLine
            title={activeCategory?.name ?? "Items"}
            points={itemPoints}
            activePointId={selection.item ? `item:${selection.item.id}` : undefined}
            onPointClick={onTargetChange}
          />
          <OverviewSegmentLine
            title={selection.item?.name ?? ""}
            points={subItemPoints}
            activePointId={selection.subItemId ? `subitem:${selection.subItemId}` : undefined}
            onPointClick={onTargetChange}
          />
        </div>
      </div>
    </section>
  );
}

function OverviewSegmentLine({
  title,
  points,
  activePointId,
  onPointClick,
}: {
  title: string;
  points: BreakdownPoint[];
  activePointId?: string;
  onPointClick: (targetId: string) => void;
}) {
  const [hoveredPointId, setHoveredPointId] = useState<string>();
  const total = points.reduce((sum, point) => sum + Math.max(point.value, 0), 0);
  let accumulatedPercent = 0;
  const segments = points.map((point) => {
    const percent = total > 0 ? (Math.max(point.value, 0) / total) * 100 : 0;
    const centerPercent = accumulatedPercent + percent / 2;
    accumulatedPercent += percent;

    return { ...point, percent, centerPercent };
  });
  const hoveredPoint = segments.find((point) => point.id === hoveredPointId);

  if (points.length === 0 || total <= 0) {
    return (
      <div className="overview-breakdown-empty" aria-hidden="true">
        {title && <span>{title}</span>}
      </div>
    );
  }

  return (
    <div className="overview-segment-panel" onMouseLeave={() => setHoveredPointId(undefined)}>
      <div className="overview-segment-title">{title}</div>
      <div className="overview-segment-track" role="list">
        {segments.map((point) => {
          const isActive = point.id === activePointId || point.id === hoveredPointId;
          const segmentStyle: SegmentStyle = {
            "--segment-color": point.color,
            width: `${point.percent}%`,
          };

          return (
            <button
              className={isActive ? "overview-segment is-active" : "overview-segment"}
              key={point.id}
              type="button"
              style={segmentStyle}
              title={`${point.label} ${formatCurrency(point.value)}`}
              onMouseEnter={() => setHoveredPointId(point.id)}
              onFocus={() => setHoveredPointId(point.id)}
              onBlur={() => setHoveredPointId(undefined)}
              onClick={() => onPointClick(point.id)}
            >
              <span className="sr-only">
                {point.label} {formatCurrency(point.value)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overview-segment-tooltip-slot">
        {hoveredPoint && (
          <div
            className="overview-segment-tooltip"
            style={{ left: `${clamp(hoveredPoint.centerPercent, 13, 87)}%` }}
          >
            <span>{hoveredPoint.label}</span>
            <strong>{formatCurrency(hoveredPoint.value)}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

type SegmentStyle = CSSProperties & Record<"--segment-color", string>;

function getItemPoints(category: FinanceCategory, selectedMonth: MonthKey): BreakdownPoint[] {
  return category.items.map((item, index) => ({
    id: `item:${item.id}`,
    label: item.name,
    value: getItemValue(item, selectedMonth),
    color: getItemColor(category.id, index),
  }));
}

function getItemColor(categoryId: string, index: number): string {
  const palette = itemColorsByCategory[categoryId] ?? fallbackItemColors;
  return palette[index % palette.length];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getOverviewSelection(categories: FinanceCategory[], targetId: string) {
  const [targetType, rawId] = targetId.split(":");

  for (const category of categories) {
    if (targetType === "category" && category.id === rawId) {
      return { category };
    }

    for (const item of category.items) {
      if (targetType === "item" && item.id === rawId) {
        return { category, item };
      }

      const subItem = item.subItems?.find((candidate) => candidate.id === rawId);

      if (targetType === "subitem" && subItem) {
        return { category, item, subItemId: subItem.id };
      }
    }
  }

  return {};
}

function isAccountCategory(category: FinanceCategory): boolean {
  return category.id.startsWith("account-");
}
