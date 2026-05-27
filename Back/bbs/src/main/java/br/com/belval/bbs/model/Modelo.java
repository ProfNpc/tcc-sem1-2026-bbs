package br.com.belval.bbs.model;
 
import java.util.Objects;
 
public class Modelo {
 
    private Integer idModelo;

    private String nome;

 
    public Modelo() {

    }
 
    public Integer getIdModelo() {

        return this.idModelo;

    }
 
    public void setIdModelo(Integer idModelo) {

        this.idModelo = idModelo;

    }
 
    public String getNome() {

        return nome;

    }
 
    public void setNome(String nome) {

        this.nome = nome;

    }
 
 
    @Override

    public int hashCode() {

        return Objects.hash(idModelo);

    }
 
    @Override
	
	public String toString() {
	
	    return "modelo [idModelo=" + idModelo +
	
	           ", nome=" + nome ;
	
	          
	
	}

	@Override

    public boolean equals(Object obj) {

        if (this == obj)

            return true;

        if (obj == null || getClass() != obj.getClass())

            return false;

        Modelo other = (Modelo) obj;

        return Objects.equals(idModelo, other.idModelo);

    }
 
    public static void main(String[] args) {

        Modelo m = new Modelo();

        m.setIdModelo(6767);

        m.setNome("cheio de odio");
 
        System.out.println("id: " + m.getIdModelo());

        System.out.println(m.toString());

    }

}
 