import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { Categoria } from '../../../models/categoria.model';
import { CategoriaService } from '../../../services/categoria.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-categorias',
  imports: [ReactiveFormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class Categorias implements OnInit {

  private service = inject(CategoriaService);
  private auth = inject(AuthService);
  private fb = inject(NonNullableFormBuilder);

  categorias = signal<Categoria[]>([]);
  editId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  rol = this.auth.rol;
  canWrite = computed(() => this.auth.hasRole(['ADMIN', 'VENDEDOR']));
  canDelete = computed(() => this.rol() === 'ADMIN');

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
  });

  ngOnInit() {
    this.loadCategorias();
  }

  loadCategorias() {
    this.loading.set(true);
    this.error.set(null);

    this.service.getAll().subscribe({
      next: (data) => this.categorias.set(data),
      error: () => this.error.set('No se pudieron cargar las categorías.'),
      complete: () => this.loading.set(false),
    });
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
      ? this.service.update(id, data)
      : this.service.create(data);

    request.subscribe({
      next: () => {
        this.success.set(id ? 'Categoría actualizada.' : 'Categoría registrada.');
        this.cancelarEdicion();
        this.loadCategorias();
      },
      error: () => this.error.set('No se pudo guardar la categoría.'),
    });
  }

  editar(categoria: Categoria) {
    if (!this.canWrite()) {
      return;
    }

    this.editId.set(categoria.id);
    this.form.setValue({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? '',
    });
  }

  cancelarEdicion() {
    this.editId.set(null);
    this.form.reset({
      nombre: '',
      descripcion: '',
    });
  }

  eliminar(id: number) {
    if (!this.canDelete()) {
      return;
    }

    if (!confirm('¿Deseas eliminar esta categoría?')) {
      return;
    }

    this.service.delete(id).subscribe({
      next: () => this.loadCategorias(),
      error: () => this.error.set('No se pudo eliminar la categoría.'),
    });
  }
}
