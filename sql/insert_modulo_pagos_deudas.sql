-- Script para insertar el módulo de Pagos de Deudas
-- Ejecutar este script en el editor SQL de Supabase

-- Insertar módulo de Pagos de Deudas (justo después de DEUDAS)
INSERT INTO public.modulos (nombre, descripcion, icono, ruta, orden, activo) VALUES
('PAGOS_DEUDAS', 'Pagos de Deudas', 'Banknote', '/pagos-deudas', 15, true);

-- Actualizar los órdenes de los módulos posteriores para hacer espacio
UPDATE public.modulos SET orden = orden + 1
WHERE orden >= 15 AND nombre != 'PAGOS_DEUDAS';

-- Verificar que el módulo se insertó correctamente
SELECT id, nombre, descripcion, ruta, orden, activo
FROM public.modulos
WHERE nombre = 'PAGOS_DEUDAS';

-- Ver todos los módulos ordenados (opcional)
SELECT id, nombre, descripcion, ruta, orden, activo
FROM public.modulos
ORDER BY orden;