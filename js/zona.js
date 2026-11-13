/* ============================================================
   LABORATORIUM MAYA IPAS — zona.js
   Lab 03: rotasi Bumi menyebabkan perbedaan waktu. Bola Bumi 3D
   dengan garis bujur tiap 15°, pin kota, peta Indonesia WIB/WITA/
   WIT, dan jam digital yang mengikuti wilayah yang dipilih.
   ============================================================ */
'use strict';

const ZonaLab = (() => {

  const KOTA = [
    { id: 'london', nama: 'London (Greenwich)', lat: 51.5, lon: 0, off: 0, zona: 'GMT', warna: '#ffc44d' },
    { id: 'medan', nama: 'Medan', lat: 3.6, lon: 98.7, off: 7, zona: 'WIB', warna: '#2dd68a' },
    { id: 'jakarta', nama: 'Jakarta', lat: -6.2, lon: 106.8, off: 7, zona: 'WIB', warna: '#2dd68a' },
    { id: 'pontianak', nama: 'Pontianak', lat: -0.03, lon: 109.3, off: 7, zona: 'WIB', warna: '#2dd68a' },
    { id: 'surabaya', nama: 'Surabaya', lat: -7.3, lon: 112.7, off: 7, zona: 'WIB', warna: '#2dd68a' },
    { id: 'denpasar', nama: 'Denpasar', lat: -8.65, lon: 115.2, off: 8, zona: 'WITA', warna: '#37e6ff' },
    { id: 'makassar', nama: 'Makassar', lat: -5.15, lon: 119.4, off: 8, zona: 'WITA', warna: '#37e6ff' },
    { id: 'ambon', nama: 'Ambon', lat: -3.7, lon: 128.2, off: 9, zona: 'WIT', warna: '#b79bff' },
    { id: 'jayapura', nama: 'Jayapura', lat: -2.5, lon: 140.7, off: 9, zona: 'WIT', warna: '#b79bff' }
  ];
  const MINI = ['london', 'jakarta', 'denpasar', 'jayapura'];

  let built = false;
  let sel = 'jakarta';
  let wibTime = 9;          /* jam WIB simulasi 0-24 */
  let playing = false;
  let showPinLabels = true;

  let earth, pins = {};
  const S = () => SceneMgr.scenes['p06'];

  const kotaById = id => KOTA.find(k => k.id === id);

  function jamKota(k, menitTambahan = 0) {
    let h = wibTime + (k.off - 7) + menitTambahan / 60;
    h = ((h % 24) + 24) % 24;
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
    return { hh, mm, str: String(hh).padStart(2, '0') + '.' + String(mm).padStart(2, '0') };
  }

  /* ================= build scene 3D ================= */
  function buildScene() {
    built = true;
    SceneMgr.mount('p06', (s) => {
      const scene = s.scene, cam = s.camera;
      addStars(scene, 800, 2400);

      earth = makeEarth(100, { zones: true });
      scene.add(earth);

      /* Matahari dari kanan */
      const sunGlow = makeGlow(800, 0xffd76a, 0.8);
      sunGlow.position.set(1100, 30, 0);
      scene.add(sunGlow);
      const sunM = makeSun(130);
      sunM.position.set(1250, 30, 0);
      scene.add(sunM);
      scene.add(new THREE.AmbientLight(0x2a4a77, 1.05));
      const dl = new THREE.DirectionalLight(0xfff2d8, 1.5);
      dl.position.set(1000, 80, 60);
      scene.add(dl);

      /* pin kota (tinggi label berselang-seling agar tidak bertumpuk) */
      let kIdx = 0;
      KOTA.forEach(k => {
        if (k.id === 'london') return;   /* London ada di daftar, pin hanya kota Indonesia */
        const pin = makePin(parseInt(k.warna.slice(1), 16));
        const v = latLonToVec3(k.lat, k.lon, 103);
        pin.position.copy(v);
        earth.add(pin);
        const rr = (kIdx++ % 2 === 0) ? 118 : 134;
        const lab = makeLabel(k.nama, { fontSize: 48, screenH: 0.02, color: k.warna });
        lab.position.copy(latLonToVec3(k.lat, k.lon, rr));
        earth.add(lab);
        pins[k.id] = { pin, lab };
      });

      const ctl = new OrbitCam(cam, s.canvas, {
        dist: 320, theta: -Math.PI / 2, phi: 1.05,
        minDist: 130, maxDist: 900
      });
      s.controls = ctl;

      /* klik pin */
      const ray = new THREE.Raycaster();
      let downPos = null, downT = 0;
      s.canvas.addEventListener('pointerdown', e => { downPos = [e.clientX, e.clientY]; downT = Date.now(); });
      s.canvas.addEventListener('pointerup', e => {
        if (!downPos) return;
        const d = Math.hypot(e.clientX - downPos[0], e.clientY - downPos[1]);
        downPos = null;
        if (d > 8 || Date.now() - downT > 600) return;
        const rect = s.canvas.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        ray.setFromCamera({ x: nx, y: ny }, cam);
        const hits = ray.intersectObjects(Object.values(pins).map(p => p.pin), true);
        if (hits.length) {
          let o = hits[0].object;
          while (o && !o.userData.objId && o.parent) o = o.parent;
          /* cari pin lewat posisi */
          for (const id in pins) {
            if (pins[id].pin === o || pins[id].pin.children.includes(o) || pins[id].pin === hits[0].object) {
              select(id); AudioSys.play('pop'); return;
            }
          }
        }
      });

      let t = 0;
      s.tick = (dt) => {
        if (playing) {
          wibTime += dt * 0.25;   /* 1 jam simulasi per 4 detik */
          if (wibTime >= 24) wibTime -= 24;
          updateSim();
        }
        t += dt;
        /* rotasi Bumi: bujur 0 (Greenwich) menghadap Matahari saat GMT 12 */
        const gmt = ((wibTime - 7) % 24 + 24) % 24;
        const subsolar = (gmt - 12) * 15;
        earth.rotation.y = -subsolar * Math.PI / 180;
        sunM.rotation.y += dt * 0.05;
        /* kamera mengikuti kota terpilih */
        const k = kotaById(sel);
        if (k && k.id !== 'london') {
          const v = latLonToVec3(k.lat, k.lon, 1);
          const azBase = Math.atan2(v.z, v.x);
          const worldAz = azBase - earth.rotation.y;
          ctl.theta += (worldAz - ctl.theta) * 0.15;
        } else {
          ctl.theta += (-Math.PI / 2 - ctl.theta) * 0.05;
        }
      };
      updateSim();
    });
    buildMap();
    buildChips();
    buildMiniClocks();
    wireControls();
  }

  /* ================= peta Indonesia (SVG) ================= */
  function buildMap() {
    const wrap = document.getElementById('zkMap');
    if (!wrap) return;
    const x = lon => (lon - 93) / 48 * 320;
    /* pulau sederhana: [path, zona] — zona: 0 WIB, 1 WITA, 2 WIT */
    const pulau = [
      [`M ${x(95)},92 C ${x(98)},74 ${x(103)},56 ${x(106)},40 C ${x(108)},33 ${x(112)},30 ${x(114)},34 C ${x(111)},44 ${x(108)},52 ${x(106)},62 C ${x(104)},72 ${x(101)},84 ${x(98)},94 Z`, 0, 'Sumatra'],
      [`M ${x(105)},98 C ${x(112)},96 ${x(122)},97 ${x(132)},99 C ${x(140)},100 ${x(146)},100 ${x(150)},99 L ${x(150)},103 C ${x(140)},104 ${x(122)},103 ${x(110)},102 Z`, 0, 'Jawa'],
      [`M ${x(109)},38 C ${x(118)},22 ${x(132)},14 ${x(146)},20 C ${x(156)},24 ${x(159)},36 ${x(156)},48 C ${x(153)},58 ${x(146)},66 ${x(137)},66 C ${x(126)},66 ${x(114)},58 ${x(109)},46 Z`, 0, 'Kalimantan Barat-Tengah'],
      [`M ${x(146)},66 C ${x(152)},62 ${x(158)},56 ${x(161)},48 C ${x(164)},40 ${x(168)},38 ${x(170)},44 C ${x(169)},54 ${x(165)},63 ${x(158)},69 C ${x(153)},72 ${x(148)},71 ${x(146)},66 Z`, 1, 'Kalimantan Selatan-Timur'],
      [`M ${x(152)},103 C ${x(154)},100 ${x(157)},100 ${x(158)},103 Z M ${x(160)},104 C ${x(163)},101 ${x(166)},101 ${x(167)},104 Z M ${x(174)},105 C ${x(177)},102 ${x(181)},102 ${x(182)},105 Z M ${x(187)},106 C ${x(190)},103 ${x(194)},104 ${x(193)},107 Z`, 1, 'Bali & Nusa Tenggara'],
      [`M ${x(197)},30 C ${x(203)},26 ${x(209)},30 ${x(210)},38 C ${x(211)},46 ${x(216)},52 ${x(222)},54 C ${x(228)},56 ${x(232)},62 ${x(228)},68 C ${x(223)},70 ${x(218)},66 ${x(213)},62 C ${x(208)},58 ${x(204)},62 ${x(200)},58 C ${x(196)},52 ${x(194)},40 ${x(197)},30 Z`, 1, 'Sulawesi'],
      [`M ${x(238)},44 C ${x(241)},40 ${x(245)},41 ${x(245)},46 Z M ${x(248)},54 C ${x(251)},50 ${x(255)},51 ${x(255)},56 Z M ${x(240)},68 C ${x(243)},64 ${x(247)},65 ${x(247)},70 Z`, 2, 'Maluku'],
      [`M ${x(252)},22 C ${x(262)},16 ${x(274)},14 ${x(284)},18 C ${x(294)},22 ${x(301)},30 ${x(303)},40 C ${x(305)},50 ${x(300)},58 ${x(292)},60 C ${x(284)},62 ${x(276)},58 ${x(270)},52 C ${x(264)},46 ${x(256)},40 ${x(252)},32 Z`, 2, 'Papua']
    ];
    const zonaFill = ['rgba(45,174,96,.28)', 'rgba(0,168,204,.25)', 'rgba(150,110,240,.25)'];
    const zonaStroke = ['#1e9e5a', '#0092b8', '#8a5cf6'];

    let svg = `<svg viewBox="0 0 320 122" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Peta zona waktu Indonesia">`;
    svg += `<rect x="0" y="0" width="320" height="122" fill="#eef6ff"/>`;
    /* garis pembatas zona */
    const bx1 = x(114), bx2 = x(127.5);
    svg += `<line x1="${bx1}" y1="4" x2="${bx1}" y2="112" stroke="#3d6a9e" stroke-width="1.2" stroke-dasharray="4 3" opacity=".6"/>`;
    svg += `<line x1="${bx2}" y1="4" x2="${bx2}" y2="112" stroke="#3d6a9e" stroke-width="1.2" stroke-dasharray="4 3" opacity=".6"/>`;
    svg += `<rect x="6" y="4" width="${bx1 - 12}" height="112" fill="rgba(45,174,96,.06)"/>`;
    svg += `<rect x="${bx1}" y="4" width="${bx2 - bx1}" height="112" fill="rgba(0,168,204,.06)"/>`;
    svg += `<rect x="${bx2}" y="4" width="${314 - bx2}" height="112" fill="rgba(150,110,240,.06)"/>`;
    pulau.forEach(([d, z]) => {
      svg += `<path d="${d}" fill="${zonaFill[z]}" stroke="${zonaStroke[z]}" stroke-width="1.1"/>`;
    });
    /* label zona */
    svg += `<text x="${(6 + bx1) / 2}" y="118" text-anchor="middle" class="idn-zone-label" fill="#128a4e" font-size="9">WIB (GMT+7)</text>`;
    svg += `<text x="${(bx1 + bx2) / 2}" y="118" text-anchor="middle" class="idn-zone-label" fill="#0079a8" font-size="9">WITA (GMT+8)</text>`;
    svg += `<text x="${(bx2 + 314) / 2}" y="118" text-anchor="middle" class="idn-zone-label" fill="#6a3fd6" font-size="9">WIT (GMT+9)</text>`;
    /* kota */
    KOTA.filter(k => k.id !== 'london').forEach(k => {
      const cx = x(k.lon), cy = 108 - (k.lat + 8) * 1.05;
      svg += `<g class="idn-city" data-city="${k.id}" tabindex="0">
        <circle cx="${cx}" cy="${cy}" r="7" fill="transparent"/>
        <circle cx="${cx}" cy="${cy}" r="3.4" class="core" fill="${k.warna}" style="color:${k.warna}"/>
        <circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="${k.warna}" stroke-width="1" opacity=".5"/>
        <text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="#1c4a7a" font-size="7.5" font-weight="600">${k.nama}</text>
      </g>`;
    });
    svg += `</svg>`;
    wrap.innerHTML = svg;
    wrap.querySelectorAll('.idn-city').forEach(g => {
      g.addEventListener('click', () => select(g.dataset.city));
    });
  }

  /* ================= chip kota & jam mini ================= */
  function buildChips() {
    const wrap = document.getElementById('zkChips');
    if (!wrap) return;
    wrap.innerHTML = '';
    KOTA.forEach(k => {
      const c = document.createElement('button');
      c.className = 'chip';
      c.dataset.city = k.id;
      c.innerHTML = `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${k.warna};margin-right:6px;vertical-align:baseline"></span>${k.nama} · ${k.zona}`;
      c.addEventListener('click', () => select(k.id));
      wrap.appendChild(c);
    });
  }

  function buildMiniClocks() {
    const wrap = document.getElementById('zkMinis');
    if (!wrap) return;
    wrap.innerHTML = '';
    MINI.forEach(id => {
      const k = kotaById(id);
      const d = document.createElement('button');
      d.className = 'mini-clock';
      d.dataset.city = id;
      d.innerHTML = `<div class="mc-city">${k.nama.split(' ')[0].toUpperCase()}</div>
        <div class="mc-time" id="mct-${id}">--.--</div>
        <div class="mc-zone">${k.zona} (GMT+${k.off})</div>`;
      d.addEventListener('click', () => select(id));
      wrap.appendChild(d);
    });
  }

  /* ================= pemilihan kota ================= */
  function select(id) {
    const k = kotaById(id);
    if (!k) return;
    sel = id;
    document.querySelectorAll('#zkChips .chip').forEach(c => c.classList.toggle('on', c.dataset.city === id));
    document.querySelectorAll('.mini-clock').forEach(c => c.classList.toggle('on', c.dataset.city === id));
    document.querySelectorAll('.idn-city').forEach(g => g.classList.toggle('on', g.dataset.city === id));
    updateSim();
    /* dekati kota di 3D */
    const s = S();
    if (s && s.controls && k.id !== 'london') {
      s.controls.flyTo({ dist: 240 });
    } else if (s && s.controls) {
      s.controls.flyTo({ dist: 320 });
    }
  }

  /* ================= status ================= */
  function updateSim() {
    const k = kotaById(sel);
    const j = jamKota(k);
    const big = document.getElementById('zkClock');
    if (big) big.textContent = j.str;
    const nm = document.getElementById('zkCity');
    if (nm) nm.textContent = k.nama.toUpperCase();
    const of = document.getElementById('zkOffset');
    if (of) of.textContent = `${k.zona}${k.zona === 'GMT' ? ' — patokan garis bujur 0°' : ` — GMT+${k.off}`}`;

    MINI.forEach(id => {
      const el = document.getElementById('mct-' + id);
      if (el) el.textContent = jamKota(kotaById(id)).str;
    });

    /* slider */
    const sl = document.getElementById('zkTime');
    if (sl && document.activeElement !== sl) sl.value = Math.round(wibTime * 2) / 2;
    document.getElementById('zkTimeVal').textContent =
      String(Math.floor(wibTime)).padStart(2, '0') + '.00 WIB';

    /* info selisih */
    const selisih = document.getElementById('zkSelisih');
    if (selisih) {
      const contoh = jamKota(kotaById('jakarta'));
      const contoh2 = jamKota(kotaById('jayapura'));
      selisih.innerHTML = `
        <div class="kv"><span>Contoh perbedaan</span><b>Jakarta ${contoh.str} WIB → Jayapura ${contoh2.str} WIT</b></div>
        <div class="kv"><span>Selisih WIB ke WIT</span><b class="hl">+2 jam</b></div>
        <div class="kv"><span>Status ${k.nama}</span><b>${(j.hh >= 6 && j.hh < 18) ? 'Siang' : 'Malam'}</b></div>`;
    }
  }

  /* ================= kontrol ================= */
  function wireControls() {
    const el = id => document.getElementById(id);
    el('zkPlay').addEventListener('click', () => {
      playing = !playing;
      el('zkPlay').innerHTML = iconSVG(playing ? 'pause' : 'play') +
        `<span>${playing ? 'JEDA WAKTU' : 'JALANKAN WAKTU'}</span>`;
    });
    el('zkReset').addEventListener('click', () => {
      playing = false;
      wibTime = 9;
      el('zkPlay').innerHTML = iconSVG('play') + '<span>JALANKAN WAKTU</span>';
      select('jakarta');
      updateSim();
      AudioSys.play('sweep');
    });
    el('zkTime').addEventListener('input', e => {
      wibTime = +e.target.value;
      updateSim();
    });
    el('zkTglLabel').addEventListener('click', () => {
      showPinLabels = !showPinLabels;
      el('zkTglLabel').classList.toggle('on', showPinLabels);
      for (const id in pins) pins[id].lab.visible = showPinLabels;
    });
  }

  /* ================= siklus ================= */
  function enter() {
    if (!built) buildScene();
    const s = S();
    if (s && !s.running) s.start();
    updateSim();
  }
  function leave() {
    const s = S();
    if (s) s.stop();
  }
  function init() { /* dibangun saat pertama masuk */ }

  return { init, enter, leave };
})();
