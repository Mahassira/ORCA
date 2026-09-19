/* ============================================================
   ORCA — Services & Logistics page
   Nav + language switch (shared logic with the homepage) plus
   simple, non-scroll-jacking reveal animations for the editorial rows.
   ============================================================ */
(function(){
  "use strict";

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- LANGUAGE ENGINE (EN / AR) ---------------- */
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
  }

  document.querySelectorAll('.lang-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      applyLanguage(btn.dataset.lang);
      if(typeof navLinks !== 'undefined' && navLinks.classList.contains('open')) closeMobileNav();
    });
  });
  var savedLang = getSavedLang();
  applyLanguage((savedLang && window.ORCA_I18N[savedLang]) ? savedLang : 'en');

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

  /* ---------------- SIMPLE SCROLL REVEALS (no pinning, just fade/slide on enter) ---------------- */
  if(!prefersReduced && window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.svc-row').forEach(function(row){
      var media = row.querySelector('.svc-row-media');
      var copy = row.querySelector('.svc-row-copy');
      gsap.fromTo(media, {opacity:0, y:28}, {
        opacity:1, y:0, duration:0.9, ease:'power3.out',
        scrollTrigger:{ trigger: row, start:'top 82%' }
      });
      gsap.fromTo(copy, {opacity:0, y:20}, {
        opacity:1, y:0, duration:0.9, delay:0.12, ease:'power3.out',
        scrollTrigger:{ trigger: row, start:'top 82%' }
      });
    });
  }
})();
