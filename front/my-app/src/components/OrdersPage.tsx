import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Order } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Package, Calendar, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

export function OrdersPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = savedOrders.filter((order: Order) => order.customerEmail === currentUser?.email);
    setOrders(userOrders);
  }, [currentUser]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, text: 'В обробці' },
      confirmed: { variant: 'default' as const, text: 'Підтверджено' },
      cancelled: { variant: 'destructive' as const, text: 'Скасовано' }
    };
    
    const { variant, text } = variants[status];
    return <Badge variant={variant}>{text}</Badge>;
  };

  // Фільтрація та сортування
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Пошук
    if (searchQuery) {
      result = result.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.bookName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Фільтр за статусом
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Сортування
    result.sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'date') {
        compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        compareValue = a.totalPrice - b.totalPrice;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return result;
  }, [orders, searchQuery, statusFilter, sortBy, sortOrder]);

  // Пагінація
  const totalPages = Math.ceil(filteredAndSortedOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedOrders, currentPage]);

  // Скидання сторінки при зміні фільтрів
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy, sortOrder]);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Package className="size-24 text-gray-300" />
        <h2 className="text-2xl font-semibold text-gray-700">У вас поки немає замовлень</h2>
        <p className="text-gray-500">Ваші замовлення з'являться тут після оформлення</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Мої замовлення</h1>
        <p className="text-gray-600">Перегляд історії ваших замовлень</p>
      </div>

      {/* Пошук та фільтри */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Пошук за ID або назвою книги..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі статуси</SelectItem>
                <SelectItem value="pending">В обробці</SelectItem>
                <SelectItem value="confirmed">Підтверджені</SelectItem>
                <SelectItem value="cancelled">Скасовані</SelectItem>
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
                <SelectItem value="date-desc">Дата (нові спочатку)</SelectItem>
                <SelectItem value="date-asc">Дата (старі спочатку)</SelectItem>
                <SelectItem value="price-desc">Сума (більша-менша)</SelectItem>
                <SelectItem value="price-asc">Сума (менша-більша)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Нічого не знайдено</p>
          <p className="text-sm mt-2">Спробуйте змінити фільтри пошуку</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Показано {paginatedOrders.length} з {filteredAndSortedOrders.length} замовлень</span>
            {totalPages > 1 && <span>Сторінка {currentPage} з {totalPages}</span>}
          </div>

          <div className="space-y-4">
            {paginatedOrders.map(order => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Замовлення #{order.id}
                    {getStatusBadge(order.status)}
                  </CardTitle>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Calendar className="size-4" />
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Загалом</p>
                  <p className="text-2xl font-semibold">{order.totalPrice} ₴</p>
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
                      <TableCell className="font-medium">{item.bookName}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.price} ₴</TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.quantity * item.price} ₴
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(order as any).delivery && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <MapPin className="size-4" />
                    Доставка Нова Пошта
                  </div>
                  <p className="text-sm text-gray-600">{(order as any).delivery.city}</p>
                  <p className="text-sm text-gray-600">{(order as any).delivery.warehouse}</p>
                  {(order as any).phone && (
                    <p className="text-sm text-gray-600 mt-1">Телефон: {(order as any).phone}</p>
                  )}
                </div>
              )}
              {order.employeeEmail && (
                <p className="text-sm text-gray-600 mt-4">
                  Підтверджено співробітником: {order.employeeEmail}
                </p>
              )}
            </CardContent>
          </Card>
            ))}
          </div>

          {/* Пагінація */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
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
          )}
        </>
      )}
    </div>
  );
}
