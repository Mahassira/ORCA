/* ============================================================
   ORCA — Our Locations page
   Nav + language switch (same pattern as the other secondary pages)
   plus an interactive Leaflet map. Location data lives in one place
   (LOCATIONS below) so adding a location later means adding one
   object here — the map, the KPI counts, and the info panel are
   all derived from this same array, nothing is hard-coded twice.

   Every name/description shown comes from the existing i18n
   dictionary (i18n.js) — this file does not introduce any new
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
  var LOCATIONS = [
    { id:'hq',       nameKey:'loc_hq_name',       descKey:'loc_hq_desc',       country:'Egypt', type:'hq',   lat:30.018210439162882, lng:31.464246225717318 },
    { id:'alex',     nameKey:'loc_alex_name',     descKey:'loc_alex_desc',     country:'Egypt', type:'port', lat:31.2000, lng:29.8800 },
    { id:'damietta', nameKey:'loc_damietta_name', descKey:'loc_damietta_desc', country:'Egypt', type:'port', lat:31.4670, lng:31.7680 },
    { id:'sokhna',   nameKey:'loc_sokhna_name',   descKey:'loc_sokhna_desc',   country:'Egypt', type:'port', lat:29.6480, lng:32.3560 }
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
    if(selectedLocation) renderInfoPanel(selectedLocation);
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

  /* ---------------- Info panel ---------------- */
  var selectedLocation = null;

  function renderInfoPanel(loc){
    var panel = document.getElementById('locInfoPanel');
    if(!panel) return;
    selectedLocation = loc;
    var d = dict();
    var idx = LOCATIONS.indexOf(loc) + 1;
    var typeLabel = loc.type === 'hq' ? (d.loc_kpi_hq || 'Head Office') : (d.loc_kpi_ports || 'Port');
    document.getElementById('locInfoN').textContent = String(idx).padStart(2, '0');
    document.getElementById('locInfoName').textContent = d[loc.nameKey] || loc.nameKey;
    document.getElementById('locInfoType').textContent = typeLabel;
    document.getElementById('locInfoDesc').textContent = d[loc.descKey] || '';
    panel.hidden = false;
  }

  function popupHTML(loc){
    var d = dict();
    var name = d[loc.nameKey] || loc.nameKey;
    var desc = d[loc.descKey] || '';
    return '<div class="loc-popup"><strong>' + name + '</strong><p>' + desc + '</p></div>';
  }

  function refreshMapPopups(){
    mapMarkers.forEach(function(entry){
      entry.marker.setPopupContent(popupHTML(entry.data));
    });
  }

  /* ---------------- Map (lazy-initialized when scrolled into view) ---------------- */
  function initMap(){
    if(map) return;
    var el = document.getElementById('orcaMap');
    if(!el || !window.L) return;

    map = L.map('orcaMap', {
      scrollWheelZoom: false,
      center: [30.6, 31.6],
      zoom: 6
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    // Scroll-zoom only turns on after the user clicks in, so an ordinary
    // page scroll doesn't get captured by the map underneath — important
    // on mobile especially.
    map.on('click', function(){ map.scrollWheelZoom.enable(); });

    var bounds = [];
    LOCATIONS.forEach(function(loc){
      var marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 9,
        weight: 2,
        color: '#7BB3A4',
        fillColor: '#3E7F72',
        fillOpacity: 0.9
      }).addTo(map);
      marker.bindPopup(popupHTML(loc));
      marker.on('click', function(){ renderInfoPanel(loc); });
      // Desktop hover preview; harmless no-op on touch devices, which use
      // the click/tap handler above instead.
      marker.on('mouseover', function(){ marker.openPopup(); });
      mapMarkers.push({ marker: marker, data: loc });
      bounds.push([loc.lat, loc.lng]);
    });

    if(bounds.length){
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
    }
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
