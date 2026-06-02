// ============================================================
//  Header.jsx  —  Barra de navegação fixa no topo da página
//  Exibe o logo "BBS", links de navegação, o botão Admin
//  e o ícone do carrinho com o contador de itens.
// ============================================================

import { useCart } from "../context/CartContext";

export default function Header({ abrirAdmin }) {
  // totalQty → número total de itens no carrinho (exibido no badge)
  // setIsOpen → abre/fecha a sidebar do carrinho
  const { totalQty, setIsOpen } = useCart();

  return (
    <header>
      {/* Logo clicável: rola a página de volta ao topo */}
      <h1 style={{ cursor: "pointer" }} onClick={() => window.scrollTo(0, 0)}>
        BBS
      </h1>

      <nav>
        {/* Links de âncora: navegam para seções da mesma página */}
        <a href="#home">Home</a>
        <a href="#produtos">Produtos</a>
        <a href="#sobre">Sobre</a>
        <a href="#contato">Contato</a>

        {/* Botão Admin: abre o painel de gerenciamento de produtos.
            Style: fundo avermelhado translúcido com borda colorida,
            deixando claro que é uma área restrita/especial. */}
        <div
          onClick={abrirAdmin}
          style={{
            cursor: "pointer",
            padding: "6px 14px",
            background: "rgba(255,65,108,.12)",    // fundo levemente vermelho
            border: "1px solid rgba(255,65,108,.3)",// borda vermelha discreta
            borderRadius: "8px",
            color: "#ff416c",                       // texto vermelho
            fontWeight: "600",
            fontSize: ".85rem",
          }}
        >
          ⚙️ Admin
        </div>

        {/* Ícone do carrinho: abre a sidebar ao clicar.
            cart-btn-nav → classe CSS do index.css que aplica estilo de hover.
            cart-count   → badge com o número de itens, atualizado em tempo real. */}
        <div className="cart-btn-nav" onClick={() => setIsOpen(true)}>
          🛒 Carrinho <span id="cart-count">{totalQty}</span>
        </div>
      </nav>
    </header>
  );
}
