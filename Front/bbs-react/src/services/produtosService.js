// Prefixo do backend (Spring Boot) para operações REST de produtos.
// Porta e prefixo estão hardcoded (ex: http://localhost:8080/produtos).
const BASE_URL = "http://localhost:8080/produtos";

/*
 * listarProdutos()
 * -----------------
 * Faz GET /produtos
 * - Retorna TODOS os produtos do banco (ativos e inativos).
 * - Usado no Admin para montar a tabela completa.
 */
export async function listarProdutos() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Erro ao listar produtos");
  return res.json();
}

/*
 * listarProdutosAtivos()
 * -----------------------
 * Faz GET /produtos/ativos
 * - Retorna apenas produtos com ativo=true.
 * - Usado na loja (página de listagem pública).
 */
export async function listarProdutosAtivos() {
  const res = await fetch(`${BASE_URL}/ativos`);
  if (!res.ok) throw new Error("Erro ao listar produtos ativos");
  return res.json();
}

/*
 * buscarProduto(id)
 * ------------------
 * Faz GET /produtos/{id}
 * - Retorna um único produto.
 * - 404 no backend vira erro via !res.ok.
 */
export async function buscarProduto(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Produto não encontrado");
  return res.json();
}

/*
 * criarProduto(produto)
 * ----------------------
 * Faz POST /produtos
 * - Envia no body JSON o objeto "produto".
 * - O backend sobrescreve:
 *   - id=null (para forçar geração automática)
 *   - dataCriacao=agora
 *   - ativo=true se o campo ativo não vier
 */
export async function criarProduto(produto) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(produto),
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch (_) {
      // ignore
    }

    const msg = detail
      ? `Erro ao criar produto: ${detail}`
      : "Erro ao criar produto";

    throw new Error(msg);
  }
  return res.json();
}

/*
 * atualizarProduto(id, produto)
 * ------------------------------
 * Faz PUT /produtos/{id}
 * - Envia JSON com os campos do produto.
 * - O backend:
 *   - valida se existe (se não existir → 404)
 *   - preserva dataCriacao (não deixa o front sobrescrever)
 *   - preserva ativo se ativo=null/indefinido no body
 */
export async function atualizarProduto(id, produto) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(produto),
  });
  if (!res.ok) throw new Error("Erro ao atualizar produto");
  return res.json();
}

/*
 * deletarProduto(id)
 * -------------------
 * Faz DELETE /produtos/{id}
 * - Remove o produto do banco.
 */
export async function deletarProduto(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao deletar produto");
}

/*
 * alternarStatusProduto(id)
 * --------------------------
 * Faz PATCH /produtos/{id}/status
 * - O backend apenas inverte ativo:
 *   true -> false, false -> true
 * - Retorna o produto atualizado (incluindo ativo).
 */
export async function alternarStatusProduto(id) {
  const res = await fetch(`${BASE_URL}/${id}/status`, { method: "PATCH" });
  if (!res.ok) throw new Error("Erro ao alterar status do produto");
  return res.json();
}

