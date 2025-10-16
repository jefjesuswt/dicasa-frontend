import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PropertiesComponent } from './pages/properties/properties.component';
import { PropertyDetailsComponent } from './pages/property-details/property-details.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'properties', component: PropertiesComponent },
  { path: 'properties/:id', component: PropertyDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    // canActivate: [AuthGuard] 
  },
  
  // Fallback route - must be the last one
  { path: '**', redirectTo: '' }
];
