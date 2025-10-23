import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ScrollTopService } from './services/scroll-top.service';
import { ScreenLoaderComponent } from './shared/screen-loader/screen-loader.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ScreenLoaderComponent],
  template: `

    @if (isLoadingRoute()) {
      <shared-screen-loader />
    }
    <div class="min-h-screen flex flex-col">
      <app-header></app-header>
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [],
})
export class AppComponent implements OnInit {

  private scrollTopService = inject(ScrollTopService)
  private router = inject(Router)

  public isLoadingRoute = signal(false);

  constructor() {
    
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
        
        setTimeout(() => this.isLoadingRoute.set(false), 200); // 200ms
      }
    });
  }

  ngOnInit() {
    this.scrollTopService.enable();
  }
}
