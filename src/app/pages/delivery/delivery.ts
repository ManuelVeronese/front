import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Delivery, CreateDeliveryRequest, DeliverySearchByProximity, DeliverySearchByZone } from '../../models/delivery.model';
import { DeliveryService } from '../../services/delivery.service';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery.html',
  styleUrl: './delivery.css'
})
export class DeliveryComponent implements OnInit {
  Math = Math;

  deliveries: Delivery[] = [];
  currentView: 'main' | 'list' | 'create' | 'edit' | 'search-proximity' | 'search-zone' = 'main';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showDeleteModal = false;
  deliveryToDelete: Delivery | null = null;

  // Paginación
  currentPage = 1;
  totalPages = 1;
  totalDeliveries = 0;
  pageSize = 10;

  // Formulario para crear/editar delivery
  deliveryForm: CreateDeliveryRequest = {
    radioKm: 1,
    latitud: 0,
    longitud: 0,
    ubicacion: '',
    estado: 'Activo',
    zonas: []
  };

  // Formularios de búsqueda
  proximitySearchForm: DeliverySearchByProximity = {
    latitud: 0,
    longitud: 0,
    radioKm: 1
  };

  zoneSearchForm: DeliverySearchByZone = {
    zonaSeleccionada: ''
  };

  editingDeliveryId: number | null = null;
  availableZones: string[] = [];
  searchResults: Delivery[] = [];
  isSearching = false;

  constructor(private deliveryService: DeliveryService) {}

  ngOnInit() {
    this.loadAvailableZones();
  }

  loadAvailableZones() {
    this.availableZones = this.deliveryService.getAvailableZones();
  }

  async loadDeliveries(page: number = 1) {
    try {
      this.isLoading = true;
      const result = await this.deliveryService.getAllDeliveries(page, this.pageSize);
      this.deliveries = result.deliveries;
      this.currentPage = result.currentPage;
      this.totalPages = result.totalPages;
      this.totalDeliveries = result.total;
      this.clearMessages();
    } catch (error) {
      this.errorMessage = 'Error al cargar los deliveries';
      console.error('Error loading deliveries:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Navegación entre vistas
  showMainView() {
    this.currentView = 'main';
    this.clearMessages();
  }

  showCreateForm() {
    this.currentView = 'create';
    this.resetForm();
    this.clearMessages();
  }

  showListView() {
    this.currentView = 'list';
    this.loadDeliveries();
    this.clearMessages();
  }

  showProximitySearch() {
    this.currentView = 'search-proximity';
    this.searchResults = [];
    this.clearMessages();
  }

  showZoneSearch() {
    this.currentView = 'search-zone';
    this.searchResults = [];
    this.clearMessages();
  }

  // CRUD Operations
  async onSubmit() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente';
      return;
    }

    try {
      this.isLoading = true;
      
      if (this.editingDeliveryId) {
        await this.deliveryService.updateDelivery(this.editingDeliveryId, this.deliveryForm);
        this.successMessage = 'Delivery actualizado exitosamente';
      } else {
        await this.deliveryService.createDelivery(this.deliveryForm);
        this.successMessage = 'Delivery creado exitosamente';
      }
      
      this.showMainView();
      this.resetForm();
    } catch (error) {
      this.errorMessage = this.editingDeliveryId ? 
        'Error al actualizar el delivery' : 'Error al crear el delivery';
      console.error('Error saving delivery:', error);
    } finally {
      this.isLoading = false;
    }
  }

  editDelivery(delivery: Delivery) {
    this.editingDeliveryId = delivery.id!;
    this.deliveryForm = {
      radioKm: delivery.radioKm,
      latitud: delivery.latitud,
      longitud: delivery.longitud,
      ubicacion: delivery.ubicacion,
      estado: delivery.estado,
      zonas: [...delivery.zonas]
    };
    this.currentView = 'edit';
    this.clearMessages();
  }

  confirmDelete(delivery: Delivery) {
    this.deliveryToDelete = delivery;
    this.showDeleteModal = true;
  }

  async deleteDelivery() {
    if (!this.deliveryToDelete) return;

    try {
      this.isLoading = true;
      await this.deliveryService.deleteDelivery(this.deliveryToDelete.id!);
      this.successMessage = 'Delivery eliminado exitosamente';
      await this.loadDeliveries(this.currentPage);
    } catch (error) {
      this.errorMessage = 'Error al eliminar el delivery';
      console.error('Error deleting delivery:', error);
    } finally {
      this.isLoading = false;
      this.showDeleteModal = false;
      this.deliveryToDelete = null;
    }
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.deliveryToDelete = null;
  }

  // Search Operations
  async searchByProximity() {
    if (!this.isProximitySearchValid()) {
      this.errorMessage = 'Por favor, complete todos los campos de búsqueda correctamente';
      return;
    }

    try {
      this.isSearching = true;
      this.searchResults = await this.deliveryService.searchDeliveriesByProximity(this.proximitySearchForm);
      this.clearMessages();
      if (this.searchResults.length === 0) {
        this.errorMessage = 'No se encontraron deliveries en el área especificada';
      }
    } catch (error) {
      this.errorMessage = 'Error al buscar deliveries por proximidad';
      console.error('Error searching by proximity:', error);
    } finally {
      this.isSearching = false;
    }
  }

  async searchByZone() {
    if (!this.zoneSearchForm.zonaSeleccionada) {
      this.errorMessage = 'Por favor, seleccione una zona';
      return;
    }

    try {
      this.isSearching = true;
      this.searchResults = await this.deliveryService.searchDeliveriesByZone(this.zoneSearchForm);
      this.clearMessages();
      if (this.searchResults.length === 0) {
        this.errorMessage = 'No se encontraron deliveries en la zona seleccionada';
      }
    } catch (error) {
      this.errorMessage = 'Error al buscar deliveries por zona';
      console.error('Error searching by zone:', error);
    } finally {
      this.isSearching = false;
    }
  }

  // Pagination
  async goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    await this.loadDeliveries(page);
  }

  // Utility functions
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (this.currentView === 'create' || this.currentView === 'edit') {
            this.deliveryForm.latitud = position.coords.latitude;
            this.deliveryForm.longitud = position.coords.longitude;
          } else if (this.currentView === 'search-proximity') {
            this.proximitySearchForm.latitud = position.coords.latitude;
            this.proximitySearchForm.longitud = position.coords.longitude;
          }
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

  onZoneChangeEvent(zona: string, event: Event) {
    const target = event.target as HTMLInputElement;
    this.onZoneChange(zona, target.checked);
  }

  onZoneChange(zona: string, checked: boolean) {
    if (checked) {
      if (!this.deliveryForm.zonas.includes(zona)) {
        this.deliveryForm.zonas.push(zona);
      }
    } else {
      this.deliveryForm.zonas = this.deliveryForm.zonas.filter(z => z !== zona);
    }
  }

  isZoneSelected(zona: string): boolean {
    return this.deliveryForm.zonas.includes(zona);
  }

  private isFormValid(): boolean {
    return !!(
      this.deliveryForm.ubicacion.trim() &&
      this.deliveryForm.latitud >= -90 && this.deliveryForm.latitud <= 90 &&
      this.deliveryForm.longitud >= -180 && this.deliveryForm.longitud <= 180 &&
      this.deliveryForm.radioKm > 0
    );
  }

  private isProximitySearchValid(): boolean {
    return !!(
      this.proximitySearchForm.latitud >= -90 && this.proximitySearchForm.latitud <= 90 &&
      this.proximitySearchForm.longitud >= -180 && this.proximitySearchForm.longitud <= 180 &&
      this.proximitySearchForm.radioKm > 0
    );
  }

  private resetForm() {
    this.deliveryForm = {
      radioKm: 1,
      latitud: 0,
      longitud: 0,
      ubicacion: '',
      estado: 'Activo',
      zonas: []
    };
    this.editingDeliveryId = null;
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  getStateClass(estado: string): string {
    switch (estado) {
      case 'Activo': return 'bg-success';
      case 'Disponible': return 'bg-info';
      case 'Ocupado': return 'bg-warning';
      case 'Inactivo': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }
}
