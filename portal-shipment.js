/* ============================================================
   ORCA Connect — shipment details (DEMO DATA)
   Reads ?id=... from the URL and looks it up in the shared demo
   dataset. No routing framework is in play here — this is a
   plain static site, so a query string stands in for a dynamic
   route until there's a real backend to fetch shipments from.
   ============================================================ */
(function(){
  "use strict";
  var DATA = window.ORCA_PORTAL_DATA;
  if(!DATA) return;

  var params = new URLSearchParams(window.location.search);
  var requestedId = params.get('id');
  var shipment = (requestedId && DATA.getShipmentById(requestedId)) || DATA.SHIPMENTS[0];

  document.title = shipment.id + ' — ORCA Connect';
  var titleEl = document.getElementById('psTitle');
  if(titleEl) titleEl.textContent = 'Shipment ' + shipment.id;

  /* ---------------- Key facts ---------------- */
  var metaEl = document.getElementById('psMeta');
  var facts = [
    { lbl: 'Shipment ID',      val: shipment.id },
    { lbl: 'Container Number', val: shipment.container },
    { lbl: 'Origin',           val: shipment.origin },
    { lbl: 'Destination',      val: shipment.destination },
    { lbl: 'Vessel',           val: shipment.vessel },
    { lbl: 'Current Status',   val: DATA.statusLabel(shipment.statusIndex) },
    { lbl: 'ETA',              val: shipment.eta }
  ];
  if(metaEl){
    metaEl.innerHTML = facts.map(function(f){
      return '<div class="portal-meta-item"><div class="lbl">' + f.lbl + '</div><div class="val">' + f.val + '</div></div>';
    }).join('');
  }

  /* ---------------- Tracking timeline ---------------- */
  var checkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12l5 5L20 6"/></svg>';
  var timelineEl = document.getElementById('psTimeline');
  if(timelineEl){
    timelineEl.innerHTML = DATA.TRACKING_STEPS.map(function(step, i){
      var stateClass = i < shipment.statusIndex ? 'is-done' : (i === shipment.statusIndex ? 'is-current' : '');
      var dotContent = i < shipment.statusIndex ? checkIcon : '';
      return (
        '<div class="portal-tl-step ' + stateClass + '">' +
          '<div class="portal-tl-dot">' + dotContent + '</div>' +
          '<div class="portal-tl-label">' + step + '</div>' +
        '</div>'
      );
    }).join('');
  }

  /* ---------------- Route visualization ---------------- */
  var routeEl = document.getElementById('psRoute');
  if(routeEl){
    routeEl.innerHTML = DATA.DEMO_ROUTE.map(function(stop, i){
      var arrow = i < DATA.DEMO_ROUTE.length - 1 ? '<div class="portal-route-arrow">↓</div>' : '';
      return '<div class="portal-route-stop"><span class="dot"></span>' + stop + '</div>' + arrow;
    }).join('');
  }

  /* ---------------- Scroll reveal for the timeline ---------------- */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!prefersReduced && window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo('#psTimeline .portal-tl-step', {opacity:0, y:16}, {
      opacity:1, y:0, duration:0.6, stagger:0.08, ease:'power3.out',
      scrollTrigger:{ trigger:'#psTimeline', start:'top 85%' }
    });
  }

  /* ---------------- Logout ---------------- */
  var logoutLink = document.getElementById('portalLogout');
  if(logoutLink){
    logoutLink.addEventListener('click', function(e){
      e.preventDefault();
      try{ sessionStorage.removeItem('orca_portal_demo'); }catch(err){}
      window.location.href = 'portal-login.html';
    });
  }
})();
