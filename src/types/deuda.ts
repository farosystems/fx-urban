export interface Deuda {
  id: number;
  tipo: "externa" | "interna";
  fk_id_cliente?: number;
  total: number;
  saldo: number;
  fecha: string;
  descripcion?: string;
  creado_el: string;
  actualizado_el: string;
}

export interface DeudaConCliente extends Deuda {
  cliente?: {
    id: number;
    razon_social: string;
    tipo_doc: string;
    num_doc: string;
  };
}

export type CreateDeudaData = Omit<Deuda, "id" | "creado_el" | "actualizado_el">

export interface DeudaFilters {
  tipo?: "externa" | "interna" | "todas";
  cliente?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}