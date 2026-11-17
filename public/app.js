/* «لمّة» — التطبيق: الشاشات والتنقل */
(function () {
  'use strict';
  const { h, $, ar, toast, sheet, confetti, vibrate, store, ACTS, CATS, Net } = window.L;
  const ORDER = Object.keys(ACTS);
  const AVATARS = LammaEngine.AVATARS;

  const app = { st: null, recvAt: 0, ctrl: null, key: null, tourney: [], mode: 'single', endSeq: 0, lastPhase: null };
  window.app = app;
  const root = $('#app');

  // ───────── الشعار ─────────
  const logo = (size = 92) => h('div', { class: 'logo', html: `
    <svg viewBox="0 0 100 100" style="width:${size}px;height:${size}px"><g stroke="#22163B" stroke-width="4.5" stroke-linejoin="round">
    <path class="p" style="--dx:-6px;--dy:-6px;--rot:-12deg" d="M47 47 L47 12 A35 35 0 0 0 12 47 Z" fill="#FF5B4A"/>
    <path class="p p2" style="--dx:6px;--dy:-6px;--rot:12deg" d="M53 47 L88 47 A35 35 0 0 0 53 12 Z" fill="#FFB627"/>
    <path class="p p3" style="--dx:6px;--dy:6px;--rot:-10deg" d="M53 53 L53 88 A35 35 0 0 0 88 53 Z" fill="#19C2A0"/>
    <path class="p p4" style="--dx:-6px;--dy:6px;--rot:10deg" d="M47 53 L12 53 A35 35 0 0 0 47 88 Z" fill="#3D8BFF"/></g></svg>
    <span class="word">لمّة</span>` });

  // ───────── التحكم بالشاشة الحالية ─────────
  function setView(key, make) {
    if (app.key === key && app.ctrl) return false;
    if (app.ctrl && app.ctrl.destroy) app.ctrl.destroy();
    app.key = key; app.ctrl = make();
    root.innerHTML = '';
    window.scrollTo(0, 0);
    return true;
  }
  const simple = (render) => ({ mount(el, st) { this.el = el; this.update(st); }, update(st) { this.el.innerHTML = ''; this.el.append(render(st)); } });

  function viewKey(st) {
    if (st.phase === 'lobby') return 'lobby';
    if (st.phase === 'intro') return 'intro:' + st.intro.activity;
    if (st.phase === 'game' && st.game) {
      const g = st.game;
      return 'g:' + g.id + ':' + g.round + ':' + g.practice;
    }
    if (st.phase === 'activityEnd') return 'end:' + (st.result && st.result.activity) + ':' + (st.plan ? st.plan.idx : '') + ':' + app.endSeq;
    if (st.phase === 'final') return 'final';
    return 'x';
  }
  function render() {
    const st = app.st; if (!st) return;
    document.body.classList.remove('no-top');
    $('#topbar').hidden = false;
    renderTop(st);
    const key = viewKey(st);
    let fresh = setView(key, () => {
      if (key === 'lobby') return simple(lobbyView);
      if (key.startsWith('intro')) return simple(introView);
      if (key.startsWith('g:')) return new Games.RoundView(app);
      if (key.startsWith('end:')) return endView();
      if (key === 'final') return simple(finalView);
      return simple(() => h('div'));
    });
    if (!fresh && app.ctrl.needsRemount && app.ctrl.needsRemount(st)) { app.ctrl.destroy && app.ctrl.destroy(); app.key = null; return render(); }
    if (fresh) app.ctrl.mount(root, st); else app.ctrl.update(st);
  }

  // ───────── الشريط العلوي ─────────
  function renderTop(st) {
    $('#tb-code').textContent = Net.mode === 'local' ? 'تجربة' : '# ' + st.code;
    $('#tb-mute').textContent = Sound.muted ? '🔇' : '🔊';
    const mid = $('#tb-mid'); mid.innerHTML = '';
    const a = st.phase === 'game' && st.game ? ACTS[st.game.id] : st.phase === 'intro' ? ACTS[st.intro.activity] : null;
    if (st.hostAway) mid.append(h('span', { style: { color: 'var(--coral)', fontSize: '14px' } }, 'المضيف منقطع…'));
    else if (a) mid.append(a.icon + ' ' + a.name);
    else mid.append(h('span', { class: 'muted' }, ar(st.players.filter((p) => p.connected).length) + ' في الغرفة'));
  }
  $('#tb-mute').onclick = () => { Sound.toggle(); $('#tb-mute').textContent = Sound.muted ? '🔇' : '🔊'; if (!Sound.muted) Sound.play('pop'); };
  $('#tb-code').onclick = () => shareSheet();
  $('#tb-people').onclick = () => peopleSheet();

  function roomURL(code, screen) { return location.origin + (screen ? '/screen/' : '/r/') + code; }
  function shareSheet() {
    const st = app.st; if (!st) return;
    if (Net.mode === 'local') { sheet(h('div', { class: 'col center' }, h('h3', null, 'وضع تجريبي'), h('p', { class: 'muted' }, 'هذا الوضع على جهازك فقط ولا يمكن مشاركته. للعب الجماعي ارجع وأنشئ غرفة.'), h('button', { class: 'btn block', onclick: () => sheet(null) }, 'تمام'))); return; }
    const url = roomURL(st.code);
    const qr = h('div', { class: 'qr' }); makeQR(qr, url);
    sheet(h('div', { class: 'col center' },
      h('h3', null, 'ادعُ الجماعة'),
      h('div', { class: 'bigcode' }, st.code), qr,
      h('p', { class: 'muted', style: { margin: 0, direction: 'ltr', wordBreak: 'break-all' } }, url),
      h('button', { class: 'btn primary block', onclick: () => shareLink(url) }, '📤 شارك الرابط'),
      h('button', { class: 'btn block', onclick: () => { copy(roomURL(st.code, true)); toast('انسخ رابط شاشة العرض — افتحه على الآيباد أو التلفزيون'); } }, '📺 رابط شاشة عرض'),
      h('button', { class: 'btn ghost block', onclick: () => sheet(null) }, 'إغلاق')));
  }
  async function shareLink(url) {
    try { if (navigator.share) { await navigator.share({ title: 'تعال لمّة!', text: 'ادخل غرفتنا في لمّة 🎉 الرمز: ' + app.st.code, url }); return; } } catch (e) { if (e.name === 'AbortError') return; }
    copy(url); toast('انسخ الرابط ✓');
  }
  function copy(t) { try { navigator.clipboard.writeText(t); } catch (e) { const i = h('input', { value: t }); document.body.append(i); i.select(); document.execCommand('copy'); i.remove(); } }
  let qrLib = null;
  function makeQR(el, text) {
    const draw = () => { try { const q = window.qrcode(0, 'M'); q.addData(text); q.make(); el.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) {} };
    if (window.qrcode) return draw();
    if (!qrLib) { qrLib = new Promise((res) => { const s = h('script', { src: 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js' }); s.onload = res; s.onerror = res; document.head.append(s); }); }
    qrLib.then(draw);
  }
  function peopleSheet() {
    const st = app.st; if (!st) return;
    const host = st.you && st.you.isHost;
    sheet(h('div', { class: 'col' },
      h('h3', null, 'اللاعبون (' + ar(st.players.length) + ')'),
      st.players.map((p) => h('div', { class: 'row', style: { background: '#fff', border: '2.5px solid var(--ink)', borderRadius: '16px', padding: '8px 12px', opacity: p.connected ? 1 : 0.55 } },
        h('span', { style: { fontSize: '30px' } }, p.emoji),
        h('div', { class: 'grow' }, h('b', null, p.name, p.id === st.hostId ? ' 👑' : '', st.you && p.id === st.you.id ? ' (أنت)' : ''), h('div', { class: 'muted', style: { fontSize: '13px' } }, p.connected ? 'متصل' : 'منقطع — يقدر يرجع بنفس الجهاز')),
        host && p.id !== st.you.id ? h('button', { class: 'btn small', onclick: () => { Net.send({ t: 'makeHost', id: p.id }); sheet(null); toast('صار ' + p.name + ' المضيف'); } }, '👑') : null,
        host && p.id !== st.you.id ? h('button', { class: 'btn small', onclick: () => { if (confirm('إخراج ' + p.name + '؟')) { Net.send({ t: 'kick', id: p.id }); sheet(null); } } }, '✕') : null)),
      st.displays ? h('p', { class: 'muted', style: { margin: 0 } }, '📺 شاشات عرض متصلة: ' + ar(st.displays)) : null,
      st.you && st.you.role === 'player' ? h('button', { class: 'btn block', onclick: () => renameSheet() }, '✏️ غيّر اسمي') : null,
      host && st.phase !== 'lobby' ? h('button', { class: 'btn block mango', onclick: () => { if (confirm('ترجعون للقائمة؟ النشاط الحالي بينتهي.')) { Net.send({ t: 'lobby' }); sheet(null); } } }, '🏠 رجوع الكل للقائمة') : null,
      host && st.phase === 'game' ? h('button', { class: 'btn block', onclick: () => { Net.send({ t: 'skip' }); sheet(null); } }, '⏭️ أنهِ النشاط الحالي') : null,
      h('button', { class: 'btn ghost block', onclick: () => { if (confirm('تبي تطلع من الغرفة؟')) { sheet(null); Net.leave(); goHome(); } } }, '🚪 اطلع من الغرفة')));
  }
  function renameSheet() {
    const inp = h('input', { class: 'field', value: app.st.you.name, maxlength: 16 });
    sheet(h('div', { class: 'col' }, h('h3', null, 'اسمك'), inp, h('button', { class: 'btn primary block', onclick: () => { Net.send({ t: 'rename', name: inp.value }); store.set('me', Object.assign(store.get('me', {}), { name: inp.value })); sheet(null); } }, 'حفظ')));
    setTimeout(() => inp.focus(), 100);
  }

  // ───────── الصفحة الرئيسية ─────────
  function goHome(prefill) {
    if (app.ctrl && app.ctrl.destroy) app.ctrl.destroy();
    app.ctrl = null; app.key = null; app.st = null;
    $('#topbar').hidden = true; $('#netbar').hidden = true;
    document.body.classList.add('no-top'); document.body.classList.remove('full');
    history.replaceState(null, '', '/');
    root.innerHTML = '';
    const boxes = [0, 1, 2, 3].map((i) => h('input', { inputmode: 'numeric', maxlength: 1, 'aria-label': 'رقم ' + (i + 1), autocomplete: 'off' }));
    boxes.forEach((b, i) => {
      b.addEventListener('input', () => { b.value = b.value.replace(/[^0-9٠-٩]/g, '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).slice(-1); if (b.value && i < 3) boxes[i + 1].focus(); if (boxes.every((x) => x.value)) tryJoin(); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !b.value && i > 0) boxes[i - 1].focus(); });
      b.addEventListener('paste', (e) => { const t = (e.clipboardData.getData('text') || '').replace(/\D/g, ''); if (t.length >= 4) { e.preventDefault(); t.slice(0, 4).split('').forEach((d, k) => (boxes[k].value = d)); tryJoin(); } });
    });
    const tryJoin = async () => {
      const code = boxes.map((b) => b.value).join('');
      if (code.length < 4) { toast('اكتب الرمز كامل (٤ أرقام)'); return; }
      const r = await fetch('/api/exists?room=' + code).then((x) => x.json()).catch(() => ({ ok: false }));
      if (!r.ok) { toast('ما لقينا غرفة بهذا الرمز 🤔'); boxes.forEach((b) => (b.value = '')); boxes[0].focus(); return; }
      joinForm(code);
    };
    if (prefill) String(prefill).split('').forEach((d, k) => boxes[k] && (boxes[k].value = d));
    const last = store.get('last', null);
    const resume = last && Date.now() - last.at < 3 * 3600e3 ? h('button', { class: 'btn sky block', onclick: () => connectTo(last.room, last.role) }, '↩️ ارجع لغرفتك ' + last.room) : null;
    root.append(h('div', { class: 'home' },
      logo(), h('p', { class: 'tagline' }, 'ألعاب جماعية للجمعات.. كل واحد من جواله'),
      resume,
      h('button', { class: 'btn primary block', style: { minHeight: '68px', fontSize: '24px' }, onclick: createSheet }, '🎉 أنشئ غرفة'),
      h('div', { class: 'or' }, 'أو ادخل برمز الغرفة'),
      h('div', { class: 'codebox' }, boxes),
      h('button', { class: 'btn block', onclick: tryJoin }, 'ادخل'),
      h('div', { class: 'or' }, ''),
      h('button', { class: 'btn ghost block', onclick: demoSheet }, '🧪 وضع تجريبي على جهاز واحد')));
  }

  function nameForm(onDone, title, btnText) {
    const me = store.get('me', {});
    let emoji = me.emoji || AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const inp = h('input', { class: 'field', placeholder: 'اسمك', value: me.name || '', maxlength: 16, autocomplete: 'nickname' });
    const grid = h('div', { class: 'avatars' }, AVATARS.map((a) => h('button', { class: a === emoji ? 'on' : '', onclick: (e) => { emoji = a; grid.querySelectorAll('button').forEach((b) => b.classList.remove('on')); e.currentTarget.classList.add('on'); Sound.play('pop'); } }, a)));
    const go = () => { const name = inp.value.trim(); if (!name) { toast('اكتب اسمك 🙂'); inp.focus(); return; } store.set('me', { name, emoji }); onDone(name, emoji); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    return h('div', { class: 'col' }, h('h3', null, title), inp, h('b', null, 'اختر شخصيتك'), grid, h('button', { class: 'btn primary block', onclick: go }, btnText));
  }
  function joinForm(code) {
    const saved = store.get('s:' + code, null);
    if (saved && saved.role === 'player') { connectTo(code, 'player'); return; }
    sheet(nameForm((name, emoji) => { sheet(null); connectTo(code, 'player', { name, emoji }); }, 'غرفة ' + code + ' — عرّفنا عليك', 'ادخل الغرفة ←'));
  }
  function createSheet() {
    let display = false;
    const tog = h('div', { class: 'toggle', onclick: () => { display = !display; tog.classList.toggle('on', display); form.classList.toggle('hide', display); dbtn.classList.toggle('hide', !display); } },
      h('span', { class: 'sw' }), h('div', null, h('div', null, 'هذا الجهاز شاشة عرض فقط'), h('small', { class: 'muted' }, 'للآيباد أو التلفزيون — المضيف يتحكم بدون ما يلعب')));
    const form = nameForm((name, emoji) => create(false, name, emoji), 'أنت المضيف 👑', 'أنشئ الغرفة ←');
    const dbtn = h('button', { class: 'btn primary block hide', onclick: () => create(true) }, '📺 أنشئ كشاشة عرض');
    sheet(h('div', { class: 'col' }, tog, form, dbtn));
  }
  async function create(display, name, emoji) {
    try {
      const r = await fetch('/api/create', { method: 'POST' }).then((x) => x.json());
      sheet(null);
      connectTo(r.code, display ? 'display' : 'player', { name, emoji, hostKey: r.hostKey });
    } catch (e) { toast('ما قدرنا نوصل للخادم.. تأكد من الاتصال'); }
  }
  function demoSheet() {
    sheet(h('div', { class: 'col' },
      h('div', { class: 'card', style: { background: '#FFF8D6', padding: '12px' } }, h('b', null, '🧪 وضع تجريبي'), h('p', { style: { margin: '4px 0 0' } }, 'يشتغل على جهازك فقط بدون اتصال بالآخرين. تقدر تجرّب كل الألعاب لحالك.')),
      nameForm((name, emoji) => { sheet(null); startDemo(name, emoji); }, 'اسمك', 'ابدأ التجربة ←')));
  }
  function startDemo(name, emoji) {
    Net.leave();
    history.replaceState(null, '', '/');
    Net.startLocal(name, emoji);
  }
  function connectTo(code, role, extra) {
    Net.fatal = false;
    history.replaceState(null, '', (role === 'display' ? '/screen/' : '/r/') + code);
    root.innerHTML = '';
    root.append(h('div', { class: 'waiting', style: { minHeight: '60dvh' } }, logo(70), h('div', { class: 'dots' }, h('i'), h('i'), h('i')), h('b', null, 'ندخلك الغرفة…')));
    Net.connect(Object.assign({ room: code, role }, extra || {}));
  }

  // ───────── الردهة ─────────
  function playerTile(p, st) {
    return h('div', { class: 'pl' + (p.connected ? '' : ' off') },
      p.id === st.hostId ? h('span', { class: 'crown' }, '👑') : null,
      st.you && p.id === st.you.id ? h('span', { class: 'you' }, 'أنت') : null,
      h('div', { class: 'av', style: { background: p.color } }, p.emoji),
      h('div', { class: 'nm' }, p.name),
      !p.connected ? h('div', { class: 'badge' }, 'منقطع') : st.plan && st.plan.tournament && st.totals[p.id] ? h('div', { class: 'badge', style: { color: 'var(--ink2)' } }, ar(st.totals[p.id]) + ' نقطة') : null);
  }
  function lobbyView(st) {
    const host = st.you && st.you.isHost;
    const local = Net.mode === 'local';
    const roomCard = h('div', { class: 'card roomcard' },
      local ? h('div', null, h('span', { class: 'tag', style: { background: 'var(--mango)' } }, '🧪 وضع تجريبي — جهاز واحد'))
        : [h('div', { class: 'muted', style: { fontWeight: 800 } }, 'ادخلوا ', h('span', { style: { direction: 'ltr', unicodeBidi: 'isolate' } }, location.host), ' واكتبوا الرمز'), h('div', { class: 'bigcode' }, st.code), (() => { const q = h('div', { class: 'qr' }); makeQR(q, roomURL(st.code)); return q; })(),
          h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn small primary', onclick: () => shareLink(roomURL(st.code)) }, '📤 شارك الرابط'), h('button', { class: 'btn small', onclick: shareSheet }, '📺 شاشة عرض'))],
      h('div', { class: 'players' }, st.players.map((p) => playerTile(p, st))),
      st.players.length < 2 && !local ? h('p', { class: 'muted', style: { margin: 0 } }, 'بانتظار الجماعة يدخلون… كل واحد يفتح الرابط من جواله') : null);
    let right;
    if (host) {
      const isT = app.mode === 'tour';
      const modebar = h('div', { class: 'modebar' },
        h('button', { class: isT ? '' : 'on', onclick: () => { app.mode = 'single'; render2(); } }, 'نشاط واحد'),
        h('button', { class: isT ? 'on' : '', onclick: () => { app.mode = 'tour'; render2(); } }, '🏆 بطولة'));
      const card = (id) => {
        const a = ACTS[id], n = app.tourney.indexOf(id);
        return h('button', { class: 'act' + (isT && n >= 0 ? ' sel' : ''), style: { '--c': a.c }, onclick: () => {
          Sound.play('pop');
          if (!isT) { Net.send({ t: 'choose', list: [id] }); return; }
          if (n >= 0) app.tourney.splice(n, 1); else app.tourney.push(id);
          render2();
        } }, h('div', { class: 'ic' }, a.icon), h('h3', null, a.name), h('p', null, a.desc), isT && n >= 0 ? h('span', { class: 'num' }, ar(n + 1)) : null);
      };
      const acts = h('div', { class: 'col', style: { gap: '18px' } }, CATS.map(([cat, label, c]) => h('section', { class: 'catsec' },
        h('div', { class: 'cathead', style: { '--c': c } }, label, h('span', null, ar(ORDER.filter((id) => ACTS[id].cat === cat).length))),
        h('div', { class: 'acts' }, ORDER.filter((id) => ACTS[id].cat === cat).map(card)))));
      const randomPick = (n) => { const pool = ORDER.slice(); const out = []; while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); return out; };
      right = h('div', { class: 'col' },
        h('h2', { style: { fontSize: '30px' } }, isT ? 'رتّب بطولتكم' : 'وش نلعب؟ (' + ar(ORDER.length) + ' لعبة)'), modebar,
        isT ? h('button', { class: 'btn mango block', onclick: () => Net.send({ t: 'choose', list: randomPick(5) }) }, '🎲 بطولة سريعة: ٥ ألعاب عشوائية') : h('button', { class: 'btn mango block', onclick: () => Net.send({ t: 'choose', list: randomPick(1) }) }, '🎲 لعبة عشوائية'),
        isT ? h('p', { class: 'muted', style: { margin: 0 } }, 'اختر الأنشطة بالترتيب.. النقاط تتجمع من الألعاب التنافسية، والتعاونية لها احتفالها الخاص.') : null,
        acts,
        isT ? h('button', { class: 'btn primary block', disabled: app.tourney.length < 2, onclick: () => Net.send({ t: 'choose', list: app.tourney.slice() }) }, app.tourney.length < 2 ? 'اختر نشاطين أو أكثر' : '🏆 ابدأ البطولة (' + ar(app.tourney.length) + ' أنشطة)') : null);
    } else {
      right = h('div', { class: 'card waiting' }, h('div', { style: { fontSize: '60px' } }, '🎲'), h('h2', null, 'المضيف يختار اللعبة…'), h('div', { class: 'dots' }, h('i'), h('i'), h('i')),
        h('p', { class: 'muted', style: { margin: 0 } }, 'خلك جاهز.. الجولات تبدأ عند الكل بنفس اللحظة'));
    }
    return h('div', { class: 'lobby' }, roomCard, right);
  }
  function render2() { if (app.ctrl && app.ctrl.update) app.ctrl.update(app.st); }

  // ───────── الشرح ─────────
  function introView(st) {
    const id = st.intro.activity, a = ACTS[id];
    const host = st.you && st.you.isHost;
    const plan = st.plan;
    const live = st.players.filter((p) => p.connected).length;
    const extra = null;
    const tLabel = plan && plan.tournament ? h('span', { class: 'tag', style: { background: 'var(--mango)' } }, '🏆 النشاط ' + ar(plan.idx + 1) + ' من ' + ar(plan.list.length)) : null;
    return h('div', { class: 'intro' },
      h('div', null, tLabel),
      h('div', { class: 'hero' }, a.icon),
      h('h1', { style: { fontSize: '44px' } }, a.name),
      h('div', null, h('span', { class: 'tag', style: { background: a.c } }, a.tag)),
      h('p', { style: { fontSize: '19px', margin: 0 } }, a.desc),
      h('div', { class: 'steps' }, a.steps.map(([e, t, d]) => h('div', { class: 'step' }, h('div', { class: 'e' }, e), h('b', null, t), h('span', null, d)))),
      extra,
      host ? h('div', { class: 'col' },
        h('button', { class: 'btn primary block', style: { minHeight: '66px', fontSize: '24px' }, onclick: () => Net.send({ t: 'start' }) }, '▶️ ابدأ'),
        st.intro.practiceDone ? h('div', { class: 'muted' }, '✓ خلصت الجولة التجريبية') : h('button', { class: 'btn mango block', onclick: () => Net.send({ t: 'start', practice: true }) }, '🧪 جولة تجريبية (بدون نقاط)'),
        h('button', { class: 'btn ghost small', onclick: () => Net.send({ t: 'lobby' }) }, '← رجوع للقائمة'))
        : h('div', { class: 'card waiting', style: { padding: '16px' } }, h('b', null, 'استعدوا! المضيف بيبدأ بعد شوي'), h('div', { class: 'dots' }, h('i'), h('i'), h('i'))));
  }

  // ───────── نهاية النشاط ─────────
  function podium(list, pm) {
    const top = list.slice(0, 3);
    const order = [1, 0, 2].filter((i) => top[i]);
    const hs = [200, 150, 110], cols = ['#FFB627', '#3D8BFF', '#FF5B4A'];
    return h('div', { class: 'podium' }, order.map((i) => {
      const [id, s] = top[i]; const p = pm[id] || { emoji: '❔', name: '' };
      return h('div', { class: 'pod' }, h('div', { class: 'e', style: { animationDelay: (0.5 + (2 - i) * 0.3) + 's' } }, i === 0 ? '👑' : '', p.emoji), h('div', { class: 'n' }, p.name), h('div', { class: 'pts' }, ar(s) + ' نقطة'),
        h('div', { class: 'blk', style: { height: hs[i] + 'px', background: cols[i], animationDelay: ((2 - i) * 0.3) + 's' } }, ar(i + 1)));
    }));
  }
  function nextButtons(st) {
    const host = st.you && st.you.isHost;
    if (!host) return h('p', { class: 'muted' }, 'بانتظار المضيف…');
    const plan = st.plan;
    const hasNext = plan && plan.idx < plan.list.length - 1;
    return h('div', { class: 'col' },
      hasNext ? h('button', { class: 'btn primary block', onclick: () => Net.send({ t: 'next' }) }, 'التالي: ' + ACTS[plan.list[plan.idx + 1]].icon + ' ' + ACTS[plan.list[plan.idx + 1]].name + ' ←')
        : plan && plan.tournament ? h('button', { class: 'btn primary block', onclick: () => Net.send({ t: 'next' }) }, '🏆 النتيجة النهائية')
          : h('button', { class: 'btn primary block', onclick: () => Net.send({ t: 'choose', list: plan ? plan.list : [st.result.activity] }) }, '🔁 العب مرة ثانية (محتوى جديد)'),
      h('button', { class: 'btn ghost block', onclick: () => Net.send({ t: 'lobby' }) }, '🏠 اختر نشاط آخر'));
  }
  function endView() {
    return {
      mount(el, st) {
        this.el = el;
        const res = st.result, a = ACTS[res.activity];
        const pm = Object.fromEntries(st.players.map((p) => [p.id, p]));
        const box = h('div', { class: 'results' });
        const _ap = box.append.bind(box); box.append = (...k) => _ap(...k.filter((x) => x != null && x !== false));
        if (res.type === 'compete') {
          const list = Object.entries(res.scores).filter(([id]) => pm[id]).sort((x, y) => y[1] - x[1]);
          box.append(h('div', null, h('span', { class: 'tag', style: { background: a.c } }, a.icon + ' ' + a.name)), h('h1', { style: { fontSize: '40px' } }, list[0] && list[0][1] > 0 ? 'الفائز: ' + pm[list[0][0]].name + ' 🎉' : 'تعادل!'),
            podium(list, pm),
            h('div', { class: 'rank', style: { margin: '0 auto' } }, list.slice(3).map(([id, s], i) => h('div', { class: 'it' }, h('span', { class: 'p' }, ar(i + 4)), h('span', { class: 'e' }, pm[id].emoji), pm[id].name, h('span', { class: 'v' }, ar(s))))),
            st.plan && st.plan.tournament ? h('p', { class: 'muted', style: { margin: 0 } }, 'النقاط انضافت لمجموع البطولة') : null);
          setTimeout(() => confetti(110), 900);
        } else if (res.type === 'coop') {
          const pct = res.harmony;
          const uniq = res.activity === 'unique';
          const msg = pct >= 90 ? (uniq ? 'ولا أحد تشابه! عباقرة 🤯' : 'قلب واحد فعلًا! 💞') : pct >= 70 ? 'شغل جماعي حلو! 😍' : pct >= 50 ? 'نص نص.. بس ممتع 😄' : 'نحتاج تمرين 😂';
          box.append(h('div', { class: 'celebrate' }, pct >= 70 ? (uniq ? '🙌' : '💞') : '🤝'), h('h1', { style: { fontSize: '40px' } }, msg),
            h('div', { class: 'meter', style: { margin: '0 auto', height: '40px' } }, h('i', { style: { width: '0%' } }), h('b', { style: { fontSize: '20px' } }, (uniq ? 'نجاحكم ' : 'انسجامكم ') + ar(pct) + '٪')),
            res.perfect ? h('p', { style: { fontSize: '19px', margin: 0 } }, '🎯 جولات مثالية: ' + ar(res.perfect) + ' من ' + ar(res.rounds)) : null,
            h('p', { class: 'muted', style: { margin: 0 } }, 'نشاط تعاوني — ما فيه فائز، فيه جماعة 🫶'));
          setTimeout(() => { const i = box.querySelector('.meter i'); if (i) i.style.width = pct + '%'; }, 200);
          setTimeout(() => confetti(pct >= 70 ? 140 : 60), 600);
        } else {
          box.append(h('div', { class: 'celebrate' }, '😂'), h('h1', { style: { fontSize: '40px' } }, 'انكشفت الأسرار!'), h('p', { class: 'muted', style: { margin: 0, fontSize: '18px' } }, 'فقرة اجتماعية بدون نقاط.. المهم الضحك 🫶'));
          setTimeout(() => confetti(80), 400);
        }
        box.append(nextButtons(st));
        el.innerHTML = ''; el.append(box);
      },
      update(st) { const b = this.el.querySelector('.results'); if (b && b.lastChild) b.replaceChild(nextButtons(st), b.lastChild); },
    };
  }
  function finalView(st) {
    const pm = Object.fromEntries(st.players.map((p) => [p.id, p]));
    const list = Object.entries(st.totals).filter(([id]) => pm[id]).sort((a, b) => b[1] - a[1]);
    setTimeout(() => confetti(160), 800);
    const host = st.you && st.you.isHost;
    return h('div', { class: 'results' },
      h('div', { class: 'celebrate' }, '🏆'), h('h1', { style: { fontSize: '42px' } }, 'بطل اللمّة: ' + (list[0] ? pm[list[0][0]].name : '')),
      podium(list, pm),
      h('div', { class: 'rank', style: { margin: '0 auto' } }, list.slice(3).map(([id, s], i) => h('div', { class: 'it' }, h('span', { class: 'p' }, ar(i + 4)), h('span', { class: 'e' }, pm[id].emoji), pm[id].name, h('span', { class: 'v' }, ar(s))))),
      host ? h('div', { class: 'col' }, h('button', { class: 'btn primary block', onclick: () => Net.send({ t: 'choose', list: st.plan.list }) }, '🔁 بطولة جديدة بنفس الأنشطة'), h('button', { class: 'btn ghost block', onclick: () => Net.send({ t: 'lobby' }) }, '🏠 للقائمة')) : h('p', { class: 'muted' }, 'بانتظار المضيف…'));
  }

  // ───────── أحداث الشبكة ─────────
  Net.on('state', (m) => { if (m.s.phase === 'activityEnd' && app.lastPhase !== 'activityEnd') app.endSeq++; app.lastPhase = m.s.phase; app.st = m.s; app.recvAt = performance.now(); render(); });
  Net.on('fx', (m) => {
    Sound.play(m.name);
    if (m.name === 'correct') vibrate([20, 30, 20]);
    if (m.name === 'wrong' || m.name === 'buzz') vibrate(120);
  });
  Net.on('ack', (m) => { if (m.why === 'closed') toast('الإجابات مو مفتوحة الحين ✋'); else if (m.why === 'dup') toast('لك اختيار واحد بس بالجولة 😉'); });
  Net.on('welcome', (m) => { if (m.rejoined) toast('رجعت لنفس الجلسة 👋'); });
  Net.on('error', (m) => { if (Net.room) store.del('s:' + Net.room); store.del('last'); toast(m.msg || 'صار خطأ', 3500); goHome(); });
  Net.on('kicked', () => { store.del('s:' + Net.room); store.del('last'); toast('المضيف أخرجك من الغرفة', 3500); goHome(); });
  Net.on('replaced', () => { toast('فتحت الغرفة من صفحة ثانية'); root.innerHTML = ''; root.append(h('div', { class: 'waiting' }, h('h2', null, 'الغرفة مفتوحة في صفحة ثانية'), h('button', { class: 'btn primary', onclick: () => location.reload() }, 'استخدمها هنا'))); });
  let netT;
  Net.on('status', (s) => {
    const bar = $('#netbar');
    clearTimeout(netT);
    if (s === 'reconnecting') { bar.hidden = false; bar.className = ''; bar.textContent = '📡 انقطع الاتصال.. نرجعك تلقائيًا'; }
    else if (s === 'open' && !bar.hidden) { bar.className = 'ok'; bar.textContent = '✓ رجع الاتصال'; netT = setTimeout(() => (bar.hidden = true), 1400); }
    else if (s !== 'open') bar.hidden = true;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Net.mode === 'ws' && Net.status !== 'open' && !Net.fatal) Net._open();
  });

  // ───────── البداية ─────────
  const m = location.pathname.match(/^\/(r|screen)\/(\d{4})/);
  const q = new URLSearchParams(location.search).get('r');
  if (m) {
    const role = m[1] === 'screen' ? 'display' : 'player';
    const saved = store.get('s:' + m[2], null);
    if (role === 'display' || (saved && saved.role === role)) connectTo(m[2], role);
    else { goHome(m[2]); fetch('/api/exists?room=' + m[2]).then((x) => x.json()).then((r) => { if (r.ok) joinForm(m[2]); else toast('هذي الغرفة انتهت أو الرمز غلط', 3000); }).catch(() => {}); }
  } else if (q && /^\d{4}$/.test(q)) { goHome(q); joinForm(q); }
  else goHome();
})();
