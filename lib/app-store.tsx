import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  addOperation,
  DEFAULT_SETTINGS,
  getCandidates,
  getOperations,
  getRecycleBin,
  getSettings,
  getSources,
  saveCandidates,
  saveRecycleBin,
  saveSettings,
  saveSources,
} from './storage-service';
import { AppSettings, FileCandidate, OperationRecord, StorageSource } from './types';

const EMPTY_CONTEXT = {
  settings: DEFAULT_SETTINGS,
  candidates: [] as FileCandidate[],
  sources: [] as StorageSource[],
  bin: [] as FileCandidate[],
  operations: [] as OperationRecord[],
  ready: false,
};

type AppStore = typeof EMPTY_CONTEXT & {
  toggleCandidate: (id: string) => void;
  replaceCandidates: (items: FileCandidate[]) => Promise<void>;
  toggleFavorite: (id: string) => void;
  moveToBin: (ids: string[]) => Promise<void>;
  restoreFromBin: (ids: string[]) => Promise<void>;
  emptyBin: () => Promise<void>;
  markSourceAuthorized: (sourceId: string, authorized: boolean) => Promise<void>;
  completeScan: (mode: 'basic' | 'deep') => Promise<boolean>;
  activatePlan: (planId: AppSettings['planId']) => Promise<void>;
  refresh: () => Promise<void>;
};

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [candidates, setCandidates] = useState<FileCandidate[]>([]);
  const [sources, setSources] = useState<StorageSource[]>([]);
  const [bin, setBin] = useState<FileCandidate[]>([]);
  const [operations, setOperations] = useState<OperationRecord[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const [nextSettings, nextCandidates, nextSources, nextBin, nextOperations] = await Promise.all([
      getSettings(),
      getCandidates(),
      getSources(),
      getRecycleBin(),
      getOperations(),
    ]);
    setSettings(nextSettings);
    setCandidates(nextCandidates);
    setSources(nextSources);
    setBin(nextBin);
    setOperations(nextOperations);
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const replaceCandidates = useCallback(async (items: FileCandidate[]) => {
    if (!items.length) return;
    setCandidates(items);
    await saveCandidates(items);
  }, []);

  const toggleCandidate = useCallback((id: string) => {
    setCandidates((current) => current.map((item) => item.id === id ? { ...item, selected: !item.selected } : item));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setCandidates((current) => {
      const next = current.map((item) => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item);
      void saveCandidates(next);
      return next;
    });
  }, []);

  const moveToBin = useCallback(async (ids: string[]) => {
    const moving = candidates.filter((item) => ids.includes(item.id));
    const nextCandidates = candidates.filter((item) => !ids.includes(item.id));
    const nextBin = [...moving, ...bin];
    setCandidates(nextCandidates);
    setBin(nextBin);
    await Promise.all([saveCandidates(nextCandidates), saveRecycleBin(nextBin), addOperation({
      id: `op-${Date.now()}`,
      type: 'trash',
      label: `${moving.length} item${moving.length === 1 ? '' : 's'} moved to bin`,
      detail: 'App-managed recycle bin; original provider files are not overwritten.',
      createdAt: new Date().toISOString(),
      status: 'completed',
    })]);
    setOperations(await getOperations());
  }, [bin, candidates]);

  const restoreFromBin = useCallback(async (ids: string[]) => {
    const restoring = bin.filter((item) => ids.includes(item.id)).map((item) => ({ ...item, candidateKind: 'visible' as const, selected: false }));
    const nextBin = bin.filter((item) => !ids.includes(item.id));
    const nextCandidates = [...restoring, ...candidates];
    setBin(nextBin);
    setCandidates(nextCandidates);
    await Promise.all([saveCandidates(nextCandidates), saveRecycleBin(nextBin), addOperation({
      id: `op-${Date.now()}`,
      type: 'restore',
      label: `${restoring.length} item${restoring.length === 1 ? '' : 's'} restored`,
      detail: 'Restored to the RecoverScope index for review.',
      createdAt: new Date().toISOString(),
      status: 'completed',
    })]);
    setOperations(await getOperations());
  }, [bin, candidates]);

  const emptyBin = useCallback(async () => {
    const count = bin.length;
    setBin([]);
    await Promise.all([saveRecycleBin([]), addOperation({
      id: `op-${Date.now()}`,
      type: 'delete',
      label: `${count} item${count === 1 ? '' : 's'} permanently removed from app bin`,
      detail: 'This clears the app-managed bin index. It does not guarantee physical flash sanitization.',
      createdAt: new Date().toISOString(),
      status: 'completed',
    })]);
    setOperations(await getOperations());
  }, [bin]);

  const markSourceAuthorized = useCallback(async (sourceId: string, authorized: boolean) => {
    const next = sources.map((source) => source.id === sourceId ? { ...source, authorized } : source);
    setSources(next);
    await saveSources(next);
  }, [sources]);

  const completeScan = useCallback(async (mode: 'basic' | 'deep') => {
    const today = new Date().toISOString().slice(0, 10);
    const scanCount = settings.lastDeepScanDate === today ? settings.dailyDeepScans : 0;
    const allowed = mode === 'basic' || settings.isPremium || scanCount < 3;
    if (!allowed) return false;
    const nextSettings = {
      ...settings,
      dailyDeepScans: mode === 'deep' ? scanCount + 1 : scanCount,
      lastDeepScanDate: today,
    };
    setSettings(nextSettings);
    await saveSettings(nextSettings);
    await addOperation({
      id: `op-${Date.now()}`,
      type: 'scan',
      label: `${mode === 'deep' ? 'Deep' : 'Basic'} offline scan completed`,
      detail: `${candidates.length} indexed candidates reviewed across authorized sources.`,
      createdAt: new Date().toISOString(),
      status: 'completed',
    });
    setOperations(await getOperations());
    return true;
  }, [candidates.length, settings]);

  const activatePlan = useCallback(async (planId: AppSettings['planId']) => {
    const next = { ...settings, planId, isPremium: planId !== 'free', adsEnabled: planId === 'free' };
    setSettings(next);
    await saveSettings(next);
  }, [settings]);

  const value = useMemo(() => ({
    settings,
    candidates,
    sources,
    bin,
    operations,
    ready,
    toggleCandidate,
    replaceCandidates,
    toggleFavorite,
    moveToBin,
    restoreFromBin,
    emptyBin,
    markSourceAuthorized,
    completeScan,
    activatePlan,
    refresh,
  }), [settings, candidates, sources, bin, operations, ready, toggleCandidate, replaceCandidates, toggleFavorite, moveToBin, restoreFromBin, emptyBin, markSourceAuthorized, completeScan, activatePlan, refresh]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useAppStore must be used within AppStoreProvider');
  return context;
}

export async function clearLocalIndex() {
  await Promise.all(['@recoverscope/settings', '@recoverscope/candidates', '@recoverscope/sources', '@recoverscope/bin', '@recoverscope/operations'].map((key) => AsyncStorage.removeItem(key)));
}
