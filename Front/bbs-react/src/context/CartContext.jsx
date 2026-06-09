// ============================================================
//  CartContext.jsx  —  Estado global do carrinho
//  Usa a Context API do React para compartilhar dados do carrinho
//  (itens, quantidades, frete, total) com qualquer componente
//  sem precisar passar props entre componentes pai/filho.
// ============================================================

import { createContext, useContext, useState, useCallback } from 'react';

// Cria o contexto vazio. Será preenchido pelo CartProvider abaixo.
const CartContext = createContext(null);

// ── CartProvider ──────────────────────────────────────────────
// Componente que envolve o app (em main.jsx) e disponibiliza
// todas as funções e dados do carrinho para os filhos.
export function CartProvider({ children }) {
  /*
   * CartProvider = “pai” do contexto do carrinho.
   * Tudo que o sistema precisa lembrar durante a sessão do usuário
   * (itens, quantidade, frete, total e abertura da sidebar) fica aqui.
   */


  // Objeto onde cada chave é o id do produto e o valor contém
  // { name, price, img, qty }. Exemplo: { 1: { name:"RTX 3060", qty:2, ... } }
  const [cart, setCart] = useState({});

  // Array com os IDs dos produtos na ordem em que foram adicionados.
  // Separado do cart para preservar a ordem de inserção.
  const [cartOrder, setCartOrder] = useState([]);

  // Valor do frete em reais (atualizado após calcular pelo CEP)
  const [freteGlobal, setFreteGlobal] = useState(0);

  // Texto descritivo do frete, ex: "🚚 Entrega para São Paulo - SP"
  const [freteInfo, setFreteInfo] = useState('');

  // Controla se a sidebar do carrinho está visível (true) ou oculta (false)
  const [isOpen, setIsOpen] = useState(false);

  // ── addToCart ─────────────────────────────────────────────
  // Adiciona um produto ao carrinho.
  // Se o produto já existe → incrementa a quantidade.
  // Se é novo → cria a entrada e adiciona o id em cartOrder.
  // Ao final, abre a sidebar automaticamente.
  const addToCart = useCallback((id, name, price, img) => {
    setCart(prev => {
      if (prev[id]) {
        // Produto já no carrinho: apenas incrementa qty
        return { ...prev, [id]: { ...prev[id], qty: prev[id].qty + 1 } };
      }
      // Produto novo: cria a entrada com qty = 1
      return { ...prev, [id]: { name, price, img, qty: 1 } };
    });
    // Adiciona o id no início da lista (novo item aparece primeiro na sidebar)
    setCartOrder(prev => prev.includes(id) ? prev : [id, ...prev]);
    // Abre a sidebar do carrinho
    setIsOpen(true);
  }, []);

  // ── changeQty ────────────────────────────────────────────
  // Incrementa ou decrementa a quantidade de um produto.
  // delta = +1 (adiciona) ou -1 (remove uma unidade).
  // Se a quantidade chegar a 0 ou menos, remove o produto do carrinho.
  const changeQty = useCallback((id, delta) => {
    setCart(prev => {
      const item = prev[id];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        // Remove o produto: desestrutura o objeto sem a chave [id]
        const { [id]: _, ...rest } = prev;
        // Remove também da lista de ordem
        setCartOrder(o => o.filter(i => i !== id));
        return rest;
      }
      return { ...prev, [id]: { ...item, qty: newQty } };
    });
  }, []);

  // ── limparCarrinho ───────────────────────────────────────
  // Zera completamente o carrinho após a compra ser confirmada no Checkout.
  const limparCarrinho = useCallback(() => {
    setCart({});
    setCartOrder([]);
    setFreteGlobal(0);
    setFreteInfo('');
  }, []);

  // ── Valores calculados ────────────────────────────────────

  // Soma total de unidades no carrinho (exibida no ícone do header)
  const totalQty = cartOrder.reduce((acc, id) => acc + (cart[id]?.qty || 0), 0);

  // Soma dos preços × quantidades (sem frete)
  const subtotal = cartOrder.reduce(
    (acc, id) => acc + (cart[id] ? cart[id].price * cart[id].qty : 0),
    0
  );

  // Total final = subtotal + frete
  const total = subtotal + freteGlobal;

  // ── Valor exposto para todos os componentes filhos ────────
  return (
    <CartContext.Provider value={{
      cart,          // Objeto com todos os itens do carrinho
      cartOrder,     // Array com os IDs em ordem de inserção
      freteGlobal,   // Valor do frete calculado
      setFreteGlobal,
      freteInfo,     // Texto descritivo do frete
      setFreteInfo,
      isOpen,        // Se a sidebar está aberta
      setIsOpen,
      addToCart,     // Função para adicionar produto
      changeQty,     // Função para alterar quantidade
      limparCarrinho,// Função para zerar o carrinho
      totalQty,      // Total de unidades (para o badge do carrinho)
      subtotal,      // Soma dos produtos sem frete
      total,         // Total com frete incluído
    }}>
      {children}
    </CartContext.Provider>
  );
}

// ── useCart ───────────────────────────────────────────────────
// Hook personalizado: qualquer componente que queira acessar o
// carrinho chama useCart() em vez de lidar com o contexto direto.
export function useCart() {
  // Hook “ponteiro” para os componentes: pega o valor do CartContext
  // (tudo que está dentro de <CartContext.Provider value={...}>)
  // e retorna para o componente consumidor.
  return useContext(CartContext);
}

