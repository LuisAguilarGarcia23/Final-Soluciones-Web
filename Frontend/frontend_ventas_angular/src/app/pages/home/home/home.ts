import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { from } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';

import { AuthService } from '../../../services/auth.service';
import { InventarioService } from '../../../services/inventario.service';
import { VentaService } from '../../../services/venta.service';
import { Inventario } from '../../../models/inventario.model';

interface ItemCompra {
  idProducto: number;
  producto: Inventario;
  nombre: string;
  categoria: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  stockDisponible: number;
}

interface CompraPendiente {
  items: ItemCompra[];
  total: number;
  origen: 'directa' | 'carrito';
}

interface BoletaCompra {
  numero: string;
  cliente: string;
  fecha: string;
  dia: string;
  hora: string;
  items: ItemCompra[];
  total: number;
  metodoPago: string;
  estado: string;
}

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink, NgIf, NgFor, FormsModule, CurrencyPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  authService = inject(AuthService);
  private inventarioService = inject(InventarioService);
  private ventaService = inject(VentaService);

  productos = signal<Inventario[]>([]);
  carrito = signal<ItemCompra[]>([]);

  loading = signal(false);
  error = signal<string | null>(null);
  mensaje = signal<string | null>(null);

  compraPendiente = signal<CompraPendiente | null>(null);
  metodoPago = signal<string>('');
  boleta = signal<BoletaCompra | null>(null);

  cantidades: Record<number, number> = {};

  ngOnInit(): void {
    if (this.esComprador()) {
      this.cargarProductos();
    }
  }

  esComprador(): boolean {
    return this.authService.rol() === 'USUARIO';
  }

  esAdminOVendedor(): boolean {
    const rol = this.authService.rol();
    return rol === 'ADMIN' || rol === 'VENDEDOR';
  }

  cargarProductos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.inventarioService.getAll(0, 100).subscribe({
      next: (response) => {
        const data = Array.isArray(response)
          ? response
          : response.content ?? [];

        const disponibles = data.filter(producto => producto.stock > 0);

        this.productos.set(disponibles);

        disponibles.forEach(producto => {
          if (producto.id && !this.cantidades[producto.id]) {
            this.cantidades[producto.id] = 1;
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error.set('No se pudieron cargar los productos disponibles.');
      },
      complete: () => this.loading.set(false),
    });
  }

  comprar(producto: Inventario): void {
    this.error.set(null);
    this.mensaje.set(null);
    this.boleta.set(null);

    const item = this.crearItemCompra(producto);

    if (!item) {
      return;
    }

    this.compraPendiente.set({
      items: [item],
      total: item.subtotal,
      origen: 'directa',
    });

    this.metodoPago.set('');

    setTimeout(() => {
      document
        .getElementById('seccionPago')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  agregarAlCarrito(producto: Inventario): void {
    this.error.set(null);
    this.mensaje.set(null);
    this.boleta.set(null);

    const item = this.crearItemCompra(producto);

    if (!item) {
      return;
    }

    const carritoActual = this.carrito();
    const existe = carritoActual.find(i => i.idProducto === item.idProducto);

    if (existe) {
      const nuevaCantidad = existe.cantidad + item.cantidad;

      if (nuevaCantidad > item.stockDisponible) {
        this.error.set('No puedes agregar más unidades que el stock disponible.');
        return;
      }

      const actualizado = carritoActual.map(i => {
        if (i.idProducto === item.idProducto) {
          return {
            ...i,
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * i.precioUnitario,
          };
        }

        return i;
      });

      this.carrito.set(actualizado);
    } else {
      this.carrito.set([...carritoActual, item]);
    }

    this.mensaje.set('Producto agregado al carrito.');
  }

  crearItemCompra(producto: Inventario): ItemCompra | null {
    if (!producto.id) {
      this.error.set('Producto inválido.');
      return null;
    }

    const cantidad = Number(this.cantidades[producto.id]);

    if (!cantidad || cantidad <= 0) {
      this.error.set('La cantidad debe ser mayor a 0.');
      return null;
    }

    if (cantidad > producto.stock) {
      this.error.set('No hay suficiente stock para este producto.');
      return null;
    }

    return {
      idProducto: producto.id,
      producto: producto,
      nombre: producto.producto,
      categoria: this.nombreCategoria(producto),
      cantidad: cantidad,
      precioUnitario: producto.precio,
      subtotal: cantidad * producto.precio,
      stockDisponible: producto.stock,
    };
  }

  actualizarCantidadCarrito(item: ItemCompra, nuevaCantidad: number): void {
    let cantidad = Number(nuevaCantidad);

    if (!cantidad || cantidad <= 0) {
      cantidad = 1;
    }

    if (cantidad > item.stockDisponible) {
      cantidad = item.stockDisponible;
    }

    const actualizado = this.carrito().map(i => {
      if (i.idProducto === item.idProducto) {
        return {
          ...i,
          cantidad: cantidad,
          subtotal: cantidad * i.precioUnitario,
        };
      }

      return i;
    });

    this.carrito.set(actualizado);
  }

  quitarDelCarrito(idProducto: number): void {
    const actualizado = this.carrito().filter(item => item.idProducto !== idProducto);
    this.carrito.set(actualizado);
  }

  vaciarCarrito(): void {
    this.carrito.set([]);
  }

  totalCarrito(): number {
    return this.carrito().reduce((total, item) => total + item.subtotal, 0);
  }

  comprarCarrito(): void {
    this.error.set(null);
    this.mensaje.set(null);
    this.boleta.set(null);

    if (this.carrito().length === 0) {
      this.error.set('El carrito está vacío.');
      return;
    }

    this.compraPendiente.set({
      items: this.carrito(),
      total: this.totalCarrito(),
      origen: 'carrito',
    });

    this.metodoPago.set('');

    setTimeout(() => {
      document
        .getElementById('seccionPago')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  seleccionarMetodoPago(metodo: string): void {
    this.metodoPago.set(metodo);
  }

  pagar(): void {
  this.error.set(null);
  this.mensaje.set(null);

  const compra = this.compraPendiente();

  if (!compra) {
    this.error.set('No hay una compra pendiente.');
    return;
  }

  if (!this.metodoPago()) {
    this.error.set('Selecciona un método de pago.');
    return;
  }

  const idUsuario = this.authService.userId();

  if (!idUsuario) {
    this.error.set('No se encontró el usuario logueado.');
    return;
  }

  const fecha = this.fechaActualBackend();

  const ventas = compra.items.map(item => {
    return {
      fecha: fecha,
      cantidad: item.cantidad,
      idUsuario: idUsuario,
      idInventario: item.idProducto,
    };
  });

  from(ventas)
    .pipe(
      concatMap(venta => this.ventaService.create(venta)),
      toArray()
    )
    .subscribe({
      next: (ventasCreadas: any[]) => {
        this.generarBoleta(compra, ventasCreadas, this.metodoPago());

        this.mensaje.set('Pago realizado correctamente.');
        this.compraPendiente.set(null);
        this.metodoPago.set('');

        if (compra.origen === 'carrito') {
          this.vaciarCarrito();
        }

        this.cargarProductos();

        setTimeout(() => {
          document
            .getElementById('boletaCompra')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      },
      error: (err) => {
        console.error('Error al pagar carrito:', err);

        if (err.status === 403) {
          this.error.set('No tienes permisos para registrar la compra.');
        } else if (err.status === 401) {
          this.error.set('Tu sesión expiró. Vuelve a iniciar sesión.');
        } else if (err.status === 500) {
          this.error.set('Error interno del backend al registrar la compra.');
        } else {
          this.error.set('No se pudo realizar el pago.');
        }
      },
    });
}

  cancelarPago(): void {
    this.compraPendiente.set(null);
    this.metodoPago.set('');
  }

  generarBoleta(
    compra: CompraPendiente,
    ventasCreadas: any[],
    metodoPago: string
  ): void {
    const ahora = new Date();

    const primeraVenta = ventasCreadas.length > 0 ? ventasCreadas[0] : null;

    const boleta: BoletaCompra = {
      numero: primeraVenta?.id
        ? `B-${primeraVenta.id.toString().padStart(6, '0')}`
        : `B-${Date.now()}`,

      cliente: this.authService.userName() || 'Cliente',

      fecha: ahora.toLocaleDateString('es-PE'),

      dia: ahora.toLocaleDateString('es-PE', {
        weekday: 'long',
      }),

      hora: ahora.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),

      items: compra.items,

      total: compra.total,

      metodoPago: metodoPago,

      estado: compra.origen === 'carrito'
        ? 'Carrito pagado'
        : 'Pago registrado',
    };

    this.boleta.set(boleta);
  }

  cerrarBoleta(): void {
    this.boleta.set(null);
  }

  imprimirBoleta(): void {
    window.print();
  }

  fechaActualBackend(): string {
    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  nombreCategoria(producto: Inventario): string {
    const item = producto as any;

    return item.categoria?.nombre
      ?? item.categoria?.name
      ?? item.categoria?.categoria
      ?? 'Sin categoría';
  }
}