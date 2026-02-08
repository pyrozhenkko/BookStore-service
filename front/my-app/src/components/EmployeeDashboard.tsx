import { useState, useMemo } from 'react';
import type { Book, Order, User } from '../types';
import { mockBooks, mockOrders, mockUsers } from '../services/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Plus, Edit, Trash2, UserX, UserCheck, CheckCircle, Search, Filter, TrendingUp, Package, Users, DollarSign, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function EmployeeDashboard() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [clients, setClients] = useState<User[]>(mockUsers.filter(u => u.role === 'customer'));

  // Filter states
  const [bookSearch, setBookSearch] = useState('');
  const [bookCategory, setBookCategory] = useState('all');
  const [bookStockFilter, setBookStockFilter] = useState('all');
  const [bookSortBy, setBookSortBy] = useState('name');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderDateFilter, setOrderDateFilter] = useState('all');
  const [orderSortBy, setOrderSortBy] = useState('date-desc');

  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState('all');
  const [clientSortBy, setClientSortBy] = useState('name');

  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isEditBookOpen, setIsEditBookOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [newBook, setNewBook] = useState<Partial<Book>>({
    name: '',
    author: '',
    price: 0,
    description: '',
    category: '',
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    isbn: '',
    publishedYear: new Date().getFullYear()
  });

  // Statistics
  const stats = useMemo(() => {
    const totalRevenue = orders.filter(o => o.status === 'confirmed').reduce((sum, o) => sum + o.totalPrice, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const lowStockBooks = books.filter(b => b.stock < 10).length;
    const activeClients = clients.filter(c => !c.isBlocked).length;

    return { totalRevenue, pendingOrders, lowStockBooks, activeClients };
  }, [books, orders, clients]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Search filter
    if (bookSearch) {
      result = result.filter(b =>
        b.name.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.isbn.toLowerCase().includes(bookSearch.toLowerCase())
      );
    }

    // Category filter
    if (bookCategory !== 'all') {
      result = result.filter(b => b.category === bookCategory);
    }

    // Stock filter
    if (bookStockFilter === 'in-stock') {
      result = result.filter(b => b.stock > 0);
    } else if (bookStockFilter === 'out-of-stock') {
      result = result.filter(b => b.stock === 0);
    } else if (bookStockFilter === 'low-stock') {
      result = result.filter(b => b.stock > 0 && b.stock < 10);
    }

    // Sort
    result.sort((a, b) => {
      switch (bookSortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'stock-asc':
          return a.stock - b.stock;
        case 'stock-desc':
          return b.stock - a.stock;
        case 'author':
          return a.author.localeCompare(b.author);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [books, bookSearch, bookCategory, bookStockFilter, bookSortBy]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search filter
    if (orderSearch) {
      result = result.filter(o =>
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.items.some(item => item.bookName.toLowerCase().includes(orderSearch.toLowerCase()))
      );
    }

    // Status filter
    if (orderStatusFilter !== 'all') {
      result = result.filter(o => o.status === orderStatusFilter);
    }

    // Date filter
    const now = new Date();
    if (orderDateFilter === 'today') {
      result = result.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === now.toDateString();
      });
    } else if (orderDateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(o => new Date(o.createdAt) >= weekAgo);
    } else if (orderDateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(o => new Date(o.createdAt) >= monthAgo);
    }

    // Sort
    result.sort((a, b) => {
      switch (orderSortBy) {
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price-asc':
          return a.totalPrice - b.totalPrice;
        case 'price-desc':
          return b.totalPrice - a.totalPrice;
        default:
          return 0;
      }
    });

    return result;
  }, [orders, orderSearch, orderStatusFilter, orderDateFilter, orderSortBy]);

  // Filtered clients
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Search filter
    if (clientSearch) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(clientSearch.toLowerCase())
      );
    }

    // Status filter
    if (clientStatusFilter === 'active') {
      result = result.filter(c => !c.isBlocked);
    } else if (clientStatusFilter === 'blocked') {
      result = result.filter(c => c.isBlocked);
    }

    // Sort
    result.sort((a, b) => {
      switch (clientSortBy) {
        case 'email':
          return a.email.localeCompare(b.email);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [clients, clientSearch, clientStatusFilter, clientSortBy]);

  // Get client order statistics
  const getClientOrderStats = (email: string) => {
    const clientOrders = orders.filter(o => o.customerEmail === email);
    const totalSpent = clientOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    return { ordersCount: clientOrders.length, totalSpent };
  };

  const categories = useMemo(() => {
    return Array.from(new Set(books.map(b => b.category)));
  }, [books]);

  const handleAddBook = () => {
    const book: Book = {
      ...newBook as Book,
      id: String(books.length + 1)
    };
    setBooks([...books, book]);
    setIsAddBookOpen(false);
    setNewBook({
      name: '',
      author: '',
      price: 0,
      description: '',
      category: '',
      stock: 0,
      imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
      isbn: '',
      publishedYear: new Date().getFullYear()
    });
  };

  const handleEditBook = () => {
    if (editingBook) {
      setBooks(books.map(b => b.id === editingBook.id ? editingBook : b));
      setIsEditBookOpen(false);
      setEditingBook(null);
    }
  };

  const handleDeleteBook = (bookId: string) => {
    setBooks(books.filter(b => b.id !== bookId));
  };

  const handleConfirmOrder = (orderId: string) => {
    setOrders(orders.map(o =>
      o.id === orderId
        ? { ...o, status: 'confirmed' as const, employeeEmail: currentUser?.email }
        : o
    ));
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(orders.map(o =>
      o.id === orderId
        ? { ...o, status: 'cancelled' as const }
        : o
    ));
  };

  const handleToggleBlockClient = (email: string) => {
    setClients(clients.map(c =>
      c.email === email ? { ...c, isBlocked: !c.isBlocked } : c
    ));
  };

  const clearBookFilters = () => {
    setBookSearch('');
    setBookCategory('all');
    setBookStockFilter('all');
    setBookSortBy('name');
  };

  const clearOrderFilters = () => {
    setOrderSearch('');
    setOrderStatusFilter('all');
    setOrderDateFilter('all');
    setOrderSortBy('date-desc');
  };

  const clearClientFilters = () => {
    setClientSearch('');
    setClientStatusFilter('all');
    setClientSortBy('name');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">{t('admin.controlPanel')}</h1>
        <p className="text-gray-600">{t('admin.controlPanelSub')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalRevenue')}</CardTitle>
            <DollarSign className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue} {t('common.currency')}</div>
            <p className="text-xs text-gray-600 mt-1">{t('admin.totalRevenueSub')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.pendingOrders')}</CardTitle>
            <Package className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-gray-600 mt-1">{t('admin.pendingOrdersSub')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.lowStock')}</CardTitle>
            <TrendingUp className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockBooks}</div>
            <p className="text-xs text-gray-600 mt-1">{t('admin.lowStockSub')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.activeClients')}</CardTitle>
            <Users className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
            <p className="text-xs text-gray-600 mt-1">{t('admin.activeClientsSub')}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="books" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="books">{t('header.books')} ({filteredBooks.length})</TabsTrigger>
          <TabsTrigger value="orders">{t('header.orders')} ({filteredOrders.length})</TabsTrigger>
          <TabsTrigger value="clients">{t('header.clients')} ({filteredClients.length})</TabsTrigger>
        </TabsList>

        {/* Books Tab */}
        <TabsContent value="books" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('manageBooks.title')}</h2>
            <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4 mr-2" />
                  {t('manageBooks.addBook')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('manageBooks.form.addTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('manageBooks.form.description')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('manageBooks.form.name')}</Label>
                      <Input
                        id="name"
                        value={newBook.name}
                        onChange={(e) => setNewBook({ ...newBook, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author">{t('manageBooks.form.author')}</Label>
                      <Input
                        id="author"
                        value={newBook.author}
                        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">{t('manageBooks.form.description')}</Label>
                    <Textarea
                      id="description"
                      value={newBook.description}
                      onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">{t('manageBooks.form.category')}</Label>
                      <Input
                        id="category"
                        value={newBook.category}
                        onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        value={newBook.isbn}
                        onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">{t('manageBooks.form.price')} ({t('common.currency')})</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newBook.price}
                        onChange={(e) => setNewBook({ ...newBook, price: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">{t('manageBooks.form.stock')}</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newBook.stock}
                        onChange={(e) => setNewBook({ ...newBook, stock: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">{t('manageBooks.form.year')}</Label>
                      <Input
                        id="year"
                        type="number"
                        value={newBook.publishedYear}
                        onChange={(e) => setNewBook({ ...newBook, publishedYear: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddBook}>{t('manageBooks.form.add')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Books Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="size-4" />
                  {t('common.searchFilters')}
                </CardTitle>
                {(bookSearch || bookCategory !== 'all' || bookStockFilter !== 'all' || bookSortBy !== 'name') && (
                  <Button variant="ghost" size="sm" onClick={clearBookFilters}>
                    <X className="size-4 mr-2" />
                    {t('common.reset')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="book-search">{t('common.search')}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="book-search"
                      placeholder={t('manageBooks.searchPlaceholder')}
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book-category">{t('manageBooks.form.category')}</Label>
                  <Select value={bookCategory} onValueChange={setBookCategory}>
                    <SelectTrigger id="book-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('manageBooks.categories.all')}</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book-stock">{t('stockStatus.availability')}</Label>
                  <Select value={bookStockFilter} onValueChange={setBookStockFilter}>
                    <SelectTrigger id="book-stock">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('manageBooks.stock.all')}</SelectItem>
                      <SelectItem value="in-stock">{t('stockStatus.inStock')}</SelectItem>
                      <SelectItem value="low-stock">{t('manageBooks.stock.lowStock')} ({"<"}10)</SelectItem>
                      <SelectItem value="out-of-stock">{t('stockStatus.outOfStock')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book-sort">{t('catalog.sortBy')}</Label>
                  <Select value={bookSortBy} onValueChange={setBookSortBy}>
                    <SelectTrigger id="book-sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">{t('manageBooks.sort.nameAsc')}</SelectItem>
                      <SelectItem value="author">{t('manageBooks.sort.authorAsc')}</SelectItem>
                      <SelectItem value="price-asc">{t('manageBooks.sort.priceAsc')}</SelectItem>
                      <SelectItem value="price-desc">{t('manageBooks.sort.priceDesc')}</SelectItem>
                      <SelectItem value="stock-asc">{t('manageBooks.sort.stockAsc')}</SelectItem>
                      <SelectItem value="stock-desc">{t('manageBooks.sort.stockDesc')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('manageBooks.form.name')}</TableHead>
                    <TableHead>{t('manageBooks.form.author')}</TableHead>
                    <TableHead>{t('manageBooks.form.category')}</TableHead>
                    <TableHead className="text-right">{t('book.price')}</TableHead>
                    <TableHead className="text-center">{t('stockStatus.availability')}</TableHead>
                    <TableHead className="text-right">{t('admin.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map(book => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.name}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.category}</TableCell>
                      <TableCell className="text-right">{book.price} {t('common.currency')}</TableCell>
                      <TableCell className="text-center">{book.stock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingBook(book);
                              setIsEditBookOpen(true);
                            }}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteBook(String(book.id))}
                          >
                            <Trash2 className="size-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Book Dialog */}
          <Dialog open={isEditBookOpen} onOpenChange={setIsEditBookOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('manageBooks.form.editTitle')}</DialogTitle>
              </DialogHeader>
              {editingBook && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('manageBooks.form.name')}</Label>
                      <Input
                        value={editingBook.name}
                        onChange={(e) => setEditingBook({ ...editingBook, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('manageBooks.form.author')}</Label>
                      <Input
                        value={editingBook.author}
                        onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('manageBooks.form.description')}</Label>
                    <Textarea
                      value={editingBook.description}
                      onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t('manageBooks.form.price')} ({t('common.currency')})</Label>
                      <Input
                        type="number"
                        value={editingBook.price}
                        onChange={(e) => setEditingBook({ ...editingBook, price: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('manageBooks.form.stock')}</Label>
                      <Input
                        type="number"
                        value={editingBook.stock}
                        onChange={(e) => setEditingBook({ ...editingBook, stock: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('manageBooks.form.category')}</Label>
                      <Input
                        value={editingBook.category}
                        onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={handleEditBook}>{t('manageBooks.form.save')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-xl font-semibold">{t('allOrders.title')}</h2>

          {/* Orders Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="size-4" />
                  {t('common.searchFilters')}
                </CardTitle>
                {(orderSearch || orderStatusFilter !== 'all' || orderDateFilter !== 'all' || orderSortBy !== 'date-desc') && (
                  <Button variant="ghost" size="sm" onClick={clearOrderFilters}>
                    <X className="size-4 mr-2" />
                    {t('common.reset')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order-search">{t('admin.search')}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="order-search"
                      placeholder="ID, клієнт, книга..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order-status">{t('allOrders.status.placeholder')}</Label>
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger id="order-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allOrders.status.all')}</SelectItem>
                      <SelectItem value="pending">{t('allOrders.status.pending')}</SelectItem>
                      <SelectItem value="confirmed">{t('allOrders.status.confirmed')}</SelectItem>
                      <SelectItem value="cancelled">{t('allOrders.status.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order-date">{t('admin.period')}</Label>
                  <Select value={orderDateFilter} onValueChange={setOrderDateFilter}>
                    <SelectTrigger id="order-date">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('admin.period.all')}</SelectItem>
                      <SelectItem value="today">{t('admin.period.today')}</SelectItem>
                      <SelectItem value="week">{t('admin.period.week')}</SelectItem>
                      <SelectItem value="month">{t('admin.period.month')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order-sort">{t('allOrders.sort.placeholder')}</Label>
                  <Select value={orderSortBy} onValueChange={setOrderSortBy}>
                    <SelectTrigger id="order-sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">{t('allOrders.sort.dateDesc')}</SelectItem>
                      <SelectItem value="date-asc">{t('allOrders.sort.dateAsc')}</SelectItem>
                      <SelectItem value="price-desc">{t('allOrders.sort.priceDesc')}</SelectItem>
                      <SelectItem value="price-asc">{t('allOrders.sort.priceAsc')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  {t('allOrders.notFound')}
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map(order => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {t('orders.orderNumber')}{order.id}
                          <Badge variant={
                            order.status === 'confirmed' ? 'default' :
                              order.status === 'cancelled' ? 'destructive' :
                                'secondary'
                          }>
                            {order.status === 'pending' ? t('orders.pending') :
                              order.status === 'cancelled' ? t('orders.cancelled') :
                                t('orders.confirmed')}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {t('allOrders.fields.client')}: {order.customerEmail}<br />
                          {formatDate(order.createdAt)}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold">{order.totalPrice} {t('common.currency')}</p>
                        {order.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => handleConfirmOrder(order.id)}
                            >
                              <CheckCircle className="size-4 mr-2" />
                              {t('allOrders.actions.confirm')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              <X className="size-4 mr-2" />
                              {t('allOrders.actions.cancel')}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('manageBooks.form.name')}</TableHead>
                          <TableHead className="text-center">{t('book.quantity')}</TableHead>
                          <TableHead className="text-right">{t('book.price')}</TableHead>
                          <TableHead className="text-right">{t('admin.total')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.bookName}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{item.price} {t('common.currency')}</TableCell>
                            <TableCell className="text-right">{item.quantity * item.price} {t('common.currency')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {order.employeeEmail && (
                      <p className="text-sm text-gray-600 mt-4">
                        Опрацьовано: {order.employeeEmail}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )))}
          </div>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <h2 className="text-xl font-semibold">{t('clients.title')}</h2>

          {/* Clients Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="size-4" />
                  Фільтри пошуку
                </CardTitle>
                {(clientSearch || clientStatusFilter !== 'all' || clientSortBy !== 'name') && (
                  <Button variant="ghost" size="sm" onClick={clearClientFilters}>
                    <X className="size-4 mr-2" />
                    Скинути
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-search">{t('admin.search')}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="client-search"
                      placeholder={t('clients.searchPlaceholder')}
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-status">{t('clients.status.placeholder')}</Label>
                  <Select value={clientStatusFilter} onValueChange={setClientStatusFilter}>
                    <SelectTrigger id="client-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('clients.status.all')}</SelectItem>
                      <SelectItem value="active">{t('clients.status.active')}</SelectItem>
                      <SelectItem value="blocked">{t('clients.status.blocked')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-sort">{t('clients.sort.placeholder')}</Label>
                  <Select value={clientSortBy} onValueChange={setClientSortBy}>
                    <SelectTrigger id="client-sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">{t('clients.sort.nameAsc')}</SelectItem>
                      <SelectItem value="email">{t('clients.sort.emailAsc')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('auth.name')}</TableHead>
                    <TableHead>{t('auth.email')}</TableHead>
                    <TableHead>{t('orders.status')}</TableHead>
                    <TableHead className="text-center">{t('header.orders')}</TableHead>
                    <TableHead className="text-right">{t('allOrders.fields.total')}</TableHead>
                    <TableHead className="text-right">{t('admin.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {t('clients.notFound')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map(client => {
                      const stats = getClientOrderStats(client.email);
                      return (
                        <TableRow key={client.email}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>
                            <Badge variant={client.isBlocked ? 'destructive' : 'default'}>
                              {client.isBlocked ? t('admin.blocked') : t('admin.active')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{stats.ordersCount}</TableCell>
                          <TableCell className="text-right">{stats.totalSpent} {t('common.currency')}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleBlockClient(client.email)}
                            >
                              {client.isBlocked ? (
                                <>
                                  <UserCheck className="size-4 mr-2" />
                                  {t('admin.unblockClient')}
                                </>
                              ) : (
                                <>
                                  <UserX className="size-4 mr-2" />
                                  {t('admin.blockClient')}
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}