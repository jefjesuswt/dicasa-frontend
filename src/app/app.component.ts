import { Component, inject, OnInit, signal } from "@angular/core";
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  RouterOutlet,
} from "@angular/router";
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { ScrollTopService } from "./services/scroll-top.service";
import { ScreenLoaderComponent } from "./shared/screen-loader/screen-loader.component";
import { AuthService } from "./services/auth.service";
import { AuthStatus } from "./enums/auth-status.enum";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ScreenLoaderComponent,
  ],
  template: `
    <!-- Condición simplificada para el loader -->
    @if (authService.authStatus() === AuthStatus.checking) {
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

  public AuthStatus = AuthStatus;

  constructor() {}

  ngOnInit() {
    this.scrollTopService.enable();
  }
}
