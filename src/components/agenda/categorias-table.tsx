"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2, Palette, Save, X } from "lucide-react";
import { CategoriaAgenda, COLORES_EVENTOS, CreateCategoriaAgendaData } from "@/types/agenda";

interface CategoriasTableProps {
  categorias: CategoriaAgenda[];
  onCreateCategoria: (categoria: CreateCategoriaAgendaData) => void;
  onDeleteCategoria: (id: number) => void;
  usuarioId: number;
  loading?: boolean;
}

export function CategoriasTable({
  categorias,
  onCreateCategoria,
  onDeleteCategoria,
  usuarioId,
  loading = false
}: CategoriasTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [descripcion, setDescripcion] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert("El nombre de la categoría es obligatorio");
      return;
    }

    try {
      setIsSaving(true);

      const nuevaCategoria: CreateCategoriaAgendaData = {
        nombre: nombre.trim(),
        color,
        descripcion: descripcion.trim() || undefined,
        fk_usuario: usuarioId
      };

      await onCreateCategoria(nuevaCategoria);

      // Limpiar formulario
      setNombre("");
      setColor("#3b82f6");
      setDescripcion("");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error creating categoria:", error);
      alert("Error al crear la categoría");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${nombre}"?`)) {
      try {
        await onDeleteCategoria(id);
      } catch (error) {
        console.error("Error deleting categoria:", error);
        alert("Error al eliminar la categoría");
      }
    }
  };

  const resetForm = () => {
    setNombre("");
    setColor("#3b82f6");
    setDescripcion("");
  };

  const handleClose = () => {
    if (!isSaving) {
      resetForm();
      setIsFormOpen(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Categorías de Eventos</h3>
            </div>
            <Button
              onClick={() => setIsFormOpen(true)}
              size="sm"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          {categorias.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No hay categorías</p>
              <p className="text-sm mb-4">Crea tu primera categoría para organizar mejor tus eventos</p>
              <Button
                onClick={() => setIsFormOpen(true)}
                variant="outline"
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Categoría
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categorias.map((categoria) => (
                  <tr key={categoria.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                          style={{ backgroundColor: categoria.color }}
                          title={categoria.color}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {categoria.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs">
                        {categoria.descripcion || (
                          <span className="italic text-gray-400">Sin descripción</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(categoria.creado_el).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(categoria.id, categoria.nombre)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Modal de nueva categoría */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              Nueva Categoría
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre de la categoría..."
                required
                disabled={isSaving}
                maxLength={50}
              />
            </div>

            {/* Color */}
            <div>
              <Label>Color</Label>
              <Select value={color} onValueChange={setColor} disabled={isSaving}>
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

            {/* Descripción */}
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción opcional..."
                disabled={isSaving}
              />
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-3 bg-gray-50">
              <Label className="text-sm text-gray-600 mb-2 block">Vista previa:</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium">
                  {nombre || "Nombre de la categoría"}
                </span>
              </div>
              {descripcion && (
                <p className="text-xs text-gray-600 ml-6 mt-1">{descripcion}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || !nombre.trim()}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Guardando..." : "Crear Categoría"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}