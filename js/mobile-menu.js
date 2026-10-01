/* ============================================================
   ORCA — shared mobile menu behaviour (all marketing pages).
   Opening/closing stays in each page's own script; this file only
   adds what is identical everywhere:
   - highlights the link for the page you are on
   - Escape closes the menu; Tab stays inside it while open
   - focus moves into the menu on open and back to the button on close
   - the burger button's spoken label follows state and language
   - the backdrop image loads only after the page itself has loaded
   The menu text itself follows the page language through i18n.js,
   so it always opens in whichever language the page is showing.
   ============================================================ */
(function(){
  "use strict";
  var navLinks = document.getElementById('navLinks');
  var toggle = document.getElementById('navToggle');
  if(!navLinks || !toggle) return;

  /* ---- current page ---- */
  var here = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  Array.prototype.forEach.call(navLinks.children, function(el){
    if(el.tagName !== 'A' || el.classList.contains('nav-cta-mobile')) return;
    var href = el.getAttribute('href') || '';
    var file = href.split('#')[0];
    if(file === '' && href.charAt(0) === '#') file = here;   // same-page anchor, e.g. "#top" on the homepage
    try{ file = decodeURIComponent(file); }catch(e){}
    if(file && file === here){
      el.classList.add('is-current');
      el.setAttribute('aria-current', 'page');
    }
  });

  /* ---- spoken label on the burger button ---- */
  function isOpen(){ return navLinks.classList.contains('open'); }
  function syncLabel(){
    var ar = document.documentElement.lang === 'ar';
    toggle.setAttribute('aria-label', isOpen()
      ? (ar ? 'إغلاق القائمة' : 'Close menu')
      : (ar ? 'فتح القائمة' : 'Open menu'));
  }
  syncLabel();
  new MutationObserver(syncLabel).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  /* ---- focus in on open, back to the button on close ---- */
  var wasOpen = false;
  new MutationObserver(function(){
    var open = isOpen();
    if(open === wasOpen) return;
    wasOpen = open;
    syncLabel();
    if(open){
      var first = navLinks.querySelector('.nav-menu-label + a') || navLinks.querySelector('a');
      if(first) setTimeout(function(){ try{ first.focus({ preventScroll: true }); }catch(e){ first.focus(); } }, 60);
    } else if(navLinks.contains(document.activeElement)){
      try{ toggle.focus({ preventScroll: true }); }catch(e){ toggle.focus(); }
    }
  }).observe(navLinks, { attributes: true, attributeFilter: ['class'] });

  /* ---- Escape closes; Tab cycles inside the open menu ---- */
  document.addEventListener('keydown', function(e){
    if(!isOpen()) return;
    if(e.key === 'Escape'){
      e.preventDefault();
      toggle.click();
      return;
    }
    if(e.key === 'Tab'){
      var items = [toggle].concat(Array.prototype.slice.call(navLinks.querySelectorAll('a[href], button')));
      var i = items.indexOf(document.activeElement);
      if(e.shiftKey && i <= 0){ e.preventDefault(); items[items.length - 1].focus(); }
      else if(!e.shiftKey && i === items.length - 1){ e.preventDefault(); items[0].focus(); }
    }
  });

  /* ---- backdrop image after the page has loaded (mobile CSS only uses it) ---- */
  function ready(){ navLinks.classList.add('menu-ready'); }
  if(document.readyState === 'complete') setTimeout(ready, 300);
  else window.addEventListener('load', function(){ setTimeout(ready, 300); });
})();
