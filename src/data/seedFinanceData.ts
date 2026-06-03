import type { FinanceCategory, MonthKey, MonthlyAmountMap } from "../types";
import { getCurrentMonthKey, getRecentMonthKeys } from "../utils/dateUtils";

type AmountBuilder = (monthKey: MonthKey, index: number) => number;

export function seedFinanceCategories(): FinanceCategory[] {
  const monthKeys = getRecentMonthKeys(getCurrentMonthKey(), 8);

  return [
    {
      id: "pittsburgh-pirates",
      name: "Pittsburgh Pirates",
      icon: "PP",
      items: [
        {
          id: "total-earnings",
          name: "Total Earnings",
          subItems: [
            {
              id: "paycheck-1",
              name: "Paycheck (1)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 3125),
            },
            {
              id: "paycheck-2",
              name: "Paycheck (2)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 3125),
            },
          ],
        },
        {
          id: "total-deductions",
          name: "Total Deductions",
          subItems: [
            {
              id: "401k-contribution-1",
              name: "401K Contribution (1)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 250),
            },
            {
              id: "401k-contribution-2",
              name: "401K Contribution (2)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 250),
            },
            {
              id: "basic-ad-and-d-1",
              name: "Basic AD&D (1)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 2.75),
            },
            {
              id: "basic-ad-and-d-2",
              name: "Basic AD&D (2)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 2.75),
            },
            {
              id: "medical-1",
              name: "Medical (1)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 92.13),
            },
            {
              id: "dental-1",
              name: "Dental (1)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 18.2),
            },
            {
              id: "vision-1",
              name: "Vision (1)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 4.64),
            },
          ],
        },
        {
          id: "total-taxes",
          name: "Total Taxes",
          subItems: [
            {
              id: "federal-withholding-1",
              name: "Federal Withholding (1)",
              monthlyAmounts: variedMonthlyAmounts(monthKeys, (monthKey) => 418 + monthNumber(monthKey) * 1.4),
            },
            {
              id: "federal-withholding-2",
              name: "Federal Withholding (2)",
              monthlyAmounts: variedMonthlyAmounts(monthKeys, (monthKey) => 418 + monthNumber(monthKey) * 1.4),
            },
            {
              id: "employee-medicare-1",
              name: "Employee Medicare (1)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 45.31),
            },
            {
              id: "employee-medicare-2",
              name: "Employee Medicare (2)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 45.31),
            },
            {
              id: "social-security-1",
              name: "Social Security (1)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 193.75),
            },
            {
              id: "social-security-2",
              name: "Social Security (2)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 193.75),
            },
            {
              id: "state-withholding-1",
              name: "State Withholding (1)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 95.62),
            },
            {
              id: "state-withholding-2",
              name: "State Withholding (2)",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 95.62),
            },
          ],
        },
      ],
    },
    {
      id: "apartment",
      name: "Apartment",
      icon: "AP",
      items: [
        {
          id: "rent",
          name: "Rent",
          monthlyAmounts: fixedMonthlyAmounts(monthKeys, 1845),
        },
        {
          id: "total-utilities",
          name: "Total Utilities",
          subItems: [
            {
              id: "electricity",
              name: "Electricity",
              monthlyAmounts: variedMonthlyAmounts(monthKeys, (monthKey, index) => 92 + summerLift(monthKey) + index * 1.8),
            },
            {
              id: "gas-heat",
              name: "Gas / Heat",
              monthlyAmounts: variedMonthlyAmounts(monthKeys, (monthKey) => 48 + winterLift(monthKey)),
            },
            {
              id: "internet",
              name: "Internet",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 69.99),
            },
            {
              id: "water",
              name: "Water",
              monthlyAmounts: variedMonthlyAmounts(monthKeys, (_monthKey, index) => 42 + (index % 3) * 4),
            },
          ],
        },
      ],
    },
    {
      id: "expenses",
      name: "Expenses",
      icon: "EX",
      items: [
        {
          id: "credit-card",
          name: "Credit Card",
          subItems: [
            {
              id: "credit-card-total",
              name: "Credit Card",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
          ],
        },
      ],
    },
    {
      id: "honda-crv",
      name: "Honda CR-V",
      icon: "HC",
      items: [
        {
          id: "car-loan",
          name: "Car loan",
          monthlyAmounts: fixedMonthlyAmounts(monthKeys, 524.18),
        },
        {
          id: "car-insurance",
          name: "Insurance",
          monthlyAmounts: fixedMonthlyAmounts(monthKeys, 158.32),
        },
        {
          id: "fuel",
          name: "Fuel",
          monthlyAmounts: variedMonthlyAmounts(monthKeys, (_monthKey, index) => 126 + (index % 4) * 18),
        },
        {
          id: "maintenance",
          name: "Maintenance",
          monthlyAmounts: variedMonthlyAmounts(monthKeys, (_monthKey, index) => (index % 6 === 2 ? 420 : 35)),
        },
      ],
    },
    {
      id: "bank-transfers",
      name: "Bank transfers",
      icon: "BT",
      items: [
        {
          id: "saving-accounts",
          name: "Saving Accounts",
          monthlyAmounts: fixedMonthlyAmounts(monthKeys, 700),
        },
        {
          id: "ipon",
          name: "Ipon",
          monthlyAmounts: fixedMonthlyAmounts(monthKeys, 325),
        },
        {
          id: "total-remittances",
          name: "Total Remittances",
          subItems: [
            {
              id: "allen",
              name: "Allen",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 250),
            },
            {
              id: "mariane",
              name: "Mariane",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 90),
            },
            {
              id: "ysah",
              name: "Ysah",
              monthlyAmounts: fixedMonthlyAmounts(monthKeys, 90),
            },
          ],
        },
      ],
    },
    {
      id: "account-savings",
      name: "Savings",
      icon: "AC",
      items: [
        {
          id: "savings-chase",
          name: "Chase",
          subItems: [
            {
              id: "savings-luho",
              name: "Luho",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
          ],
        },
        {
          id: "savings-marcus",
          name: "Marcus",
          subItems: [
            {
              id: "savings-bahay",
              name: "Bahay",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "savings-ipon",
              name: "Ipon",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
          ],
        },
      ],
    },
    {
      id: "account-retirement",
      name: "Retirement",
      icon: "AC",
      items: [
        {
          id: "retirement-vanguard",
          name: "Vanguard",
          subItems: [
            {
              id: "retirement-cmu",
              name: "CMU",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "retirement-pirates",
              name: "Pirates",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
          ],
        },
      ],
    },
  ];
}

function fixedMonthlyAmounts(monthKeys: MonthKey[], amount: number): MonthlyAmountMap {
  return variedMonthlyAmounts(monthKeys, () => amount);
}

function variedMonthlyAmounts(monthKeys: MonthKey[], builder: AmountBuilder): MonthlyAmountMap {
  void builder;

  return monthKeys.reduce<MonthlyAmountMap>((amounts, monthKey, index) => {
    void index;
    amounts[monthKey] = null;
    return amounts;
  }, {});
}

function nullMonthlyAmounts(monthKeys: MonthKey[]): MonthlyAmountMap {
  return monthKeys.reduce<MonthlyAmountMap>((amounts, monthKey) => {
    amounts[monthKey] = null;
    return amounts;
  }, {});
}

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function monthNumber(monthKey: MonthKey): number {
  return Number(monthKey.slice(5, 7));
}

function winterLift(monthKey: MonthKey): number {
  const month = monthNumber(monthKey);
  return month === 12 || month <= 3 ? 42 : month === 4 || month === 11 ? 22 : 4;
}

function summerLift(monthKey: MonthKey): number {
  const month = monthNumber(monthKey);
  return month >= 6 && month <= 9 ? 46 : month === 5 || month === 10 ? 22 : 0;
}
