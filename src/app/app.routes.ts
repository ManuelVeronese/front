import { Routes } from '@angular/router';
import { ZoneComponent } from './pages/zone/zone';

export const routes: Routes = [
  { path: '', redirectTo: '/zones', pathMatch: 'full' },
  { path: 'zones', component: ZoneComponent },
  { path: '**', redirectTo: '/zones' }
];
