// ============================================================
//  ProductList.jsx  —  Lista de produtos agrupados por categoria
//  Busca os produtos da API (Spring Boot), agrupa por tipo
//  e renderiza um scroll horizontal por categoria.
//  Também exibe estados de loading, erro e lista vazia.
// ============================================================

import { useState, useEffect } from "react";
import { listarProdutos } from "../services/produtosService.js";
import { useCart } from "../context/CartContext";

// Lista de categorias com id (igual ao campo "tipo" do produto),
// label (nome exibido) e sub (texto menor de apoio).
const CATEGORIAS = [
  { id: "gpu",      label: "Placas de Vídeo",  sub: "GPU · Graphics"         },
  { id: "cpu",      label: "Processadores",     sub: "CPU · Computing"        },
  { id: "ram",      label: "Memória RAM",        sub: "DDR4 · DDR5"            },
  { id: "ssd",      label: "SSDs",               sub: "NVMe · M.2 · SATA"     },
  { id: "mae",      label: "Placas Mãe",         sub: "Motherboards"           },
  { id: "fonte",    label: "Fontes",             sub: "PSU · Power Supply"     },
  { id: "cooler",   label: "Coolers",            sub: "Air · Liquid · AIO"     },
  { id: "gabinete", label: "Gabinetes",          sub: "Mid · Full Tower · ITX" },
  { id: "monitor",  label: "Monitores",          sub: "IPS · 144Hz · 4K"      },
  { id: "mouse",    label: "Mouses",             sub: "Gamer · Alta precisão"  },
  { id: "teclado",  label: "Teclados",           sub: "Mecânico · TKL · RGB"   },
  { id: "mousepad", label: "Mousepads",          sub: "Extended · Speed · RGB" },
  { id: "headset",  label: "Headsets & Outros",  sub: "Áudio · Webcam"         },
];

// Formata número para moeda brasileira (ex: 2199 → "R$ 2.199,00")
const fmt = v =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ── ProdutoCard ───────────────────────────────────────────────
// Sub-componente interno: exibe o card visual de um produto da API.
// Diferente do ProductCard.jsx (que usa dados estáticos), este usa
// os campos retornados pelo back-end (descricao, imgUrl, estoque).
function ProdutoCard({ produto, addToCart }) {
  const { id, nome, descricao, preco, estoque, imgUrl } = produto;

  // Produto sem estoque: desabilita o botão de compra
  const semEstoque = estoque !== null && estoque !== undefined && estoque <= 0;

  return (
    <article style={{
      background: "rgba(255,255,255,0.04)",
      borderRadius: "16px",
      padding: "20px",
      minWidth: "220px",
      maxWidth: "260px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      border: "1px solid rgba(255,255,255,0.08)",
      flex: "0 0 auto",
      position: "relative", // necessário para posicionar o badge "Sem estoque"
    }}>

      {/* Badge "Sem estoque" no canto superior direito do card,
          só aparece quando estoque === 0 */}
      {semEstoque && (
        <span style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(255,65,108,.15)",
          border: "1px solid rgba(255,65,108,.3)",
          color: "#ff8fa0",
          fontSize: ".65rem", fontWeight: 700,
          padding: "2px 8px", borderRadius: 20,
        }}>
          Sem estoque
        </span>
      )}

      {/* Área da imagem: exibe a foto do produto ou um emoji padrão 🖥️
          quando não há imgUrl cadastrada */}
      <div style={{
        height: "140px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,.03)", borderRadius: 10,
        overflow: "hidden",
      }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={nome}
            style={{ maxHeight: "140px", maxWidth: "100%", objectFit: "contain" }}
          />
        ) : (
          <span style={{ fontSize: "3.5rem" }}>🖥️</span>
        )}
      </div>

      {/* Nome do produto */}
      <h3 style={{ margin: 0, fontSize: "1rem", color: "white", lineHeight: 1.3 }}>
        {nome}
      </h3>

      {/* Descrição: truncada em 70 caracteres com "…" para não quebrar o layout */}
      {descricao && (
        <p style={{ margin: 0, fontSize: "0.78rem", color: "#777", lineHeight: 1.5 }}>
          {descricao.length > 70 ? descricao.slice(0, 70) + "…" : descricao}
        </p>
      )}

      {/* Preço em vermelho/rosa */}
      <span style={{ color: "#ff416c", fontWeight: "bold", fontSize: "1.1rem" }}>
        {fmt(preco)}
      </span>

      {/* Indicador de estoque:
          - laranja se estoque baixo (≤ 5)
          - cinza se estoque normal
          - "Indisponível" se zerado */}
      {estoque !== null && estoque !== undefined && (
        <span style={{ fontSize: ".72rem", color: estoque <= 5 ? "#f5a623" : "#555" }}>
          {estoque <= 0 ? "Indisponível" : `${estoque} em estoque`}
        </span>
      )}

      {/* Botão de compra: desabilitado visualmente e funcionalmente quando sem estoque.
          Chama addToCart do CartContext passando id, nome, preço e URL da imagem. */}
      <button
        disabled={semEstoque}
        onClick={() => !semEstoque && addToCart(id, nome, Number(preco), imgUrl || "🖥️")}
        style={{
          background: semEstoque
            ? "rgba(255,255,255,.06)"                         // cinza quando indisponível
            : "linear-gradient(135deg, #ff416c, #ff4b2b)",   // vermelho quando disponível
          border: "none", borderRadius: "8px",
          color: semEstoque ? "#555" : "white",
          padding: "10px",
          cursor: semEstoque ? "not-allowed" : "pointer",    // cursor bloqueado quando indisponível
          fontWeight: "bold",
          fontFamily: "'Poppins',sans-serif",
          fontSize: ".88rem",
        }}
      >
        {semEstoque ? "Indisponível" : "Adicionar ao Carrinho"}
      </button>
    </article>
  );
}

// ── ProductList ───────────────────────────────────────────────
// Componente principal: faz o fetch, organiza por categoria e renderiza.
export default function ProductList() {
  const { addToCart } = useCart();

  const [produtos, setProdutos] = useState([]);   // lista vinda da API
  const [loading, setLoading]   = useState(true); // exibe spinner enquanto carrega
  const [erro, setErro]         = useState("");   // exibe mensagem se a API falhar

  // useEffect roda ao montar o componente (e quando "versao" mudar).
  // Chama a API e atualiza o estado com os produtos retornados.
  useEffect(() => {
    async function carregar() {
      try {
        const data = await listarProdutos();
        setProdutos(Array.isArray(data) ? data : Array.from(data));
      } catch {
        setErro("Não foi possível carregar os produtos. Verifique se o servidor está rodando.");
      } finally {
        setLoading(false); // esconde o spinner em qualquer caso
      }
    }
    carregar();
  }, []);

  // ── Estados de feedback visual ────────────────────────────

  // Spinner animado enquanto aguarda resposta da API
  if (loading) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "80px 20px", flexDirection: "column", gap: 16,
    }}>
      {/* Círculo giratório: border-top colorido cria o efeito de loading */}
      <div style={{
        width: 40, height: 40,
        border: "3px solid rgba(255,255,255,.08)",
        borderTop: "3px solid #ff416c",
        borderRadius: "50%",
        animation: "bbsSpin 0.8s linear infinite",
      }} />
      <p style={{ color: "#555", fontFamily: "'Poppins',sans-serif" }}>
        Carregando produtos...
      </p>
      {/* Keyframes da animação do spinner */}
      <style>{`@keyframes bbsSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // Mensagem de erro quando a API não responde (ex: Spring Boot offline)
  if (erro) return (
    <div style={{
      textAlign: "center", padding: "60px 20px",
      color: "#ff8fa0", fontFamily: "'Poppins',sans-serif",
    }}>
      <p style={{ fontSize: "2.5rem" }}>⚠️</p>
      <p>{erro}</p>
    </div>
  );

  // Mensagem quando a API retornou com sucesso mas não há produtos cadastrados
  if (produtos.length === 0) return (
    <div style={{
      textAlign: "center", padding: "60px 20px",
      color: "#555", fontFamily: "'Poppins',sans-serif",
    }}>
      <p style={{ fontSize: "2.5rem" }}>📦</p>
      <p>Nenhum produto cadastrado ainda.</p>
    </div>
  );

  // ── Agrupamento por categoria ─────────────────────────────

  // Produtos que possuem o campo "tipo" preenchido (categorizados)
  const comTipo = produtos.filter(p => p.tipo);

  // Produtos sem categoria definida (vão para a seção "Outros Produtos")
  const semTipo = produtos.filter(p => !p.tipo);

  // Filtra apenas as categorias que possuem pelo menos um produto correspondente
  const categoriasCom = CATEGORIAS.filter(cat =>
    comTipo.some(p => p.tipo === cat.id)
  );

  return (
    // categorias-wrap → classe CSS que define o padding e espaçamento das seções
    <div className="categorias-wrap" id="produtos">

      {/* Uma seção por categoria com produtos */}
      {categoriasCom.map(cat => (
        <section key={cat.id} className="categoria-secao">

          {/* Cabeçalho da categoria com linhas decorativas nas laterais */}
          <div className="categoria-header">
            <span className="cat-linha"></span>           {/* linha esquerda */}
            <div className="cat-titulo-wrap">
              <h2 className="cat-titulo">{cat.label}</h2> {/* ex: "Placas de Vídeo" */}
              <span className="cat-subtag">{cat.sub}</span>{/* ex: "GPU · Graphics" */}
            </div>
            <span className="cat-linha right"></span>      {/* linha direita */}
          </div>

          {/* Wrapper com overflow hidden para esconder a scrollbar e permitir drag */}
          <div className="categoria-row-wrapper">
            {/* Row com scroll horizontal: produtos ficam em linha */}
            <div className="categoria-row">
              {comTipo
                .filter(p => p.tipo === cat.id) // só produtos desta categoria
                .map(produto => (
                  <ProdutoCard key={produto.id} produto={produto} addToCart={addToCart} />
                ))}
            </div>
          </div>
        </section>
      ))}

      {/* Seção extra para produtos sem categoria */}
      {semTipo.length > 0 && (
        <section className="categoria-secao">
          <div className="categoria-header">
            <span className="cat-linha"></span>
            <div className="cat-titulo-wrap">
              <h2 className="cat-titulo">Outros Produtos</h2>
              <span className="cat-subtag">Hardware Premium · BBS Store</span>
            </div>
            <span className="cat-linha right"></span>
          </div>
          <div className="categoria-row-wrapper">
            <div className="categoria-row">
              {semTipo.map(produto => (
                <ProdutoCard key={produto.id} produto={produto} addToCart={addToCart} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
