package com.example.demo.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.example.demo.model.Usuario;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	private final String SECRET_KEY = "MI_CLAVE_SECRETA_SUPER_SEGURA_DE_32_CARACTERES_MINIMO";

	private SecretKey getKey() {
		return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
	}

	public String generarToken(Usuario usuario) {
		return Jwts.builder()
				.subject(usuario.getEmail())
				.claim("rol", usuario.getRol())
				.claim("name", usuario.getName())
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
				.signWith(getKey())
				.compact();
	}

	public String obtenerEmail(String token) {
		return Jwts.parser()
				.verifyWith(getKey())
				.build()
				.parseSignedClaims(token)
				.getPayload()
				.getSubject();
	}

	public String obtenerRol(String token) {
		return Jwts.parser()
				.verifyWith(getKey())
				.build()
				.parseSignedClaims(token)
				.getPayload()
				.get("rol", String.class);
	}

	public boolean tokenValido(String token) {
		try {
			Jwts.parser()
					.verifyWith(getKey())
					.build()
					.parseSignedClaims(token);
			return true;
		} catch (Exception e) {
			return false;
		}
	}
}