"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useRef } from "react";
import { TableroNotas, TableroNotasRef } from "@/components/notas/tablero-notas";
import { NotaForm } from "@/components/notas/nota-form";
import { Nota } from "@/types/nota";
import { StickyNote, Loader2 } from "lucide-react";

export default function NotasPage() {
  const { user, isSignedIn } = useUser();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const tableroRef = useRef<TableroNotasRef>(null);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleCrearNota = () => {
    setMostrarFormulario(true);
  };

  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
  };

  const handleNotasChange = (nuevasNotas: Nota[]) => {
    setNotas(nuevasNotas);
  };

  // Obtener el ID del usuario desde Clerk
  const getUserId = (): number => {
    // Aquí deberías implementar la lógica para obtener el ID numérico del usuario
    // desde tu base de datos basado en el user.id de Clerk

    // Debug: mostrar información del usuario
    console.log("🔍 User de Clerk:", {
      userId: user?.id,
      firstName: user?.firstName,
      username: user?.username,
      emailAddresses: user?.emailAddresses
    });

    // Por ahora, uso un valor por defecto
    // CAMBIAR ESTE VALOR según el ID que tienen tus notas en la base de datos
    return 2; // Cambiado a 2 porque las notas existentes tienen fk_usuario: 2
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                <StickyNote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Mis Notas
                </h1>
                <p className="text-gray-600">Organiza tus ideas y recordatorios</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                {user?.firstName || user?.username || "Usuario"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TableroNotas
          ref={tableroRef}
          usuarioId={getUserId()}
          onCrearNota={handleCrearNota}
          notas={notas}
          onNotasChange={handleNotasChange}
        />
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <NotaForm
          isOpen={mostrarFormulario}
          onClose={handleCerrarFormulario}
          onNotaCreated={() => {
            handleCerrarFormulario();
            // Refrescar las notas automáticamente
            tableroRef.current?.refreshNotas();
          }}
          usuarioId={getUserId()}
          notasExistentes={notas}
        />
      )}
    </div>
  );
}