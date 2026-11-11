package br.com.estatec.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		
		http
			// Ativa o CORS usando automaticamente o bean CorsConfigurationSource do CorsConfig.java
			.cors(Customizer.withDefaults())
			.csrf(csrf -> csrf.disable())
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/error").permitAll()
				.requestMatchers("/usuarios/**").permitAll()
				.requestMatchers("/estacionamento/**", "/estacionamentos/**").permitAll()
				.requestMatchers("/carros/**").permitAll()
				.requestMatchers("/donos-carro/**").permitAll()
				.requestMatchers("/donos-estacionamento/**").permitAll()
				.requestMatchers("/historico/**").permitAll()
				.requestMatchers("/api/**").permitAll()
				.anyRequest().permitAll()
			);

		return http.build();
	}
}