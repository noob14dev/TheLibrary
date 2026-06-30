import { NextRequest, NextResponse } from 'next/server';
import { searchBookByISBN, validateISBN } from '@/lib/books-api';

// ===========================================
// GET /api/search?isbn=XXX - Buscar libro por ISBN
// ===========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isbn = searchParams.get('isbn');

    // Validar que se proporcionó el ISBN
    if (!isbn) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'El parámetro ISBN es requerido' } },
        { status: 400 }
      );
    }

    // Validar formato del ISBN
    const validation = validateISBN(isbn);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'ISBN inválido. Use formato ISBN-10 (XXXXXXXXXX) o ISBN-13 (XXXXXXXXXXXXX)',
          },
        },
        { status: 400 }
      );
    }

    // Buscar libro en APIs externas
    const bookInfo = await searchBookByISBN(isbn);

    if (!bookInfo) {
      return NextResponse.json({
        found: false,
        message: 'No se encontró información para este ISBN',
      });
    }

    return NextResponse.json({
      found: true,
      book: bookInfo,
    });
  } catch (error) {
    console.error('Error searching book:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error al buscar el libro' } },
      { status: 500 }
    );
  }
}
