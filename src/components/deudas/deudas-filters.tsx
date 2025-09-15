"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { DeudaFilters } from "@/types/deuda";

interface DeudasFiltersProps {
  onFiltersChange: (filters: DeudaFilters) => void;
}

export function DeudasFilters({ onFiltersChange }: DeudasFiltersProps) {
  const [tipo, setTipo] = useState<string>("todos");
  const [cliente, setCliente] = useState<string>("");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  // Aplicar filtros automáticamente cuando cambien
  useEffect(() => {
    const filters: DeudaFilters = {};

    if (tipo && tipo !== "" && tipo !== "todos") {
      filters.tipo = tipo as "externa" | "interna";
    }

    if (cliente.trim() !== "") {
      filters.cliente = cliente.trim();
    }

    if (fechaDesde) {
      filters.fechaDesde = fechaDesde;
    }

    if (fechaHasta) {
      filters.fechaHasta = fechaHasta;
    }

    onFiltersChange(filters);
  }, [tipo, cliente, fechaDesde, fechaHasta]); // Removí onFiltersChange de las dependencias

  const clearFilters = () => {
    setTipo("todos");
    setCliente("");
    setFechaDesde("");
    setFechaHasta("");
  };

  const hasActiveFilters = (tipo && tipo !== "todos") || cliente || fechaDesde || fechaHasta;

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Filter className="w-4 h-4" />
        Filtros:
      </div>

      {/* Filtro por tipo */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Tipo</label>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="externa">Externa</SelectItem>
            <SelectItem value="interna">Interna</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtro por cliente */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Cliente</label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-8 w-48"
          />
        </div>
      </div>

      {/* Filtro por fecha desde */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Desde</label>
        <Input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="w-36"
        />
      </div>

      {/* Filtro por fecha hasta */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">Hasta</label>
        <Input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="w-36"
        />
      </div>

      {/* Botón para limpiar filtros */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="flex items-center gap-1 mt-5"
        >
          <X className="w-3 h-3" />
          Limpiar
        </Button>
      )}

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-5">
          <Filter className="w-3 h-3" />
          {[tipo && tipo !== "todos" && "Tipo", cliente && "Cliente", fechaDesde && "Fecha desde", fechaHasta && "Fecha hasta"]
            .filter(Boolean)
            .join(", ")} aplicado(s)
        </div>
      )}
    </div>
  );
}