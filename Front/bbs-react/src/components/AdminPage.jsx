// ============================================================
//  AdminPage.jsx  —  Painel de gerenciamento de produtos (CRUD)
//  Tela cheia que sobrepõe o app. Permite ao administrador:
//  - Listar todos os produtos com busca por texto
//  - Criar novos produtos via modal
//  - Editar produtos existentes via modal
//  - Deletar produtos com confirmação
//  Toda comunicação com o banco é feita pelo produtosService.js.
// ============================================================

import { useState, useEffect } from "react";
import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
  deletarProduto,
} from "../services/produtosService";

// Categorias disponíveis para o select do formulário
const CATEGORIAS = [
  { id: "gpu",      label: "Placas de Vídeo"   },
  { id: "cpu",      label: "Processadores"      },
  { id: "ram",      label: "Memória RAM"         },
  { id: "ssd",      label: "SSDs"               },
  { id: "mae",      label: "Placas Mãe"         },
  { id: "fonte",    label: "Fontes"             },
  { id: "cooler",   label: "Coolers"            },
  { id: "gabinete", label: "Gabinetes"          },
  { id: "monitor",  label: "Monitores"          },
  { id: "mouse",    label: "Mouses"             },
  { id: "teclado",  label: "Teclados"           },
  { id: "mousepad", label: "Mousepads"          },
  { id: "headset",  label: "Headsets & Outros"  },
];

// Estado inicial do formulário (campos vazios)
const FORM_VAZIO = {
  nome: "",
  descricao: "",
  preco: "",
  estoque: "",
  imgUrl: "",
  tipo: "",
};

// Formata número para moeda brasileira
const fmt = v =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function AdminPage({ fechar }) {
  // ── Estados ───────────────────────────────────────────────

  const [produtos, setProdutos]           = useState([]);   // lista vinda da API
  const [loading, setLoading]             = useState(true); // spinner de carregamento
  const [erro, setErro]                   = useState("");   // mensagem de erro da API
  const [sucesso, setSucesso]             = useState("");   // mensagem de sucesso temporária
  const [form, setForm]                   = useState(FORM_VAZIO); // dados do formulário
  const [editandoId, setEditandoId]       = useState(null); // null = novo; número = editando
  const [modalAberto, setModalAberto]     = useState(false);// controla visibilidade do modal
  const [confirmDelete, setConfirmDelete] = useState(null); // produto aguardando confirmação de delete
  const [busca, setBusca]                 = useState("");   // texto digitado na barra de busca

  // Executa carregar() assim que o componente é montado na tela
  useEffect(() => { carregar(); }, []);

  // ── carregar ─────────────────────────────────────────────
  // Busca a lista de produtos na API e atualiza o estado.
  // Chamada na montagem e após cada criação/edição/deleção.
  async function carregar() {
    setLoading(true);
    setErro("");
    try {
      const data = await listarProdutos();
      setProdutos(Array.isArray(data) ? data : Array.from(data));
    } catch {
      setErro("Não foi possível conectar ao servidor. Verifique se o Spring Boot está rodando na porta 8080.");
    } finally {
      setLoading(false);
    }
  }

  // ── flash ────────────────────────────────────────────────
  // Exibe uma mensagem de sucesso verde por 3,5 segundos e some.
  function flash(msg) {
    setSucesso(msg);
    setTimeout(() => setSucesso(""), 3500);
  }

  // ── abrirNovo ────────────────────────────────────────────
  // Limpa o formulário e abre o modal no modo "criar novo produto".
  function abrirNovo() {
    setForm(FORM_VAZIO);
    setEditandoId(null); // null indica que é criação, não edição
    setErro("");
    setModalAberto(true);
  }

  // ── abrirEdicao ──────────────────────────────────────────
  // Preenche o formulário com os dados do produto selecionado
  // e abre o modal no modo "editar produto existente".
  function abrirEdicao(produto) {
    setForm({
      nome:      produto.nome      ?? "",
      descricao: produto.descricao ?? "",
      preco:     produto.preco     ?? "",
      estoque:   produto.estoque   ?? "",
      imgUrl:    produto.imgUrl    ?? "",
      tipo:      produto.tipo      ?? "",
    });
    setEditandoId(produto.id); // guarda o ID para enviar no PUT
    setErro("");
    setModalAberto(true);
  }

  // ── fecharModal ──────────────────────────────────────────
  // Reseta o formulário e fecha o modal.
  function fecharModal() {
    setModalAberto(false);
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErro("");
  }

  // ── salvar ───────────────────────────────────────────────
  // Valida os campos obrigatórios e envia o produto para a API.
  // Se editandoId existe → PUT (atualizar); senão → POST (criar).
  async function salvar() {
    // Validações básicas antes de chamar a API
    if (!form.nome.trim()) { setErro("O campo Nome é obrigatório."); return; }
    if (!form.preco || isNaN(Number(form.preco))) { setErro("Informe um Preço válido."); return; }

    // Monta o objeto que será enviado no body da requisição
    const payload = {
      nome:      form.nome.trim(),
      descricao: form.descricao.trim(),
      preco:     parseFloat(Number(form.preco).toFixed(2)), // garante 2 casas decimais
      estoque:   form.estoque !== "" ? parseInt(form.estoque) : 0,
      imgUrl:    form.imgUrl.trim(),
      tipo:      form.tipo,
    };

    try {
      if (editandoId) {
        await atualizarProduto(editandoId, payload); // PUT → editar
        flash("✅ Produto atualizado com sucesso!");
      } else {
        await criarProduto(payload);                 // POST → criar
        flash("✅ Produto criado com sucesso!");
      }
      fecharModal(); // fecha o modal após salvar
      carregar();    // recarrega a tabela com os dados atualizados
    } catch (e) {
      setErro(e.message); // exibe o erro retornado pelo serviço
    }
  }

  // ── confirmarDeletar ─────────────────────────────────────
  // Executa o DELETE na API após o usuário confirmar no diálogo.
  async function confirmarDeletar(id) {
    try {
      await deletarProduto(id);
      setConfirmDelete(null);          // fecha o diálogo de confirmação
      flash("🗑️ Produto removido.");
      carregar();                      // atualiza a tabela
    } catch (e) {
      setErro(e.message);
      setConfirmDelete(null);
    }
  }

  // ── produtosFiltrados ────────────────────────────────────
  // Filtra a lista pelo texto digitado na barra de busca.
  // Compara com nome e descrição, ignorando maiúsculas/minúsculas.
  const produtosFiltrados = produtos.filter(p =>
    (p.nome      ?? "").toLowerCase().includes(busca.toLowerCase()) ||
    (p.descricao ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  // Estilo do spinner de loading (círculo girando via CSS animation)
  const spinnerStyle = {
    width: 40, height: 40,
    border: "3px solid rgba(255,255,255,.08)",
    borderTop: "3px solid #ff416c",
    borderRadius: "50%",
    animation: "bbsSpin 0.8s linear infinite",
  };

  return (
    <>
      {/* Keyframes do spinner e override de cor do select */}
      <style>{`
        @keyframes bbsSpin { to { transform: rotate(360deg); } }
        .categoria-select option:not([value=""]) {
          background-color: #000 !important;
          color: #fff !important;
        }
      `}</style>

      {/* Overlay de tela cheia com fundo preto sólido (zIndex 6000 → fica acima de tudo) */}
      <div style={S.overlay}>

        {/* ════ MODAL FORMULÁRIO (criar / editar) ════
            Só renderizado quando modalAberto === true.
            O clique no modalOverlay (fundo escuro) fecha o modal.
            e.stopPropagation() no modal interno impede que o clique
            dentro do card propague para o overlay e feche o modal. */}
        {modalAberto && (
          <div style={S.modalOverlay} onClick={fecharModal}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>

              {/* Cabeçalho do modal com título dinâmico e botão fechar */}
              <div style={S.modalHeader}>
                <h3 style={S.modalTitle}>
                  {editandoId ? "✏️ Editar Produto" : "➕ Novo Produto"}
                </h3>
                <button style={S.closeBtn} onClick={fecharModal}>×</button>
              </div>

              {/* Alerta de erro de validação (campo inválido ou erro da API) */}
              {erro && <div style={S.alertErr}>{erro}</div>}

              {/* Grid de campos do formulário (2 colunas) */}
              <div style={S.formGrid}>

                {/* Campo Nome — ocupa as 2 colunas (gridColumn: "1/-1") */}
                <div style={{ ...S.field, gridColumn: "1/-1" }}>
                  <label style={S.label}>Nome *</label>
                  <input
                    style={S.input}
                    value={form.nome}
                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                    placeholder="Ex: RTX 4070 SUPER"
                  />
                </div>

                {/* Campo Preço */}
                <div style={S.field}>
                  <label style={S.label}>Preço (R$) *</label>
                  <input
                    style={S.input}
                    type="number"
                    step="0.01"
                    value={form.preco}
                    onChange={e => setForm(f => ({ ...f, preco: e.target.value }))}
                    placeholder="Ex: 4499.99"
                  />
                </div>

                {/* Campo Estoque */}
                <div style={S.field}>
                  <label style={S.label}>Estoque</label>
                  <input
                    style={S.input}
                    type="number"
                    value={form.estoque}
                    onChange={e => setForm(f => ({ ...f, estoque: e.target.value }))}
                    placeholder="Ex: 10"
                  />
                </div>

                {/* Select de Categoria — filtra o tipo para agrupamento na vitrine */}
                <div style={S.field}>
                  <label style={S.label}>Categoria</label>
                  <select
                    className="categoria-select"
                    style={{ ...S.input, cursor: "pointer" }}
                    value={form.tipo}
                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  >
                    <option value="">— Selecione —</option>
                    {CATEGORIAS.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Campo URL da imagem */}
                <div style={S.field}>
                  <label style={S.label}>URL da Imagem</label>
                  <input
                    style={S.input}
                    value={form.imgUrl}
                    onChange={e => setForm(f => ({ ...f, imgUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                {/* Campo Descrição — ocupa as 2 colunas */}
                <div style={{ ...S.field, gridColumn: "1/-1" }}>
                  <label style={S.label}>Descrição</label>
                  <textarea
                    style={{ ...S.input, resize: "vertical", minHeight: "80px" }}
                    value={form.descricao}
                    onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                    placeholder="Descreva o produto..."
                  />
                </div>
              </div>

              {/* Botões de ação do modal: Cancelar e Salvar */}
              <div style={{ display: "flex", gap: 12 }}>
                <button style={S.btnSecondary} onClick={fecharModal}>Cancelar</button>
                <button style={S.btnPrimary} onClick={salvar}>
                  {editandoId ? "Salvar Alterações" : "Criar Produto"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════ MODAL DE CONFIRMAÇÃO DE DELEÇÃO ════
            Aparece quando o usuário clica no 🗑️ da tabela.
            confirmDelete guarda o objeto do produto a ser deletado. */}
        {confirmDelete && (
          <div style={S.modalOverlay} onClick={() => setConfirmDelete(null)}>
            <div style={{ ...S.modal, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ color: "#fff", marginBottom: 12 }}>Confirmar exclusão</h3>
              <p style={{ color: "#999", marginBottom: 24 }}>
                Tem certeza que deseja remover <strong style={{ color: "#fff" }}>{confirmDelete.nome}</strong>?
                Esta ação não pode ser desfeita.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <button style={S.btnSecondary} onClick={() => setConfirmDelete(null)}>Cancelar</button>
                {/* Botão vermelho de confirmação definitiva */}
                <button
                  style={{ ...S.btnPrimary, background: "#c0392b" }}
                  onClick={() => confirmarDeletar(confirmDelete.id)}
                >
                  Sim, remover
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════ CONTEÚDO PRINCIPAL DA PÁGINA ADMIN ════ */}
        <div style={S.page}>

          {/* Cabeçalho: título + botão Voltar + botão Novo Produto */}
          <div style={S.header}>
            <div>
              <h1 style={S.title}>⚙️ Painel Admin</h1>
              <p style={S.subtitle}>BBS Store · Gestão de Produtos</p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* Mensagem de sucesso temporária (verde) */}
              {sucesso && <span style={S.alertOk}>{sucesso}</span>}
              <button style={S.backBtn} onClick={fechar}>← Voltar à loja</button>
              <button style={S.btnPrimary} onClick={abrirNovo}>+ Novo Produto</button>
            </div>
          </div>

          {/* Barra de ferramentas: busca + contador + botão atualizar */}
          <div style={S.toolbar}>
            {/* Input de busca: filtra a tabela em tempo real */}
            <input
              style={{ ...S.input, flex: 1, maxWidth: 400 }}
              placeholder="🔍  Buscar por nome ou descrição..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            {/* Caixinha com o total de produtos cadastrados */}
            <div style={S.statBox}>
              <span style={{ color: "#666", fontSize: ".85rem" }}>Total cadastrado:</span>
              <span style={{ color: "#ff416c", fontWeight: 700, fontSize: "1.1rem" }}>
                {produtos.length} produto{produtos.length !== 1 ? "s" : ""}
              </span>
            </div>
            {/* Botão para forçar novo fetch da API */}
            <button style={S.btnRefresh} onClick={carregar} title="Recarregar lista">
              ↻ Atualizar
            </button>
          </div>

          {/* ── TABELA DE PRODUTOS ─────────────────────────────
              Renderiza conteúdo diferente para cada estado:
              1. loading → spinner
              2. lista vazia → mensagem + botão criar
              3. lista com itens → tabela completa */}
          {loading ? (
            // Spinner centralizado enquanto aguarda a API
            <div style={S.empty}>
              <div style={spinnerStyle} />
              <p style={{ color: "#555", marginTop: 16, fontFamily: "'Poppins',sans-serif" }}>
                Conectando ao Spring Boot (porta 8080)...
              </p>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            // Lista vazia (nenhum produto ou nenhum resultado de busca)
            <div style={S.empty}>
              <p style={{ fontSize: "3rem" }}>📦</p>
              <p style={{ color: "#666", fontFamily: "'Poppins',sans-serif" }}>
                {busca
                  ? "Nenhum produto encontrado para essa busca."
                  : "Nenhum produto cadastrado ainda."}
              </p>
              {!busca && (
                <button style={S.btnPrimary} onClick={abrirNovo}>
                  Adicionar primeiro produto
                </button>
              )}
            </div>
          ) : (
            // Tabela com scroll horizontal (para telas menores)
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {/* Cabeçalhos da tabela */}
                    {["ID", "Imagem", "Nome", "Categoria", "Descrição", "Preço", "Estoque", "Cadastrado em", "Ações"].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {produtosFiltrados.map((p, i) => (
                    <tr
                      key={p.id}
                      style={{
                        ...S.tr,
                        // Linhas alternadas com leve diferença de fundo (zebra striping)
                        background: i % 2 === 0 ? "rgba(255,255,255,.02)" : "transparent",
                      }}
                    >
                      {/* ID em cinza com prefixo # */}
                      <td style={{ ...S.td, color: "#555", fontFamily: "monospace" }}>#{p.id}</td>

                      {/* Miniatura da imagem ou ícone padrão */}
                      <td style={S.td}>
                        {p.imgUrl ? (
                          <img
                            src={p.imgUrl}
                            alt={p.nome}
                            style={{
                              width: 48, height: 48, objectFit: "contain",
                              borderRadius: 8, background: "rgba(255,255,255,.05)",
                            }}
                          />
                        ) : (
                          <div style={{
                            width: 48, height: 48, borderRadius: 8,
                            background: "rgba(255,255,255,.04)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.4rem",
                          }}>
                            🖥️
                          </div>
                        )}
                      </td>

                      {/* Nome do produto */}
                      <td style={S.td}>
                        <p style={{ margin: 0, fontWeight: 600, color: "#eee", fontSize: ".9rem" }}>
                          {p.nome}
                        </p>
                      </td>

                      {/* Badge de categoria (verde) ou traço se não houver */}
                      <td style={S.td}>
                        {p.tipo ? (
                          <span style={S.badge}>
                            {/* Procura o label legível pela id do tipo */}
                            {CATEGORIAS.find(c => c.id === p.tipo)?.label ?? p.tipo}
                          </span>
                        ) : (
                          <span style={{ color: "#444" }}>—</span>
                        )}
                      </td>

                      {/* Descrição truncada a 60 caracteres */}
                      <td style={{ ...S.td, color: "#777", fontSize: ".82rem", maxWidth: 220 }}>
                        {p.descricao
                          ? p.descricao.length > 60
                            ? p.descricao.slice(0, 60) + "…"
                            : p.descricao
                          : <span style={{ color: "#444" }}>—</span>
                        }
                      </td>

                      {/* Preço em vermelho/rosa */}
                      <td style={{ ...S.td, color: "#ff416c", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {fmt(p.preco)}
                      </td>

                      {/* Badge de estoque com cor dinâmica:
                          - vermelho → esgotado (0)
                          - laranja → estoque baixo (≤ 5)
                          - verde → estoque normal */}
                      <td style={S.td}>
                        <span style={{
                          ...S.badge,
                          ...(p.estoque === 0
                            ? { color: "#ff8fa0", borderColor: "rgba(255,65,108,.3)", background: "rgba(255,65,108,.08)" }
                            : p.estoque <= 5
                            ? { color: "#f5a623", borderColor: "rgba(245,166,35,.3)", background: "rgba(245,166,35,.08)" }
                            : {}),
                        }}>
                          {p.estoque ?? 0} un.
                        </span>
                      </td>

                      {/* Data de criação formatada para pt-BR */}
                      <td style={{ ...S.td, color: "#555", fontSize: ".78rem", whiteSpace: "nowrap" }}>
                        {p.dataCriacao
                          ? new Date(p.dataCriacao).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>

                      {/* Botões de ação: Editar e Deletar */}
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: 8 }}>
                          {/* Editar: abre o modal preenchido com os dados do produto */}
                          <button style={S.btnEdit} onClick={() => abrirEdicao(p)}>
                            ✏️ Editar
                          </button>
                          {/* Deletar: abre o diálogo de confirmação antes de excluir */}
                          <button style={S.btnDelete} onClick={() => setConfirmDelete(p)}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────
// Objeto com todos os styles inline organizados por elemento.
// Permite reutilizar e manter o visual consistente sem um arquivo CSS separado.
const S = {
  // Tela cheia preta que cobre todo o app (zIndex 6000 → acima do carrinho e do checkout)
  overlay:      { position: "fixed", inset: 0, background: "#080808", zIndex: 6000, overflowY: "auto", fontFamily: "'Poppins',sans-serif" },
  // Área de conteúdo centralizada com largura máxima
  page:         { maxWidth: 1200, margin: "0 auto", padding: "32px 24px" },
  // Linha do cabeçalho: título à esquerda, botões à direita
  header:       { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  title:        { margin: 0, fontSize: "1.6rem", fontWeight: 700, color: "#fff" },
  subtitle:     { margin: 0, fontSize: ".75rem", color: "#555", letterSpacing: "2px", textTransform: "uppercase", marginTop: 2 },
  backBtn:      { background: "transparent", border: "1px solid rgba(255,255,255,.12)", color: "#888", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: ".85rem" },
  toolbar:      { display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" },
  statBox:      { display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", background: "rgba(255,255,255,.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,.07)" },
  btnRefresh:   { background: "transparent", border: "1px solid rgba(255,255,255,.1)", color: "#666", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: ".85rem" },
  tableWrap:    { overflowX: "auto", borderRadius: 16, border: "1px solid rgba(255,255,255,.07)" },
  table:        { width: "100%", borderCollapse: "collapse" },
  // Cabeçalho da tabela com texto em maiúsculas e espaçamento de letras
  th:           { padding: "14px 16px", textAlign: "left", fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#555", borderBottom: "1px solid rgba(255,255,255,.07)", background: "rgba(0,0,0,.5)", whiteSpace: "nowrap" },
  tr:           { borderBottom: "1px solid rgba(255,255,255,.04)" },
  td:           { padding: "14px 16px", verticalAlign: "middle" },
  badge:        { display: "inline-block", padding: "4px 12px", background: "rgba(0,224,122,.08)", border: "1px solid rgba(0,224,122,.2)", borderRadius: 20, fontSize: ".75rem", color: "#00e07a", fontWeight: 600 },
  btnEdit:      { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#ccc", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", whiteSpace: "nowrap" },
  btnDelete:    { background: "rgba(255,65,108,.1)", border: "1px solid rgba(255,65,108,.2)", color: "#ff416c", padding: "7px 10px", borderRadius: 8, cursor: "pointer", fontSize: ".85rem" },
  empty:        { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "80px 20px", textAlign: "center" },
  // Fundo escuro com blur atrás do modal (backdrop-filter)
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", zIndex: 7000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(6px)" },
  modal:        { background: "#111", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" },
  modalHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle:   { margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" },
  closeBtn:     { background: "none", border: "none", color: "#666", fontSize: "1.8rem", cursor: "pointer", lineHeight: 1, padding: 0 },
  formGrid:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 24 },
  field:        { marginBottom: 0 },
  label:        { display: "block", fontSize: ".68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "#555", marginBottom: 7 },
  input:        { width: "100%", padding: "12px 14px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", outline: "none", boxSizing: "border-box" },
  // Botão principal: gradiente vermelho
  btnPrimary:   { flex: 1, padding: "13px 24px", background: "linear-gradient(45deg,#ff416c,#ff4b2b)", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", fontWeight: 700, cursor: "pointer" },
  // Botão secundário: transparente com borda
  btnSecondary: { padding: "13px 24px", background: "transparent", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, color: "#888", fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", cursor: "pointer" },
  alertErr:     { background: "rgba(255,65,108,.1)", border: "1px solid rgba(255,65,108,.3)", color: "#ff8fa0", padding: "12px 16px", borderRadius: 10, fontSize: ".85rem", marginBottom: 16 },
  alertOk:      { background: "rgba(0,224,122,.08)", border: "1px solid rgba(0,224,122,.25)", color: "#00e07a", padding: "12px 16px", borderRadius: 10, fontSize: ".85rem", marginBottom: 16 },
};
