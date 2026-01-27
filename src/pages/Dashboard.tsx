"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, TrendingUp, DollarSign, Activity, RefreshCw, AlertTriangle, Skull, Target, Calendar, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

// URL del GeoJSON del mapa mundial
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Mapeo de códigos de país ISO2 a código numérico (usado por world-atlas)
const ISO2_TO_NUMERIC: Record<string, string> = {
    'PE': '604', 'CO': '170', 'MX': '484', 'AR': '032', 'CL': '152',
    'EC': '218', 'US': '840', 'ES': '724', 'BR': '076', 'VE': '862',
    'BO': '068', 'PY': '600', 'UY': '858', 'PA': '591', 'CR': '188',
    'GT': '320', 'HN': '340', 'SV': '222', 'NI': '558', 'DO': '214',
    'CU': '192', 'CA': '124', 'GB': '826', 'FR': '250', 'DE': '276',
    'IT': '380', 'PT': '620', 'NL': '528', 'BE': '056',
};

// Mapeo alternativo por nombre de país (fallback)
const COUNTRY_NAME_MAP: Record<string, string> = {
    'Peru': 'PE', 'Colombia': 'CO', 'Mexico': 'MX', 'Argentina': 'AR',
    'Chile': 'CL', 'Ecuador': 'EC', 'United States': 'US', 'United States of America': 'US',
    'Spain': 'ES', 'Brazil': 'BR', 'Venezuela': 'VE', 'Bolivia': 'BO',
    'Paraguay': 'PY', 'Uruguay': 'UY', 'Panama': 'PA', 'Costa Rica': 'CR',
    'Guatemala': 'GT', 'Honduras': 'HN', 'El Salvador': 'SV', 'Nicaragua': 'NI',
    'Dominican Republic': 'DO', 'Cuba': 'CU', 'Canada': 'CA', 'United Kingdom': 'GB',
    'France': 'FR', 'Germany': 'DE', 'Italy': 'IT', 'Portugal': 'PT',
    'Netherlands': 'NL', 'Belgium': 'BE',
};

// Coordenadas centrales de países (longitud, latitud)
const COUNTRY_COORDINATES: Record<string, [number, number]> = {
    'PE': [-76, -10], 'CO': [-74, 4], 'MX': [-102, 23], 'AR': [-64, -34],
    'CL': [-71, -33], 'EC': [-78, -2], 'US': [-95, 38], 'ES': [-4, 40],
    'BR': [-52, -14], 'VE': [-66, 7], 'BO': [-65, -17], 'PY': [-58, -23],
    'UY': [-56, -33], 'PA': [-80, 9], 'CR': [-84, 10], 'GT': [-90, 15],
    'HN': [-87, 15], 'SV': [-89, 14], 'NI': [-85, 13], 'DO': [-70, 19],
    'CU': [-79, 22], 'CA': [-106, 56], 'GB': [-3, 54], 'FR': [2, 46],
    'DE': [10, 51], 'IT': [12, 43], 'PT': [-8, 39], 'NL': [5, 52], 'BE': [4, 51],
};

// =============================================================================
// TYPES
// =============================================================================
interface KPIsData {
    total_leads: number;
    conversion_rate: number;
    avg_penalty_amount: number;
    active_users: number;
    abandonment_rate: number;
    total_conversions: number;
}

interface FunnelData {
    form_starts: number;
    form_submits: number;
    questionnaire_starts: number;
    confirmations: number;
}

interface DetailedFunnelItem {
    step: string;
    count: number;
    color: string;
}

interface KillerQuestion {
    question_id: string;
    dropoff_rate: number;
    viewed: number;
    abandoned: number;
}

interface QuestionDropoff {
    [key: string]: {
        viewed: number;
        answered: number;
        dropoff_rate: number;
    };
}

interface DailyTrafficItem {
    date: string;
    visits: number;
    completions: number;
    total_amount: number;
}

interface CountryData {
    country: string;
    country_code: string;
    total: number;
    conversions: number;
}

interface GeoResponse {
    countries: CountryData[];
    active_by_country: Record<string, number>;
    total_countries: number;
}

interface DeviceData {
    device_type: string;
    total: number;
    conversions: number;
    percentage: number;
}

interface ChannelData {
    source: string;
    total: number;
    conversions: number;
    percentage: number;
    conversion_rate: number;
}

interface ChannelsResponse {
    channels: ChannelData[];
    total_sessions: number;
}

interface SystemLog {
    id: number;
    timestamp: string;
    level: string;
    message: string;
    module: string | null;
    traceback: string | null;
}

interface HealthStatus {
    status: 'healthy' | 'warning' | 'critical';
    errors_24h: number;
    sessions_today: number;
    timestamp: string;
}

interface DevicesResponse {
    devices: DeviceData[];
    total_sessions: number;
}

interface ChannelsResponse {
    channels: ChannelData[];
    total_sessions: number;
}

interface AnalyticsResponse {
    kpis: KPIsData;
    funnel: FunnelData;
    detailed_funnel: DetailedFunnelItem[];
    killer_question: KillerQuestion | null;
    question_dropoff: QuestionDropoff;
    step_dropoff: Record<string, number>;
    daily_traffic: DailyTrafficItem[];
    generated_at: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================
const API_URL = import.meta.env.VITE_API_URL || '';
const DASHBOARD_USER = import.meta.env.VITE_DASHBOARD_USER || '';
const DASHBOARD_PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD || '';

// Chart configurations
const funnelChartConfig: ChartConfig = {
    count: { label: "Cantidad" },
};

const trafficChartConfig: ChartConfig = {
    visits: { label: "Visitas", color: "hsl(217, 91%, 60%)" },
    completions: { label: "Conversiones", color: "hsl(160, 84%, 39%)" },
};

// =============================================================================
// COMPONENTS
// =============================================================================

const KPICard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    accentColor = "primary",
    delay = 0
}: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    accentColor?: string;
    delay?: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/80">{title}</CardTitle>
                <div className="p-2 rounded-lg bg-white/5">
                    <Icon className={`h-4 w-4 text-${accentColor}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
                <p className="text-xs text-white/60 mt-1">{subtitle}</p>
            </CardContent>
        </Card>
    </motion.div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

// Opciones de rango de fechas predefinidas
const DATE_RANGES = [
    { label: 'Hoy', value: 'today', days: 0 },
    { label: 'Últimos 7 días', value: '7d', days: 7 },
    { label: 'Últimos 30 días', value: '30d', days: 30 },
    { label: 'Últimos 90 días', value: '90d', days: 90 },
    { label: 'Este año', value: 'year', days: 365 },
    { label: 'Todo', value: 'all', days: -1 },
];

export default function Dashboard() {
    const [data, setData] = useState<AnalyticsResponse | null>(null);
    const [geoData, setGeoData] = useState<GeoResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [devicesData, setDevicesData] = useState<DevicesResponse | null>(null);
    const [channelsData, setChannelsData] = useState<ChannelsResponse | null>(null);
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [criticalLogs, setCriticalLogs] = useState<SystemLog[]>([]);
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [hoveredDevice, setHoveredDevice] = useState<string | null>(null);

    // Date filter state
    const [dateRange, setDateRange] = useState('7d');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Helper para calcular fechas desde rango predefinido
    const applyDateRange = (range: string) => {
        const today = new Date();
        const rangeConfig = DATE_RANGES.find(r => r.value === range);

        if (rangeConfig) {
            setDateRange(range);
            setEndDate(today.toISOString().split('T')[0]);

            if (rangeConfig.days === -1) {
                // "Todo" - usar fecha muy antigua
                setStartDate('2020-01-01');
            } else if (rangeConfig.days === 0) {
                // "Hoy"
                setStartDate(today.toISOString().split('T')[0]);
            } else {
                const start = new Date();
                start.setDate(start.getDate() - rangeConfig.days);
                setStartDate(start.toISOString().split('T')[0]);
            }
        }
        setShowDatePicker(false);
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const headers: HeadersInit = {};
            if (DASHBOARD_USER && DASHBOARD_PASSWORD) {
                headers['Authorization'] = `Basic ${btoa(`${DASHBOARD_USER}:${DASHBOARD_PASSWORD}`)}`;
            }

            // Construir query params de fecha
            const dateParams = `start_date=${startDate}&end_date=${endDate}`;

            // Fetch Dashboard Completo (Unificado)
            const [dashboardResponse, geoResponse, devicesResponse, channelsResponse, logsResponse, criticalLogsResponse, healthResponse] = await Promise.all([
                fetch(`${API_URL}/api/analytics/dashboard?${dateParams}`, { headers }),
                fetch(`${API_URL}/api/analytics/geo?${dateParams}`, { headers }).catch(() => null),
                fetch(`${API_URL}/api/analytics/devices?${dateParams}`, { headers }).catch(() => null),
                fetch(`${API_URL}/api/analytics/channels?${dateParams}`, { headers }).catch(() => null),
                fetch(`${API_URL}/api/analytics/logs?limit=50`, { headers }).catch(() => null),
                fetch(`${API_URL}/api/analytics/logs?level=ERROR&limit=20`, { headers }).catch(() => null),
                fetch(`${API_URL}/api/analytics/health`, { headers }).catch(() => null)
            ]);

            if (dashboardResponse.status === 401) throw new Error('Acceso no autorizado');
            if (!dashboardResponse.ok) throw new Error('Error al cargar datos del dashboard');

            const dashboardJson = await dashboardResponse.json();
            // Asignar respuesta completa (KPIs + Funnel + Traffic)
            setData(dashboardJson);

            if (geoResponse && geoResponse.ok) {
                const geoJson = await geoResponse.json();
                setGeoData(geoJson);
            }

            if (devicesResponse && devicesResponse.ok) {
                const devicesJson = await devicesResponse.json();
                setDevicesData(devicesJson);
            }

            if (channelsResponse && channelsResponse.ok) {
                const channelsJson = await channelsResponse.json();
                setChannelsData(channelsJson);
            }

            if (logsResponse && logsResponse.ok) {
                const logsJson = await logsResponse.json();
                setLogs(logsJson);
            }

            if (criticalLogsResponse && criticalLogsResponse.ok) {
                const criticalJson = await criticalLogsResponse.json();
                setCriticalLogs(criticalJson);
            }

            if (healthResponse && healthResponse.ok) {
                const healthJson = await healthResponse.json();
                setHealth(healthJson);
            }

            setLastUpdated(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [startDate, endDate]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(value);

    // Loading/Error states
    if (loading && !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-white mb-4">{error}</p>
                    <button onClick={fetchData} className="px-4 py-2 bg-primary text-white rounded-lg">Reintentar</button>
                </div>
            </div>
        );
    }

    // Prepare question dropoff data for table
    const questionDropoffArray = Object.entries(data?.question_dropoff || {})
        .map(([id, stats]) => ({ question_id: id, ...stats }))
        .sort((a, b) => b.dropoff_rate - a.dropoff_rate)
        .slice(0, 10); // Top 10 problematic questions

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 -z-10" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent -z-10" />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                    Analytics Dashboard
                                </h1>
                                {health && (
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${health.status === 'healthy'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : health.status === 'warning'
                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${health.status === 'healthy' ? 'bg-emerald-400' : health.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                                            }`} />
                                        {health.status}
                                    </div>
                                )}
                            </div>
                            <p className="text-white/60 text-sm mt-1">Business Intelligence • Calculadora SST</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Date Range Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition"
                            >
                                <Calendar className="w-4 h-4 text-white/60" />
                                <span className="text-sm">
                                    {DATE_RANGES.find(r => r.value === dateRange)?.label || 'Seleccionar'}
                                </span>
                            </button>

                            {/* Dropdown */}
                            {showDatePicker && (
                                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                                    {/* Rangos predefinidos */}
                                    <div className="p-2 border-b border-white/10">
                                        <p className="text-xs text-white/40 px-2 mb-2">Rango rápido</p>
                                        <div className="grid grid-cols-2 gap-1">
                                            {DATE_RANGES.map((range) => (
                                                <button
                                                    key={range.value}
                                                    onClick={() => applyDateRange(range.value)}
                                                    className={`px-3 py-1.5 text-sm rounded-lg transition ${dateRange === range.value
                                                        ? 'bg-blue-500 text-white'
                                                        : 'text-white/70 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {range.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Fechas personalizadas */}
                                    <div className="p-3">
                                        <p className="text-xs text-white/40 mb-2">Rango personalizado</p>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs text-white/60 w-12">Desde</label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => {
                                                        setStartDate(e.target.value);
                                                        setDateRange('custom');
                                                    }}
                                                    className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs text-white/60 w-12">Hasta</label>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => {
                                                        setEndDate(e.target.value);
                                                        setDateRange('custom');
                                                    }}
                                                    className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowDatePicker(false);
                                                fetchData();
                                            }}
                                            className="w-full mt-3 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                                        >
                                            Aplicar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Refresh button */}
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl transition disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            {lastUpdated && <span className="text-xs text-white/60">{lastUpdated.toLocaleTimeString('es-PE')}</span>}
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <KPICard title="Visitantes Únicos" value={data?.kpis.total_leads || 0} subtitle="Sesiones totales" icon={Users} delay={0.1} />
                    <KPICard title="Conversiones" value={data?.kpis.total_conversions || 0} subtitle="Confirmaciones vistas" icon={Target} delay={0.15} />
                    <KPICard title="Tasa de Conversión" value={`${data?.kpis.conversion_rate || 0}%`} subtitle="Visitantes → Leads" icon={TrendingUp} delay={0.2} />
                    <KPICard title="Tasa de Abandono" value={`${data?.kpis.abandonment_rate || 0}%`} subtitle="No completaron" icon={AlertTriangle} accentColor="red-400" delay={0.25} />
                    <KPICard title="Usuarios Activos" value={data?.kpis.active_users || 0} subtitle="En tiempo real" icon={Activity} delay={0.3} />
                </div>

                {/* Killer Question Alert */}
                {data?.killer_question && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Card className="bg-red-500/10 border-red-500/30 backdrop-blur-xl">
                            <CardContent className="flex items-center gap-4 py-4">
                                <div className="p-3 rounded-full bg-red-500/20">
                                    <Skull className="w-6 h-6 text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-red-400">🚨 Pregunta Killer Detectada</h3>
                                    <p className="text-slate-300">
                                        Pregunta <code className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-sm font-semibold">{data.killer_question.question_id}</code> tiene
                                        <span className="font-bold text-red-400 mx-1">{data.killer_question.dropoff_rate}%</span>
                                        de abandono ({data.killer_question.abandoned} usuarios de {data.killer_question.viewed})
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Charts Row - Hidden on mobile, visible on tablet+ */}
                <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Detailed Funnel */}
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Funnel Detallado</CardTitle>
                            <CardDescription className="text-white/60">
                                Abandono: {data?.kpis.abandonment_rate || 0}%
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={funnelChartConfig} className="h-[280px] w-full">
                                <BarChart
                                    data={data?.detailed_funnel || []}
                                    layout="vertical"
                                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" horizontal={false} />
                                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                                    <YAxis
                                        type="category"
                                        dataKey="step"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={9}
                                        width={70}
                                        tickFormatter={(value) => {
                                            const abbrev: Record<string, string> = {
                                                'Formulario Iniciado': 'Form. Inicio',
                                                'Formulario Enviado': 'Form. Envío',
                                                'Cuestionario Iniciado': 'Quest. Inicio',
                                                'Confirmación Vista': 'Confirm.',
                                            };
                                            return abbrev[value] || value.substring(0, 8);
                                        }}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="hsl(217, 91%, 60%)" />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Daily Traffic */}
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Tráfico Diario</CardTitle>
                            <CardDescription className="text-white/60">Últimos 7 días</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={trafficChartConfig} className="h-[280px] w-full">
                                <AreaChart data={data?.daily_traffic || []} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                                    <defs>
                                        <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-visits)" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="var(--color-visits)" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="fillCompletions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-completions)" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="var(--color-completions)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" fontSize={12} tickFormatter={(v) => new Date(v).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} />
                                    <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend content={<ChartLegendContent className="text-white [&_*]:text-white" />} />
                                    <Area type="monotone" dataKey="visits" stroke="var(--color-visits)" fill="url(#fillVisits)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="completions" stroke="var(--color-completions)" fill="url(#fillCompletions)" strokeWidth={2} />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Problematic Questions Table */}
                {questionDropoffArray.length > 0 && (
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 mb-8">
                        <CardHeader>
                            <CardTitle className="text-white">🔥 Preguntas con Mayor Abandono</CardTitle>
                            <CardDescription className="text-white/60">Top 10 preguntas donde los usuarios abandonan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Pregunta</th>
                                            <th className="text-center py-3 px-4 text-slate-400 font-medium">Vistas</th>
                                            <th className="text-center py-3 px-4 text-slate-400 font-medium">Respondidas</th>
                                            <th className="text-center py-3 px-4 text-slate-400 font-medium">% Abandono</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {questionDropoffArray.map((q, idx) => (
                                            <tr key={q.question_id} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="py-3 px-4">
                                                    <code className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-semibold">{q.question_id}</code>
                                                </td>
                                                <td className="py-3 px-4 text-center text-slate-300">{q.viewed}</td>
                                                <td className="py-3 px-4 text-center text-slate-300">{q.answered}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`font-bold ${q.dropoff_rate > 30 ? 'text-red-400' : q.dropoff_rate > 15 ? 'text-amber-400' : 'text-green-400'}`}>
                                                        {q.dropoff_rate}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Geolocation Section */}
                {geoData && geoData.countries.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* World Map */}
                        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Distribución Geográfica</CardTitle>
                                <CardDescription className="text-white/60">
                                    {geoData.total_countries} países detectados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    // Calcular centro basado en país con mayor tráfico
                                    const topCountry = geoData.countries.reduce((max, c) =>
                                        c.total > max.total ? c : max, geoData.countries[0]);
                                    const centerCoords = COUNTRY_COORDINATES[topCountry?.country_code] || [-76, -10];

                                    return (
                                        <div className="h-[320px] w-full overflow-hidden">
                                            <ComposableMap
                                                projection="geoMercator"
                                                projectionConfig={{
                                                    scale: 400,
                                                    center: centerCoords
                                                }}
                                                style={{ width: "100%", height: "100%" }}
                                            >
                                                <ZoomableGroup
                                                    center={centerCoords}
                                                    zoom={1}
                                                    minZoom={0.3}
                                                    maxZoom={4}
                                                >
                                                    <Geographies geography={GEO_URL}>
                                                        {({ geographies }) =>
                                                            geographies.map((geo) => {
                                                                // Buscar si este país tiene datos usando código numérico o nombre
                                                                const geoId = geo.id;
                                                                const geoName = geo.properties?.name || '';
                                                                const countryData = geoData.countries.find((c) => {
                                                                    // Coincidir por código numérico
                                                                    if (ISO2_TO_NUMERIC[c.country_code] === geoId) return true;
                                                                    // Coincidir por nombre de país
                                                                    if (COUNTRY_NAME_MAP[geoName] === c.country_code) return true;
                                                                    return false;
                                                                });

                                                                // Calcular intensidad del color basado en visitas
                                                                const maxVisits = Math.max(...geoData.countries.map(c => c.total), 1);
                                                                const intensity = countryData ? Math.min(countryData.total / maxVisits, 1) : 0;

                                                                // Color: gris base, azul para países con datos
                                                                const fillColor = countryData
                                                                    ? `rgba(59, 130, 246, ${0.3 + intensity * 0.7})` // Blue con intensidad
                                                                    : "rgba(255, 255, 255, 0.05)"; // Gris translúcido

                                                                return (
                                                                    <Geography
                                                                        key={geo.rsmKey}
                                                                        geography={geo}
                                                                        fill={fillColor}
                                                                        stroke="rgba(255, 255, 255, 0.1)"
                                                                        strokeWidth={0.5}
                                                                        style={{
                                                                            default: { outline: "none" },
                                                                            hover: {
                                                                                fill: countryData ? "rgba(59, 130, 246, 1)" : "rgba(255, 255, 255, 0.1)",
                                                                                outline: "none",
                                                                                cursor: countryData ? "pointer" : "default"
                                                                            },
                                                                            pressed: { outline: "none" }
                                                                        }}
                                                                    />
                                                                );
                                                            })
                                                        }
                                                    </Geographies>
                                                </ZoomableGroup>
                                            </ComposableMap>
                                        </div>
                                    );
                                })()}
                                {/* Leyenda */}
                                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-white/60">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded" style={{ background: "rgba(59, 130, 246, 0.3)" }}></div>
                                        <span>Bajo</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded" style={{ background: "rgba(59, 130, 246, 0.65)" }}></div>
                                        <span>Medio</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded" style={{ background: "rgba(59, 130, 246, 1)" }}></div>
                                        <span>Alto</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Countries Table */}
                        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Usuarios por País</CardTitle>
                                <CardDescription className="text-white/60">Estadísticas completas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto max-h-[280px]">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-slate-900">
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-2 px-3 text-white/80 font-medium">País</th>
                                                <th className="text-center py-2 px-3 text-white/80 font-medium">Visitas</th>
                                                <th className="text-center py-2 px-3 text-white/80 font-medium">Conv.</th>
                                                <th className="text-center py-2 px-3 text-white/80 font-medium">Activos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {geoData.countries.map((country) => (
                                                <tr key={country.country_code} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="py-2 px-3 text-white">{country.country}</td>
                                                    <td className="py-2 px-3 text-center text-white/80">{country.total}</td>
                                                    <td className="py-2 px-3 text-center text-green-400">{country.conversions}</td>
                                                    <td className="py-2 px-3 text-center">
                                                        {geoData.active_by_country[country.country_code] ? (
                                                            <span className="text-green-400">●</span>
                                                        ) : (
                                                            <span className="text-white/30">○</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Devices & Channels Section */}
                {(devicesData || channelsData) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Devices Chart - Donut */}
                        {devicesData && devicesData.devices.length > 0 && (() => {
                            // Colores azul degradado
                            const blueColors = [
                                'rgba(59, 130, 246, 1)',    // Azul brillante
                                'rgba(59, 130, 246, 0.7)',  // Azul medio
                                'rgba(59, 130, 246, 0.45)', // Azul suave
                                'rgba(100, 116, 139, 0.6)'  // Azul-gris
                            ];

                            // Calcular segmentos del donut
                            let cumulativePercent = 0;
                            const segments = devicesData.devices.map((device, index) => {
                                const startPercent = cumulativePercent;
                                cumulativePercent += device.percentage;
                                return {
                                    ...device,
                                    startPercent,
                                    endPercent: cumulativePercent,
                                    color: blueColors[index % blueColors.length]
                                };
                            });

                            // Encontrar segmento activo basado en hoveredDevice
                            const hoveredSegment = segments.find(s => s.device_type === hoveredDevice) || null;

                            return (
                                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-white">Dispositivos</CardTitle>
                                        <CardDescription className="text-white/60">
                                            {devicesData.total_sessions} sesiones totales
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                                            {/* SVG Donut Chart */}
                                            <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-72 lg:h-72 flex-shrink-0">
                                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                    {segments.map((segment, i) => {
                                                        const radius = 35;
                                                        const circumference = 2 * Math.PI * radius;
                                                        const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`;
                                                        const strokeDashoffset = -((segment.startPercent / 100) * circumference);
                                                        const isHovered = hoveredDevice === segment.device_type;

                                                        return (
                                                            <circle
                                                                key={segment.device_type}
                                                                cx="50"
                                                                cy="50"
                                                                r={radius}
                                                                fill="none"
                                                                stroke={segment.color}
                                                                strokeWidth={isHovered ? "16" : "12"}
                                                                strokeDasharray={strokeDasharray}
                                                                strokeDashoffset={strokeDashoffset}
                                                                className="transition-all duration-300 cursor-pointer"
                                                                style={{
                                                                    filter: isHovered ? 'brightness(1.3) drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none',
                                                                    opacity: hoveredDevice && !isHovered ? 0.5 : 1
                                                                }}
                                                                onMouseEnter={() => setHoveredDevice(segment.device_type)}
                                                                onMouseLeave={() => setHoveredDevice(null)}
                                                            />
                                                        );
                                                    })}
                                                </svg>
                                                {/* Center text - Dynamic on hover */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-300">
                                                    {hoveredSegment ? (
                                                        <>
                                                            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white capitalize">{hoveredSegment.device_type}</span>
                                                            <span className="text-base sm:text-lg lg:text-xl text-blue-400 font-semibold">{hoveredSegment.percentage}%</span>
                                                            <span className="text-xs sm:text-sm text-white/50">{hoveredSegment.total} sesiones</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{devicesData.total_sessions}</span>
                                                            <span className="text-xs sm:text-sm text-white/50">Total</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Legend */}
                                            <div className="w-full lg:flex-1 grid grid-cols-2 lg:grid-cols-1 gap-2 lg:space-y-3 lg:gap-0">
                                                {segments.map((segment) => {
                                                    const isHovered = hoveredDevice === segment.device_type;
                                                    return (
                                                        <div
                                                            key={segment.device_type}
                                                            className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 cursor-pointer ${isHovered ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                                            onMouseEnter={() => setHoveredDevice(segment.device_type)}
                                                            onMouseLeave={() => setHoveredDevice(null)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-transform ${isHovered ? 'scale-125' : ''}`}
                                                                    style={{ backgroundColor: segment.color }}
                                                                />
                                                                <span className="text-white capitalize text-xs sm:text-sm">{segment.device_type}</span>
                                                            </div>
                                                            <span className={`text-xs sm:text-sm transition-colors ${isHovered ? 'text-blue-400 font-semibold' : 'text-white/60'}`}>
                                                                {segment.percentage}%
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })()}

                        {/* Channels Chart - Bars */}
                        {channelsData && channelsData.channels.length > 0 && (
                            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white">Canales de Tráfico</CardTitle>
                                    <CardDescription className="text-white/60">
                                        Fuentes de adquisición
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 max-h-[280px] overflow-y-auto">
                                        {channelsData.channels.map((channel, index) => {
                                            // Degradado azul a azul-gris basado en posición
                                            const opacity = Math.max(0.3, 1 - (index * 0.1));
                                            const barColor = `rgba(59, 130, 246, ${opacity})`;

                                            return (
                                                <div key={channel.source} className="space-y-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-white capitalize">{channel.source}</span>
                                                        <div className="flex items-center gap-3 text-xs">
                                                            <span className="text-white/60">{channel.total} visitas</span>
                                                            <span className="text-white/40">
                                                                {channel.conversion_rate}% conv.
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${channel.percentage}%`,
                                                                backgroundColor: barColor
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* System Logs & Debug Section */}
                {logs.length > 0 && (
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 mt-8">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-blue-400" />
                                    Logs del Sistema
                                </CardTitle>
                                <CardDescription className="text-white/60">
                                    Historial reciente de eventos
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-2 py-1 bg-white/5 rounded text-[10px] text-white/40 uppercase">
                                    {logs.filter(l => l.level === 'ERROR').length} Errores
                                </div>
                                <div className="px-2 py-1 bg-white/5 rounded text-[10px] text-white/40 uppercase">
                                    {logs.filter(l => l.level === 'INFO').length} Info
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-black/40 rounded-lg p-4 font-mono text-xs overflow-hidden">
                                <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                                    {logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className={`group border-b border-white/5 pb-2 last:border-0 hover:bg-white/10 transition px-2 py-2 rounded cursor-pointer ${log.traceback ? 'hover:ring-1 hover:ring-blue-500/30' : ''}`}
                                            onClick={() => {
                                                if (log.traceback) {
                                                    const details = document.getElementById(`trace-${log.id}`);
                                                    if (details) details.toggleAttribute('open');
                                                }
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-white/30 shrink-0 mt-0.5">
                                                    {new Date(log.timestamp + " UTC").toLocaleTimeString()}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${log.level === 'ERROR' || log.level === 'CRITICAL'
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : log.level === 'WARNING'
                                                        ? 'bg-amber-500/20 text-amber-400'
                                                        : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {log.level}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-white/80 break-words font-medium">{log.message}</p>
                                                        {log.traceback && (
                                                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                                                                Click para detalles
                                                            </span>
                                                        )}
                                                    </div>
                                                    {log.module && (
                                                        <span className="text-white/30 text-[10px] mt-1 block">
                                                            Module: {log.module}
                                                        </span>
                                                    )}
                                                    {log.traceback && (
                                                        <details id={`trace-${log.id}`} className="mt-2 group/trace" onClick={(e) => e.stopPropagation()}>
                                                            <summary className="hidden">Ver Stack Trace</summary>
                                                            <pre className="p-3 bg-black/60 rounded border border-white/5 text-[10px] text-white/40 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner font-mono">
                                                                {log.traceback}
                                                            </pre>
                                                        </details>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Critical Errors Section */}
                {criticalLogs.length > 0 && (
                    <Card className="bg-red-500/5 backdrop-blur-xl border-red-500/20 mt-8 mb-8 ring-1 ring-red-500/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-red-500/10">
                            <div>
                                <CardTitle className="text-red-400 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Errores Críticos Detectados
                                </CardTitle>
                                <CardDescription className="text-red-400/60">
                                    Fallos que requieren atención inmediata
                                </CardDescription>
                            </div>
                            <div className="px-3 py-1 bg-red-500/20 rounded-full text-xs font-bold text-red-400 animate-pulse border border-red-500/30">
                                {criticalLogs.length} ACTIVO
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="bg-black/60 rounded-lg p-4 font-mono text-xs overflow-hidden border border-red-500/10">
                                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                    {criticalLogs.map((log) => (
                                        <div
                                            key={`crit-${log.id}`}
                                            className="group bg-red-500/5 p-3 rounded-lg border border-red-500/10 hover:bg-red-500/10 transition cursor-pointer"
                                            onClick={() => {
                                                const details = document.getElementById(`crit-trace-${log.id}`);
                                                if (details) details.toggleAttribute('open');
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-3 mb-1">
                                                        <span className="text-red-400/80 font-bold uppercase tracking-tighter">
                                                            {log.level}
                                                        </span>
                                                        <span className="text-white/30 text-[10px]">
                                                            {new Date(log.timestamp + " UTC").toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-red-200 break-words font-medium text-sm mb-2">
                                                        {log.message}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-[10px] text-white/40">
                                                        {log.module && <span>Modulo: {log.module}</span>}
                                                        {log.traceback && (
                                                            <span className="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-400/20">
                                                                Click para detalles técnicos
                                                            </span>
                                                        )}
                                                    </div>

                                                    {log.traceback && (
                                                        <details id={`crit-trace-${log.id}`} className="mt-3 group/trace" onClick={(e) => e.stopPropagation()}>
                                                            <summary className="hidden">Ver Detalle Técnico</summary>
                                                            <pre className="p-4 bg-black/80 rounded border border-red-500/20 text-[10px] text-red-300/60 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                                                                {log.traceback}
                                                            </pre>
                                                        </details>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-white/50 pt-4 border-t border-white/5">
                    <p>Dashboard: {data?.generated_at ? new Date(data.generated_at).toLocaleString('es-PE') : '-'}</p>
                    <p className="mt-1">Calculadora de Multas SST © Support Brigades</p>
                </div>
            </div>
        </div >
    );
}
