import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { logApiService, type LogRecord, type LogStats } from '../services/logApiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import {
    Activity, AlertTriangle, ShieldCheck, Database, Search,
    RefreshCw, ChevronLeft, ChevronRight, Clock
} from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const LEVEL_COLORS: Record<string, string> = {
    'INFO': '#10b981',
    'WARN': '#f59e0b',
    'ERROR': '#ef4444',
    'DEBUG': '#3b82f6'
};

export function LogDashboard() {
    const { t } = useLanguage();
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
            const data = await logApiService.getStats();
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
            const data = await logApiService.getLogs({
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
            toast.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const pieData = useMemo(() => {
        if (!stats) return [];
        return Object.entries(stats.categoryDistribution).map(([name, value]) => ({ name, value }));
    }, [stats]);

    const levelData = useMemo(() => {
        if (!stats) return [];
        return Object.entries(stats.levelDistribution).map(([name, value]) => ({ name, value }));
    }, [stats]);

    const handleRefresh = () => {
        loadStats();
        loadLogs(0);
        toast.success('Data refreshed');
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
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600">System monitoring and activity logs</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" className="gap-2">
                    <RefreshCw className={`size-4 ${statsLoading || loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-50/50 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600 flex items-center justify-between">
                            Total Events
                            <Database className="size-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.timeline.reduce((acc, p) => acc + p.count, 0) || 0}</div>
                        <p className="text-xs text-blue-600 mt-1">all logged actions</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-50/50 border-red-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 flex items-center justify-between">
                            Errors
                            <AlertTriangle className="size-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.levelDistribution['ERROR'] || 0}</div>
                        <p className="text-xs text-red-600 mt-1">critical system issues</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-50/50 border-green-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600 flex items-center justify-between">
                            Security
                            <ShieldCheck className="size-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.categoryDistribution['SECURITY'] || 0}</div>
                        <p className="text-xs text-green-600 mt-1">authentication & access</p>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50/50 border-purple-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-600 flex items-center justify-between">
                            Updates
                            <RefreshCw className="size-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.categoryDistribution['BUSINESS'] || 0}</div>
                        <p className="text-xs text-purple-600 mt-1">business transactions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="size-4" />
                            Activity Over Time
                        </CardTitle>
                        <CardDescription>Event frequency in the last days</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats?.timeline || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#3b82f6' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                        <CardDescription>Volume by event type</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Log Levels</CardTitle>
                        <CardDescription>Severity distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={levelData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {levelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={LEVEL_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Live feed of system events</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <Input
                                    placeholder="Search logs..."
                                    className="pl-8"
                                    value={filters.keyword}
                                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                />
                            </div>
                            <Select value={filters.level} onValueChange={(v) => handleFilterChange('level', v)}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="INFO">INFO</SelectItem>
                                    <SelectItem value="WARN">WARN</SelectItem>
                                    <SelectItem value="ERROR">ERROR</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={applyFilters}>Filter</Button>
                        </div>

                        <div className="rounded-md border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left p-3 font-medium text-gray-600">Time</th>
                                        <th className="text-left p-3 font-medium text-gray-600">Level</th>
                                        <th className="text-left p-3 font-medium text-gray-600">Category</th>
                                        <th className="text-left p-3 font-medium text-gray-600">Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td></tr>
                                    ) : logs.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">No logs found</td></tr>
                                    ) : logs.map(log => (
                                        <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-gray-500 whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleTimeString()}
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
                                            <td className="p-3 text-gray-700 line-clamp-1 max-w-[300px]">{log.message}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-xs text-gray-500">
                                    Page {currentPage + 1} of {totalPages}
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
        </div>
    );
}
