import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [cartOrder, setCartOrder] = useState([]);
  const [freteGlobal, setFreteGlobal] = useState(0);
  const [freteInfo, setFreteInfo] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((id, name, price, img) => {
    setCart(prev => {
      if (prev[id]) {
        return { ...prev, [id]: { ...prev[id], qty: prev[id].qty + 1 } };
      }
      return { ...prev, [id]: { name, price, img, qty: 1 } };
    });
    setCartOrder(prev => prev.includes(id) ? prev : [id, ...prev]);
    setIsOpen(true);
  }, []);

  const changeQty = useCallback((id, delta) => {
    setCart(prev => {
      const item = prev[id];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        setCartOrder(o => o.filter(i => i !== id));
        return rest;
      }
      return { ...prev, [id]: { ...item, qty: newQty } };
    });
  }, []);

  // ← função que o Checkout.jsx precisa
  const limparCarrinho = useCallback(() => {
    setCart({});
    setCartOrder([]);
    setFreteGlobal(0);
    setFreteInfo('');
  }, []);

  const totalQty = cartOrder.reduce((acc, id) => acc + (cart[id]?.qty || 0), 0);
  const subtotal  = cartOrder.reduce((acc, id) => acc + (cart[id] ? cart[id].price * cart[id].qty : 0), 0);
  const total     = subtotal + freteGlobal;

  return (
    <CartContext.Provider value={{
      cart, cartOrder, freteGlobal, setFreteGlobal,
      freteInfo, setFreteInfo,
      isOpen, setIsOpen,
      addToCart, changeQty, limparCarrinho,
      totalQty, subtotal, total,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}