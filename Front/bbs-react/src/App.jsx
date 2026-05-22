import { useState } from "react";
import Header from "./components/Header";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import AdminPage from "./components/AdminPage";
import Checkout from "../public/Checkout";
 
function App() {
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [adminAberto, setAdminAberto]       = useState(false);
 
  return (
    <div>
      <Header abrirAdmin={() => setAdminAberto(true)} />
      <ProductList />
      <Cart abrirCheckout={() => setCheckoutAberto(true)} />
      {checkoutAberto && <Checkout fechar={() => setCheckoutAberto(false)} />}
      {adminAberto    && <AdminPage fechar={() => setAdminAberto(false)} />}
    </div>
  );
}
 
export default App;
 