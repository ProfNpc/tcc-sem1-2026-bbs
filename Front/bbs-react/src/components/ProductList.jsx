import { useState, useEffect } from "react";
import { listarProdutosAtivos } from "../services/produtosService.js"; // agora busca só os ativos
import { useCart } from "../context/CartContext";

// ProductList.jsx — tela pública (loja)
// - Busca apenas produtos ativos no backend (GET /produtos/ativos)
// - Agrupa/organiza por “tipo” (categoria)
// - Renderiza cards com botão para adicionar ao carrinho
// - O estado do carrinho e a função addToCart vêm do CartContext

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

const fmt = v =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ProdutoCard({ produto, addToCart }) {
  const { id, nome, descricao, preco, estoque, imgUrl } = produto;
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
      position: "relative",
    }}>
      {semEstoque && (
        <span style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(255,65,108,.15)",
          border: "1px solid rgba(255,65,108,.3)",
          color: "#ff8fa0", fontSize: ".65rem", fontWeight: 700,
          padding: "2px 8px", borderRadius: 20,
        }}>
          Sem estoque
        </span>
      )}

      <div style={{
        height: "140px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,.03)", borderRadius: 10,
        overflow: "hidden",
      }}>
        {imgUrl ? (
          <img src={imgUrl} alt={nome}
            style={{ maxHeight: "140px", maxWidth: "100%", objectFit: "contain" }}
          />
        ) : (
          <span style={{ fontSize: "3.5rem" }}>🖥️</span>
        )}
      </div>

      <h3 style={{ margin: 0, fontSize: "1rem", color: "white", lineHeight: 1.3 }}>
        {nome}
      </h3>

      {descricao && (
        <p style={{ margin: 0, fontSize: "0.78rem", color: "#777", lineHeight: 1.5 }}>
          {descricao.length > 70 ? descricao.slice(0, 70) + "…" : descricao}
        </p>
      )}

      <span style={{ color: "#ff416c", fontWeight: "bold", fontSize: "1.1rem" }}>
        {fmt(preco)}
      </span>

      {estoque !== null && estoque !== undefined && (
        <span style={{ fontSize: ".72rem", color: estoque <= 5 ? "#f5a623" : "#555" }}>
          {estoque <= 0 ? "Indisponível" : `${estoque} em estoque`}
        </span>
      )}

      {/*
       * Botão do card do produto:
       * - Se semEstoque=true:
       *     - disabled fica true
       *     - clique não acontece
       *     - texto vira “Indisponível”
       * - Se semEstoque=false:
       *     - clique chama o contexto addToCart(...)
       *
       * addToCart(id, nome, price, img)
       * → atualiza o carrinho global (CartContext)
       * → abre a sidebar do carrinho
       */}
      <button
        disabled={semEstoque}
        onClick={() => {
          if (semEstoque) return;
          // Chamando a “função do carrinho” (contexto)
          addToCart(id, nome, Number(preco), imgUrl || "🖥️");
        }}
        style={{
          background: semEstoque
            ? "rgba(255,255,255,.06)"
            : "linear-gradient(135deg, #ff416c, #ff4b2b)",
          border: "none", borderRadius: "8px", color: semEstoque ? "#555" : "white",
          padding: "10px", cursor: semEstoque ? "not-allowed" : "pointer",
          fontWeight: "bold", fontFamily: "'Poppins',sans-serif",
          fontSize: ".88rem",
        }}
      >
        {semEstoque ? "Indisponível" : "Adicionar ao Carrinho"}
      </button>

    </article>
  );
}

export default function ProductList() {
  /*
   * ProductList.jsx — página pública (loja) que:
   * 1) busca produtos ATIVOS no backend (GET /produtos/ativos)
   * 2) organiza esses produtos em seções por categoria
   * 3) monta cards com o botão “Adicionar ao Carrinho”
   *
   * Importante:
   * - A chamada à API acontece dentro do useEffect abaixo.
   * - O addToCart vem do contexto (CartContext), e o botão chama:
   *     addToCart(id, nome, preco, imgUrl)
   */
  const { addToCart } = useCart();

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState("");

  useEffect(() => {
    /*
     * useEffect roda 1 vez quando o componente nasce (dependências: []).
     * É aqui que acontece o “primeiro fetch” da loja.
     *
     * Fluxo didático:
     * - montar → chama carregar()
     * - carregar() faz uma chamada REST para o Spring (produtos/ativos)
     * - se der certo → setProdutos(data)
     * - setLoading(false) em finally
     */
    async function carregar() {
      try {
        /*
         * Chamada de API (backend):
         *   Método: GET
         *   Rota:   http://localhost:8080/produtos/ativos
         *
         * O que a API devolve:
         * - um array com produtos que estão com ativo=true.
         */
        const data = await listarProdutosAtivos();


        // res.json() já vem como array na prática, mas garantimos.
        setProdutos(Array.isArray(data) ? data : Array.from(data));
      } catch {
        setErro("Não foi possível carregar os produtos. Verifique se o servidor está rodando.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);


  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,.08)", borderTop: "3px solid #ff416c", borderRadius: "50%", animation: "bbsSpin 0.8s linear infinite" }} />
      <p style={{ color: "#555", fontFamily: "'Poppins',sans-serif" }}>Carregando produtos...</p>
      <style>{`@keyframes bbsSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (erro) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#ff8fa0", fontFamily: "'Poppins',sans-serif" }}>
      <p style={{ fontSize: "2.5rem" }}>⚠️</p>
      <p>{erro}</p>
    </div>
  );

  if (produtos.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#555", fontFamily: "'Poppins',sans-serif" }}>
      <p style={{ fontSize: "2.5rem" }}>📦</p>
      <p>Nenhum produto cadastrado ainda.</p>
    </div>
  );

  const comTipo = produtos.filter(p => p.tipo);
  const semTipo = produtos.filter(p => !p.tipo);
  const categoriasCom = CATEGORIAS.filter(cat => comTipo.some(p => p.tipo === cat.id));

  return (
    <div className="categorias-wrap" id="produtos">
      {categoriasCom.map(cat => (
        <section key={cat.id} className="categoria-secao">
          <div className="categoria-header">
            <span className="cat-linha"></span>
            <div className="cat-titulo-wrap">
              <h2 className="cat-titulo">{cat.label}</h2>
              <span className="cat-subtag">{cat.sub}</span>
            </div>
            <span className="cat-linha right"></span>
          </div>
          <div className="categoria-row-wrapper">
            <div className="categoria-row">
              {comTipo.filter(p => p.tipo === cat.id).map(produto => (
                <ProdutoCard key={produto.id} produto={produto} addToCart={addToCart} />
              ))}
            </div>
          </div>
        </section>
      ))}

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
