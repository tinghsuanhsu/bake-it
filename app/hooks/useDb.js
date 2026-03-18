// ─── useDb — all server persistence logic in one place ────────────────────────
import { useCallback, useRef } from 'react';

const DEBOUNCE_MS_RECIPE = 1200;
const DEBOUNCE_MS_LOG    = 1200;

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
  const activeBakeSaveTimer = useRef(null);

  const saveActiveBake = useCallback((state) => {
    const raw = JSON.stringify(state);
    try { localStorage.setItem('bakeIt_activeBake', raw); } catch {}
    clearTimeout(activeBakeSaveTimer.current);
    activeBakeSaveTimer.current = setTimeout(() => {
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '__active_bake__', _activeBakeState: raw }),
      }).catch(() => {});
    }, 10_000);
  }, []);

  const clearActiveBake = useCallback(() => {
    clearTimeout(activeBakeSaveTimer.current);
    try { localStorage.removeItem('bakeIt_activeBake'); } catch {}
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '__active_bake__', _activeBakeState: null, _deleted: true }),
    }).catch(() => {});
  }, []);

  const flushActiveBake = useCallback((state) => {
    // Immediate flush — used on visibilitychange (tab going to background)
    clearTimeout(activeBakeSaveTimer.current);
    const raw = JSON.stringify(state);
    try { localStorage.setItem('bakeIt_activeBake', raw); } catch {}
    const blob = new Blob(
      [JSON.stringify({ id: '__active_bake__', _activeBakeState: raw })],
      { type: 'application/json' },
    );
    navigator.sendBeacon?.('/api/logs', blob);
  }, []);

  return {
    saveRecipe, deleteRecipeDB, scheduleRecipeSave,
    saveBakeLog, deleteLogDB, scheduleLogSave,
    saveActiveBake, clearActiveBake, flushActiveBake,
  };
}
