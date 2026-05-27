import { useState } from "react";
import { T, SK, ls } from "../utils/constants";
import {
  Btn, Card, Modal, ConfirmModal, SearchBar, EmptyState,
  PageHeader, Badge, Avatar, StatCard
} from "../components/ui";

export default function Usuarios({ users, setUsers, toast }) {
  const entries = Object.entries(users);

  const [search, setSearch]     = useState("");
  const [viewEmail, setViewEmail] = useState(null);
  const [delEmail, setDelEmail]   = useState(null);

  const filtered = entries.filter(([email, u]) => {
    const q = search.toLowerCase();
    return !q || u.nome?.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  const del = () => {
    const next = { ...users };
    delete next[delEmail];
    setUsers(next); ls.set(SK.users, next);
    setDelEmail(null); toast("Usuário removido.", "ok");
  };

  const viewUser = viewEmail ? [viewEmail, users[viewEmail]] : null;

  // Stats
  const comEnd = entries.filter(([, u]) => (u.enderecos || []).length > 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <PageHeader
        title="Usuários"
        sub="Contas criadas na loja pelo cliente"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <StatCard label="Total de Usuários"    value={entries.length}          color={T.ok}     sub="contas ativas" />
        <StatCard label="Perfil Completo"      value={comEnd}                  color={T.info}   sub="com endereço" />
        <StatCard label="Perfil Incompleto"    value={entries.length - comEnd} color={T.warn}   sub="sem endereço" />
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome ou e-mail..." />

      {/* Tabela */}
      <Card pad={0} style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <EmptyState icon="◍" title="Nenhum usuário encontrado"
            sub={entries.length === 0 ? "Nenhuma conta criada ainda." : "Ajuste a busca."} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["Usuário", "E-mail", "Telefone", "Endereços", "Ações"].map(h => (
                    <th key={h} style={{ padding: "12px 18px", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1.5, textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(([email, u]) => {
                  const endQty = (u.enderecos || []).length;
                  return (
                    <tr key={email}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.015)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      style={{ borderBottom: `1px solid ${T.border}`, transition: "background .15s" }}>
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={u.nome} size={32} />
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{u.nome || "–"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 18px", fontSize: 13, color: T.muted }}>{email}</td>
                      <td style={{ padding: "13px 18px", fontSize: 13, color: T.muted }}>{u.telefone || "–"}</td>
                      <td style={{ padding: "13px 18px" }}>
                        <Badge color={endQty > 0 ? T.ok : T.muted}>{endQty} endereço(s)</Badge>
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", gap: 7 }}>
                          <Btn onClick={() => setViewEmail(email)} variant="subtle" size="sm">Ver</Btn>
                          <Btn onClick={() => setDelEmail(email)} variant="danger" size="sm">✕</Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL VER USUÁRIO */}
      <Modal open={!!viewUser} onClose={() => setViewEmail(null)} title="Dados do Usuário" width={460}>
        {viewUser && (() => {
          const [email, u] = viewUser;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
                <Avatar name={u.nome} size={52} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{u.nome || "–"}</div>
                  <div style={{ fontSize: 13, color: T.muted }}>{email}</div>
                </div>
              </div>

              {[["Telefone", u.telefone || "–"], ["CPF", u.cpf || "–"]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 13, color: T.muted }}>{l}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                </div>
              ))}

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: T.muted, marginBottom: 10 }}>
                  Endereços ({(u.enderecos || []).length})
                </div>
                {(u.enderecos || []).length === 0 ? (
                  <p style={{ fontSize: 13, color: T.muted }}>Nenhum endereço cadastrado.</p>
                ) : (u.enderecos || []).map((e, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 14px", marginBottom: 8, fontSize: 13, color: T.subtext, lineHeight: 1.6 }}>
                    <strong style={{ color: T.text }}>{e.rua}, {e.numero}</strong>
                    {e.complemento && ` — ${e.complemento}`}<br />
                    {e.bairro} · {e.cidade}/{e.uf} · CEP {e.cep}
                  </div>
                ))}
              </div>

              <Btn onClick={() => setDelEmail(email)} variant="danger" style={{ justifyContent: "center" }}>
                Remover este usuário
              </Btn>
            </div>
          );
        })()}
      </Modal>

      <ConfirmModal
        open={!!delEmail} onClose={() => setDelEmail(null)} onConfirm={del}
        title="Remover Usuário"
        message={`Remover o usuário "${users[delEmail]?.nome || delEmail}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, remover"
      />
    </div>
  );
}
