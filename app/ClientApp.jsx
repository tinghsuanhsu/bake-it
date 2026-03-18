'use client';
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Module imports ────────────────────────────────────────────────────────────
import { VIEWS, STEP_COLORS, DEFAULT_STEPS, STARTER_DDT_C, FLOUR_DB } from "./constants";
import { uid, fmtTime, fmtDur, bkPct, timeStr, toDateTimeLocal, fromDateTimeLocal,
         compressImage, makeRecipe, reorder } from "./utils";
import { useDb } from "./hooks/useDb";
import { useDrag } from "./hooks/useDrag";
import { Card, Lbl, SecH, Inp, Stat, Badge, Stars, Ring, DragHandle } from "./components/ui";

// ─── Audio helpers ─────────────────────────────────────────────────────────────
function playAlarm() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const beep = (freq, start, dur) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.4, start + 0.02);
      g.gain.linearRampToValueAtTime(0, start + dur);
      o.start(start); o.stop(start + dur + 0.05);
    };
    beep(880,  ctx.currentTime,        0.18);
    beep(880,  ctx.currentTime + 0.22, 0.18);
    beep(1100, ctx.currentTime + 0.44, 0.28);
  } catch(e) {}
}

function fireNotification(title, body) {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icons/icon-192.png', silent: false });
    }
  } catch(e) {}
}


// ─── Starter recipe definitions (module-level — stable across renders) ────────
const mkStarterSteps = () => DEFAULT_STEPS.map((s, i) => ({
  sfCount: 0, ...s, durationMin: s.duration, color: STEP_COLORS[i],
}));

const STARTER_RECIPES = [
  {...makeRecipe(),id:"starter-1",name:"Classic Country Loaf",loaves:"2",loafG:"900",ddt:"26",tempUnit:"C",steps:mkStarterSteps(),ingredients:[{id:"s1-f1",type:"flour",flourId:"f2",label:"White Baker's Flour",grams:"900"},{id:"s1-f2",type:"flour",flourId:"f11",label:"Wholemeal Flour",grams:"100"},{id:"s1-w",type:"other",flourId:null,label:"Water",grams:"750"},{id:"s1-s",type:"other",flourId:null,label:"Salt",grams:"20"},{id:"s1-l",type:"other",flourId:null,label:"Levain",grams:"200"}],notes:"A reliable everyday loaf. 75% hydration, 10% wholemeal for flavour and crust colour. Retard overnight in the fridge for deeper sour notes."},
  {...makeRecipe(),id:"starter-2",name:"Tartine-Style 78%",loaves:"1",loafG:"950",ddt:"27",tempUnit:"C",steps:mkStarterSteps(),ingredients:[{id:"s2-f1",type:"flour",flourId:"f2",label:"White Baker's Flour",grams:"900"},{id:"s2-f2",type:"flour",flourId:"f11",label:"Wholemeal Flour",grams:"100"},{id:"s2-w",type:"other",flourId:null,label:"Water",grams:"780"},{id:"s2-s",type:"other",flourId:null,label:"Salt",grams:"20"},{id:"s2-l",type:"other",flourId:null,label:"Levain",grams:"200"}],notes:"Based on the Tartine country bread. High hydration produces an open, irregular crumb with a glossy crust. Requires confident shaping."},
  {...makeRecipe(),id:"starter-3",name:"Light Rye Sourdough",loaves:"2",loafG:"800",ddt:"24",tempUnit:"C",steps:mkStarterSteps(),ingredients:[{id:"s3-f1",type:"flour",flourId:"f2",label:"White Baker's Flour",grams:"800"},{id:"s3-f2",type:"flour",flourId:"f15",label:"Light Rye Flour",grams:"200"},{id:"s3-w",type:"other",flourId:null,label:"Water",grams:"720"},{id:"s3-s",type:"other",flourId:null,label:"Salt",grams:"20"},{id:"s3-l",type:"other",flourId:null,label:"Levain",grams:"220"}],notes:"20% rye adds complexity and speeds fermentation. Slightly stickier dough — wet hands for folding. Excellent with aged cheddar."},
  {...makeRecipe(),id:"starter-4",name:"Whole Wheat 50%",loaves:"2",loafG:"850",ddt:"25",tempUnit:"C",steps:mkStarterSteps(),ingredients:[{id:"s4-f1",type:"flour",flourId:"f2",label:"White Baker's Flour",grams:"500"},{id:"s4-f2",type:"flour",flourId:"f11",label:"Wholemeal Flour",grams:"500"},{id:"s4-w",type:"other",flourId:null,label:"Water",grams:"750"},{id:"s4-s",type:"other",flourId:null,label:"Salt",grams:"20"},{id:"s4-l",type:"other",flourId:null,label:"Levain",grams:"200"}],notes:"Equal parts wholemeal and white. Nutty, wheaty flavour with a tight, even crumb. Autolyse is important — wholemeal absorbs slowly."},
  {...makeRecipe(),id:"starter-5",name:"Spelt & Honey",loaves:"1",loafG:"900",ddt:"24",tempUnit:"C",steps:mkStarterSteps(),ingredients:[{id:"s5-f1",type:"flour",flourId:"f2",label:"White Baker's Flour",grams:"700"},{id:"s5-f2",type:"flour",flourId:"f18",label:"Spelt Flour",grams:"300"},{id:"s5-w",type:"other",flourId:null,label:"Water",grams:"720"},{id:"s5-s",type:"other",flourId:null,label:"Salt",grams:"18"},{id:"s5-l",type:"other",flourId:null,label:"Levain",grams:"180"},{id:"s5-h",type:"other",flourId:null,label:"Honey",grams:"20"}],notes:"30% spelt gives a slightly sweet, nutty loaf with a soft crumb. Spelt ferments fast — watch your dough carefully in warm weather."},
];

    fetch('/api/db-init')
      .then(() => Promise.all([
        fetch('/api/recipes').then(r => r.json()),
        fetch('/api/logs').then(r => r.json()),
];

// Steps to prepend if missing from DB-stored starter recipes (migration)
const LEGACY_PREPEND_STEPS = [
  { id:"starter_peak", name:"Starter Peak", duration:480, durationMin:480, sfCount:0, color:STEP_COLORS[0] },
  { id:"make_levain",  name:"Make Levain",  duration:20,  durationMin:20,  sfCount:0, color:STEP_COLORS[1] },
];

/* ═══════════════════════════════════════════════════════
   ROOT APP COMPONENT
   State is kept here because all views share bake/recipe
   data. Logic is extracted into hooks where possible.
═══════════════════════════════════════════════════════ */
export default function App() {

  // ── Navigation ──────────────────────────────────────────────────────────────
  const [view, setView] = useState(() => {
    try {
      const saved = localStorage.getItem('bakeIt_view');
      return saved && Object.values(VIEWS).includes(saved) ? saved : VIEWS.RECIPES;
    } catch { return VIEWS.RECIPES; }
  });

  // ── Recipe state ────────────────────────────────────────────────────────────
  const [recipes,    setRecipes]  = useState([]);
  const [editId,     setEditId]   = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // ── Active bake state ───────────────────────────────────────────────────────
  const [bakeStarted,   setBakeStarted]  = useState(false);
  const [bakeStartTime, setBST]          = useState(null);
  const [activeStep,    setActiveStep]   = useState(null);
  const [stepStartTimes,setSST]          = useState({});
  const [sfDone,        setSfDone]       = useState({});
  const [tick,          setTick]         = useState(0);
  const [stepNotes,     setStepNotes]    = useState({});
  const [stepPhotos,    setStepPhotos]   = useState({});
  const [sessionNotes,  setSessionNotes] = useState('');
  const [editingStep,   setEditingStep]  = useState(null);
  const [steamDone,     setSteamDone]    = useState(false);
  const [foldNotes,     setFoldNotes]    = useState({});
  const [foldPhotos,    setFoldPhotos]   = useState({});
  const [foldPhotoTarget, setFoldPhotoTarget] = useState(null);
  const [expandedFold,  setExpandedFold] = useState(null);

  // ── Log state ───────────────────────────────────────────────────────────────
  const [savedLogs,   setSavedLogs]  = useState([]);
  const [viewingLog,  setViewingLog] = useState(null);
  const [swipedLogId, setSwipedLogId] = useState(null);
  const [logSearch,   setLogSearch]  = useState('');

  // ── Photo handlers ──────────────────────────────────────────────────────────
  const [reviewPhotoHandler, setReviewPhotoHandler] = useState(null);
  const [photoTarget,        setPhotoTarget]         = useState(null);

  // ── Recipe scan state ───────────────────────────────────────────────────────
  const [scanLoading, setScanLoading] = useState(false);

  // ── Log step drag state ─────────────────────────────────────────────────────
  const [logDragStep,     setLogDragStep]     = useState(null);
  const [logDragOverStep, setLogDragOverStep] = useState(null);
  const logStepDragRef         = useRef(null);
  const logStepDragOverRef     = useRef(null);
  const logStepLongPressTimer  = useRef(null);
  const logStepsListRef        = useRef(null);

  // ── Ingredients state ───────────────────────────────────────────────────────
  const [flourSearch,   setFlourSearch]  = useState('');
  const [flourFilter,   setFlourFilter]  = useState('All');
  const [recipeSearch,  setRecipeSearch] = useState('');
  const [expandedFlour, setExpandedFlour] = useState(null);
  const [userFlours,    setUserFlours]   = useState([]);
  const [showAddFlour,  setShowAddFlour] = useState(false);
  const [newFlour, setNewFlour] = useState({
    name:'', brand:'', type:'Custom', protein:'', where:'', description:'', tips:'',
  });

  // ── DB loading state ────────────────────────────────────────────────────────
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError,   setDbError]   = useState(null);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const alarmFiredRef   = useRef({});
  const fileRef         = useRef(null);
  const scanFileRef     = useRef(null);
  const scrollRef       = useRef(null);
  const activeBakeSaveTimer = useRef(null);

  // ── DB hook ─────────────────────────────────────────────────────────────────
  const {
    saveRecipe, deleteRecipeDB, scheduleRecipeSave,
    saveBakeLog, deleteLogDB, scheduleLogSave,
    saveActiveBake, clearActiveBake, flushActiveBake,
  } = useDb();

  // ── Drag-to-reorder: recipe cards ──────────────────────────────────────────
  const recipeDrag = useDrag({
    items:     recipes,
    onReorder: (next, from, to) => {
      setRecipes(next);
      const lo = Math.min(from, to), hi = Math.max(from, to);
      next.slice(lo, hi + 1).forEach(r => scheduleRecipeSave(r));
    },
    getLabel: i => recipes[i]?.name ?? '',
  });

  // ── Drag-to-reorder: recipe editor steps ──────────────────────────────────
  const stepDrag = useDrag({
    items:     editId ? (recipes.find(r => r.id === editId)?.steps ?? []) : [],
    onReorder: (next) => updE(r => ({ ...r, steps: next })),
    getLabel:  i => (recipes.find(r => r.id === editId)?.steps ?? [])[i]?.name ?? '',
    getColor:  i => (recipes.find(r => r.id === editId)?.steps ?? [])[i]?.color,
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DB INIT — load recipes + logs, restore active bake
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const restoreBake = (raw, allRecipesLoaded) => {
      try {
        const b = JSON.parse(raw);
        const recipeExists = allRecipesLoaded.find(r => r.id === b.selectedId);
        if (!b.bakeStarted || !recipeExists) return false;
        setSelectedId(b.selectedId);
        setBakeStarted(true);
        setBST(b.bakeStartTime);
        setActiveStep(b.activeStep);
        setSST(b.stepStartTimes || {});
        setStepNotes(b.stepNotes || {});
        setSessionNotes(b.sessionNotes || '');
        setFoldNotes(b.foldNotes || {});
        setSteamDone(b.steamDone || false);
        if (b.sfDone) {
          const restored = {};
          Object.entries(b.sfDone).forEach(([k, v]) => {
            restored[k] = new Set(Array.isArray(v) ? v : []);
          });
          setSfDone(restored);
        }
        if (b.stepPhotos)  setStepPhotos(b.stepPhotos);
        if (b.foldPhotos)  setFoldPhotos(b.foldPhotos);
        setView(VIEWS.BAKE);
        return true;
      } catch { return false; }
    };

    fetch('/api/db-init')
      .then(() => Promise.all([
        fetch('/api/recipes').then(r => r.json()),
        fetch('/api/logs').then(r => r.json()),
      ]))
      .then(([recipeData, logData]) => {
        const dbRecipes = Array.isArray(recipeData) ? recipeData : [];
        const dbIds = new Set(dbRecipes.map(r => r.id));
        const starterIds = new Set(STARTER_RECIPES.map(s => s.id));

        // Seed any missing starter recipes
        const missingStarters = STARTER_RECIPES.filter(r => !dbIds.has(r.id));
        missingStarters.forEach(r => saveRecipe(r));

        // Migrate starter recipes: prepend missing steps, fix tempUnit
        const patchedDbRecipes = dbRecipes.map(r => {
          if (!starterIds.has(r.id)) return r; // user recipe — untouched
          let patched = { ...r };
          const stepIds = new Set((patched.steps || []).map(s => s.id));
          const missing = LEGACY_PREPEND_STEPS.filter(s => !stepIds.has(s.id));
          if (missing.length) patched = { ...patched, steps: [...missing, ...(patched.steps || [])] };
          if (!patched.tempUnit || patched.tempUnit === 'F') {
            patched = { ...patched, tempUnit: 'C', ddt: STARTER_DDT_C[r.id] || '26' };
          }
          if (missing.length || !r.tempUnit || r.tempUnit === 'F') saveRecipe(patched);
          return patched;
        });

        const allRecipesLoaded = dbRecipes.length > 0
          ? [...patchedDbRecipes, ...missingStarters]
          : STARTER_RECIPES;

        setRecipes(allRecipesLoaded);

        if (Array.isArray(logData) && logData.length > 0) {
          setSavedLogs(logData.filter(l => l.id !== '__active_bake__'));
        }

        // Restore active bake — localStorage first, then DB fallback
        let restored = false;
        try {
          const lsRaw = localStorage.getItem('bakeIt_activeBake');
          if (lsRaw) restored = restoreBake(lsRaw, allRecipesLoaded);
        } catch {}
        if (!restored) {
          const dbActive = logData?.find(l => l.id === '__active_bake__');
          if (dbActive?._activeBakeState) restoreBake(dbActive._activeBakeState, allRecipesLoaded);
        }

        setDbLoading(false);
      })
      .catch(err => { setDbError(err.message); setDbLoading(false); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist active bake state ────────────────────────────────────────────────
  useEffect(() => {
    if (!bakeStarted) {
      clearActiveBake();
      return;
    }
    const state = {
      bakeStarted, selectedId, bakeStartTime, activeStep,
      stepStartTimes, stepNotes, sessionNotes, foldNotes, steamDone,
      sfDone: Object.fromEntries(Object.entries(sfDone).map(([k, v]) => [k, [...v]])),
      stepPhotos, foldPhotos,
    };
    saveActiveBake(state);
  }, [bakeStarted, selectedId, bakeStartTime, activeStep, stepStartTimes, // eslint-disable-line
      stepNotes, sessionNotes, foldNotes, steamDone, sfDone, stepPhotos, foldPhotos]);

  // ── Flush to DB when app goes to background (reliable for 48hr bakes) ────────
  useEffect(() => {
    if (!bakeStarted) return;
    const onHide = () => {
      if (document.visibilityState !== 'hidden') return;
      const state = {
        bakeStarted: true, selectedId, bakeStartTime, activeStep,
        stepStartTimes, stepNotes, sessionNotes, foldNotes, steamDone,
        sfDone: Object.fromEntries(Object.entries(sfDone).map(([k, v]) => [k, [...v]])),
        stepPhotos, foldPhotos,
      };
      flushActiveBake(state);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [bakeStarted, selectedId, bakeStartTime, activeStep, stepStartTimes, // eslint-disable-line
      stepNotes, sessionNotes, foldNotes, steamDone, sfDone, stepPhotos, foldPhotos]);

  // ── Bake tick timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!bakeStarted) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [bakeStarted]);

  // ── Notification permission ──────────────────────────────────────────────────
  useEffect(() => {
    if (bakeStarted && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [bakeStarted]);

  // ── Step alarm ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!bakeStarted || activeStep == null || !bakeRecipe) return;
    if (alarmFiredRef.current[activeStep]) return;
    if (remaining(activeStep) === 0) {
      alarmFiredRef.current[activeStep] = true;
      playAlarm();
      fireNotification('Step complete', `${bakeRecipe.steps[activeStep]?.name || 'Step'} is done.`);
    }
  }, [tick, activeStep, bakeStarted]); // eslint-disable-line

  // ── Persist last view ────────────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem('bakeIt_view', view); } catch {}
  }, [view]);

  // ── Scroll to top on navigation ──────────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [view, editId, viewingLog]);

  // ─────────────────────────────────────────────────────────────────────────────
  // DERIVED STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const bakeRecipe = selectedId ? recipes.find(r => r.id === selectedId) : null;
  const editRecipe = editId     ? recipes.find(r => r.id === editId)     : null;
  const allFlours  = [...FLOUR_DB, ...userFlours];
  const flourTypes = ['All', ...new Set(allFlours.map(f => f.type))];
  const filteredFlours = allFlours.filter(f => {
    const typeMatch  = flourFilter === 'All' || f.type === flourFilter;
    const textMatch  = !flourSearch || [f.name, f.brand, f.type].some(
      x => x?.toLowerCase().includes(flourSearch.toLowerCase())
    );
    return typeMatch && textMatch;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // BAKE HELPERS
  // ─────────────────────────────────────────────────────────────────────────────
  const elapsed   = useCallback((idx) => {
    const st = stepStartTimes[idx];
    return st == null ? 0 : Math.floor((Date.now() - st) / 1000);
  }, [stepStartTimes, tick]); // eslint-disable-line

  const totalSec  = idx  => (bakeRecipe?.steps[idx]?.durationMin || 1) * 60;
  const prog      = idx  => Math.min(1, elapsed(idx) / totalSec(idx));
  const remaining = idx  => Math.max(0, totalSec(idx) - elapsed(idx));
  const sfIv      = idx  => {
    const s = bakeRecipe?.steps[idx];
    return s?.sfCount ? Math.floor((s.durationMin * 60) / (s.sfCount + 1)) : null;
  };
  const nextSfIn  = idx  => {
    const iv = sfIv(idx);
    if (!iv) return null;
    const done = sfDone[idx]?.size || 0;
    return Math.max(0, (done + 1) * iv - elapsed(idx));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const startBake = recipe => {
    const now = Date.now();
    alarmFiredRef.current = {};
    setSelectedId(recipe.id);
    setBakeStarted(true);
    setBST(now);
    setActiveStep(0);
    setSST({ 0: now });
    setStepNotes({});
    setStepPhotos({});
    setSfDone({});
    setView(VIEWS.BAKE);
  };

  const completeStep = idx => {
    const steps = bakeRecipe?.steps || [];
    const next  = idx + 1;
    const now   = Date.now();
    setActiveStep(next < steps.length ? next : null);
    if (next < steps.length) setSST(p => ({ ...p, [next]: now }));
  };

  const toggleSF = (si, n) => setSfDone(prev => {
    const s = new Set(prev[si] || []);
    s.has(n) ? s.delete(n) : s.add(n);
    return { ...prev, [si]: s };
  });

  const finishBake = () => {
    if (!bakeRecipe) return;
    const log = {
      id:             uid(),
      recipeName:     bakeRecipe.name,
      recipeId:       bakeRecipe.id,
      startTime:      bakeStartTime,
      endTime:        Date.now(),
      stepNotes:      { ...stepNotes },
      stepPhotos:     { ...stepPhotos },
      sessionNotes,
      foldNotes:      { ...foldNotes },
      foldPhotos:     { ...foldPhotos },
      autolyseEnabled: bakeRecipe.autolyseEnabled,
      ingredients:    bakeRecipe.ingredients,
      steps:          bakeRecipe.steps,
      loaves:         bakeRecipe.loaves,
      loafG:          bakeRecipe.loafG,
      rating:         0,
    };
    setSavedLogs(prev => [log, ...prev]);
    saveBakeLog(log);
    clearActiveBake();
    // Reset bake state
    setSelectedId(null);   setBakeStarted(false);  setBST(null);
    setActiveStep(null);   setSST({});              setSfDone({});
    setStepNotes({});      setStepPhotos({});       setSessionNotes('');
    setFoldNotes({});      setFoldPhotos({});       setExpandedFold(null);
    setSteamDone(false);   setView(VIEWS.LOG);
  };

  // ── Recipe CRUD ──────────────────────────────────────────────────────────────
  const upd = (id, fn) => setRecipes(rs => {
    const next    = rs.map(r => r.id === id ? fn(r) : r);
    const changed = next.find(r => r.id === id);
    if (changed) scheduleRecipeSave(changed);
    return next;
  });
  const updE      = fn => editId && upd(editId, fn);
  const addRecipe = () => {
    const r = makeRecipe();
    setRecipes(rs => [...rs, r]);
    saveRecipe(r);
    setEditId(r.id);
    setView(VIEWS.RECIPES);
  };

  // ── Photo handling ───────────────────────────────────────────────────────────
  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    compressImage(file).then(src => {
      if (reviewPhotoHandler) {
        reviewPhotoHandler(src);
        setReviewPhotoHandler(null);
      } else if (foldPhotoTarget != null) {
        setFoldPhotos(p => ({ ...p, [foldPhotoTarget]: src }));
        setFoldPhotoTarget(null);
      } else if (photoTarget != null) {
        setStepPhotos(p => ({ ...p, [photoTarget]: [...(p[photoTarget] || []), { src, ts: Date.now() }] }));
      }
    });
  };

  // ── Recipe photo scan ────────────────────────────────────────────────────────
  const scanRecipePhoto = async (base64src) => {
    setScanLoading(true);
    try {
      const base64 = base64src.replace(/^data:image\/\w+;base64,/, '');
      const res    = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-6',
          max_tokens: 1200,
          messages: [{
            role:    'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
              { type: 'text',  text: `Extract the sourdough recipe from this image. Return ONLY a JSON object, no markdown:
{
  "name": "recipe name",
  "loaves": "number as string",
  "loafG": "grams per loaf as string",
  "ddt": "desired dough temp in Celsius as string or 26",
  "notes": "description or yield notes",
  "ingredients": [{"label":"name","grams":"amount in grams as string","type":"flour or other"}],
  "steps": [{"name":"step name","durationMin":minutes as integer}]
}
Convert all amounts to grams, durations to minutes. If no recipe found return {"error":"Could not read recipe from image"}.` },
            ],
          }],
        }),
      });
      const data   = await res.json();
      const text   = (data.content?.[0]?.text || '').replace(/\`\`\`json|\`\`\`/g, '').trim();
      const parsed = JSON.parse(text);
      if (parsed.error) { alert(parsed.error); return; }

      const steps = (parsed.steps || []).map((s, i) => ({
        id: uid(), name: s.name, durationMin: s.durationMin || 30,
        sfCount: 0, color: STEP_COLORS[i % STEP_COLORS.length], custom: true,
      }));
      const ingredients = (parsed.ingredients || []).map(ing => ({
        id: uid(), type: ing.type || 'other', flourId: null,
        label: ing.label, grams: String(ing.grams || ''),
      }));

      updE(r => ({
        ...r,
        name:        parsed.name        || r.name,
        notes:       parsed.notes       || r.notes,
        loaves:      parsed.loaves      || r.loaves,
        loafG:       parsed.loafG       || r.loafG,
        ddt:         parsed.ddt         || r.ddt,
        tempUnit:    'C',
        ingredients: ingredients.length ? ingredients : r.ingredients,
        steps:       steps.length       ? steps       : r.steps,
        stepUnit:    Object.fromEntries((steps.length ? steps : r.steps).map(s => [s.id, 'min'])),
      }));
    } catch {
      alert('Could not extract recipe — try a clearer photo.');
    } finally {
      setScanLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TABS DEFINITION
  // ─────────────────────────────────────────────────────────────────────────────
  const TABS = [
    {v:VIEWS.RECIPES,    l:"Recipes", icon:<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="15" y1="13" x2="9" y2="13"/><line x1="15" y1="17" x2="9" y2="17"/><line x1="10" y1="9" x2="9" y2="9"/></svg>},
    {v:VIEWS.BAKE,       l:"Bake",    icon:<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-2 2.5-3 5-2 7.5 0 0-1.5-.5-1-2.5C7 9 5 11.5 5 14a7 7 0 0 0 14 0c0-4-4-8-7-12z"/><path d="M12 22c0 0-2-2-2-4s2-3 2-3 2 1 2 3-2 4-2 4z" strokeWidth="1.5" strokeOpacity="0.6"/></svg>},
    {v:VIEWS.LOG,        l:"Log",     icon:<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>},
    {v:VIEWS.INGREDIENTS,l:"Flours",  icon:<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="7" width="12" height="14" rx="2"/><rect x="5" y="4" width="14" height="4" rx="1.5"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="15" x2="12" y2="15"/></svg>},
  ];

  return (
    <>
    {dbLoading && (
      <div style={{position:"fixed",inset:0,background:"#283618",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,flexDirection:"column",gap:12}}>
        <div style={{width:56,height:56,borderRadius:14,border:"2px solid rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:28,fontWeight:700,color:"#FFFFFF",fontFamily:"'Open Sans',sans-serif",letterSpacing:"-0.03em",lineHeight:1}}>B</span>
        </div>
        <p style={{color:"rgba(255,255,255,0.6)",fontSize:14,fontFamily:"'Open Sans',sans-serif"}}>Loading your recipes…</p>
      </div>
    )}
    <div style={{minHeight:"100vh",background:"#F8F8F6",fontFamily:"'Open Sans', sans-serif",color:"#283618"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}
        input,textarea,button,select{font-family:inherit}
        input,textarea,select{transition:border-color 0.2s}
        input:focus,textarea:focus,select:focus{outline:none;border-bottom-color:#606c38!important;background:transparent!important}
        input::placeholder,textarea::placeholder{color:#ACACAC}
        input[type=number]::-webkit-inner-spin-button{opacity:0.4}
        select:focus{outline:none}
        button{border:none;cursor:pointer}
        button:active{opacity:0.75;transform:scale(0.97)}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#D8D8D4;border-radius:2px}
        select option{background:#FFFFFF;color:#283618}
        @keyframes su{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .su{animation:su 0.3s cubic-bezier(0.2,0,0,1) forwards}
        .pulse{animation:pulse 1.8s ease-in-out infinite}

      `}</style>

      {/* TOP NAV — logo + safe area top */}
      <nav style={{background:"#283618",position:"sticky",top:0,zIndex:100,paddingTop:"env(safe-area-inset-top)",borderBottom:"0.5px solid rgba(255,255,255,0.1)"}}>
        <div style={{height:36}}></div>
      </nav>

      {/* BOTTOM TAB BAR */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"#283618",borderTop:"0.5px solid rgba(255,255,255,0.1)"}}>
        <div style={{display:"flex",alignItems:"stretch",height:59,padding:"7px 8px 0"}}>
          {TABS.map(({v,l,icon})=>{
            const active=view===v&&!editId;
            return <button key={v} onClick={()=>{setEditId(null);setView(v);}}
              style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,background:"none",border:"none",padding:"6px 4px 8px",minWidth:0,cursor:"pointer"}}>
              <div style={{width:23,height:23,display:"flex",alignItems:"center",justifyContent:"center",color:active?"#FFFFFF":"rgba(255,255,255,0.5)",flexShrink:0}}>
                {icon}
              </div>
              <span style={{fontSize:11,fontWeight:active?700:500,color:active?"#FFFFFF":"rgba(255,255,255,0.5)",letterSpacing:"0.02em",whiteSpace:"nowrap",lineHeight:1}}>{l}</span>
            </button>;
          })}
        </div>
        {/* Safe area spacer — sits below the tab row, fills home indicator zone */}
        <div style={{height:"env(safe-area-inset-bottom,20px)",minHeight:20,background:"#283618"}}/>
      </div>

      <div ref={scrollRef} style={{maxWidth:580,margin:"0 auto",padding:"20px 16px calc(60px + max(env(safe-area-inset-bottom,0px),16px) + 16px)",height:"calc(100vh - 36px - env(safe-area-inset-top,0px))",overflowY:"auto"}}>

        {/* ══════════════════════════════
            HOME / DASHBOARD
        ══════════════════════════════ */}

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
        {view===VIEWS.HOME && <div className="su">

          {/* Active Bake Banner — full bleed, most prominent */}
          {bakeStarted&&bakeRecipe&&(()=>{
            const activeSteps=bakeRecipe.autolyseEnabled?bakeRecipe.steps:bakeRecipe.steps.filter(s=>s.id!=="autolyse");
            const totalStepMin=activeSteps.reduce((a,s)=>a+s.durationMin,0);
            const estFinish=bakeStartTime?new Date(bakeStartTime+totalStepMin*60000):null;
            const estNow=new Date();
            const isTomorrow=estFinish&&(estFinish.getDate()!==estNow.getDate());
            const estStr=estFinish?(isTomorrow?"Tomorrow ":"")+estFinish.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):null;
            const curStep=activeStep!=null&&activeStep<activeSteps.length?activeSteps[activeStep]:null;
            return <div onClick={()=>setView(VIEWS.BAKE)}
              style={{background:"#283618",borderRadius:20,padding:"20px",marginBottom:20,cursor:"pointer",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,right:0,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.04)",transform:"translate(30px,-30px)"}}/>
              <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Bake in progress</div>
              <div style={{fontSize:22,fontWeight:700,color:"#FFFFFF",letterSpacing:"-0.02em",marginBottom:4}}>{bakeRecipe.name}</div>
              {curStep&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:curStep.color,flexShrink:0}}/>
                <span style={{fontSize:14,color:"rgba(255,255,255,0.7)",fontWeight:500}}>{curStep.name}</span>
              </div>}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                {estStr&&<div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:1}}>Est. finish</div>
                  <div style={{fontSize:16,fontWeight:600,color:"#8BC44A"}}>{estStr}</div>
                </div>}
                <div style={{background:"rgba(255,255,255,0.12)",borderRadius:10,padding:"8px 16px",fontSize:13,fontWeight:600,color:"#FFFFFF"}}>Continue →</div>
              </div>
            </div>;
          })()}

          {/* Section: Your Recipes */}
          <div style={{marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:13,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em"}}>Recipes</div>
            <button onClick={()=>setView(VIEWS.RECIPES)} style={{fontSize:12,fontWeight:600,color:"#606c38",background:"none",border:"none",padding:"4px 0"}}>See all →</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {recipes.slice(0,3).map(r=>{
              const totalMin=(r.autolyseEnabled?r.steps:r.steps.filter(s=>s.id!=="autolyse")).reduce((a,s)=>a+s.durationMin,0);
              return <div key={r.id} style={{background:"#FFFFFF",borderRadius:16,padding:"14px 16px",border:"1px solid #E0DED8",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:"#283618",marginBottom:3}}>{r.name}</div>
                  <div style={{fontSize:12,color:"#6E6E6E"}}>{r.loaves}×{r.loafG}g · {fmtDur(totalMin)}</div>
                </div>
                <button onClick={()=>startBake(r)} style={{background:"#283618",color:"#FFFFFF",border:"none",borderRadius:12,padding:"9px 16px",fontSize:13,fontWeight:600,flexShrink:0}}>Bake</button>
              </div>;
            })}
            {recipes.length===0&&<Card><p style={{fontSize:14,color:"#6E6E6E",textAlign:"center",padding:"8px 0"}}>No recipes yet.</p></Card>}
          </div>

          {/* Section: Recent Bakes */}
          {savedLogs.length>0&&<>
            <div style={{marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:13,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em"}}>Recent Bakes</div>
              <button onClick={()=>setView(VIEWS.LOG)} style={{fontSize:12,fontWeight:600,color:"#606c38",background:"none",border:"none",padding:"4px 0"}}>See all →</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
              {savedLogs.slice(0,3).map(log=>(
                <button key={log.id} onClick={()=>{setViewingLog(log.id);setView(VIEWS.LOG);}}
                  style={{background:"#FFFFFF",borderRadius:16,padding:"14px 16px",border:"1px solid #E0DED8",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:600,color:"#283618",marginBottom:3}}>{log.recipeName||"Untitled"}</div>
                    <div style={{fontSize:12,color:"#6E6E6E"}}>{new Date(log.startTime).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}{log.review?.rating?` · ${"★".repeat(log.review.rating)}`:""}</div>
                  </div>
                  <span style={{color:"#C8C8C0",fontSize:16}}>›</span>
                </button>
              ))}
            </div>
          </>}

        </div>}
        {view===VIEWS.RECIPES && !editId && <div className="su">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:14}}>
            <div>
              <div style={{fontSize:26,fontWeight:700,letterSpacing:"-0.03em",marginBottom:2}}>Recipes</div>
              <div style={{fontSize:14,color:"#606c38"}}>{recipes.length} saved</div>
            </div>
            <button onClick={addRecipe} style={{padding:"10px 18px",borderRadius:14,background:"#283618",color:"#F8F8F6",fontSize:14,fontWeight:600}}>+ New</button>
          </div>

          {/* Search */}
          <div style={{position:"relative",marginBottom:16}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9E9E90" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={recipeSearch||""} onChange={e=>setRecipeSearch(e.target.value)} placeholder="Search recipes…"
              style={{width:"100%",background:"#FFFFFF",border:"1px solid #E0DED8",borderRadius:12,padding:"10px 12px 10px 36px",fontSize:14,color:"#283618",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          </div>

          <div ref={recipeDrag.listRef}>
          {(recipes.filter(r=>!recipeSearch||(r.name||"").toLowerCase().includes(recipeSearch.toLowerCase()))).map((r,ri)=>{
            const primaryFlourIng = r.ingredients.find(i=>i.type==="flour");
            const primaryFlour    = primaryFlourIng?.flourId ? FLOUR_DB.find(f=>f.id===primaryFlourIng.flourId) : null;
            const flourG          = r.ingredients.filter(i=>i.type==="flour").reduce((a,i)=>a+(parseFloat(i.grams)||0),0);
            const totalMin        = (r.autolyseEnabled?r.steps:r.steps.filter(s=>s.id!=="autolyse")).reduce((a,s)=>a+s.durationMin,0);
            return <div key={r.id} {...recipeDrag.getRowProps(ri)}>
            <Card style={{padding:0,overflow:"hidden",border:isRecipeDropTarget?"2px solid #606c38":"1px solid #E0DED8",transition:"border 0.1s"}}>
              <div style={{padding:"16px 18px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
                  {/* Long-press drag handle */}
                  <DragHandle {...recipeDrag.getDragHandleProps(ri)} style={{padding:"4px 8px 4px 0",alignSelf:"center"}}/>
                  <div style={{flex:1,fontSize:18,fontWeight:700,letterSpacing:"-0.02em"}}>{r.name}</div>
                  <div style={{display:"flex",gap:8,flexShrink:0}}>
                    <button onClick={()=>setEditId(r.id)} style={{padding:"6px 13px",borderRadius:10,background:"#EFEFED",color:"#283618",fontSize:13,fontWeight:600}}>Edit</button>
                    <button onClick={()=>startBake(r)} style={{padding:"6px 14px",borderRadius:10,background:"#283618",color:"#F8F8F6",fontSize:13,fontWeight:600}}>Bake →</button>
                  </div>
                </div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:12}}>
                  <Badge color="#606c38">{r.loaves} × {r.loafG}g</Badge>
                  {r.ddt && <Badge color="#606c38">DDT {parseInt(r.ddt)}°{r.tempUnit||"C"}</Badge>}
                  <Badge color="#5C5C5C">{fmtDur(totalMin)}</Badge>
                  {primaryFlour && <Badge color="#5C5C5C">{primaryFlour.brand} · {primaryFlour.protein}g protein</Badge>}
                </div>
                <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                  {r.ingredients.filter(i=>parseFloat(i.grams)).map(i=>{
                    const f=i.flourId?FLOUR_DB.find(fl=>fl.id===i.flourId):null;
                    return <div key={i.id}>
                      <div style={{fontSize:10,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{f?f.name:i.label}</div>
                      <div style={{fontSize:15,fontWeight:700}}>{i.grams}g</div>
                      {i.type!=="flour"&&flourG>0&&<div style={{fontSize:11,color:"#5C5C5C",fontWeight:600}}>{bkPct(parseFloat(i.grams),flourG)}%</div>}
                    </div>;
                  })}
                </div>
              </div>
              <div style={{padding:"10px 18px",background:"#FFFFFF",borderTop:"0.5px solid #E0DED8",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:"#606c38",flex:1,marginRight:12}}>{r.notes||"No notes"}</span>
                <button onClick={()=>{setRecipes(rs=>rs.filter(x=>x.id!==r.id));deleteRecipeDB(r.id);}} style={{fontSize:12,color:"#9E3A3A",background:"none",fontWeight:600,flexShrink:0}}>Delete</button>
              </div>
            </Card>
            </div>;
          })}
          </div>
          {recipeDrag.ghostEl}
          {recipes.length===0 && <Card><p style={{textAlign:"center",color:"#606c38",padding:"20px 0"}}>No recipes yet — tap + New to start.</p></Card>}
          {recipes.length>0 && recipeSearch && recipes.filter(r=>(r.name||"").toLowerCase().includes(recipeSearch.toLowerCase())).length===0 && <Card><p style={{textAlign:"center",color:"#606c38",padding:"20px 0"}}>No recipes match "{recipeSearch}".</p></Card>}
        </div>}
        {view===VIEWS.RECIPES && editId && editRecipe && <div className="su">
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button onClick={()=>setEditId(null)} style={{width:34,height:34,borderRadius:10,background:"#283618",color:"#F8F8F6",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600}}>←</button>
            <div style={{flex:1,fontSize:22,fontWeight:700,letterSpacing:"-0.02em"}}>Edit Recipe</div>
            <button onClick={()=>scanFileRef.current?.click()} disabled={scanLoading}
              style={{padding:"8px 12px",borderRadius:12,background:scanLoading?"#EFEFED":"#F0F5EE",color:"#283618",fontSize:13,fontWeight:600,border:"1px solid #E0DED8",display:"flex",alignItems:"center",gap:5}}>
              {scanLoading
                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Scanning…</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Scan</>
              }
            </button>
            <button onClick={()=>{startBake(editRecipe);setEditId(null);}} style={{padding:"8px 16px",borderRadius:12,background:"#283618",color:"#F8F8F6",fontSize:13,fontWeight:600}}>Bake →</button>
          </div>

          {/* Name */}
          <Card>
            <input value={editRecipe.name} onChange={e=>updE(r=>({...r,name:e.target.value}))} placeholder="Recipe name"
              style={{width:"100%",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",borderRadius:0,padding:"6px 2px",fontSize:20,fontWeight:700,color:"#283618",outline:"none",letterSpacing:"-0.02em"}}/>
          </Card>

          {/* Session setup */}
          <SecH>Session Setup</SecH>
          <Card>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              {[{l:"Loaves",k:"loaves"},{l:"Loaf (g)",k:"loafG"}].map(f=>(
                <div key={f.k}><Lbl>{f.l}</Lbl><Inp value={editRecipe[f.k]} onChange={e=>updE(r=>({...r,[f.k]:e.target.value}))} type="number"/></div>
              ))}
              <div>
                <Lbl>DDT</Lbl>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Inp type="number" value={editRecipe.ddt} style={{flex:1}}
                    onChange={e=>updE(r=>({...r,ddt:e.target.value}))}/>
                  <div style={{display:"flex",gap:2,flexShrink:0}}>
                    {["C","F"].map(u=><button key={u}
                      onClick={()=>{
                        const cur=editRecipe.tempUnit||"C";
                        if(u===cur)return;
                        const curVal=parseInt(editRecipe.ddt)||26;
                        const converted=u==="C"?Math.round((curVal-32)*5/9):Math.round(curVal*9/5+32);
                        updE(r=>({...r,tempUnit:u,ddt:String(converted)}));
                      }}
                      style={{fontSize:11,fontWeight:600,padding:"3px 7px",borderRadius:6,background:(editRecipe.tempUnit||"C")===u?"#283618":"transparent",color:(editRecipe.tempUnit||"C")===u?"#F8F8F6":"#ACACAC",border:"none",transition:"all 0.15s",cursor:"pointer"}}>°{u}</button>)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Dough formula */}
          <SecH>Dough Formula</SecH>
          <Card style={{padding:0,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 72px 64px 30px",padding:"9px 16px",background:"#E0DED8",borderBottom:"0.5px solid #E0DED8",gap:8,alignItems:"center"}}>
              {["Ingredient","Grams","Baker's %",""].map((h,i)=><div key={i} style={{fontSize:10,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em",textAlign:i===1||i===2?"center":"left"}}>{h}</div>)}
            </div>

            {editRecipe.ingredients.map((ing,idx)=>{
              const totalFlourG=editRecipe.ingredients.filter(i=>i.type==="flour").reduce((a,i)=>a+(parseFloat(i.grams)||0),0);
              const grams =parseFloat(ing.grams)||0;
              const pct   =totalFlourG?bkPct(grams,totalFlourG):"—";
              const flour =ing.flourId?FLOUR_DB.find(f=>f.id===ing.flourId):null;

              return <div key={ing.id} style={{borderBottom:idx<editRecipe.ingredients.length-1?"0.5px solid #1E2C30":"none"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 72px 64px 30px",padding:"10px 16px",alignItems:"center",gap:8}}>
                  <div>
                    {ing.type==="flour" ? (
                      <div>
                        {ing.manual ? (
                          /* Manual free-text entry */
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <input
                              autoFocus
                              value={ing.label}
                              onChange={e=>updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,label:e.target.value}:i)}))}
                              placeholder="Enter flour name…"
                              style={{background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"5px 2px",fontSize:14,fontWeight:600,color:"#283618",outline:"none",flex:1}}/>
                            <button
                              onClick={()=>updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,manual:false,label:"",flourId:""}:i)}))}
                              style={{fontSize:10,fontWeight:600,color:"#606c38",background:"#EFEFED",border:"none",borderRadius:8,padding:"3px 7px",whiteSpace:"nowrap",flexShrink:0}}>
                              Use list
                            </button>
                          </div>
                        ) : (
                          /* Dropdown from DB */
                          <div>
                            <select value={ing.flourId||""}
                              onChange={e=>{
                                const v=e.target.value;
                                if(v==="__manual__"){
                                  updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,manual:true,flourId:"",label:""}:i)}));
                                } else if(v.startsWith("__gen_")){
                                  const genNames={"__gen_hipro__":"High Protein White Flour","__gen_white__":"White Flour","__gen_wholemeal__":"Wholemeal Flour","__gen_spelt__":"Spelt Flour","__gen_rye__":"Rye Flour","__gen_einkorn__":"Einkorn Flour","__gen_emmer__":"Emmer Flour","__gen_khorasan__":"Khorasan (Kamut) Flour"};
                                  updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,flourId:v,label:genNames[v]||"Flour",protein:i.protein||""}:i)}));
                                } else {
                                  const f=FLOUR_DB.find(fl=>fl.id===v);
                                  updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,flourId:v,label:f?f.name:i.label,protein:""}:i)}));
                                }
                              }}
                              style={{background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"5px 2px",fontSize:14,fontWeight:600,color:flour?"#283618":"#606c38",outline:"none",width:"100%",cursor:"pointer",appearance:"auto"}}>
                              <option value="">Select flour…</option>
                              <optgroup label="─── General">
                                <option value="__gen_hipro__">High Protein White Flour</option>
                                <option value="__gen_white__">White Flour</option>
                                <option value="__gen_wholemeal__">Wholemeal Flour</option>
                                <option value="__gen_spelt__">Spelt Flour</option>
                                <option value="__gen_rye__">Rye Flour</option>
                                <option value="__gen_einkorn__">Einkorn Flour</option>
                                <option value="__gen_emmer__">Emmer Flour</option>
                                <option value="__gen_khorasan__">Khorasan (Kamut) Flour</option>
                              </optgroup>
                              <optgroup label="─── Specific Brand">
                                {FLOUR_DB.filter(f=>f.type==="White Bread"||f.type==="White Bread (T55)"||f.type==="Organic White Bread"||f.type==="Organic Stoneground White"||f.type==="Stoneground Heritage White"||f.type==="High-Protein White Bread"||f.type==="Professional White Bread"||f.type==="Supermarket Bread Flour").map(f=><option key={f.id} value={f.id}>{f.brand} — {f.name} ({f.protein}g)</option>)}
                                {FLOUR_DB.filter(f=>f.type==="Wholemeal Bread"||f.type==="Wholemeal").map(f=><option key={f.id} value={f.id}>{f.brand} — {f.name} ({f.protein}g)</option>)}
                                {FLOUR_DB.filter(f=>f.type==="Rye"||f.type==="Whole Rye"||f.type==="Light Rye").map(f=><option key={f.id} value={f.id}>{f.brand} — {f.name} ({f.protein}g)</option>)}
                                {FLOUR_DB.filter(f=>f.type==="Spelt").map(f=><option key={f.id} value={f.id}>{f.brand} — {f.name} ({f.protein}g)</option>)}
                              </optgroup>
                              <optgroup label="───">
                                <option value="__manual__">Not in list — enter manually…</option>
                              </optgroup>
                            </select>
                            {flour && <div style={{fontSize:11,color:"#606c38",marginTop:2,fontWeight:600}}>{flour.type} · {flour.protein}g protein/100g</div>}
                            {ing.flourId&&ing.flourId.startsWith("__gen_")&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}><span style={{fontSize:11,color:"#606c38",fontWeight:600}}>Protein (g/100g):</span><input type="number" inputMode="decimal" value={ing.protein||""} onChange={e=>updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,protein:e.target.value}:i)}))} placeholder="e.g. 13" style={{width:60,background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"2px 4px",fontSize:13,fontWeight:600,color:"#283618",outline:"none",textAlign:"center"}}/></div>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input value={ing.label} onChange={e=>updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,label:e.target.value}:i)}))}
                        style={{background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"5px 2px",fontSize:14,color:"#283618",outline:"none",width:"100%"}}/>
                    )}
                  </div>
                  <input type="number" value={ing.grams} onChange={e=>updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,grams:e.target.value}:i)}))} placeholder="0"
                    style={{background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"5px 4px",fontSize:15,fontWeight:600,color:"#283618",outline:"none",textAlign:"center",width:"100%"}}/>
                  <div style={{fontSize:13,fontWeight:600,color:"#5C5C5C",textAlign:"center"}}>{pct!=="—"?pct+"%":"—"}</div>
                  <button onClick={()=>updE(r=>({...r,ingredients:r.ingredients.filter(i=>i.id!==ing.id)}))}
                    style={{width:24,height:24,borderRadius:"50%",background:"#E8E8E8",color:"#5C5C5C",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                </div>
              </div>;
            })}

            <div style={{padding:"10px 16px",borderTop:"0.5px solid #E0DED8",display:"flex",gap:8}}>
              <button onClick={()=>updE(r=>({...r,ingredients:[...r.ingredients,{id:uid(),type:"flour",flourId:null,label:"",grams:""}]}))}
                style={{flex:1,padding:"9px",borderRadius:10,background:"#E8E8E8",color:"#5C5C5C",fontSize:13,fontWeight:600,border:"1.5px dashed #A0A0A0"}}>+ Flour</button>
              <button onClick={()=>updE(r=>({...r,ingredients:[...r.ingredients,{id:uid(),type:"other",flourId:null,label:"",grams:""}]}))}
                style={{flex:1,padding:"9px",borderRadius:10,background:"#F2F2F0",color:"#606c38",fontSize:13,fontWeight:600,border:"1.5px dashed #606c38"}}>+ Ingredient</button>
            </div>
          </Card>

          {/* Levain */}
          <SecH>Levain Build</SecH>
          <Card>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[["Flour (g)","flour"],["Water (g)","water"],["Starter (g)","starter"],["Duration (hr)","duration"]].map(([lbl,k])=>(
                <div key={k}><Lbl>{lbl}</Lbl><Inp type="number" value={editRecipe.levain[k]} onChange={e=>updE(r=>({...r,levain:{...r.levain,[k]:e.target.value}}))}/></div>
              ))}
            </div>
          </Card>

          {/* Steps — long-press drag to reorder */}
          <SecH>Step Durations · <span style={{color:"#E0DED8",fontWeight:400}}>{fmtDur((editRecipe.autolyseEnabled?editRecipe.steps:editRecipe.steps.filter(s=>s.id!=="autolyse")).reduce((a,s)=>a+s.durationMin,0))} total</span></SecH>
          <Card style={{padding:0,overflow:"hidden"}}>
            <div ref={stepDrag.listRef}>
            {editRecipe.steps.map((s,i)=>{
              const isBulk=s.id==="bulk",isAuto=s.id==="autolyse";
              const unit=editRecipe.stepUnit?.[s.id]||"min";
              const displayVal=unit==="hr"?+(s.durationMin/60).toFixed(2):s.durationMin;
              const disabled=isAuto&&!editRecipe.autolyseEnabled;
              return (
                <div key={s.id} {...stepDrag.getRowProps(i)} style={{...stepDrag.getRowProps(i).style,borderBottom:i<editRecipe.steps.length-1?"0.5px solid #1E2C30":"none",opacity:disabled?0.4:stepDrag.getRowProps(i).style?.opacity??1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px"}}>
                    {/* ── Drag handle: long-press activates drag ── */}
                                        <DragHandle {...stepDrag.getDragHandleProps(i)}/>
                    <div style={{width:10,height:10,borderRadius:"50%",background:disabled?"#E0DED8":s.color,flexShrink:0}}/>
                    <input value={s.name} onChange={e=>updE(r=>({...r,steps:r.steps.map((st,j)=>j===i?{...st,name:e.target.value}:st)}))}
                      style={{flex:1,fontSize:14,fontWeight:500,background:"transparent",border:"none",borderBottom:"1px solid #E0DED8",outline:"none",padding:"2px 0",color:"#283618",minWidth:0,fontFamily:"inherit"}}
                      placeholder="Step name"/>
                    {isAuto && <button onClick={()=>updE(r=>({...r,autolyseEnabled:!r.autolyseEnabled}))}
                      style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,border:"1px solid #E0DED8",background:editRecipe.autolyseEnabled?"#283618":"#E0DED8",color:editRecipe.autolyseEnabled?"#F8F8F6":"#606c38"}}>{editRecipe.autolyseEnabled?"On":"Off"}</button>}
                    {isBulk && <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:11,color:"#606c38",fontWeight:600}}>S&F</span>
                      <input type="number" value={s.sfCount} min={0} max={10}
                        onChange={e=>updE(r=>({...r,steps:r.steps.map((st,j)=>j===i?{...st,sfCount:parseInt(e.target.value)||0}:st)}))}
                        style={{width:36,background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"3px 0",fontSize:13,fontWeight:600,color:s.sfCount>0?s.color:"#606c38",textAlign:"center"}}/>
                    </div>}
                    {!disabled && (s.id==="retard" ? (
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        {unit!=="overnight" && <>
                          <input type="text" inputMode="decimal" value={displayVal}
                            onFocus={e=>e.target.select()}
                            onChange={e=>{const raw=e.target.value.replace(/[^0-9.]/g,"");updE(r=>({...r,steps:r.steps.map((st,j)=>j===i?{...st,durationMin:raw===""?0:unit==="hr"?Math.round(parseFloat(raw||0)*60):Math.round(parseFloat(raw||0))}:st)}));}}
                            onBlur={e=>{const v=parseFloat(e.target.value)||1;const m=unit==="hr"?Math.round(v*60):Math.round(v);updE(r=>({...r,steps:r.steps.map((st,j)=>j===i?{...st,durationMin:Math.max(1,m)}:st)}));}}
                            style={{width:44,background:"#FFFFFF",border:"1px solid #E0DED8",borderRadius:8,padding:"5px 4px",fontSize:13,fontWeight:600,textAlign:"center",color:"#283618"}}/>
                          <div style={{display:"flex",background:"#F2F2F0",borderRadius:8,border:"1px solid #E0DED8",overflow:"hidden"}}>
                            {["min","hr"].map(u=><button key={u} onClick={()=>updE(r=>({...r,stepUnit:{...r.stepUnit,[s.id]:u}}))}
                              style={{padding:"4px 6px",fontSize:11,fontWeight:600,background:unit===u?"#606c38":"transparent",color:unit===u?"#FFFFFF":"#6E6E6E",transition:"all 0.15s"}}>{u}</button>)}
                          </div>
                        </>}
                        <button onClick={()=>{
                          const next=unit==="overnight"?"hr":"overnight";
                          updE(r=>({...r,stepUnit:{...r.stepUnit,[s.id]:next},steps:r.steps.map((st,j)=>j===i?{...st,durationMin:next==="overnight"?600:st.durationMin}:st)}));
                        }} style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,border:"1px solid #E0DED8",background:unit==="overnight"?"#283618":"transparent",color:unit==="overnight"?"#F8F8F6":"#6E6E6E",transition:"all 0.2s"}}>
                          {unit==="overnight"?"Overnight: On":"Overnight"}
                        </button>
                      </div>
                    ) : (
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <input type="text" inputMode="decimal" value={displayVal}
                          onFocus={e=>e.target.select()}
                          onChange={e=>{const raw=e.target.value.replace(/[^0-9.]/g,"");updE(r=>({...r,steps:r.steps.map((st,j)=>j===i?{...st,durationMin:raw===""?0:unit==="hr"?Math.round(parseFloat(raw||0)*60):Math.round(parseFloat(raw||0))}:st)}));}}
                          onBlur={e=>{const v=parseFloat(e.target.value)||1;const m=unit==="hr"?Math.round(v*60):Math.round(v);updE(r=>({...r,steps:r.steps.map((st,j)=>j===i?{...st,durationMin:Math.max(1,m)}:st)}));}}
                          style={{width:48,background:"#FFFFFF",border:"1px solid #E0DED8",borderRadius:8,padding:"5px 4px",fontSize:13,fontWeight:600,textAlign:"center",color:"#283618"}}/>
                        <div style={{display:"flex",background:"#F2F2F0",borderRadius:8,border:"1px solid #E0DED8",overflow:"hidden"}}>
                          {["min","hr"].map(u=><button key={u} onClick={()=>updE(r=>({...r,stepUnit:{...r.stepUnit,[s.id]:u}}))}
                            style={{padding:"4px 6px",fontSize:11,fontWeight:600,background:unit===u?"#283618":"transparent",color:unit===u?"#FFFFFF":"#6E6E6E",transition:"all 0.15s"}}>{u}</button>)}
                        </div>
                      </div>
                    ))}
                    <button onClick={()=>updE(r=>({...r,steps:r.steps.filter((_,j)=>j!==i)}))}
                      style={{width:24,height:24,borderRadius:12,background:"transparent",border:"1px solid #E0DED8",color:"#9E3A3A",fontSize:15,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1,cursor:"pointer"}}>
                      −
                    </button>
                  </div>
                </div>
              );
            })}
            {/* Add step */}
            <button onClick={()=>{
              const id=uid();
              const colorIdx=editRecipe.steps.length % STEP_COLORS.length;
              updE(r=>({...r,
                steps:[...r.steps,{id,name:"New Step",durationMin:30,sfCount:0,color:STEP_COLORS[colorIdx],custom:true}],
                stepUnit:{...r.stepUnit,[id]:"min"},
              }));
            }} style={{width:"100%",padding:"12px 16px",background:"none",border:"none",borderTop:"0.5px solid #E0DED8",color:"#606c38",fontSize:13,fontWeight:600,textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:18,lineHeight:1}}>+</span> Add Step
            </button>
            </div>
          </Card>
          {stepDrag.ghostEl}() : <>

          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:24}}>
            {[
              {label:"Recipes",value:recipes.length,action:()=>setView(VIEWS.RECIPES)},
              {label:"Bakes",value:savedLogs.length,action:null},
              {label:"Flours",value:allFlours.length,action:()=>setView(VIEWS.INGREDIENTS)},
            ].map(({label,value,action})=>(
              <button key={label} onClick={action||undefined} style={{background:"#FFFFFF",borderRadius:14,padding:"14px 10px",border:"1px solid #E0DED8",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:22,fontWeight:700,color:"#283618",letterSpacing:"-0.02em"}}>{value}</div>
                <div style={{fontSize:10,fontWeight:600,color:"#6E6E6E",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2}}>{label}</div>
              </button>
            ))}
          </div>

          {/* ── Log list + active session ────────────── */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
            <div style={{fontSize:26,fontWeight:700,letterSpacing:"-0.03em"}}>Bake Log</div>
            <button onClick={()=>{
              const id=uid();
              const blank={
                id, recipeName:"", startTime:Date.now(), endTime:Date.now(),
                stepNotes:{}, stepPhotos:{}, foldNotes:{}, foldPhotos:{},
                sessionNotes:"", autolyseEnabled:true,
                ingredients:[], steps:DEFAULT_STEPS.map((s,i)=>({...s,durationMin:s.duration,color:STEP_COLORS[i]})),
                review:{}, isManual:true,
              };
              setSavedLogs(prev=>[blank,...prev]);
              saveBakeLog(blank);
              setViewingLog(id);
            }} style={{padding:"9px 16px",borderRadius:12,background:"#283618",color:"#F8F8F6",fontSize:13,fontWeight:600}}>+ Add past bake</button>
          </div>
          <div style={{fontSize:14,color:"#606c38",marginBottom:14}}>{savedLogs.filter(l=>l.id!=='__active_bake__').length} session{savedLogs.filter(l=>l.id!=='__active_bake__').length!==1?"s":""} recorded</div>

          {/* Search */}
          <div style={{position:"relative",marginBottom:16}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9E9E90" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={logSearch} onChange={e=>setLogSearch(e.target.value)} placeholder="Search bakes…"
              style={{width:"100%",background:"#FFFFFF",border:"1px solid #E0DED8",borderRadius:12,padding:"10px 12px 10px 36px",fontSize:14,color:"#283618",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          </div>

          {/* Active session */}
          {bakeStarted&&bakeRecipe&&<>
            <div style={{background:"#283618",borderRadius:16,padding:"14px 16px",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Active session</div>
              <div style={{fontSize:16,fontWeight:700,color:"#FFFFFF",marginBottom:4}}>{bakeRecipe.name}</div>
              {(()=>{
                  const totalStepMin=(bakeRecipe.autolyseEnabled?bakeRecipe.steps:bakeRecipe.steps.filter(s=>s.id!=="autolyse")).reduce((a,s)=>a+s.durationMin,0);
                  const estFinish=bakeStartTime?new Date(bakeStartTime+totalStepMin*60000):null;
                  const estNow=new Date();
                  const isTomorrow=estFinish&&(estFinish.getDate()!==estNow.getDate()||estFinish.getMonth()!==estNow.getMonth());
                  const estStr=estFinish?(isTomorrow?"tomorrow ":"")+estFinish.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):null;
                  return <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:12}}>
                    Started {timeStr(bakeStartTime)}{estStr&&<> · Est. finish <strong style={{color:"#FFFFFF"}}>{estStr}</strong></>}
                  </div>;
                })()}

              <SecH style={{color:"rgba(255,255,255,0.5)"}}>Step Notes</SecH>
              {bakeRecipe.steps.some((_,i)=>stepNotes[i]||stepPhotos[i]?.length)?(
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                  {bakeRecipe.steps.map((s,i)=>{
                    if(!stepNotes[i]&&!stepPhotos[i]?.length)return null;
                    return <div key={s.id} style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:s.color}}/>
                        <span style={{fontSize:13,fontWeight:600,color:"#FFFFFF"}}>{s.name}</span>
                      </div>
                      {stepNotes[i]&&<p style={{fontSize:13,color:"rgba(255,255,255,0.7)",lineHeight:1.5}}>{stepNotes[i]}</p>}
                      {stepPhotos[i]?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>{stepPhotos[i].map((ph,pi)=><img key={pi} src={ph.src} alt="" style={{height:60,width:60,objectFit:"cover",borderRadius:10}}/>)}</div>}
                    </div>;
                  })}
                </div>
              ):<p style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:12}}>No step notes yet.</p>}

              <textarea value={sessionNotes} onChange={e=>setSessionNotes(e.target.value)} placeholder="Session notes…" rows={3}
                style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"none",borderRadius:10,padding:"10px 12px",fontSize:14,color:"#FFFFFF",resize:"vertical",outline:"none",fontFamily:"inherit",marginBottom:12}}/>

              <button onClick={finishBake}
                style={{width:"100%",padding:"11px",borderRadius:12,background:"#FFFFFF",color:"#283618",fontSize:14,fontWeight:700}}>Finish & Save Bake</button>
            </div>
          </>}

          {/* Past logs — sorted newest first */}
          {savedLogs.filter(l=>l.id!=='__active_bake__').length>0 ? (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {savedLogs
                .filter(l=>l.id!=='__active_bake__' && (!logSearch||(l.recipeName||"").toLowerCase().includes(logSearch.toLowerCase())))
                .slice()
                .sort((a,b)=>(b.startTime||0)-(a.startTime||0))
                .map(log=>{
                const dMin = log.endTime&&log.startTime ? Math.round((log.endTime-log.startTime)/60000) : null;
                const isOpen = swipedLogId === log.id;
                const DELETE_W = 80;
                let touchStartX = 0;
                return (
                  <div key={log.id} style={{position:"relative",marginBottom:0,borderRadius:16,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
                    {/* Delete button — extends left under the card so no square corners show */}
                    <div style={{position:"absolute",top:0,right:0,bottom:0,left:"-16px",background:"#E53E3E",display:"flex",alignItems:"center",justifyContent:"flex-end",borderRadius:"0 16px 16px 0"}}>
                      <button onClick={()=>{deleteLogDB(log.id);setSavedLogs(prev=>prev.filter(l=>l.id!==log.id));setSwipedLogId(null);}}
                        style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:4,color:"#FFFFFF",padding:"0 20px 0 12px",cursor:"pointer"}}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.04em"}}>DELETE</span>
                      </button>
                    </div>
                    {/* Swipeable row */}
                    <div
                      onTouchStart={e=>{ touchStartX=e.touches[0].clientX; }}
                      onTouchEnd={e=>{
                        const dx = touchStartX - e.changedTouches[0].clientX;
                        if(dx > 40) setSwipedLogId(log.id);
                        else if(dx < -20) setSwipedLogId(null);
                      }}
                      onClick={()=>{ if(isOpen){setSwipedLogId(null);} else {setViewingLog(log.id);} }}
                      style={{background:"#FFFFFF",padding:"14px 16px",border:"1px solid #E0DED8",borderRadius:16,textAlign:"left",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transform:isOpen?`translateX(-${DELETE_W}px)`:"translateX(0)",transition:"transform 0.22s cubic-bezier(0.2,0,0,1)",position:"relative",zIndex:1,minWidth:"100%"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:15,fontWeight:600,color:"#283618"}}>{log.recipeName||"Untitled"}</div>
                        <div style={{fontSize:12,color:"#6E6E6E",marginTop:3}}>
                          {new Date(log.startTime).toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
                          {dMin?` · ${Math.floor(dMin/60)}h ${dMin%60}m`:""}
                        </div>
                        {log.sessionNotes&&<div style={{fontSize:12,color:"#606c38",marginTop:3,maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{log.sessionNotes}</div>}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,marginLeft:10}}>
                        {/* Favourite button */}
                        <button onClick={e=>{
                          e.stopPropagation();
                          setSavedLogs(prev=>{
                            const next=prev.map(l=>l.id===log.id?{...l,favourite:!l.favourite}:l);
                            const changed=next.find(l=>l.id===log.id);
                            if(changed) scheduleLogSave(changed);
                            return next;
                          });
                        }} style={{background:"none",border:"none",padding:"4px",cursor:"pointer",fontSize:20,lineHeight:1,color:log.favourite?"#E8A020":"#D0D0C8"}}>
                          {log.favourite?"★":"☆"}
                        </button>
                        <span style={{fontSize:13,color:"#6E6E6E"}}>→</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {logSearch && savedLogs.filter(l=>l.id!=='__active_bake__' && (l.recipeName||"").toLowerCase().includes(logSearch.toLowerCase())).length===0 &&
                <Card><p style={{fontSize:14,color:"#6E6E6E",textAlign:"center",padding:"8px 0"}}>No bakes match "{logSearch}".</p></Card>}
              {savedLogs.filter(l=>l.id!=='__active_bake__').length>4 && (
                <button onClick={()=>scrollRef.current?.scrollTo({top:0,behavior:"smooth"})}
                  style={{width:"100%",padding:"12px",borderRadius:12,background:"#EFEFED",color:"#606c38",fontSize:13,fontWeight:600,marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                  Back to top
                </button>
              )}
            </div>
          ):(
            <Card><p style={{fontSize:14,color:"#6E6E6E",textAlign:"center",padding:"8px 0"}}>Finish a bake to save it here.</p></Card>
          )}
          </>}
        </div>}
        {view===VIEWS.INGREDIENTS && <div className="su">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:2}}>
            <div style={{fontSize:26,fontWeight:700,letterSpacing:"-0.03em"}}>Ingredients</div>
            <button onClick={()=>setShowAddFlour(v=>!v)} style={{padding:"9px 16px",borderRadius:12,background:"#283618",color:"#F8F8F6",fontSize:13,fontWeight:600}}>+ Add</button>
          </div>
          <div style={{fontSize:14,color:"#606c38",marginBottom:18}}>Australian flour database · {allFlours.length} flours{userFlours.length>0?` · ${userFlours.length} custom`:""}</div>

          {/* Add flour form */}
          {showAddFlour && <Card style={{marginBottom:16}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:14}}>Add custom flour</div>
            {[
              {label:"Name",key:"name",placeholder:"e.g. Heritage White"},
              {label:"Brand",key:"brand",placeholder:"e.g. Local Mill"},
              {label:"Type",key:"type",placeholder:"e.g. White Bread, Wholemeal…"},
              {label:"Protein (g per 100g)",key:"protein",placeholder:"e.g. 12.5",type:"number"},
              {label:"Where to buy",key:"where",placeholder:"e.g. Local health food store"},
              {label:"Description",key:"description",placeholder:"Flavour, behaviour, best uses…"},
              {label:"Baking tips",key:"tips",placeholder:"Hydration, fermentation notes…"},
            ].map(f=>(
              <div key={f.key} style={{marginBottom:12}}>
                <Lbl>{f.label}</Lbl>
                <input type={f.type||"text"} value={newFlour[f.key]} placeholder={f.placeholder}
                  onChange={e=>setNewFlour(p=>({...p,[f.key]:e.target.value}))}
                  style={{width:"100%",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",padding:"5px 2px",fontSize:14,color:"#283618",outline:"none",fontFamily:"inherit"}}/>
              </div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:6}}>
              <button onClick={()=>{
                if(!newFlour.name.trim()) return;
                const entry = {
                  id:"u"+uid(), ...newFlour,
                  protein: parseFloat(newFlour.protein)||0,
                  energy:0,fat:0,carbs:0,fibre:0,sodium:0,
                  sizes:["custom"], sourdoughRating:0, colour:"#E0DED8",
                  isCustom:true,
                };
                setUserFlours(p=>[...p,entry]);
                setNewFlour({name:"",brand:"",type:"Custom",protein:"",where:"",description:"",tips:""});
                setShowAddFlour(false);
              }} style={{flex:1,padding:"11px",borderRadius:12,background:"#283618",color:"#F8F8F6",fontSize:14,fontWeight:600}}>Save Flour</button>
              <button onClick={()=>setShowAddFlour(false)} style={{padding:"11px 16px",borderRadius:12,background:"#EFEFED",color:"#606c38",fontSize:14,fontWeight:600}}>Cancel</button>
            </div>
          </Card>}

          {/* Search */}
          <input value={flourSearch} onChange={e=>setFlourSearch(e.target.value)} placeholder="Search flour or brand…"
            style={{width:"100%",background:"#FFFFFF",border:"1px solid #E0DED8",borderRadius:14,padding:"12px 16px",fontSize:15,color:"#283618",outline:"none",boxShadow:"0 1px 4px rgba(0,0,0,0.4)",marginBottom:12}}/>

          {/* Type filters */}
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,marginBottom:20,scrollbarWidth:"none"}}>
            {flourTypes.map(t=>(
              <button key={t} onClick={()=>setFlourFilter(t)}
                style={{padding:"6px 13px",borderRadius:20,fontSize:12,fontWeight:600,whiteSpace:"nowrap",flexShrink:0,background:flourFilter===t?"#283618":"#FFFFFF",color:flourFilter===t?"#F8F8F6":"#606c38",border:`1px solid ${flourFilter===t?"#283618":"#E0DED8"}`,transition:"all 0.2s"}}>
                {t}
              </button>
            ))}
          </div>

          {/* Flour cards */}
          {filtered.map(f=>{
            const isOpen=expandedFlour===f.id;
            const pctOfMax=((f.protein-8)/6)*100; // 8–14g range
            return <Card key={f.id} style={{padding:0,overflow:"hidden"}}>
              {/* colour header bar */}
              

              <div onClick={()=>setExpandedFlour(isOpen?null:f.id)} style={{padding:"16px 18px",cursor:"pointer",userSelect:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{f.brand}</div>
                    <div style={{fontSize:16,fontWeight:700,letterSpacing:"-0.01em",marginBottom:8}}>{f.name}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <Badge color="#606c38">{f.type}</Badge>
                      <Badge color="#606c38">{f.sizes.join(", ")}</Badge>
                    </div>
                  </div>
                  {/* Protein callout */}
                  <div style={{textAlign:"center",flexShrink:0,minWidth:56}}>
                    <div style={{fontSize:24,fontWeight:900,color:"#283618",letterSpacing:"-0.03em",lineHeight:1}}>{f.protein}<span style={{fontSize:12,fontWeight:600,color:"#606c38"}}>g</span></div>
                    <div style={{fontSize:9,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>protein</div>
                    <div style={{width:48,height:5,background:"#E0DED8",borderRadius:4,margin:"0 auto",overflow:"hidden"}}>
                      <div style={{height:"100%",background:"#5C5C5C",borderRadius:4,width:`${pctOfMax}%`}}/>
                    </div>
                  </div>
                </div>

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:12,color:"#606c38",flex:1,marginRight:8}}>{f.where}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:10,color:"#606c38",fontWeight:600}}>Sourdough</span>
                    <Stars count={f.sourdoughRating} size={12}/>
                    <span style={{fontSize:11,color:"#E0DED8",marginLeft:4}}>{isOpen?"▲":"▼"}</span>
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && <div style={{borderTop:"0.5px solid #E0DED8",padding:"16px 18px 20px",background:"#E0DED8"}}>
                <p style={{fontSize:14,color:"#606c38",lineHeight:1.7,marginBottom:16}}>{f.description}</p>

                {/* Nutrition panel */}
                <Lbl>Nutrition per 100g</Lbl>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:16}}>
                  {[
                    {l:"Energy",v:`${f.energy}kJ`},
                    {l:"Protein",v:`${f.protein}g`,hi:true},
                    {l:"Fat",v:`${f.fat}g`},
                    {l:"Carbs",v:`${f.carbs}g`},
                    {l:"Fibre",v:`${f.fibre}g`},
                  ].map(n=><div key={n.l} style={{background:"#FFFFFF",borderRadius:12,padding:"10px 6px",textAlign:"center",border:`1px solid ${n.hi?"#606c3844":"#E0DED8"}`}}>
                    <div style={{fontSize:9,fontWeight:600,color:n.hi?"#5C5C5C":"#606c38",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{n.l}</div>
                    <div style={{fontSize:14,fontWeight:700,color:n.hi?"#5C5C5C":"#FFFFFF"}}>{n.v}</div>
                  </div>)}
                </div>

                {/* Protein comparison bar */}
                <Lbl>Protein strength (8–14g range)</Lbl>
                <div style={{height:10,background:"#283618",borderRadius:10,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",background:`linear-gradient(90deg,#5C5C5C,#5C5C5C)`,width:`${pctOfMax}%`,borderRadius:10}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#E0DED8",fontWeight:600,marginBottom:16}}>
                  <span>8g (low)</span><span>11g (supermarket)</span><span>14g (pro)</span>
                </div>

                {/* Baking tips */}
                {f.tips && <><Lbl>Baking tips</Lbl>
                <div style={{background:"#FFFFFF",borderRadius:12,padding:"12px 14px",border:"1px solid #E0DED8"}}>
                  <p style={{fontSize:13,color:"#606c38",lineHeight:1.65}}>{f.tips}</p>
                </div></>}

                {!f.isCustom&&<div style={{fontSize:11,color:"#E0DED8",marginTop:12}}>Sodium: {f.sodium}mg · {f.where}</div>}
                {f.isCustom&&<button onClick={e=>{e.stopPropagation();setUserFlours(p=>p.filter(x=>x.id!==f.id));setExpandedFlour(null);}}
                  style={{marginTop:14,padding:"8px 14px",borderRadius:10,background:"#FFF0F0",color:"#9E3A3A",fontSize:12,fontWeight:600}}>Delete</button>}
              </div>}
            </Card>;
          })}

          {filtered.length===0 && <Card><p style={{textAlign:"center",color:"#606c38",padding:"20px 0"}}>No flours match your search.</p></Card>}
        </div>}

      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
      <input ref={scanFileRef} type="file" accept="image/*" onChange={e=>{
        const file=e.target.files[0]; if(!file) return; e.target.value="";
        const reader=new FileReader();
        reader.onload=ev=>scanRecipePhoto(ev.target.result);
        reader.readAsDataURL(file);
      }} style={{display:"none"}}/>
    </div>
    </>
  );
}
