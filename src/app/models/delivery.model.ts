export interface Delivery {
  id?: number;
  radioKm: number;
  latitud: number;
  longitud: number;
  ubicacion: string;
  estado: 'Activo' | 'Inactivo' | 'Ocupado' | 'Disponible';
  zonas: string[]; // Array de nombres de zonas asignadas
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface CreateDeliveryRequest {
  radioKm: number;
  latitud: number;
  longitud: number;
  ubicacion: string;
  estado: 'Activo' | 'Inactivo' | 'Ocupado' | 'Disponible';
  zonas: string[];
}

export interface DeliverySearchByProximity {
  latitud: number;
  longitud: number;
  radioKm: number;
}

export interface DeliverySearchByZone {
  zonaSeleccionada: string;
}
