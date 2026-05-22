// ============================================================
//  produtosService.js
//  Coloque em: src/services/produtosService.js  (crie a pasta)
//
//  Porta 8080 conforme application.properties
//  Campos: id, nome, descricao, preco, estoque, dataCriacao
// ============================================================

const BASE_URL = "http://localhost:8080/produtos";

export async function listarProdutos() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Erro ao listar produtos");
  return res.json();
}

export async function buscarProduto(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Produto não encontrado");
  return res.json();
}

export async function criarProduto(produto) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(produto),
  });
  if (!res.ok) throw new Error("Erro ao criar produto");
  return res.json();
}

export async function atualizarProduto(id, produto) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(produto),
  });
  if (!res.ok) throw new Error("Erro ao atualizar produto");
  return res.json();
}

export async function deletarProduto(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao deletar produto");
}