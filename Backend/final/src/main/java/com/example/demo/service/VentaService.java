package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.VentaDTO;
import com.example.demo.model.Inventario;
import com.example.demo.model.Usuario;
import com.example.demo.model.Venta;
import com.example.demo.repository.InventarioRepository;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.repository.VentaRepository;

@Service
public class VentaService {

	private final VentaRepository repo;
	private final UsuarioRepository usuarioRepository;
	private final InventarioRepository inventarioRepository;

	public VentaService(
            VentaRepository repo,
            UsuarioRepository usuarioRepository,
            InventarioRepository inventarioRepository
    ) {
        this.repo = repo;
        this.usuarioRepository = usuarioRepository;
        this.inventarioRepository = inventarioRepository;
    }
	
	public List<Venta> findAll() {
		return repo.findAll();
	}
	
	public Venta findById(Integer id) {
		return repo.findById(id)
				.orElseThrow(() -> new RuntimeException("La venta no existe"));
	}
	
	@Transactional
	public Venta create(VentaDTO dto) {
		
		Usuario usuario = usuarioRepository
				.findById(dto.getIdUsuario())
				.orElseThrow(() -> new RuntimeException("El usuario no existe"));

		Inventario inventario = inventarioRepository
				.findById(dto.getIdInventario())
				.orElseThrow(() -> new RuntimeException("El producto no existe"));

		if (inventario.getStock() < dto.getCantidad()) {
			throw new RuntimeException("Stock insuficiente");
		}

		Venta venta = new Venta();

		venta.setCantidad(dto.getCantidad());
		venta.setFecha(dto.getFecha());
		venta.setTotal(dto.getCantidad() * inventario.getPrecio());
		venta.setUsuario(usuario);
		venta.setInventario(inventario);

		inventario.setStock(inventario.getStock() - dto.getCantidad());
		inventarioRepository.save(inventario);

		return repo.save(venta);
	}
	
	@Transactional
	public Venta update(Integer id, VentaDTO dto) {

		Venta venta = repo.findById(id)
				.orElseThrow(() -> new RuntimeException("La venta no existe"));
		
		Usuario usuario = usuarioRepository
				.findById(dto.getIdUsuario())
				.orElseThrow(() -> new RuntimeException("El usuario no existe"));

        Inventario inventarioNuevo = inventarioRepository
        		.findById(dto.getIdInventario())
        		.orElseThrow(() -> new RuntimeException("El producto no existe"));

        Inventario inventarioAnterior = venta.getInventario();
        Integer cantidadAnterior = venta.getCantidad();

        boolean mismoProducto = inventarioAnterior.getId().equals(inventarioNuevo.getId());

        if (mismoProducto) {

        	Integer stockDisponible = inventarioNuevo.getStock() + cantidadAnterior;

        	if (stockDisponible < dto.getCantidad()) {
        		throw new RuntimeException("Stock insuficiente");
        	}

        	inventarioNuevo.setStock(stockDisponible - dto.getCantidad());
        	inventarioRepository.save(inventarioNuevo);

        } else {

        	inventarioAnterior.setStock(inventarioAnterior.getStock() + cantidadAnterior);
        	inventarioRepository.save(inventarioAnterior);

        	if (inventarioNuevo.getStock() < dto.getCantidad()) {
        		throw new RuntimeException("Stock insuficiente");
        	}

        	inventarioNuevo.setStock(inventarioNuevo.getStock() - dto.getCantidad());
        	inventarioRepository.save(inventarioNuevo);
        }
		
		venta.setCantidad(dto.getCantidad());
		venta.setFecha(dto.getFecha());
		venta.setTotal(dto.getCantidad() * inventarioNuevo.getPrecio());
		venta.setUsuario(usuario);
        venta.setInventario(inventarioNuevo);
		
		return repo.save(venta);
	}
	
	@Transactional
	public void delete(Integer id) {

		Venta venta = repo.findById(id)
				.orElseThrow(() -> new RuntimeException("La venta no existe"));

		Inventario inventario = venta.getInventario();

		inventario.setStock(inventario.getStock() + venta.getCantidad());
		inventarioRepository.save(inventario);

		repo.deleteById(id);
	}
}