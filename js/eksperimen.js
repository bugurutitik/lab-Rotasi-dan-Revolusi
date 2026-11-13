/* ============================================================
   LABORATORIUM MAYA IPAS — eksperimen.js
   Ruang Eksperimen Virtual: 5 percobaan yang dijalankan siswa.
   E1 Model Matahari-Bumi-Bulan (3D), E2 Simulasi Siang-Malam
   (3D, senter + globe seperti kegiatan buku), E3 Jam Matahari
   (2D, bayangan pensil), E4 Pengamatan Fase Bulan (2D),
   E5 Pengamatan Pergantian Musim (2D).
   Setiap percobaan punya tujuan, petunjuk, kontrol, hasil
   pengamatan, dan kesimpulan.
   ============================================================ */
'use strict';

const Eksperimen = (() => {

  let currentExp = null;   /* null = hub */

  const EXPS = [
    { id: 'e1', icon: 'planet', judul: 'Model Matahari, Bumi, dan Bulan', desc: 'Susun posisi tiga benda langit dan amati geraknya.' },
    { id: 'e2', icon: 'senter', judul: 'Simulasi Siang dan Malam', desc: 'Arahkan senter ke bola Bumi, lalu putar porosnya.' },
    { id: 'e3', icon: 'sunrise', judul: 'Jam Matahari', desc: 'Amati perubahan bayangan pensil sepanjang hari.' },
    { id: 'e4', icon: 'moon', judul: 'Pengamatan Fase Bulan', desc: 'Ubah posisi Bulan dan lihat bentuknya dari Bumi.' },
    { id: 'e5', icon: 'season', judul: 'Pengamatan Pergantian Musim', desc: 'Ubah posisi Bumi dan bandingkan cahaya dua belahan.' }
  ];

  /* ================= HUB ================= */
  function renderHub() {
    currentExp = null;
    document.querySelectorAll('.exp-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('expHub').classList.remove('hidden');
    /* hentikan scene 3D eksperimen */
    ['exp1', 'exp2'].forEach(id => {
      const s = SceneMgr.scenes[id];
      if (s) s.stop();
    });
  }

  function openExp(id) {
    currentExp = id;
    document.getElementById('expHub').classList.add('hidden');
    document.querySelectorAll('.exp-view').forEach(v => v.classList.add('hidden'));
    const v = document.getElementById('view-' + id);
    v.classList.remove('hidden');
    if (id === 'e1') { buildE1(); const s = SceneMgr.scenes['exp1']; if (s) { SceneMgr.resizeOne('exp1'); s.start(); } }
    if (id === 'e2') { buildE2(); const s = SceneMgr.scenes['exp2']; if (s) { SceneMgr.resizeOne('exp2'); s.start(); } }
    if (id === 'e3') buildE3();
    if (id === 'e4') buildE4();
    if (id === 'e5') buildE5();
    /* narasi: petunjuk singkat dilanjutkan narasi materi konsep */
    Narrator.speak(id + '_brief', { onend: () => Narrator.speak(id + '_materi') });
  }

  function buildHub() {
    const wrap = document.getElementById('expCards');
    if (wrap.dataset.built) return;
    wrap.dataset.built = '1';
    EXPS.forEach((e, i) => {
      const b = document.createElement('button');
      b.className = 'menucard rise rise-' + ((i % 4) + 1);
      b.innerHTML = `
        <span class="mc-icon">${iconSVG(e.icon)}</span>
        <span class="mc-title">EKSPERIMEN ${i + 1}</span>
        <span class="mc-desc"><b style="color:var(--ink)">${e.judul}</b><br>${e.desc}</span>
        <span class="mc-go">JALANKAN ${iconSVG('chevR')}</span>`;
      b.addEventListener('click', () => openExp(e.id));
      wrap.appendChild(b);
    });
    /* tombol kembali tiap eksperimen */
    document.querySelectorAll('[data-back-hub]').forEach(b => {
      b.addEventListener('click', () => { renderHub(); Narrator.speak('p08_balon1'); });
    });
    /* tombol kesimpulan */
    document.querySelectorAll('[data-simpulan]').forEach(b => {
      b.addEventListener('click', () => {
        const target = document.getElementById(b.dataset.simpulan);
        if (target) {
          target.classList.toggle('hidden');
          if (!target.classList.contains('hidden')) {
            AudioSys.play('correct');
            target.classList.add('pop-in');
            /* gulir panel agar kesimpulan penuh terlihat, bukan terpotong di bawah */
            setTimeout(() => {
              try {
                const pnl = target.closest('.lab-panel') || target.parentElement;
                if (pnl && pnl.scrollHeight > pnl.clientHeight) {
                  pnl.scrollTo({ top: pnl.scrollHeight, behavior: 'smooth' });
                } else {
                  target.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
              } catch (e) { /* aman */ }
            }, 60);
          }
        }
      });
    });
  }

  function narrateCurrent() {
    if (currentExp) Narrator.speak(currentExp + '_brief', { onend: () => Narrator.speak(currentExp + '_materi') });
    else Narrator.speak('p08_balon1');
  }

  /* ============================================================
     E1 — MODEL MATAHARI, BUMI, DAN BULAN (3D)
     ============================================================ */
  let e1Built = false;
  let e1moonAngle = 0;      /* 0 = Bulan di antara Matahari dan Bumi */
  let e1earthSpin = true;
  let e1moonAuto = false;

  function buildE1() {
    if (e1Built) { updateE1(); return; }
    e1Built = true;
    SceneMgr.mount('exp1', (s) => {
      const scene = s.scene, cam = s.camera;
      addStars(scene, 700, 2200);

      /* Matahari di kiri */
      const sun = makeSun(70);
      sun.position.set(-620, 20, -60);
      scene.add(sun);
      const e1glow = makeGlow(520, 0xffd76a, 0.9);
      e1glow.position.set(-620, 20, -60);
      scene.add(e1glow);
      const pt = new THREE.PointLight(0xfff0b8, 1.5, 4000);
      pt.position.copy(sun.position);
      scene.add(pt);
      scene.add(new THREE.AmbientLight(0x2a4a77, 1.0));

      /* Bumi di kanan dengan poros */
      const earthPivot = new THREE.Group();
      earthPivot.position.set(200, 0, 0);
      const earth = makeEarth(80);
      earthPivot.add(earth);
      const axis = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 230, 8),
        new THREE.MeshBasicMaterial({ color: 0x37e6ff, transparent: true, opacity: .8 })
      );
      earthPivot.add(axis);
      scene.add(earthPivot);
      s.earth = earth;

      /* Bulan mengorbit Bumi */
      const moonOrbit = new THREE.Group();
      const moon = makeMoon(21);
      moon.position.set(128, 0, 0);
      moonOrbit.add(moon);
      earthPivot.add(moonOrbit);
      s.moonOrbit = moonOrbit;
      s.moon = moon;
      const orbLine = makeOrbitLine(ellipsePoints(128, 128, 0, 0, 64), 0x8fb7ff, 0.4);
      earthPivot.add(orbLine);

      /* label */
      const lSun = makeLabel('Matahari', { fontSize: 56, screenH: 0.04 });
      lSun.position.set(-620, 120, 0);
      scene.add(lSun);
      const lEarth = makeLabel('Bumi (berputar pada porosnya)', { fontSize: 48, screenH: 0.028 });
      lEarth.position.set(200, 150, 0);
      scene.add(lEarth);
      const lMoon = makeLabel('Bulan', { fontSize: 48, screenH: 0.026, color: '#c9d2e0' });
      lMoon.position.set(0, 34, 0);
      moon.add(lMoon);

      const ctl = new OrbitCam(cam, s.canvas, { dist: 660, theta: Math.PI / 2.2, phi: 1.25, minDist: 250, maxDist: 1400 });
      s.controls = ctl;

      s.tick = (dt) => {
        if (e1earthSpin) earth.rotation.y += dt * 0.5;
        moon.rotation.y += dt * 0.3;
        sun.rotation.y += dt * 0.04;
        if (e1moonAuto) {
          e1moonAngle = (e1moonAngle + dt * 30) % 360;
          const sl = document.getElementById('e1MoonSlider');
          if (sl) sl.value = Math.round(e1moonAngle);
          updateE1();
        }
        moonOrbit.rotation.y = e1moonAngle * Math.PI / 180;
        /* Bulan selalu menampilkan sisi yang sama ke Bumi (rotasi = revolusi) */
        moon.rotation.y = -moonOrbit.rotation.y + Math.PI / 2;
      };
      updateE1();
    }, 'p08');

    /* kontrol */
    document.getElementById('e1MoonSlider').addEventListener('input', e => {
      e1moonAngle = +e.target.value;
      updateE1();
    });
    document.getElementById('e1Spin').addEventListener('click', () => {
      e1earthSpin = !e1earthSpin;
      const b = document.getElementById('e1Spin');
      b.classList.toggle('on', e1earthSpin);
    });
    document.getElementById('e1Auto').addEventListener('click', () => {
      e1moonAuto = !e1moonAuto;
      const b = document.getElementById('e1Auto');
      b.classList.toggle('on', e1moonAuto);
      b.innerHTML = iconSVG(e1moonAuto ? 'pause' : 'play') + `<span>${e1moonAuto ? 'HENTIKAN BULAN' : 'ORBIT OTOMATIS'}</span>`;
    });
    document.getElementById('e1Reset').addEventListener('click', () => {
      e1moonAngle = 0; e1earthSpin = true; e1moonAuto = false;
      document.getElementById('e1MoonSlider').value = 0;
      const b = document.getElementById('e1Auto');
      b.classList.remove('on');
      b.innerHTML = iconSVG('play') + '<span>ORBIT OTOMATIS</span>';
      updateE1();
    });
  }

  function faseInfo(a) {
    const deg = ((a % 360) + 360) % 360;
    if (deg < 22.5 || deg >= 337.5) return { nm: 'Bulan Baru', ket: 'Bulan berada <b>di antara Matahari dan Bumi</b>. Sisi yang terang membelakangi Bumi, jadi Bulan <b>tak nampak</b> walau langit cerah.' };
    if (deg < 67.5) return { nm: 'Bulan Sabit', ket: 'Hanya sebagian kecil sisi terang yang menghadap Bumi — terlihat seperti <b>bulan sabit</b>.' };
    if (deg < 112.5) return { nm: 'Kuartal Pertama', ket: 'Bulan berada <b>menyamping</b> terhadap Matahari dan Bumi. Terlihat <b>setengah lingkaran</b>.' };
    if (deg < 157.5) return { nm: 'Fase Cembung', ket: 'Lebih dari setengah sisi terang terlihat — <b>hampir bulat</b>.' };
    if (deg < 202.5) return { nm: 'Bulan Purnama', ket: 'Bumi berada <b>di antara Matahari dan Bulan</b>. Sisi terang menghadap Bumi — terlihat <b>bulat sempurna</b>.' };
    if (deg < 247.5) return { nm: 'Fase Cembung (mengecil)', ket: 'Bagian terang mulai <b>mengecil</b> dari bulat sempurna.' };
    if (deg < 292.5) return { nm: 'Kuartal Akhir', ket: 'Kembali terlihat <b>setengah lingkaran</b>, sisi terang mulai menyempit.' };
    return { nm: 'Bulan Sabit (mengecil)', ket: 'Tersisa <b>sabit tipis</b> menjelang Bulan Baru kembali.' };
  }

  function updateE1() {
    const f = faseInfo(e1moonAngle);
    document.getElementById('e1Sudut').textContent = Math.round(e1moonAngle) + '°';
    document.getElementById('e1Hasil').innerHTML = `
      <div class="kv"><span>Sudut Bulan</span><b class="hl">${Math.round(e1moonAngle)}°</b></div>
      <div class="kv"><span>Bentuk terlihat dari Bumi</span><b>${f.nm}</b></div>
      <div style="margin-top:8px;font-size:12.5px;line-height:1.55;color:var(--ink2)">${f.ket}</div>`;
  }

  /* ============================================================
     E2 — SIMULASI SIANG DAN MALAM (3D, senter + globe)
     ============================================================ */
  let e2Built = false;
  let e2senterAngle = 0;   /* arah senter mengelilingi Bumi */
  let e2spin = false;
  let e2rot = 0;

  function buildE2() {
    if (e2Built) { updateE2(); return; }
    e2Built = true;
    SceneMgr.mount('exp2', (s) => {
      const scene = s.scene, cam = s.camera;
      addStars(scene, 600, 2000);
      scene.add(new THREE.AmbientLight(0x1d3654, 0.9));

      /* meja laboratorium (lantai) */
      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(420, 48),
        new THREE.MeshPhongMaterial({ color: 0x0d2444, shininess: 20, transparent: true, opacity: .85 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -130;
      scene.add(floor);

      /* bola Bumi + poros (seperti kegiatan buku: sumpit pada globe) */
      const earthPivot = new THREE.Group();
      const earth = makeEarth(95);
      earthPivot.add(earth);
      const axis = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 320, 10),
        new THREE.MeshPhongMaterial({ color: 0xc9a06a, shininess: 30 })
      );
      earthPivot.add(axis);
      scene.add(earthPivot);
      s.earth = earth;

      /* miniatur orang (kertas bergambar siswa) */
      const org = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.ConeGeometry(7, 26, 10),
        new THREE.MeshPhongMaterial({ color: 0xff5d6c })
      );
      body.position.y = 12;
      org.add(body);
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(5.5, 12, 10),
        new THREE.MeshPhongMaterial({ color: 0xffe0c2 })
      );
      head.position.y = 30;
      org.add(head);
      const opv = latLonToVec3(0, 20, 97);
      org.position.copy(opv);
      org.lookAt(opv.clone().multiplyScalar(2));
      earth.add(org);
      s.org = org;
      const oLab = makeLabel('miniatur orang', { fontSize: 44, screenH: 0.024, color: '#ffb3bc' });
      oLab.position.copy(opv.clone().multiplyScalar(1.18));
      earth.add(oLab);
      s.oLab = oLab;

      /* senter (dibangun menghadap +Z; lookAt mengarahkannya ke Bumi) */
      const senter = new THREE.Group();
      const badan = new THREE.Mesh(
        new THREE.CylinderGeometry(14, 17, 64, 16),
        new THREE.MeshPhongMaterial({ color: 0x37465e, shininess: 60 })
      );
      badan.rotation.x = Math.PI / 2;
      senter.add(badan);
      const kepala = new THREE.Mesh(
        new THREE.CylinderGeometry(19, 14, 16, 16),
        new THREE.MeshPhongMaterial({ color: 0xd9e4f2, shininess: 80 })
      );
      kepala.rotation.x = Math.PI / 2;
      kepala.position.z = 38;
      senter.add(kepala);
      const lensa = new THREE.Mesh(
        new THREE.CircleGeometry(16, 20),
        new THREE.MeshBasicMaterial({ color: 0xfff3c4 })
      );
      lensa.position.z = 47;
      senter.add(lensa);
      /* berkas cahaya kerucut: ujung lancip di senter, melebar menutupi Bumi */
      const beam = new THREE.Mesh(
        new THREE.ConeGeometry(80, 240, 24, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: 0.34, side: THREE.DoubleSide, depthWrite: false })
      );
      beam.rotation.x = -Math.PI / 2;
      beam.position.z = 160;
      senter.add(beam);
      scene.add(senter);
      s.senter = senter;

      const dl = new THREE.DirectionalLight(0xfff2d8, 1.9);
      scene.add(dl);
      s.dl = dl;

      const lS = makeLabel('SENTER (sumber cahaya)', { fontSize: 46, screenH: 0.03, color: '#ffe58a' });
      scene.add(lS);
      s.lS = lS;

      const ctl = new OrbitCam(cam, s.canvas, { dist: 560, theta: Math.PI / 2.4, phi: 1.15, minDist: 220, maxDist: 1100, target: new THREE.Vector3(0, 20, 150) });
      s.controls = ctl;

      s.tick = (dt) => {
        if (e2spin) { e2rot += dt * 0.5; updateE2(); }
        earthPivot.rotation.y = e2rot;
        /* posisi senter pada sudut e2senterAngle (0 = depan +Z) */
        const a = e2senterAngle * Math.PI / 180;
        const sx = Math.sin(a) * 300, sz = Math.cos(a) * 300;
        senter.position.set(sx, 40, sz);
        senter.lookAt(0, 0, 0);
        lS.position.set(sx * 1.28, 120, sz * 1.28);
        dl.position.set(sx * 2, 60, sz * 2);
      };
      updateE2();
    }, 'p08');

    document.getElementById('e2Senter').addEventListener('input', e => {
      e2senterAngle = +e.target.value;
      updateE2();
    });
    document.getElementById('e2Spin').addEventListener('click', () => {
      e2spin = !e2spin;
      const b = document.getElementById('e2Spin');
      b.classList.toggle('on', e2spin);
      b.innerHTML = iconSVG(e2spin ? 'pause' : 'play') + `<span>${e2spin ? 'JEDA BUMI' : 'PUTAR BUMI'}</span>`;
    });
    document.getElementById('e2Org').addEventListener('click', () => {
      const s = SceneMgr.scenes['exp2'];
      if (!s) return;
      const v = !(s.org.visible);
      s.org.visible = v; s.oLab.visible = v;
      document.getElementById('e2Org').classList.toggle('on', v);
    });
    document.getElementById('e2Reset').addEventListener('click', () => {
      e2senterAngle = 0; e2spin = false; e2rot = 0;
      document.getElementById('e2Senter').value = 0;
      const b = document.getElementById('e2Spin');
      b.classList.remove('on');
      b.innerHTML = iconSVG('play') + '<span>PUTAR BUMI</span>';
      updateE2();
    });
  }

  function updateE2() {
    /* status pengamat: arah cahaya vs posisi orang (lon 20°, rotasi e2rot) */
    const a = e2senterAngle * Math.PI / 180;
    const lightDir = { x: -Math.sin(a), z: -Math.cos(a) };
    const pLon = 20 + e2rot * 180 / Math.PI;
    const pr = ((pLon % 360) + 360) % 360;
    const pAng = ((90 - pr) * Math.PI / 180); /* azimuth posisi orang */
    const px = Math.cos(pAng), pz = -Math.sin(pAng);
    const dot = px * lightDir.x + pz * lightDir.z;
    const terang = dot > 0.12;
    document.getElementById('e2Arah').textContent = Math.round(e2senterAngle) + '°';
    document.getElementById('e2Hasil').innerHTML = `
      <div class="kv"><span>Arah senter</span><b class="hl">${Math.round(e2senterAngle)}°</b></div>
      <div class="kv"><span>Bagian bola Bumi terkena senter</span><b>${terang ? 'sisi menghadap senter — SIANG' : 'sisi menjauhi senter — MALAM'}</b></div>
      <div class="kv"><span>Miniatur orang</span><b>${terang ? 'Terkena cahaya (siang)' : 'Di kegelapan (malam)'}</b></div>
      <div style="margin-top:8px;font-size:12.5px;line-height:1.55;color:var(--ink2)">
      Putar bola Bumi <b>berlawanan arah jarum jam</b> seperti pada kegiatan buku — amati miniatur orang bergantian
      mendapat cahaya (siang) lalu gelap (malam).</div>`;
  }

  /* ============================================================
     E3 — JAM MATAHARI (2D SVG)
     ============================================================ */
  let e3Built = false;
  let e3t = 9;              /* jam 6-18 */
  let e3marks = [];

  function buildE3() {
    if (e3Built) { updateE3(); return; }
    e3Built = true;
    const wrap = document.getElementById('e3Svg');
    const W = 460, H = 340, cx = W / 2, cy = H / 2 + 6;
    wrap.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="max-width:100%;max-height:100%">
      <defs>
        <radialGradient id="e3sun" cx="35%" cy="35%"><stop offset="0%" stop-color="#fff3c4"/><stop offset="100%" stop-color="#ffc44d"/></radialGradient>
      </defs>
      <rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="10" fill="#0a1c38" stroke="#20456e"/>
      ${[...Array(9)].map((_, i) => `<line x1="${18 + i * (W - 36) / 8}" y1="16" x2="${18 + i * (W - 36) / 8}" y2="${H - 16}" stroke="#13294e" stroke-width="1"/>`).join('')}
      ${[...Array(7)].map((_, i) => `<line x1="16" y1="${18 + i * (H - 36) / 6}" x2="${W - 16}" y2="${18 + i * (H - 36) / 6}" stroke="#13294e" stroke-width="1"/>`).join('')}
      <text x="${cx}" y="26" text-anchor="middle" fill="#7fa8d8" font-size="10" font-weight="600" letter-spacing="2">PAPAN JAM MATAHARI (dilihat dari atas)</text>
      <text x="${W - 26}" y="${cy + 4}" text-anchor="middle" fill="#ffc44d" font-size="10" font-weight="700">TIMUR</text>
      <text x="26" y="${cy + 4}" text-anchor="middle" fill="#ffc44d" font-size="10" font-weight="700">BARAT</text>
      <text x="${cx}" y="${H - 22}" text-anchor="middle" fill="#5f7ba6" font-size="9" font-weight="600">siang tengah hari: bayangan terpendek, ke arah bawah papan</text>
      <text x="${cx}" y="42" text-anchor="middle" fill="#7fa8d8" font-size="9" font-weight="600">TENGAH HARI</text>
      <g id="e3shadow"><line id="e3shLine" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy}" stroke="#9fd8ff" stroke-width="3" stroke-linecap="round" opacity=".9"/><circle id="e3shTip" cx="${cx}" cy="${cy}" r="4" fill="#9fd8ff"/></g>
      <g id="e3marksG"></g>
      <circle cx="${cx}" cy="${cy}" r="9" fill="#c9a06a" stroke="#8a6a3e" stroke-width="2"/>
      <circle cx="${cx - 2}" cy="${cy - 3}" r="2.6" fill="#7a5a34"/>
      <text x="${cx}" y="${cy + 26}" text-anchor="middle" fill="#d9b98a" font-size="9.5" font-weight="700">PENSIL</text>
      <g id="e3sunG"><circle id="e3sunC" cx="${W - 40}" cy="${cy}" r="15" fill="url(#e3sun)" stroke="#fff3c4"/><path id="e3sunR" d="" stroke="#ffe58a" stroke-width="2" fill="none" opacity=".8"/></g>
    </svg>`;
    document.getElementById('e3Time').addEventListener('input', e => { e3t = +e.target.value; updateE3(); });
    document.getElementById('e3Mark').addEventListener('click', () => {
      const key = Math.round(e3t * 2) / 2;
      if (e3marks.find(m => m.t === key)) { App.toast('Waktu itu sudah ditandai!', 'warn'); return; }
      const p = shadowTip();
      e3marks.push({ t: key, len: Math.round(p.len), dir: p.dirName });
      e3marks.sort((a, b) => a.t - b.t);
      drawMarks(); updateE3();
      AudioSys.play('pop');
    });
    document.getElementById('e3Clear').addEventListener('click', () => {
      e3marks = []; drawMarks(); updateE3();
    });
    updateE3();
  }

  function shadowTip() {
    const W = 460, H = 340, cx = W / 2, cy = H / 2 + 6;
    /* sudut Matahari: 06 = timur (kanan), 12 = atas papan, 18 = barat (kiri) */
    const p = (e3t - 6) / 12;
    const ang = p * Math.PI;   /* 06:00 = timur (kanan) → 12:00 = atas → 18:00 = barat (kiri) */
    const elev = Math.sin(Math.PI * p);
    const len = Math.min(150, 30 + 120 * (1 - elev));
    const sx = cx + Math.cos(ang) * 118;
    const sy = cy - Math.sin(ang) * 118;
    const dx = Math.cos(ang + Math.PI), dy = -Math.sin(ang + Math.PI);
    const tip = { x: cx + dx * len, y: cy + dy * len };
    let dirName = 'ke barat';
    if (e3t >= 11 && e3t <= 13) dirName = 'pendek, ke bawah papan';
    else if (e3t > 13) dirName = 'ke timur';
    else dirName = 'ke barat';
    return { ang, elev, len, sx, sy, tip, dirName, cx, cy };
  }

  function updateE3() {
    const p = shadowTip();
    const sc = document.getElementById('e3sunC');
    if (sc) {
      sc.setAttribute('cx', p.sx.toFixed(1));
      sc.setAttribute('cy', p.sy.toFixed(1));
    }
    const line = document.getElementById('e3shLine');
    const tip = document.getElementById('e3shTip');
    if (line) {
      line.setAttribute('x2', p.tip.x.toFixed(1));
      line.setAttribute('y2', p.tip.y.toFixed(1));
      tip.setAttribute('cx', p.tip.x.toFixed(1));
      tip.setAttribute('cy', p.tip.y.toFixed(1));
    }
    const hh = Math.floor(e3t), mm = Math.round((e3t - hh) * 60);
    const tstr = String(hh).padStart(2, '0') + '.' + String(mm).padStart(2, '0');
    document.getElementById('e3Jam').textContent = tstr;
    const panjang = p.elev > 0.75 ? 'pendek' : p.elev > 0.35 ? 'sedang' : 'panjang';
    document.getElementById('e3Hasil').innerHTML = `
      <div class="kv"><span>Waktu pengamatan</span><b class="hl">${tstr}</b></div>
      <div class="kv"><span>Posisi Matahari (papan)</span><b>${e3t < 12 ? 'menuju tengah hari' : e3t === 12 ? 'tepat di atas' : 'melewati tengah hari'}</b></div>
      <div class="kv"><span>Bayangan pensil</span><b>${panjang}, mengarah ${p.dirName}</b></div>
      <div class="kv"><span>Tanda bayangan</span><b>${e3marks.length} titik</b></div>`;
  }

  function drawMarks() {
    const g = document.getElementById('e3marksG');
    if (!g) return;
    const W = 460, H = 340, cx = W / 2, cy = H / 2 + 6;
    g.innerHTML = '';
    const oldT = e3t;
    e3marks.forEach(m => {
      e3t = m.t;
      const p = shadowTip();
      g.innerHTML += `<circle cx="${p.tip.x}" cy="${p.tip.y}" r="4.5" fill="#37e6ff" stroke="#052" stroke-width="1"/>
        <text x="${p.tip.x + (p.tip.x > cx ? -14 : 8)}" y="${p.tip.y - 7}" fill="#8ff0ff" font-size="9" font-weight="700">${String(Math.floor(m.t)).padStart(2, '0')}.00</text>`;
    });
    e3t = oldT;
    /* tabel */
    const tb = document.getElementById('e3Table');
    if (tb) {
      tb.innerHTML = e3marks.length ? e3marks.map(m =>
        `<tr><td><b>${String(Math.floor(m.t)).padStart(2, '0')}.00</b></td><td>±${m.len} unit</td><td>${m.dir}</td></tr>`).join('')
        : `<tr><td colspan="3" style="text-align:center;color:var(--ink3)">Belum ada tanda — tekan Tandai Bayangan!</td></tr>`;
    }
  }

  /* ============================================================
     E4 — FASE BULAN (2D SVG)
     ============================================================ */
  let e4Built = false;
  let e4angle = 0;    /* 0 = Bulan Baru (di antara Matahari & Bumi) */

  function buildE4() {
    if (e4Built) { updateE4(); return; }
    e4Built = true;
    const wrap = document.getElementById('e4Svg');
    const W = 470, H = 320, ex = 265, ey = H / 2, R = 118;
    wrap.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="max-width:100%;max-height:100%">
      <defs><radialGradient id="e4sun" cx="35%" cy="35%"><stop offset="0%" stop-color="#fff3c4"/><stop offset="100%" stop-color="#ffb54d"/></radialGradient></defs>
      ${[...Array(5)].map((_, i) => `<line x1="14" y1="${60 + i * 50}" x2="86" y2="${60 + i * 50}" stroke="#ffe58a" stroke-width="2" opacity=".55"/>
        <path d="M 86 ${60 + i * 50} l -8 -4 l 0 8 z" fill="#ffe58a" opacity=".7"/>`).join('')}
      <circle cx="46" cy="${ey}" r="30" fill="url(#e4sun)"/>
      <text x="46" y="${ey + 50}" text-anchor="middle" fill="#ffc44d" font-size="10" font-weight="700" letter-spacing="1">MATAHARI</text>
      <circle cx="${ex}" cy="${ey}" r="26" fill="#1b6fe0" stroke="#7fd4ff" stroke-width="1.5"/>
      <path d="M ${ex - 9} ${ey - 6} a 9 6 0 0 1 12 -4 M ${ex + 2} ${ey + 8} a 11 8 0 0 1 14 -3" stroke="#9fd8ff" stroke-width="3" fill="none" opacity=".5"/>
      <text x="${ex}" y="${ey + 46}" text-anchor="middle" fill="#7fd4ff" font-size="10" font-weight="700" letter-spacing="1">BUMI</text>
      <circle id="e4orbit" cx="${ex}" cy="${ey}" r="${R}" fill="none" stroke="#37e6ff" stroke-dasharray="5 4" opacity=".5" style="cursor:pointer"/>
      ${[...Array(8)].map((_, i) => {
        const a = i * 45 * Math.PI / 180;
        const x = ex + Math.cos(a) * R, y = ey - Math.sin(a) * R;
        return `<circle class="e4snap" data-a="${i * 45}" cx="${x}" cy="${y}" r="13" fill="rgba(0,190,255,.12)" stroke="rgba(0,190,255,.35)" style="cursor:pointer"/>`;
      }).join('')}
      <g id="e4moonG">
        <circle id="e4moon" r="16" fill="#8b8f99" stroke="#c6cad2" stroke-width="1"/>
      </g>
      <path id="e4ray" d="" stroke="#ffe58a" stroke-width="1.6" stroke-dasharray="4 3" opacity=".8" fill="none"/>
    </svg>`;
    /* klik orbit / snap */
    wrap.querySelectorAll('.e4snap').forEach(c => {
      c.addEventListener('click', () => {
        e4angle = +c.dataset.a;
        document.getElementById('e4Slider').value = e4angle;
        updateE4();
      });
    });
    document.getElementById('e4orbit').addEventListener('click', ev => {
      const svg = wrap.querySelector('svg');
      const r = svg.getBoundingClientRect();
      const scale = 470 / r.width;
      const mx = (ev.clientX - r.left) * scale, my = (ev.clientY - r.top) * scale;
      const dx = mx - ex, dy = my - ey;
      let a = Math.atan2(-dy, dx) * 180 / Math.PI;
      a = ((a % 360) + 360) % 360;
      e4angle = Math.round(a / 5) * 5 % 360;
      document.getElementById('e4Slider').value = e4angle;
      updateE4();
    });
    document.getElementById('e4Slider').addEventListener('input', e => {
      e4angle = +e.target.value;
      updateE4();
    });
    document.getElementById('e4Reset').addEventListener('click', () => {
      e4angle = 0;
      document.getElementById('e4Slider').value = 0;
      updateE4();
    });
    updateE4();
  }

  function updateE4() {
    const W = 470, H = 320, ex = 265, ey = H / 2, R = 118;
    const a = e4angle * Math.PI / 180;
    const mx = ex + Math.cos(a) * R, my = ey - Math.sin(a) * R;
    const mg = document.getElementById('e4moonG');
    if (mg) mg.setAttribute('transform', `translate(${mx.toFixed(1)},${my.toFixed(1)})`);
    /* garis arah Matahari->Bulan */
    const ray = document.getElementById('e4ray');
    if (ray) ray.setAttribute('d', `M 78 ${ey} L ${(mx - 18 * Math.cos(a)).toFixed(1)} ${(my + 18 * Math.sin(a)).toFixed(1)}`);

    /* fase pada inset */
    const k = (1 - Math.cos(a)) / 2;   /* bagian terang */
    const inset = document.getElementById('e4Phase');
    if (inset) {
      const r = 62, cx = 75, cy = 75;
      let d = '';
      const rx = r * Math.abs(Math.cos(a));
      if (k <= 0.015) {
        d = ''; /* gelap total */
      } else if (k >= 0.985) {
        d = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
      } else {
        const bulgeRight = k > 0.5;
        /* sisi terang di kiri (menghadap Matahari) */
        d = `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r}`;
        d += ` A ${rx.toFixed(2)} ${r} 0 0 ${bulgeRight ? 1 : 0} ${cx} ${cy - r} Z`;
      }
      inset.innerHTML = `
        <svg viewBox="0 0 150 150" style="width:100%;height:100%">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="#23262e"/>
          ${d ? `<path d="${d}" fill="#d9dde6"/>` : ''}
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#4a5060" stroke-width="1.5"/>
          <circle cx="${cx - 20}" cy="${cy - 18}" r="6" fill="#31353e"/>
          <circle cx="${cx + 16}" cy="${cy + 22}" r="8" fill="#31353e"/>
          <circle cx="${cx + 24}" cy="${cy - 26}" r="4" fill="#31353e"/>
          <path d="M 6 ${cy} l 14 -6 l 0 12 z" fill="#ffc44d"/>
          <text x="20" y="${cy + 22}" fill="#ffc44d" font-size="8.5" font-weight="700" letter-spacing="1">ARAH MATAHARI</text>
        </svg>`;
    }

    const f = faseInfo(e4angle);
    document.getElementById('e4Name').textContent = f.nm.toUpperCase();
    document.getElementById('e4Desc').innerHTML = `${f.ket}<br><span style="color:var(--ink3);font-size:11px">Terlihat terang ±${Math.round(k * 100)}% dari permukaan Bulan yang menghadap kita.</span>`;
    document.getElementById('e4Sudut').textContent = Math.round(e4angle) + '°';
    document.getElementById('e4Slider').value = Math.round(e4angle);
  }

  /* ============================================================
     E5 — PERGANTIAN MUSIM (2D SVG, seperti Gambar 6.9 buku)
     ============================================================ */
  let e5Built = false;
  let e5m = 11;   /* bulan 0-11 */
  const MUSIM5 = [
    ['Dingin', 'Panas'], ['Dingin', 'Panas'], ['Semi', 'Gugur'],
    ['Semi', 'Gugur'], ['Semi', 'Gugur'], ['Panas', 'Dingin'],
    ['Panas', 'Dingin'], ['Panas', 'Dingin'], ['Gugur', 'Semi'],
    ['Gugur', 'Semi'], ['Gugur', 'Semi'], ['Dingin', 'Panas']
  ];
  const NM5 = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  function buildE5() {
    if (e5Built) { updateE5(); return; }
    e5Built = true;
    const wrap = document.getElementById('e5Svg');
    const W = 470, H = 330, cx = W / 2, cy = H / 2, R = 122;
    let svg = `<svg viewBox="0 0 ${W} ${H}" style="max-width:100%;max-height:100%">
      <defs><radialGradient id="e5sun" cx="35%" cy="35%"><stop offset="0%" stop-color="#fff3c4"/><stop offset="100%" stop-color="#ffb54d"/></radialGradient></defs>
      <circle cx="${cx}" cy="${cy}" r="34" fill="url(#e5sun)"/>
      ${[...Array(12)].map((_, i) => {
        const a = i * Math.PI / 6;
        return `<line x1="${cx + Math.cos(a) * 40}" y1="${cy + Math.sin(a) * 40}" x2="${cx + Math.cos(a) * 52}" y2="${cy + Math.sin(a) * 52}" stroke="#ffe58a" stroke-width="2" opacity=".6"/>`;
      }).join('')}
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#37e6ff" stroke-dasharray="5 4" opacity=".5"/>`;
    NM5.forEach((nm, i) => {
      const phi = (150 - i * 30) * Math.PI / 180;
      const x = cx + R * Math.cos(phi), y = cy - R * Math.sin(phi) * -1;
      const key = (i === 2 || i === 5 || i === 8 || i === 11);
      svg += `<g class="e5pos" data-m="${i}" style="cursor:pointer">
        <circle cx="${x}" cy="${y}" r="${key ? 17 : 12}" fill="rgba(0,190,255,.1)" stroke="${key ? '#ffc44d' : 'rgba(0,190,255,.4)'}" stroke-width="${key ? 2 : 1}"/>
        <text x="${x + (x > cx ? 26 : -26)}" y="${y + 4}" text-anchor="${x > cx ? 'start' : 'end'}" fill="${key ? '#ffd27a' : '#8fb7dd'}" font-size="10" font-weight="${key ? 700 : 600}">${nm}</text>
      </g>`;
    });
    svg += `<g id="e5earthG"></g><g id="e5raysG"></g></svg>`;
    wrap.innerHTML = svg;
    wrap.querySelectorAll('.e5pos').forEach(g => {
      g.addEventListener('click', () => { e5m = +g.dataset.m; updateE5(); });
    });
    document.getElementById('e5Slider').addEventListener('input', e => { e5m = +e.target.value; updateE5(); });
    document.querySelectorAll('#view-e5 .chip[data-m]').forEach(c => {
      c.addEventListener('click', () => { e5m = +c.dataset.m; updateE5(); });
    });
    document.getElementById('e5Play').addEventListener('click', () => {
      const b = document.getElementById('e5Play');
      if (b.dataset.run === '1') {
        b.dataset.run = '0';
        b.innerHTML = iconSVG('play') + '<span>PUTAR</span>';
      } else {
        b.dataset.run = '1';
        b.innerHTML = iconSVG('pause') + '<span>JEDA</span>';
        const step = () => {
          if (b.dataset.run !== '1') return;
          e5m = (e5m + 1) % 12;
          updateE5();
          setTimeout(step, 1100);
        };
        step();
      }
    });
    updateE5();
  }

  function updateE5() {
    const W = 470, H = 330, cx = W / 2, cy = H / 2, R = 122;
    const phi = (150 - e5m * 30) * Math.PI / 180;
    const ex = cx + R * Math.cos(phi), ey = cy - R * Math.sin(phi) * -1;
    /* catatan: svg y ke bawah, sudut dipakai langsung */
    const g = document.getElementById('e5earthG');
    if (g) {
      const tilt = 23.4;
      /* sumbu selalu miring ke kiri (arah tetap di ruang angkasa) */
      g.innerHTML = `
        <g transform="translate(${ex.toFixed(1)},${ey.toFixed(1)})">
          <line x1="0" y1="-30" x2="0" y2="30" stroke="#37e6ff" stroke-width="2" transform="rotate(${-tilt})"/>
          <circle r="14" fill="#1b6fe0" stroke="#7fd4ff" stroke-width="1.2"/>
          <path d="M -5 -3 a 5 4 0 0 1 7 -2 M 1 4 a 6 5 0 0 1 8 -2" stroke="#9fd8ff" stroke-width="2" fill="none" opacity=".6"/>
          <text x="0" y="-36" text-anchor="middle" fill="#8ff0ff" font-size="8" font-weight="700">U</text>
          <text x="0" y="44" text-anchor="middle" fill="#8ff0ff" font-size="8" font-weight="700">S</text>
        </g>`;
    }
    /* sinar dari Matahari ke Bumi */
    const rg = document.getElementById('e5raysG');
    if (rg) {
      const dx = ex - cx, dy = ey - cy;
      const L = Math.hypot(dx, dy);
      const ux = dx / L, uy = dy / L;
      const px = -uy, py = ux;
      let rays = '';
      for (let i = -1; i <= 1; i++) {
        const ox = cx + px * i * 16, oy = cy + py * i * 16;
        const tx = ex - ux * 26 + px * i * 10, ty = ey - uy * 26 + py * i * 10;
        rays += `<line x1="${(ox + ux * 46).toFixed(1)}" y1="${(oy + uy * 46).toFixed(1)}" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="#ffe58a" stroke-width="2" opacity=".75"/>
        <path d="M ${tx.toFixed(1)} ${ty.toFixed(1)} l ${(-ux * 9 - px * 4).toFixed(1)} ${(-uy * 9 - py * 4).toFixed(1)} l ${(-ux * 9 + px * 4).toFixed(1)} ${(-uy * 9 + py * 4).toFixed(1)} z" fill="#ffe58a" opacity=".85"/>`;
      }
      rg.innerHTML = rays;
    }
    const [mU, mS] = MUSIM5[e5m];
    const d = 23.4 * Math.sin((e5m - 2) * Math.PI / 6);
    const sinU = Math.round(50 + Math.sin(d * Math.PI / 180) * 50);
    document.getElementById('e5Bulan').textContent = NM5[e5m].toUpperCase();
    document.getElementById('e5Hasil').innerHTML = `
      <div class="kv"><span>Bulan</span><b class="hl">${NM5[e5m]}</b></div>
      <div class="kv"><span>Musim Belahan Utara</span><b>${mU}</b></div>
      <div class="kv"><span>Musim Belahan Selatan</span><b>${mS}</b></div>
      <div class="kv"><span>Sinar diterima Belahan Utara</span><b>${sinU}%</b></div>
      <div class="kv"><span>Sinar diterima Belahan Selatan</span><b>${100 - sinU}%</b></div>`;
    document.getElementById('e5FillU').style.width = sinU + '%';
    document.getElementById('e5FillS').style.width = (100 - sinU) + '%';
    document.getElementById('e5Slider').value = e5m;
    document.querySelectorAll('#view-e5 .chip[data-m]').forEach(c =>
      c.classList.toggle('on', +c.dataset.m === e5m));
  }

  /* ================= siklus halaman ================= */
  function enter() {
    buildHub();
    if (currentExp) openExp(currentExp);
    else renderHub();
  }
  function leave() {
    ['exp1', 'exp2'].forEach(id => {
      const s = SceneMgr.scenes[id];
      if (s) s.stop();
    });
  }
  function init() { /* dibangun saat pertama masuk */ }

  return { init, enter, leave, narrateCurrent };
})();
