package br.com.belval.bbs.model;

/*
 * Categoria (MODEL)
 * ------------------------------------------------------------
 * Representa uma categoria/tipo de produto.
 *
 * Campos:
 * - idCategoria      -> identificador numérico da categoria
 * - nomeCategoria    -> nome/descrição textual da categoria
 *
 * Observação:
 * - Nesta classe não há anotações JPA (@Entity). Assim, pode estar como modelo
 *   conceitual/DTO ou ainda não mapeada para o banco.
 */

import java.util.Objects;


public class Categoria {

    private Integer idCategoria;
    private String nomeCategoria;

   
    public Categoria() {
    }

    public Integer getIdCategoria() {
        return this.idCategoria;
    }

    public void setId(Integer idCategoria) {
        this.idCategoria = idCategoria;
    }

    public String getNomeCategoria() {
        return nomeCategoria;
    }

    public void setNomeCategoria(String nomeCategoria) {
        this.nomeCategoria = nomeCategoria;
    }

    public void setIdCategoria(Integer idCategoria) {
        this.idCategoria = idCategoria;
    }

    @Override
    public int hashCode() {
        return Objects.hash(idCategoria);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null || getClass() != obj.getClass())
            return false;
        Categoria other = (Categoria) obj;
        return Objects.equals(idCategoria, other.idCategoria);
    }

    @Override
    public String toString() {
        return "Categoria [idCategoria=" + idCategoria + ", nomeCategoria=" + nomeCategoria + "]";
    }

    public static void main(String[] args) {
        Categoria c = new Categoria();
        c.setIdCategoria(223);
        c.setNomeCategoria("Teste");

        Integer idCategoria = c.getIdCategoria();
        System.out.println("id: " + idCategoria);
        System.out.println(c.toString());
    }
}