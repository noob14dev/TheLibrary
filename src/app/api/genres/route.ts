import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ===========================================
// GET /api/genres - Obtener todos los géneros
// ===========================================

export async function GET() {
  try {
    const genres = await prisma.genre.findMany({
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedGenres = genres.map((genre: any) => ({
      id: genre.id,
      name: genre.name,
      bookCount: genre._count.books,
    }));

    return NextResponse.json({ genres: formattedGenres });
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error al obtener géneros' } },
      { status: 500 }
    );
  }
}

// ===========================================
// POST /api/genres - Crear un nuevo género
// ===========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'El nombre es requerido' } },
        { status: 400 }
      );
    }

    // Verificar nombre duplicado
    const existingGenre = await prisma.genre.findUnique({
      where: { name: body.name },
    });

    if (existingGenre) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Ya existe un género con ese nombre' } },
        { status: 409 }
      );
    }

    const genre = await prisma.genre.create({
      data: {
        name: body.name,
      },
    });

    return NextResponse.json(genre, { status: 201 });
  } catch (error) {
    console.error('Error creating genre:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error al crear género' } },
      { status: 500 }
    );
  }
}
