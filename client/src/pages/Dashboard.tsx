import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Lead } from '../types';
import {
  TrendingUp,
  Award,
  Users2,
  AlertCircle,
  FilePlus2,
  FolderMinus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { data: leads = [], isLoading, error } = useQuery<Lead[]>({
    queryKey: ['leads-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/leads?limit=1000');
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-panel h-28 rounded-2xl animate-pulse bg-white/5" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="glass-panel h-96 rounded-2xl animate-pulse bg-white/5" />
          <div className="glass-panel h-96 rounded-2xl animate-pulse bg-white/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
        <AlertCircle className="w-6 h-6" />
        <span>Failed to load dashboard metrics. Please reload the page.</span>
      </div>
    );
  }

  // Calculate Metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'NEW').length;
  const wonLeads = leads.filter((l) => l.status === 'WON').length;
  const lostLeads = leads.filter((l) => l.status === 'LOST').length;
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0';

  // Lead by Status
  const statusCounts: Record<string, number> = {};
  leads.forEach((l) => {
    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
  });
  const statusData = Object.keys(statusCounts).map((status) => ({
    name: status,
    value: statusCounts[status],
  }));

  const COLORS = {
    NEW: '#3b82f6',
    CONTACTED: '#a855f7',
    QUALIFIED: '#ec4899',
    PROPOSAL: '#f59e0b',
    NEGOTIATION: '#14b8a6',
    WON: '#10b981',
    LOST: '#ef4444',
  };

  // Lead Source
  const sourceCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const src = l.source || 'Other';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });
  const sourceData = Object.keys(sourceCounts).map((source) => ({
    name: source,
    value: sourceCounts[source],
  }));

  // Monthly Leads Line Chart (Created Date)
  const monthlyCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const date = new Date(l.createdAt);
    const month = date.toLocaleString('default', { month: 'short' });
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = monthNames
    .filter((m) => monthlyCounts[m] !== undefined || leads.length > 0)
    .map((month) => ({
      name: month,
      leads: monthlyCounts[month] || 0,
    }));

  // Sales Funnel
  // Order: NEW -> CONTACTED -> QUALIFIED -> PROPOSAL -> NEGOTIATION -> WON
  const funnelStages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON'];
  const funnelData = funnelStages.map((stage) => ({
    stage,
    count: leads.filter((l) => l.status === stage).length,
  }));

  const stats = [
    { title: 'Total Leads', value: totalLeads, icon: Users2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'New Leads', value: newLeads, icon: FilePlus2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Won Leads', value: wonLeads, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Lost Leads', value: lostLeads, icon: FolderMinus, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { title: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8 w-full text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Analytics review of your current sales pipeline.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-white/5 shadow-lg shadow-black/10">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">{stat.title}</span>
                <span className="text-2xl font-bold text-white mt-2">{stat.value}</span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} ${stat.bg}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Monthly Leads line chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6">Leads Added Monthly</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Line type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead status PieChart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-white mb-6">Leads Status Breakdown</h3>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData.length > 0 ? statusData : [{ name: 'No data', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.length > 0 ? (
                      statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={(COLORS as any)[entry.name] || '#64748b'} />
                      ))
                    ) : (
                      <Cell fill="rgba(255,255,255,0.1)" />
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex flex-col gap-2">
              {Object.keys(COLORS).map((status) => {
                const count = leads.filter((l) => l.status === status).length;
                return (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: (COLORS as any)[status] }} />
                      <span className="text-gray-400 capitalize">{status.toLowerCase()}</span>
                    </div>
                    <span className="font-semibold text-gray-200">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Lead Sources bar chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6">Top Acquisition Channels</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="value" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales funnel progression bar chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6">Sales Funnel</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="stage" type="category" stroke="#64748b" fontSize={10} width={80} />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="count" fill="#14b8a6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
