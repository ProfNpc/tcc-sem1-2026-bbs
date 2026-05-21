import { useState } from 'react';
import Header from './components/Header';
import CartSidebar from './components/CartSidebar';
import ProductCard from './components/ProductCard';
import { produtos, categorias } from './data/produtos';

const CATS_FILTER = [{ id: '', label: 'Todas' }, ...categorias];

export default function App() {
  const [catAtiva, setCatAtiva] = useState('');
  const [busca, setBusca] = useState('');

  const produtosFiltrados = produtos.filter(p => {
    const matchCat = !catAtiva || p.tipo === catAtiva;
    const q = busca.toLowerCase();
    const matchBusca = !q || p.nome.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q);
    return matchCat && matchBusca;
  });

  const catsComProdutos = catAtiva
    ? categorias.filter(c => c.id === catAtiva)
    : categorias;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a14', color: 'white', fontFamily: 'Poppins, sans-serif' }}>
      <Header />
      <CartSidebar />

      {/* Busca e Filtros */}
      <div id="home" style={{ padding: '40px 40px 0' }}>
        <input
          type="text" placeholder="Buscar produto, marca..."
          value={busca} onChange={e => setBusca(e.target.value)}
          style={{
            width: '100%', maxWidth: '600px', padding: '14px 20px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none',
            marginBottom: '24px', boxSizing: 'border-box',
          }}
        />

        {/* Chips de categoria */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {CATS_FILTER.map(c => (
            <button key={c.id}
              onClick={() => setCatAtiva(c.id)}
              style={{
                padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: '500',
                border: catAtiva === c.id ? 'none' : '1px solid rgba(255,255,255,0.15)',
                background: catAtiva === c.id ? 'linear-gradient(135deg,#ff416c,#ff4b2b)' : 'rgba(255,255,255,0.05)',
                color: 'white',
              }}
            >{c.label}</button>
          ))}
        </div>
      </div>

      {/* Produtos por categoria */}
      <main id="produtos" style={{ padding: '0 40px 60px' }}>
        {catsComProdutos.map(cat => {
          const lista = produtosFiltrados.filter(p => p.tipo === cat.id);
          if (!lista.length) return null;
          return (
            <section key={cat.id} style={{ marginBottom: '50px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 4px', color: 'white' }}>{cat.label}</h2>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{cat.sub}</span>
              </div>
              <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '12px' }}>
                {lista.map(p => <ProductCard key={p.id} produto={p} />)}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}