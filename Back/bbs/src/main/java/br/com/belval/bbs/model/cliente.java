package br.com.belval.bbs.model;
 
import java.util.Objects;
 
public class cliente {
 
    private Integer idCliente;
    private String nome;
    private String endereco;
    private String senha;
    private String comprasAnteriores;
 
    public cliente() {
    }
 
    public Integer getIdCliente() {
        return this.idCliente;
    }
 
    public void setIdCliente(Integer idCliente) {
        this.idCliente = idCliente;
    }
 
    public String getNome() {
        return nome;
    }
 
    public void setNome(String nome) {
        this.nome = nome;
    }
 
    public String getEndereco() {
        return endereco;
    }
 
    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }
 
    public String getSenha() {
        return senha;
    }
 
    public void setSenha(String senha) {
        this.senha = senha;
    }
 
    public String getComprasAnteriores() {
        return comprasAnteriores;
    }
 
    public void setComprasAnteriores(String comprasAnteriores) {
        this.comprasAnteriores = comprasAnteriores;
    }
 
    @Override
    public int hashCode() {
        return Objects.hash(idCliente);
    }
 
    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null || getClass() != obj.getClass())
            return false;
        cliente other = (cliente) obj;
        return Objects.equals(idCliente, other.idCliente);
    }
 
    @Override
    public String toString() {
        return "cliente [idCliente=" + idCliente +
               ", nome=" + nome +
               ", endereco=" + endereco +
               ", senha=" + senha +
               ", comprasAnteriores=" + comprasAnteriores + "]";
    }
 
    public static void main(String[] args) {
        cliente c = new cliente();
        c.setIdCliente(1);
        c.setNome("João");
        c.setEndereco("Rua A, 123");
        c.setSenha("123456");
        c.setComprasAnteriores("Produto X, Produto Y");
 
        System.out.println("id: " + c.getIdCliente());
        System.out.println(c.toString());
    }
}