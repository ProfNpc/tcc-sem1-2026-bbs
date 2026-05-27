package br.com.belval.bbs.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import br.com.belval.bbs.model.Produto;

@Repository
public interface ProdutoRepository extends CrudRepository<Produto, Integer> {

    List<Produto> findByNomeContainingOrDescricaoContaining(String texto1, String texto2);

}