# Convenciones de Commit

Formato basado en [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/).

## Formato

```
<tipo>(<alcance>): <descripción>

[opcional: cuerpo del commit]

[opcional: footer con breaking changes]
```

## Tipos de Commit

| Tipo       | Descripción                    | Ejemplo                                  |
| ---------- | ------------------------------ | ---------------------------------------- |
| `feat`     | Nueva funcionalidad            | `feat(books): agregar búsqueda por ISBN` |
| `fix`      | Corrección de bug              | `fix(shelves): corregir ordenamiento`    |
| `docs`     | Cambios en documentación       | `docs: actualizar README`                |
| `style`    | Formato (sin cambio de lógica) | `style: aplicar Prettier`                |
| `refactor` | Refactorización de código      | `refactor: extraer servicio de API`      |
| `test`     | Añadir/corregir tests          | `test: agregar tests para BookCard`      |
| `chore`    | Tareas de mantenimiento        | `chore: actualizar dependencias`         |
| `perf`     | Mejoras de rendimiento         | `perf: optimizar consultas Prisma`       |
| `ci`       | Cambios en CI/CD               | `ci: agregar GitHub Actions`             |
| `build`    | Cambios en el sistema de build | `build: configurar Webpack`              |
| `revert`   | Revertir un commit anterior    | `refeat: revertir cambio en API`         |

## Alcances (Opcionales)

El alcance indica qué parte del código afecta el commit:

- `books`: Funcionalidad de libros
- `shelves`: Estanterías y organizaciones
- `genres`: Géneros y categorías
- `stats`: Estadísticas y dashboard
- `api`: Endpoints de API
- `ui`: Componentes de interfaz
- `db`: Base de datos y Prisma
- `config`: Configuración del proyecto

## Ejemplos

```bash
# Funcionalidad nueva
git commit -m "feat(books): agregar formulario de creación de libros"

# Corrección de bug
git commit -m "fix(api): corregir búsqueda por ISBN con caracteres especiales"

# Documentación
git commit -m "docs: agregar guía de instalación en README"

# Breaking change
git commit -m "feat(api)!: cambiar formato de respuesta de books API

BREAKING CHANGE: La respuesta de GET /api/books ahora retorna un objeto con pagination"
```

## Reglas

1. **Usar imperativo**: "agregar feature" no "agregué feature"
2. **No capitalizar**: "agregar feature" no "Agregar feature"
3. **No punto al final**: "agregar feature" no "agregar feature."
4. **Descripción concisa**: Máximo 72 caracteres
5. **Body opcional**: Explicar el por qué, no el qué
6. **Footer para breaking changes**: Indicar qué cambió y cómo migrar
