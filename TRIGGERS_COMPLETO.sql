-- =====================================================
-- SCRIPT COMPLETO DE TRIGGERS DEL SISTEMA POS
-- =====================================================
-- Este script crea todos los triggers necesarios para el sistema
-- Ejecutar DESPUÉS de crear todas las tablas
-- =====================================================

-- =====================================================
-- 1. FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar el stock total de un artículo
CREATE OR REPLACE FUNCTION actualizar_stock_total_articulo()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE articulos 
    SET stock = (
        SELECT COALESCE(SUM(stock_unitario), 0)
        FROM variantes_articulos 
        WHERE fk_id_articulo = COALESCE(NEW.fk_id_articulo, OLD.fk_id_articulo)
    )
    WHERE id = COALESCE(NEW.fk_id_articulo, OLD.fk_id_articulo);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Función para calcular el stock actual en movimientos
CREATE OR REPLACE FUNCTION calcular_stock_actual()
RETURNS TRIGGER AS $$
DECLARE
    stock_calculado numeric;
BEGIN
    SELECT COALESCE(SUM(
        CASE 
            WHEN tipo = 'entrada' THEN cantidad
            WHEN tipo = 'salida' THEN -cantidad
            ELSE 0
        END
    ), 0) INTO stock_calculado
    FROM movimientos_stock 
    WHERE fk_id_articulos = NEW.fk_id_articulos
    AND (fk_id_talle = NEW.fk_id_talle OR (fk_id_talle IS NULL AND NEW.fk_id_talle IS NULL))
    AND (fk_id_color = NEW.fk_id_color OR (fk_id_color IS NULL AND NEW.fk_id_color IS NULL))
    AND id <= NEW.id;
    
    NEW.stock_actual := stock_calculado;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para validar stock antes de venta
CREATE OR REPLACE FUNCTION validar_stock_venta()
RETURNS TRIGGER AS $$
DECLARE
    stock_disponible integer;
BEGIN
    IF NEW.tipo = 'salida' AND NEW.origen = 'FACTURA' THEN
        SELECT stock_unitario INTO stock_disponible
        FROM variantes_articulos
        WHERE fk_id_articulo = NEW.fk_id_articulos
        AND (fk_id_talle = NEW.fk_id_talle OR (fk_id_talle IS NULL AND NEW.fk_id_talle IS NULL))
        AND (fk_id_color = NEW.fk_id_color OR (fk_id_color IS NULL AND NEW.fk_id_color IS NULL))
        LIMIT 1;
        
        IF stock_disponible < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente. Disponible: %, Solicitado: %', 
                stock_disponible, NEW.cantidad;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. TRIGGERS PARA GESTIÓN DE STOCK
-- =====================================================

-- Trigger para actualizar stock total del artículo
DROP TRIGGER IF EXISTS trigger_actualizar_stock_articulo ON variantes_articulos;
CREATE TRIGGER trigger_actualizar_stock_articulo
    AFTER INSERT OR UPDATE OR DELETE ON variantes_articulos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_stock_total_articulo();

-- Trigger para calcular stock actual en movimientos
DROP TRIGGER IF EXISTS trigger_calcular_stock_actual ON movimientos_stock;
CREATE TRIGGER trigger_calcular_stock_actual
    BEFORE INSERT OR UPDATE ON movimientos_stock
    FOR EACH ROW
    EXECUTE FUNCTION calcular_stock_actual();

-- Trigger para validar stock antes de ventas
DROP TRIGGER IF EXISTS trigger_validar_stock_venta ON movimientos_stock;
CREATE TRIGGER trigger_validar_stock_venta
    BEFORE INSERT ON movimientos_stock
    FOR EACH ROW
    EXECUTE FUNCTION validar_stock_venta();

-- =====================================================
-- 3. FUNCIONES PARA CUENTAS CORRIENTES
-- =====================================================

-- Función para validar límite de cuenta corriente
CREATE OR REPLACE FUNCTION validar_limite_cuenta_corriente()
RETURNS TRIGGER AS $$
DECLARE
    saldo_actual numeric;
    limite_cliente numeric;
BEGIN
    SELECT maximo_cuenta_corriente INTO limite_cliente
    FROM entidades
    WHERE id = NEW.fk_id_cliente;
    
    SELECT COALESCE(SUM(saldo), 0) INTO saldo_actual
    FROM cuentas_corrientes
    WHERE fk_id_cliente = NEW.fk_id_cliente
    AND estado = 'pendiente';
    
    IF limite_cliente IS NOT NULL AND (saldo_actual + NEW.total) > limite_cliente THEN
        RAISE EXCEPTION 'Cliente excede límite de cuenta corriente';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar límite de cuenta corriente
DROP TRIGGER IF EXISTS trigger_validar_limite_cuenta ON cuentas_corrientes;
CREATE TRIGGER trigger_validar_limite_cuenta
    BEFORE INSERT ON cuentas_corrientes
    FOR EACH ROW
    EXECUTE FUNCTION validar_limite_cuenta_corriente();

-- =====================================================
-- 4. FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para obtener stock de un artículo
CREATE OR REPLACE FUNCTION obtener_stock_articulo(p_articulo_id bigint)
RETURNS numeric AS $$
DECLARE
    stock_total numeric;
BEGIN
    SELECT COALESCE(SUM(stock_unitario), 0) INTO stock_total
    FROM variantes_articulos
    WHERE fk_id_articulo = p_articulo_id;
    
    RETURN stock_total;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener saldo de cliente
CREATE OR REPLACE FUNCTION obtener_saldo_cliente(p_cliente_id bigint)
RETURNS numeric AS $$
DECLARE
    saldo_total numeric;
BEGIN
    SELECT COALESCE(SUM(saldo), 0) INTO saldo_total
    FROM cuentas_corrientes
    WHERE fk_id_cliente = p_cliente_id
    AND estado = 'pendiente';
    
    RETURN saldo_total;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIN DEL SCRIPT DE TRIGGERS
-- =====================================================
