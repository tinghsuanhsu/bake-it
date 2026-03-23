// ─── Pure utility functions ────────────────────────────────────────────────────
// No imports from ./constants — avoids circular dependency that causes
// "cannot access before initialization" in the bundled output.

// ── ID / formatting ────────────────────────────────────────────────────────────
export const uid     = () => Math.random().toString(36).slice(2, 9);
export const fmt2    = n  => String(n).padStart(2, '0');
export const bkPct   = (g, base) => base ? ((g / base) * 100).toFixed(1) : '—';
export const timeStr = ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const fmtTime = s => {
  if (s <= 0) return '0:00';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${h}:${fmt2(m)}:${fmt2(sec)}` : `${m}:${fmt2(sec)}`;
};

export const fmtDur = min => {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

// ── datetime-local helpers ─────────────────────────────────────────────────────
export const toDateTimeLocal = ts => {
  if (!ts) return '';
  const d = new Date(ts);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const fromDateTimeLocal = val => (val ? new Date(val).getTime() : null);

// ── Image compression ─────────────────────────────────────────────────────────
export const compressImage = (file, maxPx = 1200, quality = 0.75) =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxPx || h > maxPx) {
          if (w > h) { h = Math.round(h * maxPx / w); w = maxPx; }
          else       { w = Math.round(w * maxPx / h); h = maxPx; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

// ── makeRecipe — inlines DEFAULT_STEPS and STEP_COLORS to avoid circular import ──
const _STEP_COLORS = ['#3A7A58','#5E9E6A','#5C5C5C','#606c38','#8A8A8A','#283618','#787878','#4A6628','#A0A0A0','#7A8A48'];
const _DEFAULT_STEPS = [
  { id:'starter_peak', name:'Starter Peak',       duration:480 },
  { id:'make_levain',  name:'Make Levain',        duration:20  },
  { id:'autolyse',     name:'Autolyse',           duration:30  },
  { id:'levain_mix',   name:'Levain + Mix',       duration:20  },
  { id:'bulk',         name:'Bulk Ferment',       duration:240, sfCount:5 },
  { id:'divide',       name:'Divide & Pre-shape', duration:30  },
  { id:'shape',        name:'Pre-shape',          duration:15  },
  { id:'proof',        name:'Shape',              duration:60  },
  { id:'retard',       name:'Retard',             duration:720 },
  { id:'bake',         name:'Bake',               duration:45  },
];

export const makeRecipe = () => ({
  id: uid(),
  name: 'New Recipe',
  loaves: '2', loafG: '900', ddt: '26',
  ingredients: [
    { id: uid(), type: 'flour', flourId: 'f2',  label: "White Baker's Flour", grams: '1000' },
    { id: uid(), type: 'other', flourId: null,   label: 'Water',               grams: '750'  },
    { id: uid(), type: 'other', flourId: null,   label: 'Salt',                grams: '20'   },
    { id: uid(), type: 'other', flourId: null,   label: 'Levain',              grams: '200'  },
  ],
  levain: { flour: '100', water: '100', starter: '20', duration: '12' },
  levainRating: 0, levainNotes: '',
  steps: _DEFAULT_STEPS.map((s, i) => ({ sfCount: 0, ...s, durationMin: s.duration, color: _STEP_COLORS[i] })),
  autolyseEnabled: true,
  stepUnit: Object.fromEntries(_DEFAULT_STEPS.map(s => [s.id, 'min'])),
  notes: '',
  tempUnit: 'C',
});

// ── Reorder helper (immutable) ────────────────────────────────────────────────
export const reorder = (arr, from, to) => {
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};
