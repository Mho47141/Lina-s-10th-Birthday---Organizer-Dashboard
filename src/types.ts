export type RSVPStatus = 'attending' | 'maybe' | 'declined';

export interface RSVPItem {
  id: string;
  timestamp: string;
  name: string;
  status: string; // Original string from Google Sheet (e.g. "حاضر بالتأكيد 🎉", "ربما", "معتذر")
  normalizedStatus: RSVPStatus;
  guestsCount: number;
  phone: string;
  message: string;
}

export interface WishItem {
  id: string;
  timestamp: string;
  author: string;
  message: string;
  avatar?: string;
  likes?: number;
}

export interface SheetDataResponse {
  rsvps: Array<{
    id?: string;
    timestamp?: string;
    name?: string;
    status?: string;
    guestsCount?: number | string;
    phone?: string;
    message?: string;
  }>;
  wishes: Array<{
    id?: string;
    timestamp?: string;
    author?: string;
    message?: string;
    avatar?: string;
  }>;
}

export interface DashboardStats {
  totalResponses: number;
  totalGuestsAttending: number;
  attendingResponsesCount: number;
  maybeResponsesCount: number;
  declinedResponsesCount: number;
  totalWishes: number;
  avgPartySize: number;
  attendanceRate: number;
}

export type Language = 'ar' | 'en';
export type FilterStatus = 'all' | 'attending' | 'maybe' | 'declined';
export type ActivePage = 'rsvps' | 'wishes';
