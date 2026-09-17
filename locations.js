/* ============================================================
   ORCA — Our Locations page
   Nav + language switch (same pattern as the other secondary pages)
   plus an interactive Leaflet map with four branded markers whose
   popups stay in sync with the current language.
   ============================================================ */
(function(){
  "use strict";

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- LOCATION DATA ----------------
     Head office coordinate confirmed directly from Google Maps by the client;
     port coordinates sourced from public port-authority/reference data. */
  var LOCATIONS = [
    { lat: 30.018210439162882, lng: 31.464246225717318, nameKey: 'loc_hq_name',       descKey: 'loc_hq_desc' },
    { lat: 31.2000, lng: 29.8800, nameKey: 'loc_alex_name',     descKey: 'loc_alex_desc' },
    { lat: 31.4670, lng: 31.7680, nameKey: 'loc_damietta_name', descKey: 'loc_damietta_desc' },
    { lat: 29.6480, lng: 32.3560, nameKey: 'loc_sokhna_name',   descKey: 'loc_sokhna_desc' }
  ];

  var mapMarkers = []; // {marker, data}

  function popupHTML(loc){
    var dict = (window.ORCA_I18N && window.ORCA_I18N[currentLang]) || {};
    var name = dict[loc.nameKey] || loc.nameKey;
    var desc = dict[loc.descKey] || '';
    return '<div class="loc-popup"><strong>' + name + '</strong><p>' + desc + '</p></div>';
  }

  function refreshPopups(){
    mapMarkers.forEach(function(entry){
      entry.marker.setPopupContent(popupHTML(entry.data));
    });
  }

  function initMap(){
    var el = document.getElementById('orcaMap');
    if(!el || !window.L) return;

    var map = L.map('orcaMap', {
      scrollWheelZoom: false,
      center: [30.6, 31.6],
      zoom: 6
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    // Re-enable scroll-zoom only once the user has clicked into the map,
    // so an ordinary page scroll doesn't get hijacked by the map underneath.
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
      mapMarkers.push({ marker: marker, data: loc });
      bounds.push([loc.lat, loc.lng]);
    });

    if(bounds.length){
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
    }
  }

  /* ---------------- LANGUAGE ENGINE (EN / AR / ZH) ---------------- */
  var LANG_KEY = 'orca_lang';
  function getSavedLang(){
    try{ return localStorage.getItem(LANG_KEY); } catch(e){ return null; }
  }
  function saveLang(lang){
    try{ localStorage.setItem(LANG_KEY, lang); } catch(e){}
  }
  var currentLang = 'en';

  function applyLanguage(lang){
    if(!window.ORCA_I18N[lang]) return;
    currentLang = lang;
    saveLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    var dict = window.ORCA_I18N[lang];
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if(dict[key] !== undefined){
        if(key === 'footer_address'){ el.innerHTML = dict[key]; }
        else { el.textContent = dict[key]; }
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
      var key = el.getAttribute('data-i18n-placeholder');
      if(dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
    });
    document.querySelectorAll('.lang-btn').forEach(function(btn){
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });

    refreshPopups();
  }

  document.querySelectorAll('.lang-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      applyLanguage(btn.dataset.lang);
      if(typeof navLinks !== 'undefined' && navLinks.classList.contains('open')) closeMobileNav();
    });
  });

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

  applyLanguage(getSavedLang() || 'en');
  initMap();

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
