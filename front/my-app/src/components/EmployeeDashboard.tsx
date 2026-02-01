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

export function EmployeeDashboard() {
  const { currentUser } = useAuth();
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
      id: String(books.length + 1),
      ...newBook as Book
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
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Панель керування</h1>
        <p className="text-gray-600">Управління книгами, замовленнями та клієнтами</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Загальний дохід</CardTitle>
            <DollarSign className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue} ₴</div>
            <p className="text-xs text-gray-600 mt-1">Підтверджені замовлення</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Замовлення в обробці</CardTitle>
            <Package className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-gray-600 mt-1">Очікують підтвердження</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Мало на складі</CardTitle>
            <TrendingUp className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockBooks}</div>
            <p className="text-xs text-gray-600 mt-1">Книг {'<'} 10 шт</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Активні клієнти</CardTitle>
            <Users className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
            <p className="text-xs text-gray-600 mt-1">Незаблоковані акаунти</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="books" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="books">Книги ({filteredBooks.length})</TabsTrigger>
          <TabsTrigger value="orders">Замовлення ({filteredOrders.length})</TabsTrigger>
          <TabsTrigger value="clients">Клієнти ({filteredClients.length})</TabsTrigger>
        </TabsList>

        {/* Books Tab */}
        <TabsContent value="books" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Управління книгами</h2>
            <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4 mr-2" />
                  Додати книгу
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Додати нову книгу</DialogTitle>
                  <DialogDescription>
                    Заповніть дані для додавання книги в каталог
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Назва</Label>
                      <Input
                        id="name"
                        value={newBook.name}
                        onChange={(e) => setNewBook({ ...newBook, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author">Автор</Label>
                      <Input
                        id="author"
                        value={newBook.author}
                        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Опис</Label>
                    <Textarea
                      id="description"
                      value={newBook.description}
                      onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Категорія</Label>
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
                      <Label htmlFor="price">Ціна (₴)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newBook.price}
                        onChange={(e) => setNewBook({ ...newBook, price: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Кількість</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newBook.stock}
                        onChange={(e) => setNewBook({ ...newBook, stock: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Рік</Label>
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
                  <Button onClick={handleAddBook}>Додати книгу</Button>
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
                  Фільтри пошуку
                </CardTitle>
                {(bookSearch || bookCategory !== 'all' || bookStockFilter !== 'all' || bookSortBy !== 'name') && (
                  <Button variant="ghost" size="sm" onClick={clearBookFilters}>
                    <X className="size-4 mr-2" />
                    Скинути
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="book-search">Пошук</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="book-search"
                      placeholder="Назва, автор, ISBN..."
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book-category">Категорія</Label>
                  <Select value={bookCategory} onValueChange={setBookCategory}>
                    <SelectTrigger id="book-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі категорії</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book-stock">Наявність</Label>
                  <Select value={bookStockFilter} onValueChange={setBookStockFilter}>
                    <SelectTrigger id="book-stock">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі книги</SelectItem>
                      <SelectItem value="in-stock">В наявності</SelectItem>
                      <SelectItem value="low-stock">Мало ({"<"}10)</SelectItem>
                      <SelectItem value="out-of-stock">Немає в наявності</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book-sort">Сортування</Label>
                  <Select value={bookSortBy} onValueChange={setBookSortBy}>
                    <SelectTrigger id="book-sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">За назвою</SelectItem>
                      <SelectItem value="author">За автором</SelectItem>
                      <SelectItem value="price-asc">Ціна: за зростанням</SelectItem>
                      <SelectItem value="price-desc">Ціна: за спаданням</SelectItem>
                      <SelectItem value="stock-asc">Наявність: за зростанням</SelectItem>
                      <SelectItem value="stock-desc">Наявність: за спаданням</SelectItem>
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
                    <TableHead>Назва</TableHead>
                    <TableHead>Автор</TableHead>
                    <TableHead>Категорія</TableHead>
                    <TableHead className="text-right">Ціна</TableHead>
                    <TableHead className="text-center">Наявність</TableHead>
                    <TableHead className="text-right">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map(book => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.name}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.category}</TableCell>
                      <TableCell className="text-right">{book.price} ₴</TableCell>
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
                            onClick={() => handleDeleteBook(book.id)}
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
                <DialogTitle>Редагувати книгу</DialogTitle>
              </DialogHeader>
              {editingBook && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Назва</Label>
                      <Input
                        value={editingBook.name}
                        onChange={(e) => setEditingBook({ ...editingBook, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Автор</Label>
                      <Input
                        value={editingBook.author}
                        onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Опис</Label>
                    <Textarea
                      value={editingBook.description}
                      onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Ціна (₴)</Label>
                      <Input
                        type="number"
                        value={editingBook.price}
                        onChange={(e) => setEditingBook({ ...editingBook, price: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Кількість</Label>
                      <Input
                        type="number"
                        value={editingBook.stock}
                        onChange={(e) => setEditingBook({ ...editingBook, stock: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Категорія</Label>
                      <Input
                        value={editingBook.category}
                        onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={handleEditBook}>Зберегти зміни</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-xl font-semibold">Управління замовленнями</h2>
          
          {/* Orders Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="size-4" />
                  Фільтри пошуку
                </CardTitle>
                {(orderSearch || orderStatusFilter !== 'all' || orderDateFilter !== 'all' || orderSortBy !== 'date-desc') && (
                  <Button variant="ghost" size="sm" onClick={clearOrderFilters}>
                    <X className="size-4 mr-2" />
                    Скинути
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order-search">Пошук</Label>
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
                  <Label htmlFor="order-status">Статус</Label>
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger id="order-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі замовлення</SelectItem>
                      <SelectItem value="pending">В обробці</SelectItem>
                      <SelectItem value="confirmed">Підтверджено</SelectItem>
                      <SelectItem value="cancelled">Скасовано</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order-date">Період</Label>
                  <Select value={orderDateFilter} onValueChange={setOrderDateFilter}>
                    <SelectTrigger id="order-date">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Весь час</SelectItem>
                      <SelectItem value="today">Сьогодні</SelectItem>
                      <SelectItem value="week">Останній тиждень</SelectItem>
                      <SelectItem value="month">Останній місяць</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order-sort">Сортування</Label>
                  <Select value={orderSortBy} onValueChange={setOrderSortBy}>
                    <SelectTrigger id="order-sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Дата: нові першими</SelectItem>
                      <SelectItem value="date-asc">Дата: старі першими</SelectItem>
                      <SelectItem value="price-desc">Сума: за спаданням</SelectItem>
                      <SelectItem value="price-asc">Сума: за зростанням</SelectItem>
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
                  Замовлення не знайдено
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map(order => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Замовлення #{order.id}
                        <Badge variant={
                          order.status === 'confirmed' ? 'default' : 
                          order.status === 'cancelled' ? 'destructive' : 
                          'secondary'
                        }>
                          {order.status === 'pending' ? 'В обробці' : 
                           order.status === 'cancelled' ? 'Скасовано' : 
                           'Підтверджено'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Клієнт: {order.customerEmail}<br />
                        {formatDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold">{order.totalPrice} ₴</p>
                      {order.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => handleConfirmOrder(order.id)}
                          >
                            <CheckCircle className="size-4 mr-2" />
                            Підтвердити
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <X className="size-4 mr-2" />
                            Скасувати
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
                        <TableHead>Книга</TableHead>
                        <TableHead className="text-center">Кількість</TableHead>
                        <TableHead className="text-right">Ціна</TableHead>
                        <TableHead className="text-right">Підсумок</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.bookName}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.price} ₴</TableCell>
                          <TableCell className="text-right">{item.quantity * item.price} ₴</TableCell>
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
          <h2 className="text-xl font-semibold">Управління клієнтами</h2>
          
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
                  <Label htmlFor="client-search">Пошук</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="client-search"
                      placeholder="Ім'я або email..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-status">Статус</Label>
                  <Select value={clientStatusFilter} onValueChange={setClientStatusFilter}>
                    <SelectTrigger id="client-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі клієнти</SelectItem>
                      <SelectItem value="active">Активні</SelectItem>
                      <SelectItem value="blocked">Заблоковані</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-sort">Сортування</Label>
                  <Select value={clientSortBy} onValueChange={setClientSortBy}>
                    <SelectTrigger id="client-sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">За ім'ям</SelectItem>
                      <SelectItem value="email">За email</SelectItem>
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
                    <TableHead>Ім'я</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-center">Замовлень</TableHead>
                    <TableHead className="text-right">Загалом витрачено</TableHead>
                    <TableHead className="text-right">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Клієнти не знайдені
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
                              {client.isBlocked ? 'Заблоковано' : 'Активний'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{stats.ordersCount}</TableCell>
                          <TableCell className="text-right">{stats.totalSpent} ₴</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleBlockClient(client.email)}
                            >
                              {client.isBlocked ? (
                                <>
                                  <UserCheck className="size-4 mr-2" />
                                  Розблокувати
                                </>
                              ) : (
                                <>
                                  <UserX className="size-4 mr-2" />
                                  Заблокувати
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