import { BookForm } from '@/components/BookForm';

export const metadata = {
  title: 'Agregar Libro | TheLibrary',
  description: 'Agrega un nuevo libro a tu biblioteca',
};

export default function NewBookPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Agregar Libro</h1>
        <p className="text-muted-foreground">Agrega un nuevo libro a tu colección personal</p>
      </div>

      <BookForm />
    </div>
  );
}
