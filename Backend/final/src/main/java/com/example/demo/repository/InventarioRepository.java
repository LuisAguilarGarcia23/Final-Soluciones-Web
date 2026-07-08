package com.example.demo.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Inventario;

public interface InventarioRepository extends JpaRepository<Inventario, Integer> {

	boolean existsByProducto(String producto);

	Page<Inventario> findByProductoContainingIgnoreCase(
			String producto,
			Pageable pageable
	);
}