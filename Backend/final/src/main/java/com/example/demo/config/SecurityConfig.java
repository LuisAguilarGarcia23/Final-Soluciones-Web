package com.example.demo.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.demo.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtFilter;

	public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
		this.jwtFilter = jwtFilter;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		return http
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.csrf(csrf -> csrf.disable())
				.sessionManagement(session ->
						session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
				)
				.authorizeHttpRequests(auth -> auth

						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

						.requestMatchers(
								"/swagger-ui/**",
								"/swagger-ui.html",
								"/v3/api-docs/**"
						).permitAll()

						.requestMatchers("/api/usuarios/login").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/usuarios/registro").permitAll()

						// INVENTARIO / PRODUCTOS
						.requestMatchers(HttpMethod.GET, "/api/inventarios", "/api/inventarios/**")
						.hasAnyRole("ADMIN", "VENDEDOR", "USUARIO")

						.requestMatchers(HttpMethod.POST, "/api/inventarios", "/api/inventarios/**")
						.hasAnyRole("ADMIN", "VENDEDOR")

						.requestMatchers(HttpMethod.PUT, "/api/inventarios", "/api/inventarios/**")
						.hasAnyRole("ADMIN", "VENDEDOR")

						.requestMatchers(HttpMethod.DELETE, "/api/inventarios", "/api/inventarios/**")
						.hasRole("ADMIN")

						// VENTAS
						.requestMatchers(HttpMethod.POST, "/api/ventas", "/api/ventas/**")
						.hasAnyRole("ADMIN", "VENDEDOR", "USUARIO")

						.requestMatchers(HttpMethod.GET, "/api/ventas", "/api/ventas/**")
						.hasAnyRole("ADMIN", "VENDEDOR")

						.requestMatchers(HttpMethod.PUT, "/api/ventas", "/api/ventas/**")
						.hasAnyRole("ADMIN", "VENDEDOR")

						.requestMatchers(HttpMethod.DELETE, "/api/ventas", "/api/ventas/**")
						.hasRole("ADMIN")
						//clientes
						.requestMatchers(HttpMethod.GET, "/api/usuarios/clientes")
						.hasAnyRole("ADMIN", "VENDEDOR")
						// USUARIOS
						.requestMatchers("/api/usuarios/**")
						.hasRole("ADMIN")

						// CATEGORÍAS
						.requestMatchers(HttpMethod.GET, "/api/categorias", "/api/categorias/**")
						.hasAnyRole("ADMIN", "VENDEDOR", "USUARIO")

						.requestMatchers(HttpMethod.POST, "/api/categorias", "/api/categorias/**")
						.hasAnyRole("ADMIN", "VENDEDOR")

						.requestMatchers(HttpMethod.PUT, "/api/categorias", "/api/categorias/**")
						.hasAnyRole("ADMIN", "VENDEDOR")

						.requestMatchers(HttpMethod.DELETE, "/api/categorias", "/api/categorias/**")
						.hasRole("ADMIN")

						.anyRequest().authenticated()
				)
				.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
				.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {

		CorsConfiguration config = new CorsConfiguration();

		config.setAllowedOrigins(List.of("http://localhost:4200"));
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
		config.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);

		return source;
	}
}