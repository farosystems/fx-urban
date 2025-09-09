-- =====================================================
-- AGREGAR CAMPO FECHA_GASTO A TABLA GASTOS_EMPLEADOS
-- =====================================================

-- Agregar columna fecha_gasto a la tabla gastos_empleados
-- Usamos timestamp para evitar problemas de zona horaria
ALTER TABLE public.gastos_empleados 
ADD COLUMN fecha_gasto timestamp with time zone DEFAULT now();

-- Comentario de la columna
COMMENT ON COLUMN public.gastos_empleados.fecha_gasto IS 'Fecha específica del gasto (puede ser diferente a creado_el)';