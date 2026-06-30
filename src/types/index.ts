// ===========================================
// TheLibrary - Definiciones de Tipos
// ===========================================

// Estados de lectura
export type ReadingStatus = 'pending' | 'reading';

// Información del libro desde APIs externas
export interface BookInfo {
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  coverUrl?: string;
  pageCount?: number;
  publisher?: string;
  publishedDate?: string;
  language?: string;
  // Campos extras
  binding?: string; // Encuadernación (tapa dura, blanda, etc.)
  dimensions?: string; // Dimensiones
  series?: string; // Saga/colección
  seriesNumber?: number; // Número en la saga
}

// Respuesta de Google Books API
export interface GoogleBooksResponse {
  totalItems: number;
  items?: Array<{
    volumeInfo: {
      title: string;
      authors?: string[];
      industryIdentifiers?: Array<{
        type: string;
        identifier: string;
      }>;
      description?: string;
      imageLinks?: {
        thumbnail?: string;
        smallThumbnail?: string;
      };
      pageCount?: number;
      publisher?: string;
      publishedDate?: string;
      language?: string;
      dimensions?: {
        height?: string;
        width?: string;
        thickness?: string;
      };
      seriesInfo?: {
        bookDisplayNumber?: number;
        volumeSeriesElement?: {
          seriesName?: string;
          seriesNumber?: number;
        };
      };
    };
  }>;
}

// Respuesta de Open Library API
export interface OpenLibraryResponse {
  docs?: Array<{
    title: string;
    author_name?: string[];
    isbn?: string[];
    cover_i?: number;
    number_of_pages_median?: number;
    publisher?: string[];
    first_publish_year?: number;
    language?: string[];
    physical_format?: string; // Encuadernación
    edition_key?: string[];
  }>;
}

// Estadísticas de la biblioteca
export interface LibraryStats {
  totalBooks: number;
  booksByStatus: {
    pending: number;
    reading: number;
  };
  booksByGenre: Array<{
    genre: string;
    count: number;
  }>;
  totalPagesRead: number;
}
