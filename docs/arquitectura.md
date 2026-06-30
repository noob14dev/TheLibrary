# Arquitectura del Proyecto

## Diagrama de Alta Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                      TheLibrary                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │   Frontend  │    │   Backend   │    │  External   │    │
│  │  (Next.js)  │◄──►│  (API Routes)│◄──►│   APIs      │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│         │                   │                   │          │
│         │                   │                   │          │
│         ▼                   ▼                   ▼          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │  Components │    │   Prisma    │    │Google Books │    │
│  │    (React)  │    │    ORM      │    │Open Library │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│                          │                                  │
│                          ▼                                  │
│                    ┌─────────────┐                          │
│                    │   SQLite    │                          │
│                    │  Database   │                          │
│                    └─────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Capas de la Aplicación

### 1. Frontend (Presentation Layer)

**Ubicación:** `src/app/`, `src/components/`

**Responsabilidades:**

- Renderizar la interfaz de usuario
- Manejar interacciones del usuario
- Enviar solicitudes al backend

**Tecnologías:**

- React con Server Components (App Router)
- Tailwind CSS para estilos
- shadcn/ui para componentes

### 2. Backend (Application Layer)

**Ubicación:** `src/app/api/`

**Responsabilidades:**

- Procesar solicitudes HTTP
- Ejecutar lógica de negocio
- Responder con datos

**Patrón:** API Routes de Next.js

### 3. Data Access Layer

**Ubicación:** `src/lib/prisma.ts`

**Responsabilidades:**

- Acceder a la base de datos
- Ejecutar consultas CRUD
- Gestionar transacciones

**Tecnología:** Prisma ORM

### 4. External Services Layer

**Ubicación:** `src/lib/books-api.ts`

**Responsabilidades:**

- Comunicar con APIs externas
- Buscar información de libros
- Obtener portadas

**APIs:**

- Google Books API
- Open Library API

## Modelo de Datos

### Relaciones

```
Book (1) ──── (1) UserBook
Book (1) ──── (1) Review
Book (1) ──── (N) ReadingSession
Book (N) ──── (N) Genre (via BookGenre)
Book (N) ──── (N) Shelf (via ShelfBook)
```

### Diagrama ER

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Book     │       │   Genre     │       │    Shelf    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │◄──┐   │ id          │   ┌──►│ id          │
│ title       │   │   │ name        │   │   │ name        │
│ author      │   │   └─────────────┘   │   │ icon        │
│ isbn        │   │                     │   │ sortOrder   │
│ description │   │   ┌─────────────┐   │   └─────────────┘
│ coverUrl    │   ├───│ BookGenre   │───┘
│ coverPath   │   │   ├─────────────┤       ┌─────────────┐
│ pageCount   │   │   │ bookId      │       │ ShelfBook   │
│ publisher   │   │   │ genreId     │       ├─────────────┤
│ publishedAt │   │   └─────────────┘       │ id          │
│ language    │   │                         │ shelfId     │
│ createdAt   │   │   ┌─────────────┐       │ bookId      │
│ updatedAt   │   │   │ UserBook    │       │ addedAt     │
└─────────────┘   │   ├─────────────┤       │ sortOrder   │
                  ├───│ id          │       └─────────────┘
                  │   │ bookId      │
                  │   │ status      │
                  │   │ progress    │
                  │   │ currentPage │
                  │   │ startedAt   │
                  │   │ finishedAt  │
                  │   │ lastReadAt  │
                  │   └─────────────┘
                  │
                  │   ┌─────────────┐
                  │   │   Review    │
                  │   ├─────────────┤
                  ├───│ id          │
                  │   │ bookId      │
                  │   │ rating      │
                  │   │ content     │
                  │   │ createdAt   │
                  │   │ updatedAt   │
                  │   └─────────────┘
                  │
                  │   ┌─────────────┐
                  │   │ReadingSession│
                  │   ├─────────────┤
                  └───│ id          │
                      │ bookId      │
                      │ pagesRead   │
                      │ duration    │
                      │ date        │
                      │ notes       │
                      └─────────────┘
```

## Flujo de Datos

### Agregar un Libro

```
1. Usuario ingresa ISBN
2. Frontend envía GET /api/search?isbn=XXX
3. Backend consulta Google Books/Open Library
4. Backend retorna información del libro
5. Frontend muestra formulario con datos auto-completados
6. Usuario confirma y envía POST /api/books
7. Backend guarda en SQLite via Prisma
8. Frontend actualiza la lista de libros
```

### Estadísticas

```
1. Frontend solicita GET /api/stats
2. Backend ejecuta consultas聚合:
   - COUNT por status
   - GROUP BY genre
   - AVG rating
   - SUM pagesRead
3. Backend retorna estadísticas
4. Frontend renderiza gráficos
```

## Decisiones de Diseño

### ¿Por qué App Router?

- Server Components por defecto (mejor rendimiento)
- Layouts anidados (UI compartida)
- Loading states automáticos
- Mejor soporte para SEO

### ¿Por qué SQLite?

- Sin servidor externo
- Archivo único, fácil de respaldar
- Rendimiento excepcional para uso personal
- Soporte nativo en Prisma

### ¿Por qué Prisma?

- Tipado automático desde el esquema
- Migraciones integradas
- Client optimizado para serverless
- Excelente documentación

### ¿Por qué múltiples APIs?

- Google Books: Metadatos detallados
- Open Library: Sin API key, más permisiva
- Fallback automático si una falla
