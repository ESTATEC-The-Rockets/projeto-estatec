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

		// Os endpoints de edição e exclusão usam o sufixo /{id}.
		// O padrão /** também cobre o preflight OPTIONS dessas requisições.
		source.registerCorsConfiguration("/**", config);

		return new CorsFilter(source);
	}

}
