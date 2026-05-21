# InfernBOT + Nexus Control

  > Bot de Discord con verificación, bienvenidas, tickets, invitaciones y moderación — más un dashboard web completo para configurarlo todo sin tocar código.

  ---

  ## ¿Qué hace?

  | Módulo | Funciones |
  |---|---|
  | **Verificación** | Panel con botón → código por DM → rol automático |
  | **Bienvenida** | Embed personalizable, DM de bienvenida, auto-rol, variables `{user}` `{server}` `{memberCount}` |
  | **Tickets** | Panel con botón, categoría, rol de soporte, log de tickets |
  | **Moderación** | Ban, kick, mute, warn, unban — con log y límite de advertencias |
  | **Invitaciones** | Tracker de invites con ranking por servidor |

  ---

  ## Comandos slash (/`comando``)

  | Comando | Descripción |
  |---|---|
  | `/ban` | Banear a un usuario |
  | `/kick` | Expulsar a un usuario |
  | `/mute` | Silenciar temporalmente |
  | `/unmute` | Quitar el silencio |
  | `/warn` | Advertir a un usuario |
  | `/unban` | Desbanear a un usuario |
  | `/verificar` | Enviar panel de verificación |
  | `/verificacion-config` | Configurar verificación |
  | `/bienvenida-config` | Configurar bienvenida |
  | `/ticket-config` | Configurar tickets |
  | `/invites` | Ver ranking de invitaciones |

  ---

  ## Dashboard — Nexus Control

  Panel web con login via **Discord OAuth2** que permite configurar todos los módulos visualmente.

  ### Páginas disponibles

  | Ruta | Descripción |
  |---|---|
  | `/` | Pantalla de login con Discord |
  | `/servers` | Lista de servidores con el bot activo |
  | `/servers/:id` | Panel general con estadísticas |
  | `/servers/:id/verification` | Configurar verificación + vista previa del embed |
  | `/servers/:id/welcome` | Configurar bienvenida + test de embed en vivo |
  | `/servers/:id/tickets` | Configurar tickets + lista de tickets abiertos |
  | `/servers/:id/moderation` | Configurar moderación + historial de acciones |
  | `/servers/:id/invites` | Ranking de invitaciones + configurar anuncios |

  ### Stack del dashboard

  - **React 19** + **Vite 7** + **Tailwind CSS v4**
  - **TanStack Query** para data fetching
  - **React Hook Form** + **Zod** para formularios
  - **Wouter** para routing
  - **shadcn/ui** (Radix UI) para componentes

  ---

  ## Requisitos

  - Node.js 20+
  - pnpm
  - PostgreSQL (o usar el de Replit)
  - Aplicación de Discord con bot token y OAuth2

  ### Variables de entorno necesarias

  ```env
  DISCORD_TOKEN=           # Token del bot
  DISCORD_CLIENT_ID=       # ID de la aplicación
  DISCORD_CLIENT_SECRET=   # Secreto OAuth2
  SESSION_SECRET=          # Secreto para sesiones Express
  DATABASE_URL=            # URL de PostgreSQL
  ```

  ---

  ## Configurar OAuth2 en Discord

  1. Ve a [discord.com/developers/applications](https://discord.com/developers/applications)
  2. Selecciona tu aplicación → **OAuth2** → **Redirects**
  3. Añade: `https://<tu-dominio>/api/auth/callback`
  4. Guarda los cambios

  ---

  ## Instalación y desarrollo

  ```bash
  pnpm install
  pnpm --filter @workspace/db run push   # Crear tablas en la DB
  pnpm --filter @workspace/api-server run dev   # API + Bot
  pnpm --filter @workspace/dashboard run dev    # Dashboard
  ```

  ---

  ## Estructura del proyecto

  ```
  artifacts/
    api-server/    # Express API + bot de Discord
    dashboard/     # Dashboard React/Vite
  lib/
    db/            # Esquema Drizzle ORM + migraciones
    api-spec/      # Especificación OpenAPI
    api-client-react/  # Hooks generados (TanStack Query)
    api-zod/           # Schemas Zod generados
  ```

  ---

  ## Bugs conocidos / fixes aplicados

  - ✅ **removeChild DOM bug**: parchado en `main.tsx` — el overlay de Vite HMR intentaba eliminar un nodo que no era hijo del padre, causando un error en pantalla.

  ---

  ## Licencia

  MIT
  