/* الأساسيات: الاتصال، الحالة، أدوات الواجهة */
(function () {
  'use strict';

  // ───────── أدوات DOM ─────────
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    kids.flat(9).forEach((c) => { if (c == null || c === false) return; el.appendChild(c.nodeType ? c : document.createTextNode(c)); });
    return el;
  }
  const $ = (s, r = document) => r.querySelector(s);
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

  let toastT;
  function toast(msg, ms = 2400) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms);
  }
  function sheet(content) {
    const s = $('#sheet');
    if (!content) { s.hidden = true; s.innerHTML = ''; return; }
    s.innerHTML = ''; s.hidden = false;
    const panel = h('div', { class: 'panel' }, content);
    s.appendChild(panel);
    s.onclick = (e) => { if (e.target === s) sheet(null); };
  }
  function confetti(n = 90, opts = {}) {
    const fx = $('#fx');
    const cols = ['#FF5B4A', '#FFB627', '#19C2A0', '#3D8BFF', '#8A5CF6', '#FF7AB6'];
    const W = innerWidth, H = innerHeight;
    for (let i = 0; i < n; i++) {
      const d = document.createElement('i');
      const s = 7 + Math.random() * 9;
      d.style.cssText = `position:absolute;left:${opts.x != null ? opts.x : Math.random() * W}px;top:${opts.y != null ? opts.y : -20}px;width:${s}px;height:${s * (Math.random() < .5 ? 1 : .45)}px;background:${cols[i % cols.length]};border-radius:${Math.random() < .4 ? '50%' : '2px'};border:1.5px solid #22163B`;
      fx.appendChild(d);
      const burst = opts.y != null;
      const ang = Math.random() * Math.PI * 2, sp = 200 + Math.random() * 420;
      const dx = burst ? Math.cos(ang) * sp : (Math.random() - .5) * 300;
      const dy = burst ? Math.sin(ang) * sp - 200 : H + 60;
      const a = d.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${dx}px, ${burst ? dy : dy * .6}px) rotate(${Math.random() * 720}deg)`, opacity: 1, offset: .6 },
        { transform: `translate(${dx * 1.2}px, ${burst ? dy + 500 : dy}px) rotate(${Math.random() * 1080}deg)`, opacity: 0 },
      ], { duration: 1800 + Math.random() * 1400, easing: 'cubic-bezier(.2,.6,.4,1)', delay: Math.random() * (burst ? 80 : 500) });
      a.onfinish = () => d.remove();
    }
  }
  function vibrate(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }
  const store = {
    get(k, d) { try { const v = localStorage.getItem('lamma:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('lamma:' + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem('lamma:' + k); } catch (e) {} },
  };

  // ───────── بيانات الأنشطة ─────────
  const CATS = [
    ['speed', '⚡ سرعة ورد فعل', '#19C2A0'], ['memory', '🧠 ذاكرة', '#8A5CF6'], ['eye', '👀 ملاحظة وتقدير', '#3D8BFF'],
    ['brain', '📚 معلومات وذكاء', '#FFB627'], ['group', '🫶 جماعية وتعاون', '#FF7AB6'],
  ];
  const A = (cat, name, icon, tag, desc, steps) => ({ cat, name, icon, tag, desc, steps, c: (CATS.find((c) => c[0] === cat) || [])[2] });
  const ACTS = {
    reflex: A('speed', 'لا تستعجل!', '🚦', 'رد فعل', 'الدائرة حمراء.. انتظر الأخضر واضغط بأسرع ما تقدر. الأصفر خدعة!', [['🔴', 'انتظر', 'لا تضغط على الأحمر'], ['🟡', 'انتبه للخدعة', 'الأصفر يطلعك'], ['🟢', 'اضغط!', 'الأسرع يفوز']]),
    taps: A('speed', 'ضغط جنوني', '👆', 'سرعة', 'زر واحد وثواني معدودة.. مين يضغط أكثر؟', [['👆', 'اضغط', 'بكل قوتك'], ['⏱️', 'ثواني', 'الوقت محدود'], ['🏆', 'الأكثر يفوز', 'الخادم يعد']]),
    arrows: A('speed', 'عكس السهم', '🧭', 'تركيز', 'سهم وأمر: «نفس» أو «عكس».. اضغط الاتجاه الصحيح بسرعة', [['➡️', 'شوف السهم', 'وين يأشر؟'], ['🔄', 'اقرأ الأمر', 'نفس ولا عكس'], ['⚡', 'اضغط', 'أول صح يفوز']]),
    stroop: A('speed', 'ألوان مخادعة', '🎨', 'تركيز', 'كلمة «أحمر» مكتوبة بالأزرق.. اضغط لون الخط مو الكلمة!', [['👀', 'شوف اللون', 'مو الكلمة'], ['🤯', 'لا تنخدع', 'عقلك بيقرأ'], ['⚡', 'اضغط', 'أول صح يفوز']]),
    cards: A('speed', 'اقلبها وسبقهم', '🃏', 'سرعة', 'بطاقات تنقلب للكل بنفس اللحظة.. التحدي يتغير كل جولة!', [['📋', 'اقرأ التحدي', 'طابق، المختلف، أو تذكّر'], ['🃏', 'البطاقات تنقلب', 'للجميع بنفس الوقت'], ['⚡', 'اسبقهم', 'أول صح يفوز']]),
    changed: A('memory', 'وش تغيّر؟', '👀', 'ذاكرة', 'احفظ الشبكة بسرعة.. بعدها شي واحد بيتغير. مين يلقاه أول؟', [['👀', 'احفظ', 'عندك ثواني'], ['🙈', 'غمّض', 'الشبكة تختفي'], ['🔍', 'لقه!', 'اضغط اللي تغيّر']]),
    missing: A('memory', 'مين اختفى؟', '🫥', 'ذاكرة', 'صف من الصور.. احفظه، وبعدها واحد منها بيختفي', [['👀', 'احفظ الصف', 'كل الصور'], ['🫥', 'واحد يختفي', 'الباقي يتلخبط'], ['🔍', 'مين الناقص؟', 'أول صح يفوز']]),
    order: A('memory', 'مين ظهر أول؟', '🔢', 'ذاكرة', 'صور تطلع وحدة ورا الثانية.. وبعدها سؤال عن ترتيبها', [['🎞️', 'تابع', 'وحدة ورا وحدة'], ['🔢', 'احفظ الترتيب', 'الأول والثاني..'], ['❓', 'جاوب', 'وش كان الثالث؟']]),
    digits: A('memory', 'احفظ الرقم', '🔢', 'ذاكرة', 'رقم طويل يظهر ثواني ويختفي.. اكتبه صح قبل الكل', [['👀', 'شوف الرقم', 'ثواني بس'], ['🙈', 'يختفي', 'من الذاكرة'], ['⌨️', 'اكتبه', 'أول صح يفوز']]),
    simon: A('memory', 'تتابع الألوان', '🚥', 'ذاكرة', 'الأزرار تضوي بترتيب.. كررها بنفس الترتيب، وكل جولة أطول', [['💡', 'شوف الترتيب', 'الألوان تضوي'], ['🧠', 'احفظه', 'كل جولة أطول'], ['👆', 'كرره', 'أول صح يفوز']]),
    cups: A('eye', 'وين الكرة؟', '🥤', 'ملاحظة', 'الكرة تحت كوب.. الأكواب تتخلط بسرعة. تابعها بعينك!', [['⚽', 'شوف الكرة', 'تحت أي كوب؟'], ['🌀', 'تابع الخلط', 'الأكواب تتبادل'], ['👆', 'اختار مرة', 'أول صح يفوز']]),
    shadow: A('eye', 'ظل مين؟', '🌑', 'ملاحظة', 'ظل أسود لشي معروف.. اعرف صاحبه قبل الكل', [['🌑', 'شوف الظل', 'شكل بس'], ['🤔', 'خمّن', 'مين صاحبه؟'], ['⚡', 'اضغط', 'أول صح يفوز']]),
    estimate: A('eye', 'كم عددها؟', '🫘', 'تقدير', 'أشياء مبعثرة تظهر ثانيتين.. قدّر عددها، الأقرب يفوز', [['👀', 'نظرة سريعة', 'ثانيتين بس'], ['🔢', 'قدّر', 'اكتب العدد'], ['🎯', 'الأقرب يفوز', 'والمضبوط بونص']]),
    timer: A('eye', 'إحساس الوقت', '⏱️', 'إحساس', 'اضغط بعد عدد ثواني محدد.. بدون عداد! الأقرب يفوز', [['▶️', 'يبدأ الوقت', 'العداد مخفي'], ['🧘', 'عد في بالك', 'بهدوء'], ['🎯', 'اضغط', 'الأقرب يفوز']]),
    pattern: A('eye', 'كمّل النمط', '🧩', 'منطق', 'تسلسل صور أو أرقام.. وش اللي يجي بعده؟', [['👀', 'شوف التسلسل', 'وش يتكرر؟'], ['🧩', 'افهم النمط', 'منطق بسيط'], ['⚡', 'كمّله', 'أول صح يفوز']]),
    trivia: A('brain', 'تحدي المعلومات', '🧠', 'معلومات', 'أسئلة ثقافة عامة بأربع خيارات.. الأسرع بالصح يفوز', [['❓', 'السؤال', 'للكل بنفس اللحظة'], ['🔤', 'أربع خيارات', 'وحدة صح'], ['⚡', 'اسبق', 'الغلط يطلعك']]),
    truefalse: A('brain', 'صح ولا خطأ؟', '⚖️', 'معلومات', 'جملة.. صح ولا خطأ؟ قرر بسرعة', [['📜', 'اقرأ', 'جملة وحدة'], ['⚖️', 'قرر', 'صح أو خطأ'], ['⚡', 'بسرعة', 'أول صح يفوز']]),
    emojiq: A('brain', 'خمّنها بالإيموجي', '🤔', 'ذكاء', 'إيموجي يوصف شي معروف.. وش المقصود؟', [['😀', 'اقرأ الإيموجي', 'رموز بس'], ['🤔', 'فكّر', 'وش يقصدون؟'], ['⚡', 'جاوب', 'أول صح يفوز']]),
    oddword: A('brain', 'الكلمة الدخيلة', '🕵️', 'ذكاء', 'أربع كلمات، ثلاث من عائلة وحدة.. مين الدخيلة؟', [['🔤', 'أربع كلمات', 'شوفها'], ['🕵️', 'لق الدخيلة', 'مو من نفس النوع'], ['⚡', 'اضغط', 'أول صح يفوز']]),
    math: A('brain', 'حسبة سريعة', '🧮', 'حساب', 'مسألة حساب سريعة.. أول واحد يجاوب صح يفوز', [['➕', 'المسألة', 'جمع وطرح وضرب'], ['🧮', 'احسب', 'في بالك'], ['⚡', 'اضغط', 'أول صح يفوز']]),
    harmony: A('group', 'قلب واحد', '💞', 'تعاوني', 'سؤال وخيارات.. الهدف تختارون كلكم نفس الجواب بدون كلام!', [['🤫', 'بدون كلام', 'لا تتفقون قبل'], ['💭', 'فكّر بالمجموعة', 'وش بيختارون؟'], ['💞', 'انسجامكم', 'المؤشر يرتفع']]),
    unique: A('group', 'لا تتشابهون!', '🙅', 'تعاوني', 'العكس تمامًا: كل واحد لازم يختار شي مختلف.. والخيارات بعددكم بالضبط', [['🤫', 'بدون كلام', 'ولا تلميح'], ['🙅', 'اختر غير', 'لا تتشابهون'], ['🫶', 'نجاح جماعي', 'كلكم تفوزون']]),
    majority: A('group', 'مع الأغلبية', '👥', 'توقع', 'شاي ولا قهوة؟ اختار اللي تتوقع أغلب الجماعة بيختارونه', [['🤔', 'سؤالين', 'اختار واحد'], ['👥', 'توقع الجماعة', 'مو رأيك أنت'], ['🏆', 'الأغلبية تفوز', 'نقاط للأكثر']]),
    vote: A('group', 'مين فينا؟', '🫵', 'اجتماعي', 'أسئلة عن الجماعة نفسها.. صوّتوا والنتيجة تطلع للكل 😂', [['❓', 'السؤال', 'مين فينا…؟'], ['🫵', 'صوّت', 'لأي واحد'], ['😂', 'النتيجة', 'تطلع للكل']]),
  };

  // ───────── الاتصال ─────────
  const listeners = {};
  const Net = {
    mode: null, // 'ws' | 'local'
    status: 'idle',
    room: null, id: null, token: null, role: 'player',
    on(t, fn) { (listeners[t] = listeners[t] || []).push(fn); },
    emit(t, m) { (listeners[t] || []).forEach((f) => f(m)); },
    send(obj) {
      if (this.mode === 'local') { this.localRoom.handle(this.id, obj); return; }
      if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(obj));
    },
    connect(opts) {
      this.mode = 'ws';
      this.opts = opts;
      this.room = opts.room; this.role = opts.role || 'player';
      const saved = store.get('s:' + opts.room, null);
      if (saved && saved.role === this.role) { this.id = saved.id; this.token = saved.token; } else { this.id = null; this.token = null; }
      this.retry = 0;
      this._open();
    },
    _open() {
      clearTimeout(this.rt);
      if (this.ws) { try { this.ws.onclose = null; this.ws.close(); } catch (e) {} }
      this.setStatus('connecting');
      const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws?room=' + encodeURIComponent(this.room));
      this.ws = ws;
      ws.onopen = () => {
        const me = store.get('me', {});
        ws.send(JSON.stringify({ t: 'join', room: this.room, id: this.id, token: this.token, name: this.opts.name || me.name, emoji: this.opts.emoji || me.emoji, role: this.role, hostKey: this.opts.hostKey }));
      };
      ws.onmessage = (e) => {
        const m = JSON.parse(e.data);
        if (m.t === 'ping') { ws.send(JSON.stringify({ t: 'pong', k: m.k })); return; }
        if (m.t === 'welcome') {
          this.id = m.id; this.token = m.token; this.retry = 0;
          store.set('s:' + this.room, { id: m.id, token: m.token, role: this.role });
          store.set('last', { room: this.room, role: this.role, at: Date.now() });
          if (this.opts.hostKey) this.opts.hostKey = null;
          this.setStatus('open');
          this.emit('welcome', m);
          return;
        }
        if (m.t === 'error') { this.fatal = true; this.emit('error', m); return; }
        if (m.t === 'kicked' || m.t === 'replaced') { this.fatal = true; this.emit(m.t, m); return; }
        this.emit(m.t, m);
      };
      ws.onclose = () => {
        if (this.fatal || this.mode !== 'ws') { this.setStatus('closed'); return; }
        this.setStatus('reconnecting');
        this.retry++;
        this.rt = setTimeout(() => this._open(), Math.min(5000, 600 * this.retry));
      };
    },
    leave() {
      this.fatal = true;
      if (this.ws) { try { this.ws.close(); } catch (e) {} }
      if (this.room) store.del('s:' + this.room);
      store.del('last');
      this.mode = null; this.room = null; this.localRoom = null;
      this.setStatus('idle');
    },
    setStatus(s) { this.status = s; this.emit('status', s); },
    // ── الوضع التجريبي: نفس المحرك يعمل داخل المتصفح ──
    startLocal(name, emoji) {
      this.mode = 'local'; this.fatal = false;
      const room = new LammaEngine.Room('تجربة', {
        send: (id, msg) => { if (id === this.id) setTimeout(() => this.emit(msg.t, msg), 0); },
        rtt: () => 0, now: () => Date.now(),
      });
      this.localRoom = room; this.room = 'تجربة';
      const r = room.join({ name, emoji, role: 'player' });
      this.id = r.member.id; this.token = r.member.token;
      this.setStatus('open');
      this.emit('welcome', { id: this.id });
      room.changed();
    },
  };

  window.L = { h, $, ar, toast, sheet, confetti, vibrate, store, ACTS, CATS, Net };
})();
