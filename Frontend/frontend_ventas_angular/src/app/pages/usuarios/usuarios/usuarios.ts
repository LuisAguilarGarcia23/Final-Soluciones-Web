import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UsuarioService } from '../../../services/usuario.service';
import { Usuario, UsuarioRequest } from '../../../models/usuario.model';
import { Rol } from '../../../models/auth.model';

@Component({
  standalone: true,
  selector: 'app-usuarios',
  imports: [NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {

  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);

  usuarios = signal<Usuario[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  mensaje = signal<string | null>(null);

  form = this.fb.group({
    id: [null as number | null],
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rol: ['USUARIO' as Rol, Validators.required],
  });

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usuarioService.getAll().subscribe({
      next: (data) => {
        this.usuarios.set(data);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error.set('No se pudieron cargar los usuarios.');
      },
      complete: () => this.loading.set(false),
    });
  }

  guardar(): void {
    this.error.set(null);
    this.mensaje.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Revisa los campos del formulario.');
      return;
    }

    const data = this.form.getRawValue();

    const usuarioData: UsuarioRequest = {
      name: data.name!,
      email: data.email!,
      password: data.password!,
      rol: data.rol as Rol,
    };

    const request = data.id
      ? this.usuarioService.update(data.id, usuarioData)
      : this.usuarioService.create(usuarioData);

    request.subscribe({
      next: () => {
        this.mensaje.set(
          data.id
            ? 'Usuario actualizado correctamente.'
            : 'Usuario creado correctamente.'
        );

        this.resetForm();
        this.loadUsuarios();
      },
      error: (err) => {
        console.error('Error al guardar usuario:', err);

        if (err.status === 400) {
          this.error.set('Datos inválidos. Revisa la información ingresada.');
        } else if (err.status === 403) {
          this.error.set('No tienes permisos para gestionar usuarios.');
        } else if (err.status === 409) {
          this.error.set('El correo ya está registrado.');
        } else {
          this.error.set('No se pudo guardar el usuario.');
        }
      },
    });
  }

  editar(usuario: Usuario): void {
    this.error.set(null);
    this.mensaje.set(null);

    this.form.patchValue({
      id: usuario.id ?? null,
      name: usuario.name,
      email: usuario.email,
      password: '',
      rol: usuario.rol as Rol,
    });

    this.form.markAsUntouched();
  }

  eliminar(id?: number): void {
    if (!id) {
      this.error.set('Usuario inválido.');
      return;
    }

    const confirmar = confirm('¿Seguro que deseas eliminar este usuario?');

    if (!confirmar) {
      return;
    }

    this.error.set(null);
    this.mensaje.set(null);

    this.usuarioService.delete(id).subscribe({
      next: () => {
        this.mensaje.set('Usuario eliminado correctamente.');
        this.loadUsuarios();
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);

        if (err.status === 403) {
          this.error.set('No tienes permisos para eliminar usuarios.');
        } else {
          this.error.set('No se pudo eliminar el usuario.');
        }
      },
    });
  }

  resetForm(): void {
    this.form.reset({
      id: null,
      name: '',
      email: '',
      password: '',
      rol: 'USUARIO' as Rol,
    });

    this.form.markAsUntouched();
  }

  esEdicion(): boolean {
    return this.form.controls.id.value !== null;
  }

  rolBadgeClass(rol?: Rol | string): string {
    if (rol === 'ADMIN') {
      return 'badge bg-danger';
    }

    if (rol === 'VENDEDOR') {
      return 'badge bg-primary';
    }

    return 'badge bg-secondary';
  }
}