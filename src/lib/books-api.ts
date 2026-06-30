// ===========================================
// TheLibrary - Servicio de APIs de Libros
// ===========================================

import type { BookInfo, GoogleBooksResponse, OpenLibraryResponse } from '@/types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const OPEN_LIBRARY_API = 'https://openlibrary.org/search.json';
const OPEN_LIBRARY_COVERS = 'https://covers.openlibrary.org/b/isbn';

/**
 * Busca un libro por ISBN en Google Books
 */
async function searchByGoogleBooks(isbn: string): Promise<BookInfo | null> {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API}?q=isbn:${isbn}&maxResults=1`);

    if (!response.ok) {
      throw new Error('Error en Google Books API');
    }

    const data: GoogleBooksResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const book = data.items[0].volumeInfo;

    return {
      title: book.title,
      author: book.authors?.join(', ') || 'Desconocido',
      isbn,
      description: book.description,
      coverUrl: book.imageLinks?.thumbnail,
      pageCount: book.pageCount,
      publisher: book.publisher,
      publishedDate: book.publishedDate,
      language: book.language,
    };
  } catch (error) {
    console.error('Error buscando en Google Books:', error);
    return null;
  }
}

/**
 * Busca un libro por ISBN en Open Library
 */
async function searchByOpenLibrary(isbn: string): Promise<BookInfo | null> {
  try {
    const response = await fetch(`${OPEN_LIBRARY_API}?isbn=${isbn}&limit=1`, {
      headers: {
        'User-Agent': 'TheLibrary/0.1.0 (biblioteca-personal)',
      },
    });

    if (!response.ok) {
      throw new Error('Error en Open Library API');
    }

    const data: OpenLibraryResponse = await response.json();

    if (!data.docs || data.docs.length === 0) {
      return null;
    }

    const book = data.docs[0];

    // Construir URL de portada
    const coverUrl = book.cover_i ? `${OPEN_LIBRARY_COVERS}/${isbn}-L.jpg` : undefined;

    return {
      title: book.title,
      author: book.author_name?.join(', ') || 'Desconocido',
      isbn,
      coverUrl,
      pageCount: book.number_of_pages_median,
      publisher: book.publisher?.[0],
      publishedDate: book.first_publish_year?.toString(),
      language: book.language?.[0],
    };
  } catch (error) {
    console.error('Error buscando en Open Library:', error);
    return null;
  }
}

/**
 * Busca un libro por ISBN en todas las APIs disponibles
 * Primero intenta Google Books, luego Open Library como fallback
 */
export async function searchBookByISBN(isbn: string): Promise<BookInfo | null> {
  // Limpiar ISBN (quitar guiones y espacios)
  const cleanIsbn = isbn.replace(/[-\s]/g, '');

  // Intentar Google Books primero
  const googleResult = await searchByGoogleBooks(cleanIsbn);
  if (googleResult) {
    return googleResult;
  }

  // Fallback a Open Library
  const openLibraryResult = await searchByOpenLibrary(cleanIsbn);
  return openLibraryResult;
}

/**
 * Obtiene la URL de portada de un libro por ISBN
 */
export function getCoverUrl(isbn: string, size: 'S' | 'M' | 'L' = 'L'): string {
  return `${OPEN_LIBRARY_COVERS}/${isbn}-${size}.jpg`;
}

/**
 * Valida si un ISBN es válido (ISBN-10 o ISBN-13)
 */
export function validateISBN(isbn: string): { valid: boolean; type?: string } {
  const cleanIsbn = isbn.replace(/[-\s]/g, '');

  // ISBN-13
  if (/^\d{13}$/.test(cleanIsbn)) {
    // Validación de dígito verificador ISBN-13
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanIsbn[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    if (checkDigit === parseInt(cleanIsbn[12])) {
      return { valid: true, type: 'ISBN-13' };
    }
  }

  // ISBN-10
  if (/^\d{9}[\dXx]$/.test(cleanIsbn)) {
    // Validación de dígito verificador ISBN-10
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanIsbn[i]) * (10 - i);
    }
    const lastChar = cleanIsbn[9].toUpperCase();
    const lastValue = lastChar === 'X' ? 10 : parseInt(lastChar);
    sum += lastValue;
    if (sum % 11 === 0) {
      return { valid: true, type: 'ISBN-10' };
    }
  }

  return { valid: false };
}
