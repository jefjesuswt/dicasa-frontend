import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PropertiesComponent } from './pages/properties/properties.component';
import { PropertyDetailsComponent } from './pages/property-details/property-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'properties', component: PropertiesComponent },
  { path: 'properties/:id', component: PropertyDetailsComponent },
  { path: '**', redirectTo: '' }
];
