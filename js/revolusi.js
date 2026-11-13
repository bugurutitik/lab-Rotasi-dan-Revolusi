/* ============================================================
   LABORATORIUM MAYA IPAS — revolusi.js
   Lab 02: simulasi Bumi mengelilingi Matahari pada orbit elips
   (Matahari di satu titik fokus), posisi per bulan, titik
   perihelion (Januari) dan aphelion (Juli), jarak, dan durasi
   revolusi 365,25 hari.
   ============================================================ */
'use strict';

const RevolusiLab = (() => {

  /* geometri orbit (elips diperbesar agar jelas terlihat) */
  const A = 320;              /* sumbu semi-mayor visual */
  const E_VIS = 0.35;         /* eksentrisitas visual (sebenarnya 0,0167) */
  const B = A * Math.sqrt(1 - E_VIS * E_VIS);
  const C = A * E_VIS;

  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const HARI_BULAN = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const TAHUN = 365.25;

  let built = false;
  let day = 40;            /* hari sejak 1 Januari */
  let playing = false;
  let speed = 20;          /* hari per detik */
  let showOrbit = true, showLabels = true, showDist = true;

  let earthPivot, earthMesh, sunMesh, orbitLine, distLine, monthLabels = [], periMark, apheMark;

  const S = () => SceneMgr.scenes['p05'];

  function posAt(d) {
    const Eang = d / TAHUN * Math.PI * 2;
    return {
      x: -C + A * Math.cos(Eang),
      z: B * Math.sin(Eang),
      E: Eang
    };
  }
  function jutaKm(d) {
    /* jarak sebenarnya (eksentrisitas nyata 0,0167) */
    const Eang = d / TAHUN * Math.PI * 2;
    return 149.6 * (1 - 0.0167 * Math.cos(Eang));
  }
  function bulanKe(d) {
    let acc = 0;
    for (let i = 0; i < 12; i++) {
      acc += HARI_BULAN[i];
      if (d < acc) return i;
    }
    return 11;
  }
  function hariDiBulan(d) {
    let acc = 0, i = bulanKe(d);
    for (let k = 0; k < i; k++) acc += HARI_BULAN[k];
    return Math.floor(d - acc) + 1;
  }

  /* ================= build ================= */
  function buildScene() {
    built = true;
    SceneMgr.mount('p05', (s) => {
      const scene = s.scene, cam = s.camera;
      addStars(scene, 900, 2600);

      /* Matahari di titik fokus + label besar */
      sunMesh = makeSun(46);
      scene.add(sunMesh);
      const g1 = makeGlow(390, 0xffd76a, 0.95);
      const g2 = makeGlow(170, 0xfff6d8, 1);
      scene.add(g1); scene.add(g2);
      const labSun = makeLabel('MATAHARI', { fontSize: 64, screenH: 0.05, color: '#ffe8a0' });
      labSun.position.set(0, 66, 0);
      scene.add(labSun);

      const pt = new THREE.PointLight(0xfff0b8, 1.6, 3000);
      scene.add(pt);
      scene.add(new THREE.AmbientLight(0x2a4a77, 1.0));

      /* garis orbit elips */
      const pts = [];
      for (let i = 0; i <= 160; i++) {
        const p = posAt(i / 160 * TAHUN);
        pts.push(new THREE.Vector3(p.x, 0, p.z));
      }
      orbitLine = makeOrbitLine(pts, 0x37e6ff, 0.6);
      scene.add(orbitLine);

      /* label bulan */
      BULAN.forEach((nm, i) => {
        const p = posAt(i * TAHUN / 12 + TAHUN / 24);
        const dir = new THREE.Vector3(p.x, 0, p.z).normalize();
        const lab = makeLabel(nm, { fontSize: 48, screenH: 0.024, color: '#9fd0f5', bg: 'rgba(6,16,34,0.6)' });
        lab.position.set(p.x + dir.x * 34, 14, p.z + dir.z * 34);
        scene.add(lab);
        monthLabels.push(lab);
      });

      /* penanda perihelion & aphelion */
      const mkPeri = (pos, judul, warna) => {
        const g = new THREE.Group();
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(16, 19, 40),
          new THREE.MeshBasicMaterial({ color: warna, transparent: true, opacity: .8, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        g.add(ring);
        const lab = makeLabel(judul, { fontSize: 48, screenH: 0.024, color: '#ffd27a' });
        lab.position.set(0, -58, 0);
        g.add(lab);
        g.position.copy(pos);
        scene.add(g);
        return g;
      };
      const pPeri = posAt(0);
      periMark = mkPeri(new THREE.Vector3(pPeri.x, 0, pPeri.z), 'PERIHELION — Januari (terdekat)', 0xffc44d);
      const pAphe = posAt(TAHUN / 2);
      apheMark = mkPeri(new THREE.Vector3(pAphe.x, 0, pAphe.z), 'APHELION — Juli (terjauh)', 0x8fb7ff);

      /* Bumi (berputar + sumbu miring tetap arahnya) + label besar */
      earthPivot = new THREE.Group();
      earthMesh = makeEarth(16);
      earthPivot.add(earthMesh);
      earthPivot.rotation.z = 23.4 * Math.PI / 180;   /* kemiringan sumbu */
      const labBumi = makeLabel('BUMI', { fontSize: 64, screenH: 0.045 });
      labBumi.position.set(0, 34, 0);
      earthPivot.add(labBumi);
      /* garis sumbu (ungu — dibedakan dari label & garis orbit) */
      const axis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 50, 8),
        new THREE.MeshBasicMaterial({ color: 0xb79bff, transparent: true, opacity: .85 })
      );
      earthPivot.add(axis);
      /* Bulan (agak besar agar jelas) + label */
      const moon = makeMoon(6);
      const mOrb = new THREE.Group();
      moon.position.set(52, 0, 0);
      mOrb.add(moon);
      const labBulan = makeLabel('BULAN', { fontSize: 56, screenH: 0.034, color: '#e6e9f2' });
      labBulan.position.set(18, -5, 0);
      moon.add(labBulan);
      earthPivot.add(mOrb);
      earthPivot.userData.mOrb = mOrb;
      scene.add(earthPivot);

      /* garis jarak Matahari-Bumi */
      const dg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      distLine = new THREE.Line(dg, new THREE.LineDashedMaterial({
        color: 0xffd27a, transparent: true, opacity: .7, dashSize: 9, gapSize: 6
      }));
      scene.add(distLine);

      const ctl = new OrbitCam(cam, s.canvas, {
        dist: 950, theta: -0.55, phi: 0.95,
        minDist: 200, maxDist: 2000, target: new THREE.Vector3(-112, 0, 0)
      });
      s.controls = ctl;

      s.tick = (dt) => {
        if (playing) {
          day += dt * speed;
          if (day >= TAHUN) day -= TAHUN;
          updateSim();
        }
        earthMesh.rotation.y += dt * 1.6;
        earthPivot.userData.mOrb.rotation.y += dt * 0.9;
        sunMesh.rotation.y += dt * 0.04;
        const p = posAt(day);
        earthPivot.position.set(p.x, 0, p.z);
        /* perbarui garis jarak */
        const arr = distLine.geometry.attributes.position.array;
        arr[0] = 0; arr[1] = 0; arr[2] = 0;
        arr[3] = p.x; arr[4] = 0; arr[5] = p.z;
        distLine.geometry.attributes.position.needsUpdate = true;
        distLine.computeLineDistances();
      };
      updateSim();
    });
    wireControls();
  }

  /* ================= status ================= */
  function statusPosisi() {
    const bln = bulanKe(day);
    const nm = BULAN[bln];
    const jarak = jutaKm(day);
    let ket = '';
    if (day < 16 || day > TAHUN - 12) ket = 'Bumi berada di dekat <b>PERIHELION</b> — titik terdekat dengan Matahari.';
    else if (Math.abs(day - TAHUN / 2) < 16) ket = 'Bumi berada di dekat <b>APHELION</b> — titik terjauh dari Matahari.';
    else ket = 'Bumi berada pada lintasan orbit antara perihelion dan aphelion.';
    return { bln, nm, jarak, ket };
  }

  function updateSim() {
    const { bln, nm, jarak, ket } = statusPosisi();
    const hari = Math.floor(day) + 1;

    const el1 = document.getElementById('revDay');
    if (el1) el1.innerHTML = `HARI KE-${hari} <small>/ ${Math.round(TAHUN)} hari</small>`;
    const el2 = document.getElementById('revMonth');
    if (el2) el2.textContent = nm.toUpperCase();
    const el3 = document.getElementById('revDist');
    if (el3) el3.innerHTML = `${jarak.toFixed(1)} <small>juta km*</small>`;

    const el4 = document.getElementById('revInfo');
    if (el4) {
      el4.innerHTML = `
        <div class="kv"><span>Bulan</span><b class="hl">${nm}</b></div>
        <div class="kv"><span>Tanggal kira-kira</span><b>${hariDiBulan(day)} ${nm}</b></div>
        <div class="kv"><span>Jarak ke Matahari</span><b>${jarak.toFixed(1)} juta km*</b></div>
        <div style="margin-top:8px">${ket}</div>`;
    }
    const slider = document.getElementById('revSlider');
    if (slider && document.activeElement !== slider) slider.value = Math.round(day);
    document.querySelectorAll('#revMonths .chip').forEach(c => {
      c.classList.toggle('on', +c.dataset.m === bln);
    });
  }

  /* ================= kontrol ================= */
  function wireControls() {
    const el = id => document.getElementById(id);
    el('revPlay').addEventListener('click', () => {
      playing = !playing;
      el('revPlay').innerHTML = iconSVG(playing ? 'pause' : 'play') +
        `<span>${playing ? 'JEDA' : 'PUTAR'}</span>`;
    });
    el('revReset').addEventListener('click', () => {
      playing = false;
      day = 40;
      el('revPlay').innerHTML = iconSVG('play') + '<span>PUTAR</span>';
      const s = S();
      if (s && s.controls) s.controls.flyTo({ dist: 950, theta: -0.55, phi: 0.95, target: new THREE.Vector3(-112, 0, 0) });
      updateSim();
      AudioSys.play('sweep');
    });
    el('revSpeed').addEventListener('input', e => {
      speed = +e.target.value;
      el('revSpeedVal').textContent = speed + ' hari/dtk';
    });
    el('revSlider').addEventListener('input', e => {
      day = +e.target.value;
      updateSim();
    });
    document.querySelectorAll('#revMonths .chip').forEach(c => {
      c.addEventListener('click', () => {
        day = (+c.dataset.m) * TAHUN / 12 + 1;
        updateSim();
      });
    });
    el('revTglOrbit').addEventListener('click', () => {
      showOrbit = !showOrbit;
      el('revTglOrbit').classList.toggle('on', showOrbit);
      if (orbitLine) orbitLine.visible = showOrbit;
    });
    el('revTglLabel').addEventListener('click', () => {
      showLabels = !showLabels;
      el('revTglLabel').classList.toggle('on', showLabels);
      monthLabels.forEach(l => l.visible = showLabels);
      if (periMark) periMark.visible = showLabels;
      if (apheMark) apheMark.visible = showLabels;
    });
    el('revTglDist').addEventListener('click', () => {
      showDist = !showDist;
      el('revTglDist').classList.toggle('on', showDist);
      if (distLine) distLine.visible = showDist;
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
