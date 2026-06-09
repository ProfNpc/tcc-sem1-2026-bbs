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

/**
 * ProdutoController
 * ------------------------------------------------------------
 * Camada REST (Spring Web) que expõe endpoints HTTP para o Front-end.
 *
 * O que este controller faz (em português didático):
 * 1) Recebe pedidos HTTP (GET/POST/PUT/PATCH/DELETE) do Front.
 * 2) Busca/atualiza dados no banco via ProdutoRepository (JPA).
 * 3) Para endpoints com imagem, salva o arquivo em disco e guarda a URL
 *    pública da imagem no campo imgUrl do Produto.
 *
 * Base da rota (prefixo): /produtos
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    /**
     * Repositório JPA.
     * Fornece métodos como:
     * - findAll()
     * - findById(id)
     * - save(entity)
     * - deleteById(id)
     * E também métodos derivados definidos no ProdutoRepository.
     */
    @Autowired
    private ProdutoRepository repository;

    /**
     * Pasta onde as imagens são salvas.
     * Configurada em application.properties:
     *   app.upload.dir=uploads/imagens
     */
    @Value("${app.upload.dir:uploads/imagens}")
    private String uploadDir;

    /**
     * URL base pública para acessar imagens no navegador.
     * Configurada em application.properties:
     *   app.upload.url-base=http://localhost:8080/imagens
     */
    @Value("${app.upload.url-base:http://localhost:8080/imagens}")
    private String uploadUrlBase;

    // =========================================================================
    //  ENDPOINTS CRUD (JSON puro)
    // =========================================================================

    /**
     * GET /produtos
     * Lista TODOS os produtos (admin vê tudo: ativos e inativos).
     *
     * Front chama:
     *   GET http://localhost:8080/produtos
     */
    @GetMapping
    public ResponseEntity<Iterable<Produto>> obterProdutos() {
        return ResponseEntity.ok(repository.findAll());
    }

    /**
     * GET /produtos/ativos
     * Lista SOMENTE os produtos ativos (loja vê apenas o que está ativo).
     *
     * Front chama:
     *   GET http://localhost:8080/produtos/ativos
     */
    @GetMapping("/ativos")
    public ResponseEntity<List<Produto>> obterProdutosAtivos() {
        return ResponseEntity.ok(repository.findByAtivoTrue());
    }

    /**
     * GET /produtos/{id}
     * Busca um produto por ID.
     *
     * Front chama:
     *   GET http://localhost:8080/produtos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarPorId(@PathVariable Integer id) {
        Optional<Produto> produtoOpt = repository.findById(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produto não encontrado!");
        }
        return ResponseEntity.ok(produtoOpt.get());
    }

    /**
     * GET /produtos/buscar/{texto}
     * Faz busca por nome OU descrição contendo o texto.
     *
     * Front chama:
     *   GET http://localhost:8080/produtos/buscar/{texto}
     */
    @GetMapping("/buscar/{texto}")
    public ResponseEntity<List<Produto>> buscarProdutos(@PathVariable String texto) {
        List<Produto> produtos = repository.findByNomeContainingOrDescricaoContaining(texto, texto);
        return ResponseEntity.ok(produtos);
    }

    /**
     * POST /produtos
     * Cria produto SEM imagem.
     *
     * Regras didáticas:
     * - zera o id (setId(null)) para o banco gerar automaticamente
     * - define dataCriacao como agora
     * - se ativo vier null, assume ativo=true
     */
    @PostMapping
    public ResponseEntity<Object> criarProduto(@RequestBody Produto produto) {
        produto.setId(null);
        produto.setDataCriacao(LocalDateTime.now());

        if (produto.getAtivo() == null) {
            produto.setAtivo(true);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(produto));
    }

    /**
     * PUT /produtos/{id}
     * Atualiza produto SEM imagem.
     *
     * Regras didáticas:
     * - se não existir, retorna 404
     * - mantém dataCriacao do produto existente
     * - se ativo vier null, preserva o ativo existente
     */
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

        if (produto.getAtivo() == null) {
            produto.setAtivo(existente.getAtivo());
        }

        return ResponseEntity.ok(repository.save(produto));
    }

    /**
     * PATCH /produtos/{id}/status
     * Alterna (liga/desliga) o campo ativo.
     *
     * regra didática:
     * - se ativo=true  → torna false
     * - se ativo=false → torna true
     */
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

    /**
     * DELETE /produtos/{id}
     * Remove um produto do banco.
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

    // =========================================================================
    //  ENDPOINTS COM UPLOAD DE IMAGEM (multipart/form-data)
    // =========================================================================

    /**
     * POST /produtos/com-imagem
     * Cria produto enviando a imagem como arquivo.
     *
     * Campos (multipart/form-data):
     * - imagem   (MultipartFile)
     * - nome      (String)
     * - descricao (String)
     * - preco     (BigDecimal)
     * - estoque   (Integer)
     * - tipo      (String)
     * - ativo     (Boolean)
     *
     * Fluxo didático:
     * 1) Recebe o arquivo no endpoint
     * 2) Chama salvarArquivo(imagem)
     * 3) salvarArquivo:
     *    - cria pasta se não existir
     *    - gera nome único (UUID)
     *    - copia arquivo para o disco
     *    - monta URL pública: uploadUrlBase + "/" + nomeArquivo
     * 4) Salva Produto no banco com imgUrl=url retornada
     */
    @PostMapping("/com-imagem")
    public ResponseEntity<Object> criarProdutoComImagem(
            @RequestParam("imagem") MultipartFile imagem,
            @RequestParam("nome") String nome,
            @RequestParam(value = "descricao", defaultValue = "") String descricao,
            @RequestParam("preco") BigDecimal preco,
            @RequestParam(value = "estoque", defaultValue = "0") Integer estoque,
            @RequestParam(value = "tipo", defaultValue = "") String tipo,
            @RequestParam(value = "ativo", defaultValue = "true") Boolean ativo) {

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
     * Atualiza produto e substitui a imagem.
     *
     * Fluxo didático:
     * - busca produto existente
     * - salva novo arquivo (salvarArquivo)
     * - atualiza campos e imgUrl
     * - mantém dataCriacao (não sobrescreve)
     */
    @PutMapping("/{id}/com-imagem")
    public ResponseEntity<Object> atualizarProdutoComImagem(
            @PathVariable Integer id,
            @RequestParam("imagem") MultipartFile imagem,
            @RequestParam("nome") String nome,
            @RequestParam(value = "descricao", defaultValue = "") String descricao,
            @RequestParam("preco") BigDecimal preco,
            @RequestParam(value = "estoque", defaultValue = "0") Integer estoque,
            @RequestParam(value = "tipo", defaultValue = "") String tipo,
            @RequestParam(value = "ativo", defaultValue = "true") Boolean ativo) {

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
     * Salva o MultipartFile na pasta configurada em app.upload.dir.
     *
     * Para evitar colisões:
     * - o nome final do arquivo é UUID + extensão original
     *
     * @param arquivo arquivo recebido no request
     * @return URL pública para o front exibir a imagem
     */
    private String salvarArquivo(MultipartFile arquivo) throws IOException {
        // Cria a pasta de destino se não existir
        Path pastaDestino = Paths.get(uploadDir);
        Files.createDirectories(pastaDestino);

        // Nome original (para pegar extensão)
        String nomeOriginal = arquivo.getOriginalFilename();
        String extensao = "";
        if (nomeOriginal != null && nomeOriginal.contains(".")) {
            extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
        }

        // Nome final: UUID + extensão
        String nomeArquivo = UUID.randomUUID().toString() + extensao;

        // Copia o arquivo para o disco
        Path destino = pastaDestino.resolve(nomeArquivo);
        Files.copy(arquivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

        // URL que o front vai usar
        return uploadUrlBase + "/" + nomeArquivo;
    }
}

