/* ============================================================
   LABORATORIUM MAYA IPAS — pages.js
   Halaman pembuka (gerbang), beranda + progres, petunjuk
   penggunaan, refleksi peneliti muda.
   ============================================================ */
'use strict';

const Pages = (() => {

  /* ================= SPLASH (p00) ================= */
  let splashArmed = false;
  let splashBuilt = false;
  let sambutanTimer = null;

  function splashReset() {
    splashArmed = false;
    const hint = document.getElementById('splashHint');
    if (hint) hint.classList.remove('hidden');
    const act = document.getElementById('splashActions');
    if (act) act.classList.add('hidden');
    if (!splashBuilt) buildSplashScene();
    Narrator.stop();
  }

  function splashLeave() {
    /* narasi berhenti otomatis lewat Nav.go; musik tetap berjalan.
       Batalkan timer narasi sambutan agar tidak menyusul dan berbunyi
       di halaman lain (bug: "halo peneliti muda" muncul di halaman lain). */
    if (sambutanTimer) { clearTimeout(sambutanTimer); sambutanTimer = null; }
    splashArmed = false;
  }

  function buildSplashScene() {
    splashBuilt = true;
    const s = SceneMgr.mount('p00', (s) => {
      const scene = s.scene, cam = s.camera;
      scene.background = null;

      /* bintang */
      addStars(scene, 700, 2200);

      /* Matahari bersinar (masuk dalam bingkai, di kanan atas) */
      const sunMesh = makeSun(58);
      sunMesh.position.set(400, 180, -260);
      scene.add(sunMesh);
      const sunGlow = makeGlow(300, 0xffd76a, 0.95);
      sunGlow.position.set(400, 180, -260);
      scene.add(sunGlow);
      const sunGlow2 = makeGlow(140, 0xfff6d8, 1);
      sunGlow2.position.set(400, 180, -260);
      scene.add(sunGlow2);

      /* Bumi */
      const earthGroup = new THREE.Group();
      const earth = makeEarth(80);
      earthGroup.add(earth);
      earthGroup.position.set(165, -6, 0);
      scene.add(earthGroup);

      /* Bulan mengorbit (radius masuk bingkai) */
      const moonOrbit = new THREE.Group();
      const moon = makeMoon(26);
      moon.position.set(142, 0, 0);
      moonOrbit.add(moon);
      earthGroup.add(moonOrbit);

      /* atmosfer tipis */
      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(84, 48, 32),
        new THREE.MeshBasicMaterial({ color: 0x2e9fdf, transparent: true, opacity: 0.10, side: THREE.BackSide })
      );
      earthGroup.add(atmo);

      labLights(scene, { ambient: 0.75, sun: 1.5, sx: 1000, sy: 200, sz: 300 });

      cam.position.set(0, 40, 620);
      cam.lookAt(140, 0, 0);

      let t = 0;
      s.tick = (dt) => {
        t += dt;
        earth.rotation.y += dt * 0.22;
        moonOrbit.rotation.z = t * 0.22;
        earthGroup.position.y = -6 + Math.sin(t * 0.5) * 6;
        moon.rotation.y += dt * 0.1;
        sunMesh.rotation.y += dt * 0.04;
      };
    });

    const canvas = document.getElementById('p00Canvas');
    const arm = () => {
      if (splashArmed) return;
      splashArmed = true;
      AudioSys.unlock();
      AudioSys.play('notify');
      const hint = document.getElementById('splashHint');
      if (hint) hint.classList.add('hidden');
      const act = document.getElementById('splashActions');
      if (act) { act.classList.remove('hidden'); act.classList.add('pop-in'); }
      Narrator.speak('p00_sambutan1');
      sambutanTimer = setTimeout(() => {
        sambutanTimer = null;
        /* hanya lanjut bila pengguna masih berada di halaman pembuka */
        if (splashArmed && typeof Nav !== 'undefined' && Nav.current === 'p00') {
          Narrator.speak('p00_sambutan2');
        }
      }, 12800);
    };
    canvas.addEventListener('pointerdown', arm);
    document.getElementById('btnMulai').addEventListener('click', () => {
      AudioSys.unlock();
      Nav.go('p01');
    });
    document.getElementById('btnSplashHelp').addEventListener('click', () => Nav.go('p02'));
  }

  /* ================= BERANDA (p01) ================= */
  function renderHome() {
    /* progres kunjungan */
    const visited = Store.getVisited();
    const dots = document.getElementById('hpDots');
    if (dots) {
      const pages = ['p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09'];
      dots.innerHTML = '';
      pages.forEach(p => {
        const d = document.createElement('span');
        d.className = 'hp-dot' + (visited.includes(p) ? ' on' : '');
        dots.appendChild(d);
      });
    }
    const best = Store.getBest();
    const sc = document.getElementById('hpScore');
    if (sc) sc.textContent = best != null ? `SKOR TERBAIK: ${best}%` : 'BELUM ADA SKOR EVALUASI';
  }

  /* ================= PETUNJUK (p02) ================= */
  const HINTS = [
    {
      icon: 'globe', title: 'Menjelajah Laboratorium', desc: 'Berpindah antar-ruang lewat panel kiri.',
      steps: [
        'Tekan tombol di <b>panel kiri</b> (Beranda, Galeri Tata Surya, Lab Rotasi, dan seterusnya) untuk berpindah ruang.',
        'Tombol <b>logo</b> di pojok kiri atas selalu membawamu kembali ke <b>Beranda</b>.',
        'Tanda hijau pada ikon menu menunjukkan ruang yang <b>sudah kamu kunjungi</b>.',
        'Bintang kecil di Beranda menunjukkan <b>progres kunjunganmu</b>.'
      ]
    },
    {
      icon: 'narasi', title: 'Narasi & Suara', desc: 'Setiap ruang menjelaskan dirinya dengan suara.',
      steps: [
        'Saat masuk sebuah ruang, <b>narasi</b> akan menjelaskan isi ruang itu secara otomatis (sekali per sesi).',
        'Buka <b>pengaturan suara</b> (ikon pengeras suara di pojok kanan atas) untuk mengatur volume musik, efek, dan narasi.',
        'Naikkan volume <b>narasi</b> di pengaturan suara bila ingin penjelasan terdengar lebih keras.',
        'Musik latar mulai berbunyi setelah kamu mengeklik <b>Bumi di halaman pembuka</b>.'
      ]
    },
    {
      icon: 'planet', title: 'Galeri Tata Surya', desc: 'Mengamati Matahari, Bumi, Bulan, dan planet.',
      steps: [
        'Klik <b>benda langit</b> pada layar atau pada daftar objek untuk melihat informasinya.',
        '<b>Seret</b> layar untuk memutar pandangan; <b>roda tetikus</b> atau <b>cubitan dua jari</b> untuk zoom.',
        'Aktifkan <b>Mode Perbandingan</b> untuk membandingkan ukuran Matahari, Bumi, dan Bulan.',
        'Amati <b>kedudukan Matahari, Bumi, dan Bulan</b> dalam sistem tata surya.'
      ]
    },
    {
      icon: 'rotate', title: 'Lab 01 — Rotasi Bumi', desc: 'Melihat perputaran Bumi dan siang-malam.',
      steps: [
        'Tekan <b>Putar</b> untuk memulai rotasi Bumi; <b>Jeda</b> untuk menghentikannya.',
        'Geser <b>Kecepatan</b> untuk mempercepat atau memperlambat putaran.',
        'Perhatikan <b>pin Jakarta</b>: status SIANG/MALAM dan posisi Matahari di langit ikut berubah.',
        'Aktifkan <b>garis sumbu</b> dan <b>panah arah</b> untuk melihat arah rotasi berlawanan jarum jam.'
      ]
    },
    {
      icon: 'orbit', title: 'Lab 02 — Revolusi Bumi', desc: 'Mengelilingi Matahari di orbit elips.',
      steps: [
        'Tekan <b>Putar</b> atau geser <b>posisi Bumi</b> pada orbit sepanjang tahun.',
        'Klik <b>chip bulan</b> untuk melompat ke bulan tertentu.',
        'Amati <b>perihelion</b> (Januari, terdekat) dan <b>aphelion</b> (Juli, terjauh).',
        'Baca panel info yang <b>berubah mengikuti posisi Bumi</b>.'
      ]
    },
    {
      icon: 'clock', title: 'Lab 03 — Zona Waktu', desc: 'Rotasi Bumi membagi waktu di Bumi.',
      steps: [
        'Pilih <b>kota</b> pada bola Bumi, peta Indonesia, atau deretan jam.',
        '<b>Jam digital</b> kota terpilih dan pembandingnya ikut berubah.',
        'Geser <b>waktu simulasi</b> lalu bandingkan WIB, WITA, dan WIT.',
        'Perhatikan garis bujur setiap <b>15°</b> = perbedaan <b>1 jam</b>.'
      ]
    },
    {
      icon: 'season', title: 'Lab 04 — Pergantian Musim', desc: 'Revolusi + sumbu miring = musim.',
      steps: [
        'Pilih <b>bulan pengamatan</b> (Desember, Maret, Juni, September, atau lainnya).',
        'Lihat <b>musim di belahan Bumi Utara dan Selatan</b> serta panjang siangnya.',
        'Amati <b>meter penerimaan sinar</b> kedua belahan Bumi.',
        'Ingat: musim terjadi karena <b>kemiringan sumbu Bumi</b>, bukan jarak ke Matahari!'
      ]
    },
    {
      icon: 'flask', title: 'Ruang Eksperimen Virtual', desc: 'Lima percobaan untuk kamu jalankan sendiri.',
      steps: [
        'Pilih satu dari <b>5 kartu percobaan</b>: model Matahari-Bumi-Bulan, siang-malam, jam Matahari, fase Bulan, dan pergantian musim.',
        'Baca <b>tujuan</b> dan <b>petunjuk</b> percobaan, lalu jalankan kontrolnya.',
        '<b>Ubah variabel</b> (posisi, arah, kecepatan) dan amati hasilnya pada panel pengamatan.',
        'Buka <b>kesimpulan</b> setelah selesai mengamati.'
      ]
    },
    {
      icon: 'quiz', title: 'Evaluasi Pemahaman', desc: 'Soal bervariasi dengan umpan balik langsung.',
      steps: [
        'Tekan <b>Mulai Evaluasi</b> lalu jawab soal pilihan ganda, benar-salah, menjodohkan, melengkapi pernyataan, dan memilih bagian gambar.',
        'Setiap jawaban mendapat <b>umpan balik</b> dan pembahasan singkat.',
        'Di akhir kamu mendapat <b>skor, bintang</b>, dan <b>pembahasan lengkap</b>.',
        'Tekan <b>Ulangi Evaluasi</b> untuk mencoba lagi dan memperbaiki skor.'
      ]
    },
    {
      icon: 'journal', title: 'Refleksi & Informasi', desc: 'Catat pemahamanmu dan lihat sumber materi.',
      steps: [
        'Isi <b>Refleksi</b> di akhir sesi: hal yang dipahami, yang membingungkan, dan perasaanmu.',
        'Buka <b>Kredit & Referensi</b> untuk melihat sumber materi buku IPAS.',
        'Halaman <b>Pengembang</b> memuat profil penyusun media.',
        'Gunakan tombol <b>layar penuh</b> untuk proyektor atau Interactive Flat Panel.'
      ]
    }
  ];

  function renderHints() {
    const grid = document.getElementById('hintGrid');
    if (!grid) return;
    grid.innerHTML = '';
    HINTS.forEach((h, i) => {
      const b = document.createElement('button');
      b.className = 'hint-card rise rise-' + ((i % 4) + 1);
      b.innerHTML = `
        <span class="hc-icon">${iconSVG(h.icon)}</span>
        <span class="hc-title">${h.title}</span>
        <span class="hc-desc">${h.desc}</span>`;
      b.addEventListener('click', () => showHintModal(h));
      grid.appendChild(b);
    });
  }

  function showHintModal(h) {
    App.modal({
      title: h.title.toUpperCase(),
      body: `<ul class="step-list">${h.steps.map((st, i) =>
        `<li><span class="step-num">${i + 1}</span><span>${st}</span></li>`).join('')}</ul>`,
      actions: [{ label: 'Mengerti', cls: 'cyan', icon: 'check', onClick: c => c() }]
    });
  }

  /* ================= REFLEKSI (p10) ================= */
  const FEELS = [
    { k: 'senang', emoji: '😄', label: 'Senang' },
    { k: 'kagum', emoji: '🤩', label: 'Kagum' },
    { k: 'penasaran', emoji: '🤔', label: 'Penasaran' },
    { k: 'bingung', emoji: '😕', label: 'Bingung' },
    { k: 'bangga', emoji: '😎', label: 'Bangga' }
  ];
  let feelPick = null;

  function buildReflection() {
    const grid = document.getElementById('feelGrid');
    if (grid && !grid.dataset.built) {
      grid.dataset.built = '1';
      FEELS.forEach(f => {
        const b = document.createElement('button');
        b.className = 'feelopt';
        b.innerHTML = `<span class="fe-emoji">${f.emoji}</span><span>${f.label}</span>`;
        b.addEventListener('click', () => {
          feelPick = f.k;
          grid.querySelectorAll('.feelopt').forEach(x => x.classList.remove('on'));
          b.classList.add('on');
          AudioSys.play('pop');
        });
        grid.appendChild(b);
      });
      document.getElementById('btnReflSave').addEventListener('click', saveReflection);
    }
  }

  function enterReflection() {
    buildReflection();
  }

  function saveReflection() {
    const q = [1, 2, 3, 4, 5].map(i => (document.getElementById('reflQ' + i)?.value || '').trim());
    const note = (document.getElementById('reflNote')?.value || '').trim();
    const empty = q.filter(x => !x).length + (!note ? 1 : 0);
    if (empty >= 6) {
      App.toast('Isi dulu minimal satu jawaban atau catatanmu, ya!', 'warn');
      AudioSys.play('wrong');
      return;
    }
    Store.saveReflection({ t: Date.now(), q, feel: feelPick, note });
    AudioSys.play('save');
    App.toast('Refleksi tersimpan. Terima kasih, Peneliti Muda!', 'ok');
  }

  /* Refleksi dikosongkan setiap aplikasi dibuka (jurnal per sesi). */
  function clearReflectionOnBoot() {
    try { localStorage.removeItem(Store.KEYS.reflection); } catch (e) { /* aman */ }
  }
  clearReflectionOnBoot();

  return {
    init() { /* splash dibangun saat pertama masuk halaman p00 */ },
    splashReset, splashLeave, renderHome, renderHints,
    enterReflection, saveReflection
  };
})();
