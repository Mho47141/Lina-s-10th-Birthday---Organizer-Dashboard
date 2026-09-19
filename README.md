# 🧜‍♀️ Lina's 10th Birthday - Organizer Dashboard
> لوحة تحكم وإدارة مخصصة لمنظمي حفل عيد ميلاد "لينا" العاشر (ثيم حورية البحر الملكي وأعماق المحيط).

A dedicated, mobile-optimized live organizer dashboard for **Lina's 10th Birthday Under the Sea celebration**. It connects directly and in real-time to a Google Sheets webhook to manage RSVP attendance responses and wishes.

---

## ✨ Features / المميزات

- 🌊 **Deep Ocean Royal Mermaid Aesthetic**: Deep Ocean Blue (`#021326`), luminous cyan highlights, pink accents, and elegant glassmorphism cards.
- 📱 **Mobile-First & Zero Horizontal Scroll**: Cleanly formatted stacked cards designed specifically for mobile screens without any horizontal scrolling.
- 🔄 **Live Google Sheets Synchronization**: Connected to Google Apps Script webhook with automatic refresh every 60 seconds and instant manual refresh.
- 🌐 **Bilingual (English & Arabic)**: English by default with instant toggle to Arabic (with full RTL support).
- 📊 **Page 1: Attendees (RSVP) Page**:
  - Live attendance chart with numbers and percentage breakdowns.
  - Quick **Save PDF 📄** and **Export Excel 📊** buttons.
  - Search and filter by status (All, Confirmed Attending, Maybe, Declined).
  - Guest cards with party size, phone number, notes, and 1-tap WhatsApp and Call buttons.
- 💌 **Page 2: Wishes Guestbook Page**:
  - Prominent total wishes counter.
  - **Save PDF 📄** and **Export Excel 📊** buttons.
  - Search in greetings, copy wish message button.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS (v4)
- **Icons**: Lucide React
- **Integration**: Google Apps Script Webhook API

---

## 🚀 Getting Started Locally

1. Clone or export this repository to your local machine:
   ```bash
   git clone <your-repo-url>
   cd lina-10th-birthday-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
