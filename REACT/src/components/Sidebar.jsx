import { T } from "../utils/constants";
import { Avatar } from "./ui";

const NAV_ITEMS = [
  { id: "dashboard", icon: "▦", label: "Dashboard",   section: "Painel" },
  { id: "produtos",  icon: "◈", label: "Produtos",    section: "Catálogo" },
  { id: "pedidos",   icon: "◉", label: "Pedidos",     section: "Catálogo" },
  { id: "clientes",  icon: "◎", label: "Clientes",    section: "Pessoas" },
  { id: "usuarios",  icon: "◍", label: "Usuários",    section: "Pessoas" },
];

export default function Sidebar({ active, onNavigate, adminName, onLogout }) {
  // Agrupa itens por section
  const sections = [];
  const seen = new Set();
  NAV_ITEMS.forEach(item => {
    if (!seen.has(item.section)) { seen.add(item.section); sections.push(item.section); }
  });

  return (
    <aside style={{
      width: 228, background: "rgba(6,6,12,0.92)", borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column", height: "100vh",
      position: "sticky", top: 0, flexShrink: 0,
      backdropFilter: "blur(24px)",
    }}>
      {/* Logo */}
      <div style={{ padding: "26px 22px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{
          fontSize: 22, fontWeight: 800, letterSpacing: 3,
          background: "linear-gradient(135deg,#ff416c,#ff4b2b)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 2,
        }}>BBS</div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3.5, color: T.muted, textTransform: "uppercase" }}>
          Admin Panel
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
        {sections.map(section => (
          <div key={section} style={{ marginBottom: 6 }}>
            <div style={{ padding: "10px 12px 6px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: T.muted }}>
              {section}
            </div>
            {NAV_ITEMS.filter(i => i.section === section).map(item => (
              <NavItem key={item.id} item={item} active={active === item.id} onClick={() => onNavigate(item.id)} />
            ))}
          </div>
        ))}

        {/* Separator + ver loja */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
          <button
            onClick={() => window.open("index.html", "_blank")}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "10px 12px", background: "transparent", border: "none",
              borderRadius: 9, color: T.muted, fontSize: 13, cursor: "pointer",
              textAlign: "left", transition: "color .15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = T.text}
            onMouseLeave={e => e.currentTarget.style.color = T.muted}
          >
            <span style={{ fontSize: 15, opacity: 0.7 }}>↗</span> Ver Loja
          </button>
        </div>
      </nav>

      {/* User footer */}
      <div style={{ padding: "14px 14px 20px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Avatar name={adminName} size={34} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{adminName}</div>
            <div style={{ fontSize: 11, color: T.muted }}>Administrador</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: "100%", padding: "8px", background: "transparent",
            border: `1px solid ${T.border}`, borderRadius: 9, color: T.muted,
            fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .15s",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,65,108,0.3)"; e.currentTarget.style.color = T.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
        >
          Sair da conta
        </button>
      </div>
    </aside>
  );
}

function NavItem({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: "10px 12px", background: active ? "rgba(255,65,108,0.1)" : "transparent",
        border: "none", borderRadius: 9,
        borderLeft: `2px solid ${active ? "#ff416c" : "transparent"}`,
        color: active ? T.text : T.subtext,
        fontSize: 13, fontWeight: active ? 600 : 400,
        cursor: "pointer", textAlign: "left", transition: "all .15s",
        fontFamily: "inherit",
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = T.text; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.subtext; } }}
    >
      <span style={{ fontSize: 16, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
      {item.label}
    </button>
  );
}
