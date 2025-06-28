import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { Zone, CreateZoneRequest } from '../models/zone.model';
import { environment } from '../config/env';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private apiUrl = `${environment.apiUrl}/zones`;
  
  // Datos de prueba para desarrollo (eliminar cuando tengas backend)
  private mockZones: Zone[] = [
    {
      id: 1,
      nombre: 'Centro de la Ciudad',
      estado: 'Activo',
      latitud: -34.603722,
      longitud: -58.381592,
      radioKm: 5.0,
      fechaCreacion: new Date('2024-01-15')
    },
    {
      id: 2,
      nombre: 'Zona Norte',
      estado: 'Activo',
      latitud: -34.543722,
      longitud: -58.471592,
      radioKm: 7.5,
      fechaCreacion: new Date('2024-02-01')
    },
    {
      id: 3,
      nombre: 'Zona Sur',
      estado: 'Inactivo',
      latitud: -34.703722,
      longitud: -58.291592,
      radioKm: 6.0,
      fechaCreacion: new Date('2024-01-20')
    }
  ];
  private nextId = 4;

  constructor() {}

  async getAllZones(): Promise<Zone[]> {
    try {
      // Simulando una llamada a API con delay
      await this.delay(800);
      
      // En desarrollo, usa datos mock
      if (!environment.production) {
        return [...this.mockZones];
      }
      
      // En producción, usa la API real
      const response: AxiosResponse<Zone[]> = await axios.get(this.apiUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw error;
    }
  }

  async getZoneById(id: number): Promise<Zone> {
    try {
      await this.delay(500);
      
      if (!environment.production) {
        const zone = this.mockZones.find(z => z.id === id);
        if (!zone) {
          throw new Error('Zone not found');
        }
        return { ...zone };
      }
      
      const response: AxiosResponse<Zone> = await axios.get(`${this.apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching zone:', error);
      throw error;
    }
  }

  async createZone(zone: CreateZoneRequest): Promise<Zone> {
    try {
      await this.delay(1000);
      
      if (!environment.production) {
        const newZone: Zone = {
          id: this.nextId++,
          ...zone,
          fechaCreacion: new Date()
        };
        this.mockZones.push(newZone);
        return { ...newZone };
      }
      
      const response: AxiosResponse<Zone> = await axios.post(this.apiUrl, zone);
      return response.data;
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  }

  async updateZone(id: number, zone: CreateZoneRequest): Promise<Zone> {
    try {
      await this.delay(1000);
      
      if (!environment.production) {
        const index = this.mockZones.findIndex(z => z.id === id);
        if (index === -1) {
          throw new Error('Zone not found');
        }
        
        const updatedZone: Zone = {
          ...this.mockZones[index],
          ...zone
        };
        this.mockZones[index] = updatedZone;
        return { ...updatedZone };
      }
      
      const response: AxiosResponse<Zone> = await axios.put(`${this.apiUrl}/${id}`, zone);
      return response.data;
    } catch (error) {
      console.error('Error updating zone:', error);
      throw error;
    }
  }

  async deleteZone(id: number): Promise<void> {
    try {
      await this.delay(800);
      
      if (!environment.production) {
        const index = this.mockZones.findIndex(z => z.id === id);
        if (index === -1) {
          throw new Error('Zone not found');
        }
        this.mockZones.splice(index, 1);
        return;
      }
      
      await axios.delete(`${this.apiUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
