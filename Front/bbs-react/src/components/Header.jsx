import { useCart } from "../context/CartContext";
 
export default function Header({ abrirAdmin }) {
  const { totalQty, setIsOpen } = useCart();
 
  return (
    <header>
      <h1 style={{ cursor: "pointer" }} onClick={() => window.scrollTo(0, 0)}>
        BBS
      </h1>
      <nav>
        <a href="#home">Home</a>
        <a href="#produtos">Produtos</a>
        <a href="#sobre">Sobre</a>
        <a href="#contato">Contato</a>
 
        {/* Botão Admin */}
        <div
          onClick={abrirAdmin}
          style={{
            cursor: "pointer",
            padding: "6px 14px",
            background: "rgba(255,65,108,.12)",
            border: "1px solid rgba(255,65,108,.3)",
            borderRadius: "8px",
            color: "#ff416c",
            fontWeight: "600",
            fontSize: ".85rem",
          }}
        >
          ⚙️ Admin
        </div>
 
        <div className="cart-btn-nav" onClick={() => setIsOpen(true)}>
          🛒 Carrinho <span id="cart-count">{totalQty}</span>
        </div>
      </nav>
    </header>
  );
}