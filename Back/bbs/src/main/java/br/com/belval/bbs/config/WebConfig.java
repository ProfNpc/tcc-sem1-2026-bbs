package br.com.belval.bbs.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configura o Spring para servir as imagens salvas em disco
 * como arquivos estáticos acessíveis via HTTP.
 *
 * Com essa configuração:
 *   → arquivo salvo em: uploads/imagens/abc.jpg
 *   → acessível em:     http://localhost:8080/imagens/abc.jpg
 *
 * Adicione este arquivo em: src/main/java/br/com/belval/bbs/config/WebConfig.java
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /*
     * ============================================================
     * WebConfig (BACK-END)
     * ============================================================
     * Responsabilidade:
     * - Configurar o Spring MVC para servir arquivos estáticos que estão
     *   fisicamente no disco (pasta uploads/imagens).
     *
     * Efeito prático:
     * - Arquivos salvos em: uploads/imagens/ARQUIVO.jpg
     * - Podem ser acessados via HTTP em: http://localhost:8080/imagens/ARQUIVO.jpg
     */

    @Value("${app.upload.dir:uploads/imagens}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Mapeia requisições GET /imagens/** para a pasta física em disco
        registry
            .addResourceHandler("/imagens/**")
            .addResourceLocations("file:" + uploadDir + "/");
    }
}
