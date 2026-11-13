package br.com.estatec.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import jakarta.servlet.DispatcherType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

@Configuration
public class SecurityConfig {
    @Bean
    public FilterRegistrationBean<SessionAuthenticationFilter> sessionFilterRegistration(SessionAuthenticationFilter filter) {
        FilterRegistrationBean<SessionAuthenticationFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, SessionAuthenticationFilter sessions) throws Exception {
        return http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .addFilterBefore(sessions, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.POST, "/usuarios/login", "/api/acesso/validar").permitAll()
                .requestMatchers(HttpMethod.POST, "/usuarios/cadastro").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/usuarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/usuarios", "/historico/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/historico/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/historico/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/carros", "/estacionamento", "/estacionamento/registros").hasRole("USER")
                .requestMatchers(HttpMethod.PUT, "/carros/**", "/estacionamento/**").hasRole("USER")
                .requestMatchers(HttpMethod.DELETE, "/carros/**", "/estacionamento/**", "/estacionamento/registros/**").hasRole("USER")
                .requestMatchers(HttpMethod.PUT, "/estacionamento/registros/**").hasRole("USER")
                .anyRequest().authenticated())
            .exceptionHandling(errors -> errors
                .authenticationEntryPoint((request, response, ex) -> response.sendError(401))
                .accessDeniedHandler((request, response, ex) -> response.sendError(403)))
            .build();
    }
}
