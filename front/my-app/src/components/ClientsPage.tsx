import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Client } from '../types';
import { clientService } from '../services/clientService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Ban, ShieldCheck, Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

const ITEMS_PER_PAGE = 10;

export function ClientsPage() {
  const { t, language } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'totalOrders' | 'registeredDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    loadClients();
  }, [searchQuery, statusFilter, sortBy, sortOrder, currentPage]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const isBlocked = statusFilter === 'all' ? undefined : statusFilter === 'blocked';
      const sortParam = `${sortBy},${sortOrder}`;

      const data = await clientService.searchClients({
        keyword: searchQuery,
        isBlocked,
        page: currentPage - 1, // Spring is 0-indexed
        size: ITEMS_PER_PAGE,
        sort: sortParam
      });

      setClients(data.content);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalElements);
    } catch (error) {
      toast.error(t('clients.toasts.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await clientService.updateClient(editingClient.id, formData);
        toast.success(t('clients.toasts.updateSuccess'));
      } else {
        await clientService.createClient(formData);
        toast.success(t('clients.toasts.createSuccess'));
      }
      setIsDialogOpen(false);
      loadClients();
    } catch (error) {
      toast.error(t('clients.toasts.saveError'));
    }
  };

  const handleDelete = async (client: Client) => {
    if (!confirm(t('clients.actions.confirmDelete', { name: client.name }))) {
      return;
    }

    try {
      await clientService.deleteClient(client.id);
      toast.success(t('clients.toasts.deleteSuccess'));
      loadClients();
    } catch (error) {
      toast.error(t('clients.toasts.actionError'));
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
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-US' : 'uk-UA');
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('clients.title')}</h1>
        <Button onClick={handleAdd}>
          <Plus className="size-4 mr-2" />
          {t('clients.addClient')}
        </Button>
      </div>

      {/* Search and filters */}
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
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">{t('common.loading')}</div>
          ) : clients.length === 0 ? (
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
                {clients.map((client) => (
                  <TableRow key={client.id} className={client.isBlocked ? "opacity-60 bg-gray-50/50" : ""}>
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
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(client)}
                          title={t('clients.actions.edit')}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleBlockToggle(client)}
                          className={client.isBlocked ? "text-green-600 hover:text-green-700" : "text-amber-600 hover:text-amber-700"}
                          title={client.isBlocked ? t('clients.actions.unblock') : t('clients.actions.block')}
                        >
                          {client.isBlocked ? <UserCheck className="size-4" /> : <Ban className="size-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(client)}
                          className="text-red-600 hover:text-red-700"
                          title={t('clients.actions.delete')}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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

      {/* Dialog for Add/Edit Client */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? t('clients.editClient') : t('clients.addClient')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('clients.form.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('clients.form.email')} *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('clients.form.phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {t('clients.form.password')} {editingClient ? t('clients.form.passwordHint') : '*'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingClient}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
