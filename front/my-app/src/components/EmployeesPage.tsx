import { useState, useEffect, useMemo } from 'react';
import type { Employee } from '../types';
import { employeeService } from '../services/employeeService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pencil, Trash2, Plus, UserCheck, UserX, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

const ITEMS_PER_PAGE = 10;

export function EmployeesPage() {
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
      toast.error('Помилка завантаження працівників');
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
        toast.success('Працівника оновлено');
      } else {
        await employeeService.createEmployee({
          ...formData,
          isActive: true,
        });
        toast.success('Працівника додано');
      }
      
      setIsDialogOpen(false);
      loadEmployees();
    } catch (error) {
      toast.error('Помилка збереження працівника');
    }
  };

  const handleTerminate = async (employee: Employee) => {
    if (!confirm(`Ви впевнені, що хочете звільнити ${employee.name}?`)) {
      return;
    }

    try {
      await employeeService.terminateEmployee(employee.id);
      toast.success('Працівника звільнено');
      loadEmployees();
    } catch (error) {
      toast.error('Помилка звільнення працівника');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Керування персоналом</h1>
        <Button onClick={handleAdd}>
          <Plus className="size-4 mr-2" />
          Додати працівника
        </Button>
      </div>

      {/* Пошук та фільтри */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Пошук за ім'ям, email або посадою..."
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
                <SelectItem value="inactive">Звільнені</SelectItem>
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
                <SelectItem value="position-asc">Посада (А-Я)</SelectItem>
                <SelectItem value="position-desc">Посада (Я-А)</SelectItem>
                <SelectItem value="hiredDate-asc">Дата прийому (стара-нова)</SelectItem>
                <SelectItem value="hiredDate-desc">Дата прийому (нова-стара)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Список працівників</CardTitle>
            <div className="text-sm text-gray-600">
              Показано {paginatedEmployees.length} з {filteredAndSortedEmployees.length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Завантаження...</div>
          ) : filteredAndSortedEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || statusFilter !== 'all' ? 'Нічого не знайдено' : 'Немає працівників'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ім'я</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Посада</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Дата прийому</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Дії</TableHead>
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
                          Активний
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <UserX className="size-3 mr-1" />
                          Звільнений
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
                            title="Звільнити"
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Редагувати працівника' : 'Додати працівника'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ім'я *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Посада *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hiredDate">Дата прийому *</Label>
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
                Скасувати
              </Button>
              <Button type="submit">
                {editingEmployee ? 'Зберегти' : 'Додати'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
