package br.com.belval.bbs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@SpringBootApplication
@RestController

public class BbsApplication {

	/*
	 * Ponto de entrada da aplicação Spring Boot.
	 * Sobe o container e registra todos os controllers/endpoints.
	 */
	public static void main(String[] args) {
		SpringApplication.run(BbsApplication.class, args);
	}

	/*
	 * Endpoint de teste/health simples.
	 * URL: GET /eco
	 */
	@GetMapping("/eco")
	public String eco() {
		return "eco!";
	}
}
