-- =====================================================
-- SCRIPT DE INSERCIÓN DE MÓDULOS DEL SISTEMA
-- =====================================================
-- Este script inserta todos los módulos necesarios para el sistema POS
-- Ejecutar después de crear las tablas
-- =====================================================

-- Limpiar tabla de módulos (opcional - solo si necesitas reiniciar)
-- DELETE FROM public.modulos;

-- Insertar todos los módulos del sistema
INSERT INTO public.modulos (nombre, descripcion, icono, ruta, orden, activo) VALUES

-- 1. Dashboard Principal
('DASHBOARD', 'Panel de Control', 'BarChart3', '/dashboard', 1, true),

-- 2. Gestión de Artículos
('ARTICULOS', 'Gestión de Artículos', 'Package', '/articles', 2, true),

-- 3. Gestión de Clientes
('CLIENTES', 'Gestión de Clientes', 'Users', '/clientes', 3, true),

-- 4. Ventas
('VENTAS', 'Ventas', 'ShoppingCart', '/ventas', 4, true),

-- 5. Mis Ventas
('MIS_VENTAS', 'Mis Ventas', 'FileText', '/mis-ventas', 5, true),

-- 6. Pagos
('PAGOS', 'Pagos', 'CreditCard', '/pagos', 6, true),

-- 7. Cuentas Corrientes
('CUENTAS_CORRIENTES', 'Cuentas Corrientes', 'Receipt', '/cuentas-corrientes', 7, true),

-- 8. Movimientos de Stock
('MOVIMIENTOS_STOCK', 'Movimientos de Stock', 'Truck', '/movimientos-stock', 8, true),

-- 9. Importación de Stock
('IMPORTACION_STOCK', 'Importación de Stock', 'Upload', '/importacion-stock', 9, true),

-- 10. Stock Faltante
('STOCK_FALTANTE', 'Stock Faltante', 'AlertTriangle', '/stock-faltante', 10, true),

-- 11. Caja
('CAJA', 'Caja', 'CashRegister', '/caja', 11, true),

-- 12. Empleados
('EMPLEADOS', 'Empleados', 'UserCheck', '/empleados', 12, true),

-- 13. Gastos de Empleados
('GASTOS_EMPLEADOS', 'Gastos de Empleados', 'DollarSign', '/gastos-empleados', 13, true),

-- 14. Liquidaciones
('LIQUIDACIONES', 'Liquidaciones', 'Calculator', '/liquidaciones', 14, true),

-- 15. Talles y Colores
('TALLES_COLORES', 'Talles y Colores', 'Palette', '/talles-colores', 15, true),

-- 16. Variantes de Productos
('VARIANTES_PRODUCTOS', 'Variantes de Productos', 'Layers', '/variantes-productos', 16, true),

-- 17. Agrupadores
('AGRUPADORES', 'Agrupadores', 'Folder', '/agrupadores', 17, true),

-- 18. Usuarios
('USUARIOS', 'Usuarios', 'Users', '/usuarios', 18, true),

-- 19. Seguridad
('SEGURIDAD', 'Seguridad', 'Shield', '/seguridad', 19, true),

-- 20. Home
('HOME', 'Inicio', 'Home', '/home', 20, true);

-- =====================================================
-- VERIFICACIÓN DE INSERCIÓN
-- =====================================================

-- Verificar que todos los módulos se insertaron correctamente
SELECT 
    id,
    nombre,
    descripcion,
    ruta,
    orden,
    activo,
    creado_el
FROM public.modulos 
ORDER BY orden;

-- =====================================================
-- CONTEO DE MÓDULOS INSERTADOS
-- =====================================================

SELECT 
    COUNT(*) as total_modulos,
    COUNT(CASE WHEN activo = true THEN 1 END) as modulos_activos,
    COUNT(CASE WHEN activo = false THEN 1 END) as modulos_inactivos
FROM public.modulos;

-- =====================================================
-- FIN DEL SCRIPT DE INSERCIÓN DE MÓDULOS
-- =====================================================

