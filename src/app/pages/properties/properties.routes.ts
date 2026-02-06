import { Routes } from '@angular/router';

export const PROPERTIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./properties/properties.component').then(
        (m) => m.PropertiesComponent
      ),
  },
  {
    path: 'compare',
    loadComponent: () =>
      import('./comparison/comparison.component').then(
        (m) => m.ComparisonComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./property-details/property-details.component').then(
        (m) => m.PropertyDetailsComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
