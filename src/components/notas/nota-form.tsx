"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateNotaData, COLORES_OPCIONES, ColorNota } from "@/types/nota";
import { createNota, calcularPosicionDisponible } from "@/services/notas";
import { StickyNote, Palette } from "lucide-react";

interface NotaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onNotaCreated: () => void;
  usuarioId: number;
  notasExistentes: any[];
}

export function NotaForm({ isOpen, onClose, onNotaCreated, usuarioId, notasExistentes }: NotaFormProps) {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [color, setColor] = useState<ColorNota>("amarillo");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contenido.trim()) {
      alert("El contenido de la nota es obligatorio");
      return;
    }

    try {
      setIsLoading(true);

      // Calcular posición disponible
      const posicion = calcularPosicionDisponible(notasExistentes);

      const nuevaNota: CreateNotaData = {
        titulo: titulo.trim() || undefined,
        contenido: contenido.trim(),
        color,
        posicion_x: posicion.x,
        posicion_y: posicion.y,
        ancho: 200,
        alto: 200,
        fk_usuario: usuarioId
      };

      const notaCreada = await createNota(nuevaNota);
      console.log("✅ Nota creada exitosamente:", notaCreada);

      // Limpiar formulario
      setTitulo("");
      setContenido("");
      setColor("amarillo");

      console.log("🔄 Ejecutando onNotaCreated callback");
      onNotaCreated();
      onClose();
    } catch (error) {
      console.error("Error creating nota:", error);
      alert("Error al crear la nota. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitulo("");
      setContenido("");
      setColor("amarillo");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" preventOutsideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-yellow-600" />
            Nueva Nota
          </DialogTitle>
          <DialogDescription>
            Crea una nueva nota para tu tablero. Puedes moverla y editarla después.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título (opcional)</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título de tu nota..."
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="contenido">Contenido *</Label>
            <Textarea
              id="contenido"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe el contenido de tu nota aquí..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4" />
              Color del Postit
            </Label>
            <Select value={color} onValueChange={(value) => setColor(value as ColorNota)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLORES_OPCIONES.map((colorOption) => (
                  <SelectItem key={colorOption.value} value={colorOption.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded ${colorOption.preview} border border-gray-300`}
                      />
                      {colorOption.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview del postit */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <Label className="text-sm text-gray-600 mb-2 block">Vista previa:</Label>
            <div className="flex justify-center">
              <div
                className={`w-32 h-32 rounded-lg shadow-md border-2 p-2 ${
                  COLORES_OPCIONES.find(c => c.value === color)?.preview || 'bg-yellow-200'
                } border-yellow-300`}
              >
                <div className="text-xs font-semibold mb-1 truncate">
                  {titulo || "Sin título"}
                </div>
                <div className="text-xs overflow-hidden">
                  {contenido || "Contenido de la nota..."}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !contenido.trim()}
            >
              {isLoading ? "Creando..." : "Crear Nota"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}