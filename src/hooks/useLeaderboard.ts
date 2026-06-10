import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { LeaderboardEntry, Phase } from '../types/game';
import { phaseRank } from '../types/game';

const LOCAL_STORAGE_KEY = 'copa_mundial_leaderboard';

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const getLocalEntries = useCallback((): LeaderboardEntry[] => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
    } catch {
      return [];
    }
  }, []);

  const saveLocalEntry = useCallback((entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry => {
    const all = getLocalEntries();
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: new Date().toLocaleDateString('es-AR'),
    };
    const updated = [...all, newEntry]
      .sort((a, b) => {
        const rankDiff = phaseRank(b.phase) - phaseRank(a.phase);
        if (rankDiff !== 0) return rankDiff;
        const timeA = a.totalTimeMs + a.penaltyMs;
        const timeB = b.totalTimeMs + b.penaltyMs;
        return timeA - timeB;
      });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  }, [getLocalEntries]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('copa_mundial_leaderboard')
        .select('*');

      if (error) throw error;

      if (data) {
        const mapped: LeaderboardEntry[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.name,
          phase: item.phase as Phase,
          totalTimeMs: Number(item.total_time_ms),
          date: item.date,
          eliminated: item.eliminated,
          penaltyMs: Number(item.penalty_ms),
        }));

        const sorted = mapped.sort((a, b) => {
          const rankDiff = phaseRank(b.phase) - phaseRank(a.phase);
          if (rankDiff !== 0) return rankDiff;
          const timeA = a.totalTimeMs + a.penaltyMs;
          const timeB = b.totalTimeMs + b.penaltyMs;
          return timeA - timeB;
        });

        setEntries(sorted);
        // Sync with local storage as secondary backup
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to localStorage:', err);
      // Fallback
      const local = getLocalEntries();
      setEntries(local);
    } finally {
      setLoading(false);
    }
  }, [getLocalEntries]);

  // Load entries on mount
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const save = useCallback(
    async (entry: Omit<LeaderboardEntry, 'id' | 'date'>) => {
      const dateStr = new Date().toLocaleDateString('es-AR');
      try {
        const newEntry = {
          name: entry.name,
          phase: entry.phase,
          total_time_ms: entry.totalTimeMs,
          date: dateStr,
          eliminated: entry.eliminated,
          penalty_ms: entry.penaltyMs,
        };

        const { data, error } = await supabase
          .from('copa_mundial_leaderboard')
          .insert([newEntry])
          .select();

        if (error) throw error;
        
        await fetchEntries();
        return data?.[0] ? {
          id: String(data[0].id),
          name: data[0].name,
          phase: data[0].phase as Phase,
          totalTimeMs: Number(data[0].total_time_ms),
          date: data[0].date,
          eliminated: data[0].eliminated,
          penaltyMs: Number(data[0].penalty_ms),
        } : null;
      } catch (err) {
        console.warn('Supabase save failed, falling back to localStorage:', err);
        const savedLocal = saveLocalEntry(entry);
        // Sync state
        setEntries(getLocalEntries());
        return savedLocal;
      }
    },
    [fetchEntries, getLocalEntries, saveLocalEntry]
  );

  const clear = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('copa_mundial_leaderboard')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all rows
      if (error) throw error;
    } catch (err) {
      console.warn('Supabase clear failed:', err);
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setEntries([]);
  }, []);

  const getSurvivors = useCallback((): LeaderboardEntry[] => {
    return entries.filter((e) => !e.eliminated);
  }, [entries]);

  const formatTime = useCallback((ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  const getPhaseLabel = useCallback((phase: Phase): string => {
    const labels: Record<Phase, string> = {
      grupos: 'Fase de Grupos',
      octavos: 'Octavos de Final',
      cuartos: 'Cuartos de Final',
      semifinal: 'Semifinal',
      final: 'Gran Final 🏆',
    };
    return labels[phase];
  }, []);

  return { entries, loading, getAll: getLocalEntries, fetchEntries, save, clear, getSurvivors, formatTime, getPhaseLabel };
}
