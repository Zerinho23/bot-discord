# InfernBOT + Nexus Control

> Bot de Discord con verificación, bienvenidas, entradas, invitaciones y moderación — más un dashboard web completo para configurarlo todo sin tocar código.

---

## ¿Qué hace?

| Módulo | Funciones |
|---|---|
| **Verificación** | Panel con botón → código por DM → rol automático |
| **Bienvenida** | Embed personalizable, DM, auto-rol |
| **Tickets** | Sistema de tickets con categoría y rol de soporte |
| **Moderación** | `/ban`, `/kick`, `/mute`, `/unmute`, `/warn`, `/warnings`, `/clear` + log de acciones |
| **Invitaciones** | Rastreo en tiempo real, top invitadores con `/invite-top` |

---

## Stack

| Capa | Tecnología |
|---|---|
| Bot | discord.js 14 |
| API | Express 5 + Drizzle ORM + PostgreSQL |
| Dashboard | React 19 + Vite + TailwindCSS 4 |
| Monorepo | pnpm workspaces + TypeScript 5 |
| Validación | Zod v4 + drizzle-zod |

---

## Estructura del repo

```
artifacts/
  api-server/       # Bot de Discord + API REST
    src/
      bot/
        commands/   # /ban, /kick, /mute, /warn, /clear, etc.
        events/     # ready, guildMemberAdd, interactionCreate, etc.
        panels.ts   # Paneles de verificación y tickets
      routes/
        auth.ts     # OAuth2 con Discord
        guilds.ts   # Endpoints del dashboard
  dashboard/        # Dashboard web (React + Vite)
    src/
      pages/
        index.tsx            # Login
        servers/index.tsx    # Lista de servidores
        servers/[guildId]/   # Módulos por servidor
      components/
        layout/SidebarLayout.tsx
lib/
  db/       # Schema Drizzle + migraciones
  api-spec/ # OpenAPI spec
  api-zod/  # Schemas Zod generados
```

---

## Configuración

### Variables de entorno requeridas

```env
DATABASE_URL=          # PostgreSQL connection string
DISCORD_TOKEN=         # Token del bot (Discord Developer Portal)
DISCORD_CLIENT_ID=     # Application ID
DISCORD_CLIENT_SECRET= # OAuth2 Secret (para el dashboard)
SESSION_SECRET=        # Secreto aleatorio para las sesiones
```

### Configurar el bot en Discord Developer Portal

1. Ir a [discord.com/developers/applications](https://discord.com/developers/applications)
2. Crear o abrir tu aplicación
3. **Bot** → copiar el token → guardarlo como `DISCORD_TOKEN`
4. **General Information** → copiar Application ID → `DISCORD_CLIENT_ID`
5. **OAuth2** → añadir redirect URI: `https://TU_DOMINIO/api/auth/callback`
6. **Bot** → activar los Privileged Intents:
   - `SERVER MEMBERS INTENT`
   - `MESSAGE CONTENT INTENT`
7. Invitar el bot con estos scopes: `bot`, `applications.commands`
8. Permisos mínimos: `Administrator` (o los permisos específicos de cada comando)

---

## Desarrollo local

```bash
# Instalar dependencias
pnpm install

# Ejecutar el API server (bot + rutas)
pnpm --filter @workspace/api-server run dev

# Ejecutar el dashboard
pnpm --filter @workspace/dashboard run dev

# Aplicar schema a la base de datos
pnpm --filter @workspace/db run push

# Typecheck completo
pnpm run typecheck
```

---

## Comandos del bot

| Comando | Descripción | Permisos |
|---|---|---|
| `/ban` | Banear usuario + log | Ban Members |
| `/kick` | Expulsar usuario + log | Kick Members |
| `/mute` | Silenciar (timeout) con duración | Moderate Members |
| `/unmute` | Quitar silencio | Moderate Members |
| `/warn` | Advertir y notificar por DM | Moderate Members |
| `/warnings` | Ver advertencias de un usuario | Moderate Members |
| `/clear` | Eliminar mensajes en masa (1–100) | Manage Messages |
| `/setup-verification` | Enviar panel de verificación | Administrator |
| `/setup-tickets` | Enviar panel de tickets | Administrator |
| `/invite-top` | Top de invitadores del servidor | Todos |

---

## Cómo funciona la verificación

1. El admin configura el canal y rol desde el dashboard
2. El bot envía un panel con un botón "Verificar" al canal
3. El usuario hace clic → recibe un código de 6 caracteres en una respuesta efímera
4. El usuario escribe el código en el canal de verificación
5. El bot asigna el rol y borra el mensaje automáticamente

---

## Licencia

MIT
