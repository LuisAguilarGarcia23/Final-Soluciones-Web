package com.example.demo.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;

@Configuration
@OpenAPIDefinition(
		info = @Info(
				title = "API Sistema de Inventario y Ventas",
				version = "1.0.0",
				description = "Documentación del backend Spring Boot para usuarios, login, inventario, categorías y ventas.",
				contact = @Contact(
						name = "Yersi Cortez, Luis Aguilar, Brayan Quisquiche",
						email = "cortesyt12@gmail.com"
				)
		),
		servers = {
				@Server(
						url = "http://localhost:8080",
						description = "Servidor local"
				)
		}
)
@SecurityScheme(
		name = "bearerAuth",
		type = SecuritySchemeType.HTTP,
		scheme = "bearer",
		bearerFormat = "JWT"
)
public class OpenApiConfig {
}