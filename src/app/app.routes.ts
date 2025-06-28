import { Routes } from '@angular/router';
import { ZoneComponent } from './pages/zone/zone';
import { DeliveryComponent } from './pages/delivery/delivery';
import { LoginComponent } from './pages/login/login';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: LoginComponent },
  { path: 'zones', component: ZoneComponent, canActivate: [AuthGuard] },
  { path: 'deliveries', component: DeliveryComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];
