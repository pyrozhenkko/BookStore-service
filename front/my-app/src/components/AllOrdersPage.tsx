import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Order } from '../types';
import { orderService } from '../services/orderService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CheckCircle, XCircle, Clock, Search, ChevronLeft, ChevronRight, Package, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 5;

export function AllOrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'customer'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      toast.error(t('allOrders.toasts.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId: number) => {
    if (!confirm(t('allOrders.confirmPrompt'))) {
      return;
    }

    try {
      await orderService.confirmOrder(orderId);
      toast.success(t('allOrders.toasts.confirmSuccess'));
      loadOrders();
    } catch (error) {
      toast.error(t('allOrders.toasts.confirmError'));
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm(t('allOrders.cancelPrompt'))) {
      return;
    }

    try {
      await orderService.cancelOrder(orderId);
      toast.success(t('allOrders.toasts.cancelSuccess'));
      loadOrders();
    } catch (error) {
      toast.error(t('allOrders.toasts.cancelError'));
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="size-3 mr-1" />
            {t('allOrders.status.confirmed')}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="size-3 mr-1" />
            {t('allOrders.status.cancelled')}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="size-3 mr-1" />
            {t('allOrders.status.pending')}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(t('language.currrent') === 'English' ? 'en-US' : 'uk-UA'); // Simplistic approach, or use useLanguage to get locale code
  };

  // Фільтрація та сортування
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Пошук
    if (searchQuery) {
      result = result.filter(order =>
        order.id.toString().includes(searchQuery.toLowerCase()) ||
        order.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

      switch (sortBy) {
        case 'date':
          compareValue = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
          break;
        case 'price':
          compareValue = a.price - b.price;
          break;
        case 'customer':
          compareValue = (a.clientName || a.clientEmail).localeCompare(b.clientName || b.clientEmail);
          break;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{t('allOrders.title')}</h1>
          <p className="text-muted-foreground">{t('allOrders.globalList')}</p>
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
                <SelectValue placeholder={t('allOrders.status.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allOrders.status.all')}</SelectItem>
                <SelectItem value="pending">{t('allOrders.status.pending')}</SelectItem>
                <SelectItem value="confirmed">{t('allOrders.status.confirmed')}</SelectItem>
                <SelectItem value="cancelled">{t('allOrders.status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
              const [field, order] = v.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}>
              <SelectTrigger>
                <SelectValue placeholder={t('allOrders.sort.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">{t('allOrders.sort.dateDesc')}</SelectItem>
                <SelectItem value="date-asc">{t('allOrders.sort.dateAsc')}</SelectItem>
                <SelectItem value="price-desc">{t('allOrders.sort.priceDesc')}</SelectItem>
                <SelectItem value="price-asc">{t('allOrders.sort.priceAsc')}</SelectItem>
                <SelectItem value="customer-asc">{t('allOrders.sort.customerAsc')}</SelectItem>
                <SelectItem value="customer-desc">{t('allOrders.sort.customerDesc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('allOrders.globalList')}</CardTitle>
            <div className="text-sm text-gray-600">
              {t('allOrders.showing', { current: paginatedOrders.length, total: filteredAndSortedOrders.length })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">{t('common.loading')}</div>
          ) : filteredAndSortedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || statusFilter !== 'all' ? t('allOrders.notFound') : t('allOrders.noOrders')}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{t('allOrders.fields.orderId', { id: order.id })}</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-600">{t('allOrders.fields.client')}:</span> {order.clientName || order.clientEmail}</p>
                          <p><span className="text-gray-600">{t('allOrders.fields.email')}:</span> {order.clientEmail}</p>
                          {order.clientPhone && <p><span className="text-gray-600">{t('allOrders.fields.phone')}:</span> {order.clientPhone}</p>}
                          <p><span className="text-gray-600">{t('allOrders.fields.date')}:</span> {formatDate(order.orderDate)}</p>
                          <p><span className="text-gray-600">{t('allOrders.fields.status')}:</span> {getStatusBadge(order.status)}</p>
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Package className="size-4" />
                              {order.clientEmail}
                            </div>
                            <div className="font-semibold text-lg">{order.clientName || '-'}</div>
                            <div className="text-sm text-muted-foreground">{order.clientPhone || '-'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">{t('allOrders.fields.total')}</div>
                            <div className="text-2xl font-bold text-primary">{order.price.toLocaleString()} ₴</div>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="pl-0">{t('manageBooks.form.name')}</TableHead>
                                <TableHead className="text-center">{t('book.quantity')}</TableHead>
                                <TableHead className="text-right">{t('book.price')}</TableHead>
                                <TableHead className="text-right pr-0">{t('orders.total')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {order.bookItems.map((item, index) => (
                                <TableRow key={index} className="hover:bg-transparent border-0">
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
                        </div>

                        {(order.deliveryCity || order.deliveryBranch) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm p-3 bg-muted/20 rounded-lg border border-border/30">
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">{t('checkout.city')}</p>
                              <p className="font-medium">{order.deliveryCity}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">{t('checkout.warehouse')}</p>
                              <p className="font-medium">{order.deliveryBranch}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {order.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleConfirmOrder(order.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="size-4 mr-2" />
                          {t('allOrders.actions.confirm')}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <XCircle className="size-4 mr-2" />
                          {t('allOrders.actions.cancel')}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
    </div>
  );
}
