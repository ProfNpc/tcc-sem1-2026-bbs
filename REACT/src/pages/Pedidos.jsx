import { useState } from "react";
import { T, ORDER_STATUSES, SK, fmt, uid, nowDt, ls } from "../utils/constants";
import {
  Btn, Card, Modal, ConfirmModal, SearchBar, EmptyState,
  PageHeader, Badge, Avatar, Field, TextInput, SelectInput, StatCard
} from "../components/ui";

const EMPTY = { cliente: "", email: "", total: "", itens: 1, status: "Aguardando Pagamento" };

export default function Pedidos({ orders, setOrders, toast }) {
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilter] = useState("");
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [delId, setDelId]       = useState(null);
  const [viewId, setViewId]     = useState(null);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchQ = !q || o.cliente?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q);
    const matchS = !filterStatus || o.status === filterStatus;
    return matchQ && matchS;
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const openCreate = () => { setForm(EMPTY); setModal("create"); };
  const openEdit   = (o) => { setForm(o); setModal("edit"); };
  const closeModal = ()  => setModal(null);

  const save = () => {
    if (!form.cliente?.trim() || !form.email?.trim()) { toast("Nome e e-mail obrigatórios.", "err"); return; }
    const entry = { ...form, total: +form.total || 0, itens: +form.itens || 1,
      id: form.id || uid(), data: form.data || nowDt() };
    const next = modal === "edit"
      ? orders.map(o => o.id === entry.id ? entry : o)
      : [entry, ...orders];
    setOrders(next); ls.set(SK.orders, next);
    toast(modal === "edit" ? "Pedido atualizado!" : "Pedido criado!", "ok");
    closeModal();
  };

  const del = () => {
    const next = orders.filter(o => o.id !== delId);
    setOrders(next); ls.set(SK.orders, next);
    setDelId(null); toast("Pedido removido.", "ok");
  };

  const updateStatus = (id, status) => {
    const next = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(next); ls.set(SK.orders, next);
    toast(`Status: ${status}`, "ok");
  };

  // Stats rápidas
  const totalReceita   = orders.filter(o => o.status !== "Cancelado").reduce((s, o) => s + (o.total || 0), 0);
  const aguardando     = orders.filter(o => o.status === "Aguardando Pagamento").length;
  const enviados       = orders.filter(o => o.status === "Enviado").length;

  const viewOrder = orders.find(o => o.id === viewId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <PageHeader
        title="Pedidos"
        sub={`${orders.length} pedido(s) registrado(s)`}
        action={<Btn onClick={openCreate}>+ Novo Pedido</Btn>}
      />

      {/* Mini stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <StatCard label="Receita Total"  value={fmt(totalReceita)} color={T.ok}     sub="pedidos confirmados" />
        <StatCard label="Aguardando"     value={aguardando}        color={T.warn}   sub="pagamento pendente" />
        <StatCard label="Enviados"       value={enviados}          color={T.info}   sub="em trânsito" />
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por cliente ou e-mail..." />
        </div>
        <select value={filterStatus} onChange={e => setFilter(e.target.value)}
          style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
          <option value="">Todos os status</option>
          {Object.keys(ORDER_STATUSES).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Tabela */}
      <Card pad={0} style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <EmptyState icon="◉" title="Nenhum pedido encontrado"
            sub={orders.length === 0 ? "Crie o primeiro pedido." : "Tente ajustar os filtros."}
            action={orders.length === 0 && <Btn onClick={openCreate}>+ Novo Pedido</Btn>} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["Cliente", "E-mail", "Valor", "Itens", "Status", "Data", "Ações"].map(h => (
                    <th key={h} style={{ padding: "12px 18px", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.015)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{ borderBottom: `1px solid ${T.border}`, transition: "background .15s" }}>

                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={o.cliente} size={30} />
                        <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>{o.cliente}</span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 18px", fontSize: 13, color: T.muted }}>{o.email}</td>
                    <td style={{ padding: "13px 18px", fontSize: 14, fontWeight: 800, color: T.accent, whiteSpace: "nowrap" }}>{fmt(o.total)}</td>
                    <td style={{ padding: "13px 18px", fontSize: 13, color: T.muted }}>{o.itens}</td>
                    <td style={{ padding: "13px 18px" }}>
                      <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                        style={{
                          background: `${ORDER_STATUSES[o.status] || T.accent}12`,
                          border: `1px solid ${ORDER_STATUSES[o.status] || T.accent}30`,
                          borderRadius: 8, color: ORDER_STATUSES[o.status] || T.text,
                          fontSize: 12, fontWeight: 700, padding: "5px 10px",
                          cursor: "pointer", outline: "none", fontFamily: "inherit",
                        }}>
                        {Object.keys(ORDER_STATUSES).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "13px 18px", fontSize: 12, color: T.muted, whiteSpace: "nowrap" }}>{o.data}</td>
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", gap: 7 }}>
                        <Btn onClick={() => setViewId(o.id)} variant="subtle" size="sm">Ver</Btn>
                        <Btn onClick={() => openEdit(o)} variant="ghost" size="sm">✏</Btn>
                        <Btn onClick={() => setDelId(o.id)} variant="danger" size="sm">✕</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL FORM */}
      <Modal open={!!modal} onClose={closeModal} title={modal === "edit" ? "Editar Pedido" : "Novo Pedido"} width={520}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Nome do Cliente" required span>
              <TextInput value={form.cliente} onChange={v => set("cliente", v)} placeholder="Nome completo" />
            </Field>
            <Field label="E-mail" required span>
              <TextInput type="email" value={form.email} onChange={v => set("email", v)} placeholder="cliente@email.com" />
            </Field>
            <Field label="Valor Total (R$)">
              <TextInput type="number" value={form.total} onChange={v => set("total", v)} placeholder="0.00" />
            </Field>
            <Field label="Nº de Itens">
              <TextInput type="number" value={form.itens} onChange={v => set("itens", v)} placeholder="1" />
            </Field>
            <Field label="Status" span>
              <SelectInput value={form.status} onChange={v => set("status", v)}
                options={Object.keys(ORDER_STATUSES).map(s => ({ v: s, l: s }))} />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <Btn onClick={save} size="lg" style={{ flex: 1, justifyContent: "center" }}>
              {modal === "edit" ? "💾 Salvar" : "✓ Criar Pedido"}
            </Btn>
            <Btn onClick={closeModal} variant="ghost">Cancelar</Btn>
          </div>
        </div>
      </Modal>

      {/* MODAL VER PEDIDO */}
      <Modal open={!!viewOrder} onClose={() => setViewId(null)} title="Detalhes do Pedido" width={440}>
        {viewOrder && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar name={viewOrder.cliente} size={50} />
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{viewOrder.cliente}</div>
                <div style={{ fontSize: 13, color: T.muted }}>{viewOrder.email}</div>
              </div>
            </div>
            {[
              ["Valor Total", fmt(viewOrder.total)],
              ["Itens", viewOrder.itens],
              ["Data", viewOrder.data],
              ["ID", viewOrder.id],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 13, color: T.muted }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 260, textAlign: "right", wordBreak: "break-all" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
              <span style={{ fontSize: 13, color: T.muted }}>Status</span>
              <Badge color={ORDER_STATUSES[viewOrder.status] || T.accent} dot>{viewOrder.status}</Badge>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!delId} onClose={() => setDelId(null)} onConfirm={del}
        title="Remover Pedido" message="Deseja remover este pedido permanentemente?" confirmLabel="Sim, remover"
      />
    </div>
  );
}
