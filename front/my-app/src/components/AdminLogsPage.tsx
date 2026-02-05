import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Activity, AlertTriangle, ShieldCheck, Database, Search,
  RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { logService, type LogRecord, type LogStats } from '../services/logService';

export function AdminLogsPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    keyword: '',
    category: 'all',
    level: 'all'
  });

  useEffect(() => {
    loadStats();
    loadLogs(0);
  }, []);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const data = await logService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadLogs = async (page: number) => {
    try {
      setLoading(true);
      const data = await logService.getLogs({
        ...filters,
        category: filters.category === 'all' ? undefined : filters.category,
        level: filters.level === 'all' ? undefined : filters.level,
        page,
        size: 10
      });
      setLogs(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading logs:', error);
      toast.error(t('manageBooks.toasts.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadStats();
    loadLogs(0);
    toast.success(t('logs.refreshed'));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadLogs(0);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="size-8 text-blue-600" />
            {t('logs.title')}
          </h1>
          <p className="text-gray-600">{t('logs.description')}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className={`size-4 ${statsLoading || loading ? 'animate-spin' : ''}`} />
          {t('logs.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center justify-between">
              {t('logs.totalEvents')}
              <Database className="size-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.timeline.reduce((acc, p) => acc + p.count, 0) || 0}</div>
            <p className="text-xs text-blue-600 mt-1">{t('logs.totalEventsSub')}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center justify-between">
              {t('logs.errors')}
              <AlertTriangle className="size-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.levelDistribution['ERROR'] || 0}</div>
            <p className="text-xs text-red-600 mt-1">{t('logs.errorsSub')}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center justify-between">
              {t('logs.security')}
              <ShieldCheck className="size-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.categoryDistribution['SECURITY'] || 0}</div>
            <p className="text-xs text-green-600 mt-1">{t('logs.securitySub')}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/50 border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 flex items-center justify-between">
              {t('logs.updates')}
              <RefreshCw className="size-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.categoryDistribution['BUSINESS'] || 0}</div>
            <p className="text-xs text-purple-600 mt-1">{t('logs.updatesSub')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Log Table Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>{t('logs.recentActivity')}</CardTitle>
            <CardDescription>{t('logs.recentSub')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder={t('logs.searchPlaceholder')}
                className="pl-8"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
            <Select value={filters.level} onValueChange={(v) => handleFilterChange('level', v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t('logs.level')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('logs.allLevels')}</SelectItem>
                <SelectItem value="INFO">INFO</SelectItem>
                <SelectItem value="WARN">WARN</SelectItem>
                <SelectItem value="ERROR">ERROR</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={applyFilters}>{t('logs.filter')}</Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">{t('logs.time')}</th>
                  <th className="text-left p-3 font-medium text-gray-600">{t('logs.level')}</th>
                  <th className="text-left p-3 font-medium text-gray-600">{t('logs.category')}</th>
                  <th className="text-left p-3 font-medium text-gray-600">{t('logs.message')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">{t('logs.loading')}</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">{t('logs.noLogs')}</td></tr>
                ) : logs.map(log => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${log.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                        log.level === 'WARN' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{log.category}</td>
                    <td className="p-3 text-gray-700 max-w-[300px]">
                      <div className="truncate" title={log.message}>{log.message}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">
                {t('logs.page')} {currentPage + 1} {t('logs.of')} {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadLogs(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadLogs(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || loading}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
