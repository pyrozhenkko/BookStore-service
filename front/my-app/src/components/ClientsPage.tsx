import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Client } from '../types';
import { clientService } from '../services/clientService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Ban, ShieldCheck, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

const ITEMS_PER_PAGE = 10;

export function ClientsPage() {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'totalOrders' | 'registeredDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (error) {
      toast.error(t('clients.toasts.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async (client: Client) => {
    const confirmMessage = client.isBlocked
      ? t('clients.actions.confirmUnblock', { name: client.name })
      : t('clients.actions.confirmBlock', { name: client.name });

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      if (client.isBlocked) {
        await clientService.unblockClient(client.id);
        toast.success(t('clients.toasts.unblockSuccess'));
      } else {
        await clientService.blockClient(client.id);
        toast.success(t('clients.toasts.blockSuccess'));
      }
      loadClients();
    } catch (error) {
      toast.error(t('clients.toasts.actionError'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t('language.currrent') === 'English' ? 'en-US' : 'uk-UA');
  };

  // Фільтрація та сортування
  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients];

    // Пошук
    if (searchQuery) {
      result = result.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фільтр за статусом
    if (statusFilter === 'active') {
      result = result.filter(client => !client.isBlocked);
    } else if (statusFilter === 'blocked') {
      result = result.filter(client => client.isBlocked);
    }

    // Сортування
    result.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'email':
          compareValue = a.email.localeCompare(b.email);
          break;
        case 'totalOrders':
          compareValue = a.totalOrders - b.totalOrders;
          break;
        case 'registeredDate':
          compareValue = new Date(a.registeredDate).getTime() - new Date(b.registeredDate).getTime();
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return result;
  }, [clients, searchQuery, statusFilter, sortBy, sortOrder]);

  // Пагінація
  const totalPages = Math.ceil(filteredAndSortedClients.length / ITEMS_PER_PAGE);
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedClients, currentPage]);

  // Скидання сторінки при зміні фільтрів
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('clients.title')}</h1>
      </div>

      {/* Пошук та фільтри */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder={t('clients.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder={t('clients.status.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('clients.status.all')}</SelectItem>
                <SelectItem value="active">{t('clients.status.active')}</SelectItem>
                <SelectItem value="blocked">{t('clients.status.blocked')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
              const [field, order] = v.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}>
              <SelectTrigger>
                <SelectValue placeholder={t('clients.sort.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">{t('clients.sort.nameAsc')}</SelectItem>
                <SelectItem value="name-desc">{t('clients.sort.nameDesc')}</SelectItem>
                <SelectItem value="email-asc">{t('clients.sort.emailAsc')}</SelectItem>
                <SelectItem value="email-desc">{t('clients.sort.emailDesc')}</SelectItem>
                <SelectItem value="totalOrders-desc">{t('clients.sort.ordersDesc')}</SelectItem>
                <SelectItem value="totalOrders-asc">{t('clients.sort.ordersAsc')}</SelectItem>
                <SelectItem value="registeredDate-asc">{t('clients.sort.dateAsc')}</SelectItem>
                <SelectItem value="registeredDate-desc">{t('clients.sort.dateDesc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('clients.listTitle')}</CardTitle>
            <div className="text-sm text-gray-600">
              {t('clients.showing', { current: paginatedClients.length, total: filteredAndSortedClients.length })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">{t('common.loading')}</div>
          ) : filteredAndSortedClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || statusFilter !== 'all' ? t('clients.notFound') : t('clients.noClients')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('clients.table.name')}</TableHead>
                  <TableHead>{t('clients.table.email')}</TableHead>
                  <TableHead>{t('clients.table.phone')}</TableHead>
                  <TableHead>{t('clients.table.registeredDate')}</TableHead>
                  <TableHead className="text-center">{t('clients.table.orders')}</TableHead>
                  <TableHead>{t('clients.table.status')}</TableHead>
                  <TableHead className="text-right">{t('clients.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone || '—'}</TableCell>
                    <TableCell>{formatDate(client.registeredDate)}</TableCell>
                    <TableCell className="text-center">{client.totalOrders}</TableCell>
                    <TableCell>
                      {client.isBlocked ? (
                        <Badge variant="destructive">
                          <Ban className="size-3 mr-1" />
                          {t('clients.badges.blocked')}
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500">
                          <ShieldCheck className="size-3 mr-1" />
                          {t('clients.badges.active')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={client.isBlocked ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => handleBlockToggle(client)}
                      >
                        {client.isBlocked ? (
                          <>
                            <ShieldCheck className="size-4 mr-2" />
                            {t('clients.actions.unblock')}
                          </>
                        ) : (
                          <>
                            <Ban className="size-4 mr-2" />
                            {t('clients.actions.block')}
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Пагінація */}
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
    </div>
  );
}
