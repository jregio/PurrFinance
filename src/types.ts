export type MonthKey = string;

export type MonthlyAmount = number | null;

export type FinanceFlow = "earning" | "loss";

export type MonthlyAmountMap = Record<MonthKey, MonthlyAmount>;

export type FinanceSubItem = {
  id: string;
  name: string;
  flow?: FinanceFlow;
  monthlyAmounts: MonthlyAmountMap;
};

export type FinanceItem = {
  id: string;
  name: string;
  flow?: FinanceFlow;
  monthlyAmounts?: MonthlyAmountMap;
  subItems?: FinanceSubItem[];
};

export type FinanceCategory = {
  id: string;
  name: string;
  icon?: string;
  items: FinanceItem[];
};

export type MonthlySummary = {
  monthKey: MonthKey;
  totalEarnings: number;
  totalDeductions: number;
  totalTaxes: number;
  totalApartment: number;
  totalExpenses: number;
  totalHondaCrv: number;
  totalBankTransfers: number;
  netPosition: number;
};

export type TrendOption = {
  id: string;
  label: string;
  type: "summary" | "category" | "item" | "subItem";
  categoryId?: string;
  itemId?: string;
  subItemId?: string;
  path: string[];
};

export type TrendPoint = {
  monthKey: MonthKey;
  label: string;
  value: number | null;
};

export type PaneId = "overview" | "trends" | "edit";

export type FinanceAppData = {
  version: number;
  selectedMonth: MonthKey;
  selectedTrendTargetId: string;
  categories: FinanceCategory[];
};
