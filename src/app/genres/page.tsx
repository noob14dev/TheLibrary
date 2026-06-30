'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Genre {
  id: string;
  name: string;
  bookCount: number;
}

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Cargar géneros
  useEffect(() => {
    async function loadGenres() {
      try {
        const response = await fetch('/api/genres');
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (error) {
        console.error('Error loading genres:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadGenres();
  }, []);

  // Crear género
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newGenreName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGenreName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error?.message || 'Error al crear el género');
        return;
      }

      const genre = await response.json();
      setGenres((prev) => [...prev, { ...genre, bookCount: 0 }]);
      setNewGenreName('');
    } catch (error) {
      console.error('Error creating genre:', error);
      alert('Error al crear el género');
    } finally {
      setIsCreating(false);
    }
  }

  // Eliminar género
  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este género?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/genres/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('Error al eliminar el género');
        return;
      }

      setGenres((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      console.error('Error deleting genre:', error);
      alert('Error al eliminar el género');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-muted-foreground text-sm hover:underline">
          ← Volver a la biblioteca
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Géneros</h1>
        <p className="text-muted-foreground">Organiza tus libros por género literario</p>
      </div>

      {/* Formulario para crear */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Crear Nuevo Género</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="genreName" className="sr-only">
                Nombre del género
              </Label>
              <Input
                id="genreName"
                placeholder="Nombre del género (ej: Ciencia Ficción)"
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <Button type="submit" disabled={isCreating || !newGenreName.trim()}>
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Crear
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de géneros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Géneros Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : genres.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-muted-foreground">No hay géneros creados aún</p>
            </div>
          ) : (
            <div className="space-y-2">
              {genres.map((genre) => (
                <div
                  key={genre.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{genre.name}</span>
                    <Badge variant="secondary">
                      {genre.bookCount} {genre.bookCount === 1 ? 'libro' : 'libros'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(genre.id)}
                    disabled={deletingId === genre.id}
                  >
                    {deletingId === genre.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="text-destructive h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
