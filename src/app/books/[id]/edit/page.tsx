import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookForm } from '@/components/BookForm';

interface EditBookPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditBookPageProps) {
  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    select: { title: true },
  });

  return {
    title: book ? `Editar ${book.title} | TheLibrary` : 'Libro no encontrado',
  };
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      userBook: true,
      review: true,
      genres: {
        include: {
          genre: true,
        },
      },
      shelves: {
        include: {
          shelf: true,
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  // Preparar datos iniciales para el formulario
  const initialData = {
    title: book.title,
    author: book.author || '',
    isbn: book.isbn || '',
    description: book.description || '',
    coverUrl: book.coverUrl || '',
    pageCount: book.pageCount?.toString() || '',
    publisher: book.publisher || '',
    publishedDate: book.publishedDate || '',
    language: book.language || '',
    status: (book.userBook?.status || 'pending') as 'pending' | 'reading' | 'finished',
    rating: book.review?.rating?.toString() || '',
    review: book.review?.content || '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    genreIds: book.genres.map((bg: any) => bg.genre.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shelfIds: book.shelves.map((bs: any) => bs.shelf.id),
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Editar Libro</h1>
        <p className="text-muted-foreground">
          Actualiza la información de &quot;{book.title}&quot;
        </p>
      </div>

      <BookForm initialData={initialData} bookId={id} isEditing />
    </div>
  );
}
