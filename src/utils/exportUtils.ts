import { RSVPItem, WishItem, Language } from '../types';

export function formatDateTime(isoString: string, lang: Language): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatFullDate(isoString: string, lang: Language): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function getCleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '20' + cleaned.substring(1);
  } else if (cleaned.startsWith('05') && cleaned.length === 10) {
    cleaned = '966' + cleaned.substring(1);
  }
  return cleaned.replace(/^\+/, '');
}

export function getWhatsAppUrl(phone: string, guestName: string, lang: Language): string {
  const cleanPhone = getCleanPhoneNumber(phone);
  if (!cleanPhone) return '';
  const greeting = lang === 'ar'
    ? `مرحباً ${guestName} 🧜‍♀️✨ يسعدنا تواصلكم بخصوص حفل عيد ميلاد لينا العاشر! 🐚👑`
    : `Hello ${guestName}! 🧜‍♀️✨ Reaching out regarding Lina's 10th Birthday celebration! 🐚👑`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`;
}

export function exportRSVPsToCSV(rsvps: RSVPItem[], lang: Language) {
  const isAr = lang === 'ar';
  const headers = isAr
    ? ['المعرف', 'تاريخ التسجيل', 'اسم الضيف', 'الحالة', 'عدد الأفراد', 'رقم الهاتف', 'الرسالة / الملاحظة']
    : ['ID', 'Date Submitted', 'Guest Name', 'Status', 'Party Size', 'Phone Number', 'Note / Message'];

  const rows = rsvps.map((item, idx) => [
    `"${item.id || idx + 1}"`,
    `"${formatDateTime(item.timestamp, lang)}"`,
    `"${(item.name || '').replace(/"/g, '""')}"`,
    `"${(item.status || '').replace(/"/g, '""')}"`,
    `"${item.guestsCount || 1}"`,
    `"${(item.phone || '').replace(/"/g, '""')}"`,
    `"${(item.message || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `Lina-10th-Birthday-RSVP-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportWishesToCSV(wishes: WishItem[], lang: Language) {
  const isAr = lang === 'ar';
  const headers = isAr
    ? ['المعرف', 'تاريخ الإرسال', 'اسم المهنئ', 'الأمنية / التهنئة']
    : ['ID', 'Date Submitted', 'Author', 'Wish Message'];

  const rows = wishes.map((item, idx) => [
    `"${item.id || idx + 1}"`,
    `"${formatDateTime(item.timestamp, lang)}"`,
    `"${(item.author || '').replace(/"/g, '""')}"`,
    `"${(item.message || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `Lina-10th-Birthday-Wishes-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerPrint() {
  window.print();
}
