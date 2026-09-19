import { RSVPItem, WishItem, SheetDataResponse, RSVPStatus } from '../types';

export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw2yC1kkf5sJidoBZBo-FYHgW_jaKLO1QmJ7Q-7m3OYmCwhSpFRrsApFr2OZEzDEZzL/exec';

export function normalizeStatus(rawStatus?: string): RSVPStatus {
  if (!rawStatus) return 'attending';
  const lower = rawStatus.toLowerCase();
  if (lower.includes('حاضر') || lower.includes('attend') || lower.includes('yes') || lower.includes('نعم')) {
    return 'attending';
  }
  if (lower.includes('ربما') || lower.includes('maybe') || lower.includes('احتمال')) {
    return 'maybe';
  }
  if (lower.includes('معتذر') || lower.includes('اعتذار') || lower.includes('decline') || lower.includes('no') || lower.includes('لا')) {
    return 'declined';
  }
  return 'attending';
}

export function parseRSVPItem(raw: any, index: number): RSVPItem {
  const count = typeof raw.guestsCount === 'number' 
    ? raw.guestsCount 
    : parseInt(String(raw.guestsCount || '1'), 10) || 1;

  const rawStatus = raw.status || 'حاضر بالتأكيد 🎉';

  return {
    id: raw.id || `rsvp-${index + 1}-${raw.timestamp || Date.now()}`,
    timestamp: raw.timestamp || new Date().toISOString(),
    name: raw.name ? String(raw.name).trim() : 'ضيف كريم',
    status: rawStatus,
    normalizedStatus: normalizeStatus(rawStatus),
    guestsCount: Math.max(1, count),
    phone: raw.phone ? String(raw.phone).trim() : '',
    message: raw.message ? String(raw.message).trim() : '',
  };
}

export function parseWishItem(raw: any, index: number): WishItem {
  const avatars = ['🧜‍♀️', '🐚', '✨', '🫧', '🪸', '🐬', '👑'];
  const defaultAvatar = avatars[index % avatars.length];

  return {
    id: raw.id || `wish-${index + 1}-${raw.timestamp || Date.now()}`,
    timestamp: raw.timestamp || new Date().toISOString(),
    author: raw.author ? String(raw.author).trim() : 'محب لينا ✨',
    message: raw.message ? String(raw.message).trim() : '',
    avatar: raw.avatar || defaultAvatar,
  };
}

// Empty initial fallback data
export const FALLBACK_DATA: { rsvps: RSVPItem[]; wishes: WishItem[] } = {
  rsvps: [],
  wishes: [],
};

export async function fetchLiveSheetData(): Promise<{ rsvps: RSVPItem[]; wishes: WishItem[] }> {
  try {
    const url = `${SCRIPT_URL}?action=all&_t=${Date.now()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SheetDataResponse = await response.json();

    const rsvps: RSVPItem[] = Array.isArray(data.rsvps)
      ? data.rsvps.map((item, idx) => parseRSVPItem(item, idx))
      : [];

    const wishes: WishItem[] = Array.isArray(data.wishes)
      ? data.wishes.map((item, idx) => parseWishItem(item, idx))
      : [];

    return { rsvps, wishes };
  } catch (error) {
    console.warn('Live fetch failed or CORS restricted, checking fallback/stored data:', error);
    throw error;
  }
}
