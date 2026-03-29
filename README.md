# KVAD — প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল

বাংলাদেশের অনলাইন ফ্যাশন শপ। Next.js 15 + Supabase দিয়ে তৈরি।

## ফিচার
- 🛍️ পণ্য লিস্টিং, ফিল্টার, সার্চ
- 🛒 কার্ট ও উইশলিস্ট (localStorage)
- 🔐 Supabase Auth (Email + Google)
- 📦 অর্ডার ম্যানেজমেন্ট
- 🔔 রিয়েল-টাইম নোটিফিকেশন
- 🌙 Dark / Light Mode
- 🏬 Multi-seller Shop Request
- ⚙️ Admin Dashboard

## সেটআপ

### ১. Clone করুন
```bash
git clone https://github.com/Abdullah3580/KVAD.git
cd KVAD
```

### ২. Environment Variables
```bash
cp .env.example .env.local
```
`.env.local` ফাইলে Supabase URL ও Anon Key দিন:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### ৩. Supabase Database Setup
Supabase SQL Editor এ `MIGRATION.sql` রান করুন।

### ৪. Install ও Run
```bash
npm install
npm run dev
```

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS + CSS Variables
- **Language**: TypeScript

## Deploy
Vercel এ deploy করতে:
1. GitHub এ push করুন
2. [vercel.com](https://vercel.com) এ import করুন
3. Environment variables যোগ করুন
