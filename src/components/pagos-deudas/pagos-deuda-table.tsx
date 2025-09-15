"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Eye, User, CreditCard, Calendar, FileText, Receipt } from "lucide-react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PagoDeudaConDetalles } from "@/types/pagoDeuda";

interface PagosDeudaTableProps {
  data: PagoDeudaConDetalles[];
}

const PAGE_SIZE = 15;

export function PagosDeudaTable({ data }: PagosDeudaTableProps) {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const formatDateSafe = (dateString: string | null) => {
    if (!dateString) return "";
    if (dateString.length === 10) {
      return new Date(dateString + 'T00:00:00').toLocaleDateString("es-AR");
    }
    return new Date(dateString).toLocaleDateString("es-AR");
  };

  const [columnVisibility, setColumnVisibility] = React.useState({
    id: true,
    cliente: true,
    monto: true,
    fechaPago: true,
    cuentaTesoreria: true,
    deuda: true,
    descripcion: true,
    acciones: true,
  });

  const [selectedPago, setSelectedPago] = React.useState<PagoDeudaConDetalles | null>(null);

  // Filtro de búsqueda
  const filtered = data.filter(pago =>
    (pago.cliente?.razon_social?.toLowerCase().includes(search.toLowerCase()) || "") ||
    (pago.descripcion?.toLowerCase().includes(search.toLowerCase()) || "") ||
    (pago.cuenta_tesoreria?.descripcion?.toLowerCase().includes(search.toLowerCase()) || "")
  );

  // Paginación
  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getBadgeColorForMonto = (monto: number) => {
    if (monto >= 100000) return 'bg-green-100 text-green-800 border-green-200';
    if (monto >= 50000) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (monto >= 10000) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="w-full mt-6">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Buscar por cliente, descripción o cuenta..."
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
                   col === "cliente" ? "Cliente" :
                   col === "monto" ? "Monto" :
                   col === "fechaPago" ? "Fecha Pago" :
                   col === "cuentaTesoreria" ? "Cuenta Tesorería" :
                   col === "deuda" ? "Deuda" :
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
              {columnVisibility.cliente && <th className="px-2 py-1 text-left">Cliente</th>}
              {columnVisibility.monto && <th className="px-2 py-1 text-left">Monto</th>}
              {columnVisibility.fechaPago && <th className="px-2 py-1 text-left">Fecha Pago</th>}
              {columnVisibility.cuentaTesoreria && <th className="px-2 py-1 text-left">Cuenta Tesorería</th>}
              {columnVisibility.deuda && <th className="px-2 py-1 text-left">Deuda ID</th>}
              {columnVisibility.descripcion && <th className="px-2 py-1 text-left">Descripción</th>}
              {columnVisibility.acciones && <th className="px-2 py-1 text-left">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  {data.length === 0 ? "No hay pagos registrados." : "No se encontraron pagos con los filtros aplicados."}
                </td>
              </tr>
            ) : (
              paginated.map((pago) => (
                <tr key={pago.id} className="border-b hover:bg-blue-50 transition-colors">
                  {columnVisibility.id && <td className="px-2 py-1 text-left">{pago.id}</td>}
                  {columnVisibility.cliente && (
                    <td className="px-2 py-1">
                      <div>
                        <div className="font-medium">{pago.cliente?.razon_social || 'Cliente desconocido'}</div>
                        <div className="text-xs text-gray-500">
                          {pago.cliente?.tipo_doc}: {pago.cliente?.num_doc}
                        </div>
                      </div>
                    </td>
                  )}
                  {columnVisibility.monto && (
                    <td className="px-2 py-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColorForMonto(pago.monto)}`}>
                        {formatCurrency(pago.monto, "ARS", "es-AR")}
                      </span>
                    </td>
                  )}
                  {columnVisibility.fechaPago && <td className="px-2 py-1">{formatDateSafe(pago.fecha_pago)}</td>}
                  {columnVisibility.cuentaTesoreria && (
                    <td className="px-2 py-1">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        {pago.cuenta_tesoreria?.descripcion || 'Sin cuenta'}
                      </span>
                    </td>
                  )}
                  {columnVisibility.deuda && (
                    <td className="px-2 py-1">
                      <span className="text-blue-600 font-mono">#{pago.fk_id_deuda}</span>
                    </td>
                  )}
                  {columnVisibility.descripcion && (
                    <td className="px-2 py-1 max-w-xs truncate" title={pago.descripcion}>
                      {pago.descripcion || '-'}
                    </td>
                  )}
                  {columnVisibility.acciones && (
                    <td className="px-2 py-1">
                      <Button size="icon" variant="outline" onClick={() => setSelectedPago(pago)} title="Ver detalle">
                        <Eye className="w-4 h-4" />
                      </Button>
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
              "0 de 0 pagos."
            ) : (
              `${(page - 1) * PAGE_SIZE + 1} - ${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length} pago(s).`
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
      <Dialog open={!!selectedPago} onOpenChange={v => !v && setSelectedPago(null)}>
        <DialogContent className="max-w-md" preventOutsideClose>
          <DialogHeader>
            <DialogTitle className="text-green-700 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-green-500" />
              Pago #{selectedPago?.id}
            </DialogTitle>
            <DialogDescription className="mb-2 text-gray-500">
              Detalle completo del pago realizado.
            </DialogDescription>
          </DialogHeader>
          {selectedPago && (
            <div className="space-y-4">
              {/* Cliente */}
              <div className="rounded-lg bg-blue-50 p-3 flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-700">Cliente</div>
                  <div className="text-gray-900">{selectedPago.cliente?.razon_social}</div>
                  <div className="text-sm text-gray-600">
                    {selectedPago.cliente?.tipo_doc}: {selectedPago.cliente?.num_doc}
                  </div>
                </div>
              </div>

              {/* Detalles del pago */}
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  Detalles del Pago
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Monto</span>
                  <span className="font-bold text-green-700">
                    {formatCurrency(selectedPago.monto, "ARS", "es-AR")}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Cuenta Tesorería</span>
                  <span className="text-gray-900">{selectedPago.cuenta_tesoreria?.descripcion}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Deuda ID</span>
                  <span className="text-blue-600 font-mono">#{selectedPago.fk_id_deuda}</span>
                </div>
                {selectedPago.deuda && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Deuda</span>
                    <span className="text-gray-900">
                      {formatCurrency(selectedPago.deuda.total, "ARS", "es-AR")}
                    </span>
                  </div>
                )}
              </div>

              {/* Fechas */}
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Fechas
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Fecha del pago</span>
                  <span className="text-gray-900 font-semibold">{formatDateSafe(selectedPago.fecha_pago)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de registro</span>
                  <span className="text-gray-900">
                    {new Date(selectedPago.creado_el).toLocaleString("es-AR", {
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
                  {selectedPago.descripcion ||
                    <span className="italic text-gray-400">Sin descripción</span>
                  }
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}