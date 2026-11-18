package br.com.estatec.api;

import br.com.estatec.api.config.CorsConfig;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Configuration;
import org.springframework.mock.web.MockHttpServletRequest;
import static org.junit.jupiter.api.Assertions.*;

class EnvFileConfigurationTest {
    @Configuration(proxyBeanMethods = false)
    static class OnlyConfiguration {}

    @Test void carregaArquivoEnvEResolveEnderecoDoBanco(@TempDir Path directory) throws Exception {
        Path env = directory.resolve(".env");
        Files.writeString(env, """
            DB_URL=jdbc:mysql://localhost:3306/teste_env
            DB_USER=operador_teste
            DB_PASSWORD=senha_teste
            ESTATEC_FRONTEND_ORIGIN=https://painel.exemplo.com
            """);
        try (var context = new SpringApplicationBuilder(OnlyConfiguration.class)
                .web(WebApplicationType.NONE).run(
                    "--spring.config.location=classpath:application.properties",
                    "--estatec.env-file=" + env.toAbsolutePath(), "--spring.main.banner-mode=off")) {
            var properties = context.getEnvironment();
            // Variáveis de ambiente reais continuam tendo prioridade sobre o arquivo.
            assertEquals(System.getenv().getOrDefault("DB_URL", "jdbc:mysql://localhost:3306/teste_env"), properties.getProperty("spring.datasource.url"));
            assertEquals(System.getenv().getOrDefault("DB_USER", "operador_teste"), properties.getProperty("spring.datasource.username"));
            assertEquals(System.getenv().getOrDefault("DB_PASSWORD", "senha_teste"), properties.getProperty("spring.datasource.password"));
            String origin = properties.getRequiredProperty("estatec.frontend-origin");
            assertEquals(System.getenv().getOrDefault("ESTATEC_FRONTEND_ORIGIN", "https://painel.exemplo.com"), origin);
            var request = new MockHttpServletRequest("OPTIONS", "/auth/cadastro");
            request.addHeader("Origin", origin);
            var cors = new CorsConfig().corsConfigurationSource(origin).getCorsConfiguration(request);
            assertEquals(origin, cors.checkOrigin(origin));
            assertEquals(Boolean.TRUE, cors.getAllowCredentials());
            assertNull(cors.checkOrigin("https://outra-origem.invalid"));
        }
    }
}
