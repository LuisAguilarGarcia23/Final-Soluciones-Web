package com.example.demo.controller;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.InventarioDTO;
import com.example.demo.model.Inventario;
import com.example.demo.service.InventarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/inventarios")
@Tag(name = "Inventario", description = "Endpoints para gestionar productos, stock, precio y categorías")
public class InventarioController {

	private final InventarioService service;

	public InventarioController(InventarioService service) {
		this.service = service;
	}
	
	@Operation(summary = "Listar productos", description = "Lista productos del inventario con paginación.")
	@SecurityRequirement(name = "bearerAuth")
	@GetMapping
	public Page<Inventario> getAll(
			@PageableDefault(size = 10, sort = "id") Pageable pageable
	) {
		return service.findAllPage(pageable);
	}
	
	
	@GetMapping("/{id}")					// http://localhost:8080/api/inventarios
	public Inventario getById(
		 @PathVariable Integer id
	) {
		return service.findById(id);
	}
	
	@Operation(summary = "Crear producto", description = "Crea un producto nuevo en inventario. Permitido para ADMIN y VENDEDOR.")
	@SecurityRequirement(name = "bearerAuth")
	@PostMapping
	public Inventario create(
		@Valid @RequestBody InventarioDTO dto
	) {
		return service.create(dto);
	}
	
	@Operation(summary = "Actualizar producto", description = "Actualiza un producto existente.")
	@SecurityRequirement(name = "bearerAuth")
	@PutMapping("/{id}")
	public Inventario update(
			@PathVariable Integer id,
			@Valid @RequestBody InventarioDTO dto
	) {
		return service.update(id, dto);
	}
	
	@Operation(summary = "Eliminar producto", description = "Elimina un producto del inventario. Solo ADMIN.")
	@SecurityRequirement(name = "bearerAuth")
	@DeleteMapping("/{id}")
	public void delete(
		@PathVariable Integer id
	) {
		service.delete(id);
	}
	
	@Operation(summary = "Buscar producto", description = "Busca productos por nombre.")
	@SecurityRequirement(name = "bearerAuth")
	@GetMapping("/buscar")
	public Page<Inventario> buscar(
			@RequestParam String producto,
			@PageableDefault(size = 10, sort = "id") Pageable pageable
	) {
		return service.buscarPorProducto(producto, pageable);
	}
}
