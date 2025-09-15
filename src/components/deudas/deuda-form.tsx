"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClientes } from "@/services/clientes";
import { CreateDeudaData, DeudaConCliente } from "@/types/deuda";
import { Cliente } from "@/types/cliente";

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

interface DeudaFormProps {
  deuda?: DeudaConCliente;
  onSubmit: (data: CreateDeudaData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeudaForm({ deuda, onSubmit, onCancel, isLoading = false }: DeudaFormProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tipo, setTipo] = useState<"externa" | "interna">(deuda?.tipo || "externa");
  const [clienteId, setClienteId] = useState<string>(deuda?.fk_id_cliente?.toString() || "");
  const [total, setTotal] = useState<string>(
    deuda?.total ? formatNumberWithCommas(deuda.total.toString().replace(".", ",")) : ""
  );
  const [saldo, setSaldo] = useState<string>(
    deuda?.saldo ? formatNumberWithCommas(deuda.saldo.toString().replace(".", ",")) : ""
  );
  const [fecha, setFecha] = useState<string>(deuda?.fecha || new Date().toISOString().split('T')[0]);
  const [descripcion, setDescripcion] = useState<string>(deuda?.descripcion || "");

  useEffect(() => {
    async function fetchClientes() {
      try {
        const clientesData = await getClientes();
        setClientes(clientesData);
      } catch (error) {
        console.error("Error fetching clientes:", error);
      }
    }
    fetchClientes();
  }, []);

  const handleTotalChange = (value: string) => {
    const formattedValue = formatNumberWithCommas(value);
    setTotal(formattedValue);

    // Para deudas nuevas, siempre igualar el saldo al total
    // Para deudas existentes, mantener el saldo actual
    if (!deuda) {
      setSaldo(formattedValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalValue = parseNumberFromInput(total);
    const saldoValue = parseNumberFromInput(saldo);

    if (totalValue <= 0) {
      alert("El total debe ser mayor a 0");
      return;
    }

    if (saldoValue > totalValue) {
      alert("El saldo no puede ser mayor al total");
      return;
    }

    if (tipo === "externa" && !clienteId) {
      alert("Debe seleccionar un cliente para deudas externas");
      return;
    }

    const formData: CreateDeudaData = {
      tipo,
      fk_id_cliente: tipo === "externa" ? parseInt(clienteId) : undefined,
      total: totalValue,
      saldo: saldoValue,
      fecha,
      descripcion: descripcion.trim() || undefined,
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tipo de Deuda</label>
        <Select value={tipo} onValueChange={(value: "externa" | "interna") => {
          setTipo(value);
          if (value === "interna") {
            setClienteId("");
          }
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="externa">Externa (con cliente)</SelectItem>
            <SelectItem value="interna">Interna (del comercio)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tipo === "externa" && (
        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <Select value={clienteId} onValueChange={setClienteId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes
                .filter(cliente => cliente.tipo === "cliente")
                .map(cliente => (
                  <SelectItem key={cliente.id} value={cliente.id.toString()}>
                    {cliente.razon_social} ({cliente.tipo_doc}: {cliente.num_doc})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Total</label>
          <Input
            value={total}
            onChange={(e) => handleTotalChange(e.target.value)}
            placeholder="0,00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Saldo Pendiente
            {!deuda && <span className="text-xs text-gray-500 ml-1">(se autocompleta)</span>}
          </label>
          <Input
            value={saldo}
            onChange={(e) => setSaldo(formatNumberWithCommas(e.target.value))}
            placeholder="0,00"
            required
            disabled={!deuda} // Solo editable en deudas existentes
            className={!deuda ? "bg-gray-50" : ""}
          />
          {!deuda && (
            <p className="text-xs text-gray-500 mt-1">
              El saldo inicial será igual al total. Se actualizará automáticamente con los pagos.
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha</label>
        <Input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <Textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción de la deuda..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : deuda ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}