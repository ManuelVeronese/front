export interface Zone {
  id?: number;
  nombre: string;
  estado: 'Activo' | 'Inactivo';
  latitud: number;
  longitud: number;
  radioKm: number;
  fechaCreacion?: Date;
}

export interface CreateZoneRequest {
  nombre: string;
  estado: 'Activo' | 'Inactivo';
  latitud: number;
  longitud: number;
  radioKm: number;
}
