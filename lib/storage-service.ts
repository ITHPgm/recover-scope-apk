import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

import {
  AppSettings,
  FileCandidate,
  OperationRecord,
  SAMPLE_CANDIDATES,
  SAMPLE_SOURCES,
  StorageSource,
} from './types';

const KEYS = {
  settings: '@recoverscope/settings',
  candidates: '@recoverscope/candidates',
  sources: '@recoverscope/sources',
  bin: '@recoverscope/bin',
  operations: '@recoverscope/operations',
};

export const DEFAULT_SETTINGS: AppSettings = {
  isPremium: false,
  planId: 'free',
  dailyDeepScans: 0,
  lastDeepScanDate: new Date().toISOString().slice(0, 10),
  adsEnabled: true,
  selectedSourceIds: ['device', 'media-store', 'downloads'],
  completedOnboarding: false,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getSettings() {
  return readJson(KEYS.settings, DEFAULT_SETTINGS);
}

export async function saveSettings(settings: AppSettings) {
  await writeJson(KEYS.settings, settings);
}

export async function getCandidates() {
  return readJson<FileCandidate[]>(KEYS.candidates, SAMPLE_CANDIDATES);
}

export async function saveCandidates(candidates: FileCandidate[]) {
  await writeJson(KEYS.candidates, candidates);
}

export async function getSources() {
  return readJson<StorageSource[]>(KEYS.sources, SAMPLE_SOURCES);
}

export async function saveSources(sources: StorageSource[]) {
  await writeJson(KEYS.sources, sources);
}

export async function getRecycleBin() {
  return readJson<FileCandidate[]>(KEYS.bin, []);
}

export async function saveRecycleBin(items: FileCandidate[]) {
  await writeJson(KEYS.bin, items);
}

export async function getOperations() {
  return readJson<OperationRecord[]>(KEYS.operations, []);
}

export async function saveOperations(items: OperationRecord[]) {
  await writeJson(KEYS.operations, items.slice(0, 100));
}

export async function addOperation(operation: OperationRecord) {
  const current = await getOperations();
  await saveOperations([operation, ...current]);
}

export async function requestMediaAuthorization() {
  const result = await MediaLibrary.requestPermissionsAsync(false, ['photo', 'video']);
  return result.granted;
}

export async function pickDirectory() {
  try {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (permissions.granted) {
      return { uri: permissions.directoryUri, name: 'Authorized Android folder', size: 0, mimeType: 'inode/directory' };
    }
  } catch {
    // Fall back to a single-file picker on platforms where SAF is unavailable.
  }
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    multiple: false,
    copyToCacheDirectory: false,
  });
  if (result.canceled) return null;
  const file = result.assets[0];
  return { uri: file.uri, name: file.name, size: file.size ?? 0, mimeType: file.mimeType ?? 'application/octet-stream' };
}

export async function scanMediaLibrary(limit = 250): Promise<FileCandidate[]> {
  const granted = await requestMediaAuthorization();
  if (!granted) return [];
  const assets = await MediaLibrary.getAssetsAsync({ first: limit, mediaType: ['photo', 'video', 'audio'], sortBy: ['creationTime'] });
  return assets.assets.map((asset) => ({
    id: `media-${asset.id}`,
    name: asset.filename || `media-${asset.id}`,
    uri: asset.uri,
    kind: asset.mediaType === 'photo' ? 'image' : asset.mediaType === 'video' ? 'video' : 'audio',
    candidateKind: 'visible',
    confidence: 'confirmed',
    sizeBytes: asset.width && asset.height ? Math.max(1, asset.width * asset.height) : 0,
    modifiedAt: new Date(asset.creationTime).toISOString(),
    sourceId: 'media-store',
    mimeType: asset.mediaType === 'photo' ? 'image/*' : asset.mediaType === 'video' ? 'video/*' : 'audio/*',
    canRestore: true,
  }));
}

export async function copyToAppRecoveryFolder(candidate: FileCandidate) {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!base) throw new Error('No app storage directory is available.');
  const target = `${base}recovered-${Date.now()}-${candidate.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  await FileSystem.copyAsync({ from: candidate.uri, to: target });
  return target;
}

export async function deleteAppIndex() {
  await Promise.all(Object.values(KEYS).map((key) => AsyncStorage.removeItem(key)));
}
