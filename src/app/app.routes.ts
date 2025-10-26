import { Routes } from '@angular/router';
import { authGuard, adminGuard, unauthGuard } from './guards/auth.guards';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    pathMatch: 'full' 
  },
  { 
    path: 'properties', 
    loadChildren: () => import('./pages/properties/properties.routes').then(m => m.PROPERTIES_ROUTES)
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [unauthGuard]
  },
  { 
    path: 'profile', 
    loadChildren: () => import('./pages/profile/profile.routes').then(m => m.PROFILE_ROUTES),
    canActivate: [authGuard]
  },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [authGuard, adminGuard],
    data: { preload: false }
  },
{ path: '**', redirectTo: '' }
];