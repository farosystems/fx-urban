import { supabase } from "@/lib/supabaseClient";
import { PagoDeuda, PagoDeudaConDetalles, CreatePagoDeudaData, ProcesarPagoData } from "@/types/pagoDeuda";
import { createDetalleLoteOperacion } from "@/services/detalleLotesOperaciones";
import { getLoteAbierto } from "@/services/lotesOperaciones";

export async function getPagosDeudas(): Promise<PagoDeudaConDetalles[]> {
  const { data, error } = await supabase
    .from("pagos_deudas")
    .select(`
      *,
      deuda:deudas!fk_id_deuda(
        id,
        tipo,
        total,
        saldo,
        descripcion
      ),
      cliente:entidades!fk_id_cliente(
        id,
        razon_social,
        tipo_doc,
        num_doc
      ),
      cuenta_tesoreria:cuentas_tesoreria!fk_id_cuenta_tesoreria(
        id,
        descripcion
      )
    `)
    .order("creado_el", { ascending: false });

  if (error) throw error;
  return data as PagoDeudaConDetalles[];
}

export async function getPagosPorDeuda(deudaId: number): Promise<PagoDeudaConDetalles[]> {
  const { data, error } = await supabase
    .from("pagos_deudas")
    .select(`
      *,
      cuenta_tesoreria:cuentas_tesoreria!fk_id_cuenta_tesoreria(
        id,
        descripcion
      )
    `)
    .eq("fk_id_deuda", deudaId)
    .order("fecha_pago", { ascending: false });

  if (error) throw error;
  return data as PagoDeudaConDetalles[];
}

export async function createPagoDeuda(pago: CreatePagoDeudaData): Promise<PagoDeuda> {
  const { data, error } = await supabase
    .from("pagos_deudas")
    .insert([pago])
    .select()
    .single();

  if (error) throw error;
  return data as PagoDeuda;
}

export async function procesarPagoDeuda(datosPago: ProcesarPagoData): Promise<void> {
  const { deudaId, monto, cuentaTesoreriaId, fechaPago, descripcion } = datosPago;

  // 1. Obtener la deuda actual
  const { data: deudaActual, error: errorDeuda } = await supabase
    .from("deudas")
    .select("id, fk_id_cliente, saldo, total, tipo")
    .eq("id", deudaId)
    .single();

  if (errorDeuda) {
    console.error("Error obteniendo deuda:", errorDeuda);
    throw new Error("No se pudo obtener la información de la deuda");
  }

  if (!deudaActual) {
    throw new Error("La deuda no existe");
  }

  if (deudaActual.tipo !== "externa") {
    throw new Error("Solo se pueden procesar pagos para deudas externas");
  }

  if (monto <= 0) {
    throw new Error("El monto del pago debe ser mayor a 0");
  }

  if (monto > deudaActual.saldo) {
    throw new Error("El monto del pago no puede ser mayor al saldo pendiente");
  }

  // 2. Obtener el lote activo (necesario para registrar en detalle_lotes_operaciones)
  const loteActivo = await getLoteAbierto();
  if (!loteActivo) {
    throw new Error("No hay un lote de operaciones abierto. Debe abrir caja antes de procesar pagos.");
  }

  // 3. Crear el pago
  const nuevoPago: CreatePagoDeudaData = {
    fk_id_deuda: deudaId,
    fk_id_cliente: deudaActual.fk_id_cliente!,
    monto: monto,
    fecha_pago: fechaPago,
    fk_id_cuenta_tesoreria: cuentaTesoreriaId,
    descripcion: descripcion
  };

  const { error: errorPago } = await supabase
    .from("pagos_deudas")
    .insert([nuevoPago]);

  if (errorPago) {
    console.error("Error creando pago:", errorPago);
    throw new Error("No se pudo registrar el pago");
  }

  // 4. Registrar el ingreso en detalle_lotes_operaciones
  try {
    await createDetalleLoteOperacion({
      fk_id_lote: loteActivo,
      fk_id_cuenta_tesoreria: cuentaTesoreriaId,
      tipo: "ingreso",
      monto: monto
    });
  } catch (error) {
    console.error("Error registrando movimiento de caja:", error);
    throw new Error("No se pudo registrar el movimiento en el lote de operaciones");
  }

  // 5. Actualizar el saldo de la deuda
  const nuevoSaldo = deudaActual.saldo - monto;

  const { error: errorUpdate } = await supabase
    .from("deudas")
    .update({
      saldo: Math.max(0, nuevoSaldo) // No permitir saldo negativo
    })
    .eq("id", deudaId);

  if (errorUpdate) {
    console.error("Error actualizando deuda:", errorUpdate);
    throw new Error("No se pudo actualizar el saldo de la deuda");
  }
}

export async function getCuentasTesoreriaParaPagos(): Promise<{id: number; descripcion: string}[]> {
  const { data, error } = await supabase
    .from("cuentas_tesoreria")
    .select("id, descripcion")
    .eq("activo", true)
    .neq("descripcion", "CUENTA CORRIENTE") // Excluir cuenta corriente
    .order("descripcion", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTotalPagadoDeuda(deudaId: number): Promise<number> {
  const { data, error } = await supabase
    .from("pagos_deudas")
    .select("monto")
    .eq("fk_id_deuda", deudaId);

  if (error) throw error;

  return data.reduce((total, pago) => total + (pago.monto || 0), 0);
}