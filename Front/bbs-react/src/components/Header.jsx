import { useCart } from '../context/CartContext';

export default function Header() {
  const { totalQty, setIsOpen } = useCart();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 900,
      background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', height: '70px',
    }}>
      <h1 style={{ margin: 0, color: 'white', cursor: 'pointer' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        BBS
      </h1>
      <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <a href="#home" style={{ color: '#ccc', textDecoration: 'none' }}>Home</a>
        <a href="#produtos" style={{ color: '#ccc', textDecoration: 'none' }}>Produtos</a>
        <a href="#sobre" style={{ color: '#ccc', textDecoration: 'none' }}>Sobre</a>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'rgba(255,65,108,0.15)', border: '1px solid rgba(255,65,108,0.4)',
            color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          🛒 Carrinho
          {totalQty > 0 && (
            <span style={{
              background: '#ff416c', borderRadius: '50%',
              width: '22px', height: '22px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 'bold',
            }}>{totalQty}</span>
          )}
        </button>
      </nav>
    </header>
  );
}