import { useState } from "react";
import { T, SK, ls, uid } from "../utils/constants";
import {
  Btn, Card, Modal, ConfirmModal, SearchBar, EmptyState,
  PageHeader, Badge, Avatar, Field, TextInput, StatCard
} from "../components/ui";

const EMPTY_CLIENT = { nome: "", email: "", telefone: "", cpf: "", enderecos: [] };
const EMPTY_ADDR   = { rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "", cep: "" };

export default function Clientes({ users, setUsers, toast }) {
  const entries = Object.entries(users);

  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(null); // null | "create" | "edit" | "view"
  const [form, setForm]     = useState(EMPTY_CLIENT);
  const [origEmail, setOrigEmail] = useState(""); // email original ao editar
  const [delEmail, setDelEmail]   = useState(null);
  const [addrModal, setAddrModal] = useState(false);
  const [addrForm, setAddrForm]   = useState(EMPTY_ADDR);

  const filtered = entries.filter(([email, u]) => {
    const q = search.toLowerCase();
    return !q || u.nome?.toLowerCase().includes(q) || email.toLowerCase().includes(q) || u.telefone?.includes(q);
  });

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setA = (k, v) => setAddrForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(EMPTY_CLIENT); setOrigEmail(""); setModal("create"); };
  const openEdit   = (email, u) => { setForm({ email, ...u, enderecos: u.enderecos || [] }); setOrigEmail(email); setModal("edit"); };
  const openView   = (email, u) => { setForm({ email, ...u, enderecos: u.enderecos || [] }); setModal("view"); };
  const closeModal = () => setModal(null);

  const save = () => {
    const email = form.email?.trim().toLowerCase();
    if (!form.nome?.trim()) { toast("Nome obrigatório.", "err"); return; }
    if (!email || !email.includes("@")) { toast("E-mail inválido.", "err"); return; }

    const next = { ...users };
    // Se editando e mudou o email, remove o antigo
    if (modal === "edit" && origEmail && origEmail !== email) delete next[origEmail];
    const { email: _, ...data } = form;
    next[email] = { nome: form.nome, telefone: form.telefone || "", cpf: form.cpf || "", enderecos: form.enderecos || [] };
    setUsers(next); ls.set(SK.users, next);
    toast(modal === "edit" ? "Cliente atualizado!" : "Cliente criado!", "ok");
    closeModal();
  };

  const del = () => {
    const next = { ...users };
    delete next[delEmail];
    setUsers(next); ls.set(SK.users, next);
    setDelEmail(null); toast("Cliente removido.", "ok");
  };

  // Endereços
  const addAddr = () => {
    if (!addrForm.rua?.trim() || !addrForm.cidade?.trim()) { toast("Rua e cidade obrigatórios.", "err"); return; }
    set("enderecos", [...(form.enderecos || []), { ...addrForm, id: uid() }]);
    setAddrForm(EMPTY_ADDR); setAddrModal(false);
    toast("Endereço adicionado!", "ok");
  };
  const removeAddr = (id) => set("enderecos", form.enderecos.filter(e => e.id !== id));

  // Stats
  const comEndereco = entries.filter(([, u]) => (u.enderecos || []).length > 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <PageHeader
        title="Clientes"
        sub={`${entries.length} cliente(s) registrado(s)`}
        action={<Btn onClick={openCreate}>+ Novo Cliente</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <StatCard label="Total de Clientes"    value={entries.length}   color={T.ok}     sub="registrados" />
        <StatCard label="Com Endereço"         value={comEndereco}      color={T.info}   sub="perfil completo" />
        <StatCard label="Sem Endereço"         value={entries.length - comEndereco} color={T.warn} sub="incompletos" />
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome, e-mail ou telefone..." />

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon="◎" title="Nenhum cliente encontrado"
            sub={entries.length === 0 ? "Adicione o primeiro cliente." : "Ajuste a busca."}
            action={entries.length === 0 && <Btn onClick={openCreate}>+ Novo Cliente</Btn>} />
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
          {filtered.map(([email, u]) => (
            <ClientCard key={email} email={email} u={u}
              onView={() => openView(email, u)}
              onEdit={() => openEdit(email, u)}
              onDelete={() => setDelEmail(email)} />
          ))}
        </div>
      )}

      {/* MODAL CREATE/EDIT */}
      <Modal open={modal === "create" || modal === "edit"} onClose={closeModal}
        title={modal === "edit" ? "Editar Cliente" : "Novo Cliente"} width={600}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Nome Completo" required span>
              <TextInput value={form.nome} onChange={v => set("nome", v)} placeholder="Nome completo" />
            </Field>
            <Field label="E-mail" required span>
              <TextInput type="email" value={form.email} onChange={v => set("email", v)} placeholder="cliente@email.com" />
            </Field>
            <Field label="Telefone">
              <TextInput value={form.telefone} onChange={v => set("telefone", v)} placeholder="(11) 99999-9999" />
            </Field>
            <Field label="CPF">
              <TextInput value={form.cpf} onChange={v => set("cpf", v)} placeholder="000.000.000-00" />
            </Field>
          </div>

          {/* Endereços */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: T.muted }}>Endereços ({(form.enderecos || []).length})</span>
              <Btn onClick={() => { setAddrForm(EMPTY_ADDR); setAddrModal(true); }} variant="subtle" size="sm">+ Adicionar</Btn>
            </div>
            {(form.enderecos || []).length === 0 ? (
              <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: "16px 0" }}>Nenhum endereço cadastrado.</p>
            ) : (form.enderecos || []).map((e, i) => (
              <div key={e.id || i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ fontSize: 13, color: T.subtext, lineHeight: 1.5 }}>
                  <strong style={{ color: T.text }}>{e.rua}, {e.numero}</strong>
                  {e.complemento && ` — ${e.complemento}`}<br />
                  {e.bairro} · {e.cidade}/{e.uf}<br />
                  <span style={{ fontSize: 11, color: T.muted }}>CEP: {e.cep}</span>
                </div>
                <button onClick={() => removeAddr(e.id || i)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 16, padding: "0 4px", flexShrink: 0 }}>×</button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={save} size="lg" style={{ flex: 1, justifyContent: "center" }}>
              {modal === "edit" ? "💾 Salvar" : "✓ Criar Cliente"}
            </Btn>
            <Btn onClick={closeModal} variant="ghost">Cancelar</Btn>
          </div>
        </div>
      </Modal>

      {/* MODAL VISUALIZAR */}
      <Modal open={modal === "view"} onClose={closeModal} title="Perfil do Cliente" width={480}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
            <Avatar name={form.nome} size={54} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{form.nome}</div>
              <div style={{ fontSize: 13, color: T.muted }}>{form.email}</div>
            </div>
          </div>
          {[["Telefone", form.telefone || "–"], ["CPF", form.cpf || "–"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 13, color: T.muted }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: T.muted, marginBottom: 10 }}>Endereços ({(form.enderecos || []).length})</div>
            {(form.enderecos || []).length === 0 ? (
              <p style={{ fontSize: 13, color: T.muted }}>Nenhum endereço.</p>
            ) : (form.enderecos || []).map((e, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 14px", marginBottom: 8, fontSize: 13, color: T.subtext, lineHeight: 1.6 }}>
                <strong style={{ color: T.text }}>{e.rua}, {e.numero}</strong> {e.complemento && `— ${e.complemento}`}<br />
                {e.bairro} · {e.cidade}/{e.uf} · CEP {e.cep}
              </div>
            ))}
          </div>
          <Btn onClick={() => { closeModal(); setTimeout(() => openEdit(form.email, form), 50); }} variant="ghost" style={{ justifyContent: "center" }}>✏ Editar perfil</Btn>
        </div>
      </Modal>

      {/* MODAL ENDEREÇO */}
      <Modal open={addrModal} onClose={() => setAddrModal(false)} title="Adicionar Endereço" width={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="CEP">
              <TextInput value={addrForm.cep} onChange={v => setA("cep", v)} placeholder="00000-000" />
            </Field>
            <Field label="Número">
              <TextInput value={addrForm.numero} onChange={v => setA("numero", v)} placeholder="123" />
            </Field>
            <Field label="Rua / Logradouro" required span>
              <TextInput value={addrForm.rua} onChange={v => setA("rua", v)} placeholder="Av. Paulista" />
            </Field>
            <Field label="Complemento" span>
              <TextInput value={addrForm.complemento} onChange={v => setA("complemento", v)} placeholder="Apto 42" />
            </Field>
            <Field label="Bairro">
              <TextInput value={addrForm.bairro} onChange={v => setA("bairro", v)} placeholder="Bela Vista" />
            </Field>
            <Field label="UF">
              <TextInput value={addrForm.uf} onChange={v => setA("uf", v.toUpperCase().slice(0, 2))} placeholder="SP" />
            </Field>
            <Field label="Cidade" required span>
              <TextInput value={addrForm.cidade} onChange={v => setA("cidade", v)} placeholder="São Paulo" />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn onClick={addAddr} style={{ flex: 1, justifyContent: "center" }}>✓ Adicionar Endereço</Btn>
            <Btn onClick={() => setAddrModal(false)} variant="ghost">Cancelar</Btn>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!delEmail} onClose={() => setDelEmail(null)} onConfirm={del}
        title="Remover Cliente"
        message={`Deseja remover o cliente "${users[delEmail]?.nome || delEmail}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, remover"
      />
    </div>
  );
}

function ClientCard({ email, u, onView, onEdit, onDelete }) {
  const endQty = (u.enderecos || []).length;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20,
      transition: "border-color .2s, transform .2s", cursor: "pointer",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,65,108,0.25)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; }}
    onClick={onView}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <Avatar name={u.nome} size={42} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.nome}</div>
          <div style={{ fontSize: 12, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {u.telefone && <Badge color={T.info}>{u.telefone}</Badge>}
        <Badge color={endQty > 0 ? T.ok : T.muted}>{endQty} endereço(s)</Badge>
      </div>
      <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
        <Btn onClick={onEdit} variant="ghost" size="sm" style={{ flex: 1, justifyContent: "center" }}>✏ Editar</Btn>
        <Btn onClick={onDelete} variant="danger" size="sm">✕</Btn>
      </div>
    </div>
  );
}
