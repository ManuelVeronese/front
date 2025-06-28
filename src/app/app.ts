import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'front';
  protected showHeader = false;
  protected currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Update header visibility based on route and authentication
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateHeaderVisibility();
    });

    // Subscribe to auth state changes
    this.authService.currentUser.subscribe((user: any) => {
      this.currentUser = user;
      this.updateHeaderVisibility();
    });

    // Initial check
    this.updateHeaderVisibility();
  }

  private updateHeaderVisibility() {
    const currentRoute = this.router.url;
    const isAuthenticated = this.authService.isAuthenticated();
    const isAuthRoute = currentRoute === '/login' || currentRoute === '/register';
    
    this.showHeader = isAuthenticated && !isAuthRoute;
  }

  protected logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
