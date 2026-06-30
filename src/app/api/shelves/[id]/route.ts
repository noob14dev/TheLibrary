import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ===========================================
// DELETE /api/shelves/:id - Eliminar una estantería
// ===========================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar que la estantería existe
    const existingShelf = await prisma.shelf.findUnique({
      where: { id },
    });

    if (!existingShelf) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Estantería no encontrada' } },
        { status: 404 }
      );
    }

    // Eliminar estantería (cascade elimina las relaciones)
    await prisma.shelf.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shelf:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error al eliminar la estantería' } },
      { status: 500 }
    );
  }
}
