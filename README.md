# InfernBOT

Bot de Discord multifuncional con dashboard web de administración. Incluye sistemas de verificación, bienvenida personalizable, tickets de soporte, moderación y rastreo de invitaciones.

## Características

- **Verificación** — Panel con botón y código por DM para verificar miembros
- **Bienvenida** — Embed completamente personalizable enviado al entrar al servidor (título, descripción, color, imagen, miniatura, autor, pie). Botón de prueba para enviar al canal en tiempo real.
- **Tickets** — Sistema de soporte con panel interactivo, categorías y roles de staff
- **Moderación** — Comandos de ban, kick, warn, mute con logs y límite de advertencias
- **Invitaciones** — Rastreo de invitaciones con tabla de líderes (regulares / falsas / salidos)

## Stack Técnico

- **Runtime**: Node.js 24, TypeScript 5.9
- **Bot**: discord.js v14
- **API**: Express 5
- **Base de datos**: PostgreSQL + Drizzle ORM
- **Validación**: Zod v4, drizzle-zod
- **Dashboard**: React + Vite + Tailwind CSS + shadcn/ui
- **Monorepo**: pnpm workspaces
- **API codegen**: Orval (desde spec OpenAPI)

## Estructura del Proyecto

```
artifacts/
  api-server/       # Servidor Express + bot de Discord
    src/
      bot/          # Eventos y lógica del bot
      routes/       # Rutas de la API REST
  dashboard/        # Dashboard web (React + Vite)
    src/
      pages/        # Páginas del dashboard
      components/   # Componentes reutilizables
lib/
  db/               # Esquema de base de datos (Drizzle)
  api-spec/         # Especificación OpenAPI
  api-zod/          # Schemas Zod generados (codegen)
  api-client-react/ # Hooks React Query generados (codegen)
```

## Variables de Entorno Requeridas

| Variable | Descripción |
|---|---|
| `DISCORD_TOKEN` | Token del bot de Discord |
| `DISCORD_CLIENT_ID` | ID de la aplicación de Discord |
| `DISCORD_CLIENT_SECRET` | Secreto OAuth2 de Discord |
| `SESSION_SECRET` | Secreto para las sesiones de Express |
| `DATABASE_URL` | URL de conexión a PostgreSQL |

## Configuración OAuth2 en Discord Developer Portal

En **OAuth2 → Redirects** agrega:
```
https://<tu-dominio>/api/auth/callback
```

## Comandos Principales

```bash
# Desarrollar
pnpm --filter @workspace/api-server run dev   # API + bot (puerto 5000)
pnpm --filter @workspace/dashboard run dev    # Dashboard (puerto dinámico)

# Base de datos
pnpm --filter @workspace/db run push          # Aplicar cambios de esquema

# Codegen
pnpm --filter @workspace/api-spec run codegen # Regenerar hooks y schemas desde OpenAPI

# Typecheck
pnpm run typecheck                            # Verificar tipos en todo el proyecto
```

## Permisos del Bot (Discord)

Al invitar el bot al servidor se requieren los siguientes permisos:
- Administrador (recomendado) o permisos específicos:
  - Gestionar roles, Gestionar canales
  - Expulsar/Banear miembros
  - Enviar mensajes, Gestionar mensajes
  - Ver historial de mensajes

## Cómo funciona la actualización en tiempo real

Los paneles de **Verificación** y **Tickets** se actualizan en Discord automáticamente al guardar la configuración en el dashboard — el bot elimina el mensaje anterior y envía uno nuevo con los cambios.

Para **Bienvenida**, usa el botón **"Enviar prueba"** para ver el embed en el canal configurado con los datos reales del servidor.
