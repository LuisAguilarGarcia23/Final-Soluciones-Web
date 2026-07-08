package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.dto.LoginResponseDTO;
import com.example.demo.dto.RegistroDTO;
import com.example.demo.dto.UsuarioDTO;
import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.security.JwtService;

@Service
public class UsuarioService {

	private final UsuarioRepository repo;
	private final JwtService jwtService;
	private final PasswordEncoder passwordEncoder;

	public UsuarioService(
			UsuarioRepository repo,
			JwtService jwtService,
			PasswordEncoder passwordEncoder
	) {
		this.repo = repo;
		this.jwtService = jwtService;
		this.passwordEncoder = passwordEncoder;
	}
	
	public List<Usuario> findAll() {
		return repo.findAll();
	}
	public List<Usuario> findClientes() {
		return repo.findByRol("USUARIO");
	}
	
	public Usuario findById(Integer id) {
		return repo.findById(id)
				.orElseThrow(() -> new RuntimeException("El usuario no existe"));
	}
	
	public Usuario registro(RegistroDTO dto) {

		if (repo.existsByEmail(dto.getEmail())) {
			throw new RuntimeException("El correo ya está registrado");
		}

		validarRolRegistro(dto.getRol());

		Usuario user = new Usuario();

		user.setName(dto.getName());
		user.setEmail(dto.getEmail());
		user.setPassword(passwordEncoder.encode(dto.getPassword()));
		user.setRol(dto.getRol());

		return repo.save(user);
	}
	
	public Usuario create(UsuarioDTO dto) {
		
		if (repo.existsByEmail(dto.getEmail())) {
			throw new RuntimeException("El correo ya está registrado");
		}

		validarRol(dto.getRol());

		Usuario user = new Usuario();
		
		user.setName(dto.getName());
		user.setEmail(dto.getEmail());
		user.setPassword(passwordEncoder.encode(dto.getPassword()));
		user.setRol(dto.getRol());
		
		return repo.save(user);
	}
	
	public Usuario update(Integer id, UsuarioDTO dto) {

		Usuario user = repo.findById(id)
				.orElseThrow(() -> new RuntimeException("El usuario no existe"));

		Optional<Usuario> usuarioConMismoEmail = repo.findByEmail(dto.getEmail());

		if (usuarioConMismoEmail.isPresent()
				&& !usuarioConMismoEmail.get().getId().equals(id)) {
			throw new RuntimeException("El correo ya está registrado por otro usuario");
		}

		validarRol(dto.getRol());

		user.setName(dto.getName());
		user.setEmail(dto.getEmail());
		user.setPassword(passwordEncoder.encode(dto.getPassword()));
		user.setRol(dto.getRol());
		
		return repo.save(user);
	}
	
	public void delete(Integer id) {

		if (!repo.existsById(id)) {
			throw new RuntimeException("El usuario no existe");
		}

		repo.deleteById(id);
	}
	
	public LoginResponseDTO login(String email, String password) {

	    Usuario usuario = repo.findByEmail(email)
	    		.orElseThrow(() -> new RuntimeException("Correo o contraseña incorrectos"));

	    if (!passwordEncoder.matches(password, usuario.getPassword())) {
	        throw new RuntimeException("Correo o contraseña incorrectos");
	    }

	    String token = jwtService.generarToken(usuario);

	    LoginResponseDTO respuesta = new LoginResponseDTO();

	    respuesta.setId(usuario.getId());
	    respuesta.setToken(token);
	    respuesta.setName(usuario.getName());
	    respuesta.setEmail(usuario.getEmail());
	    respuesta.setRol(usuario.getRol());

	    return respuesta;
	}

	private void validarRol(String rol) {

		if (!rol.equals("ADMIN")
				&& !rol.equals("VENDEDOR")
				&& !rol.equals("USUARIO")) {
			throw new RuntimeException("Rol no válido");
		}
	}

	private void validarRolRegistro(String rol) {

		if (!rol.equals("VENDEDOR") && !rol.equals("USUARIO")) {
			throw new RuntimeException("En el registro solo se permite VENDEDOR o USUARIO");
		}
	}
}