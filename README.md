# StockFlow - Inventory Management System

URL: stock-flow-theta.vercel.app

## Descripción General

StockFlow es una aplicación web moderna y robusta diseñada para la gestión eficiente de inventarios y facturación. Permite a las empresas rastrear productos, gestionar stock, generar facturas y visualizar métricas clave en tiempo real a través de un panel de control intuitivo.

El proyecto está diseñado para ser escalable y seguro, utilizando autenticación y base de datos en la nube. Con una interfaz limpia y responsive, StockFlow facilita la administración diaria de pequeños y medianos negocios.

### Características Clave:
- **Gestión de Inventario:** Añade, edita y elimina productos. Controla existencias, precios y categorías. Alertas automáticas de stock bajo.
- **Facturación:** Crea, visualiza y filtra facturas por estado (Pagada, Pendiente, Borrador). Exportación de facturas.
- **Registro de Ventas:** Interfaz rápida para registrar salidas de stock y actualizar el inventario automáticamente.
- **Dashboard Analítico:** Visualización gráfica de la distribución de productos, valor total del inventario y alertas de stock en tiempo real.
- **Configuración de Usuario y Empresa:** Gestión de perfiles, roles de usuario (Admin/User), y personalización de datos de la empresa (logo, nombre).
- **Seguridad:** Autenticación robusta y gestión de sesiones.

## Stack Tecnológico

Este proyecto ha sido construido utilizando las tecnologías más avanzadas del ecosistema web actual, garantizando rendimiento y mantenibilidad.

### Core:
- **React (v19):** Biblioteca principal para la construcción de la interfaz de usuario.
- **Vite:** Empaquetador y servidor de desarrollo de última generación, extremadamente rápido.
- **TypeScript:** Superset de JavaScript que añade tipado estático para un código más robusto y seguro.
- **Tailwind CSS:** Framework de utilidades CSS para un diseño rápido, flexible y responsive.

### Backend y Servicios:
- **Supabase:** Plataforma Backend-as-a-Service (BaaS) que proporciona base de datos PostgreSQL en tiempo real, autenticación y almacenamiento de archivos.

### Herramientas de Desarrollo e IA:
- **Claude:** Asistente de IA utilizado para la revisión de código, optimización y generación de documentación.
- **Gemini:** Integrado potencialmente para funcionalidades de IA avanzadas en la aplicación.
- **Warp:** Terminal moderna utilizada para la ejecución eficiente de comandos y scripts durante el desarrollo.
- **Stitch:** Herramienta utilizada para el diseño y prototipado de la interfaz.

### Calidad y Testing:
- **Vitest & React Testing Library:** Implementación de tests unitarios e integración para garantizar el correcto funcionamiento de los componentes críticos y la lógica de negocio.

## Instalación y Ejecución

StockFlow es una aplicación web moderna que se ejecuta en el navegador.

### Requisitos Previos:
- **Node.js:** Versión 18 o superior.
- **Cuenta de Supabase:** Necesaria para conectar la base de datos y la autenticación.

### Pasos para ejecutar localmente:

1.  **Clonar el repositorio** (si aplica) o descargar los archivos.
    ```bash
    git clone <url-del-repo>
    cd stockflow
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Supabase:
    ```env
    VITE_SUPABASE_URL=tu_supabase_url
    VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
    ```

4.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000` (o el puerto que indique la terminal).

5.  **Ejecutar Tests:**
    Para verificar que todo funciona correctamente:
    ```bash
    npm test
    ```

## Estructura del Proyecto

La estructura de carpetas está organizada para promover la escalabilidad y el orden:

```
stockflow/
├── components/         # Componentes reutilizables (ej. ChatBot)
├── context/            # Contextos de React (ej. AuthContext para autenticación global)
├── lib/                # Configuración de librerías externas (ej. cliente de supabase)
├── pages/              # Páginas principales de la aplicación (Rutas)
│   ├── AddProduct.tsx      # Formulario de alta de productos
│   ├── Dashboard.tsx       # Panel principal con gráficos y métricas
│   ├── Inventory.tsx       # Listado y filtros de inventario
│   ├── Invoices.tsx        # Gestión de facturas
│   ├── Login.tsx           # Pantalla de inicio de sesión
│   ├── RegisterSale.tsx    # Interfaz de punto de venta
│   ├── Settings.tsx        # Configuración de perfil y empresa
│   ├── Support.tsx         # Página de soporte
│   └── ...                 # Otras páginas (FAQ, History, etc.)
├── tests/              # Tests unitarios y de integración
│   ├── components/         # Tests de componentes
│   └── pages/              # Tests de páginas completas
├── types/              # Definiciones de tipos TypeScript globales
├── App.tsx             # Componente raíz y configuración de Rutas
├── index.html          # Punto de entrada HTML
├── index.tsx           # Punto de entrada de React
├── vite.config.ts      # Configuración de Vite y Vitest
└── package.json        # Dependencias y scripts del proyecto
```

## Funcionalidades Principales Detalladas

### 1. Dashboard (Panel de Control)
El centro de mando de la aplicación. Muestra tarjetas con métricas vitales: Total de Productos, Valor del Inventario y Alertas de Stock Bajo. Incluye gráficos visuales sobre la distribución del inventario y una tabla de acceso rápido a los productos agotados. También muestra un feed de actividad reciente.

### 2. Inventario Inteligente
Permite listar todos los productos con paginación y filtrado por categorías. Los usuarios pueden añadir nuevos productos con imágenes personalizadas, editar detalles existentes o eliminar items. El sistema calcula automáticamente el valor total.

### 3. Facturación y Ventas
- **Invoices:** Generación y gestión de facturas. Filtrado por estados (Pagada, Pendiente, Borrador) para un mejor control financiero.
- **Register Sale:** Módulo dedicado para registrar ventas rápidas, descontando el stock automáticamente en tiempo real.

### 4. Configuración y Perfil
- **Settings:** Los usuarios pueden personalizar su perfil (nombre, bio, avatar).
- **Seguridad:** Gestión de contraseñas y visualización de roles (Admin/User).
- **Roles:** El sistema distingue entre Administradores (con acceso total a configuraciones de empresa) y Usuarios estándar.

### 5. Soporte y Ayuda
Incluye secciones de FAQ y contacto con soporte, accesibles desde la aplicación, para resolver dudas comunes sobre el uso de la plataforma.
