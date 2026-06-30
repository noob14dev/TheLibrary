import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getStatusLabel, getStatusColor, getRatingStars } from '@/lib/utils';
import { Pencil, Trash2, BookOpen, Calendar, Globe, Hash } from 'lucide-react';

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BookPageProps) {
  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    select: { title: true },
  });

  return {
    title: book ? `${book.title} | TheLibrary` : 'Libro no encontrado',
  };
}

export default async function BookPage({ params }: BookPageProps) {
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
      readingSessions: {
        orderBy: { date: 'desc' },
        take: 5,
      },
    },
  });

  if (!book) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Botón volver */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost">← Volver a la biblioteca</Button>
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* Portada y acciones */}
        <div className="space-y-4">
          {/* Portada */}
          <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-lg shadow-lg">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={`Portada de ${book.title}`}
                fill
                className="object-cover"
                sizes="300px"
                priority
              />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                <BookOpen className="h-16 w-16" />
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Link href={`/books/${book.id}/edit`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <form
              action={async () => {
                'use server';
                await prisma.book.delete({ where: { id } });
              }}
            >
              <Button type="submit" variant="destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Información del libro */}
        <div className="space-y-6">
          {/* Título y autor */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
            {book.author && <p className="text-muted-foreground mt-1 text-xl">{book.author}</p>}
          </div>

          {/* Estado y calificación */}
          <div className="flex flex-wrap gap-3">
            <Badge className={getStatusColor(book.userBook?.status || 'pending')}>
              {getStatusLabel(book.userBook?.status || 'pending')}
            </Badge>
            {book.review?.rating && (
              <Badge variant="secondary">{getRatingStars(book.review.rating)}</Badge>
            )}
          </div>

          <Separator />

          {/* Metadatos */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {book.isbn && (
              <div className="flex items-center gap-2">
                <Hash className="text-muted-foreground h-4 w-4" />
                <span>
                  <strong>ISBN:</strong> {book.isbn}
                </span>
              </div>
            )}
            {book.pageCount && (
              <div className="flex items-center gap-2">
                <BookOpen className="text-muted-foreground h-4 w-4" />
                <span>
                  <strong>Páginas:</strong> {book.pageCount}
                </span>
              </div>
            )}
            {book.publisher && (
              <div className="flex items-center gap-2">
                <Globe className="text-muted-foreground h-4 w-4" />
                <span>
                  <strong>Editorial:</strong> {book.publisher}
                </span>
              </div>
            )}
            {book.publishedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span>
                  <strong>Publicado:</strong> {book.publishedDate}
                </span>
              </div>
            )}
          </div>

          {/* Géneros */}
          {book.genres.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Géneros</h3>
              <div className="flex flex-wrap gap-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {book.genres.map((bg: any) => (
                  <Badge key={bg.genre.id} variant="secondary">
                    {bg.genre.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Estanterías */}
          {book.shelves.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Estanterías</h3>
              <div className="flex flex-wrap gap-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {book.shelves.map((bs: any) => (
                  <Badge key={bs.shelf.id} variant="outline">
                    {bs.shelf.icon && <span className="mr-1">{bs.shelf.icon}</span>}
                    {bs.shelf.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Descripción */}
          {book.description && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 font-semibold">Descripción</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{book.description}</p>
              </div>
            </>
          )}

          {/* Reseña personal */}
          {book.review?.content && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 font-semibold">Mi Reseña</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{book.review.content}</p>
              </div>
            </>
          )}

          {/* Progreso de lectura */}
          {book.userBook?.status === 'reading' && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progreso de Lectura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Página actual: {book.userBook.currentPage}</span>
                      <span>Total: {book.pageCount || '?'}</span>
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full transition-all"
                        style={{ width: `${book.userBook.progress}%` }}
                      />
                    </div>
                    <p className="text-muted-foreground text-center text-sm">
                      {book.userBook.progress}% completado
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
