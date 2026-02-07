import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import type { Order } from '../types';
import { orderService } from '../services/orderService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Package, Calendar, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

export function OrdersPage() {
  const { t, i18n } = useTranslation();
  const { currentUser, refreshUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadOrders = async () => {
      if (currentUser?.email) {
        try {
          const data = await orderService.getOrdersByCustomer(currentUser.email);
          setOrders(data);

          // Refresh balance if returning from successful payment
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('session_id')) {
            refreshUser();
          }
        } catch (error) {
          console.error('Error loading orders:', error);
        }
      }
    };
    loadOrders();
  }, [currentUser, refreshUser]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'uk' ? 'uk-UA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, text: t('orders.pending') },
      confirmed: { variant: 'default' as const, text: t('orders.confirmed') },
      cancelled: { variant: 'destructive' as const, text: t('orders.cancelled') }
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
        order.id.toString().includes(searchQuery.toLowerCase()) ||
        order.bookItems.some(item => item.bookName.toLowerCase().includes(searchQuery.toLowerCase()))
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
        compareValue = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      } else {
        compareValue = a.price - b.price;
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
        <h2 className="text-2xl font-semibold text-gray-700">{t('orders.empty.title')}</h2>
        <p className="text-gray-500">{t('orders.empty.description')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{t('orders.title')}</h1>
          <p className="text-muted-foreground">{t('orders.empty.description')}</p>
        </div>
      </div>

      {/* Пошук та фільтри */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder={t('allOrders.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder={t('orders.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allOrders.status.all')}</SelectItem>
                <SelectItem value="pending">{t('orders.pending')}</SelectItem>
                <SelectItem value="confirmed">{t('orders.confirmed')}</SelectItem>
                <SelectItem value="cancelled">{t('orders.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
              const [field, order] = v.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}>
              <SelectTrigger>
                <SelectValue placeholder={t('catalog.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">{t('allOrders.sort.dateDesc')}</SelectItem>
                <SelectItem value="date-asc">{t('allOrders.sort.dateAsc')}</SelectItem>
                <SelectItem value="price-desc">{t('allOrders.sort.priceDesc')}</SelectItem>
                <SelectItem value="price-asc">{t('allOrders.sort.priceAsc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">{t('allOrders.notFound')}</p>
          <p className="text-sm mt-2">{t('catalog.tryDifferentSearch')}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{t('manageBooks.showing', { current: paginatedOrders.length, total: filteredAndSortedOrders.length })}</span>
            {totalPages > 1 && <span>{t('book.page')} {currentPage} {t('book.of')} {totalPages}</span>}
          </div>

          <div className="space-y-4">
            {paginatedOrders.map(order => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-xl flex items-center gap-3">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">#{order.id}</span>
                          {getStatusBadge(order.status)}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            {formatDate(order.orderDate)}
                          </span>
                          {order.clientEmail && (
                            <span className="flex items-center gap-1">
                              <Package className="size-4" />
                              {order.bookItems.length} {t('cart.item')}{order.bookItems.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">{t('orders.total')}</p>
                        <p className="text-3xl font-bold text-primary">{order.price.toLocaleString()} ₴</p>
                      </div>
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
                        <TableHead className="text-right">{t('orders.total')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.bookItems.map((item, index) => (
                        <TableRow key={index} className="hover:bg-transparent">
                          <TableCell className="font-medium pl-0">{item.bookName}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {item.price ? `${item.price.toLocaleString()} ₴` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold pr-0">
                            {item.price ? `${(item.price * item.quantity).toLocaleString()} ₴` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {order.deliveryCity && (
                    <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border/50">
                      <div className="flex items-center gap-2 text-sm font-semibold mb-3 text-primary uppercase tracking-wider">
                        <MapPin className="size-4" />
                        {t('checkout.delivery')}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs">{t('checkout.city')}</p>
                          <p className="font-medium">{order.deliveryCity}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs">{t('checkout.warehouse')}</p>
                          <p className="font-medium">{order.deliveryBranch}</p>
                        </div>
                        {order.clientPhone && (
                          <div className="space-y-1">
                            <p className="text-muted-foreground text-xs">{t('auth.phone')}</p>
                            <p className="font-medium">{order.clientPhone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {order.employeeEmail && (
                    <p className="text-sm text-gray-600 mt-4">
                      {t('orders.confirmed')} {order.employeeEmail}
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
          )}
        </>
      )}
    </div>
  );
}
