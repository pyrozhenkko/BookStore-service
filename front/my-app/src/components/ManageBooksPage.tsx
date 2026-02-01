import { useState, useEffect, useMemo } from 'react';
import type { Book } from '../types';
import { mockBooks } from '../services/mockData';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const ITEMS_PER_PAGE = 12;

export function ManageBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'author' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    imageUrl: '',
    isbn: '',
    publishedYear: '',
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      // Спроба завантажити з бекенду
      const response = await fetch(`${API_BASE_URL}/books`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      } else {
        // Fallback на mock data
        setBooks(mockBooks);
      }
    } catch (error) {
      console.error('Error loading books:', error);
      // Fallback на mock data
      setBooks(mockBooks);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBook(null);
    setFormData({
      name: '',
      author: '',
      price: '',
      description: '',
      category: '',
      stock: '',
      imageUrl: '',
      isbn: '',
      publishedYear: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      name: book.name,
      author: book.author,
      price: book.price.toString(),
      description: book.description,
      category: book.category,
      stock: book.stock.toString(),
      imageUrl: book.imageUrl,
      isbn: book.isbn,
      publishedYear: book.publishedYear.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookData = {
      name: formData.name,
      author: formData.author,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      stock: parseInt(formData.stock),
      imageUrl: formData.imageUrl,
      isbn: formData.isbn,
      publishedYear: parseInt(formData.publishedYear),
    };

    try {
      if (editingBook) {
        // Оновлення книги
        const response = await fetch(`${API_BASE_URL}/books/${editingBook.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookData),
        });
        
        if (!response.ok) throw new Error('Failed to update book');
        toast.success('Книгу оновлено');
      } else {
        // Додавання нової книги
        const response = await fetch(`${API_BASE_URL}/books`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookData),
        });
        
        if (!response.ok) throw new Error('Failed to create book');
        toast.success('Книгу додано');
      }
      
      setIsDialogOpen(false);
      loadBooks();
    } catch (error) {
      toast.error('Помилка збереження книги');
      console.error('Error saving book:', error);
    }
  };

  const handleDelete = async (book: Book) => {
    if (!confirm(`Ви впевнені, що хочете видалити "${book.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/books/${book.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete book');
      toast.success('Книгу видалено');
      loadBooks();
    } catch (error) {
      toast.error('Помилка видалення книги');
      console.error('Error deleting book:', error);
    }
  };

  // Отримати унікальні категорії
  const categories = useMemo(() => {
    return Array.from(new Set(books.map(b => b.category)));
  }, [books]);

  // Фільтрація та сортування
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Пошук
    if (searchQuery) {
      result = result.filter(book =>
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фільтр за категорією
    if (categoryFilter !== 'all') {
      result = result.filter(book => book.category === categoryFilter);
    }

    // Фільтр за наявністю
    if (stockFilter === 'in-stock') {
      result = result.filter(book => book.stock > 0);
    } else if (stockFilter === 'low-stock') {
      result = result.filter(book => book.stock > 0 && book.stock < 10);
    } else if (stockFilter === 'out-of-stock') {
      result = result.filter(book => book.stock === 0);
    }

    // Сортування
    result.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'author':
          compareValue = a.author.localeCompare(b.author);
          break;
        case 'price':
          compareValue = a.price - b.price;
          break;
        case 'stock':
          compareValue = a.stock - b.stock;
          break;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return result;
  }, [books, searchQuery, categoryFilter, stockFilter, sortBy, sortOrder]);

  // Пагінація
  const totalPages = Math.ceil(filteredAndSortedBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedBooks, currentPage]);

  // Скидання сторінки при зміні фільтрів
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, stockFilter, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Керування книгами</h1>
        <Button onClick={handleAdd}>
          <Plus className="size-4 mr-2" />
          Додати книгу
        </Button>
      </div>

      {/* Пошук та фільтри */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Пошук за назвою, автором або ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Категорія" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі категорії</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Наявність" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі книги</SelectItem>
                <SelectItem value="in-stock">В наявності</SelectItem>
                <SelectItem value="low-stock">Мало на складі</SelectItem>
                <SelectItem value="out-of-stock">Немає в наявності</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
              const [field, order] = v.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Сортування" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Назва (А-Я)</SelectItem>
                <SelectItem value="name-desc">Назва (Я-А)</SelectItem>
                <SelectItem value="author-asc">Автор (А-Я)</SelectItem>
                <SelectItem value="author-desc">Автор (Я-А)</SelectItem>
                <SelectItem value="price-asc">Ціна (зростання)</SelectItem>
                <SelectItem value="price-desc">Ціна (спадання)</SelectItem>
                <SelectItem value="stock-asc">Наявність (зростання)</SelectItem>
                <SelectItem value="stock-desc">Наявність (спадання)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">Завантаження...</div>
      ) : filteredAndSortedBooks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all' ? 'Нічого не знайдено' : 'Немає книг'}
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Список книг</CardTitle>
                <div className="text-sm text-gray-600">
                  Показано {paginatedBooks.length} з {filteredAndSortedBooks.length}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={book.imageUrl}
                  alt={book.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-1">{book.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{book.author}</p>
                <p className="text-lg font-bold mt-2">{book.price} грн</p>
                <p className="text-sm text-gray-600">В наявності: {book.stock}</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(book)}
                    className="flex-1"
                  >
                    <Pencil className="size-3 mr-1" />
                    Редагувати
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(book)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Пагінація */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Сторінка {currentPage} з {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Вперед
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBook ? 'Редагувати книгу' : 'Додати книгу'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Назва *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Автор *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Опис *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Ціна (грн) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Кількість на складі *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Категорія *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishedYear">Рік видання *</Label>
                <Input
                  id="publishedYear"
                  type="number"
                  value={formData.publishedYear}
                  onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN *</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL зображення *</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Скасувати
              </Button>
              <Button type="submit">
                {editingBook ? 'Зберегти' : 'Додати'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
