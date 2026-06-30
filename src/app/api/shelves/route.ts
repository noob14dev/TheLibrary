import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ===========================================
// GET /api/shelves - Obtener todas las estanterías
// ===========================================

export async function GET() {
  try {
    const shelves = await prisma.shelf.findMany({
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedShelves = shelves.map((shelf: any) => ({
      id: shelf.id,
      name: shelf.name,
      icon: shelf.icon,
      sortOrder: shelf.sortOrder,
      bookCount: shelf._count.books,
    }));

    return NextResponse.json({ shelves: formattedShelves });
  } catch (error) {
    console.error('Error fetching shelves:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error al obtener estanterías' } },
      { status: 500 }
    );
  }
}

// ===========================================
// POST /api/shelves - Crear una nueva estantería
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
    const existingShelf = await prisma.shelf.findUnique({
      where: { name: body.name },
    });

    if (existingShelf) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Ya existe una estantería con ese nombre' } },
        { status: 409 }
      );
    }

    const shelf = await prisma.shelf.create({
      data: {
        name: body.name,
        icon: body.icon || null,
        sortOrder: body.sortOrder || 0,
      },
    });

    return NextResponse.json(shelf, { status: 201 });
  } catch (error) {
    console.error('Error creating shelf:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error al crear estantería' } },
      { status: 500 }
    );
  }
}
