"use client";
import React, { useState, useRef, useEffect } from "react";
import { Nota, COLORES_POSTIT } from "@/types/nota";
import { updatePosicionNota, updateNota, deleteNota, duplicarNota } from "@/services/notas";
import { MoreVertical, Edit3, Copy, Trash2, Palette, GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { COLORES_OPCIONES } from "@/types/nota";

interface PostitProps {
  nota: Nota;
  onUpdate: () => void;
  onDelete: (id: number) => void;
  disabled?: boolean;
}

export function Postit({ nota, onUpdate, onDelete, disabled = false }: PostitProps) {
  const [position, setPosition] = useState({ x: nota.posicion_x, y: nota.posicion_y });
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitulo, setEditTitulo] = useState(nota.titulo || "");
  const [editContenido, setEditContenido] = useState(nota.contenido);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const postItRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartTime = useRef<number>(0);
  const hasMovedWhileDraggingRef = useRef(false);

  const colores = COLORES_POSTIT[nota.color];

  // Manejar el inicio del arrastre
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isEditing) return;

    // No iniciar drag si se hizo click en un botón o elemento de control
    const target = e.target as HTMLElement;
    if (target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('[data-radix-menu-trigger]')) {
      return;
    }

    e.preventDefault();

    const rect = postItRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = e.clientX;
    const startY = e.clientY;

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    setDragStart({ x: startX, y: startY });
    hasMovedWhileDraggingRef.current = false;
    dragStartTime.current = Date.now();

    setIsDragging(true);
    isDraggingRef.current = true;
  };

  // Manejar movimiento del mouse durante el arrastre
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      // Detectar si se ha movido lo suficiente como para considerar que es un arrastre
      const distanceX = Math.abs(e.clientX - dragStart.x);
      const distanceY = Math.abs(e.clientY - dragStart.y);
      const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (totalDistance > 5) { // 5px de tolerancia
        hasMovedWhileDraggingRef.current = true;
      }

      const tablero = document.getElementById('tablero-notas');
      if (!tablero) return;

      const tableroRect = tablero.getBoundingClientRect();
      const newX = Math.max(0, Math.min(
        e.clientX - tableroRect.left - dragOffset.x,
        tableroRect.width - nota.ancho
      ));
      const newY = Math.max(0, Math.min(
        e.clientY - tableroRect.top - dragOffset.y,
        tableroRect.height - nota.alto
      ));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = async () => {
      if (isDraggingRef.current) {
        const wasActualDrag = hasMovedWhileDraggingRef.current;
        const clickDuration = Date.now() - dragStartTime.current;

        console.log("🖱️ handleMouseUp:", {
          wasActualDrag,
          clickDuration,
          hasMovedWhileDragging: hasMovedWhileDraggingRef.current
        });

        setIsDragging(false);
        isDraggingRef.current = false;

        // Solo guardar posición si realmente se arrastró la nota
        if (wasActualDrag) {
          console.log("📌 Saving position - was actual drag");
          try {
            await updatePosicionNota(nota.id, position.x, position.y);
            onUpdate();
          } catch (error) {
            console.error("Error updating position:", error);
            // Revertir posición en caso de error
            setPosition({ x: nota.posicion_x, y: nota.posicion_y });
          }
        } else {
          console.log("🎯 Click ended without drag - no action needed (handled by content click)");
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, position, dragStart, nota.id, nota.ancho, nota.alto, nota.posicion_x, nota.posicion_y, onUpdate]);

  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);
      await updateNota(nota.id, {
        titulo: editTitulo.trim() || undefined,
        contenido: editContenido.trim()
      });
      setIsEditing(false);
      setIsEditModalOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating nota:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditModal = () => {
    console.log("🎯 handleOpenEditModal called");
    console.log("Setting editTitulo:", nota.titulo || "");
    console.log("Setting editContenido:", nota.contenido);
    setEditTitulo(nota.titulo || "");
    setEditContenido(nota.contenido);
    console.log("Opening modal...");
    setIsEditModalOpen(true);
  };

  const handleContentClick = (e: React.MouseEvent) => {
    console.log("🎯 handleContentClick called");
    // Prevenir propagación para evitar conflictos con el drag
    e.stopPropagation();
    e.preventDefault();

    // Abrir modal directamente, sin esperar al drag system
    if (!isEditModalOpen) {
      console.log("👆 Opening modal from content click");
      handleOpenEditModal();
    }
  };

  const handleColorChange = async (newColor: string) => {
    try {
      setIsLoading(true);
      await updateNota(nota.id, { color: newColor as any });
      setShowColorPicker(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating color:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setIsLoading(true);
      await duplicarNota(nota.id);
      onUpdate();
    } catch (error) {
      console.error("Error duplicating nota:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta nota?")) {
      try {
        setIsLoading(true);
        await deleteNota(nota.id);
        onDelete(nota.id);
      } catch (error) {
        console.error("Error deleting nota:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      ref={postItRef}
      className={`absolute select-none transition-shadow duration-200 ${
        isDragging ? 'z-50' : 'z-10'
      } ${isDragging ? 'rotate-2 scale-105' : 'hover:rotate-1'}
      hover:scale-105 hover:shadow-lg ${colores.shadow}`}
      style={{
        left: position.x,
        top: position.y,
        width: nota.ancho,
        height: nota.alto,
        transform: isDragging ? 'rotate(2deg) scale(1.05)' : '',
        transition: isDragging ? 'none' : 'transform 0.2s ease-out, box-shadow 0.2s ease-out'
      }}
    >
      <div
        className={`w-full h-full ${colores.bg} ${colores.border} border-2 rounded-lg shadow-md
        relative overflow-hidden ${colores.text}`}
        style={{
          boxShadow: '3px 3px 8px rgba(0,0,0,0.15)',
          background: `linear-gradient(145deg, ${colores.bg.replace('bg-', '')}, ${colores.bg.replace('bg-', '').replace('200', '300')})`
        }}
      >
        {/* Efecto de papel con líneas sutiles */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `repeating-linear-gradient(
              transparent,
              transparent 24px,
              currentColor 24px,
              currentColor 25px
            )`
          }} />
        </div>

        {/* Header con grip y menú - área de drag */}
        <div
          className={`relative z-10 flex items-center justify-between p-2 border-b border-current/20 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-1">
            <GripVertical className="w-4 h-4 opacity-50" />
            <span className="text-xs opacity-70">#{nota.id}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-black/10">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleOpenEditModal}>
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowColorPicker(!showColorPicker)}>
                <Palette className="w-4 h-4 mr-2" />
                Cambiar Color
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Selector de color */}
        {showColorPicker && (
          <div className="absolute top-12 right-2 z-50 bg-white rounded-lg shadow-lg p-2 border">
            <div className="grid grid-cols-4 gap-1">
              {COLORES_OPCIONES.map((color) => (
                <button
                  key={color.value}
                  className={`w-6 h-6 rounded ${color.preview} border-2 hover:scale-110 transition-transform ${
                    nota.color === color.value ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  onClick={() => handleColorChange(color.value)}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Título en el encabezado si existe */}
          {nota.titulo && (
            <div className="px-3 py-2 border-b border-current/20 bg-black/5">
              <h3 className="font-bold text-sm truncate opacity-90">
                {nota.titulo}
              </h3>
            </div>
          )}

          {/* Contenido clickeable */}
          <div
            className="content-click-area p-3 flex-1 cursor-pointer hover:bg-black/5 transition-colors relative group"
            onClick={handleContentClick}
            title="Haz clic para editar"
          >
            <p className="text-sm whitespace-pre-wrap break-words overflow-hidden h-full">
              {nota.contenido}
            </p>

            {/* Indicador sutil de que es clickeable */}
            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-30 transition-opacity">
              <Edit3 className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Efecto de sombra en la esquina para simular despegado */}
        <div className="absolute bottom-0 right-0 w-8 h-8 opacity-20">
          <div className="w-full h-full bg-gradient-to-tl from-black/30 to-transparent rounded-bl-full" />
        </div>
      </div>

      {/* Modal de edición */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        console.log("Dialog onOpenChange:", open, "isLoading:", isLoading);
        if (!open && !isLoading) {
          setIsEditModalOpen(false);
        }
      }}>
        <DialogContent
          className="sm:max-w-[500px]"
          onPointerDownOutside={(e) => {
            console.log("onPointerDownOutside prevented");
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            console.log("onEscapeKeyDown, isLoading:", isLoading);
            if (isLoading) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Editar Nota #{nota.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Título (opcional)
              </label>
              <Input
                value={editTitulo}
                onChange={(e) => {
                  console.log("📄 Input title onChange:", e.target.value);
                  setEditTitulo(e.target.value);
                }}
                placeholder="Título de tu nota..."
                maxLength={100}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Contenido *
              </label>
              <Textarea
                value={editContenido}
                onChange={(e) => {
                  console.log("📝 Textarea onChange:", e.target.value);
                  setEditContenido(e.target.value);
                }}
                placeholder="Escribe el contenido de tu nota aquí..."
                rows={6}
                required
                disabled={isLoading}
              />
            </div>

            {/* Preview del postit */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="text-sm text-gray-600 mb-2 block">Vista previa:</label>
              <div className="flex justify-center">
                <div
                  className={`w-32 h-32 rounded-lg shadow-md border-2 p-2 ${colores.bg} ${colores.border} ${colores.text} flex flex-col`}
                >
                  {editTitulo && (
                    <div className="text-xs font-bold mb-1 truncate border-b border-current/20 pb-1">
                      {editTitulo}
                    </div>
                  )}
                  <div className="text-xs overflow-hidden flex-1">
                    {editContenido || "Contenido de la nota..."}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditTitulo(nota.titulo || "");
                  setEditContenido(nota.contenido);
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={!editContenido.trim() || isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}