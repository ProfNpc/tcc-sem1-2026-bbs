import { T, fmt, ORDER_STATUSES } from "../utils/constants";
import { Card, CardHeader, StatCard, Badge, Avatar } from "../components/ui";

export default function Dashboard({ prods, users, orders, onNavigate }) {
  const userList     = Object.entries(users);
  const totalReceita = orders.filter(o => o.status !== "Cancelado").reduce((s, o) => s + (o.total || 0), 0);
  const pendentes    = orders.filter(o => o.status === "Aguardando Pagamento").length;
  const enviados     = orders.filter(o => o.status === "Enviado").length;

  const quickLinks = [
    { label: "Novo Produto", icon: "◈", page: "produtos", color: T.accent },
    { label: "Ver Pedidos",  icon: "◉", page: "pedidos",  color: T.info },
    { label: "Clientes",     icon: "◎", page: "clientes", color: T.ok },
    { label: "Usuários",     icon: "◍", page: "usuarios", color: T.purple },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: T.subtext }}>Visão geral da Bits Bytes Store</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        <StatCard label="Produtos"  value={prods.length}         color={T.accent}  sub="no catálogo"      icon="◈" />
        <StatCard label="Clientes"  value={userList.length}      color={T.ok}      sub="registrados"      icon="◎" />
        <StatCard label="Pedidos"   value={orders.length}        color={T.info}    sub={`${pendentes} pendente(s)`} icon="◉" />
        <StatCard label="Receita"   value={fmt(totalReceita)}    color={T.purple}  sub="confirmados"      icon="$" />
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {quickLinks.map(q => (
          <button key={q.page} onClick={() => onNavigate(q.page)} style={{
            background: `${q.color}0f`, border: `1px solid ${q.color}22`,
            borderRadius: 14, padding: "18px 20px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 12, transition: "all .2s",
            fontFamily: "inherit", textAlign: "left",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${q.color}1a`; e.currentTarget.style.borderColor = `${q.color}40`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${q.color}0f`; e.currentTarget.style.borderColor = `${q.color}22`; }}>
            <span style={{ fontSize: 22, color: q.color }}>{q.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{q.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        {/* Pedidos recentes */}
        <Card>
          <CardHeader title="Pedidos Recentes" sub={`${enviados} enviados`}
            action={<button onClick={() => onNavigate("pedidos")} style={{ background: "none", border: "none", fontSize: 12, color: T.muted, cursor: "pointer", fontFamily: "inherit" }}>Ver todos →</button>} />
          {orders.length === 0 ? (
            <p style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: 20 }}>Nenhum pedido ainda.</p>
          ) : orders.slice(0, 6).map(o => (
            <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${T.border}` }}>
              <Avatar name={o.cliente} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.cliente}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{o.data}</div>
              </div>
              <Badge color={ORDER_STATUSES[o.status] || T.accent} dot>{o.status}</Badge>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.accent, whiteSpace: "nowrap" }}>{fmt(o.total)}</div>
            </div>
          ))}
        </Card>

        {/* Produtos recentes */}
        <Card>
          <CardHeader title="Produtos"
            action={<button onClick={() => onNavigate("produtos")} style={{ background: "none", border: "none", fontSize: 12, color: T.muted, cursor: "pointer", fontFamily: "inherit" }}>Ver todos →</button>} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {prods.length === 0 ? (
              <p style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: 20 }}>Nenhum produto.</p>
            ) : prods.slice(0, 5).map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src={p.imgs?.[0] || ""} alt={p.nome} style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8, background: "rgba(255,255,255,0.04)", padding: 4, flexShrink: 0 }} onError={e => e.target.style.opacity = 0.15} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{p.marca}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, whiteSpace: "nowrap" }}>{fmt(p.preco)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
