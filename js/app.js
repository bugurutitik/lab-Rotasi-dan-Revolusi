/* ============================================================
   LABORATORIUM MAYA IPAS — app.js
   Titik masuk: penskalaan panggung 16:9, layar penuh, modal &
   toast, pengaturan suara, perekatan modul, layar muat awal,
   navigasi halaman, dan penanganan kesalahan global.
   ============================================================ */
'use strict';

const App = (() => {

  /* ---------------- Panggung 16:9 ---------------- */
  const STAGE_W = 1280, STAGE_H = 720;
  let stageScale = 1;
  function fitStage() {
    const stage = document.getElementById('stage');
    const s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    stageScale = s;
    stage.style.transform = `translate(-50%,-50%) scale(${s})`;
    if (typeof SceneMgr !== 'undefined') SceneMgr.onResize(stageScale);
  }
  const getScale = () => stageScale;

  /* ---------------- Toast ---------------- */
  function toast(msg, type = '') {
    const wrap = document.getElementById('toastWrap');
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 2600);
  }

  /* ---------------- Modal umum ---------------- */
  function modal({ title, body, actions = [] }) {
    const root = document.getElementById('modalRoot');
    root.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'modal';
    box.innerHTML = `<h3>${title || ''}</h3><div class="modal-body">${body || ''}</div><div class="modal-actions"></div>`;
    const act = box.querySelector('.modal-actions');
    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.className = 'btn ' + (a.cls || '');
      btn.innerHTML = (a.icon ? iconSVG(a.icon) : '') + '<span>' + a.label + '</span>';
      btn.addEventListener('click', () => { AudioSys.play('click'); if (a.onClick) a.onClick(closeModal); });
      act.appendChild(btn);
    });
    root.appendChild(box);
    root.classList.add('open');
    root.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    const root = document.getElementById('modalRoot');
    root.classList.remove('open');
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = '';
  }
  function confirmBox(title, text, onYes) {
    modal({
      title,
      body: `<p>${text}</p>`,
      actions: [
        { label: 'Batal', cls: 'ghost', onClick: c => c() },
        { label: 'Ya, lanjutkan', cls: 'green', icon: 'check', onClick: () => { closeModal(); onYes(); } }
      ]
    });
  }

  /* ---------------- Pengaturan suara ---------------- */
  function openSoundSettings() {
    const st = AudioSys.getSettings();
    modal({
      title: 'PENGATURAN SUARA',
      body: `
        <div class="range-row"><span>Musik latar</span>
          <input type="range" class="sl" id="rngMusic" min="0" max="100" value="${Math.round(st.music * 100)}"></div>
        <div class="range-row"><span>Efek suara</span>
          <input type="range" class="sl" id="rngSfx" min="0" max="100" value="${Math.round(st.sfx * 100)}"></div>
        <div class="range-row"><span>Narasi</span>
          <input type="range" class="sl" id="rngNarr" min="0" max="100" value="${Math.round((st.narration == null ? 0.9 : st.narration) * 100)}"></div>
        <div class="range-row"><span>Semua suara</span>
          <button class="btn ${st.muted ? '' : 'green'}" id="btnMuteAll"><span>${st.muted ? 'Suara Mati — Aktifkan' : 'Suara Aktif — Matikan'}</span></button></div>
        <p style="font-size:11.5px;color:#7189b3;font-weight:600;margin-top:6px">
          Narasi menggunakan rekaman suara TTS AI bahasa Indonesia (id-ID-ArdiNeural) yang tersimpan lokal.</p>`,
      actions: [{ label: 'Selesai', cls: 'cyan', onClick: c => c() }]
    });
    const rngM = document.getElementById('rngMusic');
    const rngS = document.getElementById('rngSfx');
    const rngN = document.getElementById('rngNarr');
    rngM.addEventListener('input', () => AudioSys.setMusic(rngM.value / 100));
    rngS.addEventListener('input', () => { AudioSys.setSfx(rngS.value / 100); AudioSys.play('click'); });
    rngN.addEventListener('input', () => AudioSys.setNarration(rngN.value / 100));
    rngN.addEventListener('change', () => {
      /* pratinjau volume: ulangi narasi HALAMAN SAAT INI (bukan narasi sambutan) */
      if (rngN.value > 0 && !Narrator.isNarrating()) Nav.narrateCurrent();
    });
    document.getElementById('btnMuteAll').addEventListener('click', () => {
      const m = AudioSys.toggleMute();
      openSoundSettings();
      updateSoundIcon();
      toast(m ? 'Semua suara dimatikan.' : 'Suara diaktifkan kembali.');
    });
  }

  function updateSoundIcon() {
    const st = AudioSys.getSettings();
    const btn = document.getElementById('btnSound');
    if (btn) btn.innerHTML = iconSVG(st.muted ? 'mute' : 'speaker');
  }

  /* ---------------- Tombol narasi ---------------- */
  function updateNarasiIcon() {
    const btn = document.getElementById('btnNarasi');
    if (!btn) return;
    btn.classList.toggle('narrating', Narrator.isNarrating());
  }

  /* ---------------- Layar penuh ---------------- */
  function toggleFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen || function () { }).call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function () { }).call(document);
    }
  }

  /* ---------------- Layar muat awal ---------------- */
  function preloadBootAssets(onProgress, onDone) {
    const gambar = [
      'assets/img/textures/earth_day.png', 'assets/img/textures/earth_zones.png',
      'assets/img/textures/moon.png', 'assets/img/textures/sun.png',
      'assets/img/textures/glow.png', 'assets/img/textures/star.png',
      'assets/icons/favicon.svg', 'assets/dev/dev-photo.png'
    ];
    const audioList = [
      'audio/music/labspace.mp3',
      'audio/sfx/click.wav', 'audio/sfx/pop.wav', 'audio/sfx/correct.wav',
      'audio/sfx/wrong.wav', 'audio/sfx/save.wav', 'audio/sfx/notify.wav',
      'audio/narasi/p00_sambutan1.mp3', 'audio/narasi/p01_balon1.mp3'
    ];
    const total = gambar.length + audioList.length + 1;
    let done = 0, fired = false;
    const finish = () => { if (!fired) { fired = true; onDone(); } };
    const step = () => {
      done++;
      if (onProgress) onProgress(Math.min(100, Math.round(done / total * 100)));
      if (done >= total) finish();
    };
    gambar.forEach(src => {
      const im = new Image();
      im.onload = step; im.onerror = step;
      im.src = src;
    });
    audioList.forEach(src => {
      try {
        const el = new Audio();
        let settled = false;
        const ok = () => { if (!settled) { settled = true; step(); } };
        el.addEventListener('canplaythrough', ok, { once: true });
        el.addEventListener('error', ok, { once: true });
        el.preload = 'auto';
        el.src = src;
        el.load();
        setTimeout(ok, 6000);
      } catch (e) { step(); }
    });
    try { document.fonts.load("700 16px Orbitron").then(step, step); } catch (e) { step(); }
    setTimeout(finish, 12000);
  }

  /* Prefetch narasi saat idle (mode http; mode file diabaikan) */
  function idlePrefetchNarrasi() {
    if (typeof NARASI_TEKS === 'undefined' || typeof fetch !== 'function') return;
    const ids = Object.keys(NARASI_TEKS);
    let i = 0;
    const next = () => {
      if (i >= ids.length) return;
      const id = ids[i++];
      fetch('audio/narasi/' + id + '.mp3', { cache: 'force-cache' })
        .catch(() => { /* offline/mode file — abaikan */ })
        .finally(() => setTimeout(next, 120));
    };
    setTimeout(next, 2500);
  }

  /* ---------------- Penanganan kesalahan ---------------- */
  window.addEventListener('error', e => {
    console.warn('Laboratorium Maya menangkap kesalahan:', e.message);
  });
  window.addEventListener('unhandledrejection', e => {
    console.warn('Laboratorium Maya menangkap penolakan promise:', e.reason);
  });

  /* ---------------- Boot ---------------- */
  function boot() {
    fitStage();
    window.addEventListener('resize', fitStage);

    mountIcons(document);
    AudioSys.init();
    Narrator.onStart(updateNarasiIcon);
    Narrator.onEnd(updateNarasiIcon);

    /* klik pertama: buka kunci audio + SFX tombol umum */
    document.addEventListener('pointerdown', e => {
      if (Nav.current !== 'p00') AudioSys.unlock();
      const b = e.target.closest('.btn, .sb-item, .ctlbtn, .menucard, .chip, .gal-obj, .opt, .wb-chip, .match-item, .hint-card, .feelopt, .mini-clock, .idn-city, .imgpick-opt, .exp-card, .tgl');
      if (b) AudioSys.play('click');
    }, { capture: true });

    document.getElementById('btnSound').addEventListener('click', openSoundSettings);
    document.getElementById('btnNarasi').addEventListener('click', () => {
      /* ulangi narasi halaman yang sedang dibuka */
      Nav.narrateCurrent();
    });
    document.getElementById('btnFullscreen').addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', () => {
      const btn = document.getElementById('btnFullscreen');
      btn.innerHTML = iconSVG(document.fullscreenElement ? 'shrink' : 'expand');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });

    /* inisialisasi modul halaman */
    Pages.init();
    Galeri.init();
    RotasiLab.init();
    RevolusiLab.init();
    ZonaLab.init();
    MusimLab.init();
    Eksperimen.init();
    Evaluasi.init();

    /* peta narasi halaman + narasi materi lanjutan */
    const PAGE_NARASI = {
      p00: 'p00_sambutan1', p01: 'p01_balon1', p02: 'p02_balon1',
      p03: 'p03_balon1', p04: 'p04_balon1', p05: 'p05_balon1',
      p06: 'p06_balon1', p07: 'p07_balon1', p08: 'p08_balon1',
      p09: 'p09_balon1', p10: 'p10_balon1', p11: 'p11_balon1', p12: 'p12_balon1'
    };
    for (const pg in PAGE_NARASI) Nav.setNarration(pg, PAGE_NARASI[pg]);
    /* setelah narasi pembuka, lab otomatis melanjutkan ke narasi materi konsep */
    const PAGE_NARASI_MATERI = {
      p04: 'p04_materi', p05: 'p05_materi', p06: 'p06_materi', p07: 'p07_materi'
    };
    for (const pg in PAGE_NARASI_MATERI) Nav.setNarration2(pg, PAGE_NARASI_MATERI[pg]);

    /* kait enter/leave halaman */
    Nav.register('p00', {
      enter: () => Pages.splashReset(),
      leave: () => Pages.splashLeave()
    });
    Nav.register('p01', { enter: () => Pages.renderHome() });
    Nav.register('p02', { enter: () => Pages.renderHints() });
    Nav.register('p03', { enter: () => Galeri.enter(), leave: () => Galeri.leave() });
    Nav.register('p04', { enter: () => RotasiLab.enter(), leave: () => RotasiLab.leave() });
    Nav.register('p05', { enter: () => RevolusiLab.enter(), leave: () => RevolusiLab.leave() });
    Nav.register('p06', { enter: () => ZonaLab.enter(), leave: () => ZonaLab.leave() });
    Nav.register('p07', { enter: () => MusimLab.enter(), leave: () => MusimLab.leave() });
    Nav.register('p08', { enter: () => Eksperimen.enter(), leave: () => Eksperimen.leave() });
    Nav.register('p09', { enter: () => Evaluasi.enter(), leave: () => Evaluasi.leave() });
    Nav.register('p10', { enter: () => Pages.enterReflection() });
    Nav.register('p11', { enter: () => {} });
    Nav.register('p12', { enter: () => {} });

    Nav.init();

    /* LAYAR MUAT AWAL */
    const loader = document.getElementById('bootLoader');
    const fill = document.getElementById('bootFill');
    const sub = document.getElementById('bootSub');
    preloadBootAssets(p => {
      if (fill) fill.style.width = p + '%';
      if (sub) sub.textContent = p < 100 ? 'Memuat aset… ' + p + '%' : 'Laboratorium siap!';
    }, () => {
      if (loader) {
        loader.classList.add('boot-done');
        setTimeout(() => loader.remove(), 520);
      }
      updateSoundIcon();
      try {
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      } catch (e) { /* mode file aman */ }
      Nav.go('p00');
      idlePrefetchNarrasi();
      console.log('%cLABORATORIUM MAYA IPAS siap! Rotasi & Revolusi Bumi.', 'color:#00e5ff;font-weight:bold');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  return { toast, modal, confirmBox, closeModal, openSoundSettings, fitStage, getScale, updateNarasiIcon };
})();

/* ============================================================
   NAVIGASI HALAMAN
   ============================================================ */
const Nav = (() => {
  let current = null;
  const hooks = {};       /* id -> {enter, leave} */
  const narasiPg = {};    /* id -> ID narasi */
  const narasiPg2 = {};   /* id -> ID narasi materi lanjutan */
  const visitedSession = new Set();

  function register(id, h) { hooks[id] = h; }
  function setNarration(id, narasiId) { narasiPg[id] = narasiId; }
  function setNarration2(id, narasiId) { narasiPg2[id] = narasiId; }

  /* Putar narasi pembuka; jika ada narasi materi, sambung otomatis. */
  function playNarasi() {
    const nid = narasiPg[current];
    if (!nid) {
      if (current === 'p03' && typeof Galeri !== 'undefined') Galeri.narrateObject();
      else if (current === 'p08' && typeof Eksperimen !== 'undefined') Eksperimen.narrateCurrent();
      return;
    }
    const nid2 = narasiPg2[current];
    Narrator.speak(nid, nid2 ? { onend: () => Narrator.speak(nid2) } : undefined);
  }

  function updateChrome(id) {
    const isSplash = id === 'p00';
    document.getElementById('sidebar').classList.toggle('on-splash', isSplash);
    document.getElementById('maincol').classList.toggle('on-splash', isSplash);
    document.getElementById('topbar2').classList.toggle('on-splash', isSplash);
    document.querySelectorAll('.sb-item').forEach(b => {
      b.classList.toggle('active', b.dataset.nav === id);
      b.classList.toggle('done', visitedSession.has(b.dataset.nav) && b.dataset.nav !== id);
    });
    /* judul topbar */
    const t = document.getElementById('tbTitle');
    const lab = document.getElementById('tbLab');
    const META = {
      p01: ['', 'BERANDA LABORATORIUM'],
      p02: ['PETUNJUK', 'CARA MENGGUNAKAN'],
      p03: ['GALERI', 'GALERI TATA SURYA'],
      p04: ['LAB 01', 'LABORATORIUM ROTASI BUMI'],
      p05: ['LAB 02', 'LABORATORIUM REVOLUSI BUMI'],
      p06: ['LAB 03', 'LABORATORIUM ZONA WAKTU'],
      p07: ['LAB 04', 'LABORATORIUM PERGANTIAN MUSIM'],
      p08: ['LAB 05', 'RUANG EKSPERIMEN VIRTUAL'],
      p09: ['EVALUASI', 'EVALUASI PEMAHAMAN'],
      p10: ['REFLEKSI', 'REFLEKSI PENELITI MUDA'],
      p11: ['INFO', 'KREDIT & REFERENSI'],
      p12: ['INFO', 'PENGEMBANG']
    };
    const m = META[id] || ['', ''];
    if (t) t.textContent = m[1];
    if (lab) { lab.textContent = m[0]; lab.style.display = m[0] ? '' : 'none'; }
  }

  function go(id, opts = {}) {
    if (current === id) return;
    const prev = current;
    if (prev && hooks[prev] && hooks[prev].leave) hooks[prev].leave();
    Narrator.stop(); App.updateNarasiIcon();
    if (typeof SceneMgr !== 'undefined') SceneMgr.setActive(id);

    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === id));
    current = id;
    visitedSession.add(id);
    Store.markVisited(id);
    updateChrome(id);

    if (hooks[id] && hooks[id].enter) hooks[id].enter();
    if (!opts.silent) {
      setTimeout(playNarasi, 420);
    }
  }

  function narrateCurrent() {
    /* tombol narasi: pada galeri & eksperimen, jelaskan objek/percobaan saat ini */
    if (current === 'p03' && typeof Galeri !== 'undefined') { Galeri.narrateObject(); return; }
    if (current === 'p08' && typeof Eksperimen !== 'undefined') { Eksperimen.narrateCurrent(); return; }
    playNarasi();
  }

  function init() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      const id = el.dataset.nav;
      if (!id) return;
      el.addEventListener('click', () => { go(id); });
    });
    document.getElementById('sbLogo').addEventListener('click', () => go('p01'));
  }

  return { register, setNarration, setNarration2, go, init, narrateCurrent, get current() { return current; } };
})();
