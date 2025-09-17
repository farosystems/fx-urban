"use client";
import React, { useState, useEffect } from "react";
import { Postit } from "./postit";
import { Nota } from "@/types/nota";
import { getNotasPorUsuario } from "@/services/notas";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Grid3X3, StickyNote } from "lucide-react";

interface TableroNotasProps {
  usuarioId: number;
  onCrearNota: () => void;
  notas: Nota[];
  onNotasChange: (notas: Nota[]) => void;
}

export function TableroNotas({ usuarioId, onCrearNota, notas, onNotasChange }: TableroNotasProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  const fetchNotas = async () => {
    try {
      setIsLoading(true);
      const data = await getNotasPorUsuario(usuarioId);
      onNotasChange(data);
    } catch (error) {
      console.error("Error fetching notas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (usuarioId) {
      fetchNotas();
    }
  }, [usuarioId]);

  const handleNotaUpdate = () => {
    fetchNotas();
  };

  const handleNotaDelete = (notaId: number) => {
    onNotasChange(notas.filter(nota => nota.id !== notaId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-500" />
          <p className="text-gray-500">Cargando notas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Controles del tablero */}
      <div className="flex items-center justify-between mb-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border shadow-sm">
        <div className="flex items-center gap-3">
          <StickyNote className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-gray-700">
            {notas.length} nota{notas.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={showGrid ? 'bg-gray-100' : ''}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotas}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button onClick={onCrearNota} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Nota
          </Button>
        </div>
      </div>

      {/* Tablero principal */}
      <div
        id="tablero-notas"
        className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
        style={{
          width: '100%',
          height: '80vh',
          minHeight: '600px'
        }}
      >
        {/* Grid de fondo (opcional) */}
        {showGrid && (
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        )}

        {/* Mensaje cuando no hay notas */}
        {notas.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <StickyNote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                ¡Tu tablero está vacío!
              </h3>
              <p className="text-gray-500 mb-4">
                Crea tu primera nota para comenzar a organizar tus ideas
              </p>
              <Button onClick={onCrearNota}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primera nota
              </Button>
            </div>
          </div>
        )}

        {/* Postits */}
        {notas.map((nota) => (
          <Postit
            key={nota.id}
            nota={nota}
            onUpdate={handleNotaUpdate}
            onDelete={handleNotaDelete}
          />
        ))}

        {/* Indicador de zona de drop para nuevas notas */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white/80 rounded px-2 py-1">
          💡 Haz clic y arrastra las notas para moverlas
        </div>
      </div>

      {/* Información del tablero */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>
          Las notas se guardan automáticamente. Usa el menú de cada nota para más opciones.
        </p>
      </div>
    </div>
  );
}