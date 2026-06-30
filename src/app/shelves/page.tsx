'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Loader2, BookOpen, GripVertical } from 'lucide-react';
import Link from 'next/link';

interface Shelf {
  id: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  bookCount: number;
}

// Emojis comunes para estanterías
const SHELF_ICONS = ['📚', '📖', '📕', '📗', '📘', '📙', '⭐', '❤️', '🎯', '🔥', '💡', '🌟'];

export default function ShelvesPage() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newShelf, setNewShelf] = useState({ name: '', icon: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Cargar estanterías
  useEffect(() => {
    async function loadShelves() {
      try {
        const response = await fetch('/api/shelves');
        const data = await response.json();
        setShelves(data.shelves || []);
      } catch (error) {
        console.error('Error loading shelves:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadShelves();
  }, []);

  // Crear estantería
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newShelf.name.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/shelves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newShelf.name.trim(),
          icon: newShelf.icon || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error?.message || 'Error al crear la estantería');
        return;
      }

      const shelf = await response.json();
      setShelves((prev) => [...prev, { ...shelf, bookCount: 0 }]);
      setNewShelf({ name: '', icon: '' });
    } catch (error) {
      console.error('Error creating shelf:', error);
      alert('Error al crear la estantería');
    } finally {
      setIsCreating(false);
    }
  }

  // Eliminar estantería
  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta estantería?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/shelves/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('Error al eliminar la estantería');
        return;
      }

      setShelves((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error deleting shelf:', error);
      alert('Error al eliminar la estantería');
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
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Estanterías</h1>
        <p className="text-muted-foreground">Organiza tus libros en estanterías personalizadas</p>
      </div>

      {/* Formulario para crear */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Crear Nueva Estantería</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shelfName">Nombre *</Label>
                <Input
                  id="shelfName"
                  placeholder="Nombre de la estantería"
                  value={newShelf.name}
                  onChange={(e) => setNewShelf((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label>Icono (opcional)</Label>
                <div className="flex flex-wrap gap-2">
                  {SHELF_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`rounded-md border p-2 text-lg transition-colors ${
                        newShelf.icon === icon ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                      }`}
                      onClick={() =>
                        setNewShelf((prev) => ({
                          ...prev,
                          icon: prev.icon === icon ? '' : icon,
                        }))
                      }
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isCreating || !newShelf.name.trim()}>
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Crear Estantería
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de estanterías */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estanterías Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : shelves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-muted-foreground">No hay estanterías creadas aún</p>
            </div>
          ) : (
            <div className="space-y-2">
              {shelves.map((shelf) => (
                <div
                  key={shelf.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="text-muted-foreground h-4 w-4" />
                    {shelf.icon && <span className="text-xl">{shelf.icon}</span>}
                    <span className="font-medium">{shelf.name}</span>
                    <Badge variant="secondary">
                      {shelf.bookCount} {shelf.bookCount === 1 ? 'libro' : 'libros'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(shelf.id)}
                    disabled={deletingId === shelf.id}
                  >
                    {deletingId === shelf.id ? (
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
