package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.CategoriaDTO;
import com.example.demo.model.Categoria;
import com.example.demo.repository.CategoriaRepository;

@Service
public class CategoriaService {

	private final CategoriaRepository repo;

	public CategoriaService(CategoriaRepository repo) {
		this.repo = repo;
	}

	public List<Categoria> findAll() {
		return repo.findAll();
	}

	public Categoria findById(Integer id) {
		return repo.findById(id).orElse(null);
	}

	public Categoria create(CategoriaDTO dto) {

		if (repo.existsByNombre(dto.getNombre())) {
			throw new RuntimeException("La categoría ya existe");
		}

		Categoria categoria = new Categoria();

		categoria.setNombre(dto.getNombre());
		categoria.setDescripcion(dto.getDescripcion());

		return repo.save(categoria);
	}

	public Categoria update(Integer id, CategoriaDTO dto) {

		Categoria categoria = repo.findById(id).orElse(null);

		if (categoria == null) {
			throw new RuntimeException("La categoría no existe");
		}

		categoria.setNombre(dto.getNombre());
		categoria.setDescripcion(dto.getDescripcion());

		return repo.save(categoria);
	}

	public void delete(Integer id) {
		repo.deleteById(id);
	}
}