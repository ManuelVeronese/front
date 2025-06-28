import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Zone, CreateZoneRequest } from '../../models/zone.model';
import { ZoneService } from '../../services/zone.service';

@Component({
  selector: 'app-zone',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './zone.html',
  styleUrl: './zone.css'
})
export class ZoneComponent implements OnInit {
  zones: Zone[] = [];
  currentView: 'list' | 'create' | 'edit' = 'list';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showModal = false;

  // Formulario para crear/editar zona
  zoneForm: CreateZoneRequest = {
    nombre: '',
    estado: 'Activo',
    latitud: 0,
    longitud: 0,
    radioKm: 1
  };

  editingZoneId: number | null = null;

  constructor(private zoneService: ZoneService) {}

  ngOnInit() {
    this.loadZones();
  }

  async loadZones() {
    try {
      this.isLoading = true;
      this.zones = await this.zoneService.getAllZones();
      this.clearMessages();
    } catch (error) {
      this.errorMessage = 'Error al cargar las zonas';
      console.error('Error loading zones:', error);
    } finally {
      this.isLoading = false;
    }
  }

  showCreateForm() {
    this.currentView = 'create';
    this.resetForm();
    this.clearMessages();
  }

  showListView() {
    this.currentView = 'list';
    this.clearMessages();
  }

  async onSubmit() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente';
      return;
    }

    try {
      this.isLoading = true;
      
      if (this.editingZoneId) {
        await this.zoneService.updateZone(this.editingZoneId, this.zoneForm);
        this.successMessage = 'Zona actualizada exitosamente';
      } else {
        await this.zoneService.createZone(this.zoneForm);
        this.successMessage = 'Zona creada exitosamente';
      }
      
      await this.loadZones();
      this.showListView();
      this.resetForm();
    } catch (error) {
      this.errorMessage = this.editingZoneId ? 
        'Error al actualizar la zona' : 'Error al crear la zona';
      console.error('Error saving zone:', error);
    } finally {
      this.isLoading = false;
    }
  }

  editZone(zone: Zone) {
    this.editingZoneId = zone.id!;
    this.zoneForm = {
      nombre: zone.nombre,
      estado: zone.estado,
      latitud: zone.latitud,
      longitud: zone.longitud,
      radioKm: zone.radioKm
    };
    this.currentView = 'edit';
    this.clearMessages();
  }

  async deleteZone(zone: Zone) {
    if (!confirm(`¿Está seguro de que desea eliminar la zona "${zone.nombre}"?`)) {
      return;
    }

    try {
      this.isLoading = true;
      await this.zoneService.deleteZone(zone.id!);
      this.successMessage = 'Zona eliminada exitosamente';
      await this.loadZones();
    } catch (error) {
      this.errorMessage = 'Error al eliminar la zona';
      console.error('Error deleting zone:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.zoneForm.nombre.trim() &&
      this.zoneForm.latitud >= -90 && this.zoneForm.latitud <= 90 &&
      this.zoneForm.longitud >= -180 && this.zoneForm.longitud <= 180 &&
      this.zoneForm.radioKm > 0
    );
  }

  private resetForm() {
    this.zoneForm = {
      nombre: '',
      estado: 'Activo',
      latitud: 0,
      longitud: 0,
      radioKm: 1
    };
    this.editingZoneId = null;
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Función para obtener coordenadas actuales del navegador
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.zoneForm.latitud = position.coords.latitude;
          this.zoneForm.longitud = position.coords.longitude;
        },
        (error) => {
          console.error('Error getting location:', error);
          this.errorMessage = 'No se pudo obtener la ubicación actual';
        }
      );
    } else {
      this.errorMessage = 'La geolocalización no está soportada en este navegador';
    }
  }
}
