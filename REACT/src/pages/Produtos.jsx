import { useState } from "react";
import { T, CATS, SK, fmt, uid, nowDt } from "../utils/constants";
import { ls } from "../utils/constants";
import {
  Btn, Card, Modal, ConfirmModal, SearchBar, EmptyState,
  PageHeader, Badge, Field, TextInput, SelectInput, FileInput
} from "../components/ui";

const EMPTY = { nome: "", desc: "", preco: "", marca: "", tipo: "", estoque: "99", specs: [], imgs: [] };

export default function Produtos({ prods, setProds, toast }) {
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(null);   // null | "create" | "edit"
  const [form, setForm]         = useState(EMPTY);
  const [specInput, setSpecInput] = useState("");
  const [imgUrl, setImgUrl]     = useState("");
  const [delId, setDelId]       = useState(null);
  const [filterCat, setFilterCat] = useState("");

  const filtered = prods.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.nome?.toLowerCase().includes(q) || p.marca?.toLowerCase().includes(q);
    const matchC = !filterCat || p.tipo === filterCat;
    return matchQ && matchC;
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(EMPTY); setSpecInput(""); setImgUrl(""); setModal("create"); };
  const openEdit   = (p) => { setForm({ ...p }); setSpecInput(""); setImgUrl(""); setModal("edit"); };
  const closeModal = ()  => { setModal(null); };

  // Specs
  const addSpec = () => {
    const v = specInput.trim();
    if (!v) return;
    set("specs", [...(form.specs || []), v]);
    setSpecInput("");
  };
  const removeSpec = (i) => set("specs", form.specs.filter((_, j) => j !== i));

  // Imagens
  const addImgUrl = () => {
    const v = imgUrl.trim();
    if (!v) return;
    set("imgs", [...(form.imgs || []), v]);
    setImgUrl("");
  };
  const handleFile = (dataUrl) => set("imgs", [...(form.imgs || []), dataUrl]);
  const removeImg  = (i) => set("imgs", form.imgs.filter((_, j) => j !== i));
  const moveImgFirst = (i) => {
    const arr = [...form.imgs];
    const [item] = arr.splice(i, 1);
    set("imgs", [item, ...arr]);
  };

  // Salvar
  const save = () => {
    if (!form.nome?.trim())  { toast("Nome obrigatório.", "err"); return; }
    if (!form.preco || isNaN(+form.preco)) { toast("Preço inválido.", "err"); return; }
    if (!form.marca?.trim()) { toast("Marca obrigatória.", "err"); return; }
    if (!form.tipo)          { toast("Selecione uma categoria.", "err"); return; }

    const entry = { ...form, preco: +form.preco, estoque: +form.estoque || 99,
      id: form.id || uid(), criadoEm: form.criadoEm || nowDt() };
    const next = modal === "edit"
      ? prods.map(p => p.id === entry.id ? entry : p)
      : [entry, ...prods];
    setProds(next); ls.set(SK.prods, next);
    toast(modal === "edit" ? `"${entry.nome}" atualizado!` : `"${entry.nome}" cadastrado!`, "ok");
    closeModal();
  };

  // Deletar
  const del = () => {
    const next = prods.filter(p => p.id !== delId);
    setProds(next); ls.set(SK.prods, next);
    setDelId(null); toast("Produto removido.", "ok");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <PageHeader
        title="Produtos"
        sub={`${prods.length} produto(s) no catálogo`}
        action={<Btn onClick={openCreate}>+ Novo Produto</Btn>}
      />

      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome, marca..." />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
          <option value="">Todas as categorias</option>
          {CATS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon="◈" title="Nenhum produto encontrado"
            sub={prods.length === 0 ? "Comece adicionando seu primeiro produto." : "Tente ajustar a busca."}
            action={prods.length === 0 && <Btn onClick={openCreate}>+ Novo Produto</Btn>} />
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 14 }}>
          {filtered.map(p => <ProdCard key={p.id} p={p} onEdit={openEdit} onDelete={id => setDelId(id)} />)}
        </div>
      )}

      {/* MODAL FORM */}
      <Modal open={!!modal} onClose={closeModal} title={modal === "edit" ? "Editar Produto" : "Novo Produto"} width={700}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Informações básicas */}
          <section>
            <SectionTitle>Informações Básicas</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Nome" required span>
                <TextInput value={form.nome} onChange={v => set("nome", v)} placeholder="Ex: RTX 4070 SUPER 12GB" />
              </Field>
              <Field label="Descrição Curta" span>
                <TextInput value={form.desc} onChange={v => set("desc", v)} placeholder="Ex: NVIDIA GeForce 12GB GDDR6X" />
              </Field>
              <Field label="Preço (R$)" required>
                <TextInput type="number" value={form.preco} onChange={v => set("preco", v)} placeholder="4499.99" />
              </Field>
              <Field label="Estoque">
                <TextInput type="number" value={form.estoque} onChange={v => set("estoque", v)} placeholder="99" />
              </Field>
              <Field label="Marca" required>
                <TextInput value={form.marca} onChange={v => set("marca", v)} placeholder="NVIDIA, AMD, Kingston..." />
              </Field>
              <Field label="Categoria" required>
                <SelectInput value={form.tipo} onChange={v => set("tipo", v)} options={CATS} />
              </Field>
            </div>
          </section>

          {/* Specs */}
          <section>
            <SectionTitle>Especificações Técnicas</SectionTitle>
            <div style={{ display: "flex", gap: 8 }}>
              <TextInput value={specInput} onChange={setSpecInput} placeholder="Ex: 12GB GDDR6X — Enter para adicionar" onEnter={addSpec} />
              <Btn onClick={addSpec} variant="subtle" size="sm">Adicionar</Btn>
            </div>
            {form.specs?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {form.specs.map((s, i) => (
                  <span key={i} onClick={() => removeSpec(i)} title="Clique para remover" style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                    background: "rgba(255,65,108,0.1)", border: "1px solid rgba(255,65,108,0.22)", color: "#ff8fa0",
                    display: "inline-flex", alignItems: "center", gap: 6, transition: "background .15s",
                  }}>
                    {s} <span style={{ lineHeight: 1, fontSize: 14, opacity: 0.6 }}>×</span>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Imagens */}
          <section>
            <SectionTitle>Imagens do Produto</SectionTitle>
            <p style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>A primeira imagem será a capa. Clique em uma imagem para torná-la principal.</p>

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <TextInput value={imgUrl} onChange={setImgUrl} placeholder="Cole uma URL de imagem..." onEnter={addImgUrl} />
              <Btn onClick={addImgUrl} variant="subtle" size="sm">+ URL</Btn>
            </div>
            <FileInput onFile={handleFile} label="Ou clique para fazer upload de imagem (jpg, png, webp)" />

            {form.imgs?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
                {form.imgs.map((src, i) => (
                  <div key={i} style={{ position: "relative", cursor: "pointer" }} onClick={() => moveImgFirst(i)}>
                    <img src={src} alt="" style={{
                      width: 80, height: 80, objectFit: "contain", borderRadius: 10, padding: 6,
                      background: "rgba(255,255,255,0.04)",
                      border: i === 0 ? "2px solid #ff416c" : `1px solid ${T.border}`,
                    }} onError={e => e.target.style.opacity = 0.15} />
                    {i === 0 && <span style={{ position: "absolute", top: -6, left: 4, fontSize: 9, fontWeight: 800, background: "linear-gradient(135deg,#ff416c,#ff4b2b)", color: "#fff", padding: "1px 7px", borderRadius: 20 }}>CAPA</span>}
                    <button onClick={e => { e.stopPropagation(); removeImg(i); }} style={{
                      position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
                      background: T.accent, border: "none", color: "#fff", fontSize: 13, cursor: "pointer", lineHeight: 1,
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <Btn onClick={save} size="lg" style={{ flex: 1, justifyContent: "center" }}>
              {modal === "edit" ? "💾 Salvar Alterações" : "✓ Cadastrar Produto"}
            </Btn>
            <Btn onClick={closeModal} variant="ghost">Cancelar</Btn>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!delId} onClose={() => setDelId(null)} onConfirm={del}
        title="Remover Produto"
        message="Tem certeza que deseja remover este produto? Esta ação não pode ser desfeita."
        confirmLabel="Sim, remover"
      />
    </div>
  );
}

function ProdCard({ p, onEdit, onDelete }) {
  const catLabel = CATS.find(c => c.v === p.tipo)?.l || p.tipo;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16,
      overflow: "hidden", transition: "border-color .2s, transform .2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,65,108,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; }}>
      <div style={{ position: "relative" }}>
        <img src={p.imgs?.[0] || ""} alt={p.nome} style={{ width: "100%", height: 140, objectFit: "contain", background: "rgba(255,255,255,0.03)", padding: 10 }} onError={e => e.target.style.opacity = 0.08} />
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <Badge>{catLabel}</Badge>
        </div>
        <div style={{ position: "absolute", top: 8, right: 8, fontSize: 11, fontWeight: 700, background: p.estoque > 0 ? "rgba(0,224,122,0.12)" : "rgba(255,65,108,0.12)", color: p.estoque > 0 ? T.ok : T.accent, border: `1px solid ${p.estoque > 0 ? "rgba(0,224,122,0.25)" : "rgba(255,65,108,0.25)"}`, borderRadius: 20, padding: "2px 9px" }}>
          {p.estoque > 0 ? `${p.estoque} un` : "Esgotado"}
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nome}</div>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>{p.marca}</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: T.accent, marginBottom: 14 }}>{fmt(p.preco)}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={() => onEdit(p)} variant="ghost" size="sm" style={{ flex: 1, justifyContent: "center" }}>✏ Editar</Btn>
          <Btn onClick={() => onDelete(p.id)} variant="danger" size="sm">✕</Btn>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: T.muted, marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
      {children}
    </div>
  );
}
