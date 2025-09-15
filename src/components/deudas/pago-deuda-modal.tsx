"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { formatCurrency } from "@/lib/utils";
import { DeudaConCliente } from "@/types/deuda";
import { ProcesarPagoData } from "@/types/pagoDeuda";
import { getCuentasTesoreriaParaPagos } from "@/services/pagosDeudas";

function formatNumberWithCommas(value: string): string {
  if (!value) return "";
  const parts = value.replace(/[^\d.,]/g, "").split(",");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimalPart = parts[1] ? "," + parts[1] : "";
  return integerPart + decimalPart;
}

function parseNumberFromInput(value: string): number {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
}

interface PagoDeudaModalProps {
  deuda: DeudaConCliente | null;
  isOpen: boolean;
  onClose: () => void;
  onPagoRealizado: (pago: ProcesarPagoData) => Promise<void>;
  isLoading?: boolean;
}

export function PagoDeudaModal({
  deuda,
  isOpen,
  onClose,
  onPagoRealizado,
  isLoading = false
}: PagoDeudaModalProps) {
  const [cuentasTesoreria, setCuentasTesoreria] = useState<{id: number; descripcion: string}[]>([]);
  const [monto, setMonto] = useState<string>("");
  const [cuentaTesoreriaId, setCuentaTesoreriaId] = useState<string>("");
  const [fechaPago, setFechaPago] = useState<string>(new Date().toISOString().split('T')[0]);
  const [descripcion, setDescripcion] = useState<string>("");

  useEffect(() => {
    async function fetchCuentasTesoreria() {
      try {
        const cuentas = await getCuentasTesoreriaParaPagos();
        setCuentasTesoreria(cuentas);
      } catch (error) {
        console.error("Error fetching cuentas tesoreria:", error);
      }
    }
    if (isOpen) {
      fetchCuentasTesoreria();
    }
  }, [isOpen]);

  // Limpiar formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen && deuda) {
      setMonto("");
      setCuentaTesoreriaId("");
      setFechaPago(new Date().toISOString().split('T')[0]);
      setDescripcion("");
    }
  }, [isOpen, deuda]);

  const handleMontoChange = (value: string) => {
    const formattedValue = formatNumberWithCommas(value);
    setMonto(formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deuda) return;

    const montoValue = parseNumberFromInput(monto);

    if (montoValue <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }

    if (montoValue > deuda.saldo) {
      alert(`El monto no puede ser mayor al saldo pendiente (${formatCurrency(deuda.saldo, "ARS", "es-AR")})`);
      return;
    }

    if (!cuentaTesoreriaId) {
      alert("Debe seleccionar una cuenta de tesorería");
      return;
    }

    const pagoData: ProcesarPagoData = {
      deudaId: deuda.id,
      monto: montoValue,
      cuentaTesoreriaId: parseInt(cuentaTesoreriaId),
      fechaPago,
      descripcion: descripcion.trim() || undefined,
    };

    await onPagoRealizado(pagoData);
  };

  if (!deuda) return null;

  const montoMaximo = deuda.saldo;
  const montoActual = parseNumberFromInput(monto);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" preventOutsideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            💰 Procesar Pago de Deuda
          </DialogTitle>
          <DialogDescription>
            Registrar un pago para la deuda de {deuda.cliente?.razon_social || 'Cliente desconocido'}
          </DialogDescription>
        </DialogHeader>

        {/* Información de la deuda */}
        <div className="bg-blue-50 p-3 rounded-lg border">
          <h4 className="font-semibold text-blue-800 mb-2">Información de la Deuda</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Cliente:</span>
              <div className="font-semibold">{deuda.cliente?.razon_social}</div>
            </div>
            <div>
              <span className="text-gray-600">Total:</span>
              <div className="font-semibold text-blue-600">
                {formatCurrency(deuda.total, "ARS", "es-AR")}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Saldo pendiente:</span>
              <div className="font-semibold text-red-600">
                {formatCurrency(deuda.saldo, "ARS", "es-AR")}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Pagado:</span>
              <div className="font-semibold text-green-600">
                {formatCurrency(deuda.total - deuda.saldo, "ARS", "es-AR")}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Monto del Pago *
              </label>
              <Input
                value={monto}
                onChange={(e) => handleMontoChange(e.target.value)}
                placeholder="0,00"
                required
                className={montoActual > montoMaximo ? "border-red-500" : ""}
              />
              {montoActual > montoMaximo && (
                <p className="text-xs text-red-500 mt-1">
                  No puede ser mayor a {formatCurrency(montoMaximo, "ARS", "es-AR")}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Máximo: {formatCurrency(montoMaximo, "ARS", "es-AR")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha del Pago *
              </label>
              <Input
                type="date"
                value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cuenta de Tesorería *
            </label>
            <Select value={cuentaTesoreriaId} onValueChange={setCuentaTesoreriaId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta de tesorería" />
              </SelectTrigger>
              <SelectContent>
                {cuentasTesoreria.map(cuenta => (
                  <SelectItem key={cuenta.id} value={cuenta.id.toString()}>
                    {cuenta.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Forma de pago (efectivo, transferencia, etc.)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción
            </label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional del pago..."
              rows={2}
            />
          </div>

          {/* Resumen del pago */}
          {montoActual > 0 && montoActual <= montoMaximo && (
            <div className="bg-green-50 p-3 rounded-lg border">
              <h4 className="font-semibold text-green-800 mb-2">Resumen del Pago</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Monto a pagar:</span>
                  <div className="font-semibold text-green-600">
                    {formatCurrency(montoActual, "ARS", "es-AR")}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Saldo restante:</span>
                  <div className="font-semibold text-orange-600">
                    {formatCurrency(montoMaximo - montoActual, "ARS", "es-AR")}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || montoActual <= 0 || montoActual > montoMaximo || !cuentaTesoreriaId}
            >
              {isLoading ? "Procesando..." : "Procesar Pago"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}