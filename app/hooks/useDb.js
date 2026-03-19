// ─── useDb — all server persistence logic in one place ────────────────────────
import { useCallback, useRef } from 'react';

const DEBOUNCE_MS_RECIPE = 1200;
const DEBOUNCE_MS_LOG    = 1200;
const THROTTLE_MS_ACTIVE = 3000; // write active bake to DB at most every 3s

export function useDb() {
  // ── Recipes ──────────────────────────────────────────────────────────────────
  const saveRecipe = useCallback(async recipe => {
    try {
      await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
      });
    } catch (e) { console.warn('saveRecipe failed:', e); }
  }, []);

  const deleteRecipeDB = useCallback(async id => {
    try { await fetch(`/api/recipes/${id}`, { method: 'DELETE' }); }
    catch (e) { console.warn('deleteRecipe failed:', e); }
  }, []);

  const recipeSaveTimers = useRef({});
  const scheduleRecipeSave = useCallback((recipe) => {
    clearTimeout(recipeSaveTimers.current[recipe.id]);
    recipeSaveTimers.current[recipe.id] = setTimeout(() => saveRecipe(recipe), DEBOUNCE_MS_RECIPE);
  }, [saveRecipe]);

  // ── Bake logs ─────────────────────────────────────────────────────────────────
  const saveBakeLog = useCallback(async log => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch (e) { console.warn('saveBakeLog failed:', e); }
  }, []);

  const deleteLogDB = useCallback(async id => {
    try { await fetch(`/api/logs/${id}`, { method: 'DELETE' }); }
    catch (e) { console.warn('deleteLog failed:', e); }
  }, []);

  const logSaveTimers = useRef({});
  const scheduleLogSave = useCallback((log) => {
    clearTimeout(logSaveTimers.current[log.id]);
    logSaveTimers.current[log.id] = setTimeout(() => saveBakeLog(log), DEBOUNCE_MS_LOG);
  }, [saveBakeLog]);

  // ── Active bake persistence ───────────────────────────────────────────────────
  // Strategy:
  //   1. Always write to localStorage immediately (fast, synchronous)
  //   2. Throttle DB writes to every 3s so we're never more than 3s stale
  //   3. On page hide/unload, flush to DB immediately via sendBeacon (no network delay)

  const activeBakeThrottleTimer = useRef(null);
  const activeBakeLastSent      = useRef(0);
  const activeBakePending       = useRef(null); // last state not yet sent to DB

  const sendToDb = useCallback((raw) => {
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '__active_bake__', _activeBakeState: raw }),
    }).catch(() => {});
    activeBakeLastSent.current = Date.now();
    activeBakePending.current  = null;
  }, []);

  const saveActiveBake = useCallback((state) => {
    const raw = JSON.stringify(state);

    // 1. localStorage — always immediate
    try { localStorage.setItem('bakeIt_activeBake', raw); } catch {}

    // 2. DB — throttled: send now if last send was >3s ago, otherwise schedule
    activeBakePending.current = raw;
    clearTimeout(activeBakeThrottleTimer.current);
    const msSinceLast = Date.now() - activeBakeLastSent.current;
    if (msSinceLast >= THROTTLE_MS_ACTIVE) {
      sendToDb(raw);
    } else {
      activeBakeThrottleTimer.current = setTimeout(
        () => { if (activeBakePending.current) sendToDb(activeBakePending.current); },
        THROTTLE_MS_ACTIVE - msSinceLast,
      );
    }
  }, [sendToDb]);

  const clearActiveBake = useCallback(() => {
    clearTimeout(activeBakeThrottleTimer.current);
    activeBakePending.current = null;
    try { localStorage.removeItem('bakeIt_activeBake'); } catch {}
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '__active_bake__', _activeBakeState: null, _deleted: true }),
    }).catch(() => {});
  }, []);

  // Immediate flush — called on visibilitychange, pagehide, beforeunload
  // sendBeacon is fire-and-forget and survives tab close / app suspend on iOS
  const flushActiveBake = useCallback((state) => {
    clearTimeout(activeBakeThrottleTimer.current);
    const raw = JSON.stringify(state);
    try { localStorage.setItem('bakeIt_activeBake', raw); } catch {}
    const payload = JSON.stringify({ id: '__active_bake__', _activeBakeState: raw });
    // sendBeacon — guaranteed delivery even on page unload
    const sent = navigator.sendBeacon?.('/api/logs', new Blob([payload], { type: 'application/json' }));
    // Fallback: keepalive fetch for browsers that don't support sendBeacon
    if (!sent) {
      fetch('/api/logs', {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      }).catch(() => {});
    }
    activeBakeLastSent.current = Date.now();
    activeBakePending.current  = null;
  }, []);

  return {
    saveRecipe, deleteRecipeDB, scheduleRecipeSave,
    saveBakeLog, deleteLogDB, scheduleLogSave,
    saveActiveBake, clearActiveBake, flushActiveBake,
  };
}
