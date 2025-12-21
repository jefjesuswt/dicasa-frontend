import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { ThemeService } from "../../services/theme.service";
import { AvatarComponent } from "../../shared/avatar/avatar.component";

interface NavLink {
  path: string;
  label: string;
  exact: boolean;
}

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AvatarComponent],
  templateUrl: "./header.component.html",
  styles: [],
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private eRef = inject(ElementRef);
  public themeService = inject(ThemeService);

  public user = computed(() => this.authService.currentUser());
  public isMenuOpen = false;
  public isProfileMenuOpen = false;

  public isPrivilegedUser = computed(() => {
    return this.authService.isAdmin() || this.authService.isSuperAdmin();
  });

  public isDarkMode = computed(() => this.themeService.isDarkMode());

  navLinks: NavLink[] = [
    { path: '/', label: 'Inicio', exact: true },
    { path: "/properties", label: "Propiedades", exact: false },
    { path: "/contact", label: "Contacto", exact: false },
  ];

  @HostListener("document:click", ["$event"])
  clickOutside(event: Event) {
    if (
      this.isProfileMenuOpen &&
      !this.eRef.nativeElement.contains(event.target)
    ) {
      this.isProfileMenuOpen = false;
    }
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeMenusAndNavigate(path: string): void {
    this.isMenuOpen = false;
    this.isProfileMenuOpen = false;
    this.router.navigate([path]);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout() {
    this.isProfileMenuOpen = false;
    this.isMenuOpen = false;
    this.authService.logout();
  }
}
