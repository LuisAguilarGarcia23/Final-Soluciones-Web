package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Venta;

public interface VentaRepository extends JpaRepository<Venta, Integer> {

}
