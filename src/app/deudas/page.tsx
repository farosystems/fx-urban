"use client";
import { useEffect, useState, useCallback } from "react";
import { DeudasTable } from "@/components/deudas/deudas-table";
import { DeudaForm } from "@/components/deudas/deuda-form";
import { DeudasFilters } from "@/components/deudas/deudas-filters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Receipt } from "lucide-react";
import { DeudaConCliente, CreateDeudaData, DeudaFilters } from "@/types/deuda";
import { getDeudas, createDeuda, getResumenDeudas } from "@/services/deudas";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4 pl-2">
      <span className="text-gray-600">Tesorería</span>
      <span className="mx-1 text-gray-400">&gt;</span>
      <span className="text-black font-medium">Deudas</span>
    </nav>
  );
}

function ResumenDeudas({ resumen }: { resumen: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Deudas Externas</h3>
        <p className="text-2xl font-bold text-red-600">${resumen.totalExternas.toLocaleString()}</p>
        <p className="text-xs text-gray-400">{resumen.cantidadExternas} deuda(s)</p>
      </div>
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Deudas Internas</h3>
        <p className="text-2xl font-bold text-orange-600">${resumen.totalInternas.toLocaleString()}</p>
        <p className="text-xs text-gray-400">{resumen.cantidadInternas} deuda(s)</p>
      </div>
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Total Deudas</h3>
        <p className="text-2xl font-bold text-gray-800">${(resumen.totalExternas + resumen.totalInternas).toLocaleString()}</p>
        <p className="text-xs text-gray-400">{resumen.cantidadExternas + resumen.cantidadInternas} deuda(s)</p>
      </div>
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Promedio</h3>
        <p className="text-2xl font-bold text-blue-600">
          ${((resumen.totalExternas + resumen.totalInternas) / Math.max(1, resumen.cantidadExternas + resumen.cantidadInternas)).toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">por deuda</p>
      </div>
    </div>
  );
}

export default function DeudasPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [deudas, setDeudas] = useState<DeudaConCliente[]>([]);
  const [resumen, setResumen] = useState<any>({
    totalExternas: 0,
    totalInternas: 0,
    cantidadExternas: 0,
    cantidadInternas: 0
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<DeudaFilters>({});

  const fetchDeudas = async (currentFilters: DeudaFilters = {}) => {
    try {
      const data = await getDeudas(currentFilters);
      setDeudas(data);
    } catch (error) {
      console.error('Error fetching deudas:', error);
      toast.error('Error al cargar las deudas');
    }
  };

  const fetchResumen = async () => {
    try {
      const data = await getResumenDeudas();
      setResumen(data);
    } catch (error) {
      console.error('Error fetching resumen:', error);
    }
  };

  useEffect(() => {
    fetchDeudas(filters);
    fetchResumen();
  }, [filters]);

  const handleAddDeuda = async (data: CreateDeudaData) => {
    try {
      setIsLoading(true);
      await createDeuda(data);
      await fetchDeudas(filters);
      await fetchResumen();
      toast.success('Deuda creada exitosamente');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating deuda:', error);
      toast.error('Error al crear la deuda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = useCallback((newFilters: DeudaFilters) => {
    setFilters(newFilters);
  }, []);

  const handleDeudaUpdated = () => {
    fetchDeudas(filters);
    fetchResumen();
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-muted-foreground gap-4">
        <span>Debes iniciar sesión para ver las deudas.</span>
        <Button onClick={() => router.push("/sign-in")}>Iniciar Sesión</Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Breadcrumb />
      <div className="flex items-center gap-3 mb-2">
        <Receipt className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-extrabold tracking-tight">Deudas</h1>
      </div>
      <div className="mb-6 pl-11">
        <p className="text-gray-500 text-base">
          Administra las deudas externas e internas de tu comercio.
        </p>
      </div>

      <ResumenDeudas resumen={resumen} />

      <div className="flex items-center justify-between mb-4">
        <DeudasFilters onFiltersChange={handleFiltersChange} />
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Deuda
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]" preventOutsideClose>
              <DialogHeader>
                <DialogTitle>Nueva Deuda</DialogTitle>
              </DialogHeader>
              <DeudaForm
                onSubmit={handleAddDeuda}
                onCancel={() => setIsDialogOpen(false)}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DeudasTable data={deudas} onDeudaUpdated={handleDeudaUpdated} />
    </div>
  );
}