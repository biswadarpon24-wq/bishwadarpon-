# বিশ্ব দর্পণ (Bishwa Darpon) — Deployment, Operations & Integration Guide

## 1. Architecture Overview
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 (Vite)
- **Backend**: Express (`server.ts`) with Server-Side Open Graph / JSON-LD Metadata Injection, XML & News Sitemaps, Role-Based Access Control (RBAC), Rate Limiting, and Multipart Media Upload
- **Active Runtime Database**: Persistent SQLite (`data/bishwa_darpon.db` via Node 22 built-in `node:sqlite`) — zero external credentials required to run immediately.
- **PostgreSQL / Supabase Migration Ready**: Complete relational migration script included in `supabase/migrations/001_initial_schema.sql` plus one-click JSON export in `/admin` -> Settings -> Database Backup.

---

## 2. First-Time Super Admin Setup (No Hardcoded Passwords)
1. Start the server (`npm run dev` or `npm start`).
2. Visit `/admin`.
3. Because no Super Admin exists on a fresh database, the secure **First-Time Super Admin Setup** screen appears automatically.
4. Enter your Name, Email, and a strong Password (min 8 characters). Passwords are hashed using `crypto.scryptSync` with a random 16-byte per-user salt and verified with `crypto.timingSafeEqual`.
5. Once created, you can invite additional **Admins**, **Editors**, and **Reporters** under **রিপোর্টার ও ব্যবহারকারী**.

---

## 3. Adsterra Advertisement Integration
1. Log into `/admin` -> **Adsterra বিজ্ঞাপন**.
2. Select any format or placement:
   - `global_popunder` (Popunder)
   - `global_social_bar` (Social Bar)
   - Banner positions: `header_banner`, `homepage_banner`, `between_sections`, `article_top`, `article_middle`, `article_bottom`, `sidebar_banner`, `footer_banner`
3. Paste the `<script>` tag provided by your Adsterra Publisher Dashboard, set Device (`all`, `desktop`, `mobile`) and Page Scope (`all`, `homepage`, `article`, `category`), enable the slot, and click **সংরক্ষণ করুন**.
4. Ads are centrally deduplicated, isolated from `/admin`, and only injected when enabled.

---

## 4. Radio Bishwa Darpon (Live Icecast / SHOUTcast & Recorded Bulletins)
1. Open `/admin` -> **রেডিও সংবাদ**.
2. For **Live Broadcasting**, paste a valid Icecast, SHOUTcast, or HTTPS MP3/AAC stream URL into **লাইভ স্ট্রিম URL** and toggle **লাইভ স্ট্যাটাস সক্রিয়**.
3. For **Recorded News Bulletins**, upload MP3/WAV/OGG audio files or paste audio URLs into the **রেকর্ডেড অডিও সংবাদ প্লেলিস্ট** manager.
4. The floating radio player persists across all public pages while keeping mobile sticky height compact.

---

## 5. Facebook Open Graph & Social Sharing Verification
`server.ts` dynamically injects `og:title`, `og:description`, `og:image`, `og:url`, `og:type="article"`, `twitter:card`, and Schema.org `NewsArticle` + `BreadcrumbList` JSON-LD on every `/news/:slug` request so social crawlers read article metadata directly from the server response.

### Testing with Facebook Sharing Debugger:
1. Ensure your deployment URL (`APP_URL`) is publicly reachable over HTTPS.
2. Open **Facebook Sharing Debugger**: `https://developers.facebook.com/tools/debug/`
3. Paste any article URL, e.g., `https://your-domain.com/news/dhaka-metro-rail-expansion-urban-transit-milestone`.
4. Click **Debug**, then **Scrape Again** to verify the Bengali headline, summary, and 16:9 featured image preview appear cleanly.

---

## 6. Push Notifications (OneSignal / Firebase Cloud Messaging)
- **Built-in Notification Center & Browser Alerts**: Works immediately out-of-the-box via `/api/notifications/subscribe` and `/admin` -> **নোটিফিকেশন**.
- **External OneSignal / FCM**: Enter your `OneSignal App ID` or `FCM VAPID Key` under `/admin` -> **হোমপেজ ও সেটিংস** when connecting an external push provider.

---

## 7. Production Deployment, Safe Updates & Backup
1. **Environment Variables** (`.env`):
   - `PORT=3000`
   - `NODE_ENV=production`
   - `APP_URL=https://your-production-domain.com`
2. **Build & Start**:
   ```bash
   npm install
   npm run build
   npm start
   ```
3. **Preserving Data During Updates**:
   - Store `data/bishwa_darpon.db` and `public/uploads/` on a persistent volume/disk outside ephemeral build directories.
   - Never delete `data/bishwa_darpon.db` during code deployments.
   - Before major upgrades, download a full JSON snapshot via `/admin` -> **হোমপেজ ও সেটিংস** -> **ডাটাবেস ব্যাকআপ (JSON)**.
4. **Migrating to Dedicated VPS or Cloud / Supabase**:
   - Use `supabase/migrations/001_initial_schema.sql` to initialize PostgreSQL tables on Supabase/RDS/VPS, and import your JSON backup export or migrate `public/uploads/` to S3/R2/Supabase Storage.
