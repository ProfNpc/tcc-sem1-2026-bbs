package br.com.belval.bbs.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Corresponde à tabela pedido
 */
public class Pedido {

    private Integer idPedido;
    private String clienteNome;
    private String descricao;
    private BigDecimal valorTotal;
    private LocalDateTime dataCriacao;

    // Construtor padrão
    public Pedido() {
        this.dataCriacao = LocalDateTime.now();
    }

    // Construtor com parâmetros básicos
    public Pedido(Integer idPedido, String clienteNome) {
        this.idPedido = idPedido;
        this.clienteNome = clienteNome;
        this.dataCriacao = LocalDateTime.now();
    }

    public Integer getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Integer idPedido) {
        if (idPedido != null && idPedido <= 0) {
            throw new IllegalArgumentException("ID deve ser maior que zero");
        }
        this.idPedido = idPedido;
    }

    public String getClienteNome() {
        return clienteNome;
    }

    public void setClienteNome(String clienteNome) {
        this.clienteNome = clienteNome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    // Normalmente não se altera a data depois de criado
    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    @Override
    public int hashCode() {
        return idPedido != null ? idPedido.hashCode() : 0;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Pedido other = (Pedido) obj;
        return idPedido != null && idPedido.equals(other.idPedido);
    }

    @Override
    public String toString() {
        return "Pedido{" +
                "idPedido=" + idPedido +
                ", clienteNome='" + clienteNome + '\'' +
                ", descricao='" + descricao + '\'' +
                ", valorTotal=" + valorTotal +
                ", dataCriacao=" + dataCriacao +
                '}';
    }

    // Método de teste
    public static void main(String[] args) {
        Pedido p = new Pedido();
        p.setIdPedido(223);
        p.setClienteNome("João");
        p.setDescricao("Pedido de teste");
        p.setValorTotal(new BigDecimal("99.90"));

        System.out.println(p);
    }
    
    
}