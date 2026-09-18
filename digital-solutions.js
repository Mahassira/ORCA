/* ============================================================
   ORCA — Digital Solutions page
   Nav + language switch (same pattern as the other secondary pages)
   plus simple scroll reveals for the solution cards and capabilities.
   ============================================================ */
(function(){
  "use strict";

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ---------------- SIMPLE SCROLL REVEALS ---------------- */
  if(!prefersReduced && window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.ds-card').forEach(function(el, i){
      gsap.fromTo(el, {opacity:0, y:22}, {
        opacity:1, y:0, duration:0.7, delay:(i%4)*0.08, ease:'power3.out',
        scrollTrigger:{ trigger: el, start:'top 88%' }
      });
    });
    gsap.utils.toArray('.ds-cap').forEach(function(el, i){
      gsap.fromTo(el, {opacity:0, y:16}, {
        opacity:1, y:0, duration:0.6, delay:(i%4)*0.07, ease:'power3.out',
        scrollTrigger:{ trigger: el, start:'top 92%' }
      });
    });
  }
})();
