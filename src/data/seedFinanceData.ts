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
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "paycheck-2",
              name: "Paycheck (2)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
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
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "basic-ad-and-d-1",
              name: "Basic AD&D (1)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "basic-ee-life-1",
              name: "Basic EE Life (1)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "gtl-imputed-1",
              name: "GTL Imputed (1)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "tickets-1",
              name: "Tickets (1)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "401k-contribution-2",
              name: "401K Contribution (2)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "basic-ad-and-d-2",
              name: "Basic AD&D (2)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "basic-ee-life-2",
              name: "Basic EE Life (2)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "gtl-imputed-2",
              name: "GTL Imputed (2)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "tickets-2",
              name: "Tickets (2)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
          ],
        },
        {
          id: "total-taxes",
          name: "Total Taxes",
          subItems: [
            {
              id: "employee-medicare-1",
              name: "Employee Medicare (1)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "federal-income-tax-1",
              name: "Federal Income Tax (1)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "pa-state-income-tax-1",
              name: "PA State Income Tax (1)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "pa-unemployment-1",
              name: "PA Unemployment (1)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "pittsburgh-city-1",
              name: "Pittsburgh City (1)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "pittsburgh-city-lst-1",
              name: "Pittsburgh City LST (1)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "social-security-employee-tax-1",
              name: "Social Security Employee Tax (1)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "employee-medicare-2",
              name: "Employee Medicare (2)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "federal-income-tax-2",
              name: "Federal Income Tax (2)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "pa-state-income-tax-2",
              name: "PA State Income Tax (2)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "pa-unemployment-2",
              name: "PA Unemployment (2)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "pittsburgh-city-2",
              name: "Pittsburgh City (2)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "pittsburgh-city-lst-2",
              name: "Pittsburgh City LST (2)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "social-security-employee-tax-2",
              name: "Social Security Employee Tax (2)",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
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
          monthlyAmounts: nullMonthlyAmounts(monthKeys),
        },
        {
          id: "total-utilities",
          name: "Total Utilities",
          subItems: [
            {
              id: "technology",
              name: "Technology",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "garage",
              name: "Garage",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "electricity",
              name: "Electricity",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "gas-heat",
              name: "Gas / Heat",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "sewage",
              name: "Sewage",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "waste-garbage",
              name: "Waste / Garbage",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "utility-billing",
              name: "Utility Billing",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "water",
              name: "Water",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "online-fee",
              name: "Online Fee",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
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
          name: "Credit card",
          monthlyAmounts: nullMonthlyAmounts(monthKeys),
        },
      ],
    },
    {
      id: "honda-crv",
      name: "Honda CR-V",
      icon: "HC",
      items: [
        {
          id: "auto-insurance",
          name: "Auto Insurance",
          monthlyAmounts: nullMonthlyAmounts(monthKeys),
        },
        {
          id: "car-loan",
          name: "Car loan",
          monthlyAmounts: nullMonthlyAmounts(monthKeys),
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
          subItems: [
            {
              id: "ipon",
              name: "Ipon",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "luho",
              name: "Luho",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "bahay",
              name: "Bahay",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
          ],
        },
        {
          id: "total-remittances",
          name: "Total Remittances",
          subItems: [
            {
              id: "allen",
              name: "Allen",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "mariane",
              name: "Mariane",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
            },
            {
              id: "ysah",
              name: "Ysah",
              monthlyAmounts: nullMonthlyAmounts(monthKeys),
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
