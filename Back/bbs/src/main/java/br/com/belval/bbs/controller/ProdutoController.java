package br.com.belval.bbs.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

<<<<<<< HEAD

    /*
     * Listar TODOS os produtos (admin vê tudo, ativos e inativos)
     * GET /produtos
=======
    /**
     * Pasta onde as imagens são salvas em disco.
     * Configurada em application.properties:
     *   app.upload.dir=uploads/imagens
     * Padrão: "uploads/imagens" dentro da pasta raiz do projeto.
>>>>>>> 1f54f07 (vou mexer no do maros pq tá melhors sla oq eu to escrenveod[wajda])
     */
    @Value("${app.upload.dir:uploads/imagens}")
    private String uploadDir;

    /**
     * URL base pública para acessar as imagens no navegador.
     * Configurada em application.properties:
     *   app.upload.url-base=http://localhost:8080/imagens
     */
    @Value("${app.upload.url-base:http://localhost:8080/imagens}")
    private String uploadUrlBase;

    // =========================================================================
    //  ENDPOINTS EXISTENTES (sem alteração)
    // =========================================================================

    /** GET /produtos — lista todos (admin) */
    @GetMapping
    public ResponseEntity<Iterable<Produto>> obterProdutos() {
        return ResponseEntity.ok(repository.findAll());
    }

    /** GET /produtos/ativos — lista só os ativos (loja) */
    @GetMapping("/ativos")
    public ResponseEntity<List<Produto>> obterProdutosAtivos() {
        return ResponseEntity.ok(repository.findByAtivoTrue());
    }

    /** GET /produtos/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarPorId(@PathVariable Integer id) {
        Optional<Produto> produtoOpt = repository.findById(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado!");
        }
        return ResponseEntity.ok(produtoOpt.get());
    }

    /** GET /produtos/buscar/{texto} */
    @GetMapping("/buscar/{texto}")
    public ResponseEntity<List<Produto>> buscarProdutos(@PathVariable String texto) {
        List<Produto> produtos =
                repository.findByNomeContainingOrDescricaoContaining(texto, texto);
        return ResponseEntity.ok(produtos);
    }

    /** POST /produtos — cria produto SEM imagem (JSON puro) */
    @PostMapping
    public ResponseEntity<Object> criarProduto(@RequestBody Produto produto) {
        produto.setId(null);
        produto.setDataCriacao(LocalDateTime.now());
        if (produto.getAtivo() == null) produto.setAtivo(true);
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(produto));
    }

    /** PUT /produtos/{id} — atualiza produto SEM nova imagem (JSON puro) */
    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizarProduto(
            @PathVariable Integer id,
            @RequestBody Produto produto) {

        Optional<Produto> produtoOpt = repository.findById(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado!");
        }
        Produto existente = produtoOpt.get();
        produto.setId(id);
        produto.setDataCriacao(existente.getDataCriacao());
        if (produto.getAtivo() == null) produto.setAtivo(existente.getAtivo());
        return ResponseEntity.ok(repository.save(produto));
    }

    /** PATCH /produtos/{id}/status — alterna ativo/inativo */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Object> alternarStatus(@PathVariable Integer id) {
        Optional<Produto> produtoOpt = repository.findById(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado!");
        }
        Produto produto = produtoOpt.get();
        produto.setAtivo(!Boolean.TRUE.equals(produto.getAtivo()));
        return ResponseEntity.ok(repository.save(produto));
    }

    /** DELETE /produtos/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> apagarProduto(@PathVariable Integer id) {
        Optional<Produto> produtoOpt = repository.findById(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado!");
        }
        repository.deleteById(id);
        return ResponseEntity.ok("Produto apagado com sucesso!");
    }

    // =========================================================================
    //  NOVOS ENDPOINTS COM UPLOAD DE IMAGEM (multipart/form-data)
    // =========================================================================

    /**
     * POST /produtos/com-imagem
     * Cria um produto enviando a imagem como arquivo (multipart/form-data).
     *
     * Campos do formulário:
     *   imagem    → arquivo de imagem (MultipartFile)
     *   nome      → String
     *   descricao → String
     *   preco     → BigDecimal
     *   estoque   → Integer
     *   tipo      → String
     *   ativo     → Boolean
     *
     * O arquivo é salvo em disco (pasta configurada em app.upload.dir).
     * A URL pública é gravada no campo imgUrl do produto.
     */
    @PostMapping("/com-imagem")
    public ResponseEntity<Object> criarProdutoComImagem(
            @RequestParam("imagem")    MultipartFile imagem,
            @RequestParam("nome")      String nome,
            @RequestParam(value = "descricao", defaultValue = "") String descricao,
            @RequestParam("preco")     BigDecimal preco,
            @RequestParam(value = "estoque",   defaultValue = "0") Integer estoque,
            @RequestParam(value = "tipo",      defaultValue = "") String tipo,
            @RequestParam(value = "ativo",     defaultValue = "true") Boolean ativo) {

        try {
            String urlImagem = salvarArquivo(imagem);

            Produto produto = new Produto();
            produto.setNome(nome);
            produto.setDescricao(descricao);
            produto.setPreco(preco);
            produto.setEstoque(estoque);
            produto.setTipo(tipo.isBlank() ? null : tipo);
            produto.setAtivo(ativo);
            produto.setImgUrl(urlImagem);
            produto.setDataCriacao(LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(produto));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao salvar imagem: " + e.getMessage());
        }
    }

    /**
     * PUT /produtos/{id}/com-imagem
     * Atualiza um produto enviando uma nova imagem (multipart/form-data).
     * Substitui a imagem anterior em disco e atualiza a URL no banco.
     */
    @PutMapping("/{id}/com-imagem")
    public ResponseEntity<Object> atualizarProdutoComImagem(
            @PathVariable Integer id,
            @RequestParam("imagem")    MultipartFile imagem,
            @RequestParam("nome")      String nome,
            @RequestParam(value = "descricao", defaultValue = "") String descricao,
            @RequestParam("preco")     BigDecimal preco,
            @RequestParam(value = "estoque",   defaultValue = "0") Integer estoque,
            @RequestParam(value = "tipo",      defaultValue = "") String tipo,
            @RequestParam(value = "ativo",     defaultValue = "true") Boolean ativo) {

        Optional<Produto> produtoOpt = repository.findById(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado!");
        }

        try {
            String urlImagem = salvarArquivo(imagem);

            Produto produto = produtoOpt.get();
            produto.setNome(nome);
            produto.setDescricao(descricao);
            produto.setPreco(preco);
            produto.setEstoque(estoque);
            produto.setTipo(tipo.isBlank() ? null : tipo);
            produto.setAtivo(ativo);
            produto.setImgUrl(urlImagem);
            // dataCriacao é mantida (não sobrescrita)

            return ResponseEntity.ok(repository.save(produto));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao salvar imagem: " + e.getMessage());
        }
    }

    // =========================================================================
    //  MÉTODO AUXILIAR: salva o arquivo em disco e retorna a URL pública
    // =========================================================================

    /**
     * Salva o MultipartFile na pasta configurada em app.upload.dir,
     * usando um nome único (UUID + extensão original) para evitar colisões.
     *
     * @param arquivo MultipartFile recebido no request
     * @return URL pública no formato http://localhost:8080/imagens/nome-do-arquivo.jpg
     */
    private String salvarArquivo(MultipartFile arquivo) throws IOException {
        // Cria a pasta de destino se não existir
        Path pastaDestino = Paths.get(uploadDir);
        Files.createDirectories(pastaDestino);

        // Gera nome único para o arquivo: UUID + extensão original
        String nomeOriginal = arquivo.getOriginalFilename();
        String extensao = "";
        if (nomeOriginal != null && nomeOriginal.contains(".")) {
            extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
        }
        String nomeArquivo = UUID.randomUUID().toString() + extensao;

        // Copia o arquivo para o disco (substitui se já existir — não deve ocorrer com UUID)
        Path destino = pastaDestino.resolve(nomeArquivo);
        Files.copy(arquivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

        // Retorna a URL pública que o front-end vai usar para exibir a imagem
        return uploadUrlBase + "/" + nomeArquivo;
    }
}