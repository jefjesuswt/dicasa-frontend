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
    { path: '/', label: 'Inicio', exact: true },
    { path: '/properties', label: 'Propiedades', exact: false },
    { path: '/contact', label: 'Contacto', exact: false }
  ];

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  getIconForRoute(path: string): string {
    const iconMap: {[key: string]: string} = {
      '/': 'home',
      '/properties': 'book',
      '/contact': 'envelope'
    };
    return iconMap[path] || 'circle';
  }
}
