import { useState, useEffect, useRef } from "react";
import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  alternarStatusProduto,
} from "../services/produtosService";

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

const FORM_VAZIO = {
  nome: "",
  descricao: "",
  preco: "",
  estoque: "",
  tipo: "",
  ativo: true,
};

const fmt = v =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function AdminPage({ fechar }) {
  // ==========================
  // AdminPage
  // ==========================
  // Função principal do Painel Admin.
  // Responsabilidades (passo a passo do usuário):
  // 1) Ao montar: chama carregar() → faz GET dos produtos no backend.
  // 2) Usuário busca/filtra produtos na UI (somente client-side).
  // 3) Usuário cria um novo produto (abre modal)
  //    - Se tiver imagem: POST /produtos/com-imagem (multipart)
  //    - Se não tiver imagem: POST /produtos (JSON)
  // 4) Usuário edita um produto (abre modal no modo edição)
  //    - Se escolher nova imagem: PUT /produtos/{id}/com-imagem (multipart)
  //    - Se não escolher nova imagem: PUT /produtos/{id} (JSON, mantendo imgUrl)
  // 5) Usuário alterna status (Ativo/Inativo) → PATCH /produtos/{id}/status
  // 6) Usuário remove → DELETE /produtos/{id}
  // 
  // IMPORTANTE:
  // - Este componente conversa com a API REST do Spring Boot.
  // - As chamadas REST são feitas pelas funções do produtosService.js
  //   e pelas funções locais de upload (FormData + fetch).
  // 
  const [produtos, setProdutos]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [erro, setErro]                   = useState("");
  const [sucesso, setSucesso]             = useState("");
  const [form, setForm]                   = useState(FORM_VAZIO);
  const [editandoId, setEditandoId]       = useState(null);
  const [modalAberto, setModalAberto]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busca, setBusca]                 = useState("");

  // ── Estado de upload de imagem ──────────────────────────────────────────────
  // imagemArquivo  → File selecionado pelo usuário (enviado ao back-end)
  // imagemPreview  → URL local para exibir o preview sem precisar fazer upload antes
  // imgUrlExistente → URL que já estava salva no banco (usada quando não seleciona arquivo novo)
  const [imagemArquivo, setImagemArquivo]   = useState(null);
  const [imagemPreview, setImagemPreview]   = useState("");
  const [imgUrlExistente, setImgUrlExistente] = useState("");
  const inputFileRef = useRef(null);

  useEffect(() => { carregar(); }, []);

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

  function flash(msg) {
    setSucesso(msg);
    setTimeout(() => setSucesso(""), 3500);
  }

  // Limpa os estados de imagem ao abrir o modal
  function resetImagem() {
    setImagemArquivo(null);
    setImagemPreview("");
    setImgUrlExistente("");
    if (inputFileRef.current) inputFileRef.current.value = "";
  }

  function abrirNovo() {
    setForm(FORM_VAZIO);
    setEditandoId(null);
    setErro("");
    resetImagem();
    setModalAberto(true);
  }

  function abrirEdicao(produto) {
    setForm({
      nome:      produto.nome      ?? "",
      descricao: produto.descricao ?? "",
      preco:     produto.preco     ?? "",
      estoque:   produto.estoque   ?? "",
      tipo:      produto.tipo      ?? "",
      ativo:     produto.ativo     ?? true,
    });
    setEditandoId(produto.id);
    setErro("");
    resetImagem();
    // Guarda a URL que já existe no banco para usar como fallback
    setImgUrlExistente(produto.imgUrl ?? "");
    // Exibe a imagem atual como preview inicial
    setImagemPreview(produto.imgUrl ?? "");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErro("");
    resetImagem();
  }

  // Chamado quando o usuário seleciona um arquivo no <input type="file">
  function handleArquivoSelecionado(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    // Valida tipo de arquivo
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!tiposPermitidos.includes(arquivo.type)) {
      setErro("Formato inválido. Use JPG, PNG, WEBP ou GIF.");
      return;
    }

    // Valida tamanho (máx 5MB)
    if (arquivo.size > 5 * 1024 * 1024) {
      setErro("A imagem deve ter no máximo 5MB.");
      return;
    }

    setErro("");
    setImagemArquivo(arquivo);

    // Gera preview local usando URL temporária (não faz upload ainda)
    const urlLocal = URL.createObjectURL(arquivo);
    setImagemPreview(urlLocal);
  }

  function removerImagem() {
    setImagemArquivo(null);
    setImagemPreview("");
    setImgUrlExistente("");
    if (inputFileRef.current) inputFileRef.current.value = "";
  }

  async function salvar() {
    if (!form.nome.trim()) { setErro("O campo Nome é obrigatório."); return; }
    if (!form.preco || isNaN(Number(form.preco))) { setErro("Informe um Preço válido."); return; }

    try {
      if (editandoId) {
        // ── EDIÇÃO ────────────────────────────────────────────────────────────
        // Se o usuário selecionou um arquivo novo → envia multipart/form-data
        // Se não selecionou → envia JSON com a imgUrl que já existia no banco
        if (imagemArquivo) {
          await atualizarProdutoComImagem(editandoId, form, imagemArquivo);
        } else {
          await atualizarProduto(editandoId, {
            nome:      form.nome.trim(),
            descricao: form.descricao.trim(),
            preco:     parseFloat(Number(form.preco).toFixed(2)),
            estoque:   form.estoque !== "" ? parseInt(form.estoque) : 0,
            imgUrl:    imgUrlExistente,   // mantém a URL que já estava no banco
            tipo:      form.tipo,
            ativo:     form.ativo,
          });
        }
        flash("✅ Produto atualizado com sucesso!");
      } else {
        // ── CRIAÇÃO ───────────────────────────────────────────────────────────
        if (imagemArquivo) {
          await criarProdutoComImagem(form, imagemArquivo);
        } else {
          await criarProduto({
            nome:      form.nome.trim(),
            descricao: form.descricao.trim(),
            preco:     parseFloat(Number(form.preco).toFixed(2)),
            estoque:   form.estoque !== "" ? parseInt(form.estoque) : 0,
            imgUrl:    "",
            tipo:      form.tipo,
            ativo:     form.ativo,
          });
        }
        flash("✅ Produto criado com sucesso!");
      }
      fecharModal();
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function confirmarDeletar(id) {
    try {
      await deletarProduto(id);
      setConfirmDelete(null);
      flash("🗑️ Produto removido.");
      carregar();
    } catch (e) {
      setErro(e.message);
      setConfirmDelete(null);
    }
  }

  async function toggleStatus(produto) {
    try {
      const atualizado = await alternarStatusProduto(produto.id);
      setProdutos(prev =>
        prev.map(p => p.id === produto.id ? { ...p, ativo: atualizado.ativo } : p)
      );
      flash(atualizado.ativo ? "✅ Produto ativado!" : "⚠️ Produto desativado!");
    } catch (e) {
      setErro(e.message);
    }
  }

  const produtosFiltrados = produtos.filter(p =>
    (p.nome      ?? "").toLowerCase().includes(busca.toLowerCase()) ||
    (p.descricao ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  const spinnerStyle = {
    width: 40, height: 40,
    border: "3px solid rgba(255,255,255,.08)",
    borderTop: "3px solid #ff416c",
    borderRadius: "50%",
    animation: "bbsSpin 0.8s linear infinite",
  };

  return (
    <>
      <style>{`
        @keyframes bbsSpin { to { transform: rotate(360deg); } }
        .categoria-select option {
          background-color: #1a1a1a !important;
          color: #5f5555ff !important;
        }
        .categoria-select option[value=""] {
          color: #5f5555ff !important;
        }
        .upload-area {
          border: 2px dashed rgba(255,255,255,.15);
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color .2s, background .2s;
        }
        .upload-area:hover {
          border-color: rgba(255,65,108,.5);
          background: rgba(255,65,108,.04);
        }
        .upload-area.tem-imagem {
          border-style: solid;
          border-color: rgba(255,65,108,.3);
          padding: 12px;
        }
        .upload-area {
          border: 2px dashed rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color .2s, background .2s;
        }
        .upload-area:hover {
          border-color: rgba(255,65,108,.5);
          background: rgba(255,65,108,.04);
        }
        .upload-area.tem-imagem {
          border-style: solid;
          border-color: rgba(255,65,108,.3);
          padding: 12px;
        }
      `}</style>

      <div style={S.overlay}>

        {/* ════ MODAL FORMULÁRIO ════ */}
        {modalAberto && (
          <div style={S.modalOverlay} onClick={fecharModal}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>

              <div style={S.modalHeader}>
                <h3 style={S.modalTitle}>
                  {editandoId ? "✏️ Editar Produto" : "➕ Novo Produto"}
                </h3>
                <button style={S.closeBtn} onClick={fecharModal}>×</button>
              </div>

              {erro && <div style={S.alertErr}>{erro}</div>}

              <div style={S.formGrid}>

                {/* Nome */}
                <div style={{ ...S.field, gridColumn: "1/-1" }}>
                  <label style={S.label}>Nome *</label>
                  <input
                    style={S.input}
                    placeholder="Ex: RTX 4070 SUPER"
                    value={form.nome}
                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  />
                </div>

                {/* Descrição */}
                <div style={{ ...S.field, gridColumn: "1/-1" }}>
                  <label style={S.label}>Descrição</label>
                  <textarea
                    style={{ ...S.input, resize: "vertical", minHeight: 80 }}
                    placeholder="Descrição do produto..."
                    value={form.descricao}
                    onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  />
                </div>

                {/* Preço */}
                <div style={S.field}>
                  <label style={S.label}>Preço (R$) *</label>
                  <input
                    style={S.input}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={form.preco}
                    onChange={e => setForm(f => ({ ...f, preco: e.target.value }))}
                  />
                </div>

                {/* Estoque */}
                <div style={S.field}>
                  <label style={S.label}>Estoque (unidades)</label>
                  <input
                    style={S.input}
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.estoque}
                    onChange={e => setForm(f => ({ ...f, estoque: e.target.value }))}
                  />
                </div>

                {/* ── UPLOAD DE IMAGEM ─────────────────────────────────────── */}
                <div style={{ ...S.field, gridColumn: "1/-1" }}>
                  <label style={S.label}>Imagem do Produto</label>

                  {/* Input file oculto — acionado pelo clique na área de upload */}
                  <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: "none" }}
                    onChange={handleArquivoSelecionado}
                  />

                  {imagemPreview ? (
                    /* ── Preview da imagem selecionada ou já existente ── */
                    <div className="upload-area tem-imagem">
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <img
                          src={imagemPreview}
                          alt="preview"
                          onError={e => { e.target.style.display = "none"; }}
                          style={{
                            height: 80, maxWidth: 120,
                            objectFit: "contain", borderRadius: 8,
                            background: "rgba(255,255,255,.05)", padding: 4,
                          }}
                        />
                        <div style={{ flex: 1, textAlign: "left" }}>
                          {imagemArquivo ? (
                            <>
                              <p style={{ margin: 0, fontSize: ".85rem", color: "#00e07a", fontWeight: 600 }}>
                                ✅ {imagemArquivo.name}
                              </p>
                              <p style={{ margin: "2px 0 0", fontSize: ".75rem", color: "#555" }}>
                                {(imagemArquivo.size / 1024).toFixed(0)} KB
                              </p>
                            </>
                          ) : (
                            <p style={{ margin: 0, fontSize: ".85rem", color: "#888" }}>
                              Imagem atual (do banco)
                            </p>
                          )}
                          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                            <button
                              onClick={() => inputFileRef.current?.click()}
                              style={{
                                background: "rgba(255,255,255,.08)",
                                border: "1px solid rgba(255,255,255,.12)",
                                color: "#ccc", padding: "6px 14px",
                                borderRadius: 8, cursor: "pointer",
                                fontFamily: "'Poppins',sans-serif", fontSize: ".78rem",
                              }}
                            >
                              Trocar imagem
                            </button>
                            <button
                              onClick={removerImagem}
                              style={{
                                background: "rgba(255,65,108,.1)",
                                border: "1px solid rgba(255,65,108,.2)",
                                color: "#ff8fa0", padding: "6px 14px",
                                borderRadius: 8, cursor: "pointer",
                                fontFamily: "'Poppins',sans-serif", fontSize: ".78rem",
                              }}
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Área de clique para selecionar arquivo ── */
                    <div
                      className="upload-area"
                      onClick={() => inputFileRef.current?.click()}
                    >
                      <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>📷</div>
                      <p style={{ margin: 0, color: "#888", fontSize: ".85rem" }}>
                        Clique para selecionar uma imagem
                      </p>
                      <p style={{ margin: "4px 0 0", color: "#555", fontSize: ".75rem" }}>
                        JPG, PNG, WEBP ou GIF · máx. 5 MB
                      </p>
                    </div>
                  )}
                </div>
                {/* ─────────────────────────────────────────────────────────── */}

                {/* Categoria */}
                <div style={S.field}>
                  <label style={S.label}>Categoria</label>
                  <select
                    className="categoria-select"
                    style={{ ...S.input, cursor: "pointer" }}
                    value={form.tipo}
                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  >
                    <option value=""> Selecione uma categoria </option>
                    {CATEGORIAS.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
{/* Status Ativo/Inativo */}
<div style={S.field}>
  <label style={S.label}>Status</label>
  <div style={{ display: "flex", gap: 10 }}>

    {/* Botão ATIVO */}
    <div
      onClick={() => setForm(f => ({ ...f, ativo: true }))}
      style={{
        flex: 1, display: "flex", alignItems: "center", gap: 10,
        padding: "12px 14px", borderRadius: 10, cursor: "pointer",
        background: form.ativo ? "rgba(0,224,122,.08)" : "transparent",
        border: `1px solid ${form.ativo ? "rgba(0,224,122,.3)" : "rgba(255,255,255,.08)"}`,
        transition: "all .2s",
      }}
    >
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        background: form.ativo ? "#00e07a" : "rgba(255,255,255,.15)",
        transition: "background .2s",
      }} />
      <span style={{
        fontWeight: 600, fontSize: ".85rem",
        color: form.ativo ? "#00e07a" : "rgba(255,255,255,.25)",
        transition: "color .2s",
      }}>
        Ativo
      </span>
    </div>

    {/* Botão INATIVO */}
    <div
      onClick={() => setForm(f => ({ ...f, ativo: false }))}
      style={{
        flex: 1, display: "flex", alignItems: "center", gap: 10,
        padding: "12px 14px", borderRadius: 10, cursor: "pointer",
        background: !form.ativo ? "rgba(255,65,108,.08)" : "transparent",
        border: `1px solid ${!form.ativo ? "rgba(255,65,108,.3)" : "rgba(255,255,255,.08)"}`,
        transition: "all .2s",
      }}
    >
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        background: !form.ativo ? "#ff416c" : "rgba(255,255,255,.15)",
        transition: "background .2s",
      }} />
      <span style={{
        fontWeight: 600, fontSize: ".85rem",
        color: !form.ativo ? "#ff416c" : "rgba(255,255,255,.25)",
        transition: "color .2s",
      }}>
        Inativo
      </span>
    </div>

  </div>
</div>

              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button style={S.btnSecondary} onClick={fecharModal}>Cancelar</button>
                <button style={S.btnPrimary} onClick={salvar}>
                  {editandoId ? "Salvar Alterações" : "Criar Produto"}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ════ MODAL CONFIRMAR DELETE ════ */}
        {confirmDelete && (
          <div style={S.modalOverlay} onClick={() => setConfirmDelete(null)}>
            <div style={{ ...S.modal, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🗑️</div>
                <h3 style={{ color: "#fff", margin: "0 0 8px" }}>Remover produto?</h3>
                <p style={{ color: "#888", margin: "0 0 24px", fontSize: ".9rem" }}>
                  <strong style={{ color: "#ff416c" }}>{confirmDelete.nome}</strong>
                  {" "}será removido permanentemente do banco de dados.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button style={S.btnSecondary} onClick={() => setConfirmDelete(null)}>
                    Cancelar
                  </button>
                  <button
                    style={{ ...S.btnPrimary, background: "linear-gradient(45deg,#c0392b,#e74c3c)" }}
                    onClick={() => confirmarDeletar(confirmDelete.id)}
                  >
                    Sim, remover
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ CONTEÚDO PRINCIPAL ════ */}
        <div style={S.page}>

          <div style={S.header}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <button style={S.backBtn} onClick={fechar}>← Voltar à Loja</button>
              <div>
                <h1 style={S.title}>Painel Admin</h1>
                <p style={S.subtitle}>Gerenciar Produtos · BBS Store</p>
              </div>
            </div>
            <button style={S.btnPrimary} onClick={abrirNovo}>+ Novo Produto</button>
          </div>

          {sucesso && (
            <div style={{
              background: "rgba(0,224,122,.08)", border: "1px solid rgba(0,224,122,.25)",
              color: "#00e07aff", padding: "12px 16px", borderRadius: 10,
              fontSize: ".85rem", marginBottom: 16,
            }}>
              {sucesso}
            </div>
          )}
          {erro && !modalAberto && !confirmDelete && (
            <div style={S.alertErr}>{erro}</div>
          )}

          <div style={S.toolbar}>
            <input
              style={{ ...S.input, maxWidth: 380, margin: 0 }}
              placeholder="🔍  Buscar por nome ou descrição..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            <div style={S.statBox}>
              <span style={{ color: "#666", fontSize: ".85rem" }}>Total cadastrado:</span>
              <span style={{ color: "#ff416c", fontWeight: 700, fontSize: "1.1rem" }}>
                {produtos.length} produto{produtos.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div style={{ ...S.statBox, gap: 16 }}>
              <span style={{ fontSize: ".82rem", color: "#00e07a" }}>
                ● {produtos.filter(p => p.ativo).length} ativos
              </span>
              <span style={{ fontSize: ".82rem", color: "#ff416c" }}>
                ● {produtos.filter(p => !p.ativo).length} inativos
              </span>
            </div>
            <button style={S.btnRefresh} onClick={carregar} title="Recarregar lista">
              ↻ Atualizar
            </button>
          </div>

          {/* TABELA */}
          {loading ? (
            <div style={S.empty}>
              <div style={spinnerStyle} />
              <p style={{ color: "#555", marginTop: 16, fontFamily: "'Poppins',sans-serif" }}>
                Conectando ao Spring Boot (porta 8080)...
              </p>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div style={S.empty}>
              <p style={{ fontSize: "3rem" }}>📦</p>
              <p style={{ color: "#666", fontFamily: "'Poppins',sans-serif" }}>
                {busca ? "Nenhum produto encontrado para essa busca." : "Nenhum produto cadastrado ainda."}
              </p>
              {!busca && (
                <button style={S.btnPrimary} onClick={abrirNovo}>
                  Adicionar primeiro produto
                </button>
              )}
            </div>
          ) : (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {["ID", "Imagem", "Nome", "Categoria", "Descrição", "Preço", "Estoque", "Status", "Cadastrado em", "Ações"].map(h => (
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
                        background: i % 2 === 0 ? "rgba(61,59,59,.02)" : "transparent",
                        opacity: p.ativo ? 1 : 0.5,
                      }}
                    >
                      <td style={{ ...S.td, color: "#555", fontFamily: "monospace" }}>#{p.id}</td>

                      <td style={S.td}>
                        {p.imgUrl ? (
                          <img src={p.imgUrl} alt={p.nome}
                            style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 8, background: "rgba(255,255,255,.05)" }}
                          />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: "rgba(255,255,255,.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
                            🖥️
                          </div>
                        )}
                      </td>

                      <td style={S.td}>
                        <p style={{ margin: 0, fontWeight: 600, color: "#eee", fontSize: ".9rem" }}>
                          {p.nome}
                        </p>
                      </td>

                      <td style={S.td}>
                        {p.tipo ? (
                          <span style={S.badge}>
                            {CATEGORIAS.find(c => c.id === p.tipo)?.label ?? p.tipo}
                          </span>
                        ) : (
                          <span style={{ color: "#444" }}>—</span>
                        )}
                      </td>

                      <td style={{ ...S.td, color: "#777", fontSize: ".82rem", maxWidth: 220 }}>
                        {p.descricao
                          ? p.descricao.length > 60 ? p.descricao.slice(0, 60) + "…" : p.descricao
                          : <span style={{ color: "#444" }}>—</span>
                        }
                      </td>

                      <td style={{ ...S.td, color: "#ff416c", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {fmt(p.preco)}
                      </td>

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

                      <td style={S.td}>
                        <button
                          onClick={() => toggleStatus(p)}
                          style={{
                            display: "flex", alignItems: "center", gap: 7,
                            padding: "6px 14px", borderRadius: 20, border: "none",
                            cursor: "pointer", fontWeight: 700, fontSize: ".75rem",
                            fontFamily: "'Poppins',sans-serif",
                            background: p.ativo ? "rgba(0,224,122,.12)" : "rgba(255,65,108,.12)",
                            color: p.ativo ? "#00e07a" : "#ff8fa0",
                          }}
                          title="Clique para alternar o status"
                        >
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: p.ativo ? "#00e07a" : "#ff416c",
                          }} />
                          {p.ativo ? "Ativo" : "Inativo"}
                        </button>
                      </td>

                      <td style={{ ...S.td, color: "#555", fontSize: ".78rem", whiteSpace: "nowrap" }}>
                        {p.dataCriacao
                          ? new Date(p.dataCriacao).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>

                      <td style={S.td}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button style={S.btnEdit} onClick={() => abrirEdicao(p)}>
                            ✏️ Editar
                          </button>
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

const S = {
  overlay:      { position: "fixed", inset: 0, background: "#080808", zIndex: 6000, overflowY: "auto", fontFamily: "'Poppins',sans-serif" },
  page:         { maxWidth: 1200, margin: "0 auto", padding: "32px 24px" },
  header:       { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  title:        { margin: 0, fontSize: "1.6rem", fontWeight: 700, color: "#fff" },
  subtitle:     { margin: 0, fontSize: ".75rem", color: "#555", letterSpacing: "2px", textTransform: "uppercase", marginTop: 2 },
  backBtn:      { background: "transparent", border: "1px solid rgba(255,255,255,.12)", color: "#888", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: ".85rem" },
  toolbar:      { display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" },
  statBox:      { display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", background: "rgba(255,255,255,.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,.07)" },
  btnRefresh:   { background: "transparent", border: "1px solid rgba(255,255,255,.1)", color: "#666", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: ".85rem" },
  tableWrap:    { overflowX: "auto", borderRadius: 16, border: "1px solid rgba(255,255,255,.07)" },
  table:        { width: "100%", borderCollapse: "collapse" },
  th:           { padding: "14px 16px", textAlign: "left", fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#555", borderBottom: "1px solid rgba(255,255,255,.07)", background: "rgba(0,0,0,.5)", whiteSpace: "nowrap" },
  tr:           { borderBottom: "1px solid rgba(255,255,255,.04)" },
  td:           { padding: "14px 16px", verticalAlign: "middle" },
  badge:        { display: "inline-block", padding: "4px 12px", background: "rgba(0,224,122,.08)", border: "1px solid rgba(0,224,122,.2)", borderRadius: 20, fontSize: ".75rem", color: "#00e07a", fontWeight: 600 },
  btnEdit:      { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#ccc", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: ".8rem", whiteSpace: "nowrap" },
  btnDelete:    { background: "rgba(255,65,108,.1)", border: "1px solid rgba(255,65,108,.2)", color: "#ff416c", padding: "7px 10px", borderRadius: 8, cursor: "pointer", fontSize: ".85rem" },
  empty:        { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "80px 20px", textAlign: "center" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", zIndex: 7000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(6px)" },
  modal:        { background: "#111", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" },
  modalHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle:   { margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" },
  closeBtn:     { background: "none", border: "none", color: "#666", fontSize: "1.8rem", cursor: "pointer", lineHeight: 1, padding: 0 },
  formGrid:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 24 },
  field:        { marginBottom: 0 },
  label:        { display: "block", fontSize: ".68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "#ffffffff", marginBottom: 7 },
  input:        { width: "100%", padding: "12px 14px", background: "rgba(255, 255, 255, 0.99)", border: "1px solid rgba(136, 38, 38, 0.1)", borderRadius: 10, color: "#000000ff", fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", outline: "none", boxSizing: "border-box" },
  btnPrimary:   { flex: 1, padding: "13px 24px", background: "linear-gradient(45deg,#ff416c,#ff4b2b)", border: "none", borderRadius: 10, color: "#9c3131ff", fontFamily: "  'Poppins',sans-serif", fontSize: ".9rem", fontWeight: 700, cursor: "pointer" },
  input:        { width: "100%", padding: "12px 14px", background: "rgba(49, 41, 41, 0.99)", border: "1px solid rgba(255, 0, 0, 0.1)", borderRadius: 10, color: "#ffffffff", fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", outline: "none", boxSizing: "border-box" },
  btnPrimary:   { flex: 1, padding: "13px 24px", background: "linear-gradient(45deg,#ff416c,#ff4b2b)", border: "none", borderRadius: 10, color: "#9c3131ff", fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", fontWeight: 700, cursor: "pointer" },
  btnSecondary: { padding: "13px 24px", background: "transparent", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, color: "#888", fontFamily: "'Poppins',sans-serif", fontSize: ".9rem", cursor: "pointer" },
  alertErr:     { background: "rgba(255,65,108,.1)", border: "1px solid rgba(255,65,108,.3)", color: "#ff8fa0", padding: "12px 16px", borderRadius: 10, fontSize: ".85rem", marginBottom: 16 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Funções auxiliares de upload (definidas fora do componente para clareza)
// Montam um FormData com o arquivo + campos do produto e chamam o back-end.
// O back-end salva a imagem em disco e devolve a URL pública no campo imgUrl.
// ─────────────────────────────────────────────────────────────────────────────

async function criarProdutoComImagem(form, arquivo) {
  const fd = new FormData();
  fd.append("imagem", arquivo);                    // arquivo binário
  fd.append("nome",      form.nome.trim());
  fd.append("descricao", form.descricao.trim());
  fd.append("preco",     parseFloat(Number(form.preco).toFixed(2)));
  fd.append("estoque",   form.estoque !== "" ? parseInt(form.estoque) : 0);
  fd.append("tipo",      form.tipo);
  fd.append("ativo",     form.ativo);

  const res = await fetch("http://localhost:8080/produtos/com-imagem", {
    method: "POST",
    // NÃO define Content-Type → o browser define automaticamente com boundary
    body: fd,
  });
  if (!res.ok) throw new Error("Erro ao criar produto com imagem");
  return res.json();
}

async function atualizarProdutoComImagem(id, form, arquivo) {
  const fd = new FormData();
  fd.append("imagem", arquivo);
  fd.append("nome",      form.nome.trim());
  fd.append("descricao", form.descricao.trim());
  fd.append("preco",     parseFloat(Number(form.preco).toFixed(2)));
  fd.append("estoque",   form.estoque !== "" ? parseInt(form.estoque) : 0);
  fd.append("tipo",      form.tipo);
  fd.append("ativo",     form.ativo);

  const res = await fetch(`http://localhost:8080/produtos/${id}/com-imagem`, {
    method: "PUT",
    body: fd,
  });
  if (!res.ok) throw new Error("Erro ao atualizar produto com imagem");
  return res.json();
}