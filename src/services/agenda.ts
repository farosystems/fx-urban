import { supabase } from "@/lib/supabaseClient";
import { EventoAgenda, CreateEventoAgendaData, UpdateEventoAgendaData, CategoriaAgenda, CreateCategoriaAgendaData } from "@/types/agenda";

// === EVENTOS ===

export async function getEventosAgenda(usuarioId: number): Promise<EventoAgenda[]> {
  const { data, error } = await supabase
    .from("eventos_agenda")
    .select("*")
    .eq("fk_usuario", usuarioId)
    .eq("activo", true)
    .order("fecha_inicio", { ascending: true });

  if (error) throw error;
  return data as EventoAgenda[];
}

export async function getEventosPorRangoFecha(usuarioId: number, fechaInicio: string, fechaFin: string): Promise<EventoAgenda[]> {
  const { data, error } = await supabase
    .from("eventos_agenda")
    .select("*")
    .eq("fk_usuario", usuarioId)
    .eq("activo", true)
    .gte("fecha_inicio", fechaInicio)
    .lte("fecha_inicio", fechaFin)
    .order("fecha_inicio", { ascending: true });

  if (error) throw error;
  return data as EventoAgenda[];
}

export async function getEventoPorId(id: number): Promise<EventoAgenda | null> {
  const { data, error } = await supabase
    .from("eventos_agenda")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as EventoAgenda;
}

export async function createEvento(evento: CreateEventoAgendaData): Promise<EventoAgenda> {
  const { data, error } = await supabase
    .from("eventos_agenda")
    .insert([{
      ...evento,
      color: evento.color || '#3b82f6',
      recordatorio_minutos: evento.recordatorio_minutos || 15,
      creado_el: new Date().toISOString(),
      actualizado_el: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data as EventoAgenda;
}

export async function updateEvento(id: number, updates: UpdateEventoAgendaData): Promise<EventoAgenda> {
  const { data, error } = await supabase
    .from("eventos_agenda")
    .update({
      ...updates,
      actualizado_el: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as EventoAgenda;
}

export async function deleteEvento(id: number): Promise<void> {
  const { error } = await supabase
    .from("eventos_agenda")
    .update({
      activo: false,
      actualizado_el: new Date().toISOString()
    })
    .eq("id", id);

  if (error) throw error;
}

// === CATEGORÍAS ===

export async function getCategoriasAgenda(usuarioId: number): Promise<CategoriaAgenda[]> {
  const { data, error } = await supabase
    .from("categorias_agenda")
    .select("*")
    .eq("fk_usuario", usuarioId)
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data as CategoriaAgenda[];
}

export async function createCategoria(categoria: CreateCategoriaAgendaData): Promise<CategoriaAgenda> {
  const { data, error } = await supabase
    .from("categorias_agenda")
    .insert([{
      ...categoria,
      creado_el: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data as CategoriaAgenda;
}

export async function deleteCategoria(id: number): Promise<void> {
  const { error } = await supabase
    .from("categorias_agenda")
    .update({ activo: false })
    .eq("id", id);

  if (error) throw error;
}

// === FUNCIONES AUXILIARES ===

export function formatearFechaParaFullCalendar(eventos: EventoAgenda[]) {
  return eventos.map(evento => ({
    id: evento.id.toString(),
    title: evento.titulo,
    start: evento.fecha_inicio,
    end: evento.fecha_fin,
    allDay: evento.todo_el_dia,
    backgroundColor: evento.color,
    borderColor: evento.color,
    extendedProps: {
      descripcion: evento.descripcion,
      categoria: evento.categoria,
      ubicacion: evento.ubicacion,
      recordatorio_minutos: evento.recordatorio_minutos,
      usuario_id: evento.fk_usuario
    }
  }));
}