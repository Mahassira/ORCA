/* ============================================================
   ORCA Connect — portal login (frontend demo only)
   No real authentication happens here. Submitting the form marks
   a session flag (used only to show a small "signed in" affordance
   on the dashboard) and moves straight to the demo dashboard.
   ============================================================ */
(function(){
  "use strict";
  var form = document.getElementById('portalLoginForm');
  if(!form) return;

  form.addEventListener('submit', function(e){
    e.preventDefault();
    try{ sessionStorage.setItem('orca_portal_demo', '1'); }catch(err){}
    window.location.href = 'portal-dashboard.html';
  });
})();
