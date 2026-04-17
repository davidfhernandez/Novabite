# NovaBite

Aplicación web de e-commerce para restaurante construida con `Next.js App Router`, `MongoDB`, `Zustand`, `Tailwind CSS`, `Framer Motion`, `jsPDF` y `Recharts`.

## Qué incluye

- Landing page moderna en español.
- Menú conectado a MongoDB.
- Detalle de producto con personalizaciones.
- Carrito persistente con `localStorage`.
- Checkout multi-step funcional.
- Creación real de órdenes en MongoDB.
- Factura PDF con formato colombiano simulado.
- Panel admin con login persistente validado contra MongoDB, dashboard, CRUD de productos, gestión de órdenes y exportación CSV.

## Configuración

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo `.env.local` usando `.env.example`.

3. Asegúrate de tener MongoDB disponible localmente o apunta `MONGODB_URI` a tu instancia remota.

## Desarrollo

```bash
npm run dev
```

## Validación

```bash
npm run lint
npm run build
```

## Admin inicial

El primer usuario admin se crea automáticamente en la colección `AdminUser` usando estas variables de entorno:

- `ADMIN_SEED_EMAIL`
- `ADMIN_SEED_PASSWORD`
- `ADMIN_SEED_ROLE`
