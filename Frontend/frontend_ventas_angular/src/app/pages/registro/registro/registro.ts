import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegistroRequest } from '../../../models/auth.model';

@Component({
  standalone: true,
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {

  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rol: ['USUARIO', [Validators.required]],
  });

  registrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const data = this.form.getRawValue() as RegistroRequest;

    this.auth.registro(data).subscribe({
      next: () => {
        this.success.set('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
        setTimeout(() => this.router.navigate(['/login']), 900);
      },
      error: () => {
        this.error.set('No se pudo registrar. Verifica si el correo ya existe.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
