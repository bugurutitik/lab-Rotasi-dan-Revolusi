/* ============================================================
   LABORATORIUM MAYA IPAS — rotasi.js
   Lab 01: simulasi rotasi Bumi — poros, arah rotasi berlawanan
   arah jarum jam, siang-malam, gerak semu harian Matahari,
   dan pengamat di Jakarta. Sumber cahaya: Matahari.
   ============================================================ */
'use strict';

const RotasiLab = (() => {

  const JKT = { lat: -6.2, lon: 106.8 };
  const EARTH_R = 100;

  let built = false;
  let simT = 12;           /* jam simulasi 0-24 */
  let playing = false;
  let speed = 3;           /* jam per detik */
  let showAxis = true;
  let showArrow = true;
  let followMode = false;

  let earth, earthGroup, axisGroup, arrowGroup, jakartaPin, sunMesh, sunGlow;
  let dirLight;

  const S = () => SceneMgr.scenes['p04'];

  /* ================= build ================= */
  function buildScene() {
    built = true;
    SceneMgr.mount('p04', (s) => {
      const scene = s.scene, cam = s.camera;
      addStars(scene, 900, 2400);

      /* Bumi + grup */
      earthGroup = new THREE.Group();
      scene.add(earthGroup);
      earth = makeEarth(EARTH_R);
      earthGroup.add(earth);

      /* atmosfer tipis */
      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(EARTH_R * 1.05, 48, 32),
        new THREE.MeshBasicMaterial({ color: 0x2e9fdf, transparent: true, opacity: 0.08, side: THREE.BackSide })
      );
      earthGroup.add(atmo);

      /* poros / sumbu rotasi (ungu, dengan ujung panah) */
      axisGroup = new THREE.Group();
      const axisMat = new THREE.MeshBasicMaterial({ color: 0xb79bff });
      const axis = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, EARTH_R * 2.6, 10), axisMat);
      axisGroup.add(axis);
      const tipUjung = new THREE.Mesh(new THREE.ConeGeometry(3.6, 10, 10), axisMat);
      tipUjung.position.set(0, EARTH_R * 1.32, 0);
      axisGroup.add(tipUjung);
      const tipBawah = new THREE.Mesh(new THREE.ConeGeometry(3.6, 10, 10), axisMat);
      tipBawah.position.set(0, -EARTH_R * 1.32, 0);
      tipBawah.rotation.x = Math.PI;
      axisGroup.add(tipBawah);
      const labAx = makeLabel('GARIS SUMBU ROTASI (kerucut = ujung poros)', { fontSize: 40, screenH: 0.026, color: '#d9c6ff', border: 'rgba(183,155,255,0.65)' });
      labAx.position.set(0, EARTH_R * 1.68, 0);
      axisGroup.add(labAx);
      const labN = makeLabel('Kutub Utara', { fontSize: 52, screenH: 0.03 });
      labN.position.set(0, EARTH_R * 1.42, 0);
      axisGroup.add(labN);
      const labS = makeLabel('Kutub Selatan', { fontSize: 52, screenH: 0.03 });
      labS.position.set(0, -EARTH_R * 1.42, 0);
      axisGroup.add(labS);
      earthGroup.add(axisGroup);

      /* panah arah rotasi (oranye, berlawanan arah jarum jam dilihat dari Kutub Utara) */
      arrowGroup = new THREE.Group();
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(EARTH_R * 1.22, 1.8, 10, 64, Math.PI * 1.45),
        new THREE.MeshBasicMaterial({ color: 0xffb02e, transparent: true, opacity: .9 })
      );
      torus.rotation.x = Math.PI / 2;
      torus.rotation.z = Math.PI * 0.1;
      arrowGroup.add(torus);
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(7, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0xffb02e })
      );
      const ang = Math.PI * 0.1 + Math.PI * 1.45;
      cone.position.set(Math.cos(ang) * EARTH_R * 1.22, EARTH_R * 0.55, -Math.sin(ang) * EARTH_R * 1.22);
      cone.rotation.z = -ang + Math.PI / 2;
      cone.rotation.x = Math.PI / 2;
      arrowGroup.add(cone);
      const labA = makeLabel('PANAH ARAH ROTASI — kerucut oranye: ujung panah', {
        fontSize: 40, screenH: 0.028, color: '#ffe2a8', border: 'rgba(255,176,46,0.7)'
      });
      labA.position.set(0, EARTH_R * 1.78, 0);
      arrowGroup.add(labA);
      /* label kecil tepat di kerucut panah */
      const labCone = makeLabel('UJUNG PANAH', { fontSize: 34, screenH: 0.02, color: '#ffcf8a', border: 'rgba(255,176,46,0.6)', bg: 'rgba(30,18,2,0.82)' });
      labCone.position.set(cone.position.x * 1.02, EARTH_R * 0.55 - 20, cone.position.z * 1.02);
      arrowGroup.add(labCone);
      earthGroup.add(arrowGroup);

      /* pin pengamat Jakarta */
      jakartaPin = makePin(0x37e6ff);
      const jv = latLonToVec3(JKT.lat, JKT.lon, EARTH_R + 2);
      jakartaPin.position.copy(jv);
      earth.add(jakartaPin);
      const jLab = makeLabel('Jakarta', { fontSize: 52, screenH: 0.034, color: '#bfeaff' });
      jLab.position.copy(jv.clone().multiplyScalar(1.13));
      earth.add(jLab);

      /* Matahari di kanan (terlihat dalam bingkai) + label */
      sunMesh = makeSun(170);
      sunMesh.position.set(1080, 40, 0);
      scene.add(sunMesh);
      sunGlow = makeGlow(520, 0xffd76a, 0.9);
      sunGlow.position.set(1080, 40, 0);
      scene.add(sunGlow);
      const sunLab = makeLabel('MATAHARI', { fontSize: 64, screenH: 0.05, color: '#ffe8a0' });
      sunLab.position.set(1080, 210, 0);
      scene.add(sunLab);

      scene.add(new THREE.AmbientLight(0x22406b, 1.0));
      dirLight = new THREE.DirectionalLight(0xfff2d8, 1.6);
      dirLight.position.set(1000, 60, 80);
      scene.add(dirLight);

      const ctl = new OrbitCam(cam, s.canvas, {
        dist: 480, theta: Math.PI * 0.62, phi: 1.22,
        minDist: 130, maxDist: 900, target: new THREE.Vector3(0, 58, 0)
      });
      s.controls = ctl;

      /* azimuth dasar Jakarta (agar pukul 12 menghadap Matahari) */
      const v0 = latLonToVec3(JKT.lat, JKT.lon, 1);
      const alpha0 = Math.atan2(v0.z, v0.x);
      earthGroup.userData.alpha0 = alpha0;

      s.tick = (dt) => {
        if (playing) {
          simT += dt * speed;
          if (simT >= 24) simT -= 24;
          updateSim();
        }
        earthGroup.rotation.y = alpha0 + (simT - 12) / 24 * Math.PI * 2;
        sunMesh.rotation.y += dt * 0.03;

        if (followMode && jakartaPin) {
          const wp = jakartaPin.getWorldPosition(new THREE.Vector3());
          ctl.target.lerp(wp, 0.25);
        } else {
          ctl.target.lerp(new THREE.Vector3(0, 0, 0), 0.12);
        }
      };
      updateSim();
    });
    wireControls();
  }

  /* ================= status simulasi ================= */
  function jamStr() {
    const h = Math.floor(simT), m = Math.floor((simT - h) * 60);
    return String(h).padStart(2, '0') + '.' + String(m).padStart(2, '0');
  }

  function sunStatus() {
    /* berdasarkan geometri: 06 terbit, 12 tengah hari, 18 terbenam (ideal khatulistiwa) */
    if (simT >= 6 && simT < 18) {
      if (Math.abs(simT - 12) < 1) return { txt: 'Tengah hari — Matahari di atas kepala', cls: 'day' };
      if (simT < 12) return { txt: 'Pagi — Matahari terbit di timur', cls: 'day' };
      return { txt: 'Sore — Matahari condong ke barat', cls: 'day' };
    }
    return { txt: 'Malam — Matahari tidak terlihat', cls: 'night' };
  }

  function updateSim() {
    /* HUD jam */
    const jamEl = document.getElementById('rotClock');
    if (jamEl) jamEl.textContent = jamStr();

    /* status pengamat */
    const st = sunStatus();
    const statEl = document.getElementById('rotStatus');
    const statSub = document.getElementById('rotStatusSub');
    if (statEl) {
      statEl.textContent = (simT >= 6 && simT < 18) ? 'SIANG' : 'MALAM';
      statEl.className = 'hud-value ' + st.cls;
    }
    if (statSub) statSub.textContent = st.txt;

    /* kompas gerak semu */
    const sun = document.getElementById('rotSun');
    if (sun) {
      const p = Math.max(0, Math.min(1, (simT - 6) / 12));
      const cx = 78, cy = 86, R = 62;
      const x = cx + R * Math.cos(Math.PI * (1 - p));
      const y = cy - R * Math.sin(Math.PI * (1 - p));
      sun.setAttribute('cx', x.toFixed(1));
      sun.setAttribute('cy', y.toFixed(1));
      sun.style.opacity = (simT >= 6 && simT < 18) ? 1 : 0.15;
    }

    /* panel pengamatan */
    const obs = document.getElementById('rotObs');
    if (obs) {
      obs.innerHTML = `
        <div class="kv"><span>Jam simulasi di Jakarta</span><b class="hl">${jamStr()}</b></div>
        <div class="kv"><span>Kondisi</span><b>${(simT >= 6 && simT < 18) ? 'Siang' : 'Malam'}</b></div>
        <div class="kv"><span>Posisi Matahari</span><b>${st.txt}</b></div>
        <div class="kv"><span>Petunjuk</span><b>${playing ? 'Bumi sedang berputar…' : 'Rotasi dijeda'}</b></div>`;
    }
  }

  /* ================= kontrol ================= */
  function wireControls() {
    const el = id => document.getElementById(id);
    el('rotPlay').addEventListener('click', () => {
      playing = !playing;
      el('rotPlay').innerHTML = iconSVG(playing ? 'pause' : 'play') +
        `<span>${playing ? 'JEDA' : 'PUTAR'}</span>`;
      updateSim();
    });
    el('rotReset').addEventListener('click', () => {
      playing = false;
      simT = 12;
      el('rotPlay').innerHTML = iconSVG('play') + '<span>PUTAR</span>';
      const s = S();
      if (s && s.controls) {
        s.controls.flyTo({ dist: 480, theta: Math.PI * 0.62, phi: 1.22, target: new THREE.Vector3(0, 58, 0) });
      }
      followMode = false;
      el('rotFollow').classList.remove('on');
      updateSim();
      AudioSys.play('sweep');
    });
    el('rotSpeed').addEventListener('input', e => {
      speed = +e.target.value;
      el('rotSpeedVal').textContent = speed + ' jam/dtk';
    });
    el('rotTglAxis').addEventListener('click', () => {
      showAxis = !showAxis;
      el('rotTglAxis').classList.toggle('on', showAxis);
      if (axisGroup) axisGroup.visible = showAxis;
    });
    el('rotTglArrow').addEventListener('click', () => {
      showArrow = !showArrow;
      el('rotTglArrow').classList.toggle('on', showArrow);
      if (arrowGroup) arrowGroup.visible = showArrow;
    });
    el('rotFollow').addEventListener('click', () => {
      followMode = !followMode;
      el('rotFollow').classList.toggle('on', followMode);
      const s = S();
      if (s && s.controls) s.controls.flyTo({ dist: followMode ? 190 : 340 });
      updateSim();
    });
    /* preset waktu */
    document.querySelectorAll('#rotPresets .chip').forEach(c => {
      c.addEventListener('click', () => {
        simT = +c.dataset.t;
        document.querySelectorAll('#rotPresets .chip').forEach(x => x.classList.remove('on'));
        c.classList.add('on');
        updateSim();
      });
    });
  }

  /* ================= siklus halaman ================= */
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
