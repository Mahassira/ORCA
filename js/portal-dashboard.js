/* ============================================================
   ORCA Connect — dashboard rendering (DEMO DATA)
   Reads everything from window.ORCA_PORTAL_DATA rather than
   hard-coding values in the markup, so a future real data source
   only needs to populate that object (or replace it with an API
   call) — this file's rendering logic would not need to change.
   ============================================================ */
(function(){
  "use strict";
  var DATA = window.ORCA_PORTAL_DATA;
  if(!DATA) return;

  /* ---------------- Summary cards ---------------- */
  var summaryEl = document.getElementById('portalSummary');
  var summaryItems = [
    { num: DATA.SUMMARY.active,       lbl: 'Active Shipments' },
    { num: DATA.SUMMARY.inTransit,    lbl: 'In Transit' },
    { num: DATA.SUMMARY.arrivingSoon, lbl: 'Arriving Soon' },
    { num: DATA.SUMMARY.delivered,    lbl: 'Delivered' }
  ];
  if(summaryEl){
    summaryEl.innerHTML = summaryItems.map(function(item){
      return '<div class="portal-summary-card"><div class="num">' + item.num + '</div><div class="lbl">' + item.lbl + '</div></div>';
    }).join('');
  }

  /* ---------------- Shipment table ---------------- */
  function statusClass(statusIndex){
    if(statusIndex === DATA.TRACKING_STEPS.length - 1) return 'portal-status--done';
    if(statusIndex === 0) return 'portal-status--pending';
    return '';
  }

  var rowsEl = document.getElementById('portalShipmentRows');
  if(rowsEl){
    rowsEl.innerHTML = DATA.SHIPMENTS.map(function(s){
      var statusText = DATA.statusLabel(s.statusIndex);
      return (
        '<tr>' +
          '<td data-label="Shipment ID">' + s.id + '</td>' +
          '<td data-label="Reference">' + s.reference + '</td>' +
          '<td data-label="Origin">' + s.origin + '</td>' +
          '<td data-label="Destination">' + s.destination + '</td>' +
          '<td data-label="Status"><span class="portal-status ' + statusClass(s.statusIndex) + '">' + statusText + '</span></td>' +
          '<td data-label="ETA">' + s.eta + '</td>' +
          '<td data-label="Actions"><a class="portal-link" href="portal-shipment.html?id=' + encodeURIComponent(s.id) + '">View Details</a></td>' +
        '</tr>'
      );
    }).join('');
  }

  /* ---------------- Documents ---------------- */
  var docIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>';
  var docsEl = document.getElementById('portalDocs');
  if(docsEl){
    docsEl.innerHTML = DATA.DOCUMENTS.map(function(doc){
      var isReady = doc.date !== 'Pending';
      return (
        '<div class="portal-doc">' +
          '<div class="portal-doc-info">' +
            '<div class="portal-doc-icon">' + docIcon + '</div>' +
            '<div><div class="portal-doc-name">' + doc.name + '</div><div class="portal-doc-meta">' + doc.type + ' · ' + doc.date + '</div></div>' +
          '</div>' +
          (isReady
            ? '<a class="portal-doc-btn" href="javascript:void(0)" title="Demo placeholder — not a real file">View</a>'
            : '<span class="portal-doc-btn" style="opacity:.4;">Pending</span>') +
        '</div>'
      );
    }).join('');
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
