import { type CSSProperties, type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { EditValuesPanel } from "./components/EditValuesPanel";
import { OverviewCard } from "./components/OverviewCard";
import { TrendsCard } from "./components/TrendsCard";
import { seedFinanceCategories } from "./data/seedFinanceData";
import type { FinanceAppData, FinanceCategory } from "./types";
import { getCurrentMonthKey } from "./utils/dateUtils";
import { loadFinanceDataFile, saveFinanceDataFile } from "./utils/financeDataFile";
import { getFlattenedTrendOptions, updateMonthlyAmount } from "./utils/financeCalculations";

const defaultTrendTargetId = "item:credit-card";
const mainResizeHandleSize = 10;
const minTopPaneWidth = 300;
const minTopRowHeight = 220;
const minEditRowHeight = 220;

export default function App() {
  const [appData, setAppData] = useState<FinanceAppData>(createSeedAppData);
  const [hasLoadedDataFile, setHasLoadedDataFile] = useState(false);
  const [overviewRatio, setOverviewRatio] = useState(0.5);
  const [topRowRatio, setTopRowRatio] = useState(0.56);
  const dashboardRef = useRef<HTMLElement>(null);
  const { categories, selectedMonth, selectedTrendTargetId } = appData;

  const trendOptions = useMemo(() => getFlattenedTrendOptions(categories), [categories]);
  const dashboardStyle: ResizeVariableStyle = {
    "--overview-pane-size": `${overviewRatio}fr`,
    "--trends-pane-size": `${1 - overviewRatio}fr`,
    "--top-row-size": `${topRowRatio}fr`,
    "--edit-row-size": `${1 - topRowRatio}fr`,
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const loadedData = await loadFinanceDataFile();
        const nextData = isFinanceAppData(loadedData) ? loadedData : createSeedAppData();

        if (isMounted) {
          setAppData(nextData);
          setHasLoadedDataFile(true);
        }

        if (!isFinanceAppData(loadedData)) {
          await saveFinanceDataFile(nextData);
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setHasLoadedDataFile(true);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!trendOptions.length) {
      return;
    }

    const hasSelectedOption = trendOptions.some((option) => option.id === selectedTrendTargetId);
    if (!hasSelectedOption) {
      const fallback = trendOptions.find((option) => option.id === defaultTrendTargetId) ?? trendOptions[0];
      setSelectedTrendTargetId(fallback.id);
    }
  }, [selectedTrendTargetId, trendOptions]);

  useEffect(() => {
    if (!hasLoadedDataFile) {
      return;
    }

    saveFinanceDataFile(appData).catch((error) => {
      console.error(error);
    });
  }, [appData, hasLoadedDataFile]);

  function handleAmountChange(targetId: string, amount: number | null) {
    setAppData((currentData) => ({
      ...currentData,
      categories: updateMonthlyAmount(
        currentData.categories,
        targetId,
        currentData.selectedMonth,
        amount,
      ),
    }));
  }

  function setSelectedMonth(selectedMonth: string) {
    setAppData((currentData) => ({
      ...currentData,
      selectedMonth,
    }));
  }

  function setSelectedTrendTargetId(selectedTrendTargetId: string) {
    setAppData((currentData) => ({
      ...currentData,
      selectedTrendTargetId,
    }));
  }

  function startTopColumnResize(event: PointerEvent<HTMLElement>) {
    const dashboard = dashboardRef.current;

    if (!dashboard) {
      return;
    }

    const bounds = dashboard.getBoundingClientRect();
    const usableWidth = bounds.width - mainResizeHandleSize;

    startPointerResize(event, (pointerEvent) => {
      const nextOverviewWidth = pointerEvent.clientX - bounds.left;
      const minRatio = minTopPaneWidth / usableWidth;
      const maxRatio = 1 - minRatio;
      setOverviewRatio(clamp(nextOverviewWidth / usableWidth, minRatio, maxRatio));
    });
  }

  function startRowResize(event: PointerEvent<HTMLElement>) {
    const dashboard = dashboardRef.current;

    if (!dashboard) {
      return;
    }

    const bounds = dashboard.getBoundingClientRect();
    const usableHeight = bounds.height - mainResizeHandleSize;
    const minTopRatio = minTopRowHeight / usableHeight;
    const maxTopRatio = 1 - minEditRowHeight / usableHeight;

    startPointerResize(event, (pointerEvent) => {
      const nextTopHeight = pointerEvent.clientY - bounds.top;
      setTopRowRatio(clamp(nextTopHeight / usableHeight, minTopRatio, maxTopRatio));
    });
  }

  return (
    <div className="app-shell">
      <main className="dashboard-main" ref={dashboardRef} style={dashboardStyle}>
        <div className="dashboard-pane" id="overview-pane">
          <OverviewCard
            categories={categories}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedTargetId={selectedTrendTargetId}
            onTargetChange={setSelectedTrendTargetId}
          />
        </div>

        <div
          className="layout-resize-handle is-vertical"
          id="overview-trends-resize"
          role="separator"
          aria-label="Resize overview and trends panels"
          aria-orientation="vertical"
          tabIndex={0}
          onPointerDown={startTopColumnResize}
        />

        <div className="dashboard-pane" id="trends-pane">
          <TrendsCard
            categories={categories}
            onMonthChange={setSelectedMonth}
            selectedTargetId={selectedTrendTargetId}
          />
        </div>

        <div
          className="layout-resize-handle is-horizontal"
          id="top-edit-resize"
          role="separator"
          aria-label="Resize top panels and edit panel"
          aria-orientation="horizontal"
          tabIndex={0}
          onPointerDown={startRowResize}
        />

        <div className="dashboard-pane" id="edit-pane">
          <EditValuesPanel
            categories={categories}
            selectedMonth={selectedMonth}
            onAmountChange={handleAmountChange}
            selectedTargetId={selectedTrendTargetId}
            onTargetChange={setSelectedTrendTargetId}
          />
        </div>
      </main>
    </div>
  );
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

function createSeedAppData(): FinanceAppData {
  return {
    version: 1,
    selectedMonth: getCurrentMonthKey(),
    selectedTrendTargetId: defaultTrendTargetId,
    categories: seedFinanceCategories(),
  };
}

function isFinanceCategoryList(value: unknown): value is FinanceCategory[] {
  return (
    Array.isArray(value) &&
    value.every(
      (category) =>
        typeof category === "object" &&
        category !== null &&
        "id" in category &&
        "name" in category &&
        "items" in category &&
        Array.isArray((category as { items?: unknown }).items),
    )
  );
}

function isFinanceAppData(value: unknown): value is FinanceAppData {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Partial<FinanceAppData>;

  return (
    typeof data.version === "number" &&
    typeof data.selectedMonth === "string" &&
    typeof data.selectedTrendTargetId === "string" &&
    isFinanceCategoryList(data.categories) &&
    data.categories.length > 0
  );
}
