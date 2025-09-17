export type ColorNota = 'amarillo' | 'azul' | 'verde' | 'rosa' | 'naranja' | 'violeta' | 'rojo' | 'cyan';

export interface Nota {
  id: number;
  titulo?: string;
  contenido: string;
  color: ColorNota;
  posicion_x: number;
  posicion_y: number;
  ancho: number;
  alto: number;
  fk_usuario: number;
  creado_el: string;
  actualizado_el: string;
}

export interface NotaConUsuario extends Nota {
  usuario?: {
    id: number;
    nombre: string;
    email: string;
  };
}

export type CreateNotaData = Omit<Nota, "id" | "creado_el" | "actualizado_el">;

export interface UpdateNotaData {
  titulo?: string;
  contenido?: string;
  color?: ColorNota;
  posicion_x?: number;
  posicion_y?: number;
  ancho?: number;
  alto?: number;
}

// Configuración de colores para los postits
export const COLORES_POSTIT: Record<ColorNota, { bg: string; border: string; text: string; shadow: string }> = {
  amarillo: {
    bg: 'bg-yellow-200',
    border: 'border-yellow-300',
    text: 'text-yellow-900',
    shadow: 'shadow-yellow-300/50'
  },
  azul: {
    bg: 'bg-blue-200',
    border: 'border-blue-300',
    text: 'text-blue-900',
    shadow: 'shadow-blue-300/50'
  },
  verde: {
    bg: 'bg-green-200',
    border: 'border-green-300',
    text: 'text-green-900',
    shadow: 'shadow-green-300/50'
  },
  rosa: {
    bg: 'bg-pink-200',
    border: 'border-pink-300',
    text: 'text-pink-900',
    shadow: 'shadow-pink-300/50'
  },
  naranja: {
    bg: 'bg-orange-200',
    border: 'border-orange-300',
    text: 'text-orange-900',
    shadow: 'shadow-orange-300/50'
  },
  violeta: {
    bg: 'bg-purple-200',
    border: 'border-purple-300',
    text: 'text-purple-900',
    shadow: 'shadow-purple-300/50'
  },
  rojo: {
    bg: 'bg-red-200',
    border: 'border-red-300',
    text: 'text-red-900',
    shadow: 'shadow-red-300/50'
  },
  cyan: {
    bg: 'bg-cyan-200',
    border: 'border-cyan-300',
    text: 'text-cyan-900',
    shadow: 'shadow-cyan-300/50'
  }
};

export const COLORES_OPCIONES: { value: ColorNota; label: string; preview: string }[] = [
  { value: 'amarillo', label: 'Amarillo', preview: 'bg-yellow-200' },
  { value: 'azul', label: 'Azul', preview: 'bg-blue-200' },
  { value: 'verde', label: 'Verde', preview: 'bg-green-200' },
  { value: 'rosa', label: 'Rosa', preview: 'bg-pink-200' },
  { value: 'naranja', label: 'Naranja', preview: 'bg-orange-200' },
  { value: 'violeta', label: 'Violeta', preview: 'bg-purple-200' },
  { value: 'rojo', label: 'Rojo', preview: 'bg-red-200' },
  { value: 'cyan', label: 'Cyan', preview: 'bg-cyan-200' }
];