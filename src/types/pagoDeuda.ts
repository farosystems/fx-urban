export interface PagoDeuda {
  id: number;
  fk_id_deuda: number;
  fk_id_cliente: number;
  monto: number;
  fecha_pago: string;
  fk_id_cuenta_tesoreria: number;
  descripcion?: string;
  creado_el: string;
  actualizado_el: string;
}

export interface PagoDeudaConDetalles extends PagoDeuda {
  deuda?: {
    id: number;
    tipo: string;
    total: number;
    saldo: number;
    descripcion?: string;
  };
  cliente?: {
    id: number;
    razon_social: string;
    tipo_doc: string;
    num_doc: string;
  };
  cuenta_tesoreria?: {
    id: number;
    descripcion: string;
  };
}

export type CreatePagoDeudaData = Omit<PagoDeuda, "id" | "creado_el" | "actualizado_el">

export interface ProcesarPagoData {
  deudaId: number;
  monto: number;
  cuentaTesoreriaId: number;
  fechaPago: string;
  descripcion?: string;
}