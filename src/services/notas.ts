import { supabase } from "@/lib/supabaseClient";
import { Nota, NotaConUsuario, CreateNotaData, UpdateNotaData } from "@/types/nota";

export async function getNotas(): Promise<NotaConUsuario[]> {
  const { data, error } = await supabase
    .from("notas")
    .select(`
      *,
      usuario:fk_usuario(
        id,
        nombre,
        email
      )
    `)
    .order("actualizado_el", { ascending: false });

  if (error) throw error;
  return data as NotaConUsuario[];
}

export async function getNotasPorUsuario(usuarioId: number): Promise<Nota[]> {
  console.log("🔍 Buscando notas para usuario ID:", usuarioId);

  const { data, error } = await supabase
    .from("notas")
    .select("*")
    .eq("fk_usuario", usuarioId)
    .order("actualizado_el", { ascending: false });

  if (error) {
    console.error("❌ Error obteniendo notas:", error);
    throw error;
  }

  console.log("📝 Notas encontradas:", data?.length || 0, data);
  return data as Nota[];
}

export async function getNotaPorId(id: number): Promise<NotaConUsuario | null> {
  const { data, error } = await supabase
    .from("notas")
    .select(`
      *,
      usuario:fk_usuario(
        id,
        nombre,
        email
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as NotaConUsuario;
}

export async function createNota(nota: CreateNotaData): Promise<Nota> {
  const { data, error } = await supabase
    .from("notas")
    .insert([nota])
    .select()
    .single();

  if (error) throw error;
  return data as Nota;
}

export async function updateNota(id: number, updates: UpdateNotaData): Promise<Nota> {
  const { data, error } = await supabase
    .from("notas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Nota;
}

export async function updatePosicionNota(id: number, posicion_x: number, posicion_y: number): Promise<void> {
  // Redondear las posiciones a enteros para evitar errores de tipo
  const posX = Math.round(posicion_x);
  const posY = Math.round(posicion_y);

  console.log(`📍 Actualizando posición nota ${id}: (${posX}, ${posY})`);

  const { error } = await supabase
    .from("notas")
    .update({
      posicion_x: posX,
      posicion_y: posY
    })
    .eq("id", id);

  if (error) throw error;
}

export async function updateTamanoNota(id: number, ancho: number, alto: number): Promise<void> {
  const { error } = await supabase
    .from("notas")
    .update({ ancho, alto })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteNota(id: number): Promise<void> {
  const { error } = await supabase
    .from("notas")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function duplicarNota(id: number, offsetX: number = 20, offsetY: number = 20): Promise<Nota> {
  // Obtener la nota original
  const notaOriginal = await getNotaPorId(id);
  if (!notaOriginal) {
    throw new Error("Nota no encontrada");
  }

  // Crear nueva nota con datos de la original pero nueva posición
  const nuevaNota: CreateNotaData = {
    titulo: notaOriginal.titulo ? `${notaOriginal.titulo} (copia)` : undefined,
    contenido: notaOriginal.contenido,
    color: notaOriginal.color,
    posicion_x: notaOriginal.posicion_x + offsetX,
    posicion_y: notaOriginal.posicion_y + offsetY,
    ancho: notaOriginal.ancho,
    alto: notaOriginal.alto,
    fk_usuario: notaOriginal.fk_usuario
  };

  return await createNota(nuevaNota);
}

// Función auxiliar para obtener una posición disponible en el tablero
export function calcularPosicionDisponible(notasExistentes: Nota[], anchoTablero: number = 1200): { x: number; y: number } {
  const MARGEN = 20;
  const ANCHO_POSTIT = 200;
  const ALTO_POSTIT = 200;

  for (let y = MARGEN; y < 800; y += ALTO_POSTIT + MARGEN) {
    for (let x = MARGEN; x < anchoTablero - ANCHO_POSTIT; x += ANCHO_POSTIT + MARGEN) {
      // Verificar si esta posición está ocupada
      const ocupada = notasExistentes.some(nota =>
        Math.abs(nota.posicion_x - x) < ANCHO_POSTIT / 2 &&
        Math.abs(nota.posicion_y - y) < ALTO_POSTIT / 2
      );

      if (!ocupada) {
        return { x, y };
      }
    }
  }

  // Si no hay posición disponible, usar una posición aleatoria
  return {
    x: Math.floor(Math.random() * (anchoTablero - ANCHO_POSTIT)),
    y: Math.floor(Math.random() * 600)
  };
}