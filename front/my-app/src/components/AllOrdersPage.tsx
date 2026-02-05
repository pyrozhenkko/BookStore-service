import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Order } from '../types';
import { orderService } from '../services/orderService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { CheckCircle, XCircle, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const handleConfirmOrder = async (orderId: string) => {
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

  const handleCancelOrder = async (orderId: string) => {
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
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

      switch (sortBy) {
        case 'date':
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'price':
          compareValue = a.totalPrice - b.totalPrice;
          break;
        case 'customer':
          compareValue = (a.customerName || a.customerEmail).localeCompare(b.customerName || b.customerEmail);
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('allOrders.title')}</h1>
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
                          <p><span className="text-gray-600">{t('allOrders.fields.client')}:</span> {order.customerName || order.customerEmail}</p>
                          <p><span className="text-gray-600">{t('allOrders.fields.email')}:</span> {order.customerEmail}</p>
                          {order.phone && <p><span className="text-gray-600">{t('allOrders.fields.phone')}:</span> {order.phone}</p>}
                          <p><span className="text-gray-600">{t('allOrders.fields.date')}:</span> {formatDate(order.createdAt)}</p>
                          <p><span className="text-gray-600">{t('allOrders.fields.status')}:</span> {getStatusBadge(order.status)}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">{t('allOrders.fields.items')}:</h4>
                        <ul className="space-y-1 text-sm mb-3">
                          {order.items.map((item, index) => (
                            <li key={index}>
                              {item.bookName} x{item.quantity} = {item.price * item.quantity} {t('common.currency')}
                            </li>
                          ))}
                        </ul>
                        <p className="font-semibold">{t('allOrders.fields.total')}: {order.totalPrice} {t('common.currency')}</p>

                        {order.delivery && (
                          <div className="mt-3 text-sm">
                            <p className="text-gray-600">{t('allOrders.fields.delivery')}:</p>
                            <p>{order.delivery.city}, {order.delivery.warehouse}</p>
                          </div>
                        )}

                        {order.paymentTransactionId && (
                          <p className="text-xs text-gray-500 mt-2">
                            {t('allOrders.fields.transactionId')}: {order.paymentTransactionId}
                          </p>
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
