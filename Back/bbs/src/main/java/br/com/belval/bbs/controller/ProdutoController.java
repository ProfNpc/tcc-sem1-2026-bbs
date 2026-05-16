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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.belval.bbs.model.Produto;
import br.com.belval.bbs.repository.ProdutoRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoRepository repository;

    /*
     * Listar todos os produtos
     * GET /produtos
     */
    @GetMapping
    public ResponseEntity<Iterable<Produto>> obterProdutos() {

        Iterable<Produto> produtos = repository.findAll();

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(produtos);
    }

    /*
     * Buscar produto por ID
     * GET /produtos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarPorId(@PathVariable Integer id) {

        Optional<Produto> produtoOpt = repository.findById(id);

        if (produtoOpt.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Produto não encontrado!");
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(produtoOpt.get());
    }

    /*
     * Buscar produtos por nome ou descrição
     * GET /produtos/buscar/{texto}
     */
    @GetMapping("/buscar/{texto}")
    public ResponseEntity<List<Produto>> buscarProdutos(
            @PathVariable String texto) {

        List<Produto> produtos =
                repository.findByNomeContainingOrDescricaoContaining(texto, texto);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(produtos);
    }

    
    /*
     * Criar produto
     * POST /produtos
     */
    @PostMapping
    public ResponseEntity<Object> criarProduto(
            @RequestBody Produto produto) {

        produto.setId(null);

        produto.setDataCriacao(LocalDateTime.now());

        Produto produtoSalvo = repository.save(produto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(produtoSalvo);
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

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Produto não encontrado!");
        }

        Produto produtoExistente = produtoOpt.get();

        produto.setId(id);

        produto.setDataCriacao(
                produtoExistente.getDataCriacao());

        Produto produtoAtualizado =
                repository.save(produto);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(produtoAtualizado);
    }

    /*
     * Apagar produto
     * DELETE /produtos/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> apagarProduto(
            @PathVariable Integer id) {

        Optional<Produto> produtoOpt =
                repository.findById(id);

        if (produtoOpt.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Produto não encontrado!");
        }

        repository.deleteById(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body("Produto apagado com sucesso!");
    }
}