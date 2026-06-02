const BASE_URL = "http://localhost:8080/produtos";

// Busca todos os produtos (usado pelo admin, mostra ativos e inativos)
export async function listarProdutos() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Erro ao listar produtos");
  return res.json();
}

// NOVO: Busca só os produtos ativos (usado pela loja)
export async function listarProdutosAtivos() {
  const res = await fetch(`${BASE_URL}/ativos`);
  if (!res.ok) throw new Error("Erro ao listar produtos ativos");
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
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao deletar produto");
}

// NOVO: Alterna o status ativo/inativo do produto
// Chama PATCH /produtos/{id}/status no back-end
export async function alternarStatusProduto(id) {
  const res = await fetch(`${BASE_URL}/${id}/status`, { method: "PATCH" });
  if (!res.ok) throw new Error("Erro ao alterar status do produto");
  return res.json();
}
