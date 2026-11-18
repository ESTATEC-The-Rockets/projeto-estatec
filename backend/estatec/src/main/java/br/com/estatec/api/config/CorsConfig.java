package br.com.estatec.api.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${estatec.frontend-origin:}") String frontendOrigin) {
        CorsConfiguration publicCors = new CorsConfiguration();
        publicCors.setAllowedOrigins(List.of("*"));
        publicCors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        publicCors.setAllowedHeaders(List.of("Content-Type", "X-API-Key"));

        CorsConfiguration sessionCors = new CorsConfiguration(publicCors);
        sessionCors.setAllowedOrigins(frontendOrigin.isBlank()
                ? List.of("http://localhost:5500", "http://127.0.0.1:5500")
                : List.of(frontendOrigin.trim()));
        sessionCors.setAllowCredentials(true);

        return request -> sessionCors.checkOrigin(request.getHeader(HttpHeaders.ORIGIN)) != null
                ? sessionCors : publicCors;
    }
}
