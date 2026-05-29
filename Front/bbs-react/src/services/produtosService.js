// ============================================================
//  produtosService.js  —  Camada de acesso à API REST
//  Arquivo: src/services/produtosService.js
//
//  Centraliza todas as chamadas HTTP ao back-end Spring Boot
//  (rodando em http://localhost:8080/produtos).
//  Cada função retorna uma Promise com o dado ou lança um erro.
// ============================================================

// URL base do back-end. Mudar aqui reflete em todas as funções.
const BASE_URL = "http://localhost:8080/produtos";

// ── listarProdutos ────────────────────────────────────────────
// GET /produtos
// Retorna a lista completa de produtos cadastrados no banco.
// Usado pelo ProductList e pelo AdminPage para preencher a grade/tabela.
export async function listarProdutos() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Erro ao listar produtos");
  return res.json(); // Retorna array de produtos
}

// ── buscarProduto ─────────────────────────────────────────────
// GET /produtos/{id}
// Busca um único produto pelo ID.
// (Reservado para uso futuro, ex: página de detalhe do produto)
export async function buscarProduto(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Produto não encontrado");
  return res.json();
}

// ── criarProduto ──────────────────────────────────────────────
// POST /produtos
// Envia um novo produto para ser salvo no banco de dados.
// O body é um objeto JSON com: nome, descricao, preco, estoque, imgUrl, tipo.
// Retorna o produto criado com o ID gerado pelo banco.
export async function criarProduto(produto) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // informa que o body é JSON
    body: JSON.stringify(produto),                    // converte o objeto JS para texto JSON
  });
  if (!res.ok) throw new Error("Erro ao criar produto");
  return res.json();
}

// ── atualizarProduto ──────────────────────────────────────────
// PUT /produtos/{id}
// Substitui os dados de um produto existente.
// Chamado pelo AdminPage quando o usuário salva uma edição.
export async function atualizarProduto(id, produto) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(produto),
  });
  if (!res.ok) throw new Error("Erro ao atualizar produto");
  return res.json();
}

// ── deletarProduto ────────────────────────────────────────────
// DELETE /produtos/{id}
// Remove permanentemente um produto do banco.
// Chamado pelo AdminPage após o usuário confirmar a exclusão.
// Não retorna dados (204 No Content é o esperado).
export async function deletarProduto(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao deletar produto");
}
