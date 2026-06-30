import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ===========================================
// GET /api/books - Obtener todos los libros
// ===========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de filtrado
    const status = searchParams.get('status');
    const genre = searchParams.get('genre');
    const shelf = searchParams.get('shelf');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Construir filtros
    const where: Record<string, unknown> = {};

    if (status) {
      where.userBook = { status };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { isbn: { contains: search } },
      ];
    }

    if (genre) {
      where.genres = {
        some: {
          genre: { name: genre },
        },
      };
    }

    if (shelf) {
      where.shelves = {
        some: {
          shelf: { name: shelf },
        },
      };
    }

    // Ejecutar consulta
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          userBook: {
            select: {
              status: true,
              progress: true,
              currentPage: true,
            },
          },
          genres: {
            include: {
              genre: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          shelves: {
            include: {
              shelf: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.book.count({ where }),
    ]);

    // Formatear respuesta
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedBooks = books.map((book: any) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      coverUrl: book.coverUrl,
      pageCount: book.pageCount,
      status: book.userBook?.status || 'pending',
      progress: book.userBook?.progress || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genres: book.genres.map((bg: any) => ({
        id: bg.genre.id,
        name: bg.genre.name,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shelves: book.shelves.map((bs: any) => ({
        id: bs.shelf.id,
        name: bs.shelf.name,
        icon: bs.shelf.icon,
      })),
      createdAt: book.createdAt,
    }));

    return NextResponse.json({
      books: formattedBooks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error al obtener libros' } },
      { status: 500 }
    );
  }
}

// ===========================================
// POST /api/books - Crear un nuevo libro
// ===========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar campos requeridos
    if (!body.title) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'El título es requerido' } },
        { status: 400 }
      );
    }

    // Verificar ISBN duplicado
    if (body.isbn) {
      const existingBook = await prisma.book.findUnique({
        where: { isbn: body.isbn },
      });

      if (existingBook) {
        return NextResponse.json(
          { error: { code: 'CONFLICT', message: 'Ya existe un libro con este ISBN' } },
          { status: 409 }
        );
      }
    }

    // Crear libro con relaciones
    const book = await prisma.book.create({
      data: {
        title: body.title,
        author: body.author || null,
        isbn: body.isbn || null,
        description: body.description || null,
        coverUrl: body.coverUrl || null,
        pageCount: body.pageCount || null,
        publisher: body.publisher || null,
        publishedDate: body.publishedDate || null,
        language: body.language || null,
        binding: body.binding || null,
        dimensions: body.dimensions || null,
        series: body.series || null,
        seriesNumber: body.seriesNumber || null,

        // Crear registro de UserBook (estado de lectura)
        userBook: {
          create: {
            status: body.status || 'pending',
            progress: 0,
            currentPage: 0,
          },
        },

        // Conectar géneros existentes
        ...(body.genreIds &&
          body.genreIds.length > 0 && {
            genres: {
              create: body.genreIds.map((genreId: string) => ({
                genre: { connect: { id: genreId } },
              })),
            },
          }),

        // Conectar estanterías existentes
        ...(body.shelfIds &&
          body.shelfIds.length > 0 && {
            shelves: {
              create: body.shelfIds.map((shelfId: string) => ({
                shelf: { connect: { id: shelfId } },
              })),
            },
          }),
      },
      include: {
        userBook: true,
        genres: {
          include: { genre: true },
        },
        shelves: {
          include: { shelf: true },
        },
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error al crear el libro' } },
      { status: 500 }
    );
  }
}
