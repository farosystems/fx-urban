"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Clock, TrendingUp, Bell } from "lucide-react";
import { getUsuarioPorEmail } from "@/services/usuarios";
import { Usuario } from "@/types/usuario";
import { EventoAgenda, CategoriaAgenda, CreateCategoriaAgendaData } from "@/types/agenda";
import { getEventosAgenda, getCategoriasAgenda, createEvento, updateEvento, deleteEvento, createCategoria, deleteCategoria } from "@/services/agenda";
import { CalendarComponent } from "@/components/agenda/calendar-component";
import { EventoForm } from "@/components/agenda/evento-form";
import { CategoriasTable } from "@/components/agenda/categorias-table";
import { ReminderSettings } from "@/components/agenda/reminder-settings";
import { useEventReminders } from "@/hooks/useEventReminders";

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4 pl-2">
      <span className="text-gray-600">Herramientas</span>
      <span className="mx-1 text-gray-400">&gt;</span>
      <span className="text-black font-medium">Agenda</span>
    </nav>
  );
}

function StatsPanel({ eventos }: { eventos: EventoAgenda[] }) {
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);

  const eventosHoy = eventos.filter(evento => {
    const fechaEvento = new Date(evento.fecha_inicio);
    return fechaEvento.toDateString() === hoy.toDateString();
  }).length;

  const eventosSemana = eventos.filter(evento => {
    const fechaEvento = new Date(evento.fecha_inicio);
    return fechaEvento >= inicioSemana && fechaEvento <= finSemana;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-4 rounded-lg text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium opacity-90">Eventos Hoy</h3>
            <p className="text-2xl font-bold">{eventosHoy}</p>
          </div>
          <Clock className="w-8 h-8 opacity-80" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-400 to-green-500 p-4 rounded-lg text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium opacity-90">Esta Semana</h3>
            <p className="text-2xl font-bold">{eventosSemana}</p>
          </div>
          <Calendar className="w-8 h-8 opacity-80" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-4 rounded-lg text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium opacity-90">Total Eventos</h3>
            <p className="text-2xl font-bold">{eventos.length}</p>
          </div>
          <TrendingUp className="w-8 h-8 opacity-80" />
        </div>
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [categorias, setCategorias] = useState<CategoriaAgenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoAgenda | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  // Hook de recordatorios
  const { testReminder } = useEventReminders({
    eventos,
    enabled: !!usuarioActual && reminderSettings.enabled, // Solo activar cuando hay usuario y está habilitado
    soundEnabled: reminderSettings.soundEnabled,
    vibrationEnabled: reminderSettings.vibrationEnabled
  });

  // Obtener usuario actual
  useEffect(() => {
    async function fetchUsuario() {
      if (user?.emailAddresses?.[0]?.emailAddress) {
        try {
          const usuario = await getUsuarioPorEmail(user.emailAddresses[0].emailAddress);
          setUsuarioActual(usuario);
        } catch (error) {
          console.error("Error fetching usuario:", error);
        }
      }
    }
    fetchUsuario();
  }, [user]);

  // Cargar eventos y categorías
  useEffect(() => {
    async function loadData() {
      if (usuarioActual) {
        try {
          setIsLoading(true);
          const [eventosData, categoriasData] = await Promise.all([
            getEventosAgenda(usuarioActual.id),
            getCategoriasAgenda(usuarioActual.id)
          ]);
          setEventos(eventosData);
          setCategorias(categoriasData);
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadData();
  }, [usuarioActual]);

  const handleDateClick = (date: string) => {
    setFechaSeleccionada(date);
    setEventoSeleccionado(null);
    setIsFormOpen(true);
  };

  const handleEventClick = (evento: any) => {
    const eventoCompleto = eventos.find(e => e.id.toString() === evento.id);
    if (eventoCompleto) {
      setEventoSeleccionado(eventoCompleto);
      setFechaSeleccionada("");
      setIsFormOpen(true);
    }
  };

  const handleEventSave = async (eventoData: any) => {
    if (!usuarioActual) return;

    try {
      setIsSaving(true);

      if (eventoSeleccionado) {
        // Actualizando evento existente
        await updateEvento(eventoSeleccionado.id, eventoData);
      } else {
        // Creando nuevo evento
        await createEvento(eventoData);
      }

      // Recargar eventos
      const eventosActualizados = await getEventosAgenda(usuarioActual.id);
      setEventos(eventosActualizados);

      setIsFormOpen(false);
      setEventoSeleccionado(null);
      setFechaSeleccionada("");
    } catch (error) {
      console.error("Error saving evento:", error);
      alert("Error al guardar el evento");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEventDelete = async () => {
    if (!eventoSeleccionado || !usuarioActual) return;

    if (window.confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      try {
        setIsSaving(true);
        await deleteEvento(eventoSeleccionado.id);

        // Recargar eventos
        const eventosActualizados = await getEventosAgenda(usuarioActual.id);
        setEventos(eventosActualizados);

        setIsFormOpen(false);
        setEventoSeleccionado(null);
      } catch (error) {
        console.error("Error deleting evento:", error);
        alert("Error al eliminar el evento");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleEventDrop = async (info: any) => {
    try {
      const fechaInicio = info.allDay
        ? info.start.toISOString().split('T')[0]
        : info.start.toISOString();

      const fechaFin = info.end
        ? (info.allDay
            ? info.end.toISOString().split('T')[0]
            : info.end.toISOString())
        : undefined;

      await updateEvento(parseInt(info.eventId), {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        todo_el_dia: info.allDay
      });

      // Recargar eventos
      const eventosActualizados = await getEventosAgenda(usuarioActual!.id);
      setEventos(eventosActualizados);
    } catch (error) {
      console.error("Error updating evento position:", error);
      alert("Error al mover el evento");

      // Recargar eventos para revertir cambios visuales
      if (usuarioActual) {
        const eventosActualizados = await getEventosAgenda(usuarioActual.id);
        setEventos(eventosActualizados);
      }
    }
  };

  const handleEventResize = async (info: any) => {
    try {
      const fechaFin = info.end
        ? info.end.toISOString()
        : undefined;

      await updateEvento(parseInt(info.eventId), {
        fecha_fin: fechaFin
      });

      // Recargar eventos
      const eventosActualizados = await getEventosAgenda(usuarioActual!.id);
      setEventos(eventosActualizados);
    } catch (error) {
      console.error("Error updating evento duration:", error);
      alert("Error al cambiar la duración del evento");

      // Recargar eventos para revertir cambios visuales
      if (usuarioActual) {
        const eventosActualizados = await getEventosAgenda(usuarioActual.id);
        setEventos(eventosActualizados);
      }
    }
  };

  const handleCreateCategoria = async (categoriaData: CreateCategoriaAgendaData) => {
    if (!usuarioActual) return;

    try {
      const categoriaConUsuario = {
        ...categoriaData,
        fk_usuario: usuarioActual.id
      };

      await createCategoria(categoriaConUsuario);

      // Recargar categorías
      const categoriasActualizadas = await getCategoriasAgenda(usuarioActual.id);
      setCategorias(categoriasActualizadas);
    } catch (error) {
      console.error("Error creating categoria:", error);
      throw error;
    }
  };

  const handleDeleteCategoria = async (categoriaId: number) => {
    if (!usuarioActual) return;

    try {
      await deleteCategoria(categoriaId);

      // Recargar categorías
      const categoriasActualizadas = await getCategoriasAgenda(usuarioActual.id);
      setCategorias(categoriasActualizadas);
    } catch (error) {
      console.error("Error deleting categoria:", error);
      throw error;
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-muted-foreground gap-4">
        <Calendar className="w-16 h-16 text-gray-400" />
        <span>Debes iniciar sesión para acceder a tu agenda.</span>
        <Button onClick={() => router.push("/sign-in")}>Iniciar Sesión</Button>
      </div>
    );
  }

  if (!usuarioActual) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-muted-foreground gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span>Cargando usuario...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-8">
        <Breadcrumb />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-3 rounded-lg shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Agenda</h1>
              <p className="text-gray-600">Gestiona tus eventos y citas</p>
            </div>
          </div>

          <div className="flex gap-2">
            <ReminderSettings onSettingsChange={setReminderSettings} />

            {/* Botón de test de recordatorios (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && eventos.length > 0 && (
              <Button
                variant="outline"
                onClick={() => testReminder(eventos[0])}
                title="Probar recordatorio con el primer evento"
              >
                <Bell className="w-4 h-4" />
              </Button>
            )}

            <Button
              onClick={() => {
                setEventoSeleccionado(null);
                setFechaSeleccionada(new Date().toISOString().split('T')[0]);
                setIsFormOpen(true);
              }}
              className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Evento
            </Button>
          </div>
        </div>

        {/* Stats */}
        <StatsPanel eventos={eventos} />

        {/* Calendario */}
        <CalendarComponent
          eventos={eventos}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          loading={isLoading}
        />

        {/* Modal de evento */}
        <EventoForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEventoSeleccionado(null);
            setFechaSeleccionada("");
          }}
          onSave={handleEventSave}
          onDelete={eventoSeleccionado ? handleEventDelete : undefined}
          evento={eventoSeleccionado}
          fechaInicialSeleccionada={fechaSeleccionada}
          usuarioId={usuarioActual.id}
          categorias={categorias}
          loading={isSaving}
        />

        {/* Tabla de Categorías */}
        <CategoriasTable
          categorias={categorias}
          onCreateCategoria={handleCreateCategoria}
          onDeleteCategoria={handleDeleteCategoria}
          usuarioId={usuarioActual.id}
          loading={isLoading}
        />

        {/* Información */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Haz clic en una fecha para crear un nuevo evento, o arrastra los eventos para moverlos.
          </p>
        </div>
      </div>
    </div>
  );
}