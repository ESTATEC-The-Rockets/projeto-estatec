package br.com.estatec.api;

import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Configuration;
import static org.junit.jupiter.api.Assertions.*;

class EnvFileConfigurationTest {
    @Configuration(proxyBeanMethods = false)
    static class OnlyConfiguration {}

    @Test void carregaArquivoEnvEResolveEnderecoDoBanco(@TempDir Path directory) throws Exception {
        Path env = directory.resolve(".env");
        Files.writeString(env, "DB_URL=jdbc:mysql://localhost:3306/teste_env\nDB_USER=operador_teste\nDB_PASSWORD=senha_teste\n");
        try (var context = new SpringApplicationBuilder(OnlyConfiguration.class)
                .web(WebApplicationType.NONE).run(
                    "--spring.config.location=classpath:application.properties",
                    "--estatec.env-file=" + env.toAbsolutePath(), "--spring.main.banner-mode=off")) {
            var properties = context.getEnvironment();
            // Variáveis de ambiente reais continuam tendo prioridade sobre o arquivo.
            assertEquals(System.getenv().getOrDefault("DB_URL", "jdbc:mysql://localhost:3306/teste_env"), properties.getProperty("spring.datasource.url"));
            assertEquals(System.getenv().getOrDefault("DB_USER", "operador_teste"), properties.getProperty("spring.datasource.username"));
            assertEquals(System.getenv().getOrDefault("DB_PASSWORD", "senha_teste"), properties.getProperty("spring.datasource.password"));
        }
    }
}
