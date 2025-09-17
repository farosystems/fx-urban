"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Eye, Edit, Trash2, User, CreditCard, Calendar, FileText, DollarSign, Banknote } from "lucide-react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DeudaConCliente } from "@/types/deuda";
import { updateDeuda, deleteDeuda } from "@/services/deudas";
import { procesarPagoDeuda } from "@/services/pagosDeudas";
import { ProcesarPagoData } from "@/types/pagoDeuda";
import { DeudaForm } from "./deuda-form";
import { PagoDeudaModal } from "./pago-deuda-modal";
import { PagoDeudaInternaModal, PagoDeudaInternaData } from "./pago-deuda-interna-modal";
import { procesarPagoDeudaInterna } from "@/services/pagosDeudas";
import { useUser } from "@clerk/nextjs";
import { getUsuarioPorEmail } from "@/services/usuarios";
import { Usuario } from "@/types/usuario";

interface DeudasTableProps {
  data: DeudaConCliente[];
  onDeudaUpdated: () => void;
}

const PAGE_SIZE = 10;

export function DeudasTable({ data, onDeudaUpdated }: DeudasTableProps) {
  const { user } = useUser();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [usuarioActual, setUsuarioActual] = React.useState<Usuario | null>(null);

  const formatDateSafe = (dateString: string | null) => {
    if (!dateString) return "";
    if (dateString.length === 10) {
      return new Date(dateString + 'T00:00:00').toLocaleDateString("es-AR");
    }
    return new Date(dateString).toLocaleDateString("es-AR");
  };

  const [columnVisibility, setColumnVisibility] = React.useState({
    id: true,
    tipo: true,
    cliente: true,
    total: true,
    saldo: true,
    fecha: true,
    descripcion: true,
    acciones: true,
  });

  const [selectedDeuda, setSelectedDeuda] = React.useState<DeudaConCliente | null>(null);
  const [editingDeuda, setEditingDeuda] = React.useState<DeudaConCliente | null>(null);
  const [pagoDeuda, setPagoDeuda] = React.useState<DeudaConCliente | null>(null);
  const [pagoDeudaInterna, setPagoDeudaInterna] = React.useState<DeudaConCliente | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [toast, setToast] = React.useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: "", type: 'success' });

  // Obtener usuario actual
  React.useEffect(() => {
    async function fetchUsuario() {
      if (user?.emailAddresses?.[0]?.emailAddress) {
        const usuario = await getUsuarioPorEmail(user.emailAddresses[0].emailAddress);
        setUsuarioActual(usuario);
      }
    }
    fetchUsuario();
  }, [user]);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    console.log('🍞 Toast:', message);
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: 'success' }), 3000);
  }

  // Filtro de búsqueda
  const filtered = data.filter(deuda =>
    (deuda.descripcion?.toLowerCase().includes(search.toLowerCase()) || "") ||
    (deuda.cliente?.razon_social?.toLowerCase().includes(search.toLowerCase()) || "") ||
    (deuda.tipo.toLowerCase().includes(search.toLowerCase()) || "")
  );

  // Paginación
  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEditDeuda = async (data: any) => {
    if (!editingDeuda) return;

    try {
      setIsLoading(true);
      await updateDeuda(editingDeuda.id, data);
      showToast('Deuda actualizada exitosamente', 'success');
      setEditingDeuda(null);
      onDeudaUpdated();
    } catch (error) {
      console.error('Error updating deuda:', error);
      showToast('Error al actualizar la deuda', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDeuda = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta deuda?')) return;

    try {
      await deleteDeuda(id);
      showToast('Deuda eliminada exitosamente', 'success');
      onDeudaUpdated();
    } catch (error) {
      console.error('Error deleting deuda:', error);
      showToast('Error al eliminar la deuda', 'error');
    }
  };

  const handleProcesarPago = async (pagoData: ProcesarPagoData) => {
    try {
      setIsLoading(true);
      await procesarPagoDeuda(pagoData);
      showToast('Pago procesado exitosamente', 'success');
      setPagoDeuda(null);
      onDeudaUpdated();
    } catch (error: any) {
      console.error('Error processing payment:', error);
      showToast(error.message || 'Error al procesar el pago', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcesarPagoInterna = async (pagoData: PagoDeudaInternaData) => {
    try {
      setIsLoading(true);
      await procesarPagoDeudaInterna(pagoData);
      showToast('Pago de deuda interna procesado exitosamente', 'success');
      setPagoDeudaInterna(null);
      onDeudaUpdated();
    } catch (error: any) {
      console.error('Error processing internal debt payment:', error);
      showToast(error.message || 'Error al procesar el pago de deuda interna', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeColor = (tipo: string) => {
    return tipo === 'externa'
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-orange-100 text-orange-800 border-orange-200';
  };

  return (
    <div className="w-full mt-6">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Buscar deuda..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-xs"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2">
                Columnas <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(columnVisibility).map(([col, visible]) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visible}
                  onCheckedChange={v => setColumnVisibility(cv => ({ ...cv, [col]: v }))}
                  className="capitalize"
                >
                  {col === "id" ? "ID" :
                   col === "tipo" ? "Tipo" :
                   col === "cliente" ? "Cliente" :
                   col === "total" ? "Total" :
                   col === "saldo" ? "Saldo" :
                   col === "fecha" ? "Fecha" :
                   col === "descripcion" ? "Descripción" :
                   col === "acciones" ? "Acciones" : col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              {columnVisibility.id && <th className="px-2 py-1 text-left">ID</th>}
              {columnVisibility.tipo && <th className="px-2 py-1 text-left">Tipo</th>}
              {columnVisibility.cliente && <th className="px-2 py-1 text-left">Cliente</th>}
              {columnVisibility.total && <th className="px-2 py-1 text-left">Total</th>}
              {columnVisibility.saldo && <th className="px-2 py-1 text-left">Saldo</th>}
              {columnVisibility.fecha && <th className="px-2 py-1 text-left">Fecha</th>}
              {columnVisibility.descripcion && <th className="px-2 py-1 text-left">Descripción</th>}
              {columnVisibility.acciones && <th className="px-2 py-1 text-left">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  {data.length === 0 ? "No hay deudas registradas." : "No se encontraron deudas con los filtros aplicados."}
                </td>
              </tr>
            ) : (
              paginated.map((deuda) => (
                <tr key={deuda.id} className="border-b hover:bg-blue-50 transition-colors">
                  {columnVisibility.id && <td className="px-2 py-1 text-left">{deuda.id}</td>}
                  {columnVisibility.tipo && (
                    <td className="px-2 py-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(deuda.tipo)}`}>
                        {deuda.tipo === 'externa' ? 'Externa' : 'Interna'}
                      </span>
                    </td>
                  )}
                  {columnVisibility.cliente && (
                    <td className="px-2 py-1">
                      {deuda.tipo === 'externa' ?
                        (deuda.cliente?.razon_social || '-') :
                        <span className="text-gray-500 italic">Deuda interna</span>
                      }
                    </td>
                  )}
                  {columnVisibility.total && (
                    <td className="px-2 py-1 font-semibold text-blue-600">
                      {formatCurrency(deuda.total, "ARS", "es-AR")}
                    </td>
                  )}
                  {columnVisibility.saldo && (
                    <td className="px-2 py-1 font-semibold text-red-600">
                      {formatCurrency(deuda.saldo, "ARS", "es-AR")}
                    </td>
                  )}
                  {columnVisibility.fecha && <td className="px-2 py-1">{formatDateSafe(deuda.fecha)}</td>}
                  {columnVisibility.descripcion && (
                    <td className="px-2 py-1 max-w-xs truncate" title={deuda.descripcion}>
                      {deuda.descripcion || '-'}
                    </td>
                  )}
                  {columnVisibility.acciones && (
                    <td className="px-2 py-1">
                      <div className="flex gap-1">
                        <Button size="icon" variant="outline" onClick={() => setSelectedDeuda(deuda)} title="Ver deuda">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => setEditingDeuda(deuda)} title="Editar deuda">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {deuda.saldo > 0 && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              if (deuda.tipo === 'externa') {
                                setPagoDeuda(deuda);
                              } else {
                                setPagoDeudaInterna(deuda);
                              }
                            }}
                            title="Procesar pago"
                            className="hover:bg-green-50 hover:border-green-200"
                          >
                            <Banknote className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDeleteDeuda(deuda.id)}
                          title="Eliminar deuda"
                          className="hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {filtered.length === 0 ? (
              "0 de 0 deudas."
            ) : (
              `${(page - 1) * PAGE_SIZE + 1} - ${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length} deuda(s).`
            )}
          </div>
          <div className="space-x-2">
            <button
              className="px-3 py-1 rounded border bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            <button
              className="px-3 py-1 rounded border bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      <Dialog open={!!selectedDeuda} onOpenChange={v => !v && setSelectedDeuda(null)}>
        <DialogContent className="max-w-md" preventOutsideClose>
          <DialogHeader>
            <DialogTitle className="text-blue-700 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-500" />
              Deuda #{selectedDeuda?.id}
            </DialogTitle>
            <DialogDescription className="mb-2 text-gray-500">
              Detalle completo de la deuda seleccionada.
            </DialogDescription>
          </DialogHeader>
          {selectedDeuda && (
            <div className="space-y-4">
              {/* Tipo de deuda */}
              <div className={`rounded-lg p-3 flex items-center gap-3 ${
                selectedDeuda.tipo === 'externa' ? 'bg-red-50' : 'bg-orange-50'
              }`}>
                <DollarSign className={`w-5 h-5 ${
                  selectedDeuda.tipo === 'externa' ? 'text-red-600' : 'text-orange-600'
                }`} />
                <div>
                  <div className={`font-semibold ${
                    selectedDeuda.tipo === 'externa' ? 'text-red-700' : 'text-orange-700'
                  }`}>
                    Deuda {selectedDeuda.tipo === 'externa' ? 'Externa' : 'Interna'}
                  </div>
                  <div className="text-gray-900">
                    {selectedDeuda.tipo === 'externa' ?
                      selectedDeuda.cliente?.razon_social || 'Sin cliente' :
                      'Deuda del comercio'
                    }
                  </div>
                </div>
              </div>

              {/* Cliente (solo para deudas externas) */}
              {selectedDeuda.tipo === 'externa' && selectedDeuda.cliente && (
                <div className="rounded-lg bg-blue-50 p-3 flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-700">Cliente</div>
                    <div className="text-gray-900">{selectedDeuda.cliente.razon_social}</div>
                    <div className="text-sm text-gray-600">
                      {selectedDeuda.cliente.tipo_doc}: {selectedDeuda.cliente.num_doc}
                    </div>
                  </div>
                </div>
              )}

              {/* Montos */}
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  Montos
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Total</span>
                  <span className="font-bold text-blue-700">
                    {formatCurrency(selectedDeuda.total, "ARS", "es-AR")}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Saldo pendiente</span>
                  <span className="font-bold text-red-700">
                    {formatCurrency(selectedDeuda.saldo, "ARS", "es-AR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pagado</span>
                  <span className="font-bold text-green-700">
                    {formatCurrency(selectedDeuda.total - selectedDeuda.saldo, "ARS", "es-AR")}
                  </span>
                </div>
              </div>

              {/* Fechas */}
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Fechas
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Fecha de la deuda</span>
                  <span className="text-gray-900 font-semibold">{formatDateSafe(selectedDeuda.fecha)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de creación</span>
                  <span className="text-gray-900">
                    {new Date(selectedDeuda.creado_el).toLocaleString("es-AR", {
                      dateStyle: "short",
                      timeStyle: "short"
                    })}
                  </span>
                </div>
              </div>

              {/* Descripción */}
              <div className="rounded-lg bg-green-50 p-3">
                <div className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  Descripción
                </div>
                <div className="text-gray-900">
                  {selectedDeuda.descripcion ||
                    <span className="italic text-gray-400">Sin descripción</span>
                  }
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de edición */}
      <Dialog open={!!editingDeuda} onOpenChange={v => !v && setEditingDeuda(null)}>
        <DialogContent className="sm:max-w-[500px]" preventOutsideClose>
          <DialogHeader>
            <DialogTitle>Editar Deuda</DialogTitle>
          </DialogHeader>
          {editingDeuda && (
            <DeudaForm
              deuda={editingDeuda}
              onSubmit={handleEditDeuda}
              onCancel={() => setEditingDeuda(null)}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de pago deuda externa */}
      <PagoDeudaModal
        deuda={pagoDeuda}
        isOpen={!!pagoDeuda}
        onClose={() => setPagoDeuda(null)}
        onPagoRealizado={handleProcesarPago}
        isLoading={isLoading}
      />

      {/* Modal de pago deuda interna */}
      <PagoDeudaInternaModal
        deuda={pagoDeudaInterna}
        isOpen={!!pagoDeudaInterna}
        onClose={() => setPagoDeudaInterna(null)}
        onPagoRealizado={handleProcesarPagoInterna}
        isLoading={isLoading}
        usuarioId={usuarioActual?.id}
      />

      {/* Toast notifications */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg animate-fade-in text-white ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}