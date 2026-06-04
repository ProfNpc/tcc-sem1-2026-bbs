package br.com.belval.bbs.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import br.com.belval.bbs.model.Produto;

@Repository
public interface ProdutoRepository extends CrudRepository<Produto, Integer> {

    /*
     * Busca usando “LIKE” (Containing):
     * WHERE nome LIKE %texto1% OR descricao LIKE %texto2%
     *
     * Chamado pelo endpoint:
     *   GET /produtos/buscar/{texto}
     */
    List<Produto> findByNomeContainingOrDescricaoContaining(String texto1, String texto2);

    /*
     * Busca somente produtos ativos:
     * WHERE ativo = true
     *
     * Chamado pelo endpoint:
     *   GET /produtos/ativos
     * e usado pela lista pública da loja no Front.
     */
    List<Produto> findByAtivoTrue();
}
