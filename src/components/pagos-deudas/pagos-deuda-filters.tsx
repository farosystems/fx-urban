"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Filter, X } from "lucide-react";
import { getCuentasTesoreria } from "@/services/cuentasTesoreria";

interface CuentaTesoreria {
  id: number;
  descripcion: string;
}

interface PagosDeudaFiltersProps {
  onFiltersChange: (filters: {
    cliente?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    cuentaTesoreria?: string;
  }) => void;
}

export function PagosDeudaFilters({ onFiltersChange }: PagosDeudaFiltersProps) {
  const [cliente, setCliente] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [cuentaTesoreria, setCuentaTesoreria] = useState("todas");
  const [cuentas, setCuentas] = useState<CuentaTesoreria[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadCuentas = async () => {
      try {
        const data = await getCuentasTesoreria();
        setCuentas(data);
      } catch (error) {
        console.error("Error cargando cuentas:", error);
      }
    };
    loadCuentas();
  }, []);

  useEffect(() => {
    const filters = {
      cliente: cliente.trim() || undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      cuentaTesoreria: cuentaTesoreria === "todas" ? undefined : cuentaTesoreria,
    };
    onFiltersChange(filters);
  }, [cliente, fechaDesde, fechaHasta, cuentaTesoreria, onFiltersChange]);

  const clearFilters = () => {
    setCliente("");
    setFechaDesde("");
    setFechaHasta("");
    setCuentaTesoreria("todas");
  };

  const hasActiveFilters = cliente || fechaDesde || fechaHasta || cuentaTesoreria !== "todas";

  return (
    <div className="mb-4">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Filtros
        {hasActiveFilters && (
          <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
            {[cliente, fechaDesde, fechaHasta, cuentaTesoreria !== "todas"].filter(Boolean).length}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="mt-2">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  placeholder="Buscar por cliente..."
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaDesde">Fecha desde</Label>
                <div className="relative">
                  <Input
                    id="fechaDesde"
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaHasta">Fecha hasta</Label>
                <div className="relative">
                  <Input
                    id="fechaHasta"
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuentaTesoreria">Cuenta Tesorería</Label>
                <Select value={cuentaTesoreria} onValueChange={setCuentaTesoreria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las cuentas</SelectItem>
                    {cuentas.map((cuenta) => (
                      <SelectItem key={cuenta.id} value={cuenta.descripcion}>
                        {cuenta.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end mt-4">
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}