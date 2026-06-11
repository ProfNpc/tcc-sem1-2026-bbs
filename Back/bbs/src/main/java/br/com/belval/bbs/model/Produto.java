package br.com.belval.bbs.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Produto {

    /*
     * ============================================================
     * Produto (MODEL)
     * ============================================================
     * Representa um item comercial que será persistido no banco (JPA).
     *
     * Campos e uso no sistema:
     * - id (PK)                : identificado nas rotas /{id}
     * - nome / descricao      : exibidos no front e usados em busca
     * - preco                  : valor monetário do produto
     * - estoque                : quantidade disponível
     * - tipo                   : categoria/tipo textual (gpu, cpu, ram...)
     * - dataCriacao            : timestamp de criação
     * - imgUrl                 : URL pública da imagem salva no disco
     * - ativo                  : controla visibilidade na loja (GET /ativos)
     */

    /*
     * ============================================================
     * Produto (MODEL)
     * ============================================================
     * Classe de domínio persistida no banco via JPA (@Entity).
     *
     * Uso no sistema:
     * - Endpoints do ProdutoController operam sobre esta classe.
     * - Campos são retornados ao front como JSON.
     *
     * Campos principais:
     * - id        : PK e referência nas rotas /produtos/{id}
     * - nome      : texto exibido e usado em busca
     * - descricao : texto exibido e usado em busca
     * - preco     : preço monetário (BigDecimal)
     * - estoque   : quantidade disponível
     * - dataCriacao : timestamp para histórico/controle
     * - tipo      : categoria textual (ex: gpu, cpu...)
     * - imgUrl    : URL da imagem pública do produto
     * - ativo     : controla se o produto aparece na loja (GET /produtos/ativos)
     */

    /*
     * Entidade JPA que mapeia a tabela de produtos no banco.

     *
     * Campos importantes (usados pelos endpoints):
     * - ativo: controla se o produto aparece na loja (GET /ativos)
     * - id: identificador único (PK) e usado em /{id}, PUT, PATCH, DELETE
     * - dataCriacao: registrada ao criar/atualizar (PATCH não altera)
     */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Nome exibido na UI e usado em busca por nome
    private String nome;
    // Descrição exibida e usada em busca por descrição
    private String descricao;
    // Preço do produto (BigDecimal para não perder precisão)
    private BigDecimal preco;
    // Quantidade disponível em estoque
    private Integer estoque;
    // Momento em que o produto foi criado (e preservado no PUT)
    private LocalDateTime dataCriacao;
    // URL/Imagem base64 do produto (exibida no front)
    // OBS: o SQL Server está truncando esse campo (erro de tamanho).
    // Vamos aumentar o tamanho no mapeamento JPA.
    @jakarta.persistence.Column(length = 1000000)
    private String imgUrl;
    // "categoria"/tipo textual (ex: gpu, cpu, ram...) para agrupar no front
    private String tipo;

    /*
     * Status de visibilidade na loja.
     * - true: aparece no catálogo público (GET /produtos/ativos)
     * - false: fica escondido (admin ainda consegue ver em GET /produtos)
     */
    private Boolean ativo = true;

    public Produto() {
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }

    public Integer getEstoque() { return estoque; }
    public void setEstoque(Integer estoque) { this.estoque = estoque; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public String getImgUrl() { return imgUrl; }
    public void setImgUrl(String imgUrl) { this.imgUrl = imgUrl; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    // NOVO: getter e setter do campo ativo
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null) return false;
        if (getClass() != obj.getClass()) return false;
        Produto other = (Produto) obj;
        return Objects.equals(id, other.id);
    }

    @Override
    public String toString() {
        return "Produto [id=" + id +
                ", nome=" + nome +
                ", descricao=" + descricao +
                ", preco=" + preco +
                ", estoque=" + estoque +
                ", dataCriacao=" + dataCriacao +
                ", imgUrl=" + imgUrl +
                ", tipo=" + tipo +
                ", ativo=" + ativo + "]";
    }
}