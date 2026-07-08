import { Component, computed, inject } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [RouterModule, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  private auth = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = this.auth.isAuthenticated;
  username = this.auth.userName;
  rol = this.auth.rol;

  isAdmin = computed(() => this.rol() === 'ADMIN');
  canManage = computed(() => this.auth.hasRole(['ADMIN', 'VENDEDOR']));

  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
