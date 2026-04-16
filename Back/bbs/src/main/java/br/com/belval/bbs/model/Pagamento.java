package br.com.belval.bbs.model;

import java.util.Objects;
import java.time.LocalDate;

public class Pagamento {

    private Integer idPagamento;

    private Double valor;

    private LocalDate dataPagamento;

    private String formaPagamento;

    public Pagamento() {

    }

    public Integer getIdPagamento() {
        return this.idPagamento;
    }

    public void setIdPagamento(Integer idPagamento) {
        this.idPagamento = idPagamento;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public LocalDate getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(LocalDate dataPagamento) {
        this.dataPagamento = dataPagamento;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPagamento);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null || getClass() != obj.getClass())
            return false;
        Pagamento other = (Pagamento) obj;
        return Objects.equals(idPagamento, other.idPagamento);
    }

    @Override
    public String toString() {
        return "Pagamento [idPagamento=" + idPagamento +
               ", valor=" + valor +
               ", dataPagamento=" + dataPagamento +
               ", formaPagamento=" + formaPagamento + "]";
    }

    public static void main(String[] args) {

        Pagamento p = new Pagamento();

        p.setIdPagamento(1);
        p.setValor(150.75);
        p.setDataPagamento(LocalDate.now());
        p.setFormaPagamento("PIX");

        System.out.println("id: " + p.getIdPagamento());
        System.out.println(p.toString());
    }
}
