// ============================================================
//  main.jsx  —  Ponto de entrada da aplicação React
//  É o primeiro arquivo executado. Monta o React na página HTML
//  e envolve tudo com o CartProvider para que qualquer componente
//  possa acessar o carrinho sem precisar passar props manualmente.
// ============================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Importa o contexto global do carrinho
import { CartProvider } from './context/CartContext'

// Estilos globais da aplicação (cores, header, animações, etc.)
import './index.css'

import App from './App.jsx'

// createRoot seleciona a <div id="root"> do index.html e injeta o React lá dentro
createRoot(document.getElementById('root')).render(
  // StrictMode: modo de desenvolvimento que avisa sobre boas práticas (sem efeito em produção)
  <StrictMode>
    {/* CartProvider envolve TODO o app, tornando o estado do carrinho
        acessível em qualquer componente via useCart() */}
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
)
