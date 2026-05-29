// ============================================================
//  App.jsx  —  Componente raiz da aplicação
//  É o "gerente geral": decide quais telas/modais aparecem
//  e repassa funções para os filhos abrirem umas às outras.
// ============================================================

import { useState } from "react";
import Header from "./components/Header";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import AdminPage from "./components/AdminPage";
import Checkout from "../public/Checkout";

function App() {
  // ── Estados que controlam quais modais estão visíveis ──

  // true  → mostra a tela de Checkout sobreposta à página
  const [checkoutAberto, setCheckoutAberto] = useState(false);

  // true  → mostra o painel de administração de produtos
  const [adminAberto, setAdminAberto] = useState(false);

  // Número que aumenta toda vez que um produto é salvo no Admin.
  // O ProductList observa essa variável e recarrega a lista quando ela muda.
  const [versaoProdutos, setVersaoProdutos] = useState(0);

  return (
    <div>
      {/* Barra superior com logo, nav e botão do carrinho.
          Recebe abrirAdmin para abrir o painel ao clicar em ⚙️ Admin */}
      <Header abrirAdmin={() => setAdminAberto(true)} />

      {/* Grade de produtos buscados da API.
          versao muda → ProductList refaz o fetch e exibe produtos atualizados */}
      <ProductList versao={versaoProdutos} />

      {/* Sidebar do carrinho (painel lateral direito).
          abrirCheckout é chamado ao clicar em "Finalizar Pedido" */}
      <Cart abrirCheckout={() => setCheckoutAberto(true)} />

      {/* Renderiza o Checkout SOMENTE se checkoutAberto for true.
          fechar fecha o modal voltando ao estado false */}
      {checkoutAberto && <Checkout fechar={() => setCheckoutAberto(false)} />}

      {/* Renderiza o Admin SOMENTE se adminAberto for true.
          onProdutoSalvo incrementa versaoProdutos, forçando o ProductList a recarregar */}
      {adminAberto && (
        <AdminPage
          fechar={() => setAdminAberto(false)}
          onProdutoSalvo={() => setVersaoProdutos(v => v + 1)}
        />
      )}
    </div>
  );
}

export default App;
