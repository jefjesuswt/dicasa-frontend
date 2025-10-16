import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  isMenuOpen = false;
  
  navLinks: NavLink[] = [
    { path: '/properties', label: 'Propiedades', exact: false },
    { path: '/contact', label: 'Contacto', exact: false },
    { path: '/login', label: 'Iniciar sesión', exact: false }
  ];

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  getIconForRoute(path: string): string {
    const iconMap: {[key: string]: string} = {
      '/': 'home',
      '/properties': 'home',
      '/contact': 'envelope',
      '/login': 'user'
    };
    return iconMap[path] || 'link';
  }
}
