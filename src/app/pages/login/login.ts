import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  currentView: 'login' | 'register' = 'login';
  isLoading = false;
  errorMessage = '';

  loginForm: LoginRequest = {
    email: '',
    password: ''
  };

  registerForm = {
    nombre: '',
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/zones']);
    }
  }

  ngOnInit() {
    // Determinar vista basada en la ruta
    const currentRoute = this.router.url;
    this.currentView = currentRoute === '/register' ? 'register' : 'login';
  }

  async onLogin() {
    if (!this.isLoginFormValid()) {
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      await this.authService.login(this.loginForm);
      this.router.navigate(['/zones']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al iniciar sesión';
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onRegister() {
    if (!this.isRegisterFormValid()) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente';
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      await this.authService.register(this.registerForm);
      this.router.navigate(['/zones']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al registrarse';
      console.error('Register error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  switchToRegister() {
    this.router.navigate(['/register']);
    this.currentView = 'register';
    this.clearForms();
    this.errorMessage = '';
  }

  switchToLogin() {
    this.router.navigate(['/login']);
    this.currentView = 'login';
    this.clearForms();
    this.errorMessage = '';
  }

  private isLoginFormValid(): boolean {
    return !!(
      this.loginForm.email.trim() &&
      this.loginForm.password.trim() &&
      this.isValidEmail(this.loginForm.email)
    );
  }

  private isRegisterFormValid(): boolean {
    return !!(
      this.registerForm.nombre.trim() &&
      this.registerForm.email.trim() &&
      this.registerForm.password.trim() &&
      this.isValidEmail(this.registerForm.email) &&
      this.registerForm.password.length >= 6
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private clearForms() {
    this.loginForm = { email: '', password: '' };
    this.registerForm = { nombre: '', email: '', password: '' };
  }

  // Función para mostrar credenciales de demo
  fillDemoCredentials() {
    this.loginForm.email = 'admin@delytrack.com';
    this.loginForm.password = '123456';
  }
}
