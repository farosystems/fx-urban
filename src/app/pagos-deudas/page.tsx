"use client";
import { useEffect, useState, useCallback } from "react";
import { PagosDeudaTable } from "@/components/pagos-deudas/pagos-deuda-table";
import { PagosDeudaFilters } from "@/components/pagos-deudas/pagos-deuda-filters";
import { Banknote } from "lucide-react";
import { PagoDeudaConDetalles } from "@/types/pagoDeuda";
import { getPagosDeudas } from "@/services/pagosDeudas";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PagosFilters {
  cliente?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  cuentaTesoreria?: string;
}

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4 pl-2">
      <span className="text-gray-600">Tesorería</span>
      <span className="mx-1 text-gray-400">&gt;</span>
      <span className="text-black font-medium">Pagos de Deudas</span>
    </nav>
  );
}

function ResumenPagos({ pagos }: { pagos: PagoDeudaConDetalles[] }) {
  const totalPagos = pagos.reduce((sum, pago) => sum + pago.monto, 0);
  const cantidadPagos = pagos.length;
  const promedioPago = cantidadPagos > 0 ? totalPagos / cantidadPagos : 0;

  // Agrupar por cuenta de tesorería
  const porCuentaTesoreria = pagos.reduce((acc, pago) => {
    const cuenta = pago.cuenta_tesoreria?.descripcion || 'Sin cuenta';
    if (!acc[cuenta]) {
      acc[cuenta] = { total: 0, cantidad: 0 };
    }
    acc[cuenta].total += pago.monto;
    acc[cuenta].cantidad += 1;
    return acc;
  }, {} as Record<string, { total: number; cantidad: number }>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Total Recibido</h3>
        <p className="text-2xl font-bold text-green-600">${totalPagos.toLocaleString()}</p>
        <p className="text-xs text-gray-400">{cantidadPagos} pago(s)</p>
      </div>
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Promedio por Pago</h3>
        <p className="text-2xl font-bold text-blue-600">${promedioPago.toLocaleString()}</p>
        <p className="text-xs text-gray-400">por transacción</p>
      </div>
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Método Principal</h3>
        <p className="text-lg font-bold text-purple-600">
          {Object.entries(porCuentaTesoreria)
            .sort(([,a], [,b]) => b.total - a.total)[0]?.[0] || 'N/A'}
        </p>
        <p className="text-xs text-gray-400">más utilizado</p>
      </div>
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Últimos 30 días</h3>
        <p className="text-2xl font-bold text-orange-600">
          {pagos.filter(p => {
            const fecha = new Date(p.fecha_pago);
            const hace30Dias = new Date();
            hace30Dias.setDate(hace30Dias.getDate() - 30);
            return fecha >= hace30Dias;
          }).length}
        </p>
        <p className="text-xs text-gray-400">pagos recientes</p>
      </div>
    </div>
  );
}

export default function PagosDeudaPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [pagos, setPagos] = useState<PagoDeudaConDetalles[]>([]);
  const [pagosFiltrados, setPagosFiltrados] = useState<PagoDeudaConDetalles[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPagos = async () => {
    try {
      setIsLoading(true);
      const data = await getPagosDeudas();
      setPagos(data);
      setPagosFiltrados(data);
    } catch (error) {
      console.error('Error fetching pagos:', error);
      toast.error('Error al cargar los pagos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  const handleFiltersChange = useCallback((filters: PagosFilters) => {
    let filtered = [...pagos];

    if (filters.cliente && filters.cliente.trim() !== "") {
      filtered = filtered.filter(pago =>
        pago.cliente?.razon_social?.toLowerCase().includes(filters.cliente!.toLowerCase())
      );
    }

    if (filters.fechaDesde) {
      filtered = filtered.filter(pago => pago.fecha_pago >= filters.fechaDesde!);
    }

    if (filters.fechaHasta) {
      filtered = filtered.filter(pago => pago.fecha_pago <= filters.fechaHasta!);
    }

    if (filters.cuentaTesoreria && filters.cuentaTesoreria !== "todas") {
      filtered = filtered.filter(pago =>
        pago.cuenta_tesoreria?.descripcion === filters.cuentaTesoreria
      );
    }

    setPagosFiltrados(filtered);
  }, [pagos]);

  if (!isSignedIn) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-muted-foreground gap-4">
        <span>Debes iniciar sesión para ver los pagos de deudas.</span>
        <button onClick={() => router.push("/sign-in")}>Iniciar Sesión</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Breadcrumb />
      <div className="flex items-center gap-3 mb-2">
        <Banknote className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-extrabold tracking-tight">Pagos de Deudas</h1>
      </div>
      <div className="mb-6 pl-11">
        <p className="text-gray-500 text-base">
          Historial completo de todos los pagos recibidos por deudas externas.
        </p>
      </div>

      <ResumenPagos pagos={pagosFiltrados} />

      <div className="flex items-center justify-between mb-4">
        <PagosDeudaFilters onFiltersChange={handleFiltersChange} />
      </div>

      <PagosDeudaTable data={pagosFiltrados} />
    </div>
  );
}