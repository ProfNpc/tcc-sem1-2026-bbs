import { useCart } from '../context/CartContext';

export default function ProductCard({ produto }) {
  const { addToCart } = useCart();
  const { id, nome, desc, preco, img, info } = produto;

  return (
    <article style={{
      background: 'rgba(255,255,255,0.04)', borderRadius: '16px',
      padding: '20px', minWidth: '220px', maxWidth: '260px',
      display: 'flex', flexDirection: 'column', gap: '10px',
      border: '1px solid rgba(255,255,255,0.08)',
      flex: '0 0 auto',
    }}>
      <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={img} alt={nome}
          style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain' }}
        />
      </div>
      <h3 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>{nome}</h3>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{desc}</p>
      <span style={{ color: '#ff416c', fontWeight: 'bold', fontSize: '1.1rem' }}>
        R$ {preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
      <button
        onClick={() => addToCart(id, nome, preco, img)}
        style={{
          background: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
          border: 'none', borderRadius: '8px', color: 'white',
          padding: '10px', cursor: 'pointer', fontWeight: 'bold',
        }}
      >
        Adicionar ao Carrinho
      </button>
    </article>
  );
}