'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X, Loader2 } from 'lucide-react';
import type { ReadingStatus } from '@/types';

interface Genre {
  id: string;
  name: string;
}

interface Shelf {
  id: string;
  name: string;
  icon: string | null;
}

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  description: string;
  coverUrl: string;
  pageCount: string;
  publisher: string;
  publishedDate: string;
  language: string;
  status: ReadingStatus;
  rating: string;
  review: string;
  genreIds: string[];
  shelfIds: string[];
}

interface BookFormProps {
  initialData?: Partial<BookFormData>;
  bookId?: string;
  isEditing?: boolean;
}

export function BookForm({ initialData, bookId, isEditing = false }: BookFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);

  const [formData, setFormData] = useState<BookFormData>({
    title: initialData?.title || '',
    author: initialData?.author || '',
    isbn: initialData?.isbn || '',
    description: initialData?.description || '',
    coverUrl: initialData?.coverUrl || '',
    pageCount: initialData?.pageCount || '',
    publisher: initialData?.publisher || '',
    publishedDate: initialData?.publishedDate || '',
    language: initialData?.language || '',
    status: (initialData?.status as ReadingStatus) || 'pending',
    rating: initialData?.rating || '',
    review: initialData?.review || '',
    genreIds: initialData?.genreIds || [],
    shelfIds: initialData?.shelfIds || [],
  });

  // Cargar géneros y estanterías
  useEffect(() => {
    async function loadData() {
      const [genresRes, shelvesRes] = await Promise.all([
        fetch('/api/genres'),
        fetch('/api/shelves'),
      ]);

      const genresData = await genresRes.json();
      const shelvesData = await shelvesRes.json();

      setGenres(genresData.genres || []);
      setShelves(shelvesData.shelves || []);
    }

    loadData();
  }, []);

  // Buscar libro por ISBN
  async function handleSearchISBN() {
    if (!formData.isbn) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?isbn=${formData.isbn}`);
      const data = await response.json();

      if (data.found && data.book) {
        setFormData((prev) => ({
          ...prev,
          title: data.book.title || prev.title,
          author: data.book.author || prev.author,
          description: data.book.description || prev.description,
          coverUrl: data.book.coverUrl || prev.coverUrl,
          pageCount: data.book.pageCount?.toString() || prev.pageCount,
          publisher: data.book.publisher || prev.publisher,
          publishedDate: data.book.publishedDate || prev.publishedDate,
          language: data.book.language || prev.language,
        }));
      }
    } catch (error) {
      console.error('Error searching ISBN:', error);
    } finally {
      setIsSearching(false);
    }
  }

  // Enviar formulario
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        pageCount: formData.pageCount ? parseInt(formData.pageCount) : null,
        rating: formData.rating ? parseInt(formData.rating) : null,
      };

      const url = isEditing ? `/api/books/${bookId}` : '/api/books';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Error al guardar el libro');
      }

      const book = await response.json();
      router.push(`/books/${book.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error saving book:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el libro');
    } finally {
      setIsLoading(false);
    }
  }

  // Toggle género
  function toggleGenre(genreId: string) {
    setFormData((prev) => ({
      ...prev,
      genreIds: prev.genreIds.includes(genreId)
        ? prev.genreIds.filter((id) => id !== genreId)
        : [...prev.genreIds, genreId],
    }));
  }

  // Toggle estantería
  function toggleShelf(shelfId: string) {
    setFormData((prev) => ({
      ...prev,
      shelfIds: prev.shelfIds.includes(shelfId)
        ? prev.shelfIds.filter((id) => id !== shelfId)
        : [...prev.shelfIds, shelfId],
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Búsqueda por ISBN */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar por ISBN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ingresa el ISBN (10 o 13 dígitos)"
              value={formData.isbn}
              onChange={(e) => setFormData((prev) => ({ ...prev, isbn: e.target.value }))}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSearchISBN}
              disabled={isSearching || !formData.isbn}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información del Libro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Autor</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pageCount">Páginas</Label>
              <Input
                id="pageCount"
                type="number"
                min="1"
                value={formData.pageCount}
                onChange={(e) => setFormData((prev) => ({ ...prev, pageCount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publisher">Editorial</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData((prev) => ({ ...prev, publisher: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedDate">Año de publicación</Label>
              <Input
                id="publishedDate"
                value={formData.publishedDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    publishedDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Input
                id="language"
                placeholder="ej: es, en"
                value={formData.language}
                onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverUrl">URL de portada</Label>
              <Input
                id="coverUrl"
                type="url"
                value={formData.coverUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, coverUrl: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de lectura */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estado de Lectura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as ReadingStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="reading">Leyendo</SelectItem>
                  <SelectItem value="finished">Terminado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Calificación</Label>
              <Select
                value={formData.rating}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, rating: value ?? '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin calificar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">⭐ 1 - Mala</SelectItem>
                  <SelectItem value="2">⭐⭐ 2 - Regular</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ 3 - Buena</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 4 - Muy buena</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ 5 - Excelente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Reseña personal</Label>
            <Textarea
              id="review"
              rows={3}
              placeholder="Tus opiniones sobre el libro..."
              value={formData.review}
              onChange={(e) => setFormData((prev) => ({ ...prev, review: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Géneros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Géneros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Badge
                key={genre.id}
                variant={formData.genreIds.includes(genre.id) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleGenre(genre.id)}
              >
                {genre.name}
                {formData.genreIds.includes(genre.id) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
            {genres.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No hay géneros creados.{' '}
                <a href="/genres" className="text-primary hover:underline">
                  Crear uno
                </a>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estanterías */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estanterías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {shelves.map((shelf) => (
              <Badge
                key={shelf.id}
                variant={formData.shelfIds.includes(shelf.id) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleShelf(shelf.id)}
              >
                {shelf.icon && <span className="mr-1">{shelf.icon}</span>}
                {shelf.name}
                {formData.shelfIds.includes(shelf.id) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
            {shelves.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No hay estanterías creadas.{' '}
                <a href="/shelves" className="text-primary hover:underline">
                  Crear una
                </a>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : isEditing ? (
            'Actualizar Libro'
          ) : (
            'Agregar Libro'
          )}
        </Button>

        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
