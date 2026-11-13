/* ============================================================
   LABORATORIUM MAYA IPAS — storage.js
   Penyimpanan lokal (localStorage): pengaturan, progres
   kunjungan, refleksi, dan skor evaluasi terbaik.
   ============================================================ */
'use strict';

const Store = (() => {
  const KEYS = {
    settings: 'lmr_settings',
    visited: 'lmr_visited',
    reflection: 'lmr_reflection',
    bestScore: 'lmr_best',
    draft: 'lmr_draft'
  };

  function read(key, def) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : def;
    } catch (e) { return def; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  const getSettings = () => read(KEYS.settings, { music: .35, sfx: .8, narration: .9, muted: false });
  const saveSettings = s => write(KEYS.settings, s);

  const getVisited = () => read(KEYS.visited, []);
  function markVisited(page) {
    const v = getVisited();
    if (!v.includes(page)) { v.push(page); write(KEYS.visited, v); }
  }

  const getReflection = () => read(KEYS.reflection, null);
  const saveReflection = r => write(KEYS.reflection, r);

  const getBest = () => read(KEYS.bestScore, null);
  function setBest(pct) {
    const b = getBest();
    if (b == null || pct > b) write(KEYS.bestScore, pct);
  }

  return { getSettings, saveSettings, getVisited, markVisited, getReflection, saveReflection, getBest, setBest, KEYS };
})();
