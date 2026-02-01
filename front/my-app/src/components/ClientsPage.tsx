import { useState, useEffect, useMemo } from 'react';
import type{ Client } from '../types';
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
      toast.error('Помилка завантаження клієнтів');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async (client: Client) => {
    const action = client.isBlocked ? 'розблокувати' : 'заблокувати';
    if (!confirm(`Ви впевнені, що хочете ${action} ${client.name}?`)) {
      return;
    }

    try {
      if (client.isBlocked) {
        await clientService.unblockClient(client.id);
        toast.success('Клієнта розблоковано');
      } else {
        await clientService.blockClient(client.id);
        toast.success('Клієнта заблоковано');
      }
      loadClients();
    } catch (error) {
      toast.error(`Помилка: не вдалося ${action} клієнта`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
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
        <h1 className="text-3xl font-bold">Клієнти</h1>
      </div>

      {/* Пошук та фільтри */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Пошук за ім'ям або email..."
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
                <SelectItem value="active">Активні</SelectItem>
                <SelectItem value="blocked">Заблоковані</SelectItem>
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
                <SelectItem value="name-asc">Ім'я (А-Я)</SelectItem>
                <SelectItem value="name-desc">Ім'я (Я-А)</SelectItem>
                <SelectItem value="email-asc">Email (А-Я)</SelectItem>
                <SelectItem value="email-desc">Email (Я-А)</SelectItem>
                <SelectItem value="totalOrders-desc">Замовлень (більше-менше)</SelectItem>
                <SelectItem value="totalOrders-asc">Замовлень (менше-більше)</SelectItem>
                <SelectItem value="registeredDate-asc">Дата реєстрації (стара-нова)</SelectItem>
                <SelectItem value="registeredDate-desc">Дата реєстрації (нова-стара)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Список клієнтів</CardTitle>
            <div className="text-sm text-gray-600">
              Показано {paginatedClients.length} з {filteredAndSortedClients.length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Завантаження...</div>
          ) : filteredAndSortedClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || statusFilter !== 'all' ? 'Нічого не знайдено' : 'Немає клієнтів'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ім'я</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Дата реєстрації</TableHead>
                  <TableHead className="text-center">Замовлень</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Дії</TableHead>
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
                          Заблокований
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500">
                          <ShieldCheck className="size-3 mr-1" />
                          Активний
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
                            Розблокувати
                          </>
                        ) : (
                          <>
                            <Ban className="size-4 mr-2" />
                            Заблокувати
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
    </div>
  );
}
