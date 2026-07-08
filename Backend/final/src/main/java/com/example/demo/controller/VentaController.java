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


import com.example.demo.dto.VentaDTO;

import com.example.demo.model.Venta;

import com.example.demo.service.VentaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ventas")
@Tag(name = "Ventas", description = "Endpoints para registrar, consultar, actualizar y eliminar ventas")
public class VentaController {

	private final VentaService service;

	public VentaController(VentaService service) {
		this.service = service;
	}
	
	@Operation(summary = "Listar ventas", description = "Lista todas las ventas registradas. Permitido para ADMIN y VENDEDOR.")
	@SecurityRequirement(name = "bearerAuth")
	@GetMapping
	public List<Venta> getAll() {
		return service.findAll();
	}
	
	
	@GetMapping("/{id}")					// http://localhost:8080/api/ventas
	public Venta getById(
		 @PathVariable Integer id
	) {
		return service.findById(id);
	}
	
	@Operation(summary = "Registrar venta", description = "Registra una venta, calcula el total y descuenta stock automáticamente.")
	@SecurityRequirement(name = "bearerAuth")
	@PostMapping
	public Venta create(
		@Valid @RequestBody VentaDTO dto
	) {
		return service.create(dto);
	}
	
	@Operation(summary = "Actualizar venta", description = "Actualiza una venta y corrige el stock.")
	@SecurityRequirement(name = "bearerAuth")
	@PutMapping("/{id}")
	public Venta update(
			@PathVariable Integer id,
			@Valid @RequestBody VentaDTO dto
	) {
		return service.update(id, dto);
	}
	
	@Operation(summary = "Eliminar venta", description = "Elimina una venta y devuelve el stock. Solo ADMIN.")
	@SecurityRequirement(name = "bearerAuth")
	@DeleteMapping("/{id}")
	public void delete(
		@PathVariable Integer id
	) {
		service.delete(id);
	}
}
