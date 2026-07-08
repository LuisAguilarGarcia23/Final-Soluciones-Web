package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.InventarioDTO;
import com.example.demo.model.Categoria;
import com.example.demo.model.Inventario;
import com.example.demo.repository.CategoriaRepository;
import com.example.demo.repository.InventarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class InventarioService {

	private final InventarioRepository repo;
	private final CategoriaRepository categoriaRepository;

	public InventarioService(
			InventarioRepository repo,
			CategoriaRepository categoriaRepository
	) {
		this.repo = repo;
		this.categoriaRepository = categoriaRepository;
	}

	public List<Inventario> findAll() {
		return repo.findAll();
	}

	public Inventario findById(Integer id) {
		return repo.findById(id).orElse(null);
	}

	public Inventario create(InventarioDTO dto) {

		if (repo.existsByProducto(dto.getProducto())) {
			throw new RuntimeException("El producto ya existe");
		}

		Categoria categoria = categoriaRepository
				.findById(dto.getIdCategoria())
				.orElse(null);

		if (categoria == null) {
			throw new RuntimeException("La categoría no existe");
		}

		Inventario inve = new Inventario();

		inve.setProducto(dto.getProducto());
		inve.setPrecio(dto.getPrecio());
		inve.setStock(dto.getStock());
		inve.setDescripcion(dto.getDescripcion());
		inve.setCategoria(categoria);

		return repo.save(inve);
	}

	public Inventario update(Integer id, InventarioDTO dto) {

		Inventario inve = repo.findById(id).orElse(null);

		if (inve == null) {
			throw new RuntimeException("El producto no existe");
		}

		Categoria categoria = categoriaRepository
				.findById(dto.getIdCategoria())
				.orElse(null);

		if (categoria == null) {
			throw new RuntimeException("La categoría no existe");
		}

		inve.setProducto(dto.getProducto());
		inve.setPrecio(dto.getPrecio());
		inve.setStock(dto.getStock());
		inve.setDescripcion(dto.getDescripcion());
		inve.setCategoria(categoria);

		return repo.save(inve);
	}

	public void delete(Integer id) {
		repo.deleteById(id);
	}
	
	public Page<Inventario> findAllPage(Pageable pageable) {
		return repo.findAll(pageable);
	}

	public Page<Inventario> buscarPorProducto(String producto, Pageable pageable) {
		return repo.findByProductoContainingIgnoreCase(producto, pageable);
	}
}