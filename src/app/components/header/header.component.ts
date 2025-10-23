import { Component, computed, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavLink {
  path: string;
  label: string;
  exact: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent {

  private authService = inject(AuthService);
  private router = inject(Router);
  private eRef = inject(ElementRef); 
 
  public user = computed(() => this.authService.currentUser());
  public isMenuOpen = false;
  public isProfileMenuOpen = false;
  
  public isPrivilegedUser = computed(() => {
    return this.authService.isAdmin() || this.authService.isSuperAdmin();
  });
  
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    // Si el menú de perfil está abierto Y el clic NO fue dentro de este componente
    if (this.isProfileMenuOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.isProfileMenuOpen = false;
    }
  }

  navLinks: NavLink[] = [
    { path: '/properties', label: 'Propiedades', exact: false },
    { path: '/contact', label: 'Contacto', exact: false },    
  ];

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen; 
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  getIconForRoute(path: string): string {
    const iconMap: {[key: string]: string} = {
      '/': 'home',
      '/properties': 'home',
      '/contact': 'envelope',
      '/auth/login': 'user',
      'logout': 'sign-out',
      '/dashboard': 'cog',
    };
    return iconMap[path] || 'link';
  }

  logout() {
    this.isProfileMenuOpen = false; 
    this.isMenuOpen = false; 
    this.authService.logout(); 
  }
}
