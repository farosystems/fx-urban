export interface EventoAgenda {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  todo_el_dia: boolean;
  color: string;
  categoria?: string;
  ubicacion?: string;
  recordatorio_minutos: number;
  fk_usuario: number;
  activo: boolean;
  creado_el: string;
  actualizado_el: string;
}

export interface CreateEventoAgendaData {
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  todo_el_dia: boolean;
  color?: string;
  categoria?: string;
  ubicacion?: string;
  recordatorio_minutos?: number;
  fk_usuario: number;
}

export interface UpdateEventoAgendaData {
  titulo?: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  todo_el_dia?: boolean;
  color?: string;
  categoria?: string;
  ubicacion?: string;
  recordatorio_minutos?: number;
}

export interface CategoriaAgenda {
  id: number;
  nombre: string;
  color: string;
  descripcion?: string;
  fk_usuario: number;
  activo: boolean;
  creado_el: string;
}

export interface CreateCategoriaAgendaData {
  nombre: string;
  color: string;
  descripcion?: string;
  fk_usuario: number;
}

// Colores predefinidos para eventos
export const COLORES_EVENTOS = [
  { nombre: 'Azul', valor: '#3b82f6' },
  { nombre: 'Verde', valor: '#10b981' },
  { nombre: 'Amarillo', valor: '#f59e0b' },
  { nombre: 'Rojo', valor: '#ef4444' },
  { nombre: 'Púrpura', valor: '#8b5cf6' },
  { nombre: 'Rosa', valor: '#ec4899' },
  { nombre: 'Gris', valor: '#6b7280' },
  { nombre: 'Naranja', valor: '#f97316' },
] as const;