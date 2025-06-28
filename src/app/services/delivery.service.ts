import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { Delivery, CreateDeliveryRequest, DeliverySearchByProximity, DeliverySearchByZone } from '../models/delivery.model';
import { environment } from '../config/env';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private apiUrl = `${environment.apiUrl}/deliveries`;
  
  // Datos de prueba para desarrollo
  private mockDeliveries: Delivery[] = [
    {
      id: 1,
      radioKm: 12,
      latitud: -34.603722,
      longitud: -58.381592,
      ubicacion: 'Villa María',
      estado: 'Activo',
      zonas: ['Zona Centro', 'Zona Norte'],
      fechaCreacion: new Date('2024-01-15')
    },
    {
      id: 2,
      radioKm: 8,
      latitud: -34.543722,
      longitud: -58.471592,
      ubicacion: 'Palermo',
      estado: 'Disponible',
      zonas: ['Zona Norte'],
      fechaCreacion: new Date('2024-02-01')
    },
    {
      id: 3,
      radioKm: 15,
      latitud: -34.703722,
      longitud: -58.291592,
      ubicacion: 'Belgrano',
      estado: 'Ocupado',
      zonas: ['Zona Sur', 'Zona Costanera'],
      fechaCreacion: new Date('2024-01-20')
    },
    {
      id: 4,
      radioKm: 10,
      latitud: -34.623722,
      longitud: -58.391592,
      ubicacion: 'Recoleta',
      estado: 'Inactivo',
      zonas: ['Zona Centro'],
      fechaCreacion: new Date('2024-02-10')
    }
  ];
  private nextId = 5;

  // Zonas disponibles (debería venir del ZoneService en una app real)
  private availableZones = [
    'Zona Centro',
    'Zona Norte', 
    'Zona Sur',
    'Zona Costanera',
    'Zona Exterior'
  ];

  constructor() {}

  async getAllDeliveries(page: number = 1, pageSize: number = 10): Promise<{deliveries: Delivery[], total: number, currentPage: number, totalPages: number}> {
    try {
      await this.delay(800);
      
      if (!environment.production) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedDeliveries = this.mockDeliveries.slice(startIndex, endIndex);
        
        return {
          deliveries: paginatedDeliveries,
          total: this.mockDeliveries.length,
          currentPage: page,
          totalPages: Math.ceil(this.mockDeliveries.length / pageSize)
        };
      }
      
      const response: AxiosResponse<any> = await axios.get(`${this.apiUrl}?page=${page}&limit=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      throw error;
    }
  }

  async getDeliveryById(id: number): Promise<Delivery> {
    try {
      await this.delay(500);
      
      if (!environment.production) {
        const delivery = this.mockDeliveries.find(d => d.id === id);
        if (!delivery) {
          throw new Error('Delivery not found');
        }
        return { ...delivery };
      }
      
      const response: AxiosResponse<Delivery> = await axios.get(`${this.apiUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery:', error);
      throw error;
    }
  }

  async createDelivery(delivery: CreateDeliveryRequest): Promise<Delivery> {
    try {
      await this.delay(1000);
      
      if (!environment.production) {
        const newDelivery: Delivery = {
          id: this.nextId++,
          ...delivery,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        };
        this.mockDeliveries.push(newDelivery);
        return { ...newDelivery };
      }
      
      const response: AxiosResponse<Delivery> = await axios.post(this.apiUrl, delivery);
      return response.data;
    } catch (error) {
      console.error('Error creating delivery:', error);
      throw error;
    }
  }

  async updateDelivery(id: number, delivery: CreateDeliveryRequest): Promise<Delivery> {
    try {
      await this.delay(1000);
      
      if (!environment.production) {
        const index = this.mockDeliveries.findIndex(d => d.id === id);
        if (index === -1) {
          throw new Error('Delivery not found');
        }
        
        const updatedDelivery: Delivery = {
          ...this.mockDeliveries[index],
          ...delivery,
          fechaActualizacion: new Date()
        };
        this.mockDeliveries[index] = updatedDelivery;
        return { ...updatedDelivery };
      }
      
      const response: AxiosResponse<Delivery> = await axios.put(`${this.apiUrl}/${id}`, delivery);
      return response.data;
    } catch (error) {
      console.error('Error updating delivery:', error);
      throw error;
    }
  }

  async deleteDelivery(id: number): Promise<void> {
    try {
      await this.delay(800);
      
      if (!environment.production) {
        const index = this.mockDeliveries.findIndex(d => d.id === id);
        if (index === -1) {
          throw new Error('Delivery not found');
        }
        this.mockDeliveries.splice(index, 1);
        return;
      }
      
      await axios.delete(`${this.apiUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting delivery:', error);
      throw error;
    }
  }

  async searchDeliveriesByProximity(searchParams: DeliverySearchByProximity): Promise<Delivery[]> {
    try {
      await this.delay(1000);
      
      if (!environment.production) {
        // Simulamos búsqueda por proximidad usando distancia euclidiana simple
        const filteredDeliveries = this.mockDeliveries.filter(delivery => {
          const distance = this.calculateDistance(
            searchParams.latitud, searchParams.longitud,
            delivery.latitud, delivery.longitud
          );
          return distance <= searchParams.radioKm;
        });
        return [...filteredDeliveries];
      }
      
      const response: AxiosResponse<Delivery[]> = await axios.post(`${this.apiUrl}/search/proximity`, searchParams);
      return response.data;
    } catch (error) {
      console.error('Error searching deliveries by proximity:', error);
      throw error;
    }
  }

  async searchDeliveriesByZone(searchParams: DeliverySearchByZone): Promise<Delivery[]> {
    try {
      await this.delay(800);
      
      if (!environment.production) {
        const filteredDeliveries = this.mockDeliveries.filter(delivery => 
          delivery.zonas.includes(searchParams.zonaSeleccionada)
        );
        return [...filteredDeliveries];
      }
      
      const response: AxiosResponse<Delivery[]> = await axios.post(`${this.apiUrl}/search/zone`, searchParams);
      return response.data;
    } catch (error) {
      console.error('Error searching deliveries by zone:', error);
      throw error;
    }
  }

  getAvailableZones(): string[] {
    return [...this.availableZones];
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
