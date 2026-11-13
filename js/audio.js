/* ============================================================
   LABORATORIUM MAYA IPAS — audio.js
   Audio lokal: musik latar (audio/music/labspace.mp3),
   efek suara (audio/sfx/*.wav), dan narasi (audio/narasi/*.mp3,
   TTS AI suara Indonesia id-ID-ArdiNeural).
   - Narasi memakai rekaman lokal; teks dinamis yang belum
     terekam jatuh ke suara perangkat (Web Speech, prioritas
     id-ID); bila tak tersedia, narasi senyap dan aplikasi
     tetap berjalan.
   - Narasi lama SELALU dihentikan saat narasi baru dimulai
     atau saat berpindah halaman (tidak bertumpuk).
   - Kontrol: mute, volume musik, efek, dan narasi.
   ============================================================ */
'use strict';

/* ---------------- Narasi ---------------- */
const Narrator = (() => {
  let lastId = '', lastAt = 0, token = 0;
  let narEl = null;
  let onStartCb = null, onEndCb = null;
  let rev = null;

  function buildRev() {
    if (rev || typeof NARASI_TEKS === 'undefined') return;
    rev = {};
    for (const id in NARASI_TEKS) rev[NARASI_TEKS[id]] = id;
  }

  function volNow() {
    const st = (typeof Store !== 'undefined' && Store.getSettings) ? Store.getSettings() : {};
    return st.narration == null ? 0.9 : st.narration;
  }
  function muted() {
    const st = (typeof Store !== 'undefined' && Store.getSettings) ? Store.getSettings() : {};
    return !!st.muted;
  }

  function playLocal(id, onOk, onDone) {
    let ended = false;
    const finish = fn => { if (!ended) { ended = true; if (fn) fn(); } };
    try {
      if (narEl) { try { narEl.pause(); } catch (e) { /* aman */ } narEl = null; }
      const el = new Audio('audio/narasi/' + id + '.mp3');
      el.preload = 'auto';
      el.volume = Math.max(0, Math.min(1, volNow()));
      narEl = el;
      el.addEventListener('playing', onOk, { once: true });
      const fin = () => { if (narEl === el) narEl = null; finish(onDone); };
      el.addEventListener('ended', fin, { once: true });
      el.addEventListener('error', fin, { once: true });
      const p = el.play();
      if (p && p.catch) p.catch(fin);
    } catch (e) { finish(onDone); }
  }

  function onStart(fn) { onStartCb = typeof fn === 'function' ? fn : null; }
  function onEnd(fn) { onEndCb = typeof fn === 'function' ? fn : null; }

  function stopCurrent() {
    if (narEl) { try { narEl.pause(); } catch (e) { /* aman */ } narEl = null; }
    try {
      const SS = window.speechSynthesis;
      if (SS) SS.cancel();
    } catch (e) { /* aman */ }
  }

  /* Ucapkan teks atau ID narasi yang sudah terekam. */
  function speak(text, opts = {}) {
    if (!text) return false;
    if (muted() || volNow() <= 0.001) return false;
    buildRev();
    stopCurrent();
    let id = null, isi = text;
    if (typeof NARASI_TEKS !== 'undefined' && NARASI_TEKS[text]) { id = text; isi = NARASI_TEKS[text]; }
    else if (rev && rev[text]) { id = rev[text]; isi = text; }
    lastId = id || ('dyn:' + text); lastAt = Date.now();
    const my = ++token;
    const fireStart = () => {
      if (my !== token) return;
      if (onStartCb) onStartCb(lastId);
      if (typeof opts.onstart === 'function') opts.onstart();
    };
    const fireEnd = () => {
      if (my === token && onEndCb) onEndCb(lastId);
      if (my === token && typeof opts.onend === 'function') opts.onend();
    };
    if (id) {
      playLocal(id, fireStart, fireEnd);
      return true;
    }
    return speakDynamic(isi, my, fireStart, fireEnd);
  }

  /* Narasi dinamis memakai suara perangkat (prioritas id-ID). */
  function speakDynamic(text, my, fireStart, fireEnd) {
    const SS = window.speechSynthesis;
    if (!SS || typeof SpeechSynthesisUtterance === 'undefined') return false;
    try {
      SS.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'id-ID';
      u.volume = Math.max(0, Math.min(1, volNow()));
      u.rate = 0.95; u.pitch = 1.03;
      try {
        const vs = SS.getVoices() || [];
        const vok = vs.find(v => /^id([-_]|$)/i.test(v.lang)) || vs.find(v => /indonesia/i.test(v.name || ''));
        if (vok) u.voice = vok;
      } catch (e) { /* suara bawaan */ }
      u.onstart = fireStart;
      u.onend = fireEnd;
      u.onerror = fireEnd;
      SS.speak(u);
      return true;
    } catch (e) { return false; }
  }

  /* Terapkan volume narasi saat ini ke narasi yang sedang berbunyi
     (dipanggil saat penggeser volume di pengaturan digeser). */
  function applyVolume() {
    const v = Math.max(0, Math.min(1, volNow()));
    if (narEl) { try { narEl.volume = v; } catch (e) { /* aman */ } }
  }

  function stop() { token++; stopCurrent(); }
  function isNarrating() { return !!narEl; }

  return { speak, stop, onStart, onEnd, isNarrating, applyVolume };
})();

/* ---------------- Sistem audio (musik + efek) ---------------- */
const AudioSys = (() => {
  let music = null, musicOn = false;
  const sfxCache = {};

  function init() {
    const st = Store.getSettings();
    applyVolumes(st);
  }

  /* Buka kunci audio (dipanggil dari gestur pertama pengguna). */
  function unlock() {
    try {
      if (!music) {
        music = new Audio('audio/music/labspace.mp3');
        music.loop = true;
        music.preload = 'auto';
      }
      const st = Store.getSettings();
      music.volume = st.muted ? 0 : st.music;
      if (st.music > 0.001 && !st.muted && !musicOn) {
        const p = music.play();
        musicOn = true;
        if (p && p.catch) p.catch(() => { musicOn = false; });
      }
    } catch (e) { /* aman */ }
  }

  function applyVolumes(st) {
    if (music) music.volume = st.muted ? 0 : st.music;
    if (st.muted) { musicOn = false; try { if (music) music.pause(); } catch (e) { /* aman */ } }
    else if (music && music.paused && st.music > 0.001) {
      const p = music.play();
      musicOn = true;
      if (p && p.catch) p.catch(() => { musicOn = false; });
    }
  }

  function play(name) {
    try {
      const st = Store.getSettings();
      if (st.muted || st.sfx <= 0.001) return;
      let el = sfxCache[name];
      if (!el) {
        el = new Audio('audio/sfx/' + name + '.wav');
        sfxCache[name] = el;
      }
      el.volume = Math.max(0, Math.min(1, st.sfx));
      try { el.currentTime = 0; } catch (e) { /* aman */ }
      const p = el.play();
      if (p && p.catch) p.catch(() => { /* aman */ });
    } catch (e) { /* aman */ }
  }

  const getSettings = () => Store.getSettings();
  function saveSettings(s) { Store.saveSettings(s); applyVolumes(s); }
  function setMusic(v) { const s = Store.getSettings(); s.music = v; saveSettings(s); }
  function setSfx(v) { const s = Store.getSettings(); s.sfx = v; saveSettings(s); }
  function setNarration(v) {
    const s = Store.getSettings(); s.narration = v; Store.saveSettings(s);
    /* langsung terasa pada narasi yang sedang berbunyi */
    if (typeof Narrator !== 'undefined' && Narrator.applyVolume) Narrator.applyVolume();
  }
  function toggleMute() {
    const s = Store.getSettings(); s.muted = !s.muted; saveSettings(s);
    if (s.muted) Narrator.stop();
    return s.muted;
  }

  return { init, unlock, play, getSettings, setMusic, setSfx, setNarration, toggleMute };
})();
