package com.example.demo.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class VentaDTO {

	@NotNull(message = "La fecha es obligatoria")
	private LocalDate fecha;

	@NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;
	
    @NotNull(message = "Debe seleccionar un usuario")
    private Integer idUsuario;

    @NotNull(message = "Debe seleccionar un producto")
    private Integer idInventario;
    
	public LocalDate getFecha() {
		return fecha;
	}

	public void setFecha(LocalDate fecha) {
		this.fecha = fecha;
	}

	public Integer getCantidad() {
		return cantidad;
	}

	public void setCantidad(Integer cantidad) {
		this.cantidad = cantidad;
	}

	public Integer getIdUsuario() {
		return idUsuario;
	}

	public Integer getIdInventario() {
		return idInventario;
	}

	public void setIdUsuario(Integer idUsuario) {
		this.idUsuario = idUsuario;
	}

	public void setIdInventario(Integer idInventario) {
		this.idInventario = idInventario;
	}
}