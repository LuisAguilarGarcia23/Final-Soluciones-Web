import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { Inventario } from '../../../models/inventario.model';
import { Categoria } from '../../../models/categoria.model';
import { InventarioService } from '../../../services/inventario.service';
import { CategoriaService } from '../../../services/categoria.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-inventario',
  imports: [ReactiveFormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class InventarioPage implements OnInit {

  private inventarioService = inject(InventarioService);
  private categoriaService = inject(CategoriaService);
  private auth = inject(AuthService);
  private fb = inject(NonNullableFormBuilder);

  productos = signal<Inventario[]>([]);
  categorias = signal<Categoria[]>([]);
  editId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  page = signal(0);
  totalPages = signal(0);
  busqueda = signal('');

  canWrite = computed(() => this.auth.hasRole(['ADMIN', 'VENDEDOR']));
  canDelete = computed(() => this.auth.rol() === 'ADMIN');

  searchForm = this.fb.group({
    producto: [''],
  });

  form = this.fb.group({
    producto: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    stock: [0, [Validators.required, Validators.min(0)]],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    idCategoria: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    this.loadCategorias();
    this.loadProductos();
  }

  loadCategorias() {
    this.categoriaService.getAll().subscribe({
      next: (data) => this.categorias.set(data),
      error: () => this.error.set('No se pudieron cargar las categorías.'),
    });
  }

  loadProductos(page = 0) {
  this.loading.set(true);
  this.error.set(null);
  this.page.set(page);

  const texto = this.busqueda().trim();

  const request = texto
    ? this.inventarioService.buscar(texto, page, 10)
    : this.inventarioService.getAll(page, 10);

  request.subscribe({
    next: (response: any) => {
      console.log('Respuesta inventario:', response);

      if (Array.isArray(response)) {
        this.productos.set(response);
        this.totalPages.set(1);
      } else {
        this.productos.set(response.content ?? []);
        this.totalPages.set(response.totalPages ?? 1);
      }
    },
    error: (err) => {
      console.error('Error inventario:', err);

      if (err.status === 401) {
        this.error.set('No autorizado. Cierra sesión e inicia sesión otra vez.');
      } else if (err.status === 403) {
        this.error.set('No tienes permisos para ver el inventario.');
      } else if (err.status === 0) {
        this.error.set('No hay conexión con el backend. Revisa si Spring Boot está ejecutándose.');
      } else if (err.status === 500) {
        this.error.set('Error interno en el backend al cargar inventario.');
      } else {
        this.error.set('No se pudo cargar el inventario.');
      }
    },
    complete: () => this.loading.set(false),
  });
}

  buscar() {
    this.busqueda.set(this.searchForm.controls.producto.value);
    this.loadProductos(0);
  }

  limpiarBusqueda() {
    this.searchForm.reset({ producto: '' });
    this.busqueda.set('');
    this.loadProductos(0);
  }

  guardar() {
    if (!this.canWrite()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.getRawValue();
    const id = this.editId();

    const request = id
      ? this.inventarioService.update(id, data)
      : this.inventarioService.create(data);

    request.subscribe({
      next: () => {
        this.success.set(id ? 'Producto actualizado.' : 'Producto registrado.');
        this.cancelarEdicion();
        this.loadProductos(this.page());
      },
      error: () => this.error.set('No se pudo guardar el producto.'),
    });
  }

  editar(producto: Inventario) {
    if (!this.canWrite()) {
      return;
    }

    this.editId.set(producto.id);
    this.form.setValue({
      producto: producto.producto,
      descripcion: producto.descripcion ?? '',
      stock: producto.stock,
      precio: producto.precio,
      idCategoria: producto.categoria?.id ?? 0,
    });
  }

  cancelarEdicion() {
    this.editId.set(null);
    this.form.reset({
      producto: '',
      descripcion: '',
      stock: 0,
      precio: 0,
      idCategoria: 0,
    });
  }

  eliminar(id: number) {
    if (!this.canDelete()) {
      return;
    }

    if (!confirm('¿Deseas eliminar este producto?')) {
      return;
    }

    this.inventarioService.delete(id).subscribe({
      next: () => this.loadProductos(this.page()),
      error: () => this.error.set('No se pudo eliminar el producto.'),
    });
  }

  paginaAnterior() {
    if (this.page() > 0) {
      this.loadProductos(this.page() - 1);
    }
  }

  paginaSiguiente() {
    if (this.page() + 1 < this.totalPages()) {
      this.loadProductos(this.page() + 1);
    }
  }
}
