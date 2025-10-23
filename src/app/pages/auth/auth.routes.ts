import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'forgot-password', 
    loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  { 
    path: 'set-password', 
    loadComponent: () => import('./reset-password/set-password.component').then(m => m.SetPasswordComponent)
  },
  {
    path: 'verify-code',
    loadComponent: () => import('./verify-code/verify-code.component').then(m => m.VerifyCodeComponent)
  },
  { 
    path: 'check-email', 
    loadComponent: () => import('./check-email/check-email.component').then(m => m.CheckEmailComponent)
  },
  { 
    path: 'confirm-email', 
    loadComponent: () => import('./confirm-email/confirm-email.component').then(m => m.ConfirmEmailComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

export const AUTH_ROUTES = routes;
