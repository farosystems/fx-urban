"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateEventoAgendaData, UpdateEventoAgendaData, EventoAgenda, COLORES_EVENTOS, CategoriaAgenda } from "@/types/agenda";
import { Calendar, Clock, MapPin, Palette, Save, Trash2 } from "lucide-react";

interface EventoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (evento: CreateEventoAgendaData | UpdateEventoAgendaData) => void;
  onDelete?: () => void;
  evento?: EventoAgenda | null;
  fechaInicialSeleccionada?: string;
  usuarioId: number;
  categorias: CategoriaAgenda[];
  loading?: boolean;
}

export function EventoForm({
  isOpen,
  onClose,
  onSave,
  onDelete,
  evento,
  fechaInicialSeleccionada,
  usuarioId,
  categorias,
  loading = false
}: EventoFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [fechaFin, setFechaFin] = useState("");
  const [horaFin, setHoraFin] = useState("10:00");
  const [todoElDia, setTodoElDia] = useState(false);
  const [color, setColor] = useState("#3b82f6");
  const [categoria, setCategoria] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [recordatorioMinutos, setRecordatorioMinutos] = useState(15);

  useEffect(() => {
    if (isOpen) {
      if (evento) {
        // Editando evento existente
        setTitulo(evento.titulo);
        setDescripcion(evento.descripcion || "");

        const fechaInicioDate = new Date(evento.fecha_inicio);
        setFechaInicio(fechaInicioDate.toISOString().split('T')[0]);
        setHoraInicio(fechaInicioDate.toTimeString().slice(0, 5));

        if (evento.fecha_fin) {
          const fechaFinDate = new Date(evento.fecha_fin);
          setFechaFin(fechaFinDate.toISOString().split('T')[0]);
          setHoraFin(fechaFinDate.toTimeString().slice(0, 5));
        } else {
          setFechaFin(fechaInicioDate.toISOString().split('T')[0]);
          const horaFinDate = new Date(fechaInicioDate.getTime() + 60 * 60 * 1000);
          setHoraFin(horaFinDate.toTimeString().slice(0, 5));
        }

        setTodoElDia(evento.todo_el_dia);
        setColor(evento.color);
        setCategoria(evento.categoria || "");
        setUbicacion(evento.ubicacion || "");
        setRecordatorioMinutos(evento.recordatorio_minutos);
      } else {
        // Nuevo evento
        resetForm();
        if (fechaInicialSeleccionada) {
          setFechaInicio(fechaInicialSeleccionada);
          setFechaFin(fechaInicialSeleccionada);
        }
      }
    }
  }, [isOpen, evento, fechaInicialSeleccionada]);

  const resetForm = () => {
    setTitulo("");
    setDescripcion("");
    setFechaInicio("");
    setHoraInicio("09:00");
    setFechaFin("");
    setHoraFin("10:00");
    setTodoElDia(false);
    setColor("#3b82f6");
    setCategoria("");
    setUbicacion("");
    setRecordatorioMinutos(15);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !fechaInicio) {
      alert("El título y la fecha de inicio son obligatorios");
      return;
    }

    let fechaInicioCompleta: string;
    let fechaFinCompleta: string | undefined;

    if (todoElDia) {
      fechaInicioCompleta = fechaInicio;
      fechaFinCompleta = fechaFin || fechaInicio;
    } else {
      fechaInicioCompleta = `${fechaInicio}T${horaInicio}:00`;
      fechaFinCompleta = `${fechaFin || fechaInicio}T${horaFin}:00`;
    }

    const eventoData = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      fecha_inicio: fechaInicioCompleta,
      fecha_fin: fechaFinCompleta,
      todo_el_dia: todoElDia,
      color,
      categoria: categoria || undefined,
      ubicacion: ubicacion.trim() || undefined,
      recordatorio_minutos: recordatorioMinutos,
      ...(evento ? {} : { fk_usuario: usuarioId })
    };

    onSave(eventoData);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {evento ? "Editar Evento" : "Nuevo Evento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título del evento..."
              required
              disabled={loading}
            />
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del evento..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Todo el día */}
          <div className="flex items-center space-x-2">
            <Switch
              id="todo-el-dia"
              checked={todoElDia}
              onCheckedChange={setTodoElDia}
              disabled={loading}
            />
            <Label htmlFor="todo-el-dia">Todo el día</Label>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha-inicio">Fecha inicio *</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="fecha-fin">Fecha fin</Label>
              <Input
                id="fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Horas (solo si no es todo el día) */}
          {!todoElDia && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hora-inicio">Hora inicio</Label>
                <Input
                  id="hora-inicio"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="hora-fin">Hora fin</Label>
                <Input
                  id="hora-fin"
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Ubicación */}
          <div>
            <Label htmlFor="ubicacion" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ubicación
            </Label>
            <Input
              id="ubicacion"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ubicación del evento..."
              disabled={loading}
            />
          </div>

          {/* Categoría y Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <Select value={categoria} onValueChange={setCategoria} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.nombre}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.nombre}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Color
              </Label>
              <Select value={color} onValueChange={setColor} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLORES_EVENTOS.map((colorOption) => (
                    <SelectItem key={colorOption.valor} value={colorOption.valor}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: colorOption.valor }}
                        />
                        {colorOption.nombre}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recordatorio */}
          <div>
            <Label htmlFor="recordatorio" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recordatorio (minutos antes)
            </Label>
            <Select
              value={recordatorioMinutos.toString()}
              onValueChange={(value) => setRecordatorioMinutos(parseInt(value))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sin recordatorio</SelectItem>
                <SelectItem value="5">5 minutos</SelectItem>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
                <SelectItem value="1440">1 día</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botones */}
          <div className="flex justify-between pt-4">
            <div>
              {evento && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}