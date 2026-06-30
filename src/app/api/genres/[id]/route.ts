import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ===========================================
// DELETE /api/genres/:id - Eliminar un género
// ===========================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar que el género existe
    const existingGenre = await prisma.genre.findUnique({
      where: { id },
    });

    if (!existingGenre) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Género no encontrado' } },
        { status: 404 }
      );
    }

    // Eliminar género (cascade elimina las relaciones)
    await prisma.genre.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting genre:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error al eliminar el género' } },
      { status: 500 }
    );
  }
}
