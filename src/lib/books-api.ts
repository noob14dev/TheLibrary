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
      console.warn(`Google Books API respondió con status ${response.status}`);
      return null;
    }

    const data: GoogleBooksResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const book = data.items[0].volumeInfo;

    // Construir URL de portada (quitar http:// para usar https)
    let coverUrl = book.imageLinks?.thumbnail;
    if (coverUrl) {
      coverUrl = coverUrl.replace('http://', 'https://');
    }

    // Extraer información de dimensiones
    let dimensions: string | undefined;
    if (book.dimensions) {
      const parts: string[] = [];
      if (book.dimensions.height) parts.push(`Alt: ${book.dimensions.height}`);
      if (book.dimensions.width) parts.push(`Ancho: ${book.dimensions.width}`);
      if (book.dimensions.thickness) parts.push(`Grosor: ${book.dimensions.thickness}`);
      if (parts.length > 0) dimensions = parts.join(' x ');
    }

    // Extraer información de saga
    let series: string | undefined;
    let seriesNumber: number | undefined;
    if (book.seriesInfo) {
      series = book.seriesInfo.volumeSeriesElement?.seriesName;
      seriesNumber = book.seriesInfo.volumeSeriesElement?.seriesNumber;
    }

    return {
      title: book.title,
      author: book.authors?.join(', ') || 'Desconocido',
      isbn,
      description: book.description,
      coverUrl,
      pageCount: book.pageCount,
      publisher: book.publisher,
      publishedDate: book.publishedDate,
      language: book.language,
      dimensions,
      series,
      seriesNumber,
    };
  } catch (error) {
    console.warn('Error buscando en Google Books:', error);
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
      console.warn(`Open Library API respondió con status ${response.status}`);
      return null;
    }

    const data: OpenLibraryResponse = await response.json();

    if (!data.docs || data.docs.length === 0) {
      return null;
    }

    const book = data.docs[0];

    // Construir URL de portada
    const coverUrl = book.cover_i ? `${OPEN_LIBRARY_COVERS}/${isbn}-L.jpg` : undefined;

    // Mapear formato físico a encuadernación legible
    const bindingMap: Record<string, string> = {
      hardcover: 'Tapa dura',
      paperback: 'Tapa blanda',
      trade: 'Tapa blanda',
      mass_market: 'Tapa blanda (mercado masivo)',
      board_book: 'Libro de cartón',
      spiral: 'Espiral',
      leather: 'Cuero',
      cloth: 'Tela',
    };

    const binding = book.physical_format
      ? bindingMap[book.physical_format] || book.physical_format
      : undefined;

    // Mapear código de idioma a nombre
    const languageMap: Record<string, string> = {
      eng: 'Inglés',
      spa: 'Español',
      fre: 'Francés',
      ger: 'Alemán',
      ita: 'Italiano',
      por: 'Portugués',
      dut: 'Neerlandés',
      rus: 'Ruso',
      jpn: 'Japonés',
      chi: 'Chino',
      ara: 'Árabe',
      heb: 'Hebreo',
      swe: 'Sueco',
      nor: 'Noruego',
      dan: 'Danés',
      fin: 'Finlandés',
      pol: 'Polaco',
      cze: 'Checo',
      hun: 'Húngaro',
      tur: 'Turco',
      vie: 'Vietnamita',
      tha: 'Tailandés',
      kor: 'Coreano',
      ind: 'Indonesio',
      msu: 'Malayo',
      ukr: 'Ucraniano',
      ron: 'Rumano',
      bul: 'Búlgaro',
      hrv: 'Croata',
      slv: 'Esloveno',
      lit: 'Lituano',
      lav: 'Letón',
      est: 'Estonio',
      cat: 'Catalán',
      glc: 'Gallego',
      eus: 'Vasco',
      unknown: 'Desconocido',
    };

    const languageCode = book.language?.[0];
    const language = languageCode ? languageMap[languageCode] || languageCode : undefined;

    return {
      title: book.title,
      author: book.author_name?.join(', ') || 'Desconocido',
      isbn,
      coverUrl,
      pageCount: book.number_of_pages_median,
      publisher: book.publisher?.[0],
      publishedDate: book.first_publish_year?.toString(),
      language,
      binding,
    };
  } catch (error) {
    console.warn('Error buscando en Open Library:', error);
    return null;
  }
}

/**
 * Busca un libro por ISBN llamando a AMBAS APIs y combinando la información
 * Google Books suele tener mejor descripción y portadas
 * Open Library suele tener mejor información de encuadernación y physical_format
 */
export async function searchBookByISBN(isbn: string): Promise<BookInfo | null> {
  // Limpiar ISBN (quitar guiones y espacios)
  const cleanIsbn = isbn.replace(/[-\s]/g, '');

  // Llamar a ambas APIs en paralelo
  const [googleResult, openLibraryResult] = await Promise.all([
    searchByGoogleBooks(cleanIsbn),
    searchByOpenLibrary(cleanIsbn),
  ]);

  // Si ninguna encontró nada
  if (!googleResult && !openLibraryResult) {
    return null;
  }

  // Combinar resultados: preferir datos no vacíos de cada fuente
  const base = googleResult || openLibraryResult!;
  const extra = openLibraryResult || googleResult!;

  return {
    // Título: preferir Google (generalmente más completo)
    title: base.title || extra.title,
    // Autor: preferir Google
    author: base.author || extra.author,
    isbn: cleanIsbn,
    // Descripción: preferir Google (generalmente más larga)
    description: base.description || extra.description || undefined,
    // Portada: preferir Google (mejor calidad)
    coverUrl: base.coverUrl || extra.coverUrl || undefined,
    // Páginas: preferir Open Library (generalmente más preciso)
    pageCount: extra.pageCount || base.pageCount || undefined,
    // Editorial: preferir Google
    publisher: base.publisher || extra.publisher || undefined,
    // Fecha: preferir Open Library (año de primera publicación)
    publishedDate: base.publishedDate || extra.publishedDate || undefined,
    // Idioma: preferir Open Library (ya mapeado a nombre)
    language: base.language || extra.language || undefined,
    // Encuadernación: solo Open Library tiene esta info
    binding: extra.binding || base.binding || undefined,
    // Dimensiones: solo Google Books tiene esta info
    dimensions: base.dimensions || extra.dimensions || undefined,
    // Saga: solo Google Books tiene esta info
    series: base.series || extra.series || undefined,
    seriesNumber: base.seriesNumber || extra.seriesNumber || undefined,
  };
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
