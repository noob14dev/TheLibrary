import { prisma } from '@/lib/prisma';
import { BookCard } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Plus } from 'lucide-react';

export const metadata = {
  title: 'Mi Biblioteca | TheLibrary',
  description: 'Gestiona tu colección personal de libros',
};

export default async function HomePage() {
  // Obtener libros con su estado
  const books = await prisma.book.findMany({
    include: {
      userBook: {
        select: {
          status: true,
        },
      },
      review: {
        select: {
          rating: true,
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
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });

  // Estadísticas rápidas
  const stats = await prisma.book.aggregate({
    _count: true,
  });

  const readingCount = await prisma.userBook.count({
    where: { status: 'reading' },
  });

  const finishedCount = await prisma.userBook.count({
    where: { status: 'finished' },
  });

  const pendingCount = await prisma.userBook.count({
    where: { status: 'pending' },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Biblioteca</h1>
          <p className="text-muted-foreground">Gestiona tu colección personal de libros</p>
        </div>
        <Link href="/books/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Libro
          </Button>
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg border p-4 text-center shadow-sm">
          <div className="text-2xl font-bold">{stats._count}</div>
          <div className="text-muted-foreground text-sm">Total libros</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{readingCount}</div>
          <div className="text-muted-foreground text-sm">Leyendo</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-600">{finishedCount}</div>
          <div className="text-muted-foreground text-sm">Terminados</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-600">{pendingCount}</div>
          <div className="text-muted-foreground text-sm">Pendientes</div>
        </div>
      </div>

      {/* Lista de libros */}
      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <BookOpen className="text-muted-foreground mb-4 h-12 w-12" />
          <h2 className="mb-2 text-xl font-semibold">Tu biblioteca está vacía</h2>
          <p className="text-muted-foreground mb-4">Comienza agregando tu primer libro</p>
          <Link href="/books/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Primer Libro
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {books.map((book: any) => {
            const formattedBook = {
              id: book.id,
              title: book.title,
              author: book.author,
              coverUrl: book.coverUrl,
              status: book.userBook?.status || 'pending',
              rating: book.review?.rating || null,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              genres: book.genres.map((bg: any) => ({
                id: bg.genre.id,
                name: bg.genre.name,
              })),
            };
            return <BookCard key={book.id} book={formattedBook} />;
          })}
        </div>
      )}
    </div>
  );
}
