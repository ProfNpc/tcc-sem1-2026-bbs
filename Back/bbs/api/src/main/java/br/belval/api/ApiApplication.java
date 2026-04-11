package br.belval.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController

@SpringBootApplication
public class ApiApplication {

//blablabla
	public static void main(String[] args) {
		SpringApplication.run(ApiApplication.class, args);
	}
	@GetMapping("/eco")
public String eco() {
	return "eco!";
}
}
