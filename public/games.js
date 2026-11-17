/* واجهات الألعاب ذات الجولات: وين الكرة، اقلبها، وش تغيّر، لا تستعجل، قلب واحد */
(function () {
  'use strict';
  const { h, ar, toast, confetti, vibrate, Net, ACTS } = window.L;

  const CUP_SVG = (c) => `<svg viewBox="0 0 100 110"><path d="M14 6 H86 L76 104 H24 Z" fill="${c}" stroke="#22163B" stroke-width="5" stroke-linejoin="round"/><path d="M18 30 H82 M21 56 H79" stroke="#22163B" stroke-width="4" opacity=".9"/><path d="M19 30 H81 L79 56 H21 Z" fill="#fff" opacity=".85"/><ellipse cx="50" cy="6" rx="38" ry="5" fill="#22163B"/><path d="M30 64 L34 96" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".5"/></svg>`;
  const CUP_COLORS = ['#FF5B4A']; // لون واحد لكل الأكواب حتى ما يُحفظ اللون بدل متابعة الخلط

  class RoundView {
    constructor(app) { this.app = app; }
    now() { return this.app.st.game.elapsed + (performance.now() - this.app.recvAt); }
    pmap() { return Object.fromEntries(this.app.st.players.map((p) => [p.id, p])); }
    canPlay() { const st = this.app.st; return st.you && st.you.role === 'player'; }
    mount(el, st) {
      this.el = el;
      const g = st.game;
      this.roundIdx = g.round; this.sub = null; this.my = null;
      this.timer = h('i');
      this.hud = h('div', { class: 'hud' },
        h('span', { class: 'rnd' + (g.practice ? ' practice' : '') }, g.practice ? 'جولة تجريبية' : 'الجولة ' + ar(g.round + 1) + ' / ' + ar(g.rounds)),
        h('div', { class: 'timer' }, this.timer),
        h('span', { class: 'rnd' }, ACTS[g.id].icon));
      this.arena = h('div', { class: 'arena' });
      this.foot = h('div', { class: 'col', style: { gap: '8px', alignItems: 'center' } });
      this.bannerBox = h('div', { class: 'bannerbox' });
      el.innerHTML = '';
      el.append(h('div', { class: 'stage' }, this.hud, this.arena, this.bannerBox, this.foot));
      this.loop = () => { this.tick(); this.raf = requestAnimationFrame(this.loop); };
      this.raf = requestAnimationFrame(this.loop);
      this.update(st);
    }
    destroy() { cancelAnimationFrame(this.raf); clearTimeout(this.cntT); }
    update(st) {
      const g = st.game;
      if (g.sub !== this.sub) { this.sub = g.sub; this.renderSub(st); }
      else this.refresh(st);
    }
    tick() {
      const g = this.app.st.game; if (!g) return;
      const t = this.now();
      if (g.dur && (g.sub === 'open' || g.sub === 'count' || g.sub === 'show' || g.sub === 'prep')) {
        const f = Math.max(0, 1 - t / g.dur);
        this.timer.style.transform = `scaleX(${f})`;
        this.timer.style.background = g.sub === 'open' ? (f < 0.25 ? 'var(--coral)' : 'var(--mint)') : 'var(--mango)';
      } else if (g.sub === 'result') this.timer.style.transform = 'scaleX(0)';
      else this.timer.style.transform = 'scaleX(1)';
      if (g.sub === 'count' && this.cnt) {
        const n = Math.max(1, 3 - Math.floor(t / 1000));
        if (this.cnt.textContent !== ar(n)) { this.cnt.textContent = ar(n); this.cnt.style.animation = 'none'; void this.cnt.offsetWidth; this.cnt.style.animation = ''; }
      }
      if (this.anim) this.anim(t);
    }
    renderSub(st) {
      const g = st.game, r = g.r;
      this.anim = null; this.cnt = null;
      this.foot.innerHTML = ''; this.bannerBox.innerHTML = '';
      if (g.sub === 'prep' || g.sub === 'count') { this.arena.innerHTML = ''; this.table = null; this.cardEls = null; this.tiles = null; this.btn = null; this.optEls = null; this.ow = null; this.np = null; this.pads = null; this.tb = null; }
      if (g.sub === 'prep') {
        const icon = r.icon || ACTS[g.id].icon;
        this.arena.append(h('div', { class: 'prep' },
          h('span', { class: 'rl' }, g.practice ? 'تجربة' : 'الجولة ' + ar(g.round + 1)),
          h('div', { class: 'ic' }, icon), h('h2', null, r.title || ACTS[g.id].name), h('p', null, r.hint || '')));
        return;
      }
      if (g.sub === 'count') {
        this.cnt = h('div', { class: 'count' }, '٣');
        const extra = g.id === 'cards' && r.kind === 'match' && r.target ? h('div', { class: 'target' }, 'ابحث عن', h('span', { class: 'e' }, r.target)) : g.id === 'harmony' ? h('div', { class: 'q' }, r.q) : null;
        this.arena.append(h('div', { class: 'col', style: { alignItems: 'center' } }, extra, this.cnt));
        return;
      }
      this[g.view](st, false);
      this.footer(st);
      if (g.sub === 'result') this.resultBanner(st);
    }
    refresh(st) {
      const g = st.game;
      if (g.sub === 'show' || g.sub === 'open' || g.sub === 'result') { this[g.view](st, false); this.footer(st); }
    }
    answer(choice, extra) {
      if (!this.canPlay()) return;
      const g = this.app.st.game;
      if (g.answers[this.app.st.you.id] || this.my != null) return;
      if (g.sub !== 'open' && g.id !== 'reflex') { toast('استنى لين تنفتح الإجابات ✋'); return; }
      this.my = choice;
      Net.send(Object.assign({ t: 'answer', choice }, extra || {}));
      Sound.play('tap'); vibrate(15);
      this.refresh(this.app.st);
    }
    myAns() { const st = this.app.st; return st.you ? st.game.answers[st.you.id] : null; }
    footer(st) {
      const g = st.game;
      this.foot.innerHTML = '';
      if ((g.sub === 'open' || g.sub === 'show') && g.mode !== 'taps') {
        const row = h('div', { class: 'answered-row' }, st.players.filter((p) => p.connected).map((p) => {
          const a = g.answers[p.id];
          return h('span', { class: (a ? 'done' : '') + (a && (a.early || a.ok === false) ? ' bad' : ''), title: p.name }, p.emoji);
        }));
        const me = this.myAns();
        let msg = '';
        if (!this.canPlay()) msg = g.sub === 'open' ? 'الإجابات مفتوحة!' : '';
        else if (me && me.early) msg = 'استعجلت! 😬 انتظر الجولة الجاية';
        else if (me && me.ok === false && g.mode === 'firstCorrect') msg = 'غلط.. 😅 خلّك للجولة الجاية';
        else if (me && me.ok && g.mode === 'firstCorrect') msg = 'صح! ⚡';
        else if (me) msg = 'تم ✓ ننتظر الباقين';
        else if (g.sub === 'open') msg = g.type !== 'compete' || g.mode === 'collect' ? 'اختر جوابك 💭' : g.id === 'reflex' || g.view === 'clock' ? '' : 'اختيار واحد بس!';
        this.foot.append(h('div', { class: 'hint-line' }, msg), row);
      }
      this.foot.append(this.miniScores(st));
    }
    miniScores(st) {
      const g = st.game;
      if (g.type !== 'compete' || g.practice) return h('span');
      const pm = this.pmap();
      const list = Object.entries(g.scores).filter(([id]) => pm[id]).sort((a, b) => b[1] - a[1]);
      const top = list.length ? list[0][1] : 0;
      return h('div', { class: 'mini-scores' }, list.map(([id, s]) => h('span', { class: 'ms' + (s === top && s > 0 ? ' lead' : '') }, h('span', { class: 'e' }, pm[id].emoji), ar(s), g.gain && g.gain[id] ? h('span', { class: 'plus' }, ' +' + ar(g.gain[id])) : null)));
    }
    resultBanner(st) {
      const g = st.game, pm = this.pmap();
      const you = st.you && st.you.id;
      let node;
      if (g.mode === 'firstCorrect') {
        const w = pm[g.winner];
        if (w) {
          node = h('div', { class: 'banner' }, h('div', { class: 'big' }, w.emoji), h('h2', null, (w.id === you ? 'أنت فزت بالجولة!' : w.name + ' سبق الكل!')), g.practice ? h('span', { class: 'muted' }, 'جولة تجريبية بدون نقاط') : h('span', { class: 'tag', style: { background: 'var(--mango)', fontSize: '18px' } }, '+١٠٠'));
          if (w.id === you) { confetti(80); vibrate([30, 40, 60]); }
        } else node = h('div', { class: 'banner' }, h('div', { class: 'big' }, '🤷'), h('h2', null, 'ما أحد جابها!'), h('span', { class: 'muted' }, 'الجولة الجاية أصعب 😏'));
      } else if (g.mode === 'fastest') {
        const rk = g.ranking || [];
        const early = Object.entries(g.answers).filter(([, a]) => a.early).map(([id]) => pm[id]).filter(Boolean);
        node = h('div', { class: 'banner', style: { position: 'relative', marginTop: '10px' } },
          h('h2', null, rk.length ? (rk[0].id === you ? 'أنت الأسرع! ⚡' : (pm[rk[0].id] || {}).name + ' الأسرع! ⚡') : 'كلكم استعجلتوا 😂'),
          h('div', { class: 'rank' }, rk.map((x, i) => { const p = pm[x.id] || {}; return h('div', { class: 'it' + (i === 0 ? ' first' : ''), style: { animationDelay: i * 0.12 + 's' } }, h('span', { class: 'p' }, ar(i + 1)), h('span', { class: 'e' }, p.emoji), p.name, h('span', { class: 'v' }, x.ms + ' ms'), g.gain && g.gain[x.id] && !g.practice ? h('b', { style: { color: 'var(--mint)' } }, '+' + ar(g.gain[x.id])) : null); }),
            early.map((p) => h('div', { class: 'it', style: { background: '#ffd2cd' } }, h('span', { class: 'p' }, '✋'), h('span', { class: 'e' }, p.emoji), p.name, h('span', { class: 'v' }, 'استعجل')))),
          h('small', { class: 'muted' }, 'الزمن محسوب على الخادم مع تعويض سرعة اتصال كل جهاز'));
        if (rk[0] && rk[0].id === you) confetti(70);
        this.arena.innerHTML = '';
        this.arena.append(node);
        return;
      } else if ((g.mode === 'closest' || g.mode === 'taps') && g.info) {
        const rk = g.info.rank || [];
        node = h('div', { class: 'banner' },
          h('h2', null, rk[0] ? (rk[0].id === you ? 'أنت الأقرب! 🎯' : (pm[rk[0].id] || {}).name + (g.mode === 'taps' ? ' أسرع إصبع! 👆' : ' الأقرب! 🎯')) : 'ما أحد جاوب 🤷'),
          g.info.target ? h('div', { class: 'target' }, 'الصحيح:', h('b', { class: 'e', style: { fontSize: '30px' } }, g.info.target)) : null,
          h('div', { class: 'rank' }, rk.map((x, i) => { const p = pm[x.id] || {}; return h('div', { class: 'it' + (i === 0 ? ' first' : ''), style: { animationDelay: i * 0.1 + 's' } }, h('span', { class: 'p' }, ar(i + 1)), h('span', { class: 'e' }, p.emoji), p.name, h('span', { class: 'v' }, String(x.v) + (g.info.unit || '')), g.gain && g.gain[x.id] && !g.practice ? h('b', { style: { color: 'var(--mint)' } }, '+' + ar(g.gain[x.id])) : null); })));
        if (rk[0] && rk[0].id === you) confetti(70);
      } else if (g.info && g.info.kind === 'vote') {
        const o = g.info.top >= 0 ? g.r.opts[g.info.top] : null;
        node = h('div', { class: 'banner' }, h('div', { class: 'big' }, o ? o.e : '🤝'), h('h2', null, o ? 'اللقب يروح لـ ' + o.t + '! 😂' : 'تعادل! محد ياخذ اللقب 😅'));
        confetti(50);
      } else if (g.info && g.info.kind === 'majority') {
        const o = g.info.top >= 0 ? g.r.opts[g.info.top] : null;
        const winners = Object.keys(g.gain || {}).map((id) => pm[id]).filter(Boolean);
        node = h('div', { class: 'banner' }, h('h2', null, o ? 'الأغلبية: ' + o.t : 'تعادل! ٥٠ نقطة للكل'), h('div', { style: { fontSize: '28px' } }, winners.map((p) => p.emoji).join(' ') || '—'), h('small', { class: 'muted' }, winners.some((p) => p.id === you) ? 'كنت مع الأغلبية ✓' : you && pm[you] ? 'خالفت الأغلبية 😅' : ''));
      } else if (g.mode === 'collect' && g.info && g.info.kind === 'unique') {
        const pct = g.info.pct;
        node = h('div', { class: 'banner' }, h('div', { class: 'big' }, pct === 100 ? '🙌' : '😬'), h('h2', null, pct === 100 ? 'ولا أحد تشابه! 👏' : 'فيه تشابه!'), h('div', { class: 'meter' }, h('i', { style: { width: pct + '%' } }), h('b', null, 'نجاح الجولة ' + ar(pct) + '٪')));
        if (pct === 100) confetti(90);
      } else if (g.mode === 'collect') {
        const pct = g.info ? g.info.pct : 0;
        node = h('div', { class: 'banner' }, h('div', { class: 'big' }, pct === 100 ? '💞' : pct >= 60 ? '😊' : '🙃'),
          h('h2', null, pct === 100 ? 'قلب واحد! كلكم نفس الجواب' : pct >= 60 ? 'قريبين من بعض!' : 'كل واحد بوادي 😂'),
          h('div', { class: 'meter' }, h('i', { style: { width: pct + '%' } }), h('b', null, 'انسجام الجولة ' + ar(pct) + '٪')));
        if (pct === 100) confetti(90);
      }
      this.bannerBox.append(node);
    }

    // ═════ وين الكرة؟ ═════
    cups(st, fresh) {
      const g = st.game, r = g.r, n = r.n;
      if (fresh || !this.table) {
        this.table = h('div', { class: 'table' });
        this.cupEls = []; this.ball = h('div', { class: 'ball' });
        this.table.append(this.ball);
        for (let i = 0; i < n; i++) {
          const c = h('div', { class: 'cup', html: CUP_SVG(CUP_COLORS[i % CUP_COLORS.length]), onclick: () => { if (this.app.st.game.sub === 'open') this.answer(this.slotOf[i]); } });
          c.style.width = Math.min(20, 70 / n) + '%';
          this.cupEls.push(c); this.table.append(c);
        }
        this.ball.style.width = Math.min(9, 32 / n) + '%';
        this.arena.innerHTML = ''; this.arena.append(this.table);
        this.lastK = -1;
        this.anim = (t) => this.cupsAnim(t);
      }
      const sx = (slot) => (100 * (slot + 0.5)) / n;
      const me = this.myAns();
      const my = me ? me.choice : this.my;
      this.cupEls.forEach((c) => { c.classList.remove('pick'); const w = c.querySelector('.who'); if (w) w.remove(); });
      if (g.sub === 'open' || g.sub === 'result') {
        this.cupsFinal();
        this.cupEls.forEach((c, id) => {
          const slot = this.slotOf[id];
          if (my === slot) c.classList.add('pick');
          if (g.sub === 'result') {
            const who = Object.entries(g.answers).filter(([, a]) => a.choice === slot).map(([pid]) => (this.pmap()[pid] || {}).emoji);
            if (who.length) c.append(h('div', { class: 'who' }, who.join('')));
          }
        });
        if (g.sub === 'result') {
          const ballCup = this.cupAtSlot[r.answer];
          this.ball.style.left = `calc(${sx(r.answer)}% - ${parseFloat(this.ball.style.width) / 2}%)`;
          this.ball.style.left = sx(r.answer) + '%'; this.ball.style.transform = 'translateX(-50%)';
          this.ball.style.opacity = 1;
          const c = this.cupEls[ballCup];
          c.animate([{ transform: 'translateX(-50%) translateY(0)' }, { transform: 'translateX(-50%) translateY(-75%) rotate(-8deg)' }], { duration: 500, fill: 'forwards', easing: 'cubic-bezier(.2,1.5,.4,1)' });
        }
      }
    }
    cupsState(k) { // مواقع الأكواب بعد k تبديلات
      const r = this.app.st.game.r, n = r.n;
      const cupAtSlot = Array.from({ length: n }, (_, i) => i);
      for (let i = 0; i < k && r.swaps && i < r.swaps.length; i++) { const [a, b] = r.swaps[i]; [cupAtSlot[a], cupAtSlot[b]] = [cupAtSlot[b], cupAtSlot[a]]; }
      const slotOf = []; cupAtSlot.forEach((c, s) => (slotOf[c] = s));
      return { cupAtSlot, slotOf };
    }
    cupsFinal() {
      const r = this.app.st.game.r;
      const s = this.cupsState(r.swaps ? r.swaps.length : 0);
      this.cupAtSlot = s.cupAtSlot; this.slotOf = s.slotOf;
      const n = r.n;
      this.cupEls.forEach((c, id) => { c.style.left = (100 * (s.slotOf[id] + 0.5)) / n + '%'; c.style.transform = 'translateX(-50%)'; c.style.zIndex = 2; });
      this.ball.style.opacity = 0;
      this.anim = null;
    }
    cupsAnim(t) {
      const g = this.app.st.game; if (g.sub !== 'show') return;
      const r = g.r, n = r.n;
      const sx = (slot) => (100 * (slot + 0.5)) / n;
      let lift = 0;
      if (t < 900) lift = 1; else if (t < 1700) lift = 1 - (t - 900) / 800; else lift = 0;
      lift = lift * lift * (3 - 2 * lift);
      const T = t - 2200;
      const k = T < 0 ? 0 : Math.min(r.swaps.length, Math.floor(T / r.swapMs));
      const p = T < 0 ? 0 : k >= r.swaps.length ? 0 : (T - k * r.swapMs) / r.swapMs;
      const s = this.cupsState(k);
      this.slotOf = s.slotOf; this.cupAtSlot = s.cupAtSlot;
      if (k !== this.lastK && T >= 0 && k < r.swaps.length) { this.lastK = k; Sound.play('swap'); }
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const sw = k < r.swaps.length && T >= 0 ? r.swaps[k] : null;
      this.cupEls.forEach((c, id) => {
        let slot = s.slotOf[id], x = sx(slot), y = 0, z = 2, sc = 1;
        if (sw && (slot === sw[0] || slot === sw[1])) {
          const to = slot === sw[0] ? sw[1] : sw[0];
          x = sx(slot) + (sx(to) - sx(slot)) * e;
          const up = slot === sw[0];
          y = Math.sin(e * Math.PI) * (up ? -22 : 10); sc = up ? 1 - Math.sin(e * Math.PI) * 0.08 : 1 + Math.sin(e * Math.PI) * 0.08; z = up ? 1 : 3;
        }
        c.style.left = x + '%';
        c.style.zIndex = z;
        c.style.transform = `translateX(-50%) translateY(${y - lift * 80}%) scale(${sc})`;
      });
      this.ball.style.left = sx(r.start) + '%'; this.ball.style.transform = 'translateX(-50%)';
      this.ball.style.opacity = t < 1750 ? 1 : 0;
    }

    // ═════ اقلبها وسبقهم ═════
    cards(st, fresh) {
      const g = st.game, r = g.r, n = r.n;
      const cols = n <= 6 ? 3 : n === 9 ? 3 : 4;
      if (fresh || !this.cardEls) {
        this.cardWrap = h('div', { class: 'col', style: { alignItems: 'center', width: '100%' } });
        this.head = h('div');
        this.grid = h('div', { class: 'cards', style: { gridTemplateColumns: `repeat(${cols}, 1fr)`, maxWidth: n > 9 ? '560px' : '460px' } });
        this.cardEls = Array.from({ length: n }, (_, i) => {
          const c = h('div', { class: 'fcard', onclick: () => this.answer(i) }, h('div', { class: 'back' }), h('div', { class: 'front' }));
          this.grid.append(c); return c;
        });
        this.cardWrap.append(this.head, this.grid);
        this.arena.innerHTML = ''; this.arena.append(this.cardWrap);
        this.flipped = -1;
        this.anim = (t) => {
          const gg = this.app.st.game; if (gg.sub !== 'show') return;
          const up = gg.r.kind === 'memory' ? t > 300 && t < 700 + gg.r.mem : t > 150;
          const state = up ? 1 : 0;
          if (state !== this.flipped) { this.flipped = state; this.cardEls.forEach((c, i) => setTimeout(() => c.classList.toggle('up', !!state), i * 35)); Sound.play('flip'); }
        };
      }
      // الرأس
      this.head.innerHTML = '';
      if (r.kind === 'match' && r.target) this.head.append(h('div', { class: 'target' }, 'اضغط', h('span', { class: 'e' }, r.target)));
      else if (r.kind === 'odd') this.head.append(h('div', { class: 'target' }, '🔍 لقِ المختلف'));
      else if (r.kind === 'memory') this.head.append(g.sub === 'show' ? h('div', { class: 'target' }, '🧠 احفظ الأماكن!') : h('div', { class: 'target' }, 'وين كان', h('span', { class: 'e' }, r.target || '❔'), '؟'));
      const me = this.myAns(); const my = me ? me.choice : this.my;
      const pm = this.pmap();
      this.cardEls.forEach((c, i) => {
        if (r.cards) c.lastChild.textContent = r.cards[i];
        c.classList.remove('good', 'bad', 'mine', 'down');
        const w = c.querySelector('.who'); if (w) w.remove();
        if (g.sub === 'open') { c.classList.toggle('up', r.kind !== 'memory'); }
        if (g.sub === 'result') { c.classList.add('up'); if (i === r.answer) c.classList.add('good'); }
        if (my === i) { c.classList.add('mine'); if (!c.classList.contains('up')) c.classList.add('down'); if (me && me.ok === false) c.classList.add('bad'); }
        if (g.sub === 'result') {
          const who = Object.entries(g.answers).filter(([, a]) => a.choice === i).map(([pid]) => (pm[pid] || {}).emoji);
          if (who.length) c.append(h('span', { class: 'who' }, who.join('')));
          if (i !== r.answer && who.length) c.classList.add('bad');
        }
      });
    }

    // ═════ وش تغيّر؟ ═════
    changed(st, fresh) {
      const g = st.game, r = g.r, n = r.n;
      const cols = n === 9 ? 3 : 4;
      if (fresh || !this.tiles) {
        this.ring = h('div', { class: 'target' }, '👀 احفظ!', h('b', { class: 'e', style: { fontSize: '30px', minWidth: '40px' } }, ''));
        this.grid = h('div', { class: 'grid9', style: { gridTemplateColumns: `repeat(${cols}, 1fr)`, maxWidth: cols === 3 ? '420px' : '520px' } });
        this.tiles = Array.from({ length: n }, (_, i) => { const t = h('div', { class: 'tile', onclick: () => this.answer(i) }); this.grid.append(t); return t; });
        this.arena.innerHTML = '';
        this.arena.append(h('div', { class: 'col', style: { alignItems: 'center', width: '100%' } }, this.ring, this.grid));
        this.blank = null;
        this.anim = (t) => {
          const gg = this.app.st.game; if (gg.sub !== 'show') return;
          const left = Math.ceil((gg.r.mem - t) / 1000);
          const b = t >= gg.r.mem;
          this.ring.lastChild.textContent = b ? '' : ar(Math.max(0, left));
          this.ring.firstChild.textContent = b ? '🙈 غمّض…' : '👀 احفظ!';
          if (b !== this.blank) { this.blank = b; this.tiles.forEach((x) => x.classList.toggle('blank', b)); if (b) Sound.play('whoosh'); }
        };
      }
      const me = this.myAns(); const my = me ? me.choice : this.my;
      if (g.sub === 'open') { this.ring.firstChild.textContent = '🔍 وش تغيّر؟'; this.ring.lastChild.textContent = ''; }
      if (g.sub === 'result') { this.ring.innerHTML = ''; this.ring.append('كان ', h('span', { class: 'e' }, r.before || ''), ' وصار ', h('span', { class: 'e' }, (r.grid || [])[r.answer] || '')); }
      const pm = this.pmap();
      this.tiles.forEach((t, i) => {
        if (r.grid) t.textContent = r.grid[i];
        if (g.sub !== 'show') t.classList.remove('blank');
        t.classList.remove('good', 'bad', 'mine');
        if (my === i) { t.classList.add('mine'); if (me && me.ok === false) t.classList.add('bad'); }
        if (g.sub === 'result') {
          if (i === r.answer) t.classList.add('good');
          const who = Object.entries(g.answers).filter(([, a]) => a.choice === i).map(([pid]) => (pm[pid] || {}).emoji);
          if (who.length) { t.append(h('span', { class: 'who' }, who.join(''))); if (i !== r.answer) t.classList.add('bad'); }
        }
      });
    }

    // ═════ لا تستعجل! ═════
    reflex(st, fresh) {
      const g = st.game, r = g.r;
      if (g.sub === 'result') { this.arena.innerHTML = ''; return; }
      if (fresh || !this.btn) {
        this.btn = h('div', { class: 'reflex idle' }, '');
        this.btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          const gg = this.app.st.game;
          if (!this.canPlay() || this.my != null || gg.answers[this.app.st.you.id]) return;
          if (gg.sub !== 'show' && gg.sub !== 'open') return;
          this.my = 'tap';
          Net.send({ t: 'answer', choice: 1, sawGo: gg.sub === 'open' });
          vibrate(20);
          this.refresh(this.app.st);
        });
        this.arena.innerHTML = ''; this.arena.append(this.btn);
      }
      const me = this.myAns();
      let cls = 'idle', txt = '';
      if (me && me.early) { cls = 'out'; txt = 'استعجلت! ✋'; }
      else if (g.sub === 'show') { cls = r.decoy ? 'decoy' : 'wait'; txt = r.decoy ? 'مو الحين! 🟡' : 'انتظر…'; if (this.my === 'tap') { cls = 'out'; txt = 'استعجلت! ✋'; } }
      else if (g.sub === 'open') { cls = 'go'; txt = me || this.my ? (me && me.ms ? me.ms + ' ms' : '✓') : 'اضغط!'; }
      this.btn.className = 'reflex ' + cls; this.btn.textContent = txt;
    }

    // ═════ قلب واحد ═════
    harmony(st, fresh) {
      const g = st.game, r = g.r;
      if (fresh || !this.optEls) {
        this.qEl = h('div', { class: 'q' }, r.q);
        this.optsEl = h('div', { class: 'opts' });
        this.optEls = r.opts.map((o, i) => { const b = h('button', { class: 'opt', onclick: () => this.answer(i) }, h('i', { class: 'bar' }), h('span', { class: 'e' }, o.e), h('span', null, o.l), h('span', { class: 'avs' })); this.optsEl.append(b); return b; });
        this.arena.innerHTML = '';
        this.arena.append(h('div', { class: 'col', style: { alignItems: 'center', width: '100%' } }, this.qEl, this.optsEl));
      }
      const me = this.myAns(); const my = me ? me.choice : this.my;
      const pm = this.pmap();
      const total = Math.max(1, st.players.filter((p) => p.connected).length);
      this.optEls.forEach((b, i) => {
        b.classList.toggle('on', my === i);
        b.classList.toggle('dim', my != null && my !== i && g.sub === 'open');
        const avs = b.querySelector('.avs');
        if (g.sub === 'result' && g.info) {
          const who = Object.entries(g.answers).filter(([, a]) => a.choice === i).map(([pid]) => (pm[pid] || {}).emoji);
          avs.textContent = who.join('');
          b.querySelector('.bar').style.height = (100 * g.info.counts[i]) / total + '%';
          b.classList.toggle('top', g.info.counts[i] > 0 && i === g.info.top);
          b.classList.remove('dim');
        }
      });
    }

    // ═════ ألعاب الخيارات العامة ═════
    renderDisp(d, sub) {
      const box = this.dispEl; box.innerHTML = ''; this.anim = null;
      if (!d) return;
      if (d.type === 'big') {
        const st = { color: d.color || 'inherit', direction: d.ltr ? 'ltr' : null };
        if (d.shadow) Object.assign(st, { filter: 'brightness(0)', transform: `rotate(${d.rot || 0}deg) scaleX(${d.flip ? -1 : 1})` });
        box.append(h('div', { class: 'bigdisp' + (d.t && !d.e ? ' word' : ''), style: st }, d.e || d.t));
      } else if (d.type === 'text') box.append(h('div', { class: 'textdisp' }, d.t));
      else if (d.type === 'row') box.append(h('div', { class: 'rowdisp' + (d.small ? ' small' : '') }, d.items.map((e, i) => h('span', { style: { animationDelay: i * 0.06 + 's' } }, e))));
      else if (d.type === 'arrow') box.append(h('div', { class: 'col', style: { alignItems: 'center', gap: '6px' } }, h('div', { class: 'cmd ' + (d.cmd === 'عكس!' ? 'rev' : '') }, d.cmd), h('div', { class: 'bigdisp' }, d.e)));
      else if (d.type === 'digits') box.append(h('div', { class: 'digits' }, d.t));
      else if (d.type === 'scatter') box.append(h('div', { class: 'scatter' }, d.pts.map(([x, y, r]) => h('span', { style: { left: x + '%', top: y + '%', transform: `translate(-50%,-50%) rotate(${r}deg)` } }, d.e))));
      else if (d.type === 'seq') {
        const big = h('div', { class: 'bigdisp' }), cnt = h('div', { class: 'tag' });
        box.append(h('div', { class: 'col', style: { alignItems: 'center' } }, cnt, big));
        let last = -2;
        this.anim = (t) => {
          if (this.app.st.game.sub !== 'show') return;
          const k = Math.floor(t / d.step), on = t - k * d.step < d.step * 0.78;
          const idx = k < d.items.length && on ? k : -1;
          if (idx !== last) { last = idx; big.textContent = idx >= 0 ? d.items[idx] : ''; cnt.textContent = idx >= 0 ? ar(idx + 1) + ' / ' + ar(d.items.length) : '…'; if (idx >= 0) { big.style.animation = 'none'; void big.offsetWidth; big.style.animation = ''; Sound.play('pop'); } }
        };
      }
    }
    opts(st) {
      const g = st.game, r = g.r;
      if (!this.ow) {
        this.dispEl = h('div', { class: 'dispbox' });
        this.qEl = h('div', { class: 'qline' });
        this.optGrid = h('div', { class: 'ogrid' });
        this.ow = h('div', { class: 'col owrap' }, this.dispEl, this.qEl, this.optGrid);
        this.arena.innerHTML = ''; this.arena.append(this.ow);
        this.dispKey = null; this.optBtns = null;
      }
      const dk = JSON.stringify(r.disp || null) + g.sub.replace('result', 'open');
      if (dk !== this.dispKey) { this.dispKey = dk; this.renderDisp(r.disp, g.sub); }
      this.qEl.textContent = r.q || '';
      if (r.opts && !this.optBtns) {
        this.optGrid.className = 'ogrid ' + (r.layout || 'text');
        this.optBtns = r.opts.map((o, i) => {
          const b = h('button', { class: 'obtn' + (o.c ? ' swc' : ''), style: o.c ? { background: o.c } : o.c2 ? { '--c2': o.c2 } : null, onclick: () => this.answer(i) },
            h('i', { class: 'bar' }), o.e ? h('span', { class: 'e' }, o.e) : null, o.t ? h('span', { class: 't' }, o.t) : null, h('span', { class: 'avs' }));
          this.optGrid.append(b); return b;
        });
        this.optBtns.forEach((b, i) => b.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, delay: i * 40, easing: 'cubic-bezier(.2,1.5,.4,1)', fill: 'backwards' }));
      }
      if (!r.opts) { this.optGrid.innerHTML = ''; this.optBtns = null; return; }
      const me = this.myAns(); const my = me ? me.choice : this.my;
      const pm = this.pmap(), info = g.info;
      const total = Math.max(1, st.players.filter((p) => p.connected).length);
      this.optBtns.forEach((b, i) => {
        b.classList.toggle('on', my === i);
        b.classList.toggle('dim', my != null && my !== i && g.sub === 'open');
        if (g.sub === 'result') {
          b.classList.remove('dim');
          const who = Object.entries(g.answers).filter(([, a]) => a.choice === i).map(([pid]) => (pm[pid] || {}).emoji);
          b.querySelector('.avs').textContent = who.join('');
          if (r.answer != null) { b.classList.toggle('good', i === r.answer); b.classList.toggle('bad', i !== r.answer && who.length > 0); }
          if (info && info.counts) { b.querySelector('.bar').style.height = (100 * info.counts[i]) / total + '%'; b.classList.toggle('good', info.top === i); if (info.kind === 'unique') b.classList.toggle('bad', info.counts[i] > 1); }
        }
      });
    }
    // ═════ لوحة الأرقام ═════
    numpad(st) {
      const g = st.game, r = g.r;
      if (!this.np) {
        this.dispEl = h('div', { class: 'dispbox' });
        this.qEl = h('div', { class: 'qline' });
        this.entry = '';
        this.entryEl = h('div', { class: 'entry' });
        const key = (k) => h('button', { class: 'key' + (k === '✓' ? ' ok' : ''), onpointerdown: (e) => { e.preventDefault(); this.key(k); } }, k);
        this.pad = h('div', { class: 'keypad' }, ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '⌫', '٠', '✓'].map(key));
        this.np = h('div', { class: 'col owrap' }, this.dispEl, this.qEl, this.entryEl, this.pad);
        this.arena.innerHTML = ''; this.arena.append(this.np); this.dispKey = null;
      }
      const dk = JSON.stringify(r.disp || null) + g.sub;
      if (dk !== this.dispKey) { this.dispKey = dk; this.renderDisp(g.sub === 'result' && r.disp && r.disp.type === 'scatter' ? null : r.disp, g.sub); }
      const me = this.myAns();
      const open = g.sub === 'open' && this.canPlay() && !me && this.my == null;
      this.qEl.textContent = g.sub === 'show' ? '' : g.sub === 'result' ? 'الجواب: ' + ar(r.answer) : r.q;
      this.pad.classList.toggle('hide', !open);
      this.entryEl.classList.toggle('hide', g.sub === 'show');
      if (!open && (me || this.my != null)) this.entryEl.textContent = ar(me ? me.choice : this.my) + (me && me.ok === false ? ' ❌' : me && me.ok ? ' ✅' : ' ✓');
      else this.entryEl.textContent = this.entry ? ar(this.entry) : '—';
    }
    key(k) {
      const g = this.app.st.game; if (g.sub !== 'open') return;
      Sound.play('tap');
      if (k === '⌫') this.entry = this.entry.slice(0, -1);
      else if (k === '✓') { if (this.entry) this.answer(this.entry); return; }
      else if (this.entry.length < 9) this.entry += '٠١٢٣٤٥٦٧٨٩'.indexOf(k);
      this.entryEl.textContent = this.entry ? ar(this.entry) : '—';
    }
    // ═════ تتابع الألوان ═════
    simon(st) {
      const g = st.game, r = g.r;
      if (!this.pads) {
        this.seqIn = [];
        this.prog = h('div', { class: 'sprog' });
        this.pads = [0, 1, 2, 3].map((i) => h('button', { class: 'pad p' + i, onpointerdown: (e) => { e.preventDefault(); this.padTap(i); } }));
        this.arena.innerHTML = '';
        this.arena.append(h('div', { class: 'col owrap' }, this.prog, h('div', { class: 'pads' }, this.pads)));
        let last = -1;
        this.anim = (t) => {
          const gg = this.app.st.game; if (gg.sub !== 'show' || !gg.r.seq) return;
          const k = Math.floor(t / gg.r.step), on = t - k * gg.r.step < gg.r.step * 0.7;
          const idx = k < gg.r.seq.length && on ? gg.r.seq[k] : -1;
          const key = k + ':' + idx;
          if (key !== last) { last = key; this.pads.forEach((p, i) => p.classList.toggle('lit', i === idx)); if (idx >= 0) Sound.play('pad' + idx); }
        };
      }
      const me = this.myAns();
      const n = r.len;
      this.prog.innerHTML = '';
      const filled = me ? n : this.seqIn.length;
      if (g.sub === 'show') this.prog.append(h('b', null, '👀 احفظ الترتيب'));
      else if (g.sub === 'result') this.prog.append(h('span', null, 'الترتيب كان: '), ...r.seq.map((v) => h('i', { class: 'sd p' + v })));
      else { this.prog.append(...Array.from({ length: n }, (_, i) => h('i', { class: 'sd' + (i < filled ? ' on' : '') }))); if (me) this.prog.append(h('b', null, me.ok ? ' ✅' : me.ok === false ? ' ❌' : ' ✓')); }
      if (g.sub !== 'show') this.pads.forEach((p) => p.classList.remove('lit'));
    }
    padTap(i) {
      const g = this.app.st.game;
      if (g.sub !== 'open' || !this.canPlay() || this.myAns() || this.my != null) return;
      this.seqIn.push(i); Sound.play('pad' + i); vibrate(10);
      const p = this.pads[i]; p.classList.add('lit'); setTimeout(() => p.classList.remove('lit'), 180);
      if (this.seqIn.length >= g.r.len) { this.my = this.seqIn.slice(); Net.send({ t: 'answer', choice: this.my }); }
      this.simon(this.app.st);
    }
    // ═════ ضغط جنوني ═════
    taps(st) {
      const g = st.game;
      if (!this.tb) {
        this.myCount = 0;
        this.tb = h('div', { class: 'reflex idle tapbtn' }, 'استعد…');
        this.tb.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          if (this.app.st.game.sub !== 'open' || !this.canPlay()) return;
          this.myCount++; Net.send({ t: 'tap' });
          this.tb.textContent = ar(this.myCount);
          this.tb.animate([{ transform: 'scale(.94)' }, { transform: 'scale(1)' }], { duration: 120 });
          if (this.myCount % 5 === 0) Sound.play('tap');
        });
        this.live = h('div', { class: 'rank' });
        this.arena.innerHTML = ''; this.arena.append(h('div', { class: 'col owrap' }, this.tb, this.live));
      }
      if (g.sub === 'result') { this.arena.innerHTML = ''; return; }
      if (g.sub === 'open') { this.tb.className = 'reflex go tapbtn'; if (!this.myCount) this.tb.textContent = 'اضغط! 👆'; }
      const pm = this.pmap();
      const list = Object.entries(g.answers).map(([id, a]) => [id, a.count || 0]).sort((a, b) => b[1] - a[1]);
      const max = Math.max(1, ...list.map((x) => x[1]));
      this.live.innerHTML = '';
      list.forEach(([id, c]) => { const p = pm[id] || {}; this.live.append(h('div', { class: 'it livebar', style: { '--w': (100 * c) / max + '%' } }, h('span', { class: 'e' }, p.emoji), p.name, h('span', { class: 'v' }, ar(c)))); });
    }
    // ═════ إحساس الوقت ═════
    clock(st) {
      const g = st.game, r = g.r;
      if (!this.tb) {
        this.tb = h('div', { class: 'reflex idle tapbtn' }, '');
        this.tb.addEventListener('pointerdown', (e) => { e.preventDefault(); if (this.app.st.game.sub === 'open') this.answer(1); });
        this.tsub = h('div', { class: 'hint-line' });
        this.arena.innerHTML = ''; this.arena.append(h('div', { class: 'col owrap' }, h('div', { class: 'target' }, 'اضغط بعد', h('b', { class: 'e', style: { fontSize: '38px' } }, ar(r.secs)), 'ثواني'), this.tb, this.tsub));
        this.anim = (t) => {
          const gg = this.app.st.game; if (gg.sub !== 'open') return;
          const done = this.myAns() || this.my != null;
          if (done) return;
          this.tb.textContent = t < 1000 ? (t / 1000).toFixed(1).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]) : '🙈';
          this.tsub.textContent = t < 1000 ? 'بدأ الوقت!' : 'العداد اختفى.. عد في بالك';
        };
      }
      if (g.sub === 'result') { this.arena.innerHTML = ''; return; }
      const me = this.myAns();
      if (g.sub === 'open') this.tb.className = 'reflex ' + (me || this.my != null ? 'idle' : 'go') + ' tapbtn';
      if (me || this.my != null) { this.tb.textContent = 'ضغطت ✓'; this.tsub.textContent = 'ننتظر الباقين…'; }
    }
  }

  window.Games = { RoundView };
})();
