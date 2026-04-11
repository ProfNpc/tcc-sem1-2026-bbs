package br.belval.api.model;


//ADD import com CTRL+SHIFT+O
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

//representa a tabela produto

public class Produto {

	private Integer id;
	private String nome;
	private String descricao;
	private BigDecimal preco; //valores decimais como 12.34
	private LocalDateTime dataCriacao;
	
	
	
	/**
	 * 1- precisamos criar:
	 * 2 - Construtor padrão (sem parametro) e público
	 * 3- Metodos getters e setter
	 * 4- Criar metodo hashCode() e equals()
	 * 5- Metodo toString(): representação textual do conteudo do objeto vamos criar um método 
	 */
	
	public int calcularQQcoisa(String param1, String param2) {
		return 0;
	}
	
	
	
	public Produto() {
	
	}
	
	

	public Integer getId() {
		return this.id;	
	}
	
	
	public void setid(Integer id) {
		this.id = id;
	}


	// para criar os getter (get) eo setter (set) podemos utilizar um atalho da IDE
	//ALT+SHIFT+S >> "GENERATE getters and setters"
	
	
	public String getNome() {
		return nome;
	}



	public void setNome(String nome) {
		this.nome = nome;
	}



	public String getDescricao() {
		return descricao;
	}



	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}



	public BigDecimal getPreco() {
		return preco;
	}



	public void setPreco(BigDecimal preco) {
		this.preco = preco;
	}



	public LocalDateTime getDataCriacao() {
		return dataCriacao;
	}



	public void setDataCriacao(LocalDateTime dataCriacao) {
		this.dataCriacao = dataCriacao;
	}



	public void setId(Integer id) {
		this.id = id;
	}


	//Para criar o hashCode() eo equal() também temo um atalho
		//ALT+SHIFT+S >> "GENERATE hashCode() e equal()"
	
	@Override
	public int hashCode() {
		return Objects.hash(id);
	}



	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Produto other = (Produto) obj;
		return Objects.equals(id, other.id);
	}



	@Override
	public String toString() {
		return "produto [id=" + id + ", nome=" + nome + ", descricao=" + descricao + ", preco=" + preco
				+ ", dataCriacao=" + dataCriacao + "]";
	}


	
	
	
	

	
}

