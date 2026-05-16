package br.com.belval.bbs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;

@SpringBootApplication
public class BbsApplication {

	public static void main1(String[] args) {}
		
		public static void main(String[] args) {
		SpringApplication.run(BbsApplication.class, args);
	}
		@GetMapping("/eco")
		public String eco() {
			return "eco!";
		}

}
