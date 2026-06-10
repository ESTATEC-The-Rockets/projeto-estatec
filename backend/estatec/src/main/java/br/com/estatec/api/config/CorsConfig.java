package br.com.estatec.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

	@Bean
	public CorsFilter corsFilter() {
		CorsConfiguration config = new CorsConfiguration();

		config.addAllowedOrigin("*");

		config.addAllowedHeader("*");

		config.addAllowedMethod("*");

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

		// Liberação explícita de acesso endpoint por endpoint
		source.registerCorsConfiguration("/usuarios", config);
		source.registerCorsConfiguration("/usuarios/login", config);
		source.registerCorsConfiguration("/usuarios/cadastro", config);
		source.registerCorsConfiguration("/historico", config);
		source.registerCorsConfiguration("/estacionamento", config);
		source.registerCorsConfiguration("/donos-estacionamento", config);
		source.registerCorsConfiguration("/donos-carro", config);
		source.registerCorsConfiguration("/carros", config);

		// Retorna a configuração estruturada para o ecossistema do Spring
		return new CorsFilter(source);
	}

}