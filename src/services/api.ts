import { RSVPItem, WishItem, SheetDataResponse, RSVPStatus } from '../types';

export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw2yC1kkf5sJidoBZBo-FYHgW_jaKLO1QmJ7Q-7m3OYmCwhSpFRrsApFr2OZEzDEZzL/exec';

const CACHE_STORAGE_KEY = 'lina_dashboard_live_cache_v3';

export function normalizeStatus(rawStatus?: string): RSVPStatus {
  if (!rawStatus) return 'attending';
  const lower = rawStatus.toLowerCase().trim();

  // 1. Check declined FIRST (so phrases like "اعتذر عن الحضور" don't trigger "حضور")
  if (
    lower.includes('اعتذر') ||
    lower.includes('معتذر') ||
    lower.includes('اعتذار') ||
    lower.includes('نعتذر') ||
    lower.includes('لن احضر') ||
    lower.includes('لن أحضر') ||
    lower.includes('decline') ||
    lower.includes('cannot') ||
    lower.includes('not attend') ||
    lower.includes('sorry')
  ) {
    return 'declined';
  }

  // 2. Check maybe
  if (
    lower.includes('ربما') ||
    lower.includes('maybe') ||
    lower.includes('احتمال') ||
    lower.includes('مش اكيد') ||
    lower.includes('مش أكيد') ||
    lower.includes('غير مؤكد')
  ) {
    return 'maybe';
  }

  // 3. Check attending
  if (
    lower.includes('حاضر') ||
    lower.includes('حضور') ||
    lower.includes('جايه') ||
    lower.includes('جاي') ||
    lower.includes('attend') ||
    lower.includes('yes') ||
    lower.includes('نعم') ||
    lower.includes('بالتأكيد')
  ) {
    return 'attending';
  }

  return 'attending';
}

export function parseRSVPItem(raw: any, index: number): RSVPItem {
  const count = typeof raw.guestsCount === 'number' 
    ? raw.guestsCount 
    : parseInt(String(raw.guestsCount || '1'), 10) || 1;

  const rawStatus = raw.status ? String(raw.status).trim() : 'حاضر بالتأكيد 🎉';

  return {
    id: raw.id ? String(raw.id) : `rsvp-${index + 1}-${raw.timestamp || Date.now()}`,
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
    id: raw.id ? String(raw.id) : `wish-${index + 1}-${raw.timestamp || Date.now()}`,
    timestamp: raw.timestamp || new Date().toISOString(),
    author: raw.author ? String(raw.author).trim() : 'محب لينا ✨',
    message: raw.message ? String(raw.message).trim() : '',
    avatar: raw.avatar || defaultAvatar,
  };
}

// Save to local cache for instant loading on next app open
export function saveToLocalCache(rsvps: RSVPItem[], wishes: WishItem[]) {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify({
      rsvps,
      wishes,
      timestamp: Date.now(),
    }));
  } catch (e) {
    // LocalStorage quota or blocked in private mode; silently ignore
  }
}

// Retrieve from local cache
export function getFromLocalCache(): { rsvps: RSVPItem[]; wishes: WishItem[]; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.rsvps) && Array.isArray(parsed.wishes)) {
      return parsed;
    }
  } catch (e) {
    // Ignore invalid JSON
  }
  return null;
}

/**
 * Fetch from Google Apps Script with timeout and automatic retry
 */
async function fetchWithTimeout(url: string, timeoutMs = 9000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      redirect: 'follow',
      credentials: 'omit',
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchLiveSheetData(): Promise<{ rsvps: RSVPItem[]; wishes: WishItem[] }> {
  // Try up to 2 attempts (first quick 8s, second fallback 10s)
  let lastError: any = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      // Unique query param to bypass aggressive browser/proxy cache while keeping simple URL
      const timestamp = Date.now();
      const url = `${SCRIPT_URL}?action=all&_t=${timestamp}`;

      const response = await fetchWithTimeout(url, attempt === 1 ? 8000 : 11000);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: SheetDataResponse = await response.json();

      const rsvps: RSVPItem[] = Array.isArray(data.rsvps)
        ? data.rsvps.map((item, idx) => parseRSVPItem(item, idx))
        : [];

      const wishes: WishItem[] = Array.isArray(data.wishes)
        ? data.wishes.map((item, idx) => parseWishItem(item, idx))
        : [];

      // Save fresh result in cache immediately
      saveToLocalCache(rsvps, wishes);

      return { rsvps, wishes };
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${attempt} to connect to Google Sheets failed:`, error?.message || error);
      // Wait 1 second before retrying on attempt 1
      if (attempt === 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // If both attempts failed, check if we have cached data to prevent app breaking
  const cached = getFromLocalCache();
  if (cached) {
    console.info('Serving data from local cache due to temporary network/Google Apps Script delay');
    return { rsvps: cached.rsvps, wishes: cached.wishes };
  }

  throw lastError || new Error('Could not connect to Google Sheet after 2 attempts');
}
