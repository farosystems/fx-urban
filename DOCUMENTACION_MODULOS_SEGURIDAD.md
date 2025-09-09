# 📋 DOCUMENTACIÓN COMPLETA: MÓDULOS Y SEGURIDAD DEL SISTEMA POS

## 📖 ÍNDICE
1. [Arquitectura General](#arquitectura-general)
2. [Sistema de Módulos](#sistema-de-módulos)
3. [Sistema de Permisos](#sistema-de-permisos)
4. [Autenticación con Clerk](#autenticación-con-clerk)
5. [Autorización por Roles](#autorización-por-roles)
6. [Componentes de Seguridad](#componentes-de-seguridad)
7. [Flujo de Autenticación](#flujo-de-autenticación)
8. [Migración a Otro Sistema](#migración-a-otro-sistema)
9. [Ejemplos de Implementación](#ejemplos-de-implementación)

---

## 🏗️ ARQUITECTURA GENERAL

### Estructura de Base de Datos
```sql
-- Tabla principal de módulos
CREATE TABLE public.modulos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL UNIQUE,
  descripcion text,
  icono text,
  ruta text,
  activo boolean DEFAULT true,
  orden integer DEFAULT 0,
  creado_el timestamp with time zone DEFAULT now(),
  CONSTRAINT modulos_pkey PRIMARY KEY (id)
);

-- Tabla de usuarios (vinculada con Clerk)
CREATE TABLE public.usuarios (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  email text NOT NULL UNIQUE,
  telefono text,
  password_hash text,
  rol text NOT NULL DEFAULT 'cobrador' CHECK (rol IN ('admin', 'supervisor', 'socio')),
  creado_el timestamp with time zone DEFAULT now(),
  prueba_gratis boolean DEFAULT true,
  clerk_user_id text UNIQUE,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);

-- Tabla de permisos por usuario y módulo
CREATE TABLE public.permisos_usuarios (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fk_id_usuario bigint NOT NULL,
  fk_id_modulo bigint NOT NULL,
  puede_ver boolean DEFAULT false,
  creado_el timestamp with time zone DEFAULT now(),
  actualizado_el timestamp with time zone DEFAULT now(),
  CONSTRAINT permisos_usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT permisos_usuarios_fk_id_usuario_fkey FOREIGN KEY (fk_id_usuario) REFERENCES public.usuarios(id),
  CONSTRAINT permisos_usuarios_fk_id_modulo_fkey FOREIGN KEY (fk_id_modulo) REFERENCES public.modulos(id)
);
```

---

## 📦 SISTEMA DE MÓDULOS

### Definición de Módulos
El sistema está organizado en **20 módulos principales**:

| ID | Nombre | Descripción | Icono | Ruta | Orden |
|----|--------|-------------|-------|------|-------|
| 1 | DASHBOARD | Panel de Control | BarChart3 | /dashboard | 1 |
| 2 | ARTICULOS | Gestión de Artículos | Package | /articles | 2 |
| 3 | CLIENTES | Gestión de Clientes | Users | /clientes | 3 |
| 4 | VENTAS | Ventas | ShoppingCart | /ventas | 4 |
| 5 | MIS_VENTAS | Mis Ventas | FileText | /mis-ventas | 5 |
| 6 | PAGOS | Pagos | CreditCard | /pagos | 6 |
| 7 | CUENTAS_CORRIENTES | Cuentas Corrientes | Receipt | /cuentas-corrientes | 7 |
| 8 | MOVIMIENTOS_STOCK | Movimientos de Stock | Truck | /movimientos-stock | 8 |
| 9 | IMPORTACION_STOCK | Importación de Stock | Upload | /importacion-stock | 9 |
| 10 | STOCK_FALTANTE | Stock Faltante | AlertTriangle | /stock-faltante | 10 |
| 11 | CAJA | Caja | CashRegister | /caja | 11 |
| 12 | EMPLEADOS | Empleados | UserCheck | /empleados | 12 |
| 13 | GASTOS_EMPLEADOS | Gastos de Empleados | DollarSign | /gastos-empleados | 13 |
| 14 | LIQUIDACIONES | Liquidaciones | Calculator | /liquidaciones | 14 |
| 15 | TALLES_COLORES | Talles y Colores | Palette | /talles-colores | 15 |
| 16 | VARIANTES_PRODUCTOS | Variantes de Productos | Layers | /variantes-productos | 16 |
| 17 | AGRUPADORES | Agrupadores | Folder | /agrupadores | 17 |
| 18 | USUARIOS | Usuarios | Users | /usuarios | 18 |
| 19 | SEGURIDAD | Seguridad | Shield | /seguridad | 19 |
| 20 | HOME | Inicio | Home | /home | 20 |

### Script de Inserción de Módulos
```sql
-- INSERT_MODULOS.sql
INSERT INTO public.modulos (nombre, descripcion, icono, ruta, orden, activo) VALUES
('DASHBOARD', 'Panel de Control', 'BarChart3', '/dashboard', 1, true),
('ARTICULOS', 'Gestión de Artículos', 'Package', '/articles', 2, true),
('CLIENTES', 'Gestión de Clientes', 'Users', '/clientes', 3, true),
('VENTAS', 'Ventas', 'ShoppingCart', '/ventas', 4, true),
('MIS_VENTAS', 'Mis Ventas', 'FileText', '/mis-ventas', 5, true),
('PAGOS', 'Pagos', 'CreditCard', '/pagos', 6, true),
('CUENTAS_CORRIENTES', 'Cuentas Corrientes', 'Receipt', '/cuentas-corrientes', 7, true),
('MOVIMIENTOS_STOCK', 'Movimientos de Stock', 'Truck', '/movimientos-stock', 8, true),
('IMPORTACION_STOCK', 'Importación de Stock', 'Upload', '/importacion-stock', 9, true),
('STOCK_FALTANTE', 'Stock Faltante', 'AlertTriangle', '/stock-faltante', 10, true),
('CAJA', 'Caja', 'CashRegister', '/caja', 11, true),
('EMPLEADOS', 'Empleados', 'UserCheck', '/empleados', 12, true),
('GASTOS_EMPLEADOS', 'Gastos de Empleados', 'DollarSign', '/gastos-empleados', 13, true),
('LIQUIDACIONES', 'Liquidaciones', 'Calculator', '/liquidaciones', 14, true),
('TALLES_COLORES', 'Talles y Colores', 'Palette', '/talles-colores', 15, true),
('VARIANTES_PRODUCTOS', 'Variantes de Productos', 'Layers', '/variantes-productos', 16, true),
('AGRUPADORES', 'Agrupadores', 'Folder', '/agrupadores', 17, true),
('USUARIOS', 'Usuarios', 'Users', '/usuarios', 18, true),
('SEGURIDAD', 'Seguridad', 'Shield', '/seguridad', 19, true),
('HOME', 'Inicio', 'Home', '/home', 20, true);
```

---

## 🔐 SISTEMA DE PERMISOS

### Estructura de Permisos
```typescript
interface PermisoUsuario {
  id: number;
  fk_id_usuario: number;
  fk_id_modulo: number;
  puede_ver: boolean;
  creado_el: string;
  actualizado_el: string;
}
```

### Roles del Sistema
1. **admin** - Acceso completo a todos los módulos
2. **supervisor** - Acceso a módulos de gestión y reportes
3. **cobrador** - Acceso limitado a ventas y operaciones básicas

### Matriz de Permisos por Rol

| Módulo | Admin | Supervisor | Cobrador |
|--------|-------|------------|----------|
| DASHBOARD | ✅ | ✅ | ✅ |
| ARTICULOS | ✅ | ✅ | ❌ |
| CLIENTES | ✅ | ✅ | ✅ |
| VENTAS | ✅ | ✅ | ✅ |
| MIS_VENTAS | ✅ | ✅ | ✅ |
| PAGOS | ✅ | ✅ | ✅ |
| CUENTAS_CORRIENTES | ✅ | ✅ | ✅ |
| MOVIMIENTOS_STOCK | ✅ | ✅ | ❌ |
| IMPORTACION_STOCK | ✅ | ✅ | ❌ |
| STOCK_FALTANTE | ✅ | ✅ | ❌ |
| CAJA | ✅ | ✅ | ❌ |
| EMPLEADOS | ✅ | ✅ | ❌ |
| GASTOS_EMPLEADOS | ✅ | ✅ | ❌ |
| LIQUIDACIONES | ✅ | ✅ | ❌ |
| TALLES_COLORES | ✅ | ✅ | ❌ |
| VARIANTES_PRODUCTOS | ✅ | ✅ | ❌ |
| AGRUPADORES | ✅ | ✅ | ❌ |
| USUARIOS | ✅ | ❌ | ❌ |
| SEGURIDAD | ✅ | ❌ | ❌ |
| HOME | ✅ | ✅ | ✅ |

---

## 🔑 AUTENTICACIÓN CON CLERK

### Configuración de Clerk
```typescript
// lib/auth-utils.ts
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('No autorizado');
  }
  
  // Buscar usuario en nuestra base de datos
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('id, rol, email, nombre')
    .eq('clerk_user_id', userId)
    .single();
    
  if (error || !usuario) {
    throw new Error('Usuario no encontrado en el sistema');
  }
  
  return usuario;
}
```

### Variables de Entorno Requeridas
```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛡️ AUTORIZACIÓN POR ROLES

### Función de Verificación de Permisos
```typescript
// lib/auth-utils.ts
export async function checkUserPermissions(moduleName: string) {
  const usuario = await getCurrentUser();
  
  // Los administradores tienen acceso completo
  if (usuario.rol === 'admin') {
    return true;
  }
  
  // Verificar permisos específicos del módulo
  const { data: permisos, error } = await supabase
    .from('permisos_usuarios')
    .select(`
      puede_ver,
      modulos!inner(nombre)
    `)
    .eq('fk_id_usuario', usuario.id)
    .eq('modulos.nombre', moduleName)
    .single();
    
  if (error || !permisos) {
    return false;
  }
  
  return permisos.puede_ver;
}
```

### Hook de Verificación de Permisos
```typescript
// hooks/use-permissions.ts
import { useState, useEffect } from 'react';
import { checkUserPermissions } from '@/lib/auth-utils';

export function usePermissions(moduleName: string) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPermissions() {
      try {
        const permission = await checkUserPermissions(moduleName);
        setHasPermission(permission);
      } catch (error) {
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    }

    checkPermissions();
  }, [moduleName]);

  return { hasPermission, loading };
}
```

---

## 🚪 COMPONENTES DE SEGURIDAD

### RouteGuard Component
```typescript
// components/route-guard.tsx
'use client';

import { usePermissions } from '@/hooks/use-permissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
  moduleName: string;
}

export function RouteGuard({ children, moduleName }: RouteGuardProps) {
  const { hasPermission, loading } = usePermissions(moduleName);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !hasPermission) {
      router.push('/dashboard');
    }
  }, [hasPermission, loading, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
}
```

### Middleware de Autenticación
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: ["/api/webhook"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Layout con Protección
```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { RouteGuard } from '@/components/route-guard';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body>
          <RouteGuard moduleName="HOME">
            {children}
          </RouteGuard>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## 🔄 FLUJO DE AUTENTICACIÓN

### 1. Inicio de Sesión
```mermaid
sequenceDiagram
    participant U as Usuario
    participant C as Clerk
    participant S as Supabase
    participant A as App

    U->>C: Inicia sesión
    C->>A: Redirige con token
    A->>S: Busca usuario por clerk_user_id
    S->>A: Retorna datos del usuario
    A->>A: Verifica permisos
    A->>U: Muestra interfaz autorizada
```

### 2. Verificación de Permisos
```mermaid
sequenceDiagram
    participant U as Usuario
    participant A as App
    participant S as Supabase
    participant M as Módulo

    U->>A: Accede a módulo
    A->>S: Verifica permisos del usuario
    S->>A: Retorna permisos
    A->>M: Permite/Deniega acceso
    M->>U: Muestra contenido
```

### 3. Server Actions con Seguridad
```typescript
// app/actions/example.ts
'use server'

import { auth } from '@clerk/nextjs/server';
import { checkUserPermissions } from '@/lib/auth-utils';

export async function secureAction(data: any) {
  // Verificar autenticación
  const { userId } = await auth();
  if (!userId) {
    throw new Error('No autorizado');
  }

  // Verificar permisos del módulo
  const hasPermission = await checkUserPermissions('MODULE_NAME');
  if (!hasPermission) {
    throw new Error('Sin permisos para esta acción');
  }

  // Ejecutar acción segura
  // ... lógica de la acción
}
```

---

## 🔄 MIGRACIÓN A OTRO SISTEMA

### 1. Estructura de Datos a Migrar

#### Tabla de Módulos
```sql
-- Crear tabla de módulos en el nuevo sistema
CREATE TABLE modulos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50),
  ruta VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla de Usuarios
```sql
-- Crear tabla de usuarios en el nuevo sistema
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  rol VARCHAR(20) NOT NULL DEFAULT 'cobrador',
  creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  external_user_id VARCHAR(100) UNIQUE -- Para integración con sistema de auth
);
```

#### Tabla de Permisos
```sql
-- Crear tabla de permisos en el nuevo sistema
CREATE TABLE permisos_usuarios (
  id SERIAL PRIMARY KEY,
  fk_id_usuario INTEGER REFERENCES usuarios(id),
  fk_id_modulo INTEGER REFERENCES modulos(id),
  puede_ver BOOLEAN DEFAULT false,
  creado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Script de Migración de Datos
```sql
-- Migrar módulos
INSERT INTO modulos (nombre, descripcion, icono, ruta, orden, activo)
SELECT nombre, descripcion, icono, ruta, orden, activo
FROM public.modulos
ORDER BY orden;

-- Migrar usuarios (ajustar según el nuevo sistema de auth)
INSERT INTO usuarios (nombre, email, telefono, rol, external_user_id)
SELECT nombre, email, telefono, rol, clerk_user_id
FROM public.usuarios
WHERE activo = true;

-- Migrar permisos
INSERT INTO permisos_usuarios (fk_id_usuario, fk_id_modulo, puede_ver)
SELECT pu.fk_id_usuario, pu.fk_id_modulo, pu.puede_ver
FROM public.permisos_usuarios pu
JOIN public.usuarios u ON pu.fk_id_usuario = u.id
WHERE u.activo = true;
```

### 3. Adaptación del Sistema de Autenticación

#### Opción A: Mantener Clerk
```typescript
// Si mantienes Clerk, adaptar las funciones
export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('No autorizado');
  }
  
  // Buscar en la nueva base de datos
  const usuario = await db.usuarios.findFirst({
    where: { external_user_id: userId }
  });
  
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  
  return usuario;
}
```

#### Opción B: Cambiar a Otro Sistema de Auth
```typescript
// Ejemplo con NextAuth.js
import { getServerSession } from 'next-auth/next';

export async function getCurrentUser() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    throw new Error('No autorizado');
  }
  
  const usuario = await db.usuarios.findFirst({
    where: { email: session.user.email }
  });
  
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  
  return usuario;
}
```

### 4. Adaptación de Componentes

#### RouteGuard Adaptado
```typescript
// components/route-guard.tsx
'use client';

import { useSession } from 'next-auth/react'; // o el sistema que uses
import { usePermissions } from '@/hooks/use-permissions';

export function RouteGuard({ children, moduleName }: RouteGuardProps) {
  const { data: session, status } = useSession();
  const { hasPermission, loading } = usePermissions(moduleName);

  if (status === 'loading' || loading) {
    return <div>Cargando...</div>;
  }

  if (!session || !hasPermission) {
    return <div>Acceso denegado</div>;
  }

  return <>{children}</>;
}
```

---

## 💡 EJEMPLOS DE IMPLEMENTACIÓN

### 1. Página Protegida
```typescript
// app/ventas/page.tsx
import { RouteGuard } from '@/components/route-guard';

export default function VentasPage() {
  return (
    <RouteGuard moduleName="VENTAS">
      <div>
        <h1>Gestión de Ventas</h1>
        {/* Contenido de la página */}
      </div>
    </RouteGuard>
  );
}
```

### 2. Server Action Seguro
```typescript
// app/actions/ventas.ts
'use server'

import { getCurrentUser } from '@/lib/auth-utils';
import { checkUserPermissions } from '@/lib/auth-utils';

export async function crearVenta(datos: any) {
  // Verificar autenticación
  const usuario = await getCurrentUser();
  
  // Verificar permisos
  const puedeVender = await checkUserPermissions('VENTAS');
  if (!puedeVender) {
    throw new Error('Sin permisos para crear ventas');
  }
  
  // Crear venta
  const venta = await db.ventas.create({
    data: {
      ...datos,
      fk_id_usuario: usuario.id
    }
  });
  
  return venta;
}
```

### 3. Hook de Permisos
```typescript
// hooks/use-module-permissions.ts
import { useState, useEffect } from 'react';

export function useModulePermissions(moduleName: string) {
  const [permissions, setPermissions] = useState({
    puede_ver: false,
    puede_crear: false,
    puede_editar: false,
    puede_eliminar: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPermissions() {
      try {
        const response = await fetch(`/api/permissions/${moduleName}`);
        const data = await response.json();
        setPermissions(data);
      } catch (error) {
        console.error('Error cargando permisos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, [moduleName]);

  return { ...permissions, loading };
}
```

### 4. API Route para Permisos
```typescript
// app/api/permissions/[module]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { module: string } }
) {
  try {
    const usuario = await getCurrentUser();
    
    // Obtener permisos del módulo
    const permisos = await db.permisos_usuarios.findFirst({
      where: {
        fk_id_usuario: usuario.id,
        modulos: { nombre: params.module }
      }
    });
    
    return NextResponse.json({
      puede_ver: permisos?.puede_ver || false,
      puede_crear: permisos?.puede_crear || false,
      puede_editar: permisos?.puede_editar || false,
      puede_eliminar: permisos?.puede_eliminar || false
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo permisos' },
      { status: 500 }
    );
  }
}
```

---

## 📋 CHECKLIST DE MIGRACIÓN

### ✅ Preparación
- [ ] Exportar datos de módulos
- [ ] Exportar datos de usuarios
- [ ] Exportar datos de permisos
- [ ] Documentar configuración actual

### ✅ Nuevo Sistema
- [ ] Crear tablas de módulos
- [ ] Crear tablas de usuarios
- [ ] Crear tablas de permisos
- [ ] Configurar sistema de autenticación
- [ ] Implementar funciones de verificación

### ✅ Adaptación
- [ ] Adaptar componentes de seguridad
- [ ] Adaptar hooks de permisos
- [ ] Adaptar server actions
- [ ] Adaptar middleware
- [ ] Probar flujo completo

### ✅ Validación
- [ ] Verificar permisos por rol
- [ ] Verificar acceso a módulos
- [ ] Verificar server actions
- [ ] Verificar UI/UX
- [ ] Documentar cambios

---

## 🔧 CONFIGURACIÓN ADICIONAL

### Variables de Entorno para Nuevo Sistema
```env
# Base de Datos
DATABASE_URL=postgresql://user:password@localhost:5432/database

# Autenticación (ajustar según el sistema elegido)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Otras configuraciones
NODE_ENV=development
```

### Scripts de Utilidad
```bash
# Script para verificar permisos
npm run check-permissions

# Script para migrar datos
npm run migrate-data

# Script para validar integridad
npm run validate-security
```

---

## 📞 SOPORTE Y CONTACTO

Para dudas sobre la migración o implementación:

1. **Revisar documentación** de Clerk/Supabase
2. **Consultar logs** de autenticación
3. **Verificar permisos** en base de datos
4. **Probar flujos** de autenticación

---

**Nota**: Esta documentación debe ser actualizada según las necesidades específicas del nuevo sistema y las preferencias de autenticación elegidas.

