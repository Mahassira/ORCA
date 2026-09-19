/* ============================================================
   ORCA — Contact page
   Nav + language switch (same pattern as the other secondary pages),
   plus the new general-inquiry Contact form submit handler.

   This form is technically separate from the homepage's quotation
   form (#quoteForm in js/main.js): its own fields, its own element
   IDs, its own submit handler below. Nothing here reads from or
   writes to the quote form's state, and nothing in main.js touches
   this one.
   ============================================================ */
(function(){
  "use strict";

  /* ---------------- LANGUAGE ENGINE (EN / AR) ----------------
     Only the surrounding nav/footer chrome is translated here — the
     Contact form's own fields are English-only by design (no Arabic
     copy was supplied for this new form), consistent with how the
     Customer Portal pages were handled elsewhere on this site. */
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

  var savedLang = getSavedLang();
  applyLanguage((savedLang && window.ORCA_I18N[savedLang]) ? savedLang : 'en');

  /* ---------------- CONTACT FORM (separate from the quote form) ---------------- */
  var contactForm = document.getElementById('contactForm');
  var cfStatus = document.getElementById('cfStatus');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      var data = new FormData(contactForm);

      var subject = encodeURIComponent('ORCA Contact — ' + (data.get('service') || 'General Inquiry'));
      var bodyLines = [
        'Service: ' + (data.get('service') || ''),
        'Name: ' + (data.get('name') || ''),
        'Company: ' + (data.get('company') || ''),
        'Phone: ' + (data.get('phone') || ''),
        'Email: ' + (data.get('email') || ''),
        '',
        'Message:',
        (data.get('message') || '')
      ];
      var body = encodeURIComponent(bodyLines.join('\n'));

      window.location.href = 'mailto:info@orca-eg.com?subject=' + subject + '&body=' + body;
      if(cfStatus){
        var dict = window.ORCA_I18N[currentLang] || {};
        cfStatus.textContent = dict.contact_status_sending || 'Opening your email client to send this message…';
      }
    });
  }
})();
