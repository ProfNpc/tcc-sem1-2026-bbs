package br.com.belval.bbs.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.belval.bbs.model.Produto;
import br.com.belval.bbs.repository.ProdutoRepository;

/*
 * ProdutoController
 * ------------------------------------------------------------
 * Camada REST (Spring Web) responsável por expor endpoints HTTP
 * para operações de CRUD e para alternar o status ativo/inativo
 * dos produtos.
 *
 * Base da rota (prefixo): /produtos
 * Exemplo completo: GET http://<host>:8080/produtos/ativos
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    /*
     * repositório JPA (CrudRepository)
     * - fornece findAll, findById, save, deleteById...
     * - e também métodos derivados como findByAtivoTrue() e
     *   findByNomeContainingOrDescricaoContaining(...)
     */
    @Autowired
    private ProdutoRepository repository;


    /*
     * Listar TODOS os produtos (admin vê tudo, ativos e inativos)
     * GET /produtos
     */
    @GetMapping
    public ResponseEntity<Iterable<Produto>> obterProdutos() {
        return ResponseEntity.ok(repository.findAll());
    }

    /*
     * NOVO: Listar só os produtos ativos (usado pela loja)
     * GET /produtos/ativos
     */
    @GetMapping("/ativos")
    public ResponseEntity<List<Produto>> obterProdutosAtivos() {
        return ResponseEntity.ok(repository.findByAtivoTrue());
    }

    /*
     * Buscar produto por ID
     * GET /produtos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarPorId(@PathVariable Integer id) {
        Optional<Produto> produtoOpt = repository.findById(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado!");
        }
        return ResponseEntity.ok(produtoOpt.get());
    }

    /*
     * Buscar produtos por nome ou descrição
     * GET /produtos/buscar/{texto}
     */
    @GetMapping("/buscar/{texto}")
    public ResponseEntity<List<Produto>> buscarProdutos(@PathVariable String texto) {
        List<Produto> produtos =
                repository.findByNomeContainingOrDescricaoContaining(texto, texto);
        return ResponseEntity.ok(produtos);
    }

    /*
     * Criar produto
     * POST /produtos
     */
    @PostMapping
    public ResponseEntity<Object> criarProduto(@RequestBody Produto produto) {
        produto.setId(null);
        produto.setDataCriacao(LocalDateTime.now());

        // Se não vier o campo ativo no JSON, coloca true por padrão
        if (produto.getAtivo() == null) {
            produto.setAtivo(true);
        }

        Produto produtoSalvo = repository.save(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoSalvo);
    }

    /*
     * Atualizar produto
     * PUT /produtos/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizarProduto(
            @PathVariable Integer id,
            @RequestBody Produto produto) {

        Optional<Produto> produtoOpt = repository.findById(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado!");
        }

        Produto produtoExistente = produtoOpt.get();
        produto.setId(id);
        produto.setDataCriacao(produtoExistente.getDataCriacao());

        // Preserva o status ativo/inativo se não vier no body do PUT
        if (produto.getAtivo() == null) {
            produto.setAtivo(produtoExistente.getAtivo());
        }

        Produto produtoAtualizado = repository.save(produto);
        return ResponseEntity.ok(produtoAtualizado);
    }

    /*
     * NOVO: Alternar status ativo/inativo do produto
     * PATCH /produtos/{id}/status
     * Só muda o campo ativo, sem precisar enviar o produto inteiro
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Object> alternarStatus(@PathVariable Integer id) {
        Optional<Produto> produtoOpt = repository.findById(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado!");
        }

        Produto produto = produtoOpt.get();

        // Inverte o valor: se era true vira false, se era false vira true
        produto.setAtivo(!Boolean.TRUE.equals(produto.getAtivo()));

        repository.save(produto);
        return ResponseEntity.ok(produto);
    }

    /*
     * Apagar produto
     * DELETE /produtos/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> apagarProduto(@PathVariable Integer id) {
        Optional<Produto> produtoOpt = repository.findById(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado!");
        }
        repository.deleteById(id);
        return ResponseEntity.ok("Produto apagado com sucesso!");
    }
}