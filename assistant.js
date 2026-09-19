/* ============================================================
   ORCA Assistant — rule-based visitor helper, no AI/API involved.
   Matches simple keywords and routes to the right existing page
   or section. Fully self-contained: works on any page it's
   included on, reads the site's saved language (orca_lang) so its
   replies match whatever language the visitor is already using.
   ============================================================ */
(function(){
  "use strict";

  function getLang(){
    try{ return localStorage.getItem('orca_lang') || 'en'; }catch(e){ return 'en'; }
  }
  var lang = getLang();
  var isAr = lang === 'ar';

  var T = {
    en: {
      title: 'ORCA Assistant',
      greeting: "Hi! I can help you find a quote, track a shipment, or point you to the right page. What do you need?",
      placeholder: 'Type a question…',
      chips: ['Get a Quote', 'Track a Shipment', 'Our Services', 'Our Locations', 'Contact Us'],
      fallback: 'I can help with quotes, tracking, our services, locations, or contact details. You can also <a href="contact.html">reach our team directly</a>.'
    },
    ar: {
      title: 'مساعد أوركا',
      greeting: 'أهلًا! أقدر أساعدك تطلب عرض سعر، تتابع شحنة، أو أوجّهك للصفحة الصح. تحتاج إيه؟',
      placeholder: 'اكتب سؤالك…',
      chips: ['اطلب عرض سعر', 'تتبع شحنة', 'خدماتنا', 'مواقعنا', 'تواصل معنا'],
      fallback: 'أقدر أساعدك في: عروض الأسعار، تتبع الشحنات، خدماتنا، مواقعنا، أو بيانات التواصل. تقدر كمان <a href="contact.html">تتواصل مع فريقنا مباشرة</a>.'
    }
  };
  var t = T[isAr ? 'ar' : 'en'];

  /* ---------------- Rules: keyword -> {en, ar, href} ---------------- */
  var RULES = [
    {
      kws: ['quote','price','cost','pricing','rate','estimate','عرض سعر','سعر','تسعير'],
      en: 'You can request a quotation here: <a href="index.html#quote">Get a Quotation</a>.',
      ar: 'تقدر تطلب عرض سعر من هنا: <a href="index.html#quote">اطلب عرض سعر</a>.'
    },
    {
      kws: ['track','tracking','shipment status','where is my','container status','تتبع','شحنتي','حالة الشحنة'],
      en: 'Shipment tracking is available through our <a href="digital-solutions.html">Digital Solutions</a> and <a href="portal-login.html">Customer Portal</a> (demo preview).',
      ar: 'تتبع الشحنات متاح من خلال <a href="digital-solutions.html">الحلول الرقمية</a> و<a href="portal-login.html">بوابة العملاء</a> (نسخة تجريبية).'
    },
    {
      kws: ['location','where are you','port','address','branch','office','موقع','فرع','عنوان','ميناء'],
      en: 'See all our locations and ports on the <a href="locations.html">Our Locations</a> page.',
      ar: 'تقدر تشوف كل مواقعنا وموانئنا في صفحة <a href="locations.html">مواقعنا</a>.'
    },
    {
      kws: ['service','shipping','logistics','warehousing','customs','trucking','cold storage','خدمة','خدمات','شحن','لوجستيات','تخزين','جمارك'],
      en: 'Explore all our services here: <a href="services.html">Services & Logistics</a>.',
      ar: 'تقدر تستكشف كل خدماتنا هنا: <a href="services.html">الخدمات واللوجستيات</a>.'
    },
    {
      kws: ['contact','phone','email','call','talk to','support','تواصل','اتصال','ايميل','رقم'],
      en: 'You can reach our team on the <a href="contact.html">Contact</a> page, or call <a href="tel:+20226330247" dir="ltr">+2 02 63 30 2047</a>.',
      ar: 'تقدر تتواصل مع فريقنا من صفحة <a href="contact.html">التواصل</a>، أو تتصل على <a href="tel:+20226330247" dir="ltr">+2 02 63 30 2047</a>.'
    },
    {
      kws: ['about','company','who are you','history','team','نبذة','شركة','فريق','عن الشركة'],
      en: 'Learn more about us on the <a href="our company.html">Our Company</a> page.',
      ar: 'تقدر تعرف أكتر عننا في صفحة <a href="our company.html">عن الشركة</a>.'
    },
    {
      kws: ['hi','hello','hey','مرحبا','اهلا','أهلا','السلام عليكم'],
      en: "Hello! Ask me about quotes, tracking, services, locations, or how to reach us.",
      ar: 'أهلًا بيك! اسألني عن عروض الأسعار، تتبع الشحنات، خدماتنا، مواقعنا، أو إزاي تتواصل معانا.'
    }
  ];

  function reply(text){
    var q = text.toLowerCase();
    for(var i=0; i<RULES.length; i++){
      var rule = RULES[i];
      for(var j=0; j<rule.kws.length; j++){
        if(q.indexOf(rule.kws[j].toLowerCase()) !== -1){
          return isAr ? rule.ar : rule.en;
        }
      }
    }
    return t.fallback;
  }

  /* ---------------- Build the widget ---------------- */
  var fab = document.createElement('button');
  fab.className = 'orca-assist-fab';
  fab.setAttribute('aria-label', t.title);
  fab.innerHTML =
    '<svg class="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>' +
    '<svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';

  var panel = document.createElement('div');
  panel.className = 'orca-assist-panel';
  panel.innerHTML =
    '<div class="orca-assist-head">' +
      '<img src="orca logo white.png" alt="">' +
      '<span>' + t.title + '</span>' +
    '</div>' +
    '<div class="orca-assist-body" id="orcaAssistBody"></div>' +
    '<div class="orca-assist-chips" id="orcaAssistChips"></div>' +
    '<div class="orca-assist-input-row">' +
      '<input type="text" id="orcaAssistInput" placeholder="' + t.placeholder + '">' +
      '<button class="orca-assist-send" id="orcaAssistSend" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button>' +
    '</div>';

  document.addEventListener('DOMContentLoaded', function(){
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    var body = document.getElementById('orcaAssistBody');
    var chipsEl = document.getElementById('orcaAssistChips');
    var input = document.getElementById('orcaAssistInput');
    var sendBtn = document.getElementById('orcaAssistSend');
    var opened = false;

    function addMsg(html, who){
      var div = document.createElement('div');
      div.className = 'orca-assist-msg orca-assist-msg--' + who;
      div.innerHTML = html;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    function handle(text){
      addMsg(text.replace(/</g,'&lt;'), 'user');
      setTimeout(function(){ addMsg(reply(text), 'bot'); }, 300);
    }

    t.chips.forEach(function(label){
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'orca-assist-chip';
      chip.textContent = label;
      chip.addEventListener('click', function(){ handle(label); });
      chipsEl.appendChild(chip);
    });

    fab.addEventListener('click', function(){
      opened = !opened;
      fab.classList.toggle('is-open', opened);
      panel.classList.toggle('is-open', opened);
      if(opened && !body.hasChildNodes()){
        addMsg(t.greeting, 'bot');
      }
    });

    function submit(){
      var val = input.value.trim();
      if(!val) return;
      handle(val);
      input.value = '';
    }
    sendBtn.addEventListener('click', submit);
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); submit(); }
    });
  });
})();
