import { supabase } from "@/lib/supabaseClient";
import { Deuda, DeudaConCliente, CreateDeudaData, DeudaFilters } from "@/types/deuda";

export async function getDeudas(filters?: DeudaFilters): Promise<DeudaConCliente[]> {
  let query = supabase
    .from("deudas")
    .select(`
      *,
      cliente:entidades!fk_id_cliente(
        id,
        razon_social,
        tipo_doc,
        num_doc
      )
    `)
    .order("creado_el", { ascending: false });

  if (filters?.tipo && filters.tipo !== "todas") {
    query = query.eq("tipo", filters.tipo);
  }

  if (filters?.cliente && filters.cliente.trim() !== "") {
    query = query.ilike("cliente.razon_social", `%${filters.cliente}%`);
  }

  if (filters?.fechaDesde) {
    query = query.gte("fecha", filters.fechaDesde);
  }

  if (filters?.fechaHasta) {
    query = query.lte("fecha", filters.fechaHasta);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as DeudaConCliente[];
}

export async function createDeuda(deuda: CreateDeudaData): Promise<Deuda> {
  const { data, error } = await supabase
    .from("deudas")
    .insert([deuda])
    .select()
    .single();

  if (error) throw error;
  return data as Deuda;
}

export async function updateDeuda(id: number, deuda: Partial<CreateDeudaData>): Promise<Deuda> {
  const { data, error } = await supabase
    .from("deudas")
    .update(deuda)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Deuda;
}

export async function deleteDeuda(id: number): Promise<void> {
  const { error } = await supabase
    .from("deudas")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function getDeudaById(id: number): Promise<DeudaConCliente> {
  const { data, error } = await supabase
    .from("deudas")
    .select(`
      *,
      cliente:entidades!fk_id_cliente(
        id,
        razon_social,
        tipo_doc,
        num_doc
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as DeudaConCliente;
}

export async function getResumenDeudas() {
  const { data, error } = await supabase
    .from("deudas")
    .select("tipo, saldo");

  if (error) throw error;

  const resumen = {
    totalExternas: 0,
    totalInternas: 0,
    cantidadExternas: 0,
    cantidadInternas: 0
  };

  data.forEach((deuda) => {
    if (deuda.tipo === "externa") {
      resumen.totalExternas += deuda.saldo || 0;
      resumen.cantidadExternas++;
    } else if (deuda.tipo === "interna") {
      resumen.totalInternas += deuda.saldo || 0;
      resumen.cantidadInternas++;
    }
  });

  return resumen;
}