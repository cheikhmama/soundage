import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  private auth = inject(AuthService);
  sidebarOpen = signal(true);

  readonly user = this.auth.user;
  readonly isAdmin = () => this.user()?.role === 'ADMIN';

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  /** Close sidebar (e.g. after nav click on mobile). */
  closeSidebarOnNav(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
