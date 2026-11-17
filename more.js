/* ألعاب «لمّة» الإضافية — تعريفات يعتمد عليها المحرك (الخادم هو المرجع) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LammaMore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  return function (U) {
    const { rnd, pick, shuffle, sample, POOL, PAIRS } = U;
    const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
    const opt = (list, answerVal, key = 't') => { const s = shuffle(list); return { opts: s.map((v) => (typeof v === 'object' ? v : { [key]: v })), answer: s.indexOf(answerVal) }; };
    const A = {};

    // ═══════ المحتوى ═══════
    const TRIVIA = [
      ['كم عدد أيام السنة الكبيسة؟', '٣٦٦', '٣٦٥', '٣٦٤', '٣٦٠'],
      ['أكبر محيط في العالم؟', 'الهادئ', 'الأطلسي', 'الهندي', 'المتجمد الشمالي'],
      ['عاصمة اليابان؟', 'طوكيو', 'أوساكا', 'سيول', 'بكين'],
      ['كم عدد أرجل العنكبوت؟', '٨', '٦', '١٠', '١٢'],
      ['أسرع حيوان بري؟', 'الفهد', 'الأسد', 'الحصان', 'الغزال'],
      ['أقرب كوكب للشمس؟', 'عطارد', 'الزهرة', 'المريخ', 'الأرض'],
      ['كم عدد ألوان قوس قزح؟', '٧', '٥', '٦', '٨'],
      ['عاصمة مصر؟', 'القاهرة', 'الإسكندرية', 'الجيزة', 'أسوان'],
      ['أطول نهر في العالم (الأشهر)؟', 'النيل', 'الأمازون', 'الفرات', 'الدانوب'],
      ['كم عدد لاعبي فريق كرة القدم في الملعب؟', '١١', '١٠', '٩', '١٢'],
      ['ما الغاز الذي نتنفسه للحياة؟', 'الأكسجين', 'الهيدروجين', 'النيتروجين', 'الهيليوم'],
      ['أكبر قارة مساحة؟', 'آسيا', 'أفريقيا', 'أوروبا', 'أمريكا الشمالية'],
      ['كم عدد أضلاع المسدس؟', '٦', '٥', '٧', '٨'],
      ['عاصمة المغرب؟', 'الرباط', 'الدار البيضاء', 'مراكش', 'فاس'],
      ['من أي شيء يصنع الزجاج أساسًا؟', 'الرمل', 'الحديد', 'الملح', 'الخشب'],
      ['كم دقيقة في الساعة؟', '٦٠', '١٠٠', '٥٠', '٣٦٠'],
      ['أكبر كوكب في المجموعة الشمسية؟', 'المشتري', 'زحل', 'الأرض', 'نبتون'],
      ['ما لون دم الأخطبوط؟', 'أزرق', 'أحمر', 'أخضر', 'أصفر'],
      ['كم عدد قلوب الأخطبوط؟', '٣', '١', '٢', '٤'],
      ['أي حيوان يُسمى سفينة الصحراء؟', 'الجمل', 'الحصان', 'الفيل', 'الحمار'],
      ['عاصمة الإمارات؟', 'أبوظبي', 'دبي', 'الشارقة', 'العين'],
      ['كم عدد أسنان الإنسان البالغ عادة؟', '٣٢', '٢٨', '٣٦', '٢٤'],
      ['ما أصلب مادة طبيعية؟', 'الألماس', 'الذهب', 'الحديد', 'الكوارتز'],
      ['عاصمة الكويت؟', 'مدينة الكويت', 'الأحمدي', 'الجهراء', 'حولي'],
      ['كم عدد الكواكب في المجموعة الشمسية؟', '٨', '٩', '٧', '١٠'],
      ['أعلى جبل في العالم؟', 'إيفرست', 'كليمنجارو', 'الألب', 'طويق'],
      ['ما الحيوان الذي ينام وهو واقف غالبًا؟', 'الحصان', 'القط', 'الكلب', 'الأرنب'],
      ['كم يوم في الأسبوع؟', '٧', '٥', '٦', '٨'],
      ['عاصمة فرنسا؟', 'باريس', 'ليون', 'روما', 'مدريد'],
      ['ما أكبر حيوان على الأرض؟', 'الحوت الأزرق', 'الفيل', 'الزرافة', 'القرش'],
      ['كم عدد حروف اللغة العربية؟', '٢٨', '٢٦', '٢٩', '٣٠'],
      ['عند كم درجة يغلي الماء عند سطح البحر؟', '١٠٠', '٩٠', '٨٠', '١٢٠'],
      ['عاصمة الأردن؟', 'عمّان', 'إربد', 'العقبة', 'الزرقاء'],
      ['ما العضو الذي يضخ الدم؟', 'القلب', 'الرئة', 'الكبد', 'الكلية'],
      ['كم عدد قارات العالم؟', '٧', '٥', '٦', '٨'],
      ['أي فاكهة تُصنع منها الزبيب؟', 'العنب', 'التين', 'التمر', 'الخوخ'],
      ['ما الطائر الذي لا يطير ويعيش في القطب الجنوبي؟', 'البطريق', 'النعامة', 'الصقر', 'البجعة'],
      ['كم ساعة في اليوم؟', '٢٤', '١٢', '٢٠', '٤٨'],
      ['عاصمة عُمان؟', 'مسقط', 'صلالة', 'صحار', 'نزوى'],
      ['ما أكبر عضو في جسم الإنسان؟', 'الجلد', 'الكبد', 'القلب', 'المخ'],
    ];
    const TF = [
      ['الشمس نجم', true], ['الحوت سمكة', false], ['البطريق طائر', true], ['العنكبوت حشرة', false], ['الطماطم فاكهة علميًا', true],
      ['القمر يضيء بنفسه', false], ['الماء يتجمد عند صفر درجة مئوية', true], ['للنحلة خمسة أجنحة', false], ['الخفاش من الثدييات', true],
      ['الدلفين يتنفس بالخياشيم', false], ['الذهب يصدأ بسهولة', false], ['الفيل لا يستطيع القفز', true], ['الصوت ينتقل في الفراغ', false],
      ['للأخطبوط ثلاثة قلوب', true], ['الزرافة أطول حيوان بري', true], ['القطط لا تحب الماء غالبًا', true], ['الكيوي طائر لا يطير', true],
      ['الرياض عاصمة السعودية', true], ['البحر الميت أعلى نقطة على الأرض', false], ['قلب الإنسان على اليمين', false], ['النمل لا ينام أبدًا', false],
      ['الموز ينمو على شجرة حقيقية', false], ['الضوء أسرع من الصوت', true], ['الأرض مسطحة', false], ['التمساح لا يستطيع إخراج لسانه', true],
      ['أصابع اليد الواحدة ٦', false], ['الفراولة بذورها على الخارج', true], ['الثلج الأبيض لونه شفاف في الحقيقة', true], ['السمك الذهبي ذاكرته ٣ ثواني فقط', false],
      ['الأسد يعيش في الغابات المطيرة', false], ['المريخ يسمى الكوكب الأحمر', true], ['العسل لا يفسد تقريبًا', true], ['الكاكاو أصله من أفريقيا', false],
    ];
    const EMOJIQ = [
      ['🌙⭐🕌', 'رمضان', 'العيد', 'الحج', 'الشتاء'], ['🐝🍯', 'عسل', 'زهرة', 'شمع', 'سكر'], ['☕🌴', 'قهوة وتمر', 'شاي وكعك', 'حليب وبسكويت', 'عصير وكيك'],
      ['🏜️🐪⛺', 'البر', 'البحر', 'المدينة', 'الجبل'], ['⚽🏆', 'كأس العالم', 'السباحة', 'الشطرنج', 'التنس'], ['🌧️☂️', 'مطر', 'ثلج', 'حر', 'غبار'],
      ['🎂🕯️🎉', 'عيد ميلاد', 'زواج', 'تخرج', 'سفر'], ['✈️🧳🌍', 'سفر', 'دراسة', 'نوم', 'طبخ'], ['🦷🪥', 'تنظيف الأسنان', 'حلاقة', 'غسل اليدين', 'استحمام'],
      ['🍳🥚', 'بيض مقلي', 'كيك', 'سلطة', 'عصير'], ['🐟🍟', 'سمك وبطاطس', 'برجر', 'بيتزا', 'كبسة'], ['🌋🔥', 'بركان', 'زلزال', 'إعصار', 'فيضان'],
      ['📚✏️🏫', 'المدرسة', 'المستشفى', 'المطار', 'السوق'], ['🧊❄️⛄', 'شتاء', 'صيف', 'ربيع', 'خريف'], ['👑🏰', 'قصر', 'خيمة', 'شقة', 'مزرعة'],
      ['🚗⛽', 'محطة بنزين', 'مغسلة سيارات', 'ورشة', 'موقف'], ['🎤🎶', 'غناء', 'رقص', 'رسم', 'قراءة'], ['🕷️🕸️', 'عنكبوت', 'نحلة', 'نملة', 'فراشة'],
      ['🌞🏖️🍉', 'إجازة الصيف', 'أيام الدراسة', 'الشتاء', 'الدوام'], ['💤🛏️', 'نوم', 'أكل', 'لعب', 'شغل'], ['🎁🎈🍬', 'عيدية', 'امتحان', 'زحمة', 'دوام'],
      ['🧕🏻👳🏻‍♂️🕋', 'العمرة', 'السوق', 'المدرسة', 'الملعب'], ['🦁👑', 'ملك الغابة', 'فهد سريع', 'نسر طائر', 'دب نائم'], ['📱🔋0️⃣', 'جوالي فاصل', 'جوالي جديد', 'نت سريع', 'رسالة'],
      ['🍕🛵', 'توصيل طلب', 'رحلة', 'سباق', 'تمرين'], ['🥵☀️🌡️', 'حر', 'برد', 'مطر', 'ريح'], ['🌹💐💍', 'زواج', 'تخرج', 'وظيفة', 'نجاح'],
    ];
    const ODD = [
      [['تفاح', 'موز', 'عنب'], 'جزر', 'فواكه'], [['أسد', 'نمر', 'فهد'], 'بقرة', 'مفترسات'], [['أحمر', 'أزرق', 'أخضر'], 'مربع', 'ألوان'],
      [['الرياض', 'جدة', 'الدمام'], 'دبي', 'مدن سعودية'], [['قلم', 'دفتر', 'مسطرة'], 'ملعقة', 'أدوات مدرسة'], [['كبسة', 'مندي', 'مضغوط'], 'كنافة', 'أكلات رز'],
      [['بطريق', 'نسر', 'حمامة'], 'خفاش', 'طيور'], [['حوت', 'دلفين', 'قرش'], 'تمساح', 'بحرية'], [['السبت', 'الأحد', 'الاثنين'], 'رجب', 'أيام'],
      [['محرم', 'صفر', 'رمضان'], 'الخميس', 'أشهر'], [['كرة قدم', 'سلة', 'طائرة'], 'شطرنج', 'ألعاب بالكرة'], [['شاي', 'قهوة', 'حليب'], 'خبز', 'مشروبات'],
      [['عطارد', 'المريخ', 'زحل'], 'القمر', 'كواكب'], [['مثلث', 'دائرة', 'مربع'], 'أصفر', 'أشكال'], [['سيارة', 'باص', 'شاحنة'], 'سفينة', 'مركبات برية'],
      [['عين', 'أنف', 'أذن'], 'ركبة', 'في الوجه'], [['ذهب', 'فضة', 'نحاس'], 'خشب', 'معادن'], [['مطر', 'ثلج', 'برد'], 'رمل', 'من السماء'],
      [['بيانو', 'عود', 'كمان'], 'فرشاة', 'آلات'], [['واحد', 'ثلاثة', 'خمسة'], 'أربعة', 'أعداد فردية'], [['ليمون', 'برتقال', 'يوسفي'], 'بطيخ', 'حمضيات'],
      [['ورد', 'ياسمين', 'توليب'], 'صبار', 'زهور'], [['نملة', 'نحلة', 'فراشة'], 'عنكبوت', 'حشرات'], [['مكة', 'المدينة', 'الطائف'], 'أبها', 'منطقة مكة… تقريبًا'],
    ];
    const MAJ = [
      ['شاي ولا قهوة؟', ['🍵 شاي', '☕ قهوة']], ['بحر ولا بر؟', ['🏖️ بحر', '🏜️ بر']], ['صيف ولا شتاء؟', ['☀️ صيف', '❄️ شتاء']], ['حلو ولا مالح؟', ['🍰 حلو', '🍟 مالح']],
      ['قطط ولا كلاب؟', ['🐱 قطط', '🐶 كلاب']], ['صباح ولا ليل؟', ['🌅 صباح', '🌙 ليل']], ['أفلام ولا مسلسلات؟', ['🎬 أفلام', '📺 مسلسلات']], ['بيتزا ولا برجر؟', ['🍕 بيتزا', '🍔 برجر']],
      ['سفر داخلي ولا خارجي؟', ['🇸🇦 داخلي', '✈️ خارجي']], ['مكالمة ولا رسالة؟', ['📞 مكالمة', '💬 رسالة']], ['شوكولاتة ولا آيسكريم؟', ['🍫 شوكولاتة', '🍦 آيسكريم']], ['آيفون ولا أندرويد؟', ['🍎 آيفون', '🤖 أندرويد']],
      ['تطبخ ولا تطلب؟', ['🍳 أطبخ', '🛵 أطلب']], ['مشي ولا سيارة؟', ['🚶 مشي', '🚗 سيارة']], ['كتاب ولا بودكاست؟', ['📖 كتاب', '🎧 بودكاست']], ['جبل ولا مدينة؟', ['⛰️ جبل', '🏙️ مدينة']],
      ['مطر ولا شمس؟', ['🌧️ مطر', '☀️ شمس']], ['كبسة ولا مندي؟', ['🍛 كبسة', '🍗 مندي']], ['تصحى بدري ولا تسهر؟', ['🐓 بدري', '🦉 أسهر']], ['عصير ولا ماء؟', ['🧃 عصير', '💧 ماء']],
    ];
    const VOTE = ['مين أكثر واحد ينام بدري؟', 'مين أكثر واحد يتأخر عن المواعيد؟', 'مين أطيب طباخ فينا؟', 'مين بيصير مليونير؟', 'مين أكثر واحد يضحك؟', 'مين أكثر واحد على الجوال؟',
      'مين ينسى أغراضه دايم؟', 'مين أفضل واحد في السوالف؟', 'مين ممكن يسافر فجأة؟', 'مين يعرف كل الأخبار قبلنا؟', 'مين أكثر واحد يحب الحلا؟', 'مين بيفوز في مسابقة رقص؟',
      'مين أفضل واحد في التصوير؟', 'مين أكثر واحد يتحمس للمباريات؟', 'مين صاحب أغرب ضحكة؟', 'مين أكثر واحد يحب الأكل الحار؟', 'مين يقدر يعيش بالبر أسبوع؟', 'مين أسرع واحد يرد على الرسائل؟'];
    const COLORS = [['أحمر', '#E53935'], ['أزرق', '#1E63E9'], ['أخضر', '#16A34A'], ['أصفر', '#FACC15'], ['بنفسجي', '#8B5CF6'], ['برتقالي', '#F97316']];
    const ANIM = ['🦒', '🐘', '🦓', '🐪', '🦘', '🐿️', '🦩', '🐢', '🦀', '🐙', '🦋', '🐌', '🦕', '🦖', '🐊', '🐇', '🦔', '🐓', '🦆', '🐬', '🐈', '🐕', '🐎', '🦌', '🐄', '🐖', '🦚', '🦜', '🦢', '🐝', '🕷️', '🦞', '✈️', '🚲', '🎸', '☂️', '🔑', '🏠', '🌵', '🍄', '⚓', '🎈'];

    // أدوات مشتركة لألعاب الخيارات
    const optPub = (r, sub) => {
      const o = { title: r.title, hint: r.hint, icon: r.icon, layout: r.layout || null };
      if (sub === 'show') o.disp = r.disp;
      if (sub === 'open' || sub === 'result') { o.disp = r.mem ? r.disp2 || null : r.disp; o.q = r.q; o.opts = r.opts; }
      if (sub === 'count' && r.preQ) o.q = r.preQ;
      if (sub === 'result') o.answer = r.answer;
      return o;
    };
    const def = (id, cfg) => (A[id] = Object.assign({ id, type: 'compete', mode: 'firstCorrect', view: 'opts', showMs: () => 0, openMs: () => 9000, check: (r, c) => c === r.answer, pub: optPub, valid: (r, c) => Number.isInteger(c) && r.opts && c >= 0 && c < r.opts.length }, cfg));

    // ═══ ألوان مخادعة ═══
    def('stroop', {
      rounds(pr) {
        return Array.from({ length: pr ? 1 : 6 }, (_, i) => {
          const [ink, word] = sample(COLORS, 2);
          const others = sample(COLORS.filter((c) => c !== ink && c !== word), 2);
          const cand = shuffle([ink, word].concat(others));
          const hard = i >= 3;
          const labels = hard ? shuffle(cand.map((c) => c[0])) : cand.map((c) => c[0]);
          const opts = cand.map((c, k) => ({ c: c[1], t: labels[k] }));
          return { title: hard ? 'ألوان مخادعة.. أصعب! 😵' : 'ألوان مخادعة', hint: hard ? 'اضغط اللون نفسه.. لا تصدق الكلمة اللي فوقه' : 'اضغط لون الخط.. مو الكلمة!', icon: '🎨', disp: { type: 'big', t: word[0], color: ink[1] }, q: 'وش لون الخط؟', opts, answer: cand.indexOf(ink) };
        });
      }, openMs: () => 7000,
    });
    // ═══ حسبة سريعة ═══
    def('math', {
      rounds(pr) {
        return Array.from({ length: pr ? 1 : 6 }, (_, i) => {
          let e, v;
          const a = 2 + rnd(i < 2 ? 10 : 20), b = 2 + rnd(i < 2 ? 9 : 15), c = 1 + rnd(9);
          if (i < 2) { e = `${a} + ${b}`; v = a + b; } else if (i < 3) { const x = a + b; e = `${x} − ${b}`; v = a; } else if (i < 5) { const x = 2 + rnd(8), y = 2 + rnd(8); e = `${x} × ${y}`; v = x * y; } else { e = `${a} + ${b} − ${c}`; v = a + b - c; }
          const set = new Set([v]);
          while (set.size < 4) { const d = v + (rnd(2) ? 1 : -1) * (1 + rnd(i > 2 ? 10 : 4)); if (d >= 0) set.add(d); }
          const { opts, answer } = opt([...set].map((n) => ({ t: ar(n), n })).map((o) => o), null);
          const ans = opts.findIndex((o) => o.n === v);
          return { title: 'حسبة سريعة', hint: 'حل المسألة واضغط الجواب قبل الكل', icon: '🧮', disp: { type: 'big', t: ar(e).replace(/\s/g, ' '), ltr: true }, q: 'كم الناتج؟', opts: opts.map((o) => ({ t: o.t })), answer: ans };
        });
      }, openMs: () => 9000,
    });
    // ═══ ظل مين؟ ═══
    def('shadow', {
      rounds(pr) {
        return Array.from({ length: pr ? 1 : 6 }, (_, i) => {
          const [t, ...d] = sample(ANIM, 4);
          const { opts, answer } = opt([t, ...d], t, 'e');
          return { title: 'ظل مين؟', hint: 'شوف الظل.. واعرف صاحبه', icon: '🌑', disp: { type: 'big', e: t, shadow: true, rot: i >= 3 ? (rnd(2) ? 1 : -1) * (20 + rnd(25)) : 0, flip: i >= 4 }, q: 'هذا ظل مين؟', opts, answer, layout: 'emoji' };
        });
      }, openMs: () => 8000,
    });
    // ═══ مين اختفى؟ ═══
    def('missing', {
      rounds(pr) {
        return [5, 6, 6, 7, 8].slice(0, pr ? 1 : 5).map((n, i) => {
          const items = sample(POOL, n);
          const miss = items[rnd(n)];
          const rest = shuffle(items.filter((x) => x !== miss));
          const { opts, answer } = opt([miss, ...sample(POOL.filter((x) => items.indexOf(x) < 0), 2), pick(rest)], miss, 'e');
          return { title: 'مين اختفى؟', hint: 'احفظ العناصر.. بيختفي واحد منها', icon: '🫥', mem: true, memMs: 4200 - i * 300, disp: { type: 'row', items }, disp2: { type: 'row', items: rest, small: true }, q: 'مين اللي اختفى؟', opts, answer, layout: 'emoji' };
        });
      }, showMs: (r) => r.memMs, openMs: () => 9000,
    });
    // ═══ مين ظهر أول؟ ═══
    def('order', {
      rounds(pr) {
        return [4, 4, 5, 5, 6].slice(0, pr ? 1 : 5).map((n, i) => {
          const items = sample(POOL, n);
          const k = rnd(n);
          const { opts, answer } = opt(sample(items.filter((x, j) => j !== k), 3).concat([items[k]]), items[k], 'e');
          const ord = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'][k];
          return { title: 'مين ظهر أول؟', hint: 'الصور بتطلع وحدة ورا الثانية.. انتبه للترتيب', icon: '🔢', mem: true, step: 900 - i * 80, disp: { type: 'seq', items, step: 900 - i * 80 }, disp2: { type: 'big', t: '❓' }, q: 'وش كان ' + ord + '؟', opts, answer, layout: 'emoji' };
        });
      }, showMs: (r) => r.disp.items.length * r.step + 300, openMs: () => 9000,
    });
    // ═══ خمّنها بالإيموجي ═══
    def('emojiq', {
      rounds(pr) {
        return sample(EMOJIQ, pr ? 1 : 6).map(([e, a, ...d]) => { const { opts, answer } = opt([a, ...d], a); return { title: 'خمّنها بالإيموجي', hint: 'اقرأ الإيموجي.. وش المقصود؟', icon: '🤔', disp: { type: 'big', e }, q: 'وش المقصود؟', opts, answer }; });
      }, openMs: () => 10000,
    });
    // ═══ تحدي المعلومات ═══
    def('trivia', {
      rounds(pr) {
        return sample(TRIVIA, pr ? 1 : 7).map(([q, a, ...d]) => { const { opts, answer } = opt([a, ...d], a); return { title: 'تحدي المعلومات', hint: 'سؤال وأربع خيارات.. الأسرع بالصح يفوز', icon: '🧠', disp: { type: 'text', t: q }, q: '', opts, answer }; });
      }, openMs: () => 12000,
    });
    // ═══ صح ولا خطأ ═══
    def('truefalse', {
      rounds(pr) {
        return sample(TF, pr ? 1 : 8).map(([s, v]) => ({ title: 'صح ولا خطأ؟', hint: 'جملة.. قرر بسرعة! الغلط يطلعك من الجولة', icon: '⚖️', disp: { type: 'text', t: s }, q: '', opts: [{ t: 'صح ✅', c2: '#19C2A0' }, { t: 'خطأ ❌', c2: '#FF5B4A' }], answer: v ? 0 : 1, layout: 'two' }));
      }, openMs: () => 8000,
    });
    // ═══ الكلمة الدخيلة ═══
    def('oddword', {
      rounds(pr) {
        return sample(ODD, pr ? 1 : 6).map(([ins, odd]) => { const { opts, answer } = opt([...ins, odd], odd); return { title: 'الكلمة الدخيلة', hint: 'ثلاث كلمات من نفس العائلة.. وحدة دخيلة', icon: '🕵️', q: 'مين الدخيلة؟', opts, answer }; });
      }, openMs: () => 9000,
    });
    // ═══ عكس السهم ═══
    const ARW = [['⬅️', '➡️'], ['➡️', '⬅️'], ['⬆️', '⬇️'], ['⬇️', '⬆️']];
    def('arrows', {
      rounds(pr) {
        return Array.from({ length: pr ? 1 : 8 }, (_, i) => {
          const [a, op] = pick(ARW);
          const rev = i === 0 ? false : rnd(2) === 1;
          const target = rev ? op : a;
          return { title: 'عكس السهم', hint: 'مرة «نفس» ومرة «عكس».. اقرأ الأمر زين', icon: '🧭', disp: { type: 'arrow', e: a, cmd: rev ? 'عكس!' : 'نفس!' }, q: '', opts: ['⬆️', '⬅️', '➡️', '⬇️'].map((e) => ({ e })), answer: ['⬆️', '⬅️', '➡️', '⬇️'].indexOf(target), layout: 'arrows' };
        });
      }, openMs: () => 5000,
    });
    // ═══ كمّل النمط ═══
    def('pattern', {
      rounds(pr) {
        return Array.from({ length: pr ? 1 : 6 }, (_, i) => {
          const [x, y, z] = sample(POOL, 3);
          let seq, ans, d;
          const kind = i % 5;
          if (kind === 0) { seq = [x, y, x, y, x]; ans = y; }
          else if (kind === 1) { seq = [x, x, y, x, x]; ans = y; }
          else if (kind === 2) { seq = [x, y, z, x, y]; ans = z; }
          else if (kind === 3) { seq = [x, y, y, x, y]; ans = y; }
          else { const s = 2 + rnd(4), a = 1 + rnd(5); const ns = [0, 1, 2, 3, 4].map((k) => a + k * s); seq = ns.map(ar); ans = ar(a + 5 * s); d = [ar(a + 5 * s + 1), ar(a + 5 * s - 1), ar(a + 4 * s + s * 2)]; }
          const dist = d || shuffle([x, y, z, pick(POOL)].filter((v) => v !== ans)).slice(0, 3);
          const key = kind === 4 ? 't' : 'e';
          const { opts, answer } = opt([ans, ...dist], ans, key);
          return { title: 'كمّل النمط', hint: 'شوف التسلسل.. وش اللي بعده؟', icon: '🧩', disp: { type: 'row', items: seq.concat(['❓']) }, q: 'وش اللي بعده؟', opts, answer, layout: key === 'e' ? 'emoji' : null };
        });
      }, openMs: () => 9000,
    });
    // ═══ احفظ الرقم ═══
    def('digits', {
      view: 'numpad',
      rounds(pr) {
        return [4, 5, 6, 7, 8].slice(0, pr ? 1 : 5).map((n) => {
          let s = String(1 + rnd(9)); while (s.length < n) s += rnd(10);
          return { title: 'احفظ الرقم', hint: 'رقم بيظهر ثواني.. اكتبه صح قبل الكل', icon: '🔢', len: n, disp: { type: 'digits', t: ar(s) }, answer: s, memMs: 1600 + n * 250 };
        });
      }, showMs: (r) => r.memMs, openMs: () => 12000,
      check: (r, c) => String(c) === r.answer, valid: (r, c) => typeof c === 'string' && /^\d{1,10}$/.test(c),
      pub(r, sub) { const o = { title: r.title, hint: r.hint, icon: r.icon, len: r.len, q: 'اكتب الرقم' }; if (sub === 'show') o.disp = r.disp; if (sub === 'result') { o.answer = r.answer; o.disp = r.disp; } return o; },
    });
    // ═══ كم عددها؟ ═══
    def('estimate', {
      view: 'numpad', mode: 'closest',
      rounds(pr) {
        return Array.from({ length: pr ? 1 : 5 }, (_, i) => {
          const n = 12 + rnd(14) + i * 8; const e = pick(POOL);
          const pts = Array.from({ length: n }, () => [4 + rnd(92), 6 + rnd(88), rnd(40) - 20]);
          return { title: 'كم عددها؟', hint: 'تظهر ثانيتين بس.. قدّر العدد، الأقرب يفوز', icon: '🫘', len: 3, disp: { type: 'scatter', e, pts }, target: n, memMs: 2400 };
        });
      }, showMs: (r) => r.memMs, openMs: () => 12000,
      check: () => true, valid: (r, c) => typeof c === 'string' && /^\d{1,4}$/.test(c),
      pub(r, sub) { const o = { title: r.title, hint: r.hint, icon: r.icon, len: r.len, q: 'كم ' + r.disp.e + ' شفت؟' }; if (sub === 'show' || sub === 'result') o.disp = r.disp; if (sub === 'result') o.answer = r.target; return o; },
      resolve(r, ans) {
        const list = Object.entries(ans).map(([id, a]) => ({ id, v: +a.choice, d: Math.abs(+a.choice - r.target) })).sort((a, b) => a.d - b.d);
        const gain = {}; [100, 60, 30].forEach((p, i) => { if (list[i]) gain[list[i].id] = list[i].d === 0 ? p + 50 : p; });
        return { gain, info: { rank: list, target: ar(r.target), unit: '' }, winner: list[0] && list[0].id };
      },
    });
    // ═══ إحساس الوقت ═══
    def('timer', {
      view: 'clock', mode: 'closest',
      rounds(pr) { return (pr ? [3] : [3, 5, 7, 10]).map((s) => ({ title: 'إحساس الوقت', hint: 'اضغط بعد ' + ar(s) + ' ثواني بالضبط.. والعداد مخفي!', icon: '⏱️', secs: s })); },
      openMs: (r) => r.secs * 1000 + 4000, check: () => true, valid: () => true,
      pub(r) { return { title: r.title, hint: r.hint, icon: r.icon, secs: r.secs }; },
      resolve(r, ans) {
        const T = r.secs * 1000;
        const list = Object.entries(ans).map(([id, a]) => ({ id, v: a.adj, d: Math.abs(a.adj - T) })).sort((a, b) => a.d - b.d);
        const gain = {}; [100, 60, 30].forEach((p, i) => { if (list[i]) gain[list[i].id] = p; });
        return { gain, info: { rank: list.map((x) => Object.assign(x, { v: ar((x.v / 1000).toFixed(2)) })), target: ar(r.secs) + ' ث', unit: ' ث' }, winner: list[0] && list[0].id };
      },
    });
    // ═══ ضغط جنوني ═══
    def('taps', {
      view: 'taps', mode: 'taps',
      rounds(pr) { return (pr ? [4000] : [5000, 5000, 7000]).map((ms, i) => ({ title: i === 2 ? 'الجولة الطويلة! 💪' : 'ضغط جنوني', hint: 'اضغط الزر أكثر عدد ممكن في ' + ar(ms / 1000) + ' ثواني', icon: '👆', ms })); },
      openMs: (r) => r.ms, check: () => true, valid: () => true,
      pub(r) { return { title: r.title, hint: r.hint, icon: r.icon, ms: r.ms }; },
      resolve(r, ans) {
        const list = Object.entries(ans).map(([id, a]) => ({ id, v: ar(a.count), n: a.count })).sort((a, b) => b.n - a.n);
        const gain = {}; [100, 60, 30].forEach((p, i) => { if (list[i] && list[i].n > 0) gain[list[i].id] = p; });
        return { gain, info: { rank: list, unit: ' ضغطة' }, winner: list[0] && list[0].id };
      },
    });
    // ═══ تتابع الألوان ═══
    def('simon', {
      view: 'simon',
      rounds(pr) {
        return (pr ? [3] : [3, 4, 5, 6, 7]).map((n, i) => { const seq = []; for (let k = 0; k < n; k++) { let v; do v = rnd(4); while (k && v === seq[k - 1] && rnd(3)); seq.push(v); } return { title: 'تتابع الألوان', hint: 'احفظ ترتيب الألوان (' + ar(n) + ').. وكرره بنفس الترتيب', icon: '🚥', seq, step: 720 - i * 50 }; });
      },
      showMs: (r) => r.seq.length * r.step + 400, openMs: (r) => 6000 + r.seq.length * 900,
      check: (r, c) => Array.isArray(c) && c.length === r.seq.length && c.every((v, i) => v === r.seq[i]),
      valid: (r, c) => Array.isArray(c) && c.length <= 12 && c.every((v) => Number.isInteger(v) && v >= 0 && v < 4),
      pub(r, sub) { const o = { title: r.title, hint: r.hint, icon: r.icon, len: r.seq.length, step: r.step }; if (sub === 'show' || sub === 'result') o.seq = r.seq; return o; },
    });
    // ═══ لا تتشابهون (تعاوني) ═══
    def('unique', {
      type: 'coop', mode: 'collect',
      rounds(pr, room) {
        const n = Math.max(2, room.connectedPlayers().length);
        const sets = [Array.from({ length: n }, (_, k) => ({ t: ar(k + 1) })), sample(POOL, n).map((e) => ({ e })), sample(POOL, n).map((e) => ({ e }))];
        return (pr ? [0] : [0, 1, 0, 2, 1]).map((k) => ({ title: 'لا تتشابهون!', hint: 'كل واحد يختار شي مختلف.. بدون كلام! عددها بعددكم بالضبط', icon: '🙅', q: 'اختر شي ما أحد بيختاره', opts: shuffle(sets[k]), layout: k ? 'emoji' : null }));
      }, openMs: () => 12000, check: () => true,
      resolve(r, ans, room) {
        const counts = r.opts.map(() => 0); Object.values(ans).forEach((a) => counts[a.choice]++);
        const n = Math.max(1, room.connectedPlayers().length);
        const solo = counts.filter((c) => c === 1).length;
        const pct = Math.round((solo / n) * 100);
        return { info: { counts, pct, kind: 'unique' }, pct };
      },
    });
    // ═══ مع الأغلبية ═══
    def('majority', {
      mode: 'collect',
      rounds(pr) { return sample(MAJ, pr ? 1 : 6).map(([q, o]) => ({ title: 'مع الأغلبية', hint: 'اختار اللي تتوقع أغلب الجماعة بيختارونه', icon: '👥', q, opts: o.map((t) => ({ t })), layout: 'two' })); },
      openMs: () => 10000, check: () => true,
      resolve(r, ans) {
        const counts = r.opts.map(() => 0); Object.values(ans).forEach((a) => counts[a.choice]++);
        const top = Math.max(...counts); const winners = counts.map((c, i) => (c === top ? i : -1)).filter((i) => i >= 0);
        const gain = {}; Object.entries(ans).forEach(([id, a]) => { if (winners.indexOf(a.choice) >= 0 && top > 0) gain[id] = winners.length > 1 ? 50 : 100; });
        return { gain, info: { counts, top: winners.length === 1 ? winners[0] : -1, kind: 'majority' } };
      },
    });
    // ═══ مين فينا؟ (اجتماعي) ═══
    def('vote', {
      type: 'social', mode: 'collect',
      rounds(pr, room) {
        const ps = room.connectedPlayers();
        return sample(VOTE, pr ? 1 : 6).map((q) => ({ title: 'مين فينا؟', hint: 'صوّتوا بصراحة 😄 التصويت يطلع للكل بالنهاية', icon: '🫵', q, opts: ps.map((p) => ({ e: p.emoji, t: p.name, pid: p.id })), layout: 'people' }));
      }, openMs: () => 12000, check: () => true,
      resolve(r, ans) {
        const counts = r.opts.map(() => 0); Object.values(ans).forEach((a) => counts[a.choice]++);
        const top = Math.max(...counts); const ws = counts.map((c, i) => (c === top && c > 0 ? i : -1)).filter((i) => i >= 0);
        return { info: { counts, top: ws.length === 1 ? ws[0] : -1, tie: ws.length > 1, kind: 'vote' } };
      },
    });
    return A;
  };
});
