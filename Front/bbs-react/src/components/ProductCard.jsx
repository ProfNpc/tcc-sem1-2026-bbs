// ============================================================
//  ProductCard.jsx  —  Card visual de um único produto
//  Exibe imagem, nome, descrição, preço e botão de compra.
//  Usado pelo ProductList (versão estática com dados locais).
// ============================================================

import { useCart } from '../context/CartContext';

export default function ProductCard({ produto }) {
  // Acessa a função de adicionar ao carrinho do contexto global
  const { addToCart } = useCart();

  // Desestrutura os campos do produto recebido via props
  const { id, nome, desc, preco, img, info } = produto;

  return (
    // article: elemento semântico para um item independente de conteúdo
    <article style={{
      background: 'rgba(255,255,255,0.04)', // fundo translúcido escuro (efeito glass)
      borderRadius: '16px',
      padding: '20px',
      minWidth: '220px',
      maxWidth: '260px',
      display: 'flex',
      flexDirection: 'column',             // empilha os elementos verticalmente
      gap: '10px',
      border: '1px solid rgba(255,255,255,0.08)', // borda sutil branca
      flex: '0 0 auto',                   // não encolhe nem cresce; mantém o tamanho fixo no scroll horizontal
    }}>

      {/* Container da imagem com altura fixa e centralização */}
      <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={img}
          alt={nome}
          style={{
            maxHeight: '160px',
            maxWidth: '100%',
            objectFit: 'contain', // preserva proporção sem cortar
          }}
        />
      </div>

      {/* Nome do produto em branco e negrito */}
      <h3 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>{nome}</h3>

      {/* Descrição curta em cinza, fonte menor */}
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{desc}</p>

      {/* Preço em vermelho/rosa com destaque em negrito */}
      <span style={{ color: '#ff416c', fontWeight: 'bold', fontSize: '1.1rem' }}>
        R$ {preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>

      {/* Botão que chama addToCart passando id, nome, preço e imagem.
          O CartContext recebe esses dados e adiciona ao estado global. */}
      <button
        onClick={() => addToCart(id, nome, preco, img)}
        style={{
          background: 'linear-gradient(135deg, #ff416c, #ff4b2b)', // gradiente vermelho
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          padding: '10px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Adicionar ao Carrinho
      </button>
    </article>
  );
}
