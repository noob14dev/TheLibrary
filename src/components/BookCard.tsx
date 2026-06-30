'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getStatusLabel, getStatusColor } from '@/lib/utils';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string | null;
    coverUrl: string | null;
    status: string;
    genres: Array<{ id: string; name: string }>;
  };
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`}>
      <Card className="group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
        <CardContent className="p-4">
          {/* Portada */}
          <div className="bg-muted relative mb-4 aspect-[2/3] overflow-hidden rounded-lg">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={`Portada de ${book.title}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
            )}

            {/* Estado de lectura */}
            <div className="absolute top-2 right-2">
              <Badge className={getStatusColor(book.status)}>{getStatusLabel(book.status)}</Badge>
            </div>
          </div>

          {/* Información del libro */}
          <div className="space-y-2">
            <h3 className="group-hover:text-primary line-clamp-2 leading-tight font-semibold">
              {book.title}
            </h3>

            {book.author && (
              <p className="text-muted-foreground line-clamp-1 text-sm">{book.author}</p>
            )}

            {/* Géneros */}
            {book.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {book.genres.slice(0, 2).map((genre) => (
                  <Badge key={genre.id} variant="secondary" className="text-xs">
                    {genre.name}
                  </Badge>
                ))}
                {book.genres.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{book.genres.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
