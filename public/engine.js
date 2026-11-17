/* محرك «لمّة» — يعمل على الخادم (Node) وفي الوضع التجريبي داخل المتصفح.
   الخادم هو المرجع الوحيد: يفتح الجولات، يقبل الإجابات، ويحسب النقاط. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./more.js'));
  else root.LammaEngine = factory(root.LammaMore);
})(typeof self !== 'undefined' ? self : this, function (More) {
  'use strict';

  // ───────────── أدوات ─────────────
  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rnd(a.length)];
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const sample = (a, n) => shuffle(a).slice(0, n);

  // ───────────── المحتوى ─────────────
  const AVATARS = ['🦊', '🐼', '🐯', '🦁', '🐸', '🐵', '🐧', '🦉', '🐙', '🦄', '🐨', '🐰', '🐢', '🦋', '🐳', '🦩'];
  const COLORS = ['#FF5B4A', '#FFB627', '#19C2A0', '#3D8BFF', '#8A5CF6', '#FF7AB6', '#00A6D6', '#F97316', '#22C55E', '#E11D48', '#6366F1', '#A16207'];
  const POOL = ['🦊', '🐼', '🐯', '🦁', '🐸', '🐵', '🐧', '🦉', '🐙', '🦄', '🐨', '🐰', '🐢', '🦋', '🐞', '🦀', '🐳', '🦒', '🦓', '🐘', '🦔', '🦩', '🐝', '🦜',
    '🍉', '🍓', '🍒', '🍍', '🥝', '🍋', '🍇', '🍑', '🥥', '🍌', '🫐', '🥭', '⚽', '🎈', '🎁', '🪁', '🎲', '🧩', '🎨', '🚀', '⛵', '🏰', '🎺', '🌵', '🍄', '🌈', '🍩', '🧁', '🍦', '🌮'];
  const PAIRS = [['🍏', '🍎'], ['😀', '😃'], ['😄', '😁'], ['🐶', '🐕'], ['🐱', '🐈'], ['🌕', '🌝'], ['⭐', '🌟'], ['🐟', '🐠'], ['🙂', '🙃'], ['🟠', '🟡'], ['🔵', '🟣'], ['💚', '💙'], ['🐻', '🐨'], ['🍊', '🍑'], ['🌼', '🌻'], ['🚗', '🚙'], ['🐌', '🐛'], ['🌙', '🌛'], ['❤️', '🧡'], ['🦆', '🐤'], ['🍪', '🥯'], ['🐝', '🪲'], ['🥨', '🥐'], ['🐬', '🐳'], ['🐯', '🦁'], ['🌲', '🌳']];
  const HARMONY = [
    ['أكلة غداء الجمعة', [['🍛', 'كبسة'], ['🍗', 'مندي'], ['🥘', 'مرقوق'], ['🍚', 'برياني'], ['🐟', 'سمك'], ['🍕', 'بيتزا']]],
    ['أحسن مشروب مع الجلسة', [['☕', 'قهوة عربية'], ['🍵', 'شاي'], ['🫖', 'كرك'], ['🧃', 'عصير'], ['🥤', 'غازي']]],
    ['طلعة الويكند', [['🏜️', 'البر'], ['🏖️', 'البحر'], ['🛍️', 'المول'], ['🏡', 'الاستراحة'], ['🍽️', 'مطعم'], ['🛋️', 'البيت']]],
    ['حيوان يشبه جمعتنا', [['🐪', 'جمل'], ['🐱', 'قطو'], ['🦅', 'صقر'], ['🐧', 'بطريق'], ['🐻', 'دب'], ['🐰', 'أرنب']]],
    ['حلا الضيافة', [['🌴', 'تمر'], ['🍰', 'بسبوسة'], ['🍩', 'لقيمات'], ['🍫', 'شوكولاتة'], ['🍦', 'آيسكريم'], ['🍮', 'كريم كراميل']]],
    ['أحلى فصل', [['❄️', 'شتاء'], ['☀️', 'صيف'], ['🌸', 'ربيع'], ['🍂', 'خريف']]],
    ['لون يشبهنا', [['🔴', 'أحمر'], ['🟡', 'أصفر'], ['🟢', 'أخضر'], ['🔵', 'أزرق'], ['🟣', 'بنفسجي'], ['🟠', 'برتقالي']]],
    ['اختر رقم', [['1️⃣', 'واحد'], ['2️⃣', 'اثنين'], ['3️⃣', 'ثلاثة'], ['4️⃣', 'أربعة'], ['5️⃣', 'خمسة']]],
    ['فاكهة الصيف', [['🍉', 'بطيخ'], ['🥭', 'مانجو'], ['🍇', 'عنب'], ['🍓', 'فراولة'], ['🍑', 'خوخ']]],
    ['لعبة الطفولة', [['🙈', 'الغميمة'], ['⚽', 'كورة'], ['🚗', 'سيارات'], ['🎮', 'بلايستيشن'], ['🪁', 'طيارة ورق'], ['🧩', 'بزل']]],
    ['أول شي الصبح', [['📱', 'الجوال'], ['☕', 'قهوة'], ['🏃', 'رياضة'], ['🍳', 'فطور'], ['😴', 'نومة ثانية']]],
    ['عشاء آخر الليل', [['🌯', 'شاورما'], ['🍔', 'برجر'], ['🍕', 'بيتزا'], ['🫘', 'فول'], ['🫓', 'تميس']]],
    ['الرحلة الجاية', [['🏜️', 'العلا'], ['⛰️', 'أبها'], ['🌊', 'جدة'], ['🏙️', 'دبي'], ['🕌', 'إسطنبول'], ['🏝️', 'جزيرة']]],
    ['صوت جمعتنا', [['😂', 'ضحك'], ['🗣️', 'سوالف'], ['🎶', 'أغاني'], ['📢', 'إزعاج'], ['🤫', 'هدوء']]],
    ['أحلى مكان بالبيت', [['🛋️', 'المجلس'], ['🍳', 'المطبخ'], ['🌙', 'السطح'], ['🌳', 'الحوش'], ['🛏️', 'غرفتي']]],
    ['شكل الغيمة', [['❤️', 'قلب'], ['⭐', 'نجمة'], ['🐱', 'قطة'], ['🐟', 'سمكة'], ['✈️', 'طيارة']]],
    ['قوة خارقة تبيها', [['🦸', 'طيران'], ['👻', 'اختفاء'], ['⏱️', 'إيقاف الوقت'], ['🧠', 'قراءة أفكار'], ['🌍', 'انتقال فوري']]],
    ['وقت النوم بالإجازة', [['🌙', '١٠ بالليل'], ['🕛', '١٢ بالليل'], ['🦉', '٢ الفجر'], ['🌅', 'مع الشروق'], ['😵', 'ما ننام']]],
    ['هدية تفرحك', [['🌹', 'ورد'], ['📚', 'كتاب'], ['⌚', 'ساعة'], ['🍫', 'شوكولاتة'], ['✈️', 'تذكرة سفر'], ['💐', 'عطر']]],
    ['رياضة تتابعها', [['⚽', 'كورة'], ['🏎️', 'سباقات'], ['🎾', 'تنس'], ['🏀', 'سلة'], ['🐎', 'خيل'], ['🚫', 'ولا شي']]],
  ];
  // ───────────── تعريف الأنشطة ─────────────
  const ACT = {};

  // إطار الجولات التنافسية
  const PREP_MS = 2800, COUNT_MS = 3000, RESULT_MS = 4200;

  // ===== وين الكرة؟ =====
  ACT.cups = {
    id: 'cups', type: 'compete', mode: 'firstCorrect',
    rounds(practice) {
      const L = practice ? [{ n: 3, s: 4, ms: 620 }] : [{ n: 3, s: 5, ms: 560 }, { n: 3, s: 8, ms: 440 }, { n: 4, s: 9, ms: 400 }, { n: 4, s: 12, ms: 330 }, { n: 5, s: 14, ms: 290 }];
      return L.map((d) => {
        const swaps = [];
        let ball = rnd(d.n), last = null;
        const start = ball;
        for (let i = 0; i < d.s; i++) {
          let a, b;
          do { a = rnd(d.n); b = rnd(d.n); } while (a === b || (last && ((last[0] === a && last[1] === b) || (last[0] === b && last[1] === a))));
          swaps.push([a, b]); last = [a, b];
          if (ball === a) ball = b; else if (ball === b) ball = a;
        }
        return { n: d.n, swaps, swapMs: d.ms, start, answer: ball, title: 'جولة ' + d.n + ' أكواب', hint: 'ركّز على الكوب اللي تحته الكرة' };
      });
    },
    showMs: (r) => 2200 + r.swaps.length * r.swapMs + 250,
    openMs: () => 9000,
    check: (r, c) => c === r.answer,
    pub(r, sub) { return { n: r.n, swaps: sub === 'show' || sub === 'open' || sub === 'result' ? r.swaps : null, swapMs: r.swapMs, start: r.start, answer: sub === 'result' ? r.answer : null, title: r.title, hint: r.hint }; },
  };

  // ===== اقلبها وسبقهم =====
  const CARD_TYPES = {
    match: { title: 'طابق الرمز', hint: 'اضغط البطاقة اللي تطابق الرمز بالأعلى', icon: '🎯' },
    odd: { title: 'مين المختلف؟', hint: 'كل البطاقات متشابهة إلا وحدة.. لقها!', icon: '🔍' },
    memory: { title: 'تذكّر المكان', hint: 'احفظ أماكن الصور.. بتنقلب وتسأل عن وحدة', icon: '🧠' },
  };
  ACT.cards = {
    id: 'cards', type: 'compete', mode: 'firstCorrect',
    rounds(practice) {
      const L = practice ? [{ t: 'match', n: 6 }] : [{ t: 'match', n: 8 }, { t: 'odd', n: 9 }, { t: 'memory', n: 6, mem: 3800 }, { t: 'match', n: 12, hard: true }, { t: 'odd', n: 12, hard: true }, { t: 'memory', n: 8, mem: 3400 }];
      return L.map((d) => {
        let cards, answer, target = null, mem = 0;
        if (d.t === 'match') {
          const pair = pick(PAIRS);
          target = pair[0];
          const others = sample(POOL.filter((e) => e !== pair[0] && e !== pair[1]), d.n - (d.hard ? 2 : 1));
          cards = shuffle([pair[0]].concat(d.hard ? [pair[1]] : [], others));
          answer = cards.indexOf(target);
        } else if (d.t === 'odd') {
          const pair = shuffle(pick(PAIRS));
          answer = rnd(d.n);
          cards = Array.from({ length: d.n }, (_, i) => (i === answer ? pair[1] : pair[0]));
          if (!d.hard) { // في السهل نختار مختلفا أوضح
            const odd = pick(POOL.filter((e) => e !== pair[0]));
            cards[answer] = odd;
          }
        } else {
          cards = sample(POOL, d.n);
          answer = rnd(d.n);
          target = cards[answer];
          mem = d.mem;
        }
        const T = CARD_TYPES[d.t];
        return { kind: d.t, cards, answer, target, mem, title: T.title, hint: T.hint, icon: T.icon };
      });
    },
    showMs: (r) => (r.kind === 'memory' ? 700 + r.mem + 700 : 900),
    openMs: () => 10000,
    check: (r, c) => c === r.answer,
    pub(r, sub) {
      const o = { kind: r.kind, n: r.cards.length, title: r.title, hint: r.hint, icon: r.icon, mem: r.mem };
      if (sub === 'show' || sub === 'result' || (sub === 'open' && r.kind !== 'memory')) o.cards = r.cards;
      if (r.kind === 'match') o.target = sub === 'prep' ? null : r.target;
      if (r.kind === 'memory' && (sub === 'open' || sub === 'result')) o.target = r.target;
      if (sub === 'result') o.answer = r.answer;
      return o;
    },
  };

  // ===== وش تغيّر؟ =====
  ACT.changed = {
    id: 'changed', type: 'compete', mode: 'firstCorrect',
    rounds(practice) {
      const L = practice ? [{ n: 9, mem: 5000 }] : [{ n: 9, mem: 5000 }, { n: 12, mem: 4500 }, { n: 12, mem: 4200, subtle: true }, { n: 16, mem: 4200 }, { n: 16, mem: 3800, subtle: true }];
      return L.map((d) => {
        const before = sample(POOL, d.n);
        const idx = rnd(d.n);
        const after = before.slice();
        if (d.subtle) {
          const p = pick(PAIRS);
          before[idx] = p[0]; after[idx] = p[1];
        } else {
          after[idx] = pick(POOL.filter((e) => before.indexOf(e) < 0));
        }
        return { n: d.n, before, after, idx, mem: d.mem, title: d.subtle ? 'تغيير خفيف! 👀' : 'احفظ الشبكة', hint: 'عندك ' + Math.round(d.mem / 1000) + ' ثواني تحفظ فيها كل شيء' };
      });
    },
    showMs: (r) => r.mem + 1100,
    openMs: () => 12000,
    check: (r, c) => c === r.idx,
    pub(r, sub) {
      const o = { n: r.n, mem: r.mem, title: r.title, hint: r.hint };
      if (sub === 'show') o.grid = r.before;
      if (sub === 'open') o.grid = r.after;
      if (sub === 'result') { o.grid = r.after; o.before = r.before[r.idx]; o.answer = r.idx; }
      return o;
    },
  };

  // ===== لا تستعجل! =====
  ACT.reflex = {
    id: 'reflex', type: 'compete', mode: 'fastest',
    rounds(practice) {
      const n = practice ? 1 : 5;
      const out = [];
      for (let i = 0; i < n; i++) {
        const wait = 2200 + rnd(3600);
        const decoys = [];
        const nd = practice ? 0 : i < 1 ? 0 : i < 3 ? 1 : 2;
        for (let k = 0; k < nd; k++) decoys.push(600 + rnd(Math.max(400, wait - 1400)));
        decoys.sort((a, b) => a - b);
        out.push({ wait, decoys: decoys.filter((d, j) => j === 0 || d - decoys[j - 1] > 900), title: i === 0 ? 'انتظر الأخضر' : nd ? 'انتبه للخدع!' : 'انتظر الأخضر', hint: nd ? 'الأصفر خدعة.. اضغط مع الأخضر بس' : 'اضغط أول ما تشوف الأخضر' });
      }
      return out;
    },
    showMs: (r) => r.wait, // مدة مخفية
    hideShowDur: true,
    openMs: () => 2600,
    check: () => true,
    pub(r, sub, g, now) {
      let decoy = false;
      if (sub === 'show') { const e = now - g.subStart; decoy = r.decoys.some((d) => e >= d && e < d + 650); }
      return { title: r.title, hint: r.hint, decoy };
    },
  };

  // ===== قلب واحد (تعاوني) =====
  ACT.harmony = {
    id: 'harmony', type: 'coop', mode: 'collect',
    rounds(practice) {
      return sample(HARMONY, practice ? 1 : 6).map(([q, opts]) => ({ q, opts: opts.map(([e, l]) => ({ e, l })), title: q, hint: 'اختاروا نفس الجواب بدون كلام!' }));
    },
    showMs: () => 0,
    openMs: () => 15000,
    check: () => true,
    pub(r) { return { q: r.q, opts: r.opts, title: r.title, hint: r.hint }; },
  };

  Object.assign(ACT, More({ rnd, pick, shuffle, sample, POOL, PAIRS }));
  const ACT_ORDER = Object.keys(ACT);

  // ───────────── الغرفة ─────────────
  class Room {
    constructor(code, hooks) {
      this.code = code;
      this.hooks = hooks; // { send(memberId, obj), rtt(memberId), now() }
      this.players = new Map();
      this.displays = new Map();
      this.hostId = null;
      this.phase = 'lobby';
      this.plan = null; // {list, idx}
      this.game = null;
      this.lastResult = null;
      this.totals = {};
      this.timers = new Set();
      this.dirty = false;
      this.created = this.now();
      this.lastActive = this.now();
      this.hostGoneAt = null;
      this.colorIdx = 0;
    }
    now() { return this.hooks.now ? this.hooks.now() : Date.now(); }
    after(ms, fn) {
      const g = this.game;
      const h = setTimeout(() => { this.timers.delete(h); if (this.game === g) fn(); }, ms);
      this.timers.add(h);
      return h;
    }
    clearTimers() { this.timers.forEach(clearTimeout); this.timers.clear(); }
    changed() {
      if (this.dirty) return;
      this.dirty = true;
      setTimeout(() => { this.dirty = false; this.flush(); }, 0);
    }
    flush() {
      this.players.forEach((p) => { if (p.connected) this.hooks.send(p.id, { t: 'state', s: this.view(p.id) }); });
      this.displays.forEach((d) => { if (d.connected) this.hooks.send(d.id, { t: 'state', s: this.view(d.id) }); });
    }
    fx(name, to) {
      const msg = { t: 'fx', name };
      if (to) { this.hooks.send(to, msg); return; }
      this.players.forEach((p) => p.connected && this.hooks.send(p.id, msg));
      this.displays.forEach((d) => d.connected && this.hooks.send(d.id, msg));
    }
    member(id) { return this.players.get(id) || this.displays.get(id) || null; }
    connectedPlayers() { return [...this.players.values()].filter((p) => p.connected); }
    isHost(id) { return id && id === this.hostId; }

    // ── الدخول ──
    join(info) {
      this.lastActive = this.now();
      // عودة لنفس الجلسة
      if (info.id && info.token) {
        const m = this.member(info.id);
        if (m && m.token === info.token) {
          m.connected = true; m.leftAt = null;
          if (info.name && m.name !== undefined && m.name !== info.name && info.role !== 'display') m.name = this.uniqueName(info.name, m.id);
          if (info.emoji && m.emoji !== undefined) m.emoji = info.emoji;
          if (this.hostId === m.id) this.hostGoneAt = null;
          if (!this.hostId) this.hostId = m.id;
          this.changed();
          return { member: m, rejoined: true };
        }
      }
      const id = Math.random().toString(36).slice(2, 10);
      const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      let m;
      if (info.role === 'display') {
        m = { id, token, role: 'display', connected: true };
        this.displays.set(id, m);
      } else {
        if (this.players.size >= 12) return { error: 'الغرفة ممتلئة (١٢ لاعب)' };
        const name = this.uniqueName((info.name || 'لاعب').trim().slice(0, 16) || 'لاعب');
        const used = new Set([...this.players.values()].map((p) => p.emoji));
        const emoji = info.emoji && !used.has(info.emoji) ? info.emoji : AVATARS.find((a) => !used.has(a)) || pick(AVATARS);
        m = { id, token, role: 'player', name, emoji, color: COLORS[this.colorIdx++ % COLORS.length], connected: true, joinedAt: this.now() };
        this.players.set(id, m);
        if (this.totals[id] == null) this.totals[id] = 0;
      }
      if (!this.hostId || info.makeHost) this.hostId = id;
      this.changed();
      return { member: m, rejoined: false };
    }
    uniqueName(name, selfId) {
      let n = name, k = 2;
      const taken = (x) => [...this.players.values()].some((p) => p.name === x && p.id !== selfId);
      while (taken(n)) n = name + ' ' + k++;
      return n;
    }
    disconnect(id) {
      const m = this.member(id);
      if (!m) return;
      m.connected = false; m.leftAt = this.now();
      if (id === this.hostId) this.hostGoneAt = this.now();
      if (this.game && this.game.onLeave) this.game.onLeave(id);
      this.changed();
    }
    tick() { // يُستدعى دوريًا من الخادم
      if (this.hostId && this.hostGoneAt && this.now() - this.hostGoneAt > 45000) {
        const next = this.connectedPlayers().sort((a, b) => a.joinedAt - b.joinedAt)[0] || [...this.displays.values()].find((d) => d.connected);
        if (next) { this.hostId = next.id; this.hostGoneAt = null; this.changed(); }
      }
    }
    isEmptyFor(ms) {
      const any = [...this.players.values(), ...this.displays.values()].some((m) => m.connected);
      if (any) { this.lastActive = this.now(); return false; }
      return this.now() - this.lastActive > ms;
    }

    // ── رسائل ──
    handle(id, msg) {
      const m = this.member(id);
      if (!m) return;
      this.lastActive = this.now();
      const host = this.isHost(id);
      switch (msg.t) {
        case 'choose': // اختيار نشاط أو بطولة
          if (!host || (this.phase !== 'lobby' && this.phase !== 'activityEnd' && this.phase !== 'final' && this.phase !== 'intro')) return;
          {
            const list = (msg.list || []).filter((a) => ACT[a]);
            if (!list.length) return;
            this.clearTimers(); this.game = null;
            this.plan = { list, idx: 0, tournament: list.length > 1 };
            if (this.plan.tournament) { this.totals = {}; this.players.forEach((p) => (this.totals[p.id] = 0)); }
            this.opts = msg.opts || {};
            this.toIntro();
          }
          break;
        case 'start':
          if (!host || this.phase !== 'intro') return;
          this.startActivity(!!msg.practice);
          break;
        case 'next':
          if (!host) return;
          this.nextActivity();
          break;
        case 'skip': // إنهاء النشاط الحالي
          if (!host || this.phase !== 'game') return;
          if (this.game.practice) { this.clearTimers(); this.game = null; this.toIntro(true); } else this.endActivity();
          break;
        case 'lobby':
          if (!host) return;
          this.clearTimers(); this.game = null; this.plan = null; this.phase = 'lobby'; this.changed();
          break;
        case 'kick':
          if (!host || msg.id === id) return;
          if (this.players.has(msg.id)) {
            this.hooks.send(msg.id, { t: 'kicked' });
            this.players.get(msg.id).connected = false;
            this.players.delete(msg.id);
            if (this.game && this.game.onLeave) this.game.onLeave(msg.id, true);
            this.changed();
          }
          break;
        case 'makeHost':
          if (!host || !this.players.has(msg.id)) return;
          this.hostId = msg.id; this.hostGoneAt = null; this.changed();
          break;
        case 'rename':
          if (m.role === 'player' && msg.name) { m.name = this.uniqueName(String(msg.name).trim().slice(0, 16) || m.name, id); this.changed(); }
          break;
        default:
          if (this.phase === 'game' && this.game && this.game.action) this.game.action(id, msg, host);
      }
    }

    toIntro(practiceDone) {
      const a = this.plan.list[this.plan.idx];
      this.phase = 'intro';
      this.intro = { activity: a, practiceDone: !!practiceDone };
      this.changed();
    }
    startActivity(practice) {
      const a = this.plan.list[this.plan.idx];
      this.clearTimers();
      this.phase = 'game';
      this.game = new RoundGame(this, ACT[a], practice);
      this.game.begin();
      this.changed();
    }
    endActivity() {
      const g = this.game;
      if (!g) return;
      this.clearTimers();
      const def = ACT[g.id];
      const res = { activity: g.id, type: def.type };
      if (def.type === 'compete') {
        res.scores = Object.assign({}, g.scores);
        Object.keys(g.scores).forEach((pid) => { this.totals[pid] = (this.totals[pid] || 0) + g.scores[pid]; });
      } else if (def.type === 'coop') {
        res.harmony = g.teamPct();
        res.perfect = g.perfect;
        res.rounds = g.rounds.length;
      }
      this.lastResult = res;
      this.game = null;
      this.phase = 'activityEnd';
      this.fx(def.type === 'compete' ? 'fanfare' : 'cheer');
      this.changed();
    }
    nextActivity() {
      if (this.phase === 'game') return;
      if (this.plan && this.plan.idx < this.plan.list.length - 1 && this.phase === 'activityEnd') {
        this.plan.idx++;
        this.toIntro();
      } else if (this.plan && this.plan.tournament && this.phase === 'activityEnd') {
        this.phase = 'final';
        this.fx('fanfare');
        this.changed();
      } else {
        this.phase = 'lobby'; this.plan = null; this.changed();
      }
    }

    view(id) {
      const now = this.now();
      const m = this.member(id);
      const s = {
        code: this.code,
        you: m ? { id: m.id, role: m.role, isHost: this.isHost(id), name: m.name, emoji: m.emoji } : null,
        hostId: this.hostId,
        hostAway: !!this.hostGoneAt,
        players: [...this.players.values()].map((p) => ({ id: p.id, name: p.name, emoji: p.emoji, color: p.color, connected: p.connected, total: this.totals[p.id] || 0 })),
        displays: [...this.displays.values()].filter((d) => d.connected).length,
        phase: this.phase,
        plan: this.plan,
        intro: this.phase === 'intro' ? Object.assign({ opts: this.opts || {} }, this.intro) : null,
        result: this.phase === 'activityEnd' ? this.lastResult : null,
        totals: this.totals,
        game: this.phase === 'game' && this.game ? this.game.view(id, now) : null,
      };
      return s;
    }
  }

  // ───────────── محرك الجولات ─────────────
  class RoundGame {
    constructor(room, def, practice) {
      this.room = room; this.def = def; this.id = def.id; this.practice = practice;
      this.rounds = def.rounds(practice, room);
      this.idx = -1; this.sub = null; this.subStart = 0; this.subDur = 0;
      this.scores = {}; room.players.forEach((p) => (this.scores[p.id] = 0));
      this.answers = {}; this.winner = null; this.ranking = null;
      this.history = []; // نسبة الانسجام لكل جولة
      this.perfect = 0;
    }
    begin() { this.nextRound(); }
    setSub(sub, dur, then) {
      this.sub = sub; this.subStart = this.room.now(); this.subDur = dur;
      this.room.changed();
      if (then && dur != null) this.subTimer = this.room.after(dur, then);
    }
    nextRound() {
      this.idx++;
      if (this.idx >= this.rounds.length) {
        if (this.practice) { this.room.game = null; this.room.toIntro(true); return; }
        this.room.endActivity(); return;
      }
      this.answers = {}; this.winner = null; this.ranking = null; this.roundInfo = null;
      this.setSub('prep', PREP_MS, () => {
        this.setSub('count', COUNT_MS, () => this.show());
        this.room.fx('count');
      });
      this.room.fx('whoosh');
    }
    show() {
      const r = this.rounds[this.idx];
      const ms = this.def.showMs(r);
      if (ms > 0) {
        this.setSub('show', ms, () => this.open());
        this.room.fx(this.id === 'reflex' ? 'tense' : 'flip');
        if (this.id === 'reflex') r.decoys.forEach((d) => { this.room.after(d, () => { this.room.changed(); this.room.fx('decoy'); }); this.room.after(d + 660, () => this.room.changed()); });
      } else this.open();
    }
    open() {
      this.openedAt = this.room.now();
      this.setSub('open', this.def.openMs(this.rounds[this.idx]), () => this.resolve());
      this.room.fx(this.id === 'reflex' ? 'go' : 'open');
      this.checkAllAnswered();
    }
    eligible() { return this.room.connectedPlayers().filter((p) => !(this.answers[p.id] && this.answers[p.id].early)); }
    checkAllAnswered() {
      if (this.sub !== 'open' || this.def.mode === 'taps') return;
      const live = this.room.connectedPlayers();
      if (live.length && live.every((p) => this.answers[p.id])) {
        clearTimeout(this.subTimer); this.room.timers.delete(this.subTimer);
        this.room.after(350, () => { if (this.sub === 'open') this.resolve(); });
      }
    }
    action(id, msg) {
      const p = this.room.players.get(id);
      if (!p) return;
      const now = this.room.now();
      const r = this.rounds[this.idx];
      if (msg.t === 'tap' && this.def.mode === 'taps') {
        if (this.sub !== 'open') return;
        const a = this.answers[id] || (this.answers[id] = { count: 0, at: now, last: 0, ok: true });
        if (now - a.last < 45) return; // حد أقصى معقول للضغطات
        a.last = now; a.count++;
        this.room.changed();
        return;
      }
      if (msg.t !== 'answer') return;
      if (this.answers[id]) { this.room.hooks.send(id, { t: 'ack', ok: false, why: 'dup' }); return; }
      // لعبة رد الفعل: الضغط قبل الأخضر = خروج من الجولة
      if (this.id === 'reflex') {
        if (this.sub === 'show' || (this.sub === 'open' && msg.sawGo === false)) {
          this.answers[id] = { early: true, at: now };
          this.room.fx('buzz', id);
          this.room.changed();
          this.checkAllAnswered();
          return;
        }
      }
      if (this.sub !== 'open') { this.room.hooks.send(id, { t: 'ack', ok: false, why: 'closed' }); return; }
      const choice = msg.choice;
      if (this.id === 'harmony' && !(Number.isInteger(choice) && choice >= 0 && choice < r.opts.length)) return;
      if (this.def.valid && !this.def.valid(r, choice)) return;
      const ok = this.def.check(r, choice);
      const rtt = Math.min(400, Math.max(0, this.room.hooks.rtt ? this.room.hooks.rtt(id) || 0 : 0));
      const a = { choice, at: now, ok, ms: now - this.openedAt, adj: Math.max(60, now - this.openedAt - rtt) };
      this.answers[id] = a;
      if (this.def.mode === 'firstCorrect') {
        this.room.fx(ok ? 'correct' : 'wrong', id);
        if (ok && !this.winner) {
          this.winner = id;
          this.room.changed();
          clearTimeout(this.subTimer); this.room.timers.delete(this.subTimer);
          this.room.after(250, () => this.resolve());
          return;
        }
      } else {
        this.room.fx('tap', id);
      }
      this.room.changed();
      this.checkAllAnswered();
    }
    onLeave() { this.checkAllAnswered(); }
    resolve() {
      if (this.sub !== 'open') return;
      const r = this.rounds[this.idx];
      const gain = {};
      if (this.def.mode === 'firstCorrect') {
        if (this.winner) gain[this.winner] = 100;
      } else if (this.def.mode === 'fastest') {
        const list = Object.entries(this.answers).filter(([, a]) => !a.early && a.ok).sort((a, b) => a[1].adj - b[1].adj);
        this.ranking = list.map(([pid, a]) => ({ id: pid, ms: Math.round(a.adj) }));
        [100, 60, 30].forEach((pts, i) => { if (list[i]) gain[list[i][0]] = pts; });
        this.winner = list[0] ? list[0][0] : null;
      } else if (this.def.resolve) {
        const out = this.def.resolve(r, this.answers, this.room) || {};
        Object.assign(gain, out.gain || {});
        this.roundInfo = out.info || null;
        this.winner = out.winner || null;
        if (out.pct != null) { this.history.push(out.pct); if (out.pct === 100 && this.room.connectedPlayers().length > 1) this.perfect++; }
      } else if (this.def.mode === 'collect') {
        const counts = r.opts.map(() => 0);
        Object.values(this.answers).forEach((a) => counts[a.choice]++);
        const n = Math.max(1, this.room.connectedPlayers().length);
        const top = Math.max(...counts);
        const pct = Math.round((top / n) * 100);
        this.roundInfo = { counts, pct, top: counts.indexOf(top) };
        this.history.push(pct);
        if (pct === 100 && n > 1) this.perfect++;
      }
      if (!this.practice) Object.entries(gain).forEach(([pid, v]) => (this.scores[pid] = (this.scores[pid] || 0) + v));
      this.gain = gain;
      this.setSub('result', RESULT_MS + (this.def.mode === 'collect' ? 800 : 0), () => this.nextRound());
      if (this.def.type !== 'compete') this.room.fx(this.roundInfo && this.roundInfo.pct === 100 ? 'cheer' : 'chime');
      else if (this.def.mode === 'collect') this.room.fx('chime');
      else this.room.fx(this.winner ? 'win' : 'nobody');
    }
    teamPct() { return this.history.length ? Math.round(this.history.reduce((a, b) => a + b, 0) / this.history.length) : 0; }
    view(id, now) {
      const r = this.rounds[this.idx];
      const elapsed = now - this.subStart;
      const pub = this.def.pub(r, this.sub, this, now);
      const showAll = this.sub === 'result';
      const answers = {};
      Object.entries(this.answers).forEach(([pid, a]) => {
        if (showAll || pid === id) answers[pid] = { choice: a.choice, ok: this.def.mode === 'firstCorrect' || showAll ? a.ok : null, early: !!a.early, ms: a.adj != null ? Math.round(a.adj) : null, count: a.count };
        else answers[pid] = { done: true, early: !!a.early, count: a.count };
      });
      return {
        id: this.id, view: this.def.view || this.id, type: this.def.type, mode: this.def.mode, practice: this.practice,
        round: this.idx, rounds: this.rounds.length,
        sub: this.sub, elapsed, dur: this.def.hideShowDur && this.sub === 'show' ? null : this.subDur,
        r: pub, answers, winner: this.winner, ranking: showAll ? this.ranking : null, gain: showAll ? this.gain : null,
        info: showAll ? this.roundInfo : null, team: this.id === 'harmony' ? this.teamPct() : null,
        scores: this.scores,
      };
    }
  }

  return { Room, ACT, ACT_ORDER, AVATARS };
});
