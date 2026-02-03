import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { logService, type LogRecord } from '../services/logService';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function AdminLogsPage() {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    logService
      .getLogs({ page, size: 20, keyword: keyword || undefined, category: category || undefined, level: level || undefined })
      .then((res) => {
        if (!cancelled) {
          setLogs(res.content);
          setTotalPages(res.totalPages);
        }
      })
      .catch(() => {
        if (!cancelled) setLogs([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page, keyword, category, level]);

  const levelColor = (l: string) => {
    if (l === 'ERROR') return 'text-red-600';
    if (l === 'WARN') return 'text-amber-600';
    if (l === 'INFO') return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Логи системи</h1>
        <p className="text-gray-600">Перегляд журналу подій та помилок</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Фільтри</CardTitle>
          <CardDescription>Пошук та фільтрація логів</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Пошук</Label>
              <Input
                placeholder="Ключове слово..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
              />
            </div>
            <div>
              <Label>Категорія</Label>
              <Input
                placeholder="Категорія"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(0); }}
              />
            </div>
            <div>
              <Label>Рівень</Label>
              <Select value={level || 'all'} onValueChange={(v) => { setLevel(v === 'all' ? '' : v); setPage(0); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі</SelectItem>
                  <SelectItem value="ERROR">ERROR</SelectItem>
                  <SelectItem value="WARN">WARN</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Записи</CardTitle>
          <CardDescription>Сторінка {page + 1} з {totalPages || 1}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Завантаження...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-500">Немає логів</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Час</TableHead>
                    <TableHead>Рівень</TableHead>
                    <TableHead>Категорія</TableHead>
                    <TableHead>Користувач</TableHead>
                    <TableHead>Повідомлення</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className={levelColor(log.level)}>{log.level}</TableCell>
                      <TableCell>{log.category}</TableCell>
                      <TableCell>{log.username ?? '-'}</TableCell>
                      <TableCell className="max-w-md truncate">{log.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="flex items-center text-sm">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
