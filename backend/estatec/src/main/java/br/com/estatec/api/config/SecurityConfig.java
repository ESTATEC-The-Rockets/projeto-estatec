package br.com.estatec.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity // Garante que o Spring use ESTA configuração
public class SecurityConfig {

	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		
		http
			.cors(cors -> cors.disable()) // Desativa restrições de CORS para testes locais
			.csrf(csrf -> csrf.disable()) // Essencial para liberar requisições POST/PUT
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/error").permitAll() // 👈 O PULO DO GATO: Libera as mensagens de erro do sistema
				.requestMatchers("/usuarios/**").permitAll()
				.requestMatchers("/estacionamento/**").permitAll()
				.requestMatchers("/carros/**").permitAll()
				.requestMatchers("/donos-carro/**").permitAll()
				.requestMatchers("/donos-estacionamento/**").permitAll()
				.requestMatchers("/historico/**").permitAll()
				.anyRequest().authenticated()
			);

		return http.build();
	}
}