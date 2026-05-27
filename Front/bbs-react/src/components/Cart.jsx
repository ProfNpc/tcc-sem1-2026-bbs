import { useCart } from "../context/CartContext";
import { useState } from "react";

export default function Cart({ abrirCheckout }) {
  const {
    cart, cartOrder, changeQty,
    total, freteGlobal, setFreteGlobal, freteInfo, setFreteInfo,
    isOpen, setIsOpen
  } = useCart();

  const [cep, setCep] = useState("");
  const [loadingFrete, setLoadingFrete] = useState(false);

  async function calcularFrete() {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return alert("CEP inválido!");
    setLoadingFrete(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) { alert("CEP não encontrado!"); return; }
      setFreteGlobal(15.90);
      setFreteInfo(`🚚 Entrega para ${data.localidade} - ${data.uf}`);
    } catch {
      alert("Erro ao calcular frete.");
    } finally {
      setLoadingFrete(false);
    }
  }

  return (
    <>
      {isOpen && (
        <div onClick={() => setIsOpen(false)}
          style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:3999 }} />
      )}

      <aside id="cart-sidebar" className={isOpen ? "open" : ""}>
        <div className="cart-header">
          <h2>Meu Setup</h2>
          <button onClick={() => setIsOpen(false)}
            style={{ background:"none",border:"none",color:"white",fontSize:"2.5rem",cursor:"pointer",lineHeight:1 }}>
            &times;
          </button>
        </div>

        <div className="cart-items-list" id="cart-items">
          {cartOrder.length === 0 ? (
            <p style={{ color:"#888",padding:"20px",textAlign:"center" }}>Carrinho vazio</p>
          ) : (
            cartOrder.map(id => {
              const item = cart[id];
              if (!item) return null;
              return (
                <div key={id} className="cart-item">
                  <img src={item.img} alt={item.name} width={60} />
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0,fontWeight:"bold" }}>{item.name}</p>
                    <p style={{ margin:0,color:"#ff416c" }}>
                      {item.price.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
                    </p>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
                    <button onClick={() => changeQty(id, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => changeQty(id, +1)}>+</button>
                    <button onClick={() => changeQty(id, -item.qty)}>🗑</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="cart-footer"
          style={{ padding:"30px",borderTop:"1px solid var(--glass-border)",background:"rgba(0,0,0,0.3)" }}>

          <p style={{ fontSize:".8rem",color:"#888",marginBottom:"8px",fontWeight:"bold",letterSpacing:"1px" }}>
            CALCULAR ENTREGA
          </p>
          <div style={{ display:"flex",gap:"10px" }}>
            <input
              type="text" placeholder="00000-000" maxLength={9} value={cep}
              onChange={e => setCep(e.target.value)}
              style={{ flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid var(--glass-border)",borderRadius:"8px",padding:"12px",color:"white",outline:"none",fontSize:"0.9rem" }}
            />
            <button onClick={calcularFrete}
              style={{ background:"#ff416c",border:"none",borderRadius:"8px",color:"white",padding:"0 20px",cursor:"pointer",fontWeight:"bold" }}>
              {loadingFrete ? "..." : "OK"}
            </button>
          </div>
          {freteInfo && <p style={{ marginTop:"10px",fontSize:".85rem",color:"#4caf50" }}>{freteInfo}</p>}

          <div style={{ display:"flex",justifyContent:"space-between",margin:"10px 0",color:"#bbb" }}>
            <span>Frete:</span>
            <span>{freteGlobal.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</span>
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",fontWeight:"700",fontSize:"1.4rem",marginBottom:"20px" }}>
            <span>Total:</span>
            <span>{total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</span>
          </div>

          <button className="btn-buy"
            onClick={() => {
              if (cartOrder.length === 0) { alert("Adicione produtos ao carrinho!"); return; }
              setIsOpen(false);
              abrirCheckout();
            }}
            style={{ width:"100%",padding:"20px",borderRadius:"12px",fontSize:"1.1rem",fontWeight:"bold",cursor:"pointer",border:"none" }}>
            Finalizar Pedido
          </button>
        </div>
      </aside>
    </>
  );
}
