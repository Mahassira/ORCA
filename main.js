/* ============================================================
   ORCA Shipping & Agencies — cinematic scroll controller
   Vanilla JS + GSAP/ScrollTrigger. No frameworks required.
   ============================================================ */
(function(){
  "use strict";

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 760px)').matches;

  /* ---------------- LANGUAGE ENGINE (EN / AR) ---------------- */
  var LANG_KEY = 'orca_lang';
  function getSavedLang(){
    try{ return localStorage.getItem(LANG_KEY); } catch(e){ return null; }
  }
  function saveLang(lang){
    try{ localStorage.setItem(LANG_KEY, lang); } catch(e){}
  }
  var currentLang = 'en';

  function t(key){
    var dict = window.ORCA_I18N[currentLang] || {};
    var fallback = window.ORCA_I18N.en || {};
    return (key in dict) ? dict[key] : (fallback[key] !== undefined ? fallback[key] : key);
  }

  function refreshContainerHint(){
    var selected = document.querySelector('.container-option[aria-checked="true"]');
    if(selected){
      containerHint.textContent = t('container_hint_selected_prefix') + selected.querySelector('.c-name').textContent;
      containerHint.style.color = '';
    } else {
      containerHint.textContent = t('container_hint_default');
    }
  }

  function applyLanguage(lang){
    if(!window.ORCA_I18N[lang]) return;
    currentLang = lang;
    saveLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(function(el){
      if(el.id === 'containerHint') return; // handled separately (has dynamic state)
      var key = el.getAttribute('data-i18n');
      var dict = window.ORCA_I18N[lang];
      if(dict[key] !== undefined){
        if(key === 'footer_address'){ el.innerHTML = dict[key]; }
        else { el.textContent = dict[key]; }
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
      var key = el.getAttribute('data-i18n-placeholder');
      if(window.ORCA_I18N[lang][key] !== undefined) el.setAttribute('placeholder', window.ORCA_I18N[lang][key]);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function(el){
      var key = el.getAttribute('data-i18n-aria-label');
      if(window.ORCA_I18N[lang][key] !== undefined) el.setAttribute('aria-label', window.ORCA_I18N[lang][key]);
    });

    document.querySelectorAll('.lang-btn').forEach(function(btn){
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });

    if(typeof refreshContainerHint === 'function' && containerHint) refreshContainerHint();
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

  /* ---------------- CONTAINER SIZE VISUAL SELECTOR (always active) ---------------- */
  var containerOptions = Array.prototype.slice.call(document.querySelectorAll('.container-option'));
  var containerTypeInput = document.getElementById('qContainerType');
  var containerHint = document.getElementById('containerHint');

  function selectContainer(option){
    containerOptions.forEach(function(o){ o.setAttribute('aria-checked', o === option ? 'true' : 'false'); });
    containerTypeInput.value = option.dataset.value;
    refreshContainerHint();
  }
  containerOptions.forEach(function(option, idx){
    option.addEventListener('click', function(){ selectContainer(option); });
    option.addEventListener('keydown', function(e){
      var dir = 0;
      if(e.key === 'ArrowRight') dir = 1;
      if(e.key === 'ArrowLeft') dir = -1;
      if(dir !== 0){
        e.preventDefault();
        var next = containerOptions[(idx + dir + containerOptions.length) % containerOptions.length];
        next.focus();
        selectContainer(next);
      }
    });
  });

  /* ---------------- QUOTE FORM SUBMIT (always active) ---------------- */
  var quoteForm = document.getElementById('quoteForm');
  var qfStatus = document.getElementById('qfStatus');
  if(quoteForm){
    quoteForm.addEventListener('submit', function(e){
      e.preventDefault();
      if(!containerTypeInput.value){
        containerHint.textContent = t('container_hint_error');
        containerHint.style.color = '#B04A2E';
        return;
      }
      var data = new FormData(quoteForm);
      var containerName = quoteForm.querySelector('.container-option[aria-checked="true"] .c-name').textContent;
      var lines = [
        'Origin: ' + data.get('origin'),
        'Destination: ' + data.get('destination'),
        'Container type: ' + containerName,
        'Name: ' + data.get('name'),
        'Email: ' + data.get('email'),
        'Details: ' + (data.get('details') || '—')
      ];
      var subject = encodeURIComponent('Quote Request — ORCA Shipping');
      var body = encodeURIComponent(lines.join('\n'));
      window.location.href = 'mailto:info@orca-eg.com?subject=' + subject + '&body=' + body;
      qfStatus.textContent = t('status_sending');
    });
  }

  var savedLang = getSavedLang();
  applyLanguage((savedLang && window.ORCA_I18N[savedLang]) ? savedLang : 'en');

  /* ---------------- ANIMATED STAT COUNTERS (always active) ---------------- */
  function initStatCounters(){
    document.querySelectorAll('.stat .num').forEach(function(el){
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || '';
      var obj = {val:0};
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function(){
          gsap.to(obj, {
            val: target, duration:1.6, ease:'power2.out',
            onUpdate: function(){
              el.textContent = Math.round(obj.val).toLocaleString('en-US') + suffix;
            }
          });
        }
      });
    });
  }

  /* ---------------- MOBILE: no scroll-jacking at all ----------------
     Mobile uses plain, normally-flowing sections (.m-hero / .m-services)
     with native <video autoplay> — no pinning, no ScrollTrigger, nothing
     that can misbehave on scroll-up. Just wire up the stat counters. */
  if(isMobile){
    gsap.registerPlugin(ScrollTrigger);
    initStatCounters();
    return;
  }

  /* ---------------- REDUCED MOTION: simple static fallback (desktop) ---------------- */
  if(prefersReduced){
    document.body.classList.add('no-motion');
    var seaVideo = document.querySelector('.scene-sea video');
    if(seaVideo){
      seaVideo.src = seaVideo.dataset.srcDesktop;
      seaVideo.play().catch(function(){});
    }
    document.getElementById('actHero').style.opacity = 1;
    document.getElementById('actHero').style.transform = 'none';
    gsap.registerPlugin(ScrollTrigger);
    initStatCounters();
    return; // skip the cinematic scroll-jacking entirely
  }

  /* ---------------- VIDEO ASSET MANAGEMENT ---------------- */
  var scenes = Array.prototype.slice.call(document.querySelectorAll('.scene'));
  var videos = scenes.map(function(s){ return s.querySelector('video'); });

  function srcFor(video){
    return isMobile ? video.dataset.srcMobile : video.dataset.srcDesktop;
  }
  function applyPosterForViewport(){
    videos.forEach(function(v){
      if(isMobile && v.dataset.posterMobile){ v.poster = v.dataset.posterMobile; }
      else if(v.dataset.posterDesktop){ v.poster = v.dataset.posterDesktop; }
    });
  }
  videos.forEach(function(v){ v.dataset.posterDesktop = v.dataset.posterDesktop || v.getAttribute('poster'); });
  applyPosterForViewport();
  function ensureLoaded(i){
    if(isMobile && i === 2) return; // mobile never uses the desktop-only cargo scene
    var v = videos[i];
    if(!v || v.src) return;
    v.src = srcFor(v);
    v.load();
  }
  function setActiveScene(i){
    if(isMobile && i === 2) i = 1; // mobile has no third scene; stay on the port/about backdrop
    videos.forEach(function(v, idx){
      if(idx === i){
        ensureLoaded(idx);
        var p = v.play();
        if(p && p.catch) p.catch(function(){});
      } else {
        v.pause();
      }
    });
  }

  // First scene loads immediately; the second loads just ahead of being needed.
  ensureLoaded(0);
  setActiveScene(0);

  /* ---------------- GSAP CINEMATIC TIMELINE ---------------- */
  gsap.registerPlugin(ScrollTrigger);

  var actHero = document.getElementById('actHero');
  var scrollHint = document.getElementById('scrollHint');
  var actServices = document.getElementById('actServices');
  var servicesHead = document.getElementById('servicesHead');
  var serviceSlots = Array.prototype.slice.call(document.querySelectorAll('.service-slot'));
  var serviceDots = Array.prototype.slice.call(document.querySelectorAll('#serviceDots i'));
  var actCargo = document.getElementById('actCargo');
  var actAbout = document.getElementById('actAbout');
  var progressFill = document.getElementById('cineProgressFill');
  var sceneSea = document.querySelector('.scene-sea');
  var scenePort = document.querySelector('.scene-port');
  var sceneCargo = document.querySelector('.scene-cargo');

  var currentScene = 0;
  var lastServiceIdx = -1;

  // Preload the port/about-backdrop video a little before it's needed; cargo only on desktop.
  function checkPreload(progress){
    if(progress > 0.08) ensureLoaded(1);
    if(!isMobile && progress > 0.55) ensureLoaded(2);
  }

  function clamp01(v){ return Math.max(0, Math.min(1, v)); }
  function remap(v, a, b){ return clamp01((v - a) / (b - a)); }

  ScrollTrigger.create({
    trigger: '#cinematic',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.6,
    onUpdate: function(self){
      var p = self.progress;
      checkPreload(p);
      progressFill.style.height = (p * 100) + '%';

      /* --- scene crossfades: sea -> port always; port -> cargo on desktop only --- */
      var seaOp   = 1 - remap(p, 0.16, 0.24);
      var portOp  = remap(p, 0.16, 0.24) * (isMobile ? 1 : (1 - remap(p, 0.78, 0.85)));
      var cargoOp = isMobile ? 0 : remap(p, 0.78, 0.85);
      sceneSea.style.opacity = seaOp;
      scenePort.style.opacity = portOp;
      sceneCargo.style.opacity = cargoOp;

      var activeNow = isMobile
        ? (p < 0.20 ? 0 : 1)
        : (p < 0.20 ? 0 : (p < 0.82 ? 1 : 2));
      if(activeNow !== currentScene){
        currentScene = activeNow;
        setActiveScene(currentScene);
      }

      /* --- act 1: hero copy --- */
      var heroIn = remap(p, 0.0, 0.04);
      var heroOut = 1 - remap(p, 0.12, 0.16);
      var heroOpacity = Math.min(heroIn, heroOut);
      actHero.style.opacity = heroOpacity;
      actHero.style.transform = 'translateY(' + (26 * (1 - heroIn)) + 'px)';
      scrollHint.style.opacity = (p < 0.04) ? (1 - remap(p, 0.015, 0.04)) : 0;

      /* --- act 2: services --- */
      var servicesWrapIn = remap(p, 0.18, 0.24);
      var servicesWrapOut = 1 - remap(p, 0.80, 0.85);
      actServices.style.opacity = Math.min(servicesWrapIn, servicesWrapOut);

      var headIn = remap(p, 0.20, 0.26);
      var headOut = 1 - remap(p, 0.29, 0.32);
      var headOp = Math.min(headIn, headOut);
      servicesHead.style.opacity = headOp;
      servicesHead.style.transform = 'translateY(' + (20 * (1 - headIn)) + 'px)';

      // six services occupy 0.32 -> 0.78 (a generous, evenly-paced 0.0767 each)
      var segStart = 0.32, segEnd = 0.78;
      var segLen = (segEnd - segStart) / serviceSlots.length;
      var activeSlot = -1;
      serviceSlots.forEach(function(slot, idx){
        var s0 = segStart + idx * segLen;
        var s1 = s0 + segLen;
        var fadeIn = remap(p, s0, s0 + segLen * 0.25);
        var fadeOut = 1 - remap(p, s1 - segLen * 0.25, s1);
        var op = Math.min(fadeIn, fadeOut);
        slot.style.opacity = op;
        slot.style.transform = 'translateY(' + (24 * (1 - fadeIn)) + 'px)';
        if(p >= s0 && p < s1) activeSlot = idx;
      });
      if(activeSlot !== lastServiceIdx){
        lastServiceIdx = activeSlot;
        serviceDots.forEach(function(dot, idx){
          dot.classList.toggle('active', idx === activeSlot);
        });
      }

      /* --- act 3: cargo (desktop) or about (mobile) --- */
      if(isMobile){
        var aboutIn = remap(p, 0.84, 0.90);
        var aboutOut = 1 - remap(p, 0.96, 0.995);
        var aboutOp = Math.min(aboutIn, aboutOut);
        actAbout.style.opacity = aboutOp;
        actAbout.style.transform = 'translateY(' + (20 * (1 - aboutIn)) + 'px)';
      } else {
        var cargoIn = remap(p, 0.86, 0.91);
        var cargoOut = 1 - remap(p, 0.95, 0.985);
        var cargoOpText = Math.min(cargoIn, cargoOut);
        actCargo.style.opacity = cargoOpText;
        actCargo.style.transform = 'translateY(' + (20 * (1 - cargoIn)) + 'px)';
      }
    }
  });

  /* ---------------- SIMPLE REVEALS FOR STATIC SECTIONS ---------------- */
  gsap.utils.toArray('.about-media, .about-copy, .stat').forEach(function(el, i){
    gsap.fromTo(el, {opacity:0, y:24}, {
      opacity:1, y:0, duration:0.9, delay:(i%4)*0.06, ease:'power3.out',
      scrollTrigger:{ trigger: el, start:'top 88%' }
    });
  });

  initStatCounters();

  /* ---------------- RESIZE: keep mobile/desktop source choice in sync ---------------- */
  var resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      var nowMobile = window.matchMedia('(max-width: 760px)').matches;
      if(nowMobile !== isMobile){
        isMobile = nowMobile;
        applyPosterForViewport();
        videos.forEach(function(v, idx){
          if(v.src){ v.src = srcFor(v); if(idx === currentScene) v.play().catch(function(){}); }
        });
      }
      ScrollTrigger.refresh();
    }, 250);
  });
})();
