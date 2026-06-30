<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md - TheLibrary

## Dev Environment

### Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Construir para producción
npm run start            # Iniciar servidor de producción

# Código
npm run lint             # Verificar código
npm run lint:fix         # Corregir errores
npm run format           # Formatear código
npm run type-check       # Verificar tipos

# Base de datos
npm run db:push          # Sincronizar esquema
npm run db:studio        # Abrir Prisma Studio
npm run db:generate      # Regenerar cliente Prisma
```

### Estructura del Proyecto

```
src/
├── app/                 # Rutas (App Router)
│   ├── page.tsx         # Dashboard principal
│   ├── books/           # CRUD de libros
│   ├── shelves/         # Estanterías
│   └── api/             # Endpoints API
├── components/          # Componentes React
│   ├── ui/              # Componentes base
│   └── stats/           # Estadísticas
├── lib/                 # Utilidades
│   ├── prisma.ts        # Cliente Prisma (singleton)
│   ├── books-api.ts     # APIs externas
│   └── utils.ts         # Funciones helper
└── types/               # Definiciones TypeScript
```

## Code Style

### Convenciones de Naming

| Elemento         | Convención    | Ejemplo         |
| ---------------- | ------------- | --------------- |
| Carpetas         | `kebab-case`  | `my-component/` |
| Componentes      | `PascalCase`  | `BookCard.tsx`  |
| Utilidades       | `camelCase`   | `formatDate.ts` |
| Variables        | `camelCase`   | `bookTitle`     |
| Constantes       | `UPPER_SNAKE` | `API_BASE_URL`  |
| Types/Interfaces | `PascalCase`  | `BookStatus`    |

### Reglas de Código

1. **Server Components por defecto**: No usar `"use client"` a menos que sea necesario
2. **TypeScript estricto**: No usar `any`, siempre tipar
3. **Imports**: Usar `@/` para rutas absolutas
4. **Componentes**: Un componente por archivo
5. **Exports**: Named exports (no default)

### Formato

- **Prettier**: 100 caracteres por línea, comillas simples
- **ESLint**: Seguir reglas de `next/core-web-vitals`

## Testing

```bash
# Ejecutar tests (cuando estén configurados)
npm test

# Ejecutar tests con cobertura
npm run test:coverage
```

## PR Instructions

1. Crear branch desde `develop`
2. Hacer cambios
3. Ejecutar `npm run lint` y `npm run type-check`
4. Hacer commit siguiendo [COMMIT_CONVENTION.md](COMMIT_CONVENTION.md)
5. Crear PR hacia `develop`
6. Esperar review y merge

## Database

### Schema Location

`prisma/schema.prisma`

### Comandos de Database

```bash
# Sincronizar esquema (desarrollo)
npm run db:push

# Abrir Prisma Studio (GUI)
npm run db:studio

# Regenerar cliente después de cambios
npm run db:generate

# Resetear base de datos
npm run db:reset
```

### Modelo Principal

- `Book`: Información del libro
- `Genre`: Géneros literarios
- `Shelf`: Estanterías personalizadas
- `UserBook`: Estado de lectura
- `Review`: Reseñas y calificaciones
- `ReadingSession`: Historial de lectura
