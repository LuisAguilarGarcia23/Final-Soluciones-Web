import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { VentaService } from '../../../services/venta.service';
import { Venta } from '../../../models/venta.model';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [NgIf, NgFor, CurrencyPipe, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private ventaService = inject(VentaService);

  ventasHoy = signal<Venta[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarVentasDelDia();
  }

  cargarVentasDelDia(): void {
    this.loading.set(true);
    this.error.set(null);

    const fechaHoy = this.fechaActualBackend();

    this.ventaService.getAll().subscribe({
      next: (ventas) => {
        const ventasFiltradas = ventas.filter((venta: any) => {
          return venta.fecha === fechaHoy;
        });

        this.ventasHoy.set(ventasFiltradas);
      },
      error: (err) => {
        console.error('Error al cargar ventas del día:', err);
        this.error.set('No se pudieron cargar las ventas del día.');
      },
      complete: () => this.loading.set(false),
    });
  }

  fechaActualBackend(): string {
    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  totalVentasDia(): number {
    return this.ventasHoy().reduce((total, venta: any) => {
      return total + Number(venta.total ?? 0);
    }, 0);
  }

  cantidadProductosVendidos(): number {
    return this.ventasHoy().reduce((total, venta: any) => {
      return total + Number(venta.cantidad ?? 0);
    }, 0);
  }

  nombreProducto(venta: Venta): string {
    const item = venta as any;

    return item.inventario?.producto
      ?? item.producto?.producto
      ?? item.producto
      ?? 'Producto';
  }

  nombreCliente(venta: Venta): string {
    const item = venta as any;

    return item.usuario?.name
      ?? item.usuario?.nombre
      ?? item.cliente
      ?? 'Cliente';
  }

  precioUnitario(venta: Venta): number {
    const item = venta as any;

    const precio = item.inventario?.precio ?? 0;

    return Number(precio);
  }
}