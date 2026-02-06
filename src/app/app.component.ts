import { Component, inject, OnInit, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  RouterOutlet,
} from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ScrollTopService } from './services/scroll-top.service';
import { ScreenLoaderComponent } from './shared/screen-loader/screen-loader.component';
import { AuthService } from './services/auth.service';
import { AuthStatus } from './enums/auth-status.enum';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';
import { ComparisonWidgetComponent } from './shared/comparison-widget/comparison-widget.component';
import { AnalyticsService } from './services/analytics.service';
import Fingerprint from 'fingerprinter-js';
import { v4 as uuidv4 } from 'uuid';
import { afterNextRender, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ScreenLoaderComponent,
    ToastComponent,
    ComparisonWidgetComponent,
  ],
  template: `
    <app-toast />
    <shared-comparison-widget />

    @if (authService.authStatus() === AuthStatus.checking) {
    <shared-screen-loader />
    } @if (authService.authStatus() !== AuthStatus.checking) {
    <div
      class="min-h-screen flex flex-col bg-[var(--bg-dark)] transition-colors duration-200"
    >
      <app-header></app-header>

      <main class="flex-1 relative">
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

  // ... imports
  private analyticsService = inject(AnalyticsService);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
      this.initializeAnalytics();
    });
  }

  ngOnInit() {
    this.scrollTopService.enable();
  }

  private async getStableFingerprint(): Promise<string> {
    const storageKey = 'dicasa-fingerprint';
    let fp = localStorage.getItem(storageKey);

    if (fp) {
      return fp;
    }

    const { fingerprint } = await Fingerprint.generate();
    localStorage.setItem(storageKey, fingerprint);
    return fingerprint;
  }

  private async initializeAnalytics(): Promise<void> {
    try {
      const fingerprint = await this.getStableFingerprint();

      // Intentar recuperar sesión existente
      let sessionId = sessionStorage.getItem('analyticsSessionId');

      if (sessionId) {
        this.analyticsService.startHeartbeatLoop(sessionId);
      } else {
        sessionId = uuidv4();
        sessionStorage.setItem('analyticsSessionId', sessionId);

        this.analyticsService
          .startSession({ sessionId, fingerprint })
          .subscribe({
            next: () => {
              if (!sessionId) return;
              this.analyticsService.startHeartbeatLoop(sessionId);
            },
            error: (err) => console.error('Failed to create session', err),
          });
      }

      // Opcional: Loguear visita inicial a la app (o hacerlo via Router Events para más precisión)
      const path = window.location.pathname;
      this.analyticsService.logVisit({ fingerprint, path }).subscribe();
    } catch (error) {
      console.error('Error during analytics initialization:', error);
    }
  }
}
