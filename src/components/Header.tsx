import React from 'react';
import { 
  RefreshCw, 
  Languages, 
  Users, 
  HeartHandshake, 
  AlertCircle
} from 'lucide-react';
import { Language, ActivePage } from '../types';
import { translations } from '../utils/translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  activePage: ActivePage;
  onChangePage: (page: ActivePage) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated: Date | null;
  refreshCountdown: number;
  syncError: boolean;
  totalRsvps: number;
  totalWishes: number;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  activePage,
  onChangePage,
  isRefreshing,
  onRefresh,
  lastUpdated,
  refreshCountdown,
  syncError,
  totalRsvps,
  totalWishes,
}) => {
  const t = translations[lang];

  const formattedTime = lastUpdated
    ? new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(lastUpdated)
    : '--:--';

  return (
    <header className="relative z-10 w-full no-print pt-3 pb-2 px-3 sm:px-4 max-w-lg mx-auto">
      {/* Brand & Action Bar */}
      <div className="glass-panel rounded-2xl p-3.5 sm:p-4 mb-3">
        {/* Top row: Logo, Title, and Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600/40 to-pink-500/40 border border-cyan-400/40 text-xl shadow-md">
              <span>🧜‍♀️</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white truncate">
                {t.title}
              </h1>
              <p className="text-[11px] text-cyan-300/70 truncate">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Right side controls: Language Button & Refresh Button */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Language Switcher */}
            <button
              id="lang-toggle-btn"
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-pink-950/60 hover:bg-pink-900/60 text-pink-200 border border-pink-500/30 transition cursor-pointer"
              title="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5 text-pink-300" />
              <span>{t.langButton}</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              id="refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-cyan-950/70 hover:bg-cyan-900/70 text-cyan-200 border border-cyan-500/30 transition cursor-pointer disabled:opacity-50"
              title={`${t.autoRefreshIn} ${refreshCountdown}${t.seconds}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-mono text-[10px] text-cyan-300/80">{refreshCountdown}s</span>
            </button>
          </div>
        </div>

        {/* Status indicator row */}
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-cyan-500/15 text-[10px] sm:text-[11px] text-cyan-300/70">
          <div className="flex items-center gap-1.5 truncate">
            {syncError ? (
              <button 
                onClick={onRefresh}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
                title="Tap to retry connection"
              >
                <AlertCircle className="w-3 h-3" />
                <span className="underline decoration-dotted">{t.reconnecting}</span>
              </button>
            ) : isRefreshing ? (
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span>{t.syncing}</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{t.liveConnected}</span>
              </span>
            )}
            <span className="opacity-40">•</span>
            <span>{t.lastUpdated} <strong className="text-cyan-200 font-mono">{formattedTime}</strong></span>
          </div>

          <span className="text-cyan-300 font-semibold flex-shrink-0">
            {activePage === 'rsvps' ? `${totalRsvps} ${t.rsvps.allFilter}` : `${totalWishes} 💖`}
          </span>
        </div>
      </div>

      {/* Two Pages Switcher (Full Width Tabs for Mobile) */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#031c38]/90 border border-cyan-500/20 backdrop-blur-md mb-2">
        {/* Page 1: Attendees (RSVP) */}
        <button
          id="tab-rsvps"
          onClick={() => onChangePage('rsvps')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            activePage === 'rsvps'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-500/25'
              : 'text-cyan-200 hover:bg-cyan-900/40'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span className="truncate">{t.pages.rsvps}</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
            activePage === 'rsvps' ? 'bg-slate-950/20 text-slate-950' : 'bg-cyan-950 text-cyan-300'
          }`}>
            {totalRsvps}
          </span>
        </button>

        {/* Page 2: Wishes */}
        <button
          id="tab-wishes"
          onClick={() => onChangePage('wishes')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            activePage === 'wishes'
              ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-slate-950 shadow-md shadow-pink-500/25'
              : 'text-pink-200 hover:bg-pink-900/30'
          }`}
        >
          <HeartHandshake className="w-4 h-4 shrink-0" />
          <span className="truncate">{t.pages.wishes}</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
            activePage === 'wishes' ? 'bg-slate-950/20 text-slate-950' : 'bg-pink-950 text-pink-300'
          }`}>
            {totalWishes}
          </span>
        </button>
      </div>
    </header>
  );
};
