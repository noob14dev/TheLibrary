# TheLibrary

> Biblioteca personal para gestionar tu colección de libros físicos y digitales.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-green)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Descripción

TheLibrary es una aplicación web para gestionar tu biblioteca personal de libros. Permite:

- **Catálogo de libros**: Agregar, editar y eliminar libros de tu colección
- **Búsqueda por ISBN**: Auto-completar información del libro desde APIs externas
- **Portadas automáticas**: Obtener portadas de Google Books y Open Library
- **Organización**: Crear estanterías personalizadas y asignar géneros
- **Seguimiento de lectura**: Registrar estado, progreso y calificaciones
- **Estadísticas**: Ver métricas de tu biblioteca personal

## Quick Start

### Prerrequisitos

- Node.js 18+ (recomendado: 20)
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/the-library.git
cd the-library

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Crear base de datos
npm run db:push

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Tech Stack

| Tecnología                                    | Propósito                      |
| --------------------------------------------- | ------------------------------ |
| [Next.js 16](https://nextjs.org/)             | Framework React con App Router |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estático                |
| [Prisma](https://www.prisma.io/)              | ORM para base de datos         |
| [SQLite](https://www.sqlite.org/)             | Base de datos local            |
| [Tailwind CSS](https://tailwindcss.com/)      | Estilos utility-first          |
| [shadcn/ui](https://ui.shadcn.com/)           | Componentes de UI              |

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción

# Código
npm run lint         # Verificar código con ESLint
npm run lint:fix     # Corregir errores automáticamente
npm run format       # Formatear código con Prettier
npm run type-check   # Verificar tipos TypeScript

# Base de datos
npm run db:push      # Sincronizar esquema con la BD
npm run db:studio    # Abrir Prisma Studio (GUI)
npm run db:generate  # Regenerar cliente Prisma
npm run db:reset     # Resetear base de datos
```

## Estructura del Proyecto

```
the-library/
├── prisma/              # Esquema de base de datos
├── src/
│   ├── app/             # Rutas (App Router)
│   ├── components/      # Componentes React
│   ├── lib/             # Utilidades y configuración
│   └── types/           # Definiciones TypeScript
├── docs/                # Documentación técnica
└── public/              # Assets estáticos
```

## Roadmap

- [x] Fase 0: Setup del proyecto
- [ ] Fase 1: CRUD de libros
- [ ] Fase 2: Búsqueda por ISBN y portadas
- [ ] Fase 3: Estanterías y géneros
- [ ] Fase 4: Dashboard y estadísticas
- [ ] Fase 5: Integración con Calibre
- [ ] Fase 6: Servidor EPUB para KOReader

## Contributing

Las contribuciones son bienvenidas. Por favor, lee [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.

## License

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.
