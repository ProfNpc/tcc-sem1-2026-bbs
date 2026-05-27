import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function CartSidebar() {
  const {
    cart, cartOrder, isOpen, setIsOpen,
    changeQty, freteGlobal, setFreteGlobal,
    freteInfo, setFreteInfo,
    totalQty, subtotal, total,
  } = useCart();

  const [cep, setCep] = useState('');
  const [freteStatus, setFreteStatus] = useState('');

  async function calcularFrete() {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) { setFreteStatus('CEP inválido!'); return; }
    setFreteStatus('Calculando...');
    try {
      const data = await (await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)).json();
      if (data.erro) { setFreteStatus('CEP não encontrado!'); return; }
      setFreteGlobal(15.90);
      setFreteInfo(`🚚 Entrega para ${data.localidade} - ${data.uf}`);
      setFreteStatus(`🚚 Entrega para ${data.localidade} - ${data.uf}`);
    } catch {
      setFreteStatus('Erro ao calcular frete.');
    }
  }

  function irParaCheckout() {
    if (!cartOrder.length) { alert('Seu carrinho está vazio!'); return; }
    localStorage.setItem('bbs_cart', JSON.stringify(cart));
    localStorage.setItem('bbs_cart_order', JSON.stringify(cartOrder));
    localStorage.setItem('bbs_frete', JSON.stringify(freteGlobal));
    localStorage.setItem('bbs_cep', cep);
    localStorage.setItem('bbs_frete_info', freteInfo);
    window.location.href = '/checkout.html';
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 999, backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed', top: 0, right: 0,
          width: '420px', maxWidth: '100vw', height: '100vh',
          background: '#1a1a2e', color: 'white',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s ease',
          zIndex: 1000, display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '24px 30px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <h2 style={{ margin: 0 }}>Meu Setup</h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}
          >×</button>
        </div>

        {/* Itens */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 30px' }}>
          {cartOrder.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
              <p style={{ fontSize: '3rem' }}>🛒</p>
              <p>Seu carrinho está vazio</p>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  marginTop: '16px', background: '#ff416c', border: 'none',
                  color: 'white', padding: '12px 24px', borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >Explorar Produtos</button>
            </div>
          ) : (
            cartOrder.map(id => {
              const item = cart[id];
              if (!item) return null;
              return (
                <div key={id} style={{
                  display: 'flex', gap: '16px', marginBottom: '20px',
                  paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <img src={item.img} alt={item.name}
                    style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>{item.name}</h4>
                    <p style={{ margin: '0 0 12px', color: '#ff416c', fontWeight: 'bold' }}>
                      R$ {(item.price * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button onClick={() => changeQty(id, -1)}
                        style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => changeQty(id, 1)}
                        style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartOrder.length > 0 && (
          <div style={{ padding: '24px 30px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
            {/* Frete */}
            <p style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '1px', marginBottom: '8px' }}>CALCULAR ENTREGA</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <input
                type="text" placeholder="00000-000" maxLength={9}
                value={cep} onChange={e => setCep(e.target.value)}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                  padding: '12px', color: 'white', outline: 'none',
                }}
              />
              <button onClick={calcularFrete}
                style={{ background: '#ff416c', border: 'none', borderRadius: '8px', color: 'white', padding: '0 20px', cursor: 'pointer', fontWeight: 'bold' }}>
                OK
              </button>
            </div>
            {freteStatus && <p style={{ fontSize: '0.85rem', color: '#4caf50', marginBottom: '12px' }}>{freteStatus}</p>}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#bbb' }}>
              <span>Frete:</span>
              <span>{freteGlobal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '20px' }}>
              <span>Total:</span>
              <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>

            <button onClick={irParaCheckout}
              style={{
                width: '100%', padding: '18px', background: 'linear-gradient(135deg,#ff416c,#ff4b2b)',
                border: 'none', borderRadius: '12px', color: 'white',
                fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', textTransform: 'uppercase',
              }}>
              Finalizar Pedido
            </button>
          </div>
        )}
      </aside>
    </>
  );
}