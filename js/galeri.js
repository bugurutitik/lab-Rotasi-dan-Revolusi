/* ============================================================
   LABORATORIUM MAYA IPAS — galeri.js
   Galeri Tata Surya: model 3D Matahari, 8 planet, dan Bulan.
   Klik objek (3D atau daftar) untuk info; mode perbandingan
   ukuran; kontrol putar/jeda, label, dan garis orbit.
   ============================================================ */
'use strict';

const Galeri = (() => {

  /* data objek: nilai dari buku; tanda * = pengayaan */
  const OBJ = [
    {
      id: 'matahari', nama: 'Matahari', type: 'BINTANG', color: '#ffd53e',
      r: 42, orbit: 0, speed: 0, tex: 'sun', selfLit: true,
      fakta: [
        ['Jenis', 'Bola gas raksasa yang sangat panas'],
        ['Cahaya', 'Memancarkan cahaya sendiri (karena itu disebut <b>bintang</b>)'],
        ['Kedudukan', 'Pusat tata surya — planet-planet mengorbitnya'],
        ['Diameter', '1.391.900 kilometer'],
        ['Suhu inti', '±15 juta ℃'],
        ['Gravitasi', 'Terbesar di tata surya, ±30× gravitasi Bumi'],
        ['Kedekatan', 'Bintang terdekat dari Bumi; satu-satunya bintang di tata surya']
      ],
      extra: 'Di galaksi Bimasakti ada bintang yang jauh lebih besar: <b>1.708×</b> lebih lebar dari diameter Matahari! Bintang terkecil yang pernah ditemukan berdiameter 116.000 km — sedikit lebih besar dari Saturnus.',
      narasi: 'obj_matahari'
    },
    {
      id: 'bumi', nama: 'Bumi', type: 'PLANET', color: '#3a8fd4',
      r: 7.6, orbit: 138, speed: 0.5, tex: 'earth',
      fakta: [
        ['Jenis', 'Planet — tersusun dari batu dan logam'],
        ['Cahaya', 'Tidak dapat menghasilkan cahaya sendiri'],
        ['Kedudukan', 'Salah satu dari <b>8 planet</b> di tata surya'],
        ['Keistimewaan', 'Satu-satunya planet yang memiliki kehidupan: ada air, oksigen, dan suhu yang sesuai'],
        ['Rotasi', '23 jam 56 menit (berlawanan arah jarum jam)'],
        ['Revolusi', '365,25 hari mengelilingi Matahari']
      ],
      extra: 'Sampai sekarang para ilmuwan belum menemukan planet lain di tata surya yang memiliki kehidupan seperti di Bumi.',
      narasi: 'obj_bumi'
    },
    {
      id: 'bulan', nama: 'Bulan', type: 'SATELIT ALAMI', color: '#c9d2e0',
      r: 2.3, orbit: 0, speed: 2.6, tex: 'moon', earthMoon: true,
      fakta: [
        ['Jenis', 'Satelit alami — benda langit yang mengorbit benda langit lebih besar'],
        ['Kedudukan', 'Satu-satunya satelit alami <b>Bumi</b>'],
        ['Garis edar', 'Berbentuk elips mengelilingi Bumi'],
        ['Durasi revolusi', '27 hari 8 jam'],
        ['Rotasi', 'Durasi rotasi = durasi revolusi, sehingga kita selalu melihat <b>sisi Bulan yang sama</b>'],
        ['Gerak lain', 'Ikut mengelilingi Matahari bersama Bumi']
      ],
      extra: 'Di seluruh tata surya ada sedikitnya 60 satelit alami yang mengorbit planet-planet di dekatnya. Revolusi Bulan membuat bentuknya tampak berubah-ubah dari Bumi (fase Bulan).',
      narasi: 'obj_bulan'
    },
    {
      id: 'merkurius', nama: 'Merkurius', type: 'PLANET', color: '#9b8a78',
      r: 3.6, orbit: 66, speed: 1.6, tex: 'mercury', colorHex: 0x9b8a78,
      fakta: [
        ['Kedudukan', 'Planet terdekat dari Matahari (urutan ke-1 dari 8 planet)'],
        ['Jenis', 'Planet batu *']
      ],
      extra: '* Data planet selain Bumi merupakan <b>pengayaan</b> (informasi tambahan di luar buku IPAS). Buku menegaskan: Bumi adalah salah satu dari 8 planet yang mengorbit Matahari (lihat Gambar 6.2 di buku).',
      narasi: 'obj_merkurius'
    },
    {
      id: 'venus', nama: 'Venus', type: 'PLANET', color: '#e8a54b',
      r: 5.6, orbit: 92, speed: 1.17, tex: 'venus', colorHex: 0xe8a54b,
      fakta: [
        ['Kedudukan', 'Urutan ke-2 dari Matahari'],
        ['Jenis', 'Planet batu *']
      ],
      extra: 'Planet tidak menghasilkan cahaya sendiri — ia hanya memantulkan cahaya Matahari.',
      narasi: 'obj_venus'
    },
    {
      id: 'mars', nama: 'Mars', type: 'PLANET', color: '#c1553b',
      r: 4.6, orbit: 172, speed: 0.53, tex: 'mars', colorHex: 0xc1553b,
      fakta: [
        ['Kedudukan', 'Urutan ke-4 dari Matahari (tetangga terdekat Bumi)'],
        ['Jenis', 'Planet batu *']
      ],
      extra: 'Urutan planet dari yang terdekat Matahari: Merkurius, Venus, Bumi, Mars, Jupiter, Saturnus, Uranus, Neptunus.',
      narasi: 'obj_mars'
    },
    {
      id: 'jupiter', nama: 'Jupiter', type: 'PLANET', color: '#d8a377',
      r: 17, orbit: 244, speed: 0.23, tex: 'jupiter', colorHex: 0xd8a377,
      fakta: [
        ['Kedudukan', 'Urutan ke-5 dari Matahari'],
        ['Jenis', 'Bola gas raksasa *']
      ],
      extra: 'Buku IPAS menyebut bahwa ada planet yang merupakan <b>bola gas raksasa</b> — Jupiter adalah salah satunya (pengayaan).',
      narasi: 'obj_jupiter'
    },
    {
      id: 'saturnus', nama: 'Saturnus', type: 'PLANET', color: '#e0cb96',
      r: 14, orbit: 312, speed: 0.17, tex: 'saturn', colorHex: 0xe0cb96, ring: true,
      fakta: [
        ['Kedudukan', 'Urutan ke-6 dari Matahari'],
        ['Jenis', 'Bola gas raksasa dengan cincin *']
      ],
      extra: 'Bintang terkecil di Bimasakti (diameter 116.000 km) diperkirakan sedikit lebih besar dari Saturnus.',
      narasi: 'obj_saturnus'
    },
    {
      id: 'uranus', nama: 'Uranus', type: 'PLANET', color: '#9fd8e8',
      r: 10, orbit: 342, speed: 0.12, tex: 'uranus', colorHex: 0x9fd8e8,
      fakta: [
        ['Kedudukan', 'Urutan ke-7 dari Matahari'],
        ['Jenis', 'Bola gas raksasa *']
      ],
      extra: '',
      narasi: 'obj_uranus'
    },
    {
      id: 'neptunus', nama: 'Neptunus', type: 'PLANET', color: '#3f66d8',
      r: 9.6, orbit: 388, speed: 0.09, tex: 'neptune', colorHex: 0x3f66d8,
      fakta: [
        ['Kedudukan', 'Planet terjauh dari Matahari (urutan ke-8)'],
        ['Jenis', 'Bola gas raksasa *']
      ],
      extra: '',
      narasi: 'obj_neptunus'
    }
  ];

  let built = false;
  let running = false;
  let selected = null;
  let meshes = {};        /* id -> mesh */
  let focusObj = null;
  let orbitSpeed = 1;
  let orbiting = true;
  let showLabels = true;
  let showOrbits = true;
  let cmpMode = false;

  const S = () => SceneMgr.scenes['p03'];

  /* ================= build scene ================= */
  function buildScene() {
    built = true;
    SceneMgr.mount('p03', (s) => {
      const scene = s.scene, cam = s.camera;
      addStars(scene, 1000, 2600);

      /* Matahari + corona */
      const sun = makeSun(42);
      scene.add(sun);
      meshes['matahari'] = sun;
      const glow1 = makeGlow(360, 0xffd76a, 0.95);
      const glow2 = makeGlow(160, 0xfff6d8, 1);
      glow2.userData.noPick = true; glow1.userData.noPick = true;
      scene.add(glow1); scene.add(glow2);

      labLights(scene, { ambient: 1.1, sun: 0.0, sx: 0, sy: 0, sz: 0 });
      /* Matahari sebagai sumber cahaya */
      const sunLight = new THREE.PointLight(0xfff0b8, 1.5, 4000);
      scene.add(sunLight);

      /* planet-planet */
      const orbitGroup = new THREE.Group();
      scene.add(orbitGroup);
      s.orbitGroup = orbitGroup;

      OBJ.forEach(o => {
        if (o.id === 'matahari') return;
        if (o.earthMoon) {
          /* Bulan mengorbit Bumi — holder dipasang ke pivot Bumi
             (bukan ke bola Bumi) agar orbit Bulan tidak ikut
             berputar saat Bumi berotasi pada porosnya. */
          const bumi = meshes['bumi'];
          const holder = new THREE.Group();
          const moonOrbit = new THREE.Group();
          const moon = makeMoon(o.r);
          moon.position.set(15, 0, 0);
          moonOrbit.add(moon);
          holder.add(moonOrbit);
          holder.position.copy(bumi.position);
          if (bumi.userData.pivot) bumi.userData.pivot.add(holder);
          bumi.userData.holder = holder;
          bumi.userData.moonOrbit = moonOrbit;
          moon.userData.objId = 'bulan';
          moon.userData.holder = holder;
          moon.userData.moonOrbit = moonOrbit;
          meshes['bulan'] = moon;
          /* garis orbit bulan */
          const mo = makeOrbitLine(ellipsePoints(15, 15, 0, 0, 64), 0x8fb7ff, 0.35);
          holder.add(mo);
          s.moonOrbitLine = mo;
          return;
        }
        const m = o.tex === 'earth'
          ? makeEarth(o.r)
          : (o.tex
              ? makePlanet(o.r, o.tex, { fallback: o.colorHex || 0x9aa8b8 })
              : new THREE.Mesh(
                  new THREE.SphereGeometry(o.r, 36, 24),
                  new THREE.MeshPhongMaterial({ color: o.colorHex, shininess: 4 })
                ));
        m.userData.objId = o.id;
        meshes[o.id] = m;

        if (o.ring) {
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(o.r * 1.35, o.r * 1.95, 48),
            new THREE.MeshBasicMaterial({ color: 0xe8d9a8, transparent: true, opacity: 0.62, side: THREE.DoubleSide })
          );
          ring.rotation.x = Math.PI / 2.4;
          m.add(ring);
          const ring2 = new THREE.Mesh(
            new THREE.RingGeometry(o.r * 2.05, o.r * 2.22, 48),
            new THREE.MeshBasicMaterial({ color: 0xd9c48a, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
          );
          ring2.rotation.x = Math.PI / 2.4;
          m.add(ring2);
        }

        const pivot = new THREE.Group();
        m.position.set(o.orbit, 0, 0);
        m.userData.pivot = pivot;
        pivot.add(m);
        orbitGroup.add(pivot);

        /* garis orbit planet */
        const line = makeOrbitLine(ellipsePoints(o.orbit, o.orbit, 0, 0, 96), 0x37e6ff, 0.22);
        orbitGroup.add(line);
        m.userData.orbitLine = line;

        /* label (bergantian di atas / di bawah planet agar tidak bertumpuk) */
        const diBawah = (o.id === 'mars' || o.id === 'venus' || o.id === 'neptunus');
        const lab = makeLabel(o.nama, { fontSize: 56, screenH: 0.03 });
        lab.position.set(o.orbit, diBawah ? -(o.r + 10) : o.r + 12, 0);
        pivot.add(lab);
        m.userData.label = lab;
      });

      /* label matahari */
      const sunLab = makeLabel('Matahari', { fontSize: 56, screenH: 0.038 });
      sunLab.position.set(0, 86, 0);
      scene.add(sunLab);
      s.sunLabel = sunLab;

      /* kamera & kontrol */
      const ctl = new OrbitCam(cam, s.canvas, { dist: 960, theta: 0.7, phi: 1.05, minDist: 90, maxDist: 1700 });
      s.controls = ctl;

      /* pemilih objek dengan klik (bukan seret) */
      const ray = new THREE.Raycaster();
      let downPos = null, downT = 0;
      s.canvas.addEventListener('pointerdown', e => { downPos = [e.clientX, e.clientY]; downT = Date.now(); });
      s.canvas.addEventListener('pointerup', e => {
        if (!downPos) return;
        const d = Math.hypot(e.clientX - downPos[0], e.clientY - downPos[1]);
        const dt = Date.now() - downT;
        downPos = null;
        if (d > 8 || dt > 600) return;
        const rect = s.canvas.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        ray.setFromCamera({ x: nx, y: ny }, cam);
        const targets = [];
        for (const id in meshes) {
          const m = meshes[id];
          targets.push(m);
          if (m.userData.holder) targets.push(m.userData.holder);
        }
        targets.push(sun);
        const hit = ray.intersectObjects(targets, true)[0];
        if (hit) {
          let o = hit.object;
          while (o && !o.userData.objId && o.parent) o = o.parent;
          if (o && o.userData.objId) {
            select(o.userData.objId);
            AudioSys.play('pop');
          }
        }
      });

      let t = 0;
      s.tick = (dt) => {
        if (orbiting) t += dt * orbitSpeed;
        OBJ.forEach(o => {
          if (o.id === 'matahari' || o.earthMoon) return;
          const m = meshes[o.id];
          if (m && m.userData.pivot) {
            m.userData.pivot.rotation.y = t * o.speed + (o.startAngle || 0);
            m.rotation.y += dt * 0.4;
          }
        });
        const bumi = meshes['bumi'];
        if (bumi && bumi.userData.moonOrbit) {
          bumi.rotation.y += dt * 0.55 * (orbiting ? orbitSpeed : 1);
          bumi.userData.moonOrbit.rotation.y = t * 2.2;
          meshes['bulan'].rotation.y += dt * 0.3;
        }
        sun.rotation.y += dt * 0.05;
        /* kamera mengikuti objek fokus */
        if (focusObj && focusObj.getWorldPosition) {
          const wp = focusObj.getWorldPosition(new THREE.Vector3());
          ctl.target.lerp(wp, 0.18);
        } else {
          ctl.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
        }
      };
    });
    buildList();
    wireControls();
    select('matahari', true);
  }

  /* ================= daftar objek ================= */
  function buildList() {
    const wrap = document.getElementById('galList');
    if (!wrap) return;
    wrap.innerHTML = '';
    OBJ.forEach(o => {
      const b = document.createElement('button');
      b.className = 'gal-obj';
      b.dataset.obj = o.id;
      b.innerHTML = `<span class="gal-dot" style="background:${o.color};color:${o.color}"></span><span>${o.nama}</span>`;
      b.addEventListener('click', () => select(o.id));
      wrap.appendChild(b);
    });
  }

  /* ================= pemilihan objek ================= */
  function select(id, silent) {
    const o = OBJ.find(x => x.id === id);
    if (!o) return;
    selected = id;
    document.querySelectorAll('.gal-obj').forEach(b => b.classList.toggle('on', b.dataset.obj === id));

    /* panel info */
    const info = document.getElementById('galInfo');
    info.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span class="gal-dot" style="background:${o.color};color:${o.color};width:20px;height:20px;box-shadow:0 0 10px ${o.color}"></span>
        <b style="font-family:var(--font-head);font-size:15px;letter-spacing:1px">${o.nama.toUpperCase()}</b>
        <span class="q-type" style="margin-left:auto">${o.type}</span>
      </div>
      ${o.fakta.map(f => `<div class="kv"><span>${f[0]}</span><b>${f[1]}</b></div>`).join('')}
      ${o.extra ? `<div class="note purple" style="margin-top:9px">${iconSVG('bulb')}<span>${o.extra}</span></div>` : ''}
    `;

    /* narasi objek */
    if (!silent && o.narasi) Narrator.speak(o.narasi);

    /* kamera fokus */
    const s = S();
    if (s && s.controls) {
      if (id === 'matahari') {
        focusObj = null;
        s.controls.flyTo({ dist: silent ? 960 : 420, target: new THREE.Vector3(0, 0, 0) });
      } else if (o.earthMoon) {
        focusObj = meshes['bulan'];
        s.controls.flyTo({ dist: 70 });
      } else {
        focusObj = meshes[id];
        s.controls.flyTo({ dist: Math.max(48, o.r * 9) });
      }
    }
  }

  function narrateObject() {
    const o = OBJ.find(x => x.id === selected);
    if (o && o.narasi) Narrator.speak(o.narasi);
    else Narrator.speak('p03_balon1');
  }

  /* ================= kontrol ================= */
  function wireControls() {
    const el = id => document.getElementById(id);
    el('galPlay').addEventListener('click', () => {
      orbiting = !orbiting;
      el('galPlay').innerHTML = iconSVG(orbiting ? 'pause' : 'play') + `<span>${orbiting ? 'JEDA' : 'PUTAR'}</span>`;
    });
    el('galSpeed').addEventListener('input', e => { orbitSpeed = +e.target.value; });
    el('galReset').addEventListener('click', () => {
      orbiting = true; orbitSpeed = 1;
      el('galPlay').innerHTML = iconSVG('pause') + '<span>JEDA</span>';
      el('galSpeed').value = 1;
      select('matahari', true);
      const s = S();
      if (s && s.controls) s.controls.flyTo({ dist: 960, theta: 0.7, phi: 1.05, target: new THREE.Vector3(0, 0, 0) });
      focusObj = null;
    });
    document.querySelectorAll('#galTglLabel, #galTglOrbit').forEach(() => { });
    el('galTglLabel').addEventListener('click', () => {
      showLabels = !showLabels;
      el('galTglLabel').classList.toggle('on', showLabels);
      const s = S();
      if (s) {
        OBJ.forEach(o => {
          const m = meshes[o.id];
          if (m && m.userData.label) m.userData.label.visible = showLabels;
        });
        if (s.sunLabel) s.sunLabel.visible = showLabels;
      }
    });
    el('galTglOrbit').addEventListener('click', () => {
      showOrbits = !showOrbits;
      el('galTglOrbit').classList.toggle('on', showOrbits);
      const s = S();
      if (s) {
        OBJ.forEach(o => {
          const m = meshes[o.id];
          if (m && m.userData.orbitLine) m.userData.orbitLine.visible = showOrbits;
        });
        if (s.moonOrbitLine) s.moonOrbitLine.visible = showOrbits;
      }
    });
    el('galCmp').addEventListener('click', () => {
      cmpMode = !cmpMode;
      el('galCmp').classList.toggle('on', cmpMode);
      document.getElementById('galCmpPanel').classList.toggle('hidden', !cmpMode);
      document.getElementById('galInfoPanel').classList.toggle('hidden', cmpMode);
      if (cmpMode) renderCmp();
    });
  }

  /* perbandingan ukuran (skala sebenarnya) */
  const CMP = [
    { nama: 'Matahari', d: 1391900, color: '#ffd53e', cat: 'bintang' },
    { nama: 'Jupiter', d: 139820, color: '#d8a377', cat: 'planet *' },
    { nama: 'Saturnus', d: 116460, color: '#e0cb96', cat: 'planet *' },
    { nama: 'Bumi', d: 12742, color: '#3a8fd4', cat: 'planet' },
    { nama: 'Bulan', d: 3474, color: '#c9d2e0', cat: 'satelit' }
  ];
  function renderCmp() {
    const max = CMP[0].d;
    document.getElementById('galCmpBody').innerHTML = CMP.map(c => {
      const w = Math.max(0.5, c.d / max * 100);
      const rel = c.nama === 'Matahari' ? '' :
        (c.d / 12742 >= 1 ? `±${(c.d / 12742).toFixed(0)}× Bumi` : `±${(12742 / c.d).toFixed(1)}× lebih kecil dari Bumi`);
      return `<div class="cmp-row">
        <span class="cmp-name">${c.nama}</span>
        <span class="cmp-track"><span class="cmp-bar" style="width:${w}%;background:${c.color}"></span></span>
        <span class="cmp-val">${c.d.toLocaleString('id-ID')} km ${rel ? '· ' + rel : ''}</span>
      </div>`;
    }).join('') + `
    <div class="note" style="margin-top:10px">${iconSVG('info')}<span>Perbandingan memakai <b>skala sebenarnya</b>.
    Diameter Matahari dari buku (1.391.900 km); diameter Jupiter, Saturnus, Bumi, dan Bulan adalah <b>pengayaan</b> (*).
    Bumi tampak kecil karena Matahari ±<b>109×</b> lebih lebar!</span></div>`;
  }

  /* ================= siklus halaman ================= */
  function enter() {
    if (!built) buildScene();
    const s = S();
    if (s && !s.running) s.start();
  }
  function leave() {
    const s = S();
    if (s) s.stop();
  }

  function init() { /* dibangun saat pertama masuk halaman */ }

  return { init, enter, leave, select, narrateObject };
})();
