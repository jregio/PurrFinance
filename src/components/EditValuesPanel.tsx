import { type CSSProperties, type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import type { FinanceCategory, FinanceItem, MonthKey } from "../types";
import { categoryLogoAssets, netLogoAsset } from "../assets/assets";
import {
  getCategoryValue,
  getItemMonthValueState,
  getItemValue,
  getSubItemMonthValueState,
} from "../utils/financeCalculations";
import { formatCurrency } from "../utils/formatters";
import { FinancialInput } from "./FinancialInput";

type EditValuesPanelProps = {
  categories: FinanceCategory[];
  selectedMonth: MonthKey;
  onAmountChange: (targetId: string, amount: number | null) => void;
  selectedTargetId: string;
  onTargetChange: (targetId: string) => void;
};

const editResizeHandleCount = 3;
const editResizeHandleSize = 10;
const minEditColumnWidths = [86, 170, 170, 130];
const minValueInputWidth = 88;
const defaultValueInputWidth = 112;
const accountCategoryPrefix = "account-";

type EditArea = "net" | "accounts";

export function EditValuesPanel({
  categories,
  selectedMonth,
  onAmountChange,
  selectedTargetId,
  onTargetChange,
}: EditValuesPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const valuePanelRef = useRef<HTMLDivElement>(null);
  const [columnRatios, setColumnRatios] = useState([0.11, 0.29, 0.33, 0.27]);
  const [valueInputWidth, setValueInputWidth] = useState(defaultValueInputWidth);
  const [activeArea, setActiveArea] = useState<EditArea>("net");
  const netCategories = useMemo(
    () => categories.filter((category) => !isAccountCategory(category)),
    [categories],
  );
  const accountCategories = useMemo(
    () => categories.filter((category) => isAccountCategory(category)),
    [categories],
  );
  const visibleCategories =
    activeArea === "accounts" ? accountCategories : netCategories;
  const [activeCategoryId, setActiveCategoryId] = useState(() => netCategories[0]?.id ?? "");
  const activeCategory =
    visibleCategories.find((category) => category.id === activeCategoryId) ?? visibleCategories[0];
  const [activeItemId, setActiveItemId] = useState(() => activeCategory?.items[0]?.id ?? "");
  const activeItem = useMemo(
    () =>
      activeCategory?.items.find((item) => item.id === activeItemId) ??
      activeCategory?.items[0],
    [activeCategory, activeItemId],
  );
  const panelStyle: ResizeVariableStyle = {
    "--edit-net-size": `${columnRatios[0]}fr`,
    "--edit-category-size": `${columnRatios[1]}fr`,
    "--edit-item-size": `${columnRatios[2]}fr`,
    "--edit-value-size": `${columnRatios[3]}fr`,
    "--edit-input-width": `${valueInputWidth}px`,
  };

  useEffect(() => {
    const targetSelection = getSelectionFromTarget(categories, selectedTargetId);

    if (!targetSelection) {
      if (selectedTargetId === "summary:net-position") {
        setActiveArea("net");
      }
      return;
    }

    setActiveArea(targetSelection.isAccountCategory ? "accounts" : "net");
    setActiveCategoryId(targetSelection.categoryId);
    setActiveItemId(targetSelection.itemId);
  }, [categories, selectedTargetId]);

  function startColumnResize(columnIndex: number, event: PointerEvent<HTMLElement>) {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const bounds = panel.getBoundingClientRect();
    const totalColumnWidth = bounds.width - editResizeHandleCount * editResizeHandleSize;
    const ratioSum = columnRatios.reduce((sum, ratio) => sum + ratio, 0);
    const startX = event.clientX;
    const startWidths = columnRatios.map((ratio) => (ratio / ratioSum) * totalColumnWidth);

    startPointerResize(event, (pointerEvent) => {
      const delta = pointerEvent.clientX - startX;
      const nextWidths = [...startWidths];
      nextWidths[columnIndex] = startWidths[columnIndex] + delta;
      nextWidths[columnIndex + 1] = startWidths[columnIndex + 1] - delta;

      if (nextWidths[columnIndex] < minEditColumnWidths[columnIndex]) {
        const adjustment = minEditColumnWidths[columnIndex] - nextWidths[columnIndex];
        nextWidths[columnIndex] += adjustment;
        nextWidths[columnIndex + 1] -= adjustment;
      }

      if (nextWidths[columnIndex + 1] < minEditColumnWidths[columnIndex + 1]) {
        const adjustment = minEditColumnWidths[columnIndex + 1] - nextWidths[columnIndex + 1];
        nextWidths[columnIndex + 1] += adjustment;
        nextWidths[columnIndex] -= adjustment;
      }

      const nextRatioSum = nextWidths.reduce((sum, width) => sum + width, 0);
      setColumnRatios(nextWidths.map((width) => width / nextRatioSum));
    });
  }

  function startValueInputResize(event: PointerEvent<HTMLElement>) {
    const panel = valuePanelRef.current;

    if (!panel) {
      return;
    }

    const bounds = panel.getBoundingClientRect();
    const startX = event.clientX;
    const startWidth = valueInputWidth;

    startPointerResize(event, (pointerEvent) => {
      const delta = startX - pointerEvent.clientX;
      const maxWidth = Math.max(minValueInputWidth, Math.min(230, bounds.width - 78));
      setValueInputWidth(clamp(startWidth + delta, minValueInputWidth, maxWidth));
    });
  }

  function selectCategory(category: FinanceCategory) {
    setActiveCategoryId(category.id);
    setActiveItemId(category.items[0]?.id ?? "");
    onTargetChange(`category:${category.id}`);
  }

  function selectItem(item: FinanceItem) {
    setActiveItemId(item.id);
    onTargetChange(`item:${item.id}`);
  }

  function selectArea(area: EditArea) {
    setActiveArea(area);

    if (area === "accounts") {
      const firstAccountCategory = accountCategories[0];

      if (firstAccountCategory) {
        setActiveCategoryId(firstAccountCategory.id);
        setActiveItemId(firstAccountCategory.items[0]?.id ?? "");
        onTargetChange(`category:${firstAccountCategory.id}`);
      }

      return;
    }

    const firstNetCategory = netCategories[0];
    setActiveCategoryId(firstNetCategory?.id ?? "");
    setActiveItemId(firstNetCategory?.items[0]?.id ?? "");
    onTargetChange("summary:net-position");
  }

  return (
    <section className="dashboard-card edit-panel" aria-label="Edit values" ref={panelRef} style={panelStyle}>
      <nav className="edit-area-nav" aria-label="Edit areas">
        <button
          className={activeArea === "net" ? "edit-area-target is-active" : "edit-area-target"}
          type="button"
          aria-pressed={activeArea === "net"}
          onClick={() => selectArea("net")}
        >
          <img src={netLogoAsset} alt="" />
          <span>Net</span>
        </button>

        <button
          className={
            activeArea === "accounts"
              ? "edit-area-target edit-accounts-target is-active"
              : "edit-area-target edit-accounts-target"
          }
          type="button"
          aria-pressed={activeArea === "accounts"}
          onClick={() => selectArea("accounts")}
        >
          {categoryLogoAssets.accounts && <img src={categoryLogoAssets.accounts} alt="" />}
          <span>Accounts</span>
        </button>
      </nav>

      <div
        className="edit-resize-handle"
        role="separator"
        aria-label="Resize net and category panels"
        aria-orientation="vertical"
        tabIndex={0}
        onPointerDown={(event) => startColumnResize(0, event)}
      />

      <nav className="edit-category-nav" aria-label="Edit categories">
        {visibleCategories.map((category) => {
          const total = getCategoryValue(category, selectedMonth);
          const isActive = category.id === activeCategory?.id;

          return (
            <button
              key={category.id}
              className={isActive ? "edit-category-tab is-active" : "edit-category-tab"}
              type="button"
              title={`${category.name} ${formatCurrency(total)}`}
              aria-label={`${category.name}, ${formatCurrency(total)}`}
              aria-pressed={isActive}
              onClick={() => selectCategory(category)}
            >
              <span className="category-logo" aria-hidden="true">
                {categoryLogoAssets[category.id] ? (
                  <img src={categoryLogoAssets[category.id]} alt="" />
                ) : (
                  category.icon ?? category.name.slice(0, 2).toUpperCase()
                )}
              </span>
              <span className="edit-category-copy">
                <span>{category.name}</span>
                <strong>{formatCurrency(total)}</strong>
              </span>
            </button>
          );
        })}
      </nav>

      <div
        className="edit-resize-handle"
        role="separator"
        aria-label="Resize category and item panels"
        aria-orientation="vertical"
        tabIndex={0}
        onPointerDown={(event) => startColumnResize(1, event)}
      />

      <nav className="edit-item-nav" aria-label="Edit items">
        {activeCategory?.items.map((item) => {
          const isActive = item.id === activeItem?.id;

          return (
            <button
              key={item.id}
              className={
                isActive || selectedTargetId === `item:${item.id}`
                  ? "edit-item-tab is-active"
                  : "edit-item-tab"
              }
              type="button"
              aria-pressed={isActive}
              onClick={() => selectItem(item)}
            >
              <span>{item.name}</span>
              <strong>{formatCurrency(getItemValue(item, selectedMonth))}</strong>
            </button>
          );
        })}
      </nav>

      <div
        className="edit-resize-handle"
        role="separator"
        aria-label="Resize item and value panels"
        aria-orientation="vertical"
        tabIndex={0}
        onPointerDown={(event) => startColumnResize(2, event)}
      />

      <div className="edit-value-panel" ref={valuePanelRef}>
        <div
          className="edit-value-input-resize-handle"
          role="separator"
          aria-label="Resize value inputs"
          aria-orientation="vertical"
          tabIndex={0}
          onPointerDown={startValueInputResize}
        />
        {activeItem && (
          <SelectedItemEditor
            item={activeItem}
            selectedMonth={selectedMonth}
            onAmountChange={onAmountChange}
            selectedTargetId={selectedTargetId}
            onTargetChange={onTargetChange}
          />
        )}
      </div>
    </section>
  );
}

function getSelectionFromTarget(categories: FinanceCategory[], targetId: string) {
  const [targetType, rawId] = targetId.split(":");

  for (const category of categories) {
    if (targetType === "category" && category.id === rawId) {
      return {
        categoryId: category.id,
        itemId: category.items[0]?.id ?? "",
        isAccountCategory: isAccountCategory(category),
      };
    }

    for (const item of category.items) {
      if (targetType === "item" && item.id === rawId) {
        return {
          categoryId: category.id,
          itemId: item.id,
          isAccountCategory: isAccountCategory(category),
        };
      }

      if (targetType === "subitem" && item.subItems?.some((subItem) => subItem.id === rawId)) {
        return {
          categoryId: category.id,
          itemId: item.id,
          isAccountCategory: isAccountCategory(category),
        };
      }
    }
  }

  return undefined;
}

function isAccountCategory(category: FinanceCategory): boolean {
  return category.id.startsWith(accountCategoryPrefix);
}

type ResizeVariableStyle = CSSProperties & Record<`--${string}`, string>;

function startPointerResize(
  event: PointerEvent<HTMLElement>,
  onMove: (event: globalThis.PointerEvent) => void,
) {
  event.preventDefault();
  document.body.classList.add("is-resizing");

  function handlePointerMove(pointerEvent: globalThis.PointerEvent) {
    onMove(pointerEvent);
  }

  function handlePointerUp() {
    document.body.classList.remove("is-resizing");
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp, { once: true });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type SelectedItemEditorProps = {
  item: FinanceItem;
  selectedMonth: MonthKey;
  onAmountChange: (targetId: string, amount: number | null) => void;
  selectedTargetId: string;
  onTargetChange: (targetId: string) => void;
};

function SelectedItemEditor({
  item,
  selectedMonth,
  onAmountChange,
  selectedTargetId,
  onTargetChange,
}: SelectedItemEditorProps) {
  if (item.subItems?.length) {
    return (
      <div className="selected-item-editor is-subitem-only">
        <div className="selected-subitem-list">
          {item.subItems.map((subItem) => {
            const valueState = getSubItemMonthValueState(subItem, selectedMonth);

            return (
              <button
                className={
                  selectedTargetId === `subitem:${subItem.id}`
                    ? "selected-subitem-row is-selected"
                    : "selected-subitem-row"
                }
                key={subItem.id}
                type="button"
                onClick={() => onTargetChange(`subitem:${subItem.id}`)}
              >
                <div>
                  <span>{subItem.name}</span>
                  {!valueState.hasValue && <small>No value entered</small>}
                </div>
                <span onClick={(event) => event.stopPropagation()}>
                  <FinancialInput
                    id={`edit-${item.id}-${subItem.id}-${selectedMonth}`}
                    label={`${subItem.name} for ${selectedMonth}`}
                    value={valueState.value}
                    hasValue={valueState.hasValue}
                    isNull={valueState.isNull}
                    onChange={(amount) => onAmountChange(`subitem:${subItem.id}`, amount)}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const valueState = getItemMonthValueState(item, selectedMonth);

  return (
    <div className="selected-item-editor is-subitem-only">
      <button
        className={
          selectedTargetId === `item:${item.id}`
            ? "selected-direct-row is-selected"
            : "selected-direct-row"
        }
        type="button"
        onClick={() => onTargetChange(`item:${item.id}`)}
      >
        <div>
          <span>{item.name}</span>
          {!valueState.hasValue && <small>No value entered</small>}
        </div>
        <span onClick={(event) => event.stopPropagation()}>
          <FinancialInput
            id={`edit-${item.id}-${selectedMonth}`}
            label={`${item.name} for ${selectedMonth}`}
            value={valueState.value}
            hasValue={valueState.hasValue}
            isNull={valueState.isNull}
            onChange={(amount) => onAmountChange(`item:${item.id}`, amount)}
          />
        </span>
      </button>
    </div>
  );
}
