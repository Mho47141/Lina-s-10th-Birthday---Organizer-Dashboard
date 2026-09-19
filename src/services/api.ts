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

// Fallback seed data in case Google Apps Script network is temporarily slow or offline
export const FALLBACK_DATA: { rsvps: RSVPItem[]; wishes: WishItem[] } = {
  rsvps: [
    {
      id: 'rsvp-seed-1',
      timestamp: '2026-09-19T11:25:00.000Z',
      name: 'Sarah Al-Ahmad (سارة الأحمد)',
      status: 'حاضر بالتأكيد 🎉',
      normalizedStatus: 'attending',
      guestsCount: 3,
      phone: '+201012345678',
      message: 'Can not wait to celebrate with beautiful Lina! 🧜‍♀️✨',
    },
    {
      id: 'rsvp-seed-2',
      timestamp: '2026-09-19T14:27:49.203Z',
      name: 'خلود وفاطمة',
      status: 'حاضر بالتأكيد 🎉',
      normalizedStatus: 'attending',
      guestsCount: 2,
      phone: '01003431610',
      message: 'متحمسين جداً لحفل حورية البحر وعيد ميلاد لينا العاشر! 🐚💖',
    },
    {
      id: 'rsvp-seed-3',
      timestamp: '2026-09-19T12:10:00.000Z',
      name: 'مريم وعائلتها',
      status: 'حاضر بالتأكيد 🎉',
      normalizedStatus: 'attending',
      guestsCount: 4,
      phone: '+966501234567',
      message: 'ألف مبروك للينا الأميرة الصغيرة، جاهزين للاحتفال في قاع المحيط 👑',
    },
    {
      id: 'rsvp-seed-4',
      timestamp: '2026-09-19T13:40:00.000Z',
      name: 'ياسمين كمال',
      status: 'ربما 🤔',
      normalizedStatus: 'maybe',
      guestsCount: 2,
      phone: '+201198765432',
      message: 'سنبذل قصارى جهدنا للحضور إن شاء الله حسب مواعيد السفر',
    },
    {
      id: 'rsvp-seed-5',
      timestamp: '2026-09-19T09:15:00.000Z',
      name: 'أحمد وزوجته',
      status: 'معتذر 💌',
      normalizedStatus: 'declined',
      guestsCount: 1,
      phone: '+201234567890',
      message: 'نعتذر بشدة عن الحضور لظرف طارئ، نتمنى للينا عيد ميلاد سعيد ومميز!',
    },
  ],
  wishes: [
    {
      id: 'wish-seed-1',
      timestamp: '2026-09-19T11:24:00.000Z',
      author: 'Lina Fan (نور الهدى)',
      message: 'Wishing you a magical celebration under the sea! 🧜‍♀️✨ May all your ocean dreams come true!',
      avatar: '🧜‍♀️',
    },
    {
      id: 'wish-seed-2',
      timestamp: '2026-09-19T14:28:51.809Z',
      author: 'خلود',
      message: 'كل سنة وأنتِ طيبة يا أجمل لينا في العالم، وعقبال 100 سنة سعادة وفرح 🎂💖',
      avatar: '👑',
    },
    {
      id: 'wish-seed-3',
      timestamp: '2026-09-19T13:00:00.000Z',
      author: 'ريان وتالا',
      message: 'عيد ميلاد عاشر سعيد لأحلى حورية بحر! نتمنى لكِ سنة مليئة بالمغامرات والمرح 🐚🌊',
      avatar: '🐚',
    },
  ],
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
