import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { VentaService } from '../../../services/venta.service';
import { InventarioService } from '../../../services/inventario.service';
import { UsuarioService } from '../../../services/usuario.service';
import { AuthService } from '../../../services/auth.service';

import { Venta } from '../../../models/venta.model';
import { Inventario } from '../../../models/inventario.model';
import { Usuario } from '../../../models/usuario.model';

interface BoletaVenta {
  numero: string;
  vendedor: string;
  cliente: string;
  producto: string;
  categoria: string;
  fecha: string;
  dia: string;
  hora: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  metodoPago: string;
  estado: string;
}

@Component({
  standalone: true,
  selector: 'app-ventas',
  imports: [NgIf, NgFor, ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class Ventas implements OnInit {

  private fb = inject(FormBuilder);
  private ventaService = inject(VentaService);
  private inventarioService = inject(InventarioService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);

  ventas = signal<Venta[]>([]);
  productos = signal<Inventario[]>([]);
  usuarios = signal<Usuario[]>([]);

  loading = signal(false);
  error = signal<string | null>(null);
  mensaje = signal<string | null>(null);

  boleta = signal<BoletaVenta | null>(null);

  form = this.fb.group({
    id: [null as number | null],
    fecha: [this.fechaActualBackend(), Validators.required],
    idInventario: [null as number | null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    idUsuario: [null as number | null, Validators.required],
    total: [{ value: 0, disabled: true }],
    metodoPago: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadVentas();
    this.loadProductos();
    this.loadUsuarios();

    this.form.controls.idInventario.valueChanges.subscribe(() => {
      this.calcularTotal();
    });

    this.form.controls.cantidad.valueChanges.subscribe(() => {
      this.calcularTotal();
    });
  }

  loadVentas(): void {
    this.loading.set(true);
    this.error.set(null);

    this.ventaService.getAll().subscribe({
      next: (data) => {
        this.ventas.set(data);
      },
      error: (err) => {
        console.error('Error al cargar ventas:', err);
        this.error.set('No se pudieron cargar las ventas.');
      },
      complete: () => this.loading.set(false),
    });
  }

  loadProductos(): void {
    this.inventarioService.getAll(0, 100).subscribe({
      next: (response) => {
        const data = Array.isArray(response)
          ? response
          : response.content ?? [];

        this.productos.set(data);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error.set('No se pudieron cargar los productos.');
      },
    });
  }

loadUsuarios(): void {
  this.usuarioService.getClientes().subscribe({
    next: (data) => {
      this.usuarios.set(data);
    },
    error: (err) => {
      console.error('Error al cargar clientes:', err);
      this.error.set('No se pudieron cargar los clientes.');
    },
  });
}

  guardar(): void {
    this.error.set(null);
    this.mensaje.set(null);
    this.boleta.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Completa todos los campos de la venta.');
      return;
    }

    const data = this.form.getRawValue();

    const idInventario = Number(data.idInventario);
    const idUsuario = Number(data.idUsuario);
    const cantidad = Number(data.cantidad);

    const producto = this.buscarProducto(idInventario);

    if (!producto) {
      this.error.set('Selecciona un producto válido.');
      return;
    }

    if (cantidad > producto.stock && !data.id) {
      this.error.set('No hay stock suficiente para realizar la venta.');
      return;
    }

    const ventaData = {
      fecha: data.fecha!,
      cantidad: cantidad,
      idUsuario: idUsuario,
      idInventario: idInventario,
    };

    const request = data.id
      ? this.ventaService.update(data.id, ventaData)
      : this.ventaService.create(ventaData);

    request.subscribe({
      next: (ventaCreada: any) => {
        this.generarBoleta(ventaCreada, data.metodoPago!);

        this.mensaje.set(
          data.id
            ? 'Venta actualizada correctamente.'
            : 'Venta registrada correctamente.'
        );

        this.resetForm();
        this.loadVentas();
        this.loadProductos();

        setTimeout(() => {
          document
            .getElementById('boletaVenta')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      },
      error: (err) => {
        console.error('Error al guardar venta:', err);

        if (err.status === 403) {
          this.error.set('No tienes permisos para registrar ventas.');
        } else if (err.status === 400) {
          this.error.set('Datos inválidos. Revisa la venta.');
        } else if (err.status === 500) {
          this.error.set('Error interno del backend al guardar la venta.');
        } else {
          this.error.set('No se pudo guardar la venta.');
        }
      },
    });
  }

  editar(venta: Venta): void {
    const item = venta as any;

    this.error.set(null);
    this.mensaje.set(null);
    this.boleta.set(null);

    this.form.patchValue({
      id: venta.id ?? null,
      fecha: venta.fecha,
      cantidad: venta.cantidad,
      idInventario: item.inventario?.id ?? null,
      idUsuario: item.usuario?.id ?? null,
      metodoPago: 'Efectivo',
    });

    this.calcularTotal();
    this.form.markAsUntouched();
  }

  eliminar(id?: number): void {
    if (!id) {
      this.error.set('Venta inválida.');
      return;
    }

    const confirmar = confirm('¿Seguro que deseas eliminar esta venta?');

    if (!confirmar) {
      return;
    }

    this.error.set(null);
    this.mensaje.set(null);

    this.ventaService.delete(id).subscribe({
      next: () => {
        this.mensaje.set('Venta eliminada correctamente.');
        this.loadVentas();
        this.loadProductos();
      },
      error: (err) => {
        console.error('Error al eliminar venta:', err);

        if (err.status === 403) {
          this.error.set('No tienes permisos para eliminar ventas.');
        } else {
          this.error.set('No se pudo eliminar la venta.');
        }
      },
    });
  }

  calcularTotal(): void {
    const idInventario = Number(this.form.controls.idInventario.value);
    const cantidad = Number(this.form.controls.cantidad.value);

    const producto = this.buscarProducto(idInventario);

    if (!producto || !cantidad || cantidad <= 0) {
      this.form.controls.total.setValue(0);
      return;
    }

    const total = producto.precio * cantidad;

    this.form.controls.total.setValue(total);
  }

  generarBoleta(ventaCreada: any, metodoPago: string): void {
    const ahora = new Date();

    const idProducto = ventaCreada?.inventario?.id
      ?? Number(this.form.controls.idInventario.value);

    const idUsuario = ventaCreada?.usuario?.id
      ?? Number(this.form.controls.idUsuario.value);

    const producto = this.buscarProducto(idProducto);
    const usuario = this.buscarUsuario(idUsuario);

    const cantidad = Number(ventaCreada?.cantidad ?? this.form.controls.cantidad.value ?? 0);

    const precioUnitario = Number(
      ventaCreada?.inventario?.precio
      ?? producto?.precio
      ?? 0
    );

    const total = Number(
      ventaCreada?.total
      ?? precioUnitario * cantidad
    );

    const boleta: BoletaVenta = {
      numero: ventaCreada?.id
        ? `B-${ventaCreada.id.toString().padStart(6, '0')}`
        : `B-${Date.now()}`,

      vendedor: this.authService.userName() || 'Vendedor',

      cliente: ventaCreada?.usuario?.name
        ?? usuario?.name
        ?? 'Cliente',

      producto: ventaCreada?.inventario?.producto
        ?? producto?.producto
        ?? 'Producto',

      categoria: ventaCreada?.inventario?.categoria?.nombre
        ?? ventaCreada?.inventario?.categoria?.name
        ?? this.nombreCategoriaProducto(producto)
        ?? 'Sin categoría',

      fecha: ahora.toLocaleDateString('es-PE'),

      dia: ahora.toLocaleDateString('es-PE', {
        weekday: 'long',
      }),

      hora: ahora.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),

      cantidad: cantidad,

      precioUnitario: precioUnitario,

      total: total,

      metodoPago: metodoPago,

      estado: 'Venta registrada',
    };

    this.boleta.set(boleta);
  }

  cerrarBoleta(): void {
    this.boleta.set(null);
  }

  imprimirBoleta(): void {
    window.print();
  }

  resetForm(): void {
    this.form.reset({
      id: null,
      fecha: this.fechaActualBackend(),
      idInventario: null,
      cantidad: 1,
      idUsuario: this.authService.userId(),
      total: 0,
      metodoPago: '',
    });

    this.form.markAsUntouched();
  }

  buscarProducto(id?: number | null): Inventario | undefined {
    if (!id) {
      return undefined;
    }

    return this.productos().find(producto => producto.id === id);
  }

  buscarUsuario(id?: number | null): Usuario | undefined {
    if (!id) {
      return undefined;
    }

    return this.usuarios().find(usuario => usuario.id === id);
  }

  nombreProducto(venta: Venta): string {
    const item = venta as any;

    return item.inventario?.producto
      ?? item.producto?.producto
      ?? item.producto
      ?? 'Producto';
  }

  nombreUsuario(venta: Venta): string {
    const item = venta as any;

    return item.usuario?.name
      ?? item.usuario?.nombre
      ?? item.cliente
      ?? 'Usuario';
  }

  precioUnitarioVenta(venta: Venta): number {
    const item = venta as any;

    return Number(item.inventario?.precio ?? 0);
  }

  nombreCategoriaProducto(producto?: Inventario): string {
    const item = producto as any;

    return item?.categoria?.nombre
      ?? item?.categoria?.name
      ?? item?.categoria?.categoria
      ?? 'Sin categoría';
  }

  fechaActualBackend(): string {
    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}