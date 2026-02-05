import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Employee } from '../types';
import { employeeService } from '../services/employeeService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pencil, Trash2, Plus, UserCheck, UserX, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

const ITEMS_PER_PAGE = 10;

export function EmployeesPage() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'position' | 'hiredDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    position: '',
    phone: '',
    hiredDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error(t('employees.toasts.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Фільтрація, сортування та пагінація
  const filteredAndSortedEmployees = useMemo(() => {
    let result = [...employees];

    // Пошук
    if (searchQuery) {
      result = result.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фільтр за статусом
    if (statusFilter === 'active') {
      result = result.filter(emp => emp.isActive);
    } else if (statusFilter === 'inactive') {
      result = result.filter(emp => !emp.isActive);
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
        case 'position':
          compareValue = a.position.localeCompare(b.position);
          break;
        case 'hiredDate':
          compareValue = new Date(a.hiredDate).getTime() - new Date(b.hiredDate).getTime();
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return result;
  }, [employees, searchQuery, statusFilter, sortBy, sortOrder]);

  // Пагінація
  const totalPages = Math.ceil(filteredAndSortedEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedEmployees, currentPage]);

  // Скидання сторінки при зміні фільтрів
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy, sortOrder]);

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      email: '',
      name: '',
      position: '',
      phone: '',
      hiredDate: new Date().toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      email: employee.email,
      name: employee.name,
      position: employee.position,
      phone: employee.phone || '',
      hiredDate: employee.hiredDate,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, {
          ...formData,
          id: editingEmployee.id,
          isActive: editingEmployee.isActive,
        });
        toast.success(t('employees.toasts.updateSuccess'));
      } else {
        await employeeService.createEmployee({
          ...formData,
          isActive: true,
        });
        toast.success(t('employees.toasts.createSuccess'));
      }

      setIsDialogOpen(false);
      loadEmployees();
    } catch (error) {
      toast.error(t('employees.toasts.saveError'));
    }
  };

  const handleTerminate = async (employee: Employee) => {
    if (!confirm(t('employees.actions.terminateConfirm', { name: employee.name }))) {
      return;
    }

    try {
      await employeeService.terminateEmployee(employee.id);
      toast.success(t('employees.toasts.terminateSuccess'));
      loadEmployees();
    } catch (error) {
      toast.error(t('employees.toasts.terminateError'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t('language.currrent') === 'English' ? 'en-US' : 'uk-UA');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('employees.title')}</h1>
        <Button onClick={handleAdd}>
          <Plus className="size-4 mr-2" />
          {t('employees.addEmployee')}
        </Button>
      </div>

      {/* Пошук та фільтри */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder={t('employees.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder={t('employees.status.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('employees.status.all')}</SelectItem>
                <SelectItem value="active">{t('employees.status.active')}</SelectItem>
                <SelectItem value="inactive">{t('employees.status.inactive')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
              const [field, order] = v.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}>
              <SelectTrigger>
                <SelectValue placeholder={t('employees.sort.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">{t('employees.sort.nameAsc')}</SelectItem>
                <SelectItem value="name-desc">{t('employees.sort.nameDesc')}</SelectItem>
                <SelectItem value="email-asc">{t('employees.sort.emailAsc')}</SelectItem>
                <SelectItem value="email-desc">{t('employees.sort.emailDesc')}</SelectItem>
                <SelectItem value="position-asc">{t('employees.sort.positionAsc')}</SelectItem>
                <SelectItem value="position-desc">{t('employees.sort.positionDesc')}</SelectItem>
                <SelectItem value="hiredDate-asc">{t('employees.sort.hiredDateAsc')}</SelectItem>
                <SelectItem value="hiredDate-desc">{t('employees.sort.hiredDateDesc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('employees.listTitle')}</CardTitle>
            <div className="text-sm text-gray-600">
              {t('employees.showing', { current: paginatedEmployees.length, total: filteredAndSortedEmployees.length })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">{t('common.loading')}</div>
          ) : filteredAndSortedEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || statusFilter !== 'all' ? t('employees.notFound') : t('employees.noEmployees')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('employees.table.name')}</TableHead>
                  <TableHead>{t('employees.table.email')}</TableHead>
                  <TableHead>{t('employees.table.position')}</TableHead>
                  <TableHead>{t('employees.table.phone')}</TableHead>
                  <TableHead>{t('employees.table.hiredDate')}</TableHead>
                  <TableHead>{t('employees.table.status')}</TableHead>
                  <TableHead className="text-right">{t('employees.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.phone || '—'}</TableCell>
                    <TableCell>{formatDate(employee.hiredDate)}</TableCell>
                    <TableCell>
                      {employee.isActive ? (
                        <Badge variant="default" className="bg-green-500">
                          <UserCheck className="size-3 mr-1" />
                          {t('employees.badges.active')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <UserX className="size-3 mr-1" />
                          {t('employees.badges.terminated')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(employee)}
                          title="Редагувати"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        {employee.isActive && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleTerminate(employee)}
                            className="text-red-600 hover:text-red-700"
                            title={t('employees.actions.terminate')}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? t('employees.form.editTitle') : t('employees.form.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('employees.form.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('employees.form.email')} *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">{t('employees.form.position')} *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('employees.form.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hiredDate">{t('employees.form.hiredDate')} *</Label>
              <Input
                id="hiredDate"
                type="date"
                value={formData.hiredDate}
                onChange={(e) => setFormData({ ...formData, hiredDate: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('employees.form.cancel')}
              </Button>
              <Button type="submit">
                {editingEmployee ? t('employees.form.save') : t('employees.form.add')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
