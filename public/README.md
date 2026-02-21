# Bake it — Next.js + Neon

Sourdough baking tracker with persistent storage via PostgreSQL (Neon).

## Project structure

```
bake-it/
├── app/
│   ├── layout.js              ← HTML shell, fonts
│   ├── page.js                ← root page
│   ├── ClientApp.jsx          ← main React app (client component)
│   └── api/
│       ├── db-init/route.js   ← run once to create tables
│       ├── recipes/
│       │   ├── route.js       ← GET all, POST create/update
│       │   └── [id]/route.js  ← PUT update, DELETE
│       ├── logs/
│       │   ├── route.js       ← GET all, POST save session
│       │   └── [id]/route.js  ← DELETE
│       └── photos/route.js    ← POST upload, DELETE
├── lib/
│   └── db.js                  ← Neon connection helper
├── public/
│   ├── manifest.json          ← PWA manifest
│   ├── sw.js                  ← service worker
│   └── icons/
├── .env.local                 ← YOUR secrets (never commit)
├── .gitignore
├── next.config.js
└── package.json
```

## Deploy to Vercel (recommended)

### 1. Fill in your database credentials

Open `.env.local` and paste your Neon connection string:
```
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST/neondb?sslmode=require
```

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/bake-it.git
git push -u origin main
```

### 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. In **Environment Variables**, add:
   - Key: `DATABASE_URL`
   - Value: your Neon connection string (same as `.env.local`)
4. Click **Deploy**

### 4. Initialise the database

Once deployed, visit this URL once in your browser to create the tables:
```
https://your-app.vercel.app/api/db-init
```
You should see: `{"ok":true,"message":"Tables created successfully"}`

### 5. Install on iPhone

1. Open your Vercel URL in **Safari**
2. Tap Share → **Add to Home Screen**
3. Done — runs fullscreen, offline-capable

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Don't forget to set `DATABASE_URL` in `.env.local` first.

---

## Database schema

**recipes** — saved recipes with full formula data  
**bake_logs** — completed bake sessions with notes  
**photos** — base64 photos linked to bake sessions  

All stored in your Neon free tier (which handles this workload easily).
