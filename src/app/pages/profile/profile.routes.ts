import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      { 
        path: 'my-info', 
        loadComponent: () => import('./my-info/my-info.component').then(m => m.MyInfoComponent) 
      },
      { 
        path: 'my-schedules', 
        loadComponent: () => import('./my-schedules/my-schedules.component').then(m => m.MySchedulesComponent) 
      },
      { 
        path: '', 
        redirectTo: 'my-info', 
        pathMatch: 'full' 
      }
    ]
  }
];