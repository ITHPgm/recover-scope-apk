export type CandidateKind =
  | 'visible'
  | 'trashed'
  | 'unindexed'
  | 'duplicate'
  | 'corrupted'
  | 'carved';

export type Confidence = 'confirmed' | 'high' | 'medium' | 'low' | 'not-recoverable';

export type MediaKind = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

export type StorageSourceType = 'device' | 'media-store' | 'downloads' | 'folder' | 'sd-card' | 'usb';

export type StorageSource = {
  id: string;
  name: string;
  type: StorageSourceType;
  description: string;
  authorized: boolean;
  itemCount: number;
  sizeBytes: number;
};

export type FileCandidate = {
  id: string;
  name: string;
  uri: string;
  kind: MediaKind;
  candidateKind: CandidateKind;
  confidence: Confidence;
  sizeBytes: number;
  modifiedAt: string;
  sourceId: string;
  mimeType: string;
  selected?: boolean;
  isFavorite?: boolean;
  canRestore: boolean;
  isDuplicate?: boolean;
  duplicateGroupId?: string;
};

export type DuplicateGroup = {
  id: string;
  label: string;
  itemIds: string[];
  reclaimableBytes: number;
};

export type Plan = {
  id: 'free' | 'plus' | 'pro';
  name: string;
  monthly: number;
  yearly: number;
  description: string;
  features: string[];
  popular?: boolean;
};

export type AppSettings = {
  isPremium: boolean;
  planId: Plan['id'];
  dailyDeepScans: number;
  lastDeepScanDate: string;
  adsEnabled: boolean;
  selectedSourceIds: string[];
  completedOnboarding: boolean;
};

export type OperationRecord = {
  id: string;
  type: 'restore' | 'trash' | 'delete' | 'scan';
  label: string;
  detail: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
};

export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0,
    yearly: 0,
    description: 'Start investigating your storage offline.',
    features: ['3 basic scans per day', 'Visible media and duplicate review', 'Recycle bin for app actions', 'Unity Ads supported'],
  },
  {
    id: 'plus',
    name: 'Plus',
    monthly: 2.99,
    yearly: 19.99,
    description: 'More scans and a calmer cleanup experience.',
    features: ['Unlimited basic scans', '10 deep scans per day', 'No ads', 'Advanced duplicate groups', 'Priority restore queue'],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 5.99,
    yearly: 39.99,
    description: 'Full offline investigation toolkit.',
    features: ['Unlimited scans', 'Removable storage analysis', 'Read-only carving mode', 'No ads', 'Exportable audit reports'],
  },
];

export const SAMPLE_CANDIDATES: FileCandidate[] = [
  {
    id: 'photo-1',
    name: 'IMG_2026_0412.jpg',
    uri: 'content://media/external/images/media/1001',
    kind: 'image',
    candidateKind: 'visible',
    confidence: 'confirmed',
    sizeBytes: 4_200_000,
    modifiedAt: '2026-10-28T14:22:00.000Z',
    sourceId: 'media-store',
    mimeType: 'image/jpeg',
    canRestore: true,
    isFavorite: true,
  },
  {
    id: 'video-1',
    name: 'Family-cooking.mp4',
    uri: 'content://media/external/video/media/1820',
    kind: 'video',
    candidateKind: 'trashed',
    confidence: 'high',
    sizeBytes: 88_400_000,
    modifiedAt: '2026-10-30T09:12:00.000Z',
    sourceId: 'media-store',
    mimeType: 'video/mp4',
    canRestore: true,
  },
  {
    id: 'audio-1',
    name: 'voice-note.m4a',
    uri: 'content://media/external/audio/media/77',
    kind: 'audio',
    candidateKind: 'unindexed',
    confidence: 'medium',
    sizeBytes: 1_800_000,
    modifiedAt: '2026-10-25T08:02:00.000Z',
    sourceId: 'downloads',
    mimeType: 'audio/mp4',
    canRestore: true,
  },
  {
    id: 'pdf-1',
    name: 'receipt-october.pdf',
    uri: 'content://com.android.providers.downloads.documents/document/123',
    kind: 'document',
    candidateKind: 'visible',
    confidence: 'confirmed',
    sizeBytes: 780_000,
    modifiedAt: '2026-10-21T17:45:00.000Z',
    sourceId: 'downloads',
    mimeType: 'application/pdf',
    canRestore: true,
  },
  {
    id: 'photo-2',
    name: 'IMG_2026_0412-copy.jpg',
    uri: 'content://media/external/images/media/1002',
    kind: 'image',
    candidateKind: 'duplicate',
    confidence: 'high',
    sizeBytes: 4_200_000,
    modifiedAt: '2026-10-28T14:22:15.000Z',
    sourceId: 'device',
    mimeType: 'image/jpeg',
    canRestore: true,
    isDuplicate: true,
    duplicateGroupId: 'dup-1',
  },
  {
    id: 'archive-1',
    name: 'old-backup.zip',
    uri: 'content://com.android.providers.downloads.documents/document/222',
    kind: 'archive',
    candidateKind: 'visible',
    confidence: 'confirmed',
    sizeBytes: 420_000_000,
    modifiedAt: '2026-08-04T10:11:00.000Z',
    sourceId: 'downloads',
    mimeType: 'application/zip',
    canRestore: true,
  },
];

export const SAMPLE_SOURCES: StorageSource[] = [
  { id: 'device', name: 'Shared device storage', type: 'device', description: 'User-visible shared storage', authorized: true, itemCount: 1248, sizeBytes: 26_400_000_000 },
  { id: 'media-store', name: 'MediaStore library', type: 'media-store', description: 'Images, videos, audio and indexed media', authorized: true, itemCount: 836, sizeBytes: 18_200_000_000 },
  { id: 'downloads', name: 'Downloads', type: 'downloads', description: 'Documents and downloaded files', authorized: true, itemCount: 412, sizeBytes: 8_200_000_000 },
  { id: 'folder', name: 'Selected folders', type: 'folder', description: 'Folders you explicitly grant', authorized: false, itemCount: 0, sizeBytes: 0 },
  { id: 'sd-card', name: 'SD card', type: 'sd-card', description: 'Removable storage after approval', authorized: false, itemCount: 0, sizeBytes: 0 },
  { id: 'usb', name: 'USB / OTG', type: 'usb', description: 'Connected removable storage', authorized: false, itemCount: 0, sizeBytes: 0 },
];
