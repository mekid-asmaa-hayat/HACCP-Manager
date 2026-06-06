import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { reportsApi } from '../services/api';

function StatCard({
  title, value, subtitle, color, icon,
}: {
  title: string; value: string | number; subtitle?: string; color: string; icon: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <div className={`text-2xl p-3 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportsApi.getDashboard,
    refetchInterval: 30_000, // Refresh toutes les 30s
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const conformiteColor = (stats?.conformiteRate ?? 0) >= 80
    ? 'text-green-600 bg-green-50'
    : 'text-red-600 bg-red-50';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord HACCP</h1>
        <p className="text-gray-500 text-sm">Vue en temps réel de la conformité alimentaire</p>
      </div>

      {/* Alertes actives */}
      {stats && stats.alertesActives > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-semibold text-red-700">
              {stats.alertesActives} alerte{stats.alertesActives > 1 ? 's' : ''} active{stats.alertesActives > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-red-500">
              Des contrôles non conformes nécessitent une action corrective
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Taux de conformité"
          value={`${stats?.conformiteRate ?? 0}%`}
          subtitle="Sur l'ensemble des contrôles"
          color={conformiteColor}
          icon="✅"
        />
        <StatCard
          title="Contrôles aujourd'hui"
          value={stats?.todayControls ?? 0}
          subtitle="Saisies du jour"
          color="text-blue-600 bg-blue-50"
          icon="📋"
        />
        <StatCard
          title="Non conformités"
          value={stats?.nonConformes ?? 0}
          subtitle="En attente de correction"
          color="text-orange-600 bg-orange-50"
          icon="⚠️"
        />
        <StatCard
          title="Total contrôles"
          value={stats?.totalControls ?? 0}
          subtitle="Depuis le début"
          color="text-purple-600 bg-purple-50"
          icon="📊"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conformité sur 7 jours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Taux de conformité — 7 derniers jours</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.conformiteByDay ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Area
                type="monotone"
                dataKey="conformite"
                stroke="#2E75B6"
                fill="#EBF3FB"
                name="Conformité (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Contrôles par jour */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Contrôles réalisés — 7 derniers jours</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.conformiteByDay ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#2E75B6" name="Nb contrôles" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
