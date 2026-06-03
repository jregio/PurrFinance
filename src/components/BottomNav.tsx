const panes = [
  { href: "#overview-pane", label: "Overview", icon: "O" },
  { href: "#trends-pane", label: "Trends", icon: "T" },
  { href: "#edit-pane", label: "Edit", icon: "E" },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile dashboard panes">
      {panes.map((pane) => (
        <a key={pane.href} className="bottom-nav-item" href={pane.href}>
          <span aria-hidden="true">{pane.icon}</span>
          {pane.label}
        </a>
      ))}
    </nav>
  );
}
