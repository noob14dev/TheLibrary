import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ===========================================
// GET /api/books/:id - Obtener un libro por ID
// ===========================================

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        userBook: true,
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
        readingSessions: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Libro no encontrado' } },
        { status: 404 }
      );
    }

    // Formatear respuesta
    const formattedBook = {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      description: book.description,
      coverUrl: book.coverUrl,
      pageCount: book.pageCount,
      publisher: book.publisher,
      publishedDate: book.publishedDate,
      language: book.language,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,

      // Estado de lectura
      status: book.userBook?.status || 'pending',
      progress: book.userBook?.progress || 0,
      currentPage: book.userBook?.currentPage || 0,
      startedAt: book.userBook?.startedAt,
      finishedAt: book.userBook?.finishedAt,
      lastReadAt: book.userBook?.lastReadAt,

      // Géneros
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genres: book.genres.map((bg: any) => ({
        id: bg.genre.id,
        name: bg.genre.name,
      })),

      // Estanterías
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shelves: book.shelves.map((bs: any) => ({
        id: bs.shelf.id,
        name: bs.shelf.name,
        icon: bs.shelf.icon,
      })),

      // Sesiones de lectura recientes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentSessions: book.readingSessions.map((session: any) => ({
        id: session.id,
        pagesRead: session.pagesRead,
        duration: session.duration,
        date: session.date,
        notes: session.notes,
      })),
    };

    return NextResponse.json(formattedBook);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error al obtener el libro' } },
      { status: 500 }
    );
  }
}

// ===========================================
// PUT /api/books/:id - Actualizar un libro
// ===========================================

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verificar que el libro existe
    const existingBook = await prisma.book.findUnique({
      where: { id },
      include: { userBook: true },
    });

    if (!existingBook) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Libro no encontrado' } },
        { status: 404 }
      );
    }

    // Verificar ISBN duplicado (si se está cambiando)
    if (body.isbn && body.isbn !== existingBook.isbn) {
      const isbnExists = await prisma.book.findUnique({
        where: { isbn: body.isbn },
      });

      if (isbnExists) {
        return NextResponse.json(
          { error: { code: 'CONFLICT', message: 'Ya existe otro libro con este ISBN' } },
          { status: 409 }
        );
      }
    }

    // Actualizar libro
    await prisma.book.update({
      where: { id },
      data: {
        title: body.title,
        author: body.author,
        isbn: body.isbn,
        description: body.description,
        coverUrl: body.coverUrl,
        pageCount: body.pageCount,
        publisher: body.publisher,
        publishedDate: body.publishedDate,
        language: body.language,
        binding: body.binding,
        dimensions: body.dimensions,
        series: body.series,
        seriesNumber: body.seriesNumber,

        // Actualizar estado de lectura
        ...(body.status !== undefined && {
          userBook: {
            update: {
              status: body.status,
              progress: body.progress,
              currentPage: body.currentPage,
              startedAt: body.startedAt,
              finishedAt: body.finishedAt,
              lastReadAt: body.lastReadAt,
            },
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

    // Actualizar géneros si se proporcionan
    if (body.genreIds !== undefined) {
      // Eliminar relaciones existentes
      await prisma.bookGenre.deleteMany({
        where: { bookId: id },
      });

      // Crear nuevas relaciones
      if (body.genreIds.length > 0) {
        await prisma.bookGenre.createMany({
          data: body.genreIds.map((genreId: string) => ({
            bookId: id,
            genreId,
          })),
        });
      }
    }

    // Actualizar estanterías si se proporcionan
    if (body.shelfIds !== undefined) {
      // Eliminar relaciones existentes
      await prisma.shelfBook.deleteMany({
        where: { bookId: id },
      });

      // Crear nuevas relaciones
      if (body.shelfIds.length > 0) {
        await prisma.shelfBook.createMany({
          data: body.shelfIds.map((shelfId: string) => ({
            bookId: id,
            shelfId,
          })),
        });
      }
    }

    // Recibir libro actualizado
    const updatedBook = await prisma.book.findUnique({
      where: { id },
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

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error al actualizar el libro' } },
      { status: 500 }
    );
  }
}

// ===========================================
// DELETE /api/books/:id - Eliminar un libro
// ===========================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar que el libro existe
    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Libro no encontrado' } },
        { status: 404 }
      );
    }

    // Eliminar libro (cascade elimina relaciones)
    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error al eliminar el libro' } },
      { status: 500 }
    );
  }
}
