# API Reference

## Endpoints

### Books

#### GET /api/books

Obtener todos los libros.

**Query Parameters:**

- `status`: Filtrar por estado (`pending`, `reading`, `finished`)
- `genre`: Filtrar por género
- `shelf`: Filtrar por estantería
- `search`: Buscar por título o autor

**Response:**

```json
{
  "books": [
    {
      "id": "clx1234...",
      "title": "El Principito",
      "author": "Antoine de Saint-Exupéry",
      "isbn": "9780156012195",
      "coverUrl": "https://...",
      "status": "finished",
      "rating": 5,
      "genres": ["Ficción", "Clásicos"],
      "shelves": ["Favoritos"]
    }
  ],
  "total": 100
}
```

#### GET /api/books/:id

Obtener un libro por ID.

**Response:**

```json
{
  "id": "clx1234...",
  "title": "El Principito",
  "author": "Antoine de Saint-Exupéry",
  "isbn": "9780156012195",
  "description": "Un piloto se encuentra varado en el desierto...",
  "coverUrl": "https://...",
  "pageCount": 96,
  "publisher": "HarperCollins",
  "publishedDate": "1943",
  "language": "es",
  "status": "finished",
  "progress": 100,
  "currentPage": 96,
  "rating": 5,
  "review": "Una obra maestra...",
  "genres": ["Ficción", "Clásicos"],
  "shelves": ["Favoritos", "Leídos"],
  "readingSessions": [...]
}
```

#### POST /api/books

Crear un nuevo libro.

**Request Body:**

```json
{
  "title": "El Principito",
  "author": "Antoine de Saint-Exupéry",
  "isbn": "9780156012195",
  "description": "Un piloto se encuentra varado en el desierto...",
  "coverUrl": "https://...",
  "pageCount": 96,
  "publisher": "HarperCollins",
  "publishedDate": "1943",
  "language": "es",
  "genreIds": ["genre1", "genre2"],
  "shelfIds": ["shelf1"]
}
```

**Response:**

```json
{
  "id": "clx1234...",
  "title": "El Principito",
  ...
}
```

#### PUT /api/books/:id

Actualizar un libro.

**Request Body:** (mismo formato que POST, todos los campos son opcionales)

#### DELETE /api/books/:id

Eliminar un libro.

**Response:**

```json
{
  "success": true
}
```

### Search

#### GET /api/search

Buscar libro por ISBN en APIs externas.

**Query Parameters:**

- `isbn`: ISBN del libro (requerido)

**Response:**

```json
{
  "found": true,
  "book": {
    "title": "El Principito",
    "author": "Antoine de Saint-Exupéry",
    "isbn": "9780156012195",
    "description": "Un piloto se encuentra varado en el desierto...",
    "coverUrl": "https://...",
    "pageCount": 96,
    "publisher": "HarperCollins",
    "publishedDate": "1943",
    "language": "es"
  }
}
```

### Shelves

#### GET /api/shelves

Obtener todas las estanterías.

**Response:**

```json
{
  "shelves": [
    {
      "id": "clx1234...",
      "name": "Favoritos",
      "icon": "⭐",
      "sortOrder": 0,
      "bookCount": 15
    }
  ]
}
```

#### POST /api/shelves

Crear una nueva estantería.

**Request Body:**

```json
{
  "name": "Favoritos",
  "icon": "⭐"
}
```

#### PUT /api/shelves/:id

Actualizar una estantería.

#### DELETE /api/shelves/:id

Eliminar una estantería.

## Error Responses

Todos los errores siguen este formato:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Libro no encontrado"
  }
}
```

### Códigos de Error

| Código           | HTTP Status | Descripción                    |
| ---------------- | ----------- | ------------------------------ |
| `BAD_REQUEST`    | 400         | Parámetros inválidos           |
| `NOT_FOUND`      | 404         | Recurso no encontrado          |
| `CONFLICT`       | 409         | Conflicto (ej: ISBN duplicado) |
| `INTERNAL_ERROR` | 500         | Error interno del servidor     |
