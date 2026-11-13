/* ============================================================
   LABORATORIUM MAYA IPAS — lab3d.js
   Utilitas 3D bersama: manajer scene per halaman, kontrol orbit
   (seret-putar + zoom sentuh/roda), tekstur planet, bintang,
   label sprite, dan helper koordinat lat/lon.
   ============================================================ */
'use strict';

/* ---------------- Manajer scene ---------------- */
const SceneMgr = (() => {
  const scenes = {};      /* id -> objek scene */
  let activeId = null;
  let stageScale = 1;

  function ensure(id) {
    if (scenes[id]) return scenes[id];
    const canvas = document.getElementById(id + 'Canvas');
    if (!canvas || !window.THREE) return null;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(1);
    const s = build(id, canvas, renderer);
    scenes[id] = s;
    resizeOne(id);
    return s;
  }

  function build(id, canvas, renderer) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 4000);
    const s = {
      id, canvas, renderer, scene, camera,
      controls: null, tick: null, raf: null, last: 0, running: false
    };
    s.start = () => {
      if (s.running) return;
      s.running = true; s.last = performance.now();
      const loop = (now) => {
        if (!s.running) return;
        const dt = Math.min(0.06, (now - s.last) / 1000);
        s.last = now;
        if (s.tick) s.tick(dt, now / 1000);
        if (s.controls) s.controls.update();
        renderer.render(scene, camera);
        s.raf = requestAnimationFrame(loop);
      };
      s.raf = requestAnimationFrame(loop);
    };
    s.stop = () => {
      s.running = false;
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = null;
    };
    return s;
  }

  function resizeOne(id) {
    const s = scenes[id];
    if (!s) return;
    const hold = s.canvas.parentElement;
    if (!hold) return;
    const w = Math.max(2, hold.clientWidth), h = Math.max(2, hold.clientHeight);
    const dpr = Math.min(2, (window.devicePixelRatio || 1) * Math.max(stageScale, 0.5));
    s.renderer.setPixelRatio(dpr);
    s.renderer.setSize(w, h, false);
    s.camera.aspect = w / h;
    s.camera.updateProjectionMatrix();
  }

  function onResize(scale) {
    if (scale) stageScale = scale;
    for (const id in scenes) resizeOne(id);
  }

  function setActive(id) {
    if (activeId === id) return;
    for (const sid in scenes) {
      const s = scenes[sid];
      if (s.page !== id) s.stop();
    }
    activeId = id;
    const s = ensure(id);
    if (s) { resizeOne(id); s.start(); }
  }

  /* Halaman mendaftarkan pembangun scene-nya saat pertama masuk.
     page: id halaman pemilik (untuk sub-scene seperti eksperimen). */
  function mount(id, makeFn, page) {
    const s = ensure(id);
    if (s && !s.built && makeFn) {
      s.page = page || id;
      makeFn(s);
      s.built = true;
      resizeOne(id);
    }
    return s;
  }

  return { setActive, mount, onResize, resizeOne, get active() { return activeId; }, scenes };
})();

/* ---------------- Kontrol orbit sederhana ---------------- */
class OrbitCam {
  constructor(camera, canvas, opts = {}) {
    this.cam = camera;
    this.canvas = canvas;
    this.target = opts.target ? opts.target.clone() : new THREE.Vector3(0, 0, 0);
    this.theta = opts.theta != null ? opts.theta : Math.PI / 5;   /* azimuth */
    this.phi = opts.phi != null ? opts.phi : 1.05;                /* polar */
    this.dist = opts.dist || 300;
    this.minDist = opts.minDist || 40;
    this.maxDist = opts.maxDist || 1200;
    this.minPhi = opts.minPhi != null ? opts.minPhi : 0.12;
    this.maxPhi = opts.maxPhi != null ? opts.maxPhi : Math.PI - 0.12;
    this.rotSpeed = opts.rotSpeed != null ? opts.rotSpeed : 0.0052;
    this.zoomStep = opts.zoomStep != null ? opts.zoomStep : 0.0016;
    this.enabled = true;
    this.autoRotate = 0;          /* radian per detik */

    /* nilai halus (damping) */
    this._cth = this.theta; this._cph = this.phi; this._cd = this.dist;

    this._ptrs = new Map();
    this._pinch = null;

    canvas.addEventListener('pointerdown', e => this._down(e));
    canvas.addEventListener('pointermove', e => this._move(e));
    canvas.addEventListener('pointerup', e => this._up(e));
    canvas.addEventListener('pointercancel', e => this._up(e));
    canvas.addEventListener('pointerleave', e => this._up(e));
    canvas.addEventListener('wheel', e => this._wheel(e), { passive: false });
    canvas.style.touchAction = 'none';
  }
  _down(e) {
    if (!this.enabled) return;
    this._ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.canvas.setPointerCapture && this.canvas.setPointerCapture(e.pointerId);
  }
  _move(e) {
    if (!this.enabled || !this._ptrs.has(e.pointerId)) return;
    const p = this._ptrs.get(e.pointerId);
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (this._ptrs.size === 1) {
      this.theta -= dx * this.rotSpeed;
      this.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.phi - dy * this.rotSpeed));
    } else if (this._ptrs.size === 2) {
      const pts = [...this._ptrs.values()];
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (this._pinch != null && d > 0) {
        const f = 1 + (this._pinch - d) * this.zoomStep * 1.6;
        this.dist = Math.max(this.minDist, Math.min(this.maxDist, this.dist * f));
      }
      this._pinch = d;
    }
  }
  _up(e) {
    this._ptrs.delete(e.pointerId);
    if (this._ptrs.size < 2) this._pinch = null;
  }
  _wheel(e) {
    if (!this.enabled) return;
    e.preventDefault();
    const f = 1 + (e.deltaY > 0 ? 1 : -1) * 0.11;
    this.dist = Math.max(this.minDist, Math.min(this.maxDist, this.dist * f));
  }
  update() {
    const k = 0.14;
    this._cth += (this.theta - this._cth) * k;
    this._cph += (this.phi - this._cph) * k;
    this._cd += (this.dist - this._cd) * k;
    if (this.autoRotate && this._ptrs.size === 0) {
      this.theta += this.autoRotate * 0.016;
      this._cth = this.theta;
    }
    const sp = Math.sin(this._cph), cp = Math.cos(this._cph);
    this.cam.position.set(
      this.target.x + this._cd * sp * Math.sin(this._cth),
      this.target.y + this._cd * cp,
      this.target.z + this._cd * sp * Math.cos(this._cth)
    );
    this.cam.lookAt(this.target);
  }
  flyTo(opts) {
    if (opts.dist != null) this.dist = Math.max(this.minDist, Math.min(this.maxDist, opts.dist));
    if (opts.theta != null) this.theta = opts.theta;
    if (opts.phi != null) this.phi = Math.max(this.minPhi, Math.min(this.maxPhi, opts.phi));
    if (opts.target) this.target.copy(opts.target);
  }
}

/* ---------------- Tekstur planet ---------------- */
const TEX = {};
/* Tekstur tersemat (texture_data.js) dipakai lebih dulu supaya bola
   SELALU berwarna walau berkas PNG tidak terbaca (mis. dibuka langsung
   dari dalam ZIP). Jika data URI pun gagal, material memakai warna
   cadangan sehingga bola tetap terlihat, bukan hitam polos. */
function loadTex(name, cb) {
  if (TEX[name]) return TEX[name];
  const src = (typeof TEX_DATA !== 'undefined' && TEX_DATA[name])
    ? TEX_DATA[name]
    : 'assets/img/textures/' + name;
  const t = new THREE.TextureLoader().load(src, cb);
  t.anisotropy = 4;
  TEX[name] = t;
  return t;
}

/* Pasang tekstur dengan aman: material mulai sebagai warna cadangan;
   begitu tekstur termuat, peta dipasang dan warna menjadi putih
   (tekstur tampak asli). Bila tekstur gagal termuat, warna cadangan
   tetap dipakai sehingga bola tidak pernah tampak hitam polos. */
function applyTexSafe(mat, name, fallbackHex) {
  mat.color = new THREE.Color(fallbackHex);
  try {
    const t = loadTex(name, () => {
      mat.map = t;
      mat.color.setHex(0xffffff);
      mat.needsUpdate = true;
    });
    /* tekstur sudah termuat (dari cache panggilan sebelumnya) */
    if (t.image && t.image.width) {
      mat.map = t;
      mat.color.setHex(0xffffff);
    }
  } catch (e) { /* tetap warna cadangan */ }
  return mat;
}

function makeEarth(radius, opts = {}) {
  const mat = new THREE.MeshPhongMaterial({
    shininess: 6,
    specular: new THREE.Color(0x1a3a5f)
  });
  applyTexSafe(mat, opts.zones ? 'earth_zones.png' : 'earth_day.png', 0x2f7fd0);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), mat);
  return mesh;
}

function makeMoon(radius) {
  const mat = new THREE.MeshPhongMaterial({ shininess: 2 });
  applyTexSafe(mat, 'moon.png', 0xc9d2e0);
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), mat);
}

/* Planet bertekstur (mercury/venus/mars/jupiter/saturn/uranus/neptune). */
function makePlanet(radius, texName, opts = {}) {
  const mat = new THREE.MeshPhongMaterial({
    shininess: opts.shininess != null ? opts.shininess : 4
  });
  applyTexSafe(mat, texName + '.png', opts.fallback != null ? opts.fallback : 0x9aa8b8);
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 40, 28), mat);
}

function makeSun(radius) {
  const mat = new THREE.MeshBasicMaterial();
  applyTexSafe(mat, 'sun.png', 0xffd53e);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), mat);
  return mesh;
}

function makeGlow(scale, color = 0xffd27a, opacity = 0.9) {
  const tex = loadTex('glow.png');
  const mat = new THREE.SpriteMaterial({
    map: tex, color, transparent: true, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(scale, scale, 1);
  return sp;
}

/* ---------------- Bintang latar ---------------- */
let _starGeo = null;
function addStars(scene, count = 900, spread = 2600) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().setFromSphericalCoords(
      spread * (0.55 + Math.random() * 0.45),
      Math.acos(2 * Math.random() - 1),
      Math.random() * Math.PI * 2
    );
    pts.push(v.x, v.y, v.z);
  }
  if (!_starGeo) {
    _starGeo = new THREE.BufferGeometry();
    _starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  } else {
    _starGeo = _starGeo.clone();
  }
  const mat = new THREE.PointsMaterial({
    map: loadTex('star.png'), color: 0xcfe6ff, size: 9,
    transparent: true, opacity: .85, sizeAttenuation: true,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const points = new THREE.Points(_starGeo, mat);
  scene.add(points);
  return points;
}

/* ---------------- Label sprite ---------------- */
/* Opts:
   - fontSize: ukuran font pada kanvas tekstur (ketajaman)
   - screenH: JIKA DIISI -> label berukuran tetap di layar (pecahan tinggi
     kanvas, mis. 0.03 = 3% tinggi kanvas) sehingga terbaca pada jarak
     pengamatan apa pun. Jika kosong -> ukuran dunia (skala lama). */
function makeLabel(text, opts = {}) {
  const fs = opts.fontSize || 42;
  const pad = 18;
  const cv = document.createElement('canvas');
  const ctx = cv.getContext('2d');
  ctx.font = `700 ${fs}px Rajdhani, sans-serif`;
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const h = fs + pad * 1.4;
  cv.width = w; cv.height = h;
  const c2 = cv.getContext('2d');
  c2.font = `700 ${fs}px Rajdhani, sans-serif`;
  c2.textAlign = 'center'; c2.textBaseline = 'middle';
  if (opts.bg !== false) {
    c2.fillStyle = opts.bg || 'rgba(6,16,34,0.78)';
    c2.beginPath();
    const r = 10;
    c2.roundRect ? c2.roundRect(1, 1, w - 2, h - 2, r) : c2.rect(1, 1, w - 2, h - 2);
    c2.fill();
    c2.strokeStyle = opts.border || 'rgba(0,220,255,0.55)';
    c2.lineWidth = 2.5;
    c2.stroke();
  }
  c2.fillStyle = opts.color || '#dff4ff';
  c2.fillText(text, w / 2, h / 2 + 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.minFilter = THREE.LinearFilter;
  const screenH = opts.screenH;
  const mat = new THREE.SpriteMaterial({
    map: tex, transparent: true, depthWrite: false,
    sizeAttenuation: screenH == null
  });
  const sp = new THREE.Sprite(mat);
  if (screenH != null) {
    const sy = screenH / 1.15;
    sp.scale.set(sy * (w / h), sy, 1);
  } else {
    const scale = opts.scale || 0.55;
    sp.scale.set(w * scale / 40, h * scale / 40, 1);
  }
  return sp;
}

/* ---------------- Garis / kurva ---------------- */
function makeOrbitLine(points, color = 0x37e6ff, opacity = 0.5, dashed = true) {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  let mat;
  if (dashed) {
    mat = new THREE.LineDashedMaterial({
      color, transparent: true, opacity, dashSize: 14, gapSize: 9
    });
  } else {
    mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  }
  const line = new THREE.Line(geo, mat);
  if (dashed) line.computeLineDistances();
  return line;
}

function ellipsePoints(a, b, cx, cz, n = 128) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n * Math.PI * 2;
    pts.push(new THREE.Vector3(cx + a * Math.cos(t), 0, cz + b * Math.sin(t)));
  }
  return pts;
}

/* ---------------- Lat/lon -> posisi 3D ---------------- */
function latLonToVec3(lat, lon, r) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/* ---------------- Pin kota ---------------- */
function makePin(color = 0x37e6ff) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(4.6, 14, 10),
    new THREE.MeshBasicMaterial({ color })
  );
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: loadTex('glow.png'), color, transparent: true, opacity: .85,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  halo.scale.set(26, 26, 1);
  g.add(core); g.add(halo);
  return g;
}

/* Cahaya standar laboratorium */
function labLights(scene, opts = {}) {
  const amb = new THREE.AmbientLight(0x3a5f8f, opts.ambient != null ? opts.ambient : 1.05);
  scene.add(amb);
  const sun = new THREE.DirectionalLight(0xfff2d8, opts.sun != null ? opts.sun : 1.25);
  sun.position.set(opts.sx || 1000, opts.sy || 120, opts.sz || 160);
  scene.add(sun);
  return { amb, sun };
}
