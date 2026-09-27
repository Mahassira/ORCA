/* ============================================================
   ORCA — Our Locations page
   Nav + language switch (same pattern as the other secondary pages)
   plus an interactive Leaflet map. Location data lives in one place
   (LOCATIONS below) so adding a location later means adding one
   object here — the map, the KPI counts, and the info panel are
   all derived from this same array, nothing is hard-coded twice.

   Every name/description shown comes from the existing i18n
   dictionary (js/i18n.js) — this file does not introduce any new
   copy of its own. KPI numbers (locations/countries/ports/head
   offices) are computed by counting this array, not typed in by
   hand, so they can never drift out of sync with what the map
   actually shows.
   ============================================================ */
(function(){
  "use strict";

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- LOCATION DATA ----------------
     type: 'hq' | 'port' — used only to compute KPI counts and the
     info-panel's type line, not shown as invented marketing text.
     Head office coordinate confirmed directly from Google Maps by
     the client; port coordinates sourced from public port-authority
     and reference data. */
  // labelDir: which side of the marker the permanent branch label sits on,
  // chosen so neighbouring labels (Alexandria/Damietta, Cairo/Sokhna) never overlap.
  var LOCATIONS = [
    { id:'hq',       nameKey:'loc_hq_name',       descKey:'loc_hq_desc',       country:'Egypt', type:'hq',   lat:30.018210439162882, lng:31.464246225717318, labelDir:'left'  },
    { id:'alex',     nameKey:'loc_alex_name',     descKey:'loc_alex_desc',     country:'Egypt', type:'port', lat:31.2000, lng:29.8800, labelDir:'left'  },
    { id:'damietta', nameKey:'loc_damietta_name', descKey:'loc_damietta_desc', country:'Egypt', type:'port', lat:31.4670, lng:31.7680, labelDir:'right' },
    { id:'sokhna',   nameKey:'loc_sokhna_name',   descKey:'loc_sokhna_desc',   country:'Egypt', type:'port', lat:29.6480, lng:32.3560, labelDir:'right' }
  ];

  /* ---------------- EGYPT-ONLY FRAMING ----------------
     The map is framed on Egypt, and everything outside Egypt is covered by a
     navy mask (same colour as the page), so no neighbouring country is shown.

     EGYPT_OUTLINE is the "window" cut into that mask. Its land edges follow
     Egypt's borders (25°E with Libya, 22°N with Sudan, the Rafah–Taba line
     with Gaza/Israel); its sea edges run through open water (the middle of the
     Red Sea and Gulf of Aqaba, and far out in the Mediterranean), so the real
     coastlines come from the basemap itself and small approximations in the
     sea edges are not visible. */
  var EGYPT_BOUNDS = [[21.8, 24.7], [31.9, 36.95]];
  var EGYPT_OUTLINE = [
    [34.0, 25.15],  // Mediterranean, far offshore (outside the visible frame)
    [31.66, 25.15], // Sallum — Egypt/Libya border at the coast
    [29.5, 25.0],
    [22.0, 25.0],   // Egypt/Libya/Sudan tri-point
    [22.0, 38.0],   // along 22°N out into the Red Sea
    [23.0, 37.3],   // Red Sea median line, northward
    [24.0, 36.75],
    [25.0, 36.05],
    [26.0, 35.35],
    [27.0, 34.85],
    [27.5, 34.7],
    [27.97, 34.49], // Strait of Tiran
    [28.5, 34.64],  // Gulf of Aqaba median line
    [29.0, 34.76],
    [29.49, 34.90], // Taba — Egypt/Israel border at the Gulf
    [30.88, 34.42], // Egypt/Israel border
    [31.23, 34.27], // Kerem Shalom — Egypt/Gaza/Israel
    [31.32, 34.22], // Rafah — border at the Mediterranean coast
    [34.0, 33.6]    // offshore, passing west of the Gaza/Israel/Lebanon coast
  ];

  var mapMarkers = []; // {marker, data}
  var map = null;

  /* ---------------- LANGUAGE ENGINE (EN / AR) ---------------- */
  var LANG_KEY = 'orca_lang';
  function getSavedLang(){
    try{ return localStorage.getItem(LANG_KEY); } catch(e){ return null; }
  }
  function saveLang(lang){
    try{ localStorage.setItem(LANG_KEY, lang); } catch(e){}
  }
  var currentLang = 'en';

  function dict(){ return window.ORCA_I18N[currentLang] || {}; }

  function applyLanguage(lang){
    if(!window.ORCA_I18N[lang]) return;
    currentLang = lang;
    saveLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    var d = window.ORCA_I18N[lang];
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if(d[key] !== undefined){
        if(key === 'footer_address'){ el.innerHTML = d[key]; }
        else { el.textContent = d[key]; }
      }
    });
    document.querySelectorAll('.lang-btn').forEach(function(btn){
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });

    renderKpis();
    refreshMapPopups();
  }

  document.querySelectorAll('.lang-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      applyLanguage(btn.dataset.lang);
      if(typeof navLinks !== 'undefined' && navLinks.classList.contains('open')) closeMobileNav();
    });
  });

  /* ---------------- KPIs (computed from LOCATIONS, not invented) ---------------- */
  function renderKpis(){
    var el = document.getElementById('locKpis');
    if(!el) return;
    var d = dict();
    var countries = {};
    var ports = 0, hqs = 0;
    LOCATIONS.forEach(function(loc){
      countries[loc.country] = true;
      if(loc.type === 'port') ports++;
      if(loc.type === 'hq') hqs++;
    });
    var items = [
      { num: LOCATIONS.length, lbl: d.loc_kpi_locations || 'Locations' },
      { num: Object.keys(countries).length, lbl: d.loc_kpi_countries || 'Countries' },
      { num: ports, lbl: d.loc_kpi_ports || 'Ports' },
      { num: hqs, lbl: d.loc_kpi_hq || 'Head Offices' }
    ];
    el.innerHTML = items.map(function(item){
      return '<div class="loc-kpi"><div class="loc-kpi-num">' + item.num + '</div><div class="loc-kpi-lbl">' + item.lbl + '</div></div>';
    }).join('');
  }

  /* ---------------- Marker popup content ---------------- */

  function popupHTML(loc){
    var d = dict();
    var name = d[loc.nameKey] || loc.nameKey;
    var desc = d[loc.descKey] || '';
    return '<div class="loc-popup"><strong>' + name + '</strong><p>' + desc + '</p></div>';
  }

  function labelText(loc){
    var d = dict();
    return d[loc.nameKey] || loc.nameKey;
  }

  function refreshMapPopups(){
    mapMarkers.forEach(function(entry){
      entry.marker.setPopupContent(popupHTML(entry.data));
      entry.marker.setTooltipContent(labelText(entry.data));
    });
  }

  /* ---------------- Map (lazy-initialized when scrolled into view) ----------------
     The map is intentionally locked: no zoom, no drag/pan, no zoom control
     buttons. Its only interaction is clicking/tapping a marker for details,
     shown in that marker's own popup — nothing else on the map responds to
     input, so there's no zoom/pan gesture to accidentally trigger on mobile. */
  function initMap(){
    if(map) return;
    var el = document.getElementById('orcaMap');
    if(!el || !window.L) return;

    map = L.map('orcaMap', {
      center: [26.9, 30.8],
      zoom: 6,
      zoomSnap: 0.1,          // fractional zoom so Egypt can fill the frame tightly
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      touchZoom: false,
      keyboard: false,
      tap: true
    });

    // Label-free basemap: Esri's Dark Gray Canvas *base* layer contains land,
    // water and borders only. Its city/country names live in a separate
    // "reference" layer, which is deliberately never added here — so the only
    // text on the map is the ORCA branch labels bound to the markers below.
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 16,
      className: 'loc-map-tiles'
    }).addTo(map);

    // Navy mask covering the whole world except Egypt (a polygon with an
    // Egypt-shaped hole). Added before the markers so they sit on top of it,
    // and non-interactive so it never swallows clicks.
    var WORLD = [[-85, -179.9], [-85, 179.9], [85, 179.9], [85, -179.9]];
    L.polygon([WORLD, EGYPT_OUTLINE], {
      stroke: false,
      fillColor: '#0A1B2E',
      fillOpacity: 1,
      interactive: false
    }).addTo(map);

    LOCATIONS.forEach(function(loc){
      var marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 9,
        weight: 2,
        color: '#7BB3A4',
        fillColor: '#3E7F72',
        fillOpacity: 0.9
      }).addTo(map);
      marker.bindPopup(popupHTML(loc));
      // Always-visible branch name — the only place names shown on the map.
      var dir = loc.labelDir === 'left' ? 'left' : 'right';
      marker.bindTooltip(labelText(loc), {
        permanent: true,
        direction: dir,
        offset: [dir === 'left' ? -12 : 12, 0],
        className: 'loc-map-label'
      });
      // Desktop hover preview in addition to the click/tap that opens the
      // popup on every device (bindPopup already wires that up by default).
      marker.on('mouseover', function(){ marker.openPopup(); });
      mapMarkers.push({ marker: marker, data: loc });
    });

    function frameEgypt(){
      map.invalidateSize();
      map.fitBounds(EGYPT_BOUNDS, { padding: [16, 16] });
    }
    frameEgypt();

    // Keep Egypt framed when the viewport changes (window resize, phone rotation).
    var resizeTimer = null;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(frameEgypt, 200);
    });
  }

  var mapSection = document.getElementById('orcaMap');
  if(mapSection && 'IntersectionObserver' in window){
    var mapObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          initMap();
          mapObserver.disconnect();
        }
      });
    }, { rootMargin: '200px' });
    mapObserver.observe(mapSection);
  } else {
    // No IntersectionObserver support — fall back to initializing right away
    // rather than never loading the map at all.
    initMap();
  }

  /* ---------------- NAV ---------------- */
  var nav = document.getElementById('siteNav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function onScrollNav(){
    if(window.scrollY > 40){ nav.classList.add('is-solid'); }
    else{ nav.classList.remove('is-solid'); }
  }
  window.addEventListener('scroll', onScrollNav, {passive:true});
  onScrollNav();

  var lockedScrollY = 0;
  function openMobileNav(){
    lockedScrollY = window.scrollY || window.pageYOffset;
    document.body.style.top = (-lockedScrollY) + 'px';
    document.body.classList.add('nav-open');
    navLinks.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
  }
  function closeMobileNav(){
    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    window.scrollTo(0, lockedScrollY);
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  navToggle.addEventListener('click', function(){
    if(navLinks.classList.contains('open')) closeMobileNav(); else openMobileNav();
  });
  navLinks.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closeMobileNav);
  });

  var savedLang = getSavedLang();
  applyLanguage((savedLang && window.ORCA_I18N[savedLang]) ? savedLang : 'en');

  /* ---------------- SIMPLE SCROLL REVEALS ---------------- */
  if(!prefersReduced && window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.loc-item').forEach(function(el, i){
      gsap.fromTo(el, {opacity:0, y:22}, {
        opacity:1, y:0, duration:0.8, delay:(i%4)*0.08, ease:'power3.out',
        scrollTrigger:{ trigger: el, start:'top 88%' }
      });
    });
  }
})();
