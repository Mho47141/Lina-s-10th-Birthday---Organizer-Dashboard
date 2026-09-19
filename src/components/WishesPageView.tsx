import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  FileText, 
  FileSpreadsheet, 
  Calendar, 
  Search, 
  X, 
  Copy, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { WishItem, Language } from '../types';
import { translations } from '../utils/translations';
import { formatDateTime, exportWishesToCSV } from '../utils/exportUtils';

interface WishesPageViewProps {
  wishes: WishItem[];
  lang: Language;
}

export const WishesPageView: React.FC<WishesPageViewProps> = ({
  wishes,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const t = translations[lang];

  const filteredWishes = useMemo(() => {
    if (!searchQuery.trim()) return wishes;
    const q = searchQuery.toLowerCase().trim();
    return wishes.filter(w => 
      w.author.toLowerCase().includes(q) || 
      w.message.toLowerCase().includes(q)
    );
  }, [wishes, searchQuery]);

  const handleSavePDF = () => {
    window.print();
  };

  const handleSaveExcel = () => {
    exportWishesToCSV(wishes, lang);
  };

  const handleCopyWish = (wish: WishItem) => {
    navigator.clipboard.writeText(`"${wish.message}" - ${wish.author}`);
    setCopiedId(wish.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-3 sm:px-4 pb-16 overflow-x-hidden">
      
      {/* 1. TOTAL WISHES COUNT CARD (عدد الامنيات) */}
      <section className="glass-panel rounded-2xl p-4 mb-3 border-pink-500/30" aria-label="Wishes Count Summary">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-pink-300 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40" />
              <span>{t.wishes.totalWishesCount}</span>
            </span>
            <p className="text-[11px] text-cyan-200/70 mt-0.5 truncate">
              {t.wishes.wishesSubtitle}
            </p>
          </div>

          <div className="flex-shrink-0 text-center bg-pink-950/70 px-4 py-2 rounded-2xl border border-pink-500/40 shadow-inner">
            <span className="text-3xl font-black text-pink-100 font-mono leading-none block">
              {wishes.length}
            </span>
            <span className="text-[10px] text-pink-300/80 font-bold block mt-0.5">
              {lang === 'ar' ? 'أمنية' : 'wishes'}
            </span>
          </div>
        </div>
      </section>

      {/* 2. BUTTONS: SAVE PDF & SAVE EXCEL (تحتيه زرار حفظ ال بي دي اف زالاكسيل بردو) */}
      <div className="grid grid-cols-2 gap-2 mb-3 no-print">
        {/* Save PDF */}
        <button
          id="btn-wishes-pdf"
          onClick={handleSavePDF}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300 text-slate-950 shadow-lg shadow-pink-500/20 active:scale-[0.98] transition cursor-pointer"
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>{t.wishes.savePdf}</span>
        </button>

        {/* Save Excel */}
        <button
          id="btn-wishes-excel"
          onClick={handleSaveExcel}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>{t.wishes.saveExcel}</span>
        </button>
      </div>

      {/* 3. FULL DETAILS WITHOUT HORIZONTAL SCROLL (وتحتيهم التفاصيل بردو تكون ظاهره من غير سكرول يمين وشكال) */}
      <section className="space-y-3" aria-label="Wishes List">
        
        {/* Search Bar */}
        <div className="glass-panel rounded-2xl p-2.5 no-print">
          <div className="relative">
            <Search className={`w-3.5 h-3.5 text-pink-400 absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.wishes.searchPlaceholder}
              className={`w-full py-2 rounded-xl bg-slate-900/80 border border-pink-500/30 text-white placeholder-pink-300/40 text-xs focus:outline-none focus:border-pink-400 transition ${
                lang === 'ar' ? 'pr-8 pl-7' : 'pl-8 pr-7'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 text-pink-400 hover:text-white p-1 ${
                  lang === 'ar' ? 'left-1.5' : 'right-1.5'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-bold text-pink-200 flex items-center gap-1.5">
            <span>💌</span>
            <span>{t.wishes.detailsHeading}</span>
          </h3>
          <span className="text-[11px] text-pink-400/80 font-mono">
            {filteredWishes.length} {lang === 'ar' ? 'أمنية' : 'wishes'}
          </span>
        </div>

        {/* Empty State */}
        {filteredWishes.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center text-pink-300/70">
            <div className="text-2xl mb-2">🧜‍♀️</div>
            <p className="text-xs font-semibold text-pink-100">{t.wishes.noWishes}</p>
          </div>
        ) : (
          /* Cards List - Zero Horizontal Scroll */
          <div className="space-y-2.5">
            {filteredWishes.map((wish, idx) => {
              const isCopied = copiedId === wish.id;

              return (
                <div
                  key={wish.id || idx}
                  className="glass-panel rounded-2xl p-4 border border-pink-500/25 shadow-md space-y-2.5 transition-all hover:border-pink-400/40"
                >
                  {/* Top: Sender Name, Avatar & Timestamp */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500/30 to-purple-500/30 border border-pink-400/30 flex items-center justify-center text-xl shrink-0 shadow-inner">
                        {wish.avatar || '🧜‍♀️'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                          {wish.author}
                        </h4>
                        <span className="text-[10px] text-cyan-300/60 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-pink-400" />
                          {formatDateTime(wish.timestamp, lang)}
                        </span>
                      </div>
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyWish(wish)}
                      className="no-print flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/60 hover:bg-slate-800 text-pink-200 border border-pink-500/25 active:scale-95 transition shrink-0 cursor-pointer"
                      title={t.wishes.copyWish}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 text-[10px]">{t.wishes.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-pink-400" />
                          <span className="text-[10px]">{t.wishes.copyWish}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Message Body (Word wrapped, clean, perfectly readable) */}
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-pink-500/15 text-xs text-pink-50 leading-relaxed break-words relative">
                    <span className="text-xl text-pink-400/30 font-serif leading-none select-none absolute top-1 right-2">
                      “
                    </span>
                    <p className="whitespace-pre-wrap relative z-10 pt-0.5">
                      {wish.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
};
