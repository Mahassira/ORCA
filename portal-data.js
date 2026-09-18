/* ============================================================
   ORCA Connect — DEMO DATA ONLY
   ============================================================
   Everything in this file is placeholder data for the frontend
   prototype. Nothing here is a live shipment, a real customer
   record, or a real document.

   This file is the ONLY place demo data lives — dashboard/shipment
   pages read from window.ORCA_PORTAL_DATA rather than having
   values hard-coded inline, so swapping this for a real API
   response later means changing this file (or the functions
   below) without having to touch the page markup/rendering code.

   Shapes (documented here since this is a plain-JS project with
   no TypeScript build step):

   Shipment
   ├─ id           string   e.g. "ORCA-2026-00125"
   ├─ reference    string   customer's own reference code
   ├─ origin       string
   ├─ destination  string
   ├─ container    string   container number
   ├─ vessel       string
   ├─ statusIndex  number   index into TRACKING_STEPS below
   └─ eta          string   display date

   TrackingEvent (implicit — each TRACKING_STEPS entry is one)
   └─ label        string

   Document
   ├─ name  string
   ├─ type  string
   └─ date  string
   ============================================================ */
window.ORCA_PORTAL_DATA = (function(){

  var TRACKING_STEPS = [
    'Booking Confirmed',
    'Cargo Received',
    'Loaded on Vessel',
    'Vessel Departed',
    'In Transit',
    'Arrived at Port',
    'Customs Clearance',
    'Delivered'
  ];

  var SHIPMENTS = [
    { id:'ORCA-2026-00125', reference:'ORCA-DEMO-125', origin:'Shanghai',  destination:'Alexandria', container:'ORCU1234567', vessel:'ORCA STAR',    statusIndex:4, eta:'28 Sep 2026' },
    { id:'ORCA-2026-00089', reference:'ORCA-DEMO-089', origin:'Ningbo',    destination:'Damietta',   container:'ORCU7788990', vessel:'ORCA HORIZON', statusIndex:5, eta:'15 Sep 2026' },
    { id:'ORCA-2026-00142', reference:'ORCA-DEMO-142', origin:'Jebel Ali', destination:'Ain Sokhna', container:'ORCU4455667', vessel:'ORCA ATLAS',   statusIndex:6, eta:'10 Sep 2026' },
    { id:'ORCA-2026-00071', reference:'ORCA-DEMO-071', origin:'Piraeus',   destination:'Alexandria', container:'ORCU9988771', vessel:'ORCA HORIZON', statusIndex:7, eta:'01 Sep 2026' },
    { id:'ORCA-2026-00158', reference:'ORCA-DEMO-158', origin:'Rotterdam', destination:'Damietta',   container:'ORCU3322114', vessel:'ORCA STAR',    statusIndex:0, eta:'05 Oct 2026' }
  ];

  var DEMO_ROUTE = ['Shanghai', 'Port Loading', 'Vessel Departure', 'Mediterranean', 'Alexandria', 'Delivery'];

  var DOCUMENTS = [
    { name:'Bill of Lading',      type:'PDF', date:'01 Sep 2026' },
    { name:'Commercial Invoice',  type:'PDF', date:'01 Sep 2026' },
    { name:'Packing List',        type:'PDF', date:'02 Sep 2026' },
    { name:'Delivery Order',      type:'PDF', date:'Pending' }
  ];

  var SUMMARY = {
    active: 12,
    inTransit: 7,
    arrivingSoon: 3,
    delivered: 24
  };

  function getShipmentById(id){
    for(var i = 0; i < SHIPMENTS.length; i++){
      if(SHIPMENTS[i].id === id) return SHIPMENTS[i];
    }
    return null;
  }

  function statusLabel(statusIndex){
    return TRACKING_STEPS[statusIndex] || TRACKING_STEPS[0];
  }

  return {
    TRACKING_STEPS: TRACKING_STEPS,
    SHIPMENTS: SHIPMENTS,
    DEMO_ROUTE: DEMO_ROUTE,
    DOCUMENTS: DOCUMENTS,
    SUMMARY: SUMMARY,
    getShipmentById: getShipmentById,
    statusLabel: statusLabel
  };
})();
