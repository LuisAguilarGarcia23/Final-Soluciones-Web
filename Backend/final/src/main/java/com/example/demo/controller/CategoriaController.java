package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.CategoriaDTO;
import com.example.demo.model.Categoria;
import com.example.demo.service.CategoriaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categorias")
@Tag(name = "Categorías", description = "Endpoints para gestionar categorías de productos")
public class CategoriaController {

	private final CategoriaService service;

	public CategoriaController(CategoriaService service) {
		this.service = service;
	}

	@Operation(summary = "Listar categorías", description = "Lista todas las categorías registradas.")
	@SecurityRequirement(name = "bearerAuth")
	@GetMapping
	public List<Categoria> getAll() {
		return service.findAll();
	}

	@GetMapping("/{id}")
	public Categoria getById(@PathVariable Integer id) {
		return service.findById(id);
	}

	@Operation(summary = "Crear categoría", description = "Crea una nueva categoría.")
	@SecurityRequirement(name = "bearerAuth")
	@PostMapping
	public Categoria create(@Valid @RequestBody CategoriaDTO dto) {
		return service.create(dto);
	}

	@Operation(summary = "Actualizar categoría", description = "Actualiza una categoría existente.")
	@SecurityRequirement(name = "bearerAuth")
	@PutMapping("/{id}")
	public Categoria update(
			@PathVariable Integer id,
			@Valid @RequestBody CategoriaDTO dto
	) {
		return service.update(id, dto);
	}

	@Operation(summary = "Eliminar categoría", description = "Elimina una categoría por ID. Solo ADMIN.")
	@SecurityRequirement(name = "bearerAuth")
	@DeleteMapping("/{id}")
	public void delete(@PathVariable Integer id) {
		service.delete(id);
	}
}