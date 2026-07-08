package com.example.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class InventarioDTO {

	@NotBlank(message = "El producto es obligatorio")
	@Size(min = 3, max = 100, message = "El producto debe tener entre 3 y 100 caracteres")
	private String producto;

	@Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
	private String descripcion;

	@NotNull(message = "El stock es obligatorio")
	@Min(value = 0, message = "El stock no puede ser negativo")
	private Integer stock;

	@NotNull(message = "El precio es obligatorio")
	@Positive(message = "El precio debe ser mayor que 0")
	private Double precio;

	@NotNull(message = "Debe seleccionar una categoría")
	private Integer idCategoria;

	public String getProducto() {
		return producto;
	}

	public void setProducto(String producto) {
		this.producto = producto;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public Integer getStock() {
		return stock;
	}

	public void setStock(Integer stock) {
		this.stock = stock;
	}

	public Double getPrecio() {
		return precio;
	}

	public void setPrecio(Double precio) {
		this.precio = precio;
	}

	public Integer getIdCategoria() {
		return idCategoria;
	}

	public void setIdCategoria(Integer idCategoria) {
		this.idCategoria = idCategoria;
	}
}
