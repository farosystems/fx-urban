-- Script para crear la tabla de pagos de deudas en Supabase
-- Ejecutar este script en el editor SQL de Supabase

-- Crear tabla pagos_deudas
CREATE TABLE IF NOT EXISTS pagos_deudas (
    id SERIAL PRIMARY KEY,
    fk_id_deuda INTEGER NOT NULL REFERENCES deudas(id) ON DELETE CASCADE,
    fk_id_cliente INTEGER NOT NULL REFERENCES entidades(id),
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
    fk_id_cuenta_tesoreria INTEGER NOT NULL REFERENCES cuentas_tesoreria(id),
    descripcion TEXT,
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_pagos_deudas_deuda ON pagos_deudas(fk_id_deuda);
CREATE INDEX IF NOT EXISTS idx_pagos_deudas_cliente ON pagos_deudas(fk_id_cliente);
CREATE INDEX IF NOT EXISTS idx_pagos_deudas_fecha ON pagos_deudas(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_deudas_cuenta_tesoreria ON pagos_deudas(fk_id_cuenta_tesoreria);
CREATE INDEX IF NOT EXISTS idx_pagos_deudas_creado_el ON pagos_deudas(creado_el);

-- Función para actualizar la fecha de modificación automáticamente
CREATE OR REPLACE FUNCTION update_pagos_deudas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_el = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente la fecha de modificación
CREATE TRIGGER trigger_update_pagos_deudas_updated_at
    BEFORE UPDATE ON pagos_deudas
    FOR EACH ROW
    EXECUTE FUNCTION update_pagos_deudas_updated_at();

-- Habilitar RLS (Row Level Security) si es necesario
ALTER TABLE pagos_deudas ENABLE ROW LEVEL SECURITY;

-- Política básica para permitir todas las operaciones (ajustar según necesidades de seguridad)
CREATE POLICY "Permitir todas las operaciones en pagos_deudas" ON pagos_deudas
    FOR ALL USING (true);

-- Comentarios para documentar la tabla
COMMENT ON TABLE pagos_deudas IS 'Tabla para registrar los pagos realizados sobre deudas externas';
COMMENT ON COLUMN pagos_deudas.fk_id_deuda IS 'Referencia a la deuda que se está pagando';
COMMENT ON COLUMN pagos_deudas.fk_id_cliente IS 'Referencia al cliente que realizó el pago';
COMMENT ON COLUMN pagos_deudas.monto IS 'Monto del pago realizado';
COMMENT ON COLUMN pagos_deudas.fecha_pago IS 'Fecha en que se realizó el pago';
COMMENT ON COLUMN pagos_deudas.fk_id_cuenta_tesoreria IS 'Cuenta de tesorería donde se recibió el pago';
COMMENT ON COLUMN pagos_deudas.descripcion IS 'Descripción opcional del pago';