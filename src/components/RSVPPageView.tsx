import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  FileText, 
  FileSpreadsheet, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Search, 
  X,
  Crown
} from 'lucide-react';
import { RSVPItem, DashboardStats, Language, FilterStatus } from '../types';
import { translations } from '../utils/translations';
import { formatDateTime, exportRSVPsToCSV, getWhatsAppUrl } from '../utils/exportUtils';

interface RSVPPageViewProps {
  rsvps: RSVPItem[];
  stats: DashboardStats;
  lang: Language;
}

export const RSVPPageView: React.FC<RSVPPageViewProps> = ({
  rsvps,
  stats,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const t = translations[lang];

  // Filtering
  const filteredRSVPs = useMemo(() => {
    return rsvps.filter(item => {
      if (filterStatus !== 'all' && item.normalizedStatus !== filterStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesPhone = item.phone.toLowerCase().includes(q);
        const matchesMessage = item.message.toLowerCase().includes(q);
        const matchesStatus = item.status.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesMessage && !matchesStatus) {
          return false;
        }
      }
      return true;
    });
  }, [rsvps, filterStatus, searchQuery]);

  // Percentage calculations
  const attendingPercent = stats.totalResponses > 0 
    ? Math.round((stats.attendingResponsesCount / stats.totalResponses) * 100) 
    : 0;
  const maybePercent = stats.totalResponses > 0 
    ? Math.round((stats.maybeResponsesCount / stats.totalResponses) * 100) 
    : 0;
  const declinedPercent = stats.totalResponses > 0 
    ? Math.round((stats.declinedResponsesCount / stats.totalResponses) * 100) 
    : 0;

  const handleSavePDF = () => {
    window.print();
  };

  const handleSaveExcel = () => {
    exportRSVPsToCSV(rsvps, lang);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-3 sm:px-4 pb-16 overflow-x-hidden">
      
      {/* 1. CHART & STATISTICS (رسم بياني بالأعداد والنسب) */}
      <section className="glass-panel rounded-2xl p-4 mb-3" aria-label="Attendance Chart & Stats">
        {/* Header with Title and Total Confirmed Pax */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <span>📊</span>
              <span>{t.rsvps.chartTitle}</span>
            </h2>
            <p className="text-[11px] text-cyan-300/70">
              {stats.totalResponses} {t.rsvps.partiesCount} • {stats.totalGuestsAttending} {t.rsvps.guestsLabel}
            </p>
          </div>

          {/* Big Confirmed Badge */}
          <div className="text-end bg-cyan-950/80 px-3 py-1.5 rounded-xl border border-cyan-400/40 shadow-inner">
            <span className="text-[10px] text-cyan-300 block font-semibold flex items-center gap-1 justify-end">
              <Crown className="w-3 h-3 text-amber-300" />
              {t.rsvps.totalGuestsCount}
            </span>
            <span className="text-2xl font-black text-white font-mono leading-none">
              {stats.totalGuestsAttending}
            </span>
          </div>
        </div>

        {/* Visual Progress Ratio Bar */}
        <div className="space-y-1.5 mb-3">
          <div className="w-full h-3 rounded-full bg-slate-900/90 overflow-hidden flex border border-cyan-500/20 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500" 
              style={{ width: `${Math.max(attendingPercent > 0 ? 5 : 0, attendingPercent)}%` }}
              title={`Attending: ${attendingPercent}%`}
            />
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500" 
              style={{ width: `${Math.max(maybePercent > 0 ? 5 : 0, maybePercent)}%` }}
              title={`Maybe: ${maybePercent}%`}
            />
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500" 
              style={{ width: `${Math.max(declinedPercent > 0 ? 5 : 0, declinedPercent)}%` }}
              title={`Declined: ${declinedPercent}%`}
            />
          </div>
        </div>

        {/* 3 Metric Mini-Cards with Counts & Percentages */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Confirmed Attending */}
          <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-300 mb-0.5">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{t.rsvps.totalAttending}</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white font-mono">
              {stats.attendingResponsesCount}
            </div>
            <div className="text-[10px] text-emerald-300/80 font-mono font-semibold">
              {attendingPercent}%
            </div>
          </div>

          {/* Maybe */}
          <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/30">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-300 mb-0.5">
              <HelpCircle className="w-3 h-3 shrink-0" />
              <span className="truncate">{t.rsvps.totalMaybe}</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white font-mono">
              {stats.maybeResponsesCount}
            </div>
            <div className="text-[10px] text-amber-300/80 font-mono font-semibold">
              {maybePercent}%
            </div>
          </div>

          {/* Declined */}
          <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/30">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-300 mb-0.5">
              <XCircle className="w-3 h-3 shrink-0" />
              <span className="truncate">{t.rsvps.totalDeclined}</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white font-mono">
              {stats.declinedResponsesCount}
            </div>
            <div className="text-[10px] text-rose-300/80 font-mono font-semibold">
              {declinedPercent}%
            </div>
          </div>
        </div>
      </section>

      {/* 2. BUTTONS: SAVE PDF & SAVE EXCEL (تحتيه زرار حفظ pdf و اكسيل) */}
      <div className="grid grid-cols-2 gap-2 mb-3 no-print">
        {/* Save PDF Button */}
        <button
          id="btn-save-pdf"
          onClick={handleSavePDF}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition cursor-pointer"
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>{t.rsvps.savePdf}</span>
        </button>

        {/* Save Excel Button */}
        <button
          id="btn-save-excel"
          onClick={handleSaveExcel}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>{t.rsvps.saveExcel}</span>
        </button>
      </div>

      {/* 3. FULL DETAILS WITHOUT HORIZONTAL SCROLL (تحتيه التفاصيل معروضه كامله الاسماء بالاعداد وباقي تفاصيلهم ومن غير مكون محتاج اعمل سكرول يمين وشمال) */}
      <section className="space-y-3" aria-label="Guest List Details">
        
        {/* Search and Filters Bar */}
        <div className="glass-panel rounded-2xl p-3 space-y-2 no-print">
          {/* Search Box */}
          <div className="relative">
            <Search className={`w-3.5 h-3.5 text-cyan-400 absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.rsvps.searchPlaceholder}
              className={`w-full py-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-white placeholder-cyan-300/40 text-xs focus:outline-none focus:border-cyan-400 transition ${
                lang === 'ar' ? 'pr-8 pl-7' : 'pl-8 pr-7'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white p-1 ${
                  lang === 'ar' ? 'left-1.5' : 'right-1.5'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <button
              onClick={() => setFilterStatus('all')}
              className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900/60 text-cyan-200 border border-cyan-500/20'
              }`}
            >
              {t.rsvps.allFilter} ({rsvps.length})
            </button>

            <button
              onClick={() => setFilterStatus('attending')}
              className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                filterStatus === 'attending'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900/60 text-emerald-300 border border-emerald-500/20'
              }`}
            >
              {t.rsvps.filterAttending} ({stats.attendingResponsesCount})
            </button>

            <button
              onClick={() => setFilterStatus('maybe')}
              className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                filterStatus === 'maybe'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-900/60 text-amber-300 border border-amber-500/20'
              }`}
            >
              {t.rsvps.filterMaybe} ({stats.maybeResponsesCount})
            </button>

            <button
              onClick={() => setFilterStatus('declined')}
              className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                filterStatus === 'declined'
                  ? 'bg-rose-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900/60 text-rose-300 border border-rose-500/20'
              }`}
            >
              {t.rsvps.filterDeclined} ({stats.declinedResponsesCount})
            </button>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-bold text-cyan-200 flex items-center gap-1.5">
            <span>📋</span>
            <span>{t.rsvps.detailsHeading}</span>
          </h3>
          <span className="text-[11px] text-cyan-400/80 font-mono">
            {filteredRSVPs.length} {lang === 'ar' ? 'ضيف' : 'items'}
          </span>
        </div>

        {/* Empty State */}
        {filteredRSVPs.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center text-cyan-300/70">
            <div className="text-3xl mb-2">🐚</div>
            <p className="text-xs font-semibold text-cyan-100">
              {rsvps.length === 0
                ? (lang === 'ar' ? 'لا توجد بيانات حضور مسجلة حالياً (Google Sheet فارغ)' : 'No attendee records found in Google Sheet (Sheet is empty)')
                : t.rsvps.noResults}
            </p>
          </div>
        ) : (
          /* Cards List - Perfectly sized for mobile with ZERO horizontal scroll */
          <div className="space-y-2.5">
            {filteredRSVPs.map((item, idx) => {
              const isAttending = item.normalizedStatus === 'attending';
              const isMaybe = item.normalizedStatus === 'maybe';

              const statusBadgeStyle = isAttending
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                : isMaybe
                ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                : 'bg-rose-950/70 text-rose-300 border-rose-500/40';

              const waUrl = getWhatsAppUrl(item.phone, item.name, lang);

              return (
                <div
                  key={item.id || idx}
                  className="glass-panel rounded-2xl p-3.5 border border-cyan-500/20 shadow-md space-y-2.5"
                >
                  {/* Row 1: Guest Name & Status Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base shrink-0">🧜‍♀️</span>
                        <h4 className="text-sm sm:text-base font-bold text-white break-words">
                          {item.name}
                        </h4>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${statusBadgeStyle}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Row 2: Numbers, Party Size, and Phone */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-cyan-500/15">
                    {/* Party Count */}
                    <div className="flex items-center gap-1.5 text-cyan-200">
                      <span className="text-[11px] text-cyan-300/70">{t.rsvps.partySize}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-950/90 text-cyan-200 font-bold border border-cyan-500/30 font-mono">
                        <Users className="w-3 h-3 text-cyan-400" />
                        {item.guestsCount} {item.guestsCount > 1 ? t.rsvps.guestsPlural : t.rsvps.guestSingular}
                      </span>
                    </div>

                    {/* Registration Date */}
                    <div className="flex items-center gap-1 text-[10px] text-cyan-300/60 font-mono shrink-0">
                      <Calendar className="w-3 h-3 text-cyan-400/80" />
                      <span>{formatDateTime(item.timestamp, lang)}</span>
                    </div>
                  </div>

                  {/* Row 3: Phone & Quick Actions (WhatsApp + Call) */}
                  {item.phone && (
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/60 border border-cyan-500/15">
                      <div className="text-xs font-mono text-cyan-200 truncate">
                        <span className="text-cyan-300/60 text-[11px] mr-1">{t.rsvps.phoneLabel}</span>
                        <strong className="text-white">{item.phone}</strong>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 no-print">
                        {/* WhatsApp Button */}
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 active:scale-95 transition"
                          title={t.rsvps.whatsappBtn}
                        >
                          <span>💬</span>
                          <span>{t.rsvps.whatsappBtn}</span>
                        </a>

                        {/* Call Button */}
                        <a
                          href={`tel:${item.phone}`}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-200 border border-cyan-400/40 active:scale-95 transition"
                          title={t.rsvps.callBtn}
                        >
                          <Phone className="w-3 h-3 text-cyan-300" />
                          <span>{t.rsvps.callBtn}</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Row 4: Note / Message if present */}
                  {item.message && (
                    <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/15 text-xs text-cyan-100/90 leading-relaxed break-words">
                      <span className="text-pink-300/80 font-semibold block text-[11px] mb-0.5 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-pink-400" />
                        {t.rsvps.noteLabel}
                      </span>
                      <span>"{item.message}"</span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
};
