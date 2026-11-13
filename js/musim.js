/* ============================================================
   LABORATORIUM MAYA IPAS — musim.js
   Lab 04: pergantian musim akibat revolusi Bumi + kemiringan
   sumbu Bumi (bukan karena jarak!). Posisi per bulan, sinar
   Matahari, musim belahan Utara/Selatan, dan meter penerimaan
   sinar. Data musim sesuai buku IPAS (Des-Mar-Jun-Sep).
   ============================================================ */
'use strict';

const MusimLab = (() => {

  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const R_ORBIT = 330;
  const TILT = 23.4;   /* kemiringan sumbu (pengayaan; buku: "sedikit miring") */

  /* musim per bulan: [BBU, BBS] — indeks 0..11 */
  const MUSIM = [
    ['Dingin', 'Panas'], ['Dingin', 'Panas'], ['Semi', 'Gugur'],
    ['Semi', 'Gugur'], ['Semi', 'Gugur'], ['Panas', 'Dingin'],
    ['Panas', 'Dingin'], ['Panas', 'Dingin'], ['Gugur', 'Semi'],
    ['Gugur', 'Semi'], ['Gugur', 'Semi'], ['Dingin', 'Panas']
  ];
  const MUSIM_ICON = { Panas: ['sp-hot', 'sun'], Dingin: ['sp-cold', 'snow'], Semi: ['sp-spring', 'flower'], Gugur: ['sp-fall', 'leaf'] };
  const SIANG_INFO = {
    Panas: 'siang lebih panjang daripada malam',
    Dingin: 'siang lebih pendek daripada malam',
    Semi: 'siang dan malam hampir sama',
    Gugur: 'siang dan malam hampir sama'
  };

  let built = false;
  let month = 11;          /* mulai dari Desember */
  let playing = false;
  let hemi = 'both';       /* both | north | south */
  let showRays = true, showLabels = true;

  let earthPivot, earthMesh, raysGroup, orbitLine, monthLabels = [], sunMesh;
  let dirLight;

  const S = () => SceneMgr.scenes['p07'];

  function phiBulan(m) { return (150 - m * 30) * Math.PI / 180; }
  function posBulan(m) {
    const p = phiBulan(m);
    return new THREE.Vector3(R_ORBIT * Math.cos(p), 0, R_ORBIT * Math.sin(p));
  }
  /* deklinasi Matahari (positif = belahan Utara menerima lebih banyak) */
  function deklinasi(m) { return TILT * Math.sin((m - 2) * Math.PI / 6); }

  /* ================= build ================= */
  function buildScene() {
    built = true;
    SceneMgr.mount('p07', (s) => {
      const scene = s.scene, cam = s.camera;
      addStars(scene, 900, 2600);

      /* Matahari */
      sunMesh = makeSun(48);
      scene.add(sunMesh);
      scene.add(makeGlow(420, 0xffd76a, 0.95));
      scene.add(makeGlow(180, 0xfff6d8, 1));
      scene.add(new THREE.PointLight(0xfff0b8, 1.4, 3000));
      scene.add(new THREE.AmbientLight(0x2a4a77, 1.0));
      dirLight = new THREE.DirectionalLight(0xfff2d8, 1.2);
      scene.add(dirLight);

      /* orbit lingkaran */
      const pts = [];
      for (let i = 0; i <= 120; i++) {
        const p = i / 120 * Math.PI * 2;
        pts.push(new THREE.Vector3(R_ORBIT * Math.cos(p), 0, R_ORBIT * Math.sin(p)));
      }
      orbitLine = makeOrbitLine(pts, 0x37e6ff, 0.45);
      scene.add(orbitLine);

      /* label bulan */
      BULAN.forEach((nm, i) => {
        const pos = posBulan(i);
        const dir = pos.clone().normalize();
        const lab = makeLabel(nm, { fontSize: 48, screenH: 0.024, color: '#9fd0f5', bg: 'rgba(6,16,34,0.6)' });
        lab.position.set(pos.x + dir.x * 40, 12, pos.z + dir.z * 40);
        scene.add(lab);
        monthLabels.push(lab);
        /* penanda 4 bulan kunci */
        if (i === 2 || i === 5 || i === 8 || i === 11) {
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(20, 24, 40),
            new THREE.MeshBasicMaterial({ color: 0xffc44d, transparent: true, opacity: .8, side: THREE.DoubleSide })
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.set(pos.x, 0, pos.z);
          scene.add(ring);
        }
      });

      /* Bumi dengan sumbu miring TETAP arahnya (ke -X dunia) */
      earthPivot = new THREE.Group();
      earthPivot.rotation.z = TILT * Math.PI / 180;   /* utara condong ke -X */
      earthMesh = makeEarth(17);
      earthPivot.add(earthMesh);
      const axis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 54, 8),
        new THREE.MeshBasicMaterial({ color: 0xb79bff, transparent: true, opacity: .85 })
      );
      earthPivot.add(axis);
      const labN = makeLabel('Kutub Utara', { fontSize: 44, screenH: 0.026 });
      labN.position.set(0, 34, 0);
      earthPivot.add(labN);
      const labS = makeLabel('Kutub Selatan', { fontSize: 44, screenH: 0.026 });
      labS.position.set(0, -34, 0);
      earthPivot.add(labS);
      scene.add(earthPivot);

      /* sinar Matahari (garis-garis sejajar menuju Bumi) */
      raysGroup = new THREE.Group();
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: .8 });
      for (let i = -2; i <= 2; i++) {
        const ray = new THREE.Group();
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 200, 6), rayMat);
        shaft.rotation.z = -Math.PI / 2;
        shaft.position.set(160, 0, 0);
        ray.add(shaft);
        const tip = new THREE.Mesh(new THREE.ConeGeometry(3.2, 10, 8), rayMat);
        tip.rotation.z = -Math.PI / 2;
        tip.position.set(263, 0, 0);
        ray.add(tip);
        ray.position.set(0, i * 11, 0);
        raysGroup.add(ray);
      }
      scene.add(raysGroup);

      const ctl = new OrbitCam(cam, s.canvas, {
        dist: 820, theta: 0, phi: 1.05,
        minDist: 200, maxDist: 2000
      });
      s.controls = ctl;

      s.tick = (dt) => {
        if (playing) {
          month = (month + dt * 0.35) % 12;
          updateSim();
        }
        earthMesh.rotation.y += dt * 1.2;
        sunMesh.rotation.y += dt * 0.04;
        /* posisi Bumi & sinar */
        const pos = posBulan(month);
        earthPivot.position.copy(pos);
        const dir = pos.clone().normalize();          /* Matahari -> Bumi */
        raysGroup.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
        dirLight.position.copy(dir.clone().multiplyScalar(600));
      };
      updateSim();
    });
    wireControls();
  }

  /* ================= status ================= */
  function updateSim() {
    const m = Math.floor(((month % 12) + 12) % 12);
    const [mU, mS] = MUSIM[m];
    const d = deklinasi(m);
    const sinU = Math.round(50 + Math.sin(d * Math.PI / 180) * 50);
    const sinS = 100 - sinU;

    document.getElementById('msBulan').textContent = BULAN[m].toUpperCase();
    document.getElementById('msMusimU').innerHTML =
      `<span class="season-pill ${MUSIM_ICON[mU][0]}">${iconSVG(MUSIM_ICON[mU][1])}</span>
       <div><div class="sp-name">Musim ${mU}</div><div class="sp-sub">Belahan Utara · ${SIANG_INFO[mU]}</div></div>`;
    document.getElementById('msMusimS').innerHTML =
      `<span class="season-pill ${MUSIM_ICON[mS][0]}">${iconSVG(MUSIM_ICON[mS][1])}</span>
       <div><div class="sp-name">Musim ${mS}</div><div class="sp-sub">Belahan Selatan · ${SIANG_INFO[mS]}</div></div>`;
    document.getElementById('msFillU').style.width = sinU + '%';
    document.getElementById('msFillS').style.width = sinS + '%';
    document.getElementById('msValU').textContent = sinU + '%';
    document.getElementById('msValS').textContent = sinS + '%';

    /* keterangan bulan kunci sesuai buku */
    const keterangan = {
      11: 'Sesuai buku: <b>Desember</b> — negara di Selatan Bumi menerima sinar Matahari lebih banyak: musim panas di Belahan Selatan dengan siang lebih panjang; Belahan Utara mengalami musim dingin dengan siang lebih pendek.',
      2: 'Sesuai buku: <b>Maret</b> — kedua belahan menerima sinar Matahari sama banyak. Suhu Belahan Utara menghangat (musim semi), Belahan Selatan mendingin (musim gugur).',
      5: 'Sesuai buku: <b>Juni</b> — Belahan Selatan menjauhi Matahari sedangkan Belahan Utara mendekati: musim panas di Belahan Utara dan musim dingin di Belahan Selatan.',
      8: 'Sesuai buku: <b>September</b> — kedua belahan menerima sinar yang sama. Belahan Selatan menghangat (musim semi), Belahan Utara mendingin (musim gugur).'
    };
    document.getElementById('msKet').innerHTML = keterangan[m] ||
      `Bulan <b>${BULAN[m]}</b>: Bumi terus berevolusi dengan sumbu tetap miring — perhatikan bagaimana penerimaan sinar kedua belahan bergeser secara bertahap menuju musim berikutnya.`;

    document.querySelectorAll('#msMonths .chip').forEach(c => {
      c.classList.toggle('on', +c.dataset.m === m);
    });
    const sl = document.getElementById('msSlider');
    if (sl && document.activeElement !== sl) sl.value = m;
  }

  /* ================= kontrol ================= */
  function wireControls() {
    const el = id => document.getElementById(id);
    el('msPlay').addEventListener('click', () => {
      playing = !playing;
      el('msPlay').innerHTML = iconSVG(playing ? 'pause' : 'play') +
        `<span>${playing ? 'JEDA' : 'PUTAR REVOLUSI'}</span>`;
    });
    el('msReset').addEventListener('click', () => {
      playing = false;
      month = 11;
      el('msPlay').innerHTML = iconSVG('play') + '<span>PUTAR REVOLUSI</span>';
      const s = S();
      if (s && s.controls) s.controls.flyTo({ dist: 820, theta: 0, phi: 1.05 });
      updateSim();
      AudioSys.play('sweep');
    });
    el('msSlider').addEventListener('input', e => {
      month = +e.target.value;
      updateSim();
    });
    document.querySelectorAll('#msMonths .chip').forEach(c => {
      c.addEventListener('click', () => { month = +c.dataset.m; updateSim(); });
    });
    /* pilih belahan pengamatan */
    document.querySelectorAll('#msHemi .chip').forEach(c => {
      c.addEventListener('click', () => {
        hemi = c.dataset.h;
        document.querySelectorAll('#msHemi .chip').forEach(x => x.classList.remove('on'));
        c.classList.add('on');
        const s = S();
        if (s && s.controls) {
          if (hemi === 'north') s.controls.flyTo({ phi: 0.42, dist: 700 });
          else if (hemi === 'south') s.controls.flyTo({ phi: Math.PI - 0.42, dist: 700 });
          else s.controls.flyTo({ phi: 1.05, dist: 820 });
        }
      });
    });
    el('msTglRay').addEventListener('click', () => {
      showRays = !showRays;
      el('msTglRay').classList.toggle('on', showRays);
      if (raysGroup) raysGroup.visible = showRays;
    });
    el('msTglLabel').addEventListener('click', () => {
      showLabels = !showLabels;
      el('msTglLabel').classList.toggle('on', showLabels);
      monthLabels.forEach(l => l.visible = showLabels);
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
