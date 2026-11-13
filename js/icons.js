/* ============================================================
   LABORATORIUM MAYA IPAS — icons.js
   Pustaka ikon SVG garis (24x24) untuk seluruh antarmuka.
   ============================================================ */
'use strict';

const ICON_PATHS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M10 20v-5.5h4V20"/>',
  planet: '<circle cx="12" cy="12" r="5.5"/><path d="M19 4.5c1.8 2.3-.4 4.2-4.5 6.9-4.7 3.1-9.6 5.7-11.3 3.5"/><path d="M15.5 4.6c2.6-.7 5 .1 5.5 1.7.6 2.2-2.6 5.6-8 8.5s-9.9 3.7-11 1.9"/>',
  rotate: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3"/><path d="M12 8.2c1.5 1 2.6 2.3 2.6 3.8 0 1.5-1.1 2.8-2.6 3.8-1.5-1-2.6-2.3-2.6-3.8 0-1.5 1.1-2.8 2.6-3.8Z" fill="currentColor" stroke="none"/>',
  orbit: '<circle cx="5" cy="12" r="2.6"/><circle cx="12" cy="12" r="7" opacity=".55"/><path d="M12 5c4.4-2.6 8.4-2.2 8.9.7.5 3.4-3.9 7.9-9.8 10.2-4.6 1.8-8.6 1.6-9.1-.7"/><circle cx="17.6" cy="6.6" r="1.9" fill="currentColor" stroke="none"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.4 2"/>',
  season: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5c-2 2.5-2 5.5 0 8.5s2 6 0 8.5"/><path d="M5.5 8.5c3.2.8 6.3.5 8.5-1.5M18.5 8.5c-3.2.8-6.3.5-8.5 1.5M5.5 15.5c3.2-.8 6.3-.5 8.5 1.5M18.5 15.5c-3.2-.8-6.3-.5-8.5-1.5"/>',
  flask: '<path d="M9.5 3h5M10 3v6.2L4.8 18.4c-.8 1.5.3 3.1 2 3.1h10.4c1.7 0 2.8-1.6 2-3.1L14 9.2V3"/><path d="M7.5 14.5h9"/><circle cx="10.5" cy="18" r=".9" fill="currentColor" stroke="none"/><circle cx="13.8" cy="18.8" r=".7" fill="currentColor" stroke="none"/>',
  quiz: '<rect x="5.5" y="4.5" width="13" height="16.5" rx="2.2"/><rect x="9" y="2.5" width="6" height="4" rx="1.2"/><path d="M9 10.5h6M9 14h6M9 17.5h3.5"/><path d="M15.5 16.2l1.7 1.7 3-3.4"/>',
  journal: '<path d="M6 3.5h11.5A1.5 1.5 0 0 1 19 5v15.5H7A2.5 2.5 0 0 1 4.5 18V5A1.5 1.5 0 0 1 6 3.5Z"/><path d="M19 17.5H7a2.5 2.5 0 0 0 0 5h12"/><path d="M9 8h6M9 11h6"/>',
  help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.4 9.4a2.7 2.7 0 1 1 3.7 2.5c-.8.3-1.1.9-1.1 1.7v.4"/><circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/><path d="M8 7.5h8M8 10.5h5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.2-3.4 4-5 7.5-5s6.3 1.6 7.5 5"/>',
  speaker: '<path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.8a7.6 7.6 0 0 1 0 10.4"/>',
  mute: '<path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  narasi: '<path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6.2a8.4 8.4 0 0 1 0 11.6"/><path d="M15.5 12h4" stroke-dasharray="1.5 2.2"/>',
  ulangnarasi: '<path d="M4 6.2a2.2 2.2 0 0 1 2.2-2.2h11.6A2.2 2.2 0 0 1 20 6.2v6.6a2.2 2.2 0 0 1-2.2 2.2h-5.8L7.5 18.6v-3.6H6.2A2.2 2.2 0 0 1 4 12.8Z"/><path d="M8.98 10.67a3.2 3.2 0 1 0 .76-3.33L8.09 8.89"/><path d="M8.09 6.75v2.14h2.13"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  shrink: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  play: '<path d="M7 4.5v15l12-7.5-12-7.5Z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/>',
  reset: '<path d="M4.5 10a8 8 0 1 1 1.7 6.5"/><path d="M4.5 4.5V10H10"/>',
  axis: '<path d="M12 3v18"/><path d="M12 3l-2.5 3h5L12 3Z" fill="currentColor" stroke="none"/><path d="M12 21l-2.5-3h5L12 21Z" fill="currentColor" stroke="none"/><path d="M8 8.5c2.6 1.6 5.4 1.6 8 0M8 15.5c2.6-1.6 5.4-1.6 8 0" opacity=".6"/>',
  arrowccw: '<path d="M12 5.5c5 0 8.5 2.9 8.5 6.5s-3.5 6.5-8.5 6.5c-3.2 0-6-1.3-7.5-3.2"/><path d="M4 8.5 4.6 15l5-3.2"/><path d="M7 8a5.5 5.5 0 0 1 8.2-1.4"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none"/>',
  check: '<path d="M4.5 12.5 10 18 19.5 6.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"/>',
  trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 5.5H4a3 3 0 0 0 3 4.5M17 5.5h3a3 3 0 0 1-3 4.5"/><path d="M12 14v3.5M8.5 20.5h7M10 17.5h4"/>',
  chevR: '<path d="M9 5.5 15.5 12 9 18.5"/>',
  chevL: '<path d="M15 5.5 8.5 12 15 18.5"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5 5l1.9 1.9M17.1 17.1 19 19M19 5l-1.9 1.9M6.9 17.1 5 19"/>',
  moon: '<path d="M20 13.2A8.2 8.2 0 0 1 10.8 4 8.5 8.5 0 1 0 20 13.2Z"/><circle cx="14.2" cy="15.8" r=".8" fill="currentColor" stroke="none"/><circle cx="11" cy="18.5" r=".6" fill="currentColor" stroke="none"/>',
  pin: '<path d="M12 21s-6.5-5.4-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.6 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.4"/>',
  telescope: '<path d="M3.5 13.5 18 6l1.8 3.8L5.3 17.3l-1.8-3.8Z"/><path d="M9 15.5 7.5 20.5M15 12.8 16.5 20.5M11 20.5h7"/><circle cx="7" cy="7" r="1" opacity=".5"/><circle cx="20" cy="3.5" r="1.2" opacity=".7"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10.5h16M8 3.5v4M16 3.5v4"/><path d="M8 14h3M8 17h3M14 14h2.5M14 17h2.5"/>',
  bulb: '<path d="M9.5 17.5c-.2-1.6-.9-2.5-1.8-3.4A5.7 5.7 0 0 1 6 10a6 6 0 0 1 12 0c0 1.6-.6 3-1.7 4.1-.9.9-1.6 1.8-1.8 3.4h-5Z"/><path d="M9.8 20.5h4.4M10.8 17.5h2.4"/>',
  warn: '<path d="M12 3.8 21.3 20H2.7L12 3.8Z"/><path d="M12 10v4.5"/><circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  drag: '<path d="M9 6.5h6M9 10.5h6M9 14.5h6M9 18.5h6" opacity="0"/><circle cx="8" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="17" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="1" fill="currentColor" stroke="none"/>',
  gauge: '<path d="M4 14a8 8 0 0 1 16 0"/><path d="M12 14 15.5 9"/><circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none"/><path d="M4 18h16" opacity=".5"/>',
  layers: '<path d="M12 3.5 21 8l-9 4.5L3 8l9-4.5Z"/><path d="m3 12 9 4.5L21 12"/><path d="m3 16 9 4.5L21 16"/>',
  swap: '<path d="M7 4.5v13M7 4.5 4 7.5M7 4.5 10 7.5"/><path d="M17 19.5v-13M17 19.5 14 16.5M17 19.5 20 16.5"/>',
  snow: '<path d="M12 2.5v19M4 7l16 10M20 7 4 17"/><path d="M9 4.5 12 7l3-2.5M9 19.5 12 17l3 2.5"/>',
  flower: '<circle cx="12" cy="12" r="2"/><path d="M12 10c-1.5-2.2-.6-5 1-5s2.5 2.8 1 5M14 12c2.2-1.5 5-.6 5 1s-2.8 2.5-5 1M12 14c1.5 2.2.6 5-1 5s-2.5-2.8-1-5M10 12c-2.2 1.5-5 .6-5-1s2.8-2.5 5-1"/>',
  leaf: '<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15Z"/><path d="M5 19c3-6 7-9 11-11"/>',
  therm: '<path d="M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0V4Z"/><circle cx="12" cy="17" r="1.8" fill="currentColor" stroke="none"/>',
  save: '<path d="M5 3.5h11L20.5 8v11a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5Z"/><path d="M8 3.5V9h7V3.5M8 20v-6h8v6"/>',
  compare: '<path d="M4 20V10M9.5 20V4M15 20v-9M20.5 20V7"/><path d="M2.5 20h19" opacity=".5"/>',
  senter: '<path d="M4 9h5l11-4.5v15L9 15H4V9Z"/><path d="M9 9v6"/><path d="M15.5 9.5a3.4 3.4 0 0 1 0 5" opacity=".6"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17"/>',
  satelit: '<path d="M9.5 3.5 6 7l3.5 3.5L13 7 9.5 3.5Z"/><path d="M13.5 11 17 14.5 20.5 11 17 7.5 13.5 11Z" opacity=".7"/><path d="m11 13.5-4 4"/><path d="M3 16.5c1.5 1.5 3.5 2.2 5.5 2M3.5 20.5c2.3.3 4.6-.3 6.5-1.6" opacity=".7"/>',
  sunrise: '<path d="M3 18h18M5.5 18a6.5 6.5 0 0 1 13 0"/><path d="M12 4v3.5M6.5 6.5 8.5 8.5M17.5 6.5 15.5 8.5M2.5 13.5h3M18.5 13.5h3"/>',
  sunset: '<path d="M3 18h18M5.5 18a6.5 6.5 0 0 1 13 0"/><path d="M12 8v3.5M6.5 6.5 8.5 8.5M17.5 6.5 15.5 8.5M2.5 13.5h3M18.5 13.5h3"/><path d="M9.5 3.5h5" opacity=".7"/>',
  yt: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9v6l5.5-3L10 9Z" fill="currentColor" stroke="none"/>',
  tt: '<path d="M9.5 8.5v9a2.5 2.5 0 1 0 2.5-2.5"/><path d="M9.5 8.5c0-3 1.8-5 4.5-5.5v3c-1.2.3-2 .9-2.2 2M14 6.5c1.4.4 2.4 1 3 2"/>',
  ig: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none"/>',
  zoomin: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8M10.5 7.5v6M7.5 10.5h6"/>',
  stopwatch: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4M10 2.5h4M12 2.5v3.5"/><path d="M17.5 6.5l1.5-1.5" opacity=".7"/>',
  meterW: '<path d="M4 17a8 8 0 0 1 16 0"/><path d="M12 17 16 9"/><circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none"/><path d="M6 20.5h12" opacity=".5"/>',
};

function iconSVG(name, cls) {
  const p = ICON_PATHS[name] || ICON_PATHS.info;
  return `<svg class="${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}
function mountIcons(root) {
  (root || document).querySelectorAll('[data-icon]').forEach(el => {
    const n = el.getAttribute('data-icon');
    if (n && ICON_PATHS[n]) el.innerHTML = iconSVG(n) + (el.innerHTML || '');
  });
}
