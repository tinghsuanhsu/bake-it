# Bake it — PWA

A sourdough baking tracker. Works offline, installable on iPhone and Android.

## Files

```
bake-it-pwa/
├── index.html       ← entry point
├── App.jsx          ← main React app
├── manifest.json    ← PWA manifest
├── sw.js            ← service worker (offline support)
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## Deploy (free options)

### Option A — Netlify (easiest, drag & drop)
1. Go to https://netlify.com → sign up free
2. Drag the entire `bake-it-pwa` folder onto the Netlify dashboard
3. Done — you get a live HTTPS URL instantly
4. On iPhone: open the URL in Safari → Share → Add to Home Screen

### Option B — GitHub Pages
1. Create a GitHub repo, upload all files
2. Settings → Pages → deploy from main branch
3. Visit `https://yourusername.github.io/repo-name`

### Option C — Vercel
1. `npm i -g vercel` then `vercel` inside the folder
2. Follow prompts — live in ~30 seconds

## iPhone install
1. Open the live URL in **Safari** (not Chrome)
2. Tap the **Share** button (box with arrow)
3. Tap **Add to Home Screen**
4. Tap **Add**

The app will appear on your home screen and run fullscreen, offline.

## Notes
- No build step needed — uses Babel in-browser to compile JSX
- For production performance, consider bundling with Vite or Parcel
- Data is stored in React state (resets on close) — add localStorage for persistence
