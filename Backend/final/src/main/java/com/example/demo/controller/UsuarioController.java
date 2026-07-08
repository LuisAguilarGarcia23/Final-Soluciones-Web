package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.LoginDTO;
import com.example.demo.dto.LoginResponseDTO;
import com.example.demo.dto.RegistroDTO;
import com.example.demo.dto.UsuarioDTO;
import com.example.demo.model.Usuario;
import com.example.demo.service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuarios", description = "Endpoints para login, registro y gestión de usuarios")
public class UsuarioController {

	private final UsuarioService service;

	public UsuarioController(UsuarioService service) {
		this.service = service;
	}
	
	@Operation(summary = "Listar usuarios", description = "Permite listar todos los usuarios registrados. Solo ADMIN.")
	@SecurityRequirement(name = "bearerAuth")
	@GetMapping
	public List<Usuario> getAll() {
		return service.findAll();
	}
	@Operation(summary = "Listar clientes", description = "Permite listar todos los clientes registrados")
	@SecurityRequirement(name = "bearerAuth")
	@GetMapping("/clientes")
	public List<Usuario> getClientes() {
		return service.findClientes();
	}
	
	@GetMapping("/{id}")
	public Usuario getById(@PathVariable Integer id) {
		return service.findById(id);
	}
	
	@Operation(summary = "Registrar usuario", description = "Permite registrar un usuario público con rol USUARIO o VENDEDOR.")
	@PostMapping("/registro")
	public Usuario registro(@Valid @RequestBody RegistroDTO dto) {
		return service.registro(dto);
	}
	
	@Operation(summary = "Crear usuario", description = "Permite al ADMIN crear usuarios con rol ADMIN, VENDEDOR o USUARIO.")
	@SecurityRequirement(name = "bearerAuth")
	@PostMapping
	public Usuario create(@Valid @RequestBody UsuarioDTO dto) {
		return service.create(dto);
	}
	
	@Operation(summary = "Actualizar usuario", description = "Permite actualizar los datos de un usuario.")
	@SecurityRequirement(name = "bearerAuth")
	@PutMapping("/{id}")
	public Usuario update(
			@PathVariable Integer id,
			@Valid @RequestBody UsuarioDTO dto
	) {
		return service.update(id, dto);
	}
	
	@Operation(summary = "Eliminar usuario", description = "Permite eliminar un usuario por ID. Solo ADMIN.")
	@SecurityRequirement(name = "bearerAuth")
	@DeleteMapping("/{id}")
	public void delete(@PathVariable Integer id) {
		service.delete(id);
	}
	
	@Operation(summary = "Iniciar sesión", description = "Valida email y contraseña. Devuelve token JWT, id, nombre, email y rol.")
	@PostMapping("/login")
	public LoginResponseDTO login(@Valid @RequestBody LoginDTO dto) {
		return service.login(dto.getEmail(), dto.getPassword());
	}
}