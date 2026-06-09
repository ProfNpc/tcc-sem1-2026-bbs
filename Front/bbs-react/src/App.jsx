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
  /*
   * App.jsx — raiz do React
   * ------------------------------------------------------------
   * Pense no App como o “cérebro” que decide:
   * - qual tela/modaI fica visível agora
   * - quem ganha props de “abrir/fechar”
   *
   * Aqui NÃO acontece regra de negócio (fetch, frete, etc.).
   * Quem faz isso são os componentes:
   * - ProductList: busca produtos na API do backend
   * - Cart: gerencia a sidebar do carrinho e calcula/mostra frete
   * - Checkout: fluxo de compra (3 etapas)
   * - AdminPage: CRUD de produtos
   */


  // ── Estados que controlam quais modais/telas estão visíveis ──

  // true → mostra a tela de Checkout sobreposta à página

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
          Quando o Checkout chama props "fechar", voltamos para false aqui.
          Isso esconde o modal de Checkout e libera a página principal. */}
      {checkoutAberto && <Checkout fechar={() => setCheckoutAberto(false)} />}


      {/* Renderiza o Admin SOMENTE se adminAberto for true.
          Quando o Admin salva/cria/atualiza produtos,
          ele chama onProdutoSalvo → incrementa versaoProdutos.
          Esse valor muda e força o ProductList a refazer seu GET /produtos/ativos. */}

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
