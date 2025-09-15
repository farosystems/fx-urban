-- Script para crear la tabla de deudas en Supabase
-- Ejecutar este script en el editor SQL de Supabase

-- Crear tabla deudas
CREATE TABLE IF NOT EXISTS deudas (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('externa', 'interna')),
    fk_id_cliente INTEGER REFERENCES entidades(id),
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    saldo DECIMAL(10,2) NOT NULL DEFAULT 0,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    descripcion TEXT,
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_deudas_tipo ON deudas(tipo);
CREATE INDEX IF NOT EXISTS idx_deudas_cliente ON deudas(fk_id_cliente);
CREATE INDEX IF NOT EXISTS idx_deudas_fecha ON deudas(fecha);
CREATE INDEX IF NOT EXISTS idx_deudas_creado_el ON deudas(creado_el);

-- Función para actualizar la fecha de modificación automáticamente
CREATE OR REPLACE FUNCTION update_deudas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_el = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente la fecha de modificación
CREATE TRIGGER trigger_update_deudas_updated_at
    BEFORE UPDATE ON deudas
    FOR EACH ROW
    EXECUTE FUNCTION update_deudas_updated_at();

-- Habilitar RLS (Row Level Security) si es necesario
ALTER TABLE deudas ENABLE ROW LEVEL SECURITY;

-- Política básica para permitir todas las operaciones (ajustar según necesidades de seguridad)
CREATE POLICY "Permitir todas las operaciones en deudas" ON deudas
    FOR ALL USING (true);

-- Comentarios para documentar la tabla
COMMENT ON TABLE deudas IS 'Tabla para gestionar deudas externas e internas del comercio';
COMMENT ON COLUMN deudas.tipo IS 'Tipo de deuda: externa (con clientes) o interna (del comercio)';
COMMENT ON COLUMN deudas.fk_id_cliente IS 'Referencia al cliente (solo para deudas externas)';
COMMENT ON COLUMN deudas.total IS 'Monto total de la deuda';
COMMENT ON COLUMN deudas.saldo IS 'Saldo pendiente de la deuda';
COMMENT ON COLUMN deudas.fecha IS 'Fecha de la deuda';
COMMENT ON COLUMN deudas.descripcion IS 'Descripción o concepto de la deuda';