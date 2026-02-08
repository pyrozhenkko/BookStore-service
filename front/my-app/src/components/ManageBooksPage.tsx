import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Book } from '../types';
import { bookApiService } from '../services/bookApiService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';


const ITEMS_PER_PAGE = 12;

export function ManageBooksPage() {
  const { t } = useLanguage();
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);


  const fetchBooks = async () => {
    try {
      setLoading(true);
      const sortParam = `${sortBy},${sortOrder}`;

      const data = await bookApiService.searchBooks({
        keyword: searchQuery,
        genre: categoryFilter === 'all' ? undefined : categoryFilter,
        stockStatus: stockFilter === 'all' ? undefined : stockFilter,
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
        sort: sortParam
      });

      setBooks(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('Error loading books:', error);
      toast.error(t('manageBooks.toasts.loadError'));
      setBooks([]);
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
    setSelectedFile(null);
    setPreviewUrl(null);
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
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);
    const publishedYear = parseInt(formData.publishedYear);

    if (isNaN(price) || isNaN(stock) || isNaN(publishedYear)) {
      toast.error(t('manageBooks.toasts.validationError') || 'Please enter valid numbers for price, stock, and year');
      return;
    }

    const bookData = {
      name: formData.name,
      author: formData.author,
      price: price,
      description: formData.description,
      category: formData.category,
      stock: stock,
      imageUrl: formData.imageUrl,
      isbn: formData.isbn,
      publishedYear: publishedYear,
      imageUrls: editingBook?.imageUrls || [],
    };

    try {
      if (editingBook) {
        await bookApiService.updateBook(editingBook.name, bookData);
        toast.success(t('manageBooks.toasts.updateSuccess'));
      } else {
        const newBook = await bookApiService.addBook(bookData);
        if (selectedFile) {
          try {
            await bookApiService.uploadImage(newBook.name, selectedFile);
          } catch (uploadError) {
            console.error('Error uploading image for new book:', uploadError);
            toast.error(t('manageBooks.toasts.imageUploadError'));
          }
        }
        toast.success(t('manageBooks.toasts.createSuccess'));
      }

      setIsDialogOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setPreviewUrl(null);
      fetchBooks();
    } catch (error: any) {
      const errorMsg = error.message || t('manageBooks.toasts.saveError');
      toast.error(errorMsg);
      console.error('Error saving book:', error);
    }

  };

  const handleDelete = async (book: Book) => {
    if (!confirm(t('manageBooks.deleteConfirm', { name: book.name }))) {
      return;
    }

    try {
      await bookApiService.deleteBook(book.name);
      toast.success(t('manageBooks.toasts.deleteSuccess'));
      await bookApiService.deleteBook(book.name);
      toast.success(t('manageBooks.toasts.deleteSuccess'));
      fetchBooks();
    } catch (error) {
      toast.error(t('manageBooks.toasts.deleteError'));
      console.error('Error deleting book:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);

    if (editingBook) {
      try {
        const updatedBook = await bookApiService.uploadImage(editingBook.name, file);
        setEditingBook(updatedBook);
        setFormData(prev => ({ ...prev, imageUrl: updatedBook.imageUrl }));
        setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
        toast.success(t('manageBooks.toasts.imageUploadSuccess') || 'Image uploaded successfully');
      } catch (error) {
        toast.error(t('manageBooks.toasts.imageUploadError') || 'Failed to upload image');
        console.error('Error uploading image:', error);
      }
    }
  };

  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [categories, setCategories] = useState<string[]>(['all']);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genres = await bookApiService.getGenres();
        setCategories(['all', ...genres]);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [searchQuery, categoryFilter, stockFilter, sortBy, sortOrder, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, stockFilter, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('manageBooks.title')}</h1>
        <Button onClick={handleAdd}>
          <Plus className="size-4 mr-2" />
          {t('manageBooks.addBook')}
        </Button>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder={t('manageBooks.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('manageBooks.categories.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('manageBooks.categories.all')}</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder={t('manageBooks.stock.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('manageBooks.stock.all')}</SelectItem>
                <SelectItem value="in-stock">{t('manageBooks.stock.inStock')}</SelectItem>
                <SelectItem value="low-stock">{t('manageBooks.stock.lowStock')}</SelectItem>
                <SelectItem value="out-of-stock">{t('manageBooks.stock.outOfStock')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
              const [field, order] = v.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}>
              <SelectTrigger>
                <SelectValue placeholder={t('manageBooks.sort.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">{t('manageBooks.sort.nameAsc')}</SelectItem>
                <SelectItem value="name-desc">{t('manageBooks.sort.nameDesc')}</SelectItem>
                <SelectItem value="author-asc">{t('manageBooks.sort.authorAsc')}</SelectItem>
                <SelectItem value="author-desc">{t('manageBooks.sort.authorDesc')}</SelectItem>
                <SelectItem value="price-asc">{t('manageBooks.sort.priceAsc')}</SelectItem>
                <SelectItem value="price-desc">{t('manageBooks.sort.priceDesc')}</SelectItem>
                <SelectItem value="stock-asc">{t('manageBooks.sort.stockAsc')}</SelectItem>
                <SelectItem value="stock-desc">{t('manageBooks.sort.stockDesc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">{t('common.loading')}</div>
      ) : books.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all' ? t('manageBooks.notFound') : t('manageBooks.noBooks')}
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('manageBooks.bookList')}</CardTitle>
                <div className="text-sm text-gray-600">
                  {t('manageBooks.showing', { current: books.length, total: totalElements })}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => (
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
                      <p className="text-lg font-bold mt-2">{book.price} {t('common.currency')}</p>
                      <p className="text-sm text-gray-600">{t('manageBooks.stock.inStock')}: {book.stock}</p>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(book)}
                          className="flex-1"
                        >
                          <Pencil className="size-3 mr-1" />
                          {t('manageBooks.edit')}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {t('book.page')} {currentPage} {t('book.of')} {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4 mr-1" />
                  {t('book.previousPage')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('book.nextPage')}
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
              {editingBook ? t('manageBooks.form.editTitle') : t('manageBooks.form.addTitle')}
            </DialogTitle>
            <DialogDescription>
              {editingBook ? t('manageBooks.form.editDescription') : t('manageBooks.form.addDescription') || 'Please fill in the book details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('manageBooks.form.name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">{t('manageBooks.form.author')} *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('manageBooks.form.description')} *</Label>
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
                <Label htmlFor="price">{t('manageBooks.form.price')} *</Label>
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
                <Label htmlFor="stock">{t('manageBooks.form.stock')} *</Label>
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
                <Label htmlFor="category">{t('manageBooks.form.category')} *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishedYear">{t('manageBooks.form.year')} *</Label>
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
              <Label htmlFor="isbn">{t('manageBooks.form.isbn')} *</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageFile">{t('manageBooks.form.uploadImage') || 'Upload Image from Device'}</Label>

                {(previewUrl || formData.imageUrl) && (
                  <div className="mt-2 relative group w-32 aspect-[3/4] mx-auto overflow-hidden rounded-md border">
                    <img
                      src={previewUrl || formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500">
                  {t('manageBooks.form.uploadHint') || 'Selecting a file will automatically upload it (for existing books) or prepare it for upload (for new books).'}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('manageBooks.form.cancel')}
              </Button>
              <Button type="submit">
                {editingBook ? t('manageBooks.form.save') : t('manageBooks.form.add')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
