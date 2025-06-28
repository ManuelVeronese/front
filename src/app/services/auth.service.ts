import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { environment } from '../config/env';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  // Usuarios de prueba para desarrollo
  private mockUsers: User[] = [
    {
      id: 1,
      nombre: 'Admin DelyTrack',
      email: 'admin@delytrack.com',
      fechaCreacion: new Date('2024-01-01')
    },
    {
      id: 2,
      nombre: 'Demo User',
      email: 'demo@delytrack.com',
      fechaCreacion: new Date('2024-01-15')
    }
  ];

  constructor() {
    const storedUser = localStorage.getItem('delytrack_user');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      await this.delay(1500); // Simular tiempo de respuesta del servidor

      if (!environment.production) {
        // Modo desarrollo - usar datos mock
        if (credentials.email === 'admin@delytrack.com' && credentials.password === '123456') {
          const user = this.mockUsers[0];
          const token = this.generateMockToken();
          const authResponse: AuthResponse = {
            user,
            token,
            expiresIn: 3600
          };

          // Guardar en localStorage
          localStorage.setItem('delytrack_user', JSON.stringify(user));
          localStorage.setItem('delytrack_token', token);
          
          this.currentUserSubject.next(user);
          return authResponse;
        } else if (credentials.email === 'demo@delytrack.com' && credentials.password === 'demo123') {
          const user = this.mockUsers[1];
          const token = this.generateMockToken();
          const authResponse: AuthResponse = {
            user,
            token,
            expiresIn: 3600
          };

          localStorage.setItem('delytrack_user', JSON.stringify(user));
          localStorage.setItem('delytrack_token', token);
          
          this.currentUserSubject.next(user);
          return authResponse;
        } else {
          throw new Error('Credenciales incorrectas');
        }
      }

      // Modo producción - usar API real
      const response: AxiosResponse<AuthResponse> = await axios.post(`${this.apiUrl}/login`, credentials);
      const authResponse = response.data;

      localStorage.setItem('delytrack_user', JSON.stringify(authResponse.user));
      localStorage.setItem('delytrack_token', authResponse.token);
      
      this.currentUserSubject.next(authResponse.user);
      return authResponse;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      await this.delay(2000);

      if (!environment.production) {
        // Verificar si el email ya existe
        const existingUser = this.mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          throw new Error('El email ya está registrado');
        }

        // Crear nuevo usuario
        const newUser: User = {
          id: this.mockUsers.length + 1,
          nombre: userData.nombre,
          email: userData.email,
          fechaCreacion: new Date()
        };

        this.mockUsers.push(newUser);
        const token = this.generateMockToken();
        
        const authResponse: AuthResponse = {
          user: newUser,
          token,
          expiresIn: 3600
        };

        localStorage.setItem('delytrack_user', JSON.stringify(newUser));
        localStorage.setItem('delytrack_token', token);
        
        this.currentUserSubject.next(newUser);
        return authResponse;
      }

      const response: AxiosResponse<AuthResponse> = await axios.post(`${this.apiUrl}/register`, userData);
      const authResponse = response.data;

      localStorage.setItem('delytrack_user', JSON.stringify(authResponse.user));
      localStorage.setItem('delytrack_token', authResponse.token);
      
      this.currentUserSubject.next(authResponse.user);
      return authResponse;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('delytrack_user');
    localStorage.removeItem('delytrack_token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue && !!localStorage.getItem('delytrack_token');
  }

  getToken(): string | null {
    return localStorage.getItem('delytrack_token');
  }

  private generateMockToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
