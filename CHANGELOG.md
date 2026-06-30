# Changelog

Todos los cambios notables se documentan en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

## [No publicado]

### Added

- Estructura inicial del proyecto
- Configuración de Next.js 16 con App Router
- TypeScript con modo estricto
- Tailwind CSS para estilos
- Prisma ORM con SQLite
- ESLint + Prettier para linting y formateo
- Husky + lint-staged para pre-commit hooks
- Esquema de base de datos con modelos:
  - Book (libros)
  - Genre (géneros)
  - Shelf (estanterías)
  - ShelfBook (relación libro-estantería)
  - BookGenre (relación libro-género)
  - UserBook (estado de lectura)
  - Review (reseñas y calificaciones)
  - ReadingSession (historial de lectura)
- Servicio de APIs externas:
  - Google Books API
  - Open Library API
- Utilidades generales:
  - Formateo de fechas
  - Validación de ISBN
  - Colores para géneros
  - Estados de lectura
- Documentación:
  - README.md con descripción y guía de instalación
  - CHANGELOG.md con historial de versiones
  - COMMIT_CONVENTION.md con convenciones de commits
  - AGENTS.md con instrucciones para agentes de código
  - docs/arquitectura.md con diseño del sistema
  - docs/api-reference.md con documentación de endpoints
- **Fase 1: CRUD de Libros**
  - API Routes para libros (GET/POST/PUT/DELETE)
  - API Route para búsqueda por ISBN
  - API Routes para géneros y estanterías
  - Página principal con lista de libros
  - Página de detalle del libro
  - Página de creación de libros
  - Página de edición de libros
  - Componente BookCard para mostrar libros
  - Componente BookForm con búsqueda por ISBN
  - Integración con shadcn/ui
  - .env.example con variables de entorno documentadas

### Changed

- N/A

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- N/A

## [0.1.0] - 2026-06-30

### Added

- Initial release
