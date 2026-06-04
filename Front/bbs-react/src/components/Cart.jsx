// ============================================================
//  Cart.jsx  —  Sidebar do carrinho de compras
//  Painel lateral que desliza da direita com os itens do carrinho,
//  cálculo de frete via API ViaCEP e botão de finalizar pedido.
// ============================================================

import { useCart } from "../context/CartContext";
import { useState } from "react";

export default function Cart({ abrirCheckout }) {
  // Dados e funções do contexto global do carrinho
  const {
    cart,           // Objeto com todos os itens { [id]: { name, price, img, qty } }
    cartOrder,      // Array de IDs na ordem de inserção
    changeQty,      // Função para incrementar/decrementar quantidade
    total,          // Total com frete incluído
    freteGlobal,    // Valor do frete calculado
    setFreteGlobal, // Atualiza o frete no contexto global
    freteInfo,      // Texto descritivo do frete
    setFreteInfo,
    isOpen,         // Sidebar visível (true) ou oculta (false)
    setIsOpen,
  } = useCart();

  // CEP digitado pelo usuário no campo de frete
  const [cep, setCep] = useState("");
  // true enquanto aguarda a resposta da API ViaCEP
  const [loadingFrete, setLoadingFrete] = useState(false);

  // ── calcularFrete ─────────────────────────────────────────
  // Consulta a API ViaCEP com o CEP digitado.
  // Se válido, define frete fixo de R$ 15,90 e exibe a cidade/UF.
  async function calcularFrete() {
    /*
     * Chamada de API externa (NÃO é o seu backend).
     * URL:
     *   GET https://viacep.com.br/ws/{cep}/json/
     *
     * O que faz:
     * - valida o CEP (8 dígitos)
     * - usa ViaCEP para obter cidade/UF
     * - define um frete fixo no carrinho (R$ 15,90)
     * - guarda um texto descritivo para exibir na UI
     */
    const cepLimpo = cep.replace(/\D/g, ""); // remove traços e letras
    if (cepLimpo.length !== 8) return alert("CEP inválido!");

    setLoadingFrete(true);
    try {
      // ViaCEP fetch
      const res  = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();

      // Se ViaCEP retornar erro, avisa e não altera frete
      if (data.erro) { alert("CEP não encontrado!"); return; }

      // Frete fixo (regra do sistema atual)
      setFreteGlobal(15.90);

      // Texto exibido ao usuário
      setFreteInfo(`🚚 Entrega para ${data.localidade} - ${data.uf}`);
    } catch {
      alert("Erro ao calcular frete.");
    } finally {
      // Para o estado de loading do botão
      setLoadingFrete(false);
    }
  }

  return (
    <>
      {/* Overlay escuro atrás da sidebar: clicar aqui fecha o carrinho.
          Só renderizado quando isOpen é true. */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)", // fundo semitransparente escuro
            zIndex: 3999,
          }}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────
          cart-sidebar → classe CSS do index.css que controla a
          animação de slide (translateX). A classe "open" ativa a
          transição de fora para dentro da tela. */}
      <aside id="cart-sidebar" className={isOpen ? "open" : ""}>

        {/* Cabeçalho da sidebar com título e botão fechar (×) */}
        <div className="cart-header">
          <h2>Meu Setup</h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "none", border: "none", color: "white",
              fontSize: "2.5rem", cursor: "pointer", lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* ── Lista de itens ──────────────────────────────────
            Scroll vertical independente para não travar o footer */}
        <div className="cart-items-list" id="cart-items">
          {cartOrder.length === 0 ? (
            // Mensagem quando o carrinho está vazio
            <p style={{ color: "#888", padding: "20px", textAlign: "center" }}>
              Carrinho vazio
            </p>
          ) : (
            cartOrder.map(id => {
              const item = cart[id];
              if (!item) return null;
              return (
                <div key={id} className="cart-item">
                  {/* Miniatura do produto */}
                  <img src={item.img} alt={item.name} width={60} />

                  {/* Nome e preço */}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: "bold" }}>{item.name}</p>
                    <p style={{ margin: 0, color: "#ff416c" }}>
                      {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>

                  {/* Controles de quantidade: -, contador, +, lixeira */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button onClick={() => changeQty(id, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => changeQty(id, +1)}>+</button>
                    {/* Remove o item inteiro decrementando toda a quantidade */}
                    <button onClick={() => changeQty(id, -item.qty)}>🗑</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer: frete + total + botão finalizar ─────────
            Fundo escuro levemente translúcido, separado por borda superior */}
        <div
          className="cart-footer"
          style={{
            padding: "30px",
            borderTop: "1px solid var(--glass-border)",
            background: "rgba(0,0,0,0.3)", // camada escura sobre o fundo
          }}
        >
          {/* Label da seção de frete */}
          <p style={{
            fontSize: ".8rem", color: "#888", marginBottom: "8px",
            fontWeight: "bold", letterSpacing: "1px",
          }}>
            CALCULAR ENTREGA
          </p>

          {/* Campo CEP + botão OK */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="00000-000"
              maxLength={9}
              value={cep}
              onChange={e => setCep(e.target.value)}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",      // campo escuro translúcido
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                padding: "12px",
                color: "white",
                outline: "none",
                fontSize: "0.9rem",
              }}
            />
            <button
              onClick={calcularFrete}
              style={{
                background: "#ff416c", border: "none", borderRadius: "8px",
                color: "white", padding: "0 20px", cursor: "pointer", fontWeight: "bold",
              }}
            >
              {/* Mostra "..." enquanto consulta o CEP, "OK" quando ocioso */}
              {loadingFrete ? "..." : "OK"}
            </button>
          </div>

          {/* Texto de retorno da consulta CEP (cidade e UF) em verde */}
          {freteInfo && (
            <p style={{ marginTop: "10px", fontSize: ".85rem", color: "#4caf50" }}>
              {freteInfo}
            </p>
          )}

          {/* Linha de frete */}
          <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0", color: "#bbb" }}>
            <span>Frete:</span>
            <span>{freteGlobal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>

          {/* Total em destaque (fonte maior, negrito) */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontWeight: "700", fontSize: "1.4rem", marginBottom: "20px",
          }}>
            <span>Total:</span>
            <span>{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>

          {/* Botão Finalizar Pedido: fecha a sidebar e abre o Checkout.
              btn-buy → classe CSS do index.css com gradiente e hover animado. */}
          <button
            className="btn-buy"
            onClick={() => {
              if (cartOrder.length === 0) {
                alert("Adicione produtos ao carrinho!");
                return;
              }
              setIsOpen(false);   // fecha a sidebar
              abrirCheckout();    // chama a função recebida via props para abrir o Checkout
            }}
            style={{
              width: "100%", padding: "20px", borderRadius: "12px",
              fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", border: "none",
            }}
          >
            Finalizar Pedido
          </button>
        </div>
      </aside>
    </>
  );
}
