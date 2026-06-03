import type { MonthKey } from "../types";
import { catAssets } from "../assets/assets";
import { MonthSelector } from "./MonthSelector";

type TopNavProps = {
  selectedMonth: MonthKey;
  onMonthChange: (monthKey: MonthKey) => void;
};

const panes = [
  { href: "#overview-pane", label: "Overview" },
  { href: "#trends-pane", label: "Trends" },
  { href: "#edit-pane", label: "Edit" },
];

export function TopNav({ selectedMonth, onMonthChange }: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="brand-lockup">
        <img className="brand-logo" src={catAssets.logo} alt="" />
        <div>
          <p className="brand-name">PurrFinance</p>
          <p className="brand-tagline">Meow-velous finances, glowing in gold</p>
        </div>
      </div>

      <nav className="pane-tabs" aria-label="Dashboard panes">
        {panes.map((pane) => (
          <a key={pane.href} className="pane-tab" href={pane.href}>
            {pane.label}
          </a>
        ))}
      </nav>

      <MonthSelector selectedMonth={selectedMonth} onMonthChange={onMonthChange} />

      <img className="user-avatar" src={catAssets.user} alt="User profile" />
    </header>
  );
}
