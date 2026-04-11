package br.belval.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import br.belval.api.model.Produto;

@RestController
public class Produtocontroller {
//curl POST http://localhost:8080/produtos -H "Content-Type: application/json; Charset=utf-8" -d @produto-pao.json
	@PostMapping("/produtos")
	
	public ResponseEntity<Produto> criarProduto(@RequestBody Produto produto){
		
		System.out.println("Chegou: " + produto.toString());
		
		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(produto);
	}
}
	