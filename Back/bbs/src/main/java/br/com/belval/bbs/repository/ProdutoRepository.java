package br.com.belval.bbs.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import br.com.belval.bbs.model.Produto;

@Repository
public interface ProdutoRepository extends CrudRepository<Produto, Integer> {

    List<Produto> findByNomeContainingOrDescricaoContaining(String texto1, String texto2);

    // NOVO: busca só os produtos que estão ativos (ativo = true)
    // Usado pelo endpoint público da loja
    List<Produto> findByAtivoTrue();
}