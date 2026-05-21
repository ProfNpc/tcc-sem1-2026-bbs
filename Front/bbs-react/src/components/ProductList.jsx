import ProductCard from "./ProductCard";
import { produtos, categorias } from "../data/produtos";

export default function ProductList() {
  const categoriasComProdutos = categorias.filter(cat =>
    cat.id !== "" && produtos.some(p => p.tipo === cat.id)
  );

  return (
    <div className="categorias-wrap" id="produtos">
      {categoriasComProdutos.map(cat => (
        <section key={cat.id} className="categoria-secao">

          <div className="categoria-header">
            <span className="cat-linha"></span>
            <div className="cat-titulo-wrap">
              <h2 className="cat-titulo">{cat.label}</h2>
              <span className="cat-subtag">{cat.sub}</span>
            </div>
            <span className="cat-linha right"></span>
          </div>

          <div className="categoria-row-wrapper">
            <div className="categoria-row">
              {produtos
                .filter(p => p.tipo === cat.id)
                .map(produto => (
                  <ProductCard key={produto.id} produto={produto} />
                ))
              }
            </div>
          </div>

        </section>
      ))}
    </div>
  );
}