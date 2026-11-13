/* ============================================================
   LABORATORIUM MAYA IPAS — evaluasi.js
   Evaluasi pemahaman: pilihan ganda, benar/salah, menjodohkan,
   melengkapi pernyataan, memilih bagian gambar, identifikasi
   fenomena dari ilustrasi, dan soal berbasis hasil simulasi.
   Umpan balik langsung + skor + pembahasan + tombol ulangi.
   Seluruh materi soal bersumber dari buku IPAS Kelas VI.
   ============================================================ */
'use strict';

const Evaluasi = (() => {

  /* ---------- ilustrasi kecil untuk soal ---------- */
  const SVG = {
    terbit: `<svg viewBox="0 0 220 110" class="q-img">
      <rect x="0" y="70" width="220" height="40" fill="#0c2440"/>
      <path d="M 8 70 Q 110 30 212 70" fill="none" stroke="#ffe58a" stroke-width="2" stroke-dasharray="4 3"/>
      <circle cx="30" cy="58" r="13" fill="#ffc44d"/>
      <path d="M 30 76 l -6 8 l 12 0 z" fill="#ffc44d"/>
      <circle cx="188" cy="58" r="9" fill="#ff9838" opacity=".9"/>
      <path d="M 188 72 l -5 7 l 10 0 z" fill="#ff9838"/>
      <text x="30" y="98" fill="#ffd27a" font-size="10" font-weight="700">TIMUR</text>
      <text x="170" y="98" fill="#ffb08a" font-size="10" font-weight="700">BARAT</text>
      <text x="110" y="16" fill="#9fd0f5" font-size="10" font-weight="600" text-anchor="middle">Matahari terbit → terbenam, setiap hari</text>
    </svg>`,
    jam: `<svg viewBox="0 0 230 96" class="q-img">
      <rect x="0" y="0" width="110" height="96" rx="8" fill="rgba(45,214,138,.1)" stroke="rgba(45,214,138,.4)"/>
      <rect x="120" y="0" width="110" height="96" rx="8" fill="rgba(183,155,255,.1)" stroke="rgba(183,155,255,.4)"/>
      <text x="55" y="20" fill="#7be3a0" font-size="11" font-weight="700" text-anchor="middle">JAKARTA</text>
      <text x="55" y="58" fill="#eaf2ff" font-size="24" font-weight="800" text-anchor="middle" font-family="Orbitron">09.00</text>
      <text x="55" y="78" fill="#7be3a0" font-size="10" font-weight="700" text-anchor="middle">WIB</text>
      <text x="175" y="20" fill="#c9a8ff" font-size="11" font-weight="700" text-anchor="middle">JAYAPURA</text>
      <text x="175" y="58" fill="#eaf2ff" font-size="24" font-weight="800" text-anchor="middle" font-family="Orbitron">11.00</text>
      <text x="175" y="78" fill="#c9a8ff" font-size="10" font-weight="700" text-anchor="middle">WIT</text>
    </svg>`,
    orbitDekat: `<svg viewBox="0 0 120 110">
      <ellipse cx="62" cy="55" rx="52" ry="34" fill="none" stroke="#37e6ff" stroke-dasharray="4 3" opacity=".6"/>
      <circle cx="40" cy="55" r="17" fill="#ffc44d"/><circle cx="40" cy="55" r="24" fill="#ffc44d" opacity=".25"/>
      <circle cx="104" cy="55" r="7" fill="#1b6fe0" stroke="#7fd4ff"/>
      <path d="M 46 55 L 97 55" stroke="#ffd27a" stroke-dasharray="3 2"/>
    </svg>`,
    orbitJauh: `<svg viewBox="0 0 120 110">
      <ellipse cx="60" cy="55" rx="52" ry="34" fill="none" stroke="#37e6ff" stroke-dasharray="4 3" opacity=".6"/>
      <circle cx="38" cy="55" r="17" fill="#ffc44d"/><circle cx="38" cy="55" r="24" fill="#ffc44d" opacity=".25"/>
      <circle cx="16" cy="55" r="7" fill="#1b6fe0" stroke="#7fd4ff"/>
      <path d="M 44 55 L 24 55" stroke="#ffd27a" stroke-dasharray="3 2"/>
    </svg>`,
    globeUtara: `<svg viewBox="0 0 120 110">
      <circle cx="60" cy="55" r="40" fill="#1b6fe0" stroke="#7fd4ff"/>
      <path d="M 20 55 H 100" stroke="#ffe58a" stroke-width="2"/>
      <path d="M 20 38 H 100 M 20 72 H 100" stroke="#9fd8ff" stroke-width="1" opacity=".5"/>
      <path d="M 60 15 A 40 40 0 0 1 60 95 Z" fill="#ff9838" opacity=".35"/>
      <text x="60" y="10" fill="#ffb08a" font-size="9" font-weight="700" text-anchor="middle">BELAHAN ATAS</text>
    </svg>`,
    globeSelatan: `<svg viewBox="0 0 120 110">
      <circle cx="60" cy="55" r="40" fill="#1b6fe0" stroke="#7fd4ff"/>
      <path d="M 20 55 H 100" stroke="#ffe58a" stroke-width="2"/>
      <path d="M 20 38 H 100 M 20 72 H 100" stroke="#9fd8ff" stroke-width="1" opacity=".5"/>
      <path d="M 60 15 A 40 40 0 0 0 60 95 Z" fill="#37e6ff" opacity=".3"/>
      <text x="60" y="106" fill="#8ff0ff" font-size="9" font-weight="700" text-anchor="middle">BELAHAN BAWAH</text>
    </svg>`,
    faseBaru: `<svg viewBox="0 0 120 110">
      <circle cx="20" cy="55" r="12" fill="#ffc44d"/>
      <circle cx="95" cy="55" r="8" fill="#1b6fe0"/>
      <circle cx="55" cy="55" r="11" fill="#23262e" stroke="#4a5060" stroke-width="1"/>
      <path d="M 33 55 L 43 55" stroke="#ffe58a" stroke-dasharray="3 2"/>
    </svg>`,
    fasePurnama: `<svg viewBox="0 0 120 110">
      <circle cx="20" cy="55" r="12" fill="#ffc44d"/>
      <circle cx="55" cy="55" r="11" fill="#23262e" stroke="#4a5060" stroke-width="1"/>
      <circle cx="95" cy="55" r="8" fill="#1b6fe0"/>
    </svg>`
  };

  /* ---------- bank soal ---------- */
  const SOAL = [
    {
      tipe: 'pg', jenis: 'PILIHAN GANDA', pts: 1,
      q: 'Apa yang dimaksud dengan <b>rotasi Bumi</b>?',
      opts: ['Perputaran Bumi pada poros (sumbunya)',
        'Gerakan Bumi mengelilingi Matahari',
        'Gerakan Bumi mengelilingi Bulan',
        'Perputaran Matahari pada porosnya'],
      benar: 0,
      fb: 'Rotasi adalah perputaran Bumi pada poros atau sumbunya, searah berlawanan dengan arah jarum jam.'
    },
    {
      tipe: 'pg', jenis: 'PILIHAN GANDA', pts: 1,
      q: 'Berapa lama waktu yang dibutuhkan Bumi untuk satu kali rotasi?',
      opts: ['12 jam', '23 jam 56 menit', '365,25 hari', '27 hari 8 jam'],
      benar: 1,
      fb: 'Satu kali rotasi Bumi membutuhkan waktu 23 jam 56 menit — itulah mengapa 1 hari kira-kira 24 jam.'
    },
    {
      tipe: 'pg', jenis: 'PILIHAN GANDA', pts: 1,
      q: 'Arah rotasi Bumi adalah…',
      opts: ['searah dengan jarum jam', 'berlawanan dengan arah jarum jam', 'dari timur ke barat lalu berhenti', 'bergantian setiap bulan'],
      benar: 1,
      fb: 'Bumi berputar berlawanan arah jarum jam (dari barat ke timur) dengan kecepatan yang konstan dan stabil.'
    },
    {
      tipe: 'pg', jenis: 'PILIHAN GANDA', pts: 1,
      q: 'Berapa lama waktu yang dibutuhkan Bumi untuk satu kali <b>revolusi</b>?',
      opts: ['23 jam 56 menit', '27 hari 8 jam', '365,25 hari', '24 jam'],
      benar: 2,
      fb: 'Revolusi Bumi — mengelilingi Matahari pada orbit elips — membutuhkan waktu 365,25 hari (satu tahun).'
    },
    {
      tipe: 'pg', jenis: 'PILIHAN GANDA', pts: 1,
      q: 'Bentuk lintasan orbit Bumi ketika mengelilingi Matahari adalah…',
      opts: ['lingkaran sempurna', 'persegi panjang', 'elips', 'garis lurus'],
      benar: 2,
      fb: 'Orbit Bumi berbentuk elips — karena itu ada titik terdekat (perihelion) dan terjauh (aphelion).'
    },
    {
      tipe: 'pg', jenis: 'PILIHAN GANDA', pts: 1,
      q: 'Mengapa Matahari disebut <b>bintang</b>?',
      opts: ['Karena Matahari sangat besar',
        'Karena Matahari dapat memancarkan cahaya sendiri',
        'Karena Matahari dikelilingi planet',
        'Karena Matahari terlihat dari Bumi'],
      benar: 1,
      fb: 'Matahari adalah bola gas raksasa yang sangat panas sehingga dapat memancarkan cahaya sendiri — itulah ciri bintang. Planet tidak dapat menghasilkan cahaya sendiri.'
    },
    {
      tipe: 'pg', jenis: 'PILIHAN GANDA', pts: 1,
      q: 'Manakah pernyataan yang <b>benar</b> tentang Bulan?',
      opts: ['Bulan adalah planet',
        'Bulan sumber cahaya sendiri',
        'Bulan adalah satu-satunya satelit alami Bumi',
        'Bulan tidak ikut bergerak mengelilingi Matahari'],
      benar: 2,
      fb: 'Bulan adalah satu-satunya satelit alami Bumi. Bulan mengorbit Bumi dan ikut mengelilingi Matahari bersama Bumi.'
    },
    {
      tipe: 'bs', jenis: 'BENAR ATAU SALAH', pts: 4,
      q: 'Tentukan Benar atau Salah pernyataan berikut!',
      items: [
        { s: 'Matahari terbit di timur dan tenggelam di barat — ini membuktikan Matahari bergerak mengelilingi Bumi.', b: false, why: 'Salah. Itu adalah gerak semu harian: seolah-olah Matahari berpindah, padahal Bumi yang berputar.' },
        { s: 'Bumi adalah satu-satunya planet di tata surya yang memiliki kehidupan.', b: true, why: 'Benar. Bumi memiliki air, oksigen, dan suhu yang sesuai untuk mendukung kehidupan.' },
        { s: 'Pergantian musim terjadi karena perubahan jarak Bumi terhadap Matahari.', b: false, why: 'Salah. Pergantian musim terjadi karena revolusi Bumi dan kemiringan sumbu Bumi, bukan karena jarak.' },
        { s: 'Kita di Bumi selalu melihat sisi (bagian) Bulan yang sama.', b: true, why: 'Benar. Durasi rotasi Bulan sama dengan durasi revolusinya, sehingga sisi yang menghadap Bumi selalu sama.' }
      ]
    },
    {
      tipe: 'match', jenis: 'MENJODOHKAN', pts: 5,
      q: 'Jodohkan istilah dengan pengertiannya! Klik istilah di kiri, lalu klik pengertiannya di kanan.',
      pairs: [
        ['Rotasi', 'Perputaran Bumi pada porosnya'],
        ['Revolusi', 'Gerakan Bumi mengelilingi Matahari'],
        ['Satelit alami', 'Bulan, yang mengorbit Bumi'],
        ['Perihelion', 'Titik terdekat Bumi dengan Matahari (Januari)'],
        ['Aphelion', 'Titik terjauh Bumi dari Matahari (Juli)']
      ]
    },
    {
      tipe: 'fill', jenis: 'MELENGKAPI PERNYATAAN', pts: 4,
      q: 'Lengkapi pernyataan berikut! Klik kata di bank kata, lalu klik tempat kosongnya.',
      teks: [
        'Satu kali rotasi Bumi membutuhkan waktu', '①',
        'Satu kali revolusi Bumi membutuhkan waktu', '②',
        'Dalam satu jam, Bumi berputar sejauh', '③',
        'Bulan mengelilingi Bumi selama', '④'
      ],
      bank: ['23 jam 56 menit', '365,25 hari', '15°', '27 hari 8 jam', '24 zona waktu'],
      benar: ['23 jam 56 menit', '365,25 hari', '15°', '27 hari 8 jam'],
      fb: 'Rotasi 23 jam 56 menit; revolusi 365,25 hari; 360° ÷ 24 jam = 15° per jam; Bulan mengelilingi Bumi 27 hari 8 jam.'
    },
    {
      tipe: 'imgpick', jenis: 'MEMILIH BAGIAN GAMBAR', pts: 1,
      q: 'Perhatikan diagram orbit berikut. Klik gambar yang menunjukkan posisi Bumi di titik <b>perihelion</b> (bulan Januari)!',
      opts: [
        { svg: SVG.orbitDekat, label: 'Posisi A', benar: true },
        { svg: SVG.orbitJauh, label: 'Posisi B', benar: false }
      ],
      fb: 'Perihelion adalah titik terdekat Bumi dengan Matahari, terjadi sekitar bulan Januari. Posisi A menunjukkan Bumi paling dekat dengan Matahari.'
    },
    {
      tipe: 'imgpick', jenis: 'MEMILIH BAGIAN GAMBAR', pts: 1,
      q: 'Pada bulan <b>Desember</b>, belahan Bumi mana yang mengalami <b>musim panas</b>? Klik gambarnya!',
      opts: [
        { svg: SVG.globeUtara, label: 'Belahan atas (Utara)', benar: false },
        { svg: SVG.globeSelatan, label: 'Belahan bawah (Selatan)', benar: true }
      ],
      fb: 'Sesuai buku: pada Desember negara-negara di Selatan Bumi mendapat sinar Matahari lebih banyak — musim panas di Belahan Selatan dengan siang lebih panjang.'
    },
    {
      tipe: 'pg', jenis: 'IDENTIFIKASI FENOMENA', pts: 1,
      q: 'Amati ilustrasi berikut!', media: SVG.terbit,
      opts: ['Gerak semu harian Matahari',
        'Gerak revolusi Bumi',
        'Rotasi Bulan pada porosnya',
        'Pergantian musim'],
      benar: 0,
      fb: 'Matahari tampak berpindah dari timur ke barat, padahal Bumi yang berputar — peristiwa ini disebut gerak semu harian Matahari.'
    },
    {
      tipe: 'pg', jenis: 'IDENTIFIKASI FENOMENA', pts: 1,
      q: 'Amati kedua jam berikut!', media: SVG.jam,
      opts: ['Revolusi Bumi mengelilingi Matahari',
        'Rotasi Bumi — daerah di timur lebih dulu disinari Matahari',
        'Kemiringan sumbu Bumi',
        'Bulan mengelilingi Bumi'],
      benar: 1,
      fb: 'Perbedaan waktu terjadi karena rotasi Bumi: setiap 15° bujur berbeda 1 jam. Jayapura di timur lebih dulu disinari Matahari daripada Jakarta.'
    },
    {
      tipe: 'pg', jenis: 'SOAL BERBASIS SIMULASI', pts: 1,
      q: 'Pada Eksperimen 4 (Fase Bulan), kamu meletakkan Bulan <b>di antara Matahari dan Bumi</b>. Bentuk Bulan yang terlihat dari Bumi adalah…',
      opts: ['Bulat sempurna (purnama)',
        'Setengah lingkaran',
        'Tak nampak / Bulan Baru',
        'Bulan sabit besar'],
      benar: 2,
      fb: 'Saat Bulan berada di antara Matahari dan Bumi, sisi terangnya membelakangi kita — Bulan tak nampak (Bulan Baru), walau langit cerah.'
    },
    {
      tipe: 'pg', jenis: 'SOAL BERBASIS SIMULASI', pts: 1,
      q: 'Berdasarkan Laboratorium Zona Waktu: ketika di Denpasar pukul <b>12.00 WITA</b>, pukul berapa di Jakarta?',
      opts: ['10.00 WIB', '11.00 WIB', '12.00 WIB', '13.00 WIB'],
      benar: 1,
      fb: 'WITA (GMT+8) satu jam lebih cepat daripada WIB (GMT+7). Jadi 12.00 WITA = 11.00 WIB.'
    }
  ];

  const TOTAL_PTS = SOAL.reduce((a, s) => a + s.pts, 0);

  let idx = 0, score = 0, answered = false;
  let started = false;

  const root = () => document.getElementById('quizArea');

  /* ================= layar awal ================= */
  function renderStart() {
    started = true;
    root().innerHTML = `
      <div class="panel q-card rise">
        <div class="panel-head">${iconSVG('quiz')} MULAI EVALUASI</div>
        <div class="panel-body" style="text-align:center;padding:22px 26px">
          <div style="font-size:15px;line-height:1.7;color:var(--ink2)">
            Kerjakan <b style="color:var(--ink)">${SOAL.length} soal</b> tentang <b style="color:var(--ink)">rotasi dan revolusi Bumi</b>.<br>
            Jenis soalnya beragam: pilihan ganda, benar/salah, menjodohkan,<br>melengkapi pernyataan, memilih bagian gambar, dan soal simulasi.<br><br>
            Setiap jawabanmu langsung mendapat <b style="color:var(--green)">umpan balik</b>.<br>
            Di akhir, kamu akan melihat <b style="color:var(--cyan)">skor, bintang, dan pembahasan lengkap</b>.
          </div>
          <div style="display:flex;gap:12px;justify-content:center;margin-top:20px">
            <button class="btn big cyan" id="quizStart">${iconSVG('play')}<span>MULAI EVALUASI</span></button>
          </div>
        </div>
      </div>`;
    document.getElementById('quizStart').addEventListener('click', () => {
      AudioSys.play('notify');
      idx = 0; score = 0;
      renderQ();
    });
  }

  /* ================= satu soal ================= */
  function renderQ() {
    answered = false;
    const s = SOAL[idx];
    let body = '';

    if (s.tipe === 'pg') {
      body = `
        <div class="q-text">${s.q}</div>
        ${s.media ? `<div class="q-media">${s.media}</div>` : ''}
        <div class="opt-grid" id="qOpts">
          ${s.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="opt-key">${String.fromCharCode(65 + i)}</span><span>${o}</span></button>`).join('')}
        </div>`;
    } else if (s.tipe === 'bs') {
      body = `<div class="q-text">${s.q}</div>
        <div id="bsWrap">${s.items.map((it, i) => `
          <div style="margin-top:11px;padding:10px 13px;border:1px solid var(--line);border-radius:10px;background:rgba(14,28,56,.6)">
            <div style="font-size:13px;line-height:1.5;color:var(--ink)">${i + 1}. ${it.s}</div>
            <div class="tf-row" data-row="${i}">
              <button class="btn tf-opt green" data-i="${i}" data-v="1">BENAR</button>
              <button class="btn tf-opt red" data-i="${i}" data-v="0">SALAH</button>
            </div>
          </div>`).join('')}
        </div>`;
    } else if (s.tipe === 'match') {
      const kanan = shuffle(s.pairs.map((p, i) => ({ t: p[1], i })));
      body = `<div class="q-text">${s.q}</div>
        <div class="match-grid">
          <div style="display:flex;flex-direction:column;gap:9px" id="mL">
            ${s.pairs.map((p, i) => `<button class="match-item src" data-i="${i}">${p[0]}</button>`).join('')}
          </div>
          <div style="display:flex;flex-direction:column;gap:9px" id="mR">
            ${kanan.map(k => `<button class="match-item dst" data-i="${k.i}">${k.t}</button>`).join('')}
          </div>
        </div>`;
    } else if (s.tipe === 'fill') {
      body = `<div class="q-text">${s.q}</div>
        <div id="fillWrap" style="font-size:14px;line-height:2.15;color:var(--ink)">
          ${s.teks.map(seg => seg.startsWith('①') || seg.startsWith('②') || seg.startsWith('③') || seg.startsWith('④')
            ? `<span class="blank" data-slot="${seg}">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;?</span>`
            : ` ${seg} `).join('.')} .
        </div>
        <div class="wordbank" id="fillBank">
          ${s.bank.map(b => `<button class="wb-chip" data-w="${b}">${b}</button>`).join('')}
        </div>`;
    } else if (s.tipe === 'imgpick') {
      body = `<div class="q-text">${s.q}</div>
        <div class="imgpick" id="qImgs">
          ${s.opts.map((o, i) => `<button class="imgpick-opt" data-i="${i}">${o.svg}<span>${o.label}</span></button>`).join('')}
        </div>`;
    }

    root().innerHTML = `
      <div class="quiz-top">
        <span class="quiz-count">SOAL ${idx + 1} / ${SOAL.length}</span>
        <div class="quiz-prog"><i style="width:${(idx / SOAL.length * 100).toFixed(1)}%"></i></div>
        <span class="quiz-count">${score} poin</span>
      </div>
      <div class="panel q-card rise">
        <div class="panel-head">${iconSVG('target')} ${s.jenis} · ${s.pts} POIN</div>
        <div class="panel-body">${body}<div id="qFb"></div></div>
      </div>
      <div class="quiz-actions">
        <button class="btn ghost" id="qQuit">${iconSVG('home')}<span>KEMBALI KE BERANDA</span></button>
        <button class="btn cyan hidden" id="qNext">${iconSVG('chevR')}<span>LANJUT</span></button>
      </div>`;

    document.getElementById('qQuit').addEventListener('click', () => Nav.go('p01'));
    wire(s);
  }

  function shuffle(a) {
    a = [...a];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ================= interaksi per tipe ================= */
  function wire(s) {
    if (s.tipe === 'pg' || s.tipe === 'imgpick') {
      const wrap = document.getElementById(s.tipe === 'pg' ? 'qOpts' : 'qImgs');
      wrap.querySelectorAll('.opt, .imgpick-opt').forEach(b => {
        b.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          const i = +b.dataset.i;
          const ok = s.tipe === 'pg' ? i === s.benar : s.opts[i].benar;
          if (ok) { score += s.pts; AudioSys.play('correct'); } else AudioSys.play('wrong');
          wrap.querySelectorAll('.opt, .imgpick-opt').forEach(x => {
            const xi = +x.dataset.i;
            const xOk = s.tipe === 'pg' ? xi === s.benar : s.opts[xi].benar;
            x.classList.add(xOk ? 'correct' : (xi === i ? 'wrong' : 'dim'));
            x.disabled = true;
          });
          showFb(ok, s.fb, s.tipe === 'pg' ? s.opts[s.benar] : s.opts.find(o => o.benar).label);
        });
      });
    }

    if (s.tipe === 'bs') {
      const picked = new Array(s.items.length).fill(null);
      document.querySelectorAll('#bsWrap .tf-opt').forEach(b => {
        b.addEventListener('click', () => {
          const i = +b.dataset.i, v = b.dataset.v === '1';
          if (picked[i] != null) return;
          picked[i] = v;
          const row = document.querySelector(`.tf-row[data-row="${i}"]`);
          row.querySelectorAll('.tf-opt').forEach(x => { x.disabled = true; x.style.opacity = .55; });
          b.style.opacity = 1;
          b.classList.add(v ? 'green' : 'red');
          AudioSys.play('pop');
          if (picked.every(p => p != null)) {
            answered = true;
            let benarCount = 0;
            s.items.forEach((it, k) => {
              const ok = picked[k] === it.b;
              if (ok) benarCount++;
            });
            score += benarCount;
            if (benarCount === s.items.length) AudioSys.play('correct');
            else AudioSys.play('wrong');
            showFb(benarCount === s.items.length,
              s.items.map((it, k) => `${picked[k] === it.b ? '✓' : '✗'} Pernyataan ${k + 1}: ${it.why}`).join('<br><br>'),
              `${benarCount} dari ${s.items.length} benar`);
          }
        });
      });
    }

    if (s.tipe === 'match') {
      let pickedSrc = null;
      const pairs = {};
      document.querySelectorAll('#mL .src').forEach(b => {
        b.addEventListener('click', () => {
          if (answered) return;
          const i = +b.dataset.i;
          if (pairs[i] != null) return;
          document.querySelectorAll('#mL .src').forEach(x => x.classList.remove('on'));
          pickedSrc = i;
          b.classList.add('on');
        });
      });
      document.querySelectorAll('#mR .dst').forEach(b => {
        b.addEventListener('click', () => {
          if (answered || pickedSrc == null) return;
          const i = +b.dataset.i;
          if (pairs[i] != null) return;
          pairs[i] = pickedSrc;
          const srcEl = document.querySelector(`#mL .src[data-i="${pickedSrc}"]`);
          srcEl.classList.remove('on');
          srcEl.classList.add('paired');
          srcEl.innerHTML += ` <span style="color:#b79bff">→ ${b.textContent}</span>`;
          b.classList.add('paired');
          b.innerHTML += ` <span style="color:#5ff0ff">(dari ${SOAL[idx].pairs[pickedSrc][0]})</span>`;
          AudioSys.play('pop');
          if (Object.keys(pairs).length === s.pairs.length) {
            answered = true;
            let benarCount = 0;
            s.pairs.forEach((p, k) => { if (pairs[k] === k) benarCount++; });
            score += benarCount;
            if (benarCount === s.pairs.length) AudioSys.play('correct'); else AudioSys.play('wrong');
            document.querySelectorAll('#mR .dst').forEach(x => {
              const xi = +x.dataset.i;
              x.classList.add(pairs[xi] === xi ? 'ok' : 'bad');
            });
            showFb(benarCount === s.pairs.length,
              'Pasangan benar: ' + s.pairs.map(p => `<b>${p[0]}</b> = ${p[1]}`).join(' · '),
              `${benarCount} dari ${s.pairs.length} pasangan benar`);
          }
        });
      });
    }

    if (s.tipe === 'fill') {
      const slots = document.querySelectorAll('#fillWrap .blank');
      const bank = document.getElementById('fillBank');
      const isi = new Array(4).fill(null);
      bank.querySelectorAll('.wb-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          if (answered || chip.classList.contains('used')) return;
          const slotIdx = isi.findIndex(x => x == null);
          if (slotIdx < 0) return;
          isi[slotIdx] = chip.dataset.w;
          chip.classList.add('used');
          const slot = slots[slotIdx];
          slot.textContent = chip.dataset.w;
          slot.classList.add('filled');
          AudioSys.play('pop');
          if (isi.every(x => x != null)) {
            answered = true;
            let benarCount = 0;
            slots.forEach((sl, k) => {
              const ok = isi[k] === s.benar[k];
              if (ok) benarCount++;
              sl.classList.add(ok ? 'correct' : 'wrong');
            });
            score += benarCount;
            if (benarCount === 4) AudioSys.play('correct'); else AudioSys.play('wrong');
            showFb(benarCount === 4, s.fb, `${benarCount} dari 4 benar`);
          }
        });
      });
      slots.forEach((slot, k) => {
        slot.addEventListener('click', () => {
          if (answered || isi[k] == null) return;
          bank.querySelector(`.wb-chip[data-w="${CSS.escape(isi[k])}"]`)?.classList.remove('used');
          isi[k] = null;
          slot.textContent = '     ?';
          slot.classList.remove('filled');
        });
      });
    }
  }

  function showFb(ok, text, ringkas) {
    const fb = document.getElementById('qFb');
    fb.innerHTML = `
      <div class="feedback ${ok ? 'ok' : 'no'}">
        ${iconSVG(ok ? 'check' : 'x')}
        <div><b>${ok ? 'Tepat sekali!' : 'Belum tepat.'}</b> ${ringkas ? `<span style="opacity:.8">(${ringkas})</span><br>` : '<br>'}${text}</div>
      </div>`;
    const next = document.getElementById('qNext');
    next.classList.remove('hidden');
    next.innerHTML = iconSVG('chevR') + `<span>${idx === SOAL.length - 1 ? 'LIHAT HASIL' : 'LANJUT'}</span>`;
    next.focus();
    next.addEventListener('click', () => {
      idx++;
      if (idx >= SOAL.length) renderResult();
      else renderQ();
    }, { once: true });
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ================= hasil ================= */
  function renderResult() {
    const pct = Math.max(0, Math.min(100, Math.round(score / TOTAL_PTS * 100)));
    Store.setBest(pct);
    const stars = pct >= 85 ? 3 : pct >= 60 ? 2 : pct >= 40 ? 1 : 0;
    const msg = stars === 3 ? 'Luar biasa, Peneliti Muda! Pemahamanmu sangat baik.' :
      stars === 2 ? 'Bagus! Sedikit lagi menuju sempurna.' :
        stars === 1 ? 'Lumayan! Ayo pelajari lagi laboratoriumnya.' :
          'Jangan menyerah — ulangi eksplorasi lab lalu coba lagi!';
    if (stars > 0) AudioSys.play('victory'); else AudioSys.play('notify');

    root().innerHTML = `
      <div class="panel q-card rise" style="overflow:auto;max-height:100%">
        <div class="panel-head">${iconSVG('trophy')} HASIL EVALUASI</div>
        <div class="panel-body">
          <div class="result-hero">
            <div class="result-score">${pct}</div>
            <div class="result-stars">
              ${[0, 1, 2].map(i => `<span class="${i < stars ? 'on' : ''}" style="display:inline-block">${iconSVG('star', i < stars ? 'on' : '')}</span>`).join('')}
            </div>
            <div class="result-msg">${score} dari ${TOTAL_PTS} poin — ${msg}</div>
            <div style="display:flex;gap:12px;justify-content:center;margin-top:18px;flex-wrap:wrap">
              <button class="btn cyan" id="resRetry">${iconSVG('reset')}<span>ULANGI EVALUASI</span></button>
              <button class="btn purple" id="resReview">${iconSVG('book')}<span>LIHAT PEMBAHASAN</span></button>
              <button class="btn green" id="resRefl">${iconSVG('journal')}<span>ISI REFLEKSI</span></button>
            </div>
          </div>
          <div id="reviewWrap" class="hidden" style="margin-top:14px">
            <h3 style="font-family:var(--font-head);font-size:12px;letter-spacing:2px;color:var(--cyan);margin:10px 0 2px">PEMBAHASAN LENGKAP</h3>
            ${SOAL.map((s, i) => {
              let ra = '';
              if (s.tipe === 'pg') ra = s.opts[s.benar];
              else if (s.tipe === 'bs') ra = s.items.map((it, k) => `P${k + 1}: ${it.b ? 'Benar' : 'Salah'}`).join(' · ');
              else if (s.tipe === 'match') ra = s.pairs.map(p => `${p[0]} = ${p[1]}`).join(' · ');
              else if (s.tipe === 'fill') ra = s.benar.join(' · ');
              else if (s.tipe === 'imgpick') ra = s.opts.find(o => o.benar).label;
              return `<div class="review-item">
                <div class="rq">${i + 1}. ${stripTags(s.q)}</div>
                <div class="ra">Jawaban benar: <b>${ra}</b>${s.fb ? `<br>${s.fb}` : ''}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;

    document.getElementById('resRetry').addEventListener('click', () => {
      idx = 0; score = 0;
      renderQ();
    });
    document.getElementById('resReview').addEventListener('click', () => {
      document.getElementById('reviewWrap').classList.toggle('hidden');
      AudioSys.play('flip');
    });
    document.getElementById('resRefl').addEventListener('click', () => Nav.go('p10'));
  }

  function stripTags(s) {
    const d = document.createElement('div');
    d.innerHTML = String(s);
    return d.textContent || '';
  }

  /* ================= siklus ================= */
  function enter() {
    if (!started || Nav.current === 'p09') renderStart();
  }
  function leave() { }
  function init() { /* dipicu saat masuk halaman */ }

  return { init, enter, leave };
})();
