import { Component, inject, OnInit, signal } from '@angular/core'; 
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ScrollTopService } from './services/scroll-top.service';
import { ScreenLoaderComponent } from './shared/screen-loader/screen-loader.component';
import { filter } from 'rxjs';
import { AuthService } from './services/auth.service';
import { AuthStatus } from './enums/auth-status.enum';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, ScreenLoaderComponent], 
  template: `
    <!-- Condición simplificada para el loader -->
    @if (authService.authStatus() === AuthStatus.checking || isLoadingRoute()) {
      <shared-screen-loader />
    }

    <!-- Muestra el contenido principal solo cuando la comprobación ha terminado -->
    @if (authService.authStatus() !== AuthStatus.checking) {
      <div class="min-h-screen flex flex-col">
        <app-header></app-header>
        <main class="flex-1">
          <router-outlet></router-outlet>
        </main>
        <app-footer></app-footer>
      </div>
    }
  `,
  styles: [],
})
export class AppComponent implements OnInit {

  //SERVICES
  public authService = inject(AuthService); 
  private scrollTopService = inject(ScrollTopService);
  private router = inject(Router);

  public isLoadingRoute = signal(false);
  public AuthStatus = AuthStatus; 

  constructor() {
    // Suscripción a eventos del router (ESTO ESTÁ BIEN)
    this.router.events.pipe(
      filter(event =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoadingRoute.set(true);
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Usa un timeout más corto si prefieres
        setTimeout(() => this.isLoadingRoute.set(false), 250); 
      }
    });
  }

  ngOnInit() {
    this.scrollTopService.enable();
    // La llamada a checkAuthStatus() ya está en el constructor del AuthService
  }
}
