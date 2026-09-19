import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  RSVPItem, 
  WishItem, 
  DashboardStats, 
  Language, 
  ActivePage 
} from './types';
import { fetchLiveSheetData, getFromLocalCache } from './services/api';
import { Header } from './components/Header';
import { RSVPPageView } from './components/RSVPPageView';
import { WishesPageView } from './components/WishesPageView';
import { OceanBackground } from './components/OceanBackground';

export default function App() {
  // Default language is English. NOT persisted in localStorage so it resets to English on refresh!
  const [lang, setLang] = useState<Language>('en');
  // Two distinct pages: 'rsvps' (Attendees) and 'wishes' (Wishes)
  const [activePage, setActivePage] = useState<ActivePage>('rsvps');

  // Load from local storage cache immediately so UI loads instantly without cold-start delay
  const initialCache = useMemo(() => getFromLocalCache(), []);
  const [rsvps, setRsvps] = useState<RSVPItem[]>(() => initialCache?.rsvps || []);
  const [wishes, setWishes] = useState<WishItem[]>(() => initialCache?.wishes || []);
  const [isLoading, setIsLoading] = useState<boolean>(() => !initialCache);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(() => initialCache ? new Date(initialCache.timestamp) : null);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(60);
  const [syncError, setSyncError] = useState<boolean>(false);

  // Sync document direction and lang with state
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Main fetch function from Google Apps Script Webhook
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsRefreshing(true);
    }
    try {
      const data = await fetchLiveSheetData();
      // Strictly reflect the exact live data from Google Sheet (empty if rows were deleted)
      setRsvps(data.rsvps || []);
      setWishes(data.wishes || []);
      setLastUpdated(new Date());
      setSyncError(false);
    } catch (err) {
      console.warn('Live fetch issue:', err);
      setSyncError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setRefreshCountdown(60);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Auto-refresh countdown every 60s
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          loadData(true);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadData]);

  // High-level statistics calculation
  const stats: DashboardStats = useMemo(() => {
    const totalResponses = rsvps.length;
    const attendingList = rsvps.filter(r => r.normalizedStatus === 'attending');
    const maybeList = rsvps.filter(r => r.normalizedStatus === 'maybe');
    const declinedList = rsvps.filter(r => r.normalizedStatus === 'declined');

    const attendingResponsesCount = attendingList.length;
    const totalGuestsAttending = attendingList.reduce((acc, curr) => acc + (curr.guestsCount || 1), 0);
    const maybeResponsesCount = maybeList.length;
    const declinedResponsesCount = declinedList.length;

    const avgPartySize = attendingResponsesCount > 0 
      ? Math.round((totalGuestsAttending / attendingResponsesCount) * 10) / 10 
      : 1;

    const attendanceRate = totalResponses > 0 
      ? Math.round((attendingResponsesCount / totalResponses) * 100) 
      : 0;

    return {
      totalResponses,
      totalGuestsAttending,
      attendingResponsesCount,
      maybeResponsesCount,
      declinedResponsesCount,
      totalWishes: wishes.length,
      avgPartySize,
      attendanceRate,
    };
  }, [rsvps, wishes]);

  // Toggle Language between English and Arabic
  const handleToggleLang = () => {
    setLang(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  return (
    <div className="relative min-h-screen bg-[#021326] text-cyan-50 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      
      {/* Deep Ocean Ambient Background with Soft Bubbles */}
      <OceanBackground />

      {/* Main Container - strictly sized and padded for mobile phone screens */}
      <div className="relative z-10 flex flex-col min-h-screen w-full max-w-lg mx-auto">
        
        {/* Header with Brand, Lang Switcher (En default), Auto-Refresh, and 2 Pages Switcher */}
        <Header
          lang={lang}
          onToggleLang={handleToggleLang}
          activePage={activePage}
          onChangePage={setActivePage}
          isRefreshing={isRefreshing}
          onRefresh={() => loadData(false)}
          lastUpdated={lastUpdated}
          refreshCountdown={refreshCountdown}
          syncError={syncError}
          totalRsvps={rsvps.length}
          totalWishes={wishes.length}
        />

        {/* Loading Spinner for initial fetch */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-3 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <div className="absolute inset-2 rounded-full bg-cyan-950/60 flex items-center justify-center text-xl">
                🧜‍♀️
              </div>
            </div>
            <p className="text-cyan-200 font-semibold text-xs animate-pulse">
              {lang === 'ar' ? 'جارِ جلب البيانات من Google Sheet...' : 'Connecting to Google Sheet...'}
            </p>
          </div>
        ) : (
          <main className="flex-1 flex flex-col">
            {/* PAGE 1: ATTENDEES (صفحة الحضور) */}
            {activePage === 'rsvps' && (
              <RSVPPageView
                rsvps={rsvps}
                stats={stats}
                lang={lang}
              />
            )}

            {/* PAGE 2: WISHES (صفحة الامنيات) */}
            {activePage === 'wishes' && (
              <WishesPageView
                wishes={wishes}
                lang={lang}
              />
            )}
          </main>
        )}

        {/* Footer */}
        <footer className="no-print mt-auto py-4 px-3 text-center border-t border-cyan-500/10 text-[11px] text-cyan-300/50">
          <div className="flex items-center justify-center gap-1.5">
            <span>🧜‍♀️</span>
            <span>
              {lang === 'ar' 
                ? 'حفل عيد ميلاد لينا العاشر 👑' 
                : "Lina's 10th Birthday Under the Sea 👑"}
            </span>
          </div>
        </footer>

      </div>

    </div>
  );
}
