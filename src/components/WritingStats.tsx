'use client';

import { apiClient } from '@shared/services/apiClient';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, FileText, Pen, TrendingUp } from 'lucide-react';

interface StatsData {
  totalDocuments: number;
  totalBooks: number;
  totalWords: number;
  documentsThisMonth: number;
  weeklyWords: { week: string; words: number }[];
  topStyleName: string | null;
}

async function fetchStats(): Promise<StatsData> {
  const { data } = await apiClient.get<{ success: boolean; data: StatsData }>(
    '/user/stats'
  );
  return data.data;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function WritingStats(): React.JSX.Element {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {['s1', 's2', 's3', 's4'].map((id) => (
          <div
            key={id}
            className="h-20 animate-pulse rounded-xl bg-neutral-bg"
          />
        ))}
      </div>
    );
  }

  const maxWeeklyWords = Math.max(...stats.weeklyWords.map((w) => w.words), 1);

  return (
    <div className="space-y-4">
      {/* Métriques principales */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<FileText size={18} />}
          label="Documents"
          value={formatNumber(stats.totalDocuments)}
          sub={`${stats.documentsThisMonth} ce mois`}
          color="text-ai-primary"
          bg="bg-ai-primary/8"
        />
        <StatCard
          icon={<BookOpen size={18} />}
          label="Livres"
          value={formatNumber(stats.totalBooks)}
          color="text-ai-primaryAlt"
          bg="bg-ai-primaryAlt/8"
        />
        <StatCard
          icon={<Pen size={18} />}
          label="Mots écrits"
          value={formatNumber(stats.totalWords)}
          color="text-ai-accent"
          bg="bg-ai-accent/8"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Style favori"
          value={stats.topStyleName ?? '–'}
          color="text-action-warning"
          bg="bg-action-warning/8"
          small
        />
      </div>

      {/* Mini graphique activité 4 semaines */}
      {stats.weeklyWords.some((w) => w.words > 0) && (
        <div className="scroll-parchment rounded-xl p-4">
          <p className="font-interface mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-textSecondary">
            Activité — 4 dernières semaines
          </p>
          <div className="flex items-end gap-2" style={{ height: '56px' }}>
            {stats.weeklyWords.map((w) => {
              const pct = Math.round((w.words / maxWeeklyWords) * 100);
              return (
                <div
                  key={w.week}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t-md bg-ai-primary/70 transition-all"
                    style={{ height: `${Math.max(pct, 4)}%`, minHeight: '3px' }}
                    title={`${w.words} mots`}
                  />
                  <span className="font-interface text-xs text-neutral-textSecondary">
                    {w.week}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
  readonly sub?: string;
  readonly color: string;
  readonly bg: string;
  readonly small?: boolean;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  bg,
  small,
}: StatCardProps): React.JSX.Element {
  return (
    <div className="scroll-parchment rounded-xl p-3 sm:p-4">
      <div
        className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${bg} ${color}`}
      >
        {icon}
      </div>
      <p
        className={`font-writing font-bold ${small ? 'text-base' : 'text-xl'} text-parchment-text`}
      >
        {value}
      </p>
      <p className="font-interface text-xs text-neutral-textSecondary">
        {label}
      </p>
      {sub && (
        <p className="font-interface mt-0.5 text-xs text-neutral-textSecondary/60">
          {sub}
        </p>
      )}
    </div>
  );
}
