/* =================================================================
   SESSIONS — التخطيط الزمني v2 · متكامل
   ─────────────────────────────────────────────────────────────────
   1. إحصاءات سريعة (الإجمالي / اليوم / الأسبوع / المنتهية)
   2. عرض أيام الأسبوع مع مؤشرات الحصص
   3. تبويبات الفلترة: الكل / اليوم / هذا الأسبوع / القادمة / السابقة
   4. فلتر الفصيل + فلتر المادة
   5. بطاقات حصص غنية (الدرس · التمارين · الفرض · الأهداف · الملاحظات)
   6. نموذج تخطيط شامل (قسمان: أساسيات + محتوى)
================================================================= */

/* ── تهيئة حالة الفلاتر ───────────────────────────────────── */
function _sessInit() {
  if (filSess.tab     === undefined) filSess.tab     = 'all';
  if (filSess.cls     === undefined) filSess.cls     = 'all';
  if (filSess.subjFil === undefined) filSess.subjFil = 'all';
}

/* ── حساب حدود الأسبوع الحالي ──────────────────────────────── */
function _weekBounds() {
  const t   = today();
  const d   = new Date(t);
  const dow = d.getDay();                                   // 0=أحد ... 6=سبت
  // نبدأ الأسبوع من الاثنين
  const diff = dow === 0 ? -6 : 1 - dow;
  const ws   = new Date(d); ws.setDate(d.getDate() + diff);
  const we   = new Date(ws); we.setDate(ws.getDate() + 6);
  return {
    start: ws.toISOString().slice(0, 10),
    end:   we.toISOString().slice(0, 10),
  };
}

/* ════════════════════════════════════════════════════════════
   renderSessions — الدالة الرئيسية
   ═══════════════════════════════════════════════════════════ */
function renderSessions() {
  _sessInit();
  const t       = today();
  const { start: wStart, end: wEnd } = _weekBounds();

  /* ── فلترة البيانات ──────────────────────────────────────── */
  let pool = [...DATA.sessions];
  if (filSess.cls     !== 'all') pool = pool.filter(s => s.cls  === filSess.cls);
  if (filSess.subjFil !== 'all') pool = pool.filter(s => s.subj === filSess.subjFil);

  let filtered;
  switch (filSess.tab) {
    case 'today':    filtered = pool.filter(s => s.date === t);                           break;
    case 'week':     filtered = pool.filter(s => s.date >= wStart && s.date <= wEnd);     break;
    case 'upcoming': filtered = pool.filter(s => s.date > t);                             break;
    case 'past':     filtered = pool.filter(s => s.date < t);                             break;
    default:         filtered = pool;
  }

  /* ترتيب: القادمة تصاعدياً ثم الماضية تنازلياً */
  const upcoming = filtered
    .filter(s => s.date >= t)
    .sort((a, b) => a.date !== b.date ? (a.date > b.date ? 1 : -1) : ((a.time||'') > (b.time||'') ? 1 : -1));
  const past = filtered
    .filter(s => s.date < t)
    .sort((a, b) => a.date > b.date ? -1 : 1);

  /* ── إحصاءات (على كامل DATA.sessions، بدون فلتر) ────────── */
  const all        = DATA.sessions;
  const totalCount = all.length;
  const todayCnt   = all.filter(s => s.date === t).length;
  const weekCnt    = all.filter(s => s.date >= wStart && s.date <= wEnd).length;
  const pastCnt    = all.filter(s => s.date < t).length;

  /* ── ترتيب الأسبوع: أيام من الاثنين إلى الأحد ───────────── */
  const DAYS_AR  = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const DAYS_SH  = ['أحد','اثن','ثلا','أرب','خمس','جمع','سبت'];
  const weekDays = [];
  const ws0      = new Date(wStart);
  for (let i = 0; i < 7; i++) {
    const dd  = new Date(ws0); dd.setDate(ws0.getDate() + i);
    const iso = dd.toISOString().slice(0, 10);
    const cnt = DATA.sessions.filter(s => s.date === iso).length;
    weekDays.push({ iso, day: dd.getDate(), dow: dd.getDay(), cnt, isToday: iso === t });
  }

  /* ════════════════ HTML ════════════════════════════════════ */
  const sec = document.getElementById('sec-sessions');
  sec.innerHTML = `

    <!-- ══ 1. الإحصاءات السريعة ══ -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
      ${_sessStat('الإجمالي',  totalCount, 'var(--accent)',  'var(--accent-light)', 'all')}
      ${_sessStat('اليوم',     todayCnt,   'var(--green)',   'var(--green-light)',  'today')}
      ${_sessStat('الأسبوع',   weekCnt,    'var(--amber)',   'var(--amber-light)',  'week')}
      ${_sessStat('المنتهية',  pastCnt,    'var(--text-3)', 'var(--surface-2)',    'past')}
    </div>

    <!-- ══ 2. عرض أيام الأسبوع ══ -->
    <div class="panel" style="padding:14px;margin-bottom:12px">
      <div style="font-size:10px;font-weight:800;color:var(--text-3);
        text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px">
        أيام هذا الأسبوع
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
        ${weekDays.map(wd => `
          <div style="
            display:flex;flex-direction:column;align-items:center;gap:4px;
            padding:8px 4px;border-radius:10px;cursor:default;
            background:${wd.isToday ? 'var(--accent)' : wd.cnt > 0 ? 'var(--accent-light)' : 'var(--surface-2)'};
            transition:background .15s;
          ">
            <div style="font-size:10px;font-weight:700;
              color:${wd.isToday ? 'rgba(255,255,255,.75)' : 'var(--text-3)'}">
              ${DAYS_SH[wd.dow]}
            </div>
            <div style="font-size:15px;font-weight:800;font-family:var(--mono);
              color:${wd.isToday ? '#fff' : wd.cnt > 0 ? 'var(--accent)' : 'var(--text)'}">
              ${wd.day}
            </div>
            ${wd.cnt > 0
              ? `<div style="width:18px;height:18px;border-radius:50%;
                  background:${wd.isToday ? 'rgba(255,255,255,.25)' : 'var(--accent)'};
                  display:flex;align-items:center;justify-content:center;
                  font-size:10px;font-weight:800;
                  color:${wd.isToday ? '#fff' : '#fff'}">
                  ${wd.cnt}
                </div>`
              : `<div style="width:6px;height:6px;border-radius:50%;
                  background:${wd.isToday ? 'rgba(255,255,255,.35)' : 'var(--border)'}"></div>`}
          </div>`).join('')}
      </div>
    </div>

    <!-- ══ 3. تبويبات الفلترة ══ -->
    <div class="tabs-scroll" style="margin-bottom:12px">
      ${[
        { key:'all',      label:'الكل' },
        { key:'today',    label:'اليوم' },
        { key:'week',     label:'هذا الأسبوع' },
        { key:'upcoming', label:'القادمة' },
        { key:'past',     label:'السابقة' },
      ].map(tab => `
        <button class="tab-btn ${filSess.tab === tab.key ? 'active' : ''}"
          onclick="setSessTab('${tab.key}')">
          ${tab.label}
        </button>`).join('')}
    </div>

    <!-- ══ 4. فلتر الفصيل ══ -->
    <div class="class-tabs" style="margin-bottom:10px">
      <button class="class-tab"
        onclick="setSessClsF('all')"
        style="${filSess.cls === 'all'
          ? 'background:var(--accent);color:#fff;border-color:var(--accent);flex:1'
          : 'flex:1'}">
        الكل
      </button>
      ${CLASSES.map(c => `
        <button class="class-tab ${filSess.cls === c.id ? 'act-' + c.id : ''}"
          onclick="setSessClsF('${c.id}')" style="flex:1">
          ${c.label}
        </button>`).join('')}
    </div>

    <!-- فلتر المادة -->
    <div class="subj-row" style="margin-bottom:14px">
      <button class="subj-pill"
        onclick="setSessSubjF('all')"
        style="${filSess.subjFil === 'all'
          ? 'background:var(--accent-light);border-color:var(--accent);color:var(--accent)'
          : ''}">
        كل المواد
      </button>
      ${SUBJECTS.map(s => `
        <button class="subj-pill ${filSess.subjFil === s.id ? s.cls : ''}"
          onclick="setSessSubjF('${s.id}')">
          ${s.label}
        </button>`).join('')}
    </div>

    <!-- ══ 5. قائمة الحصص ══ -->
    ${filtered.length === 0
      ? `<div class="panel">${emptyHtml(
          'لا توجد حصص',
          filSess.tab === 'today'
            ? 'لا توجد حصص مجدولة اليوم'
            : filSess.tab === 'upcoming'
            ? 'لا توجد حصص قادمة — خطط الآن!'
            : 'اضغط + لتخطيط حصة جديدة'
        )}</div>`
      : `
        ${upcoming.length > 0 ? `
          <div class="section-header">
            <h2>${filSess.tab === 'past' ? 'الحصص' : upcoming.some(s => s.date === t) && upcoming.some(s => s.date > t) ? 'اليوم والقادمة' : upcoming[0]?.date === t ? 'حصص اليوم' : 'الحصص القادمة'}</h2>
            <span class="count-badge">${upcoming.length}</span>
          </div>
          ${upcoming.map(s => _sessCard(s, t)).join('')}` : ''}

        ${past.length > 0 && filSess.tab !== 'upcoming' ? `
          <div class="section-header" style="margin-top:${upcoming.length ? '10px' : '0'}">
            <h2>الحصص السابقة</h2>
            <span class="count-badge">${past.length}</span>
          </div>
          ${past.map(s => _sessCard(s, t)).join('')}` : ''}
      `}
  `;

  /* تفعيل الطي / الفتح للبطاقات */
  sec.querySelectorAll('.session-card-head').forEach(h => {
    h.addEventListener('click', () => {
      const card    = h.parentElement;
      const isOpen  = card.classList.toggle('open');
      const chevron = h.querySelector('.sess-chevron');
      if (chevron) chevron.style.transform = isOpen ? 'rotate(180deg)' : 'none';
    });
  });
}

/* ════════════════════════════════════════════════════════════
   بطاقة إحصاء
   ═══════════════════════════════════════════════════════════ */
function _sessStat(label, value, color, bg, tab) {
  const active = filSess.tab === tab;
  return `
    <button onclick="setSessTab('${tab}')" style="
      background:${active ? color : bg};
      border:none;
      border-radius:14px;
      padding:12px 6px;
      text-align:center;
      cursor:pointer;
      transition:all .2s;
      box-shadow:${active ? '0 4px 14px rgba(0,0,0,.18)' : 'none'};
    ">
      <div style="font-size:24px;font-weight:800;font-family:var(--mono);
        color:${active ? '#fff' : color};line-height:1.1">
        ${value}
      </div>
      <div style="font-size:10px;font-weight:700;margin-top:4px;
        color:${active ? 'rgba(255,255,255,.8)' : color}">
        ${label}
      </div>
    </button>`;
}

/* ════════════════════════════════════════════════════════════
   بطاقة حصة كاملة
   ═══════════════════════════════════════════════════════════ */
function _sessCard(x, t) {
  const isToday = x.date === t;
  const isPast  = x.date < t;
  const sj      = subjById(x.subj);
  const cl      = clsById(x.cls);

  /* حساب الأيام المتبقية أو المنقضية */
  let daysChip = '';
  if (isToday) {
    daysChip = `<span style="font-size:10px;padding:2px 8px;border-radius:20px;
      font-weight:700;background:rgba(59,79,192,.15);color:var(--accent)">اليوم ✦</span>`;
  } else if (!isPast) {
    const d = Math.ceil((new Date(x.date) - new Date(t)) / 86400000);
    daysChip = `<span style="font-size:10px;padding:2px 8px;border-radius:20px;
      font-weight:700;background:var(--green-light);color:var(--green)">
      بعد ${d} ${d === 1 ? 'يوم' : 'أيام'}
    </span>`;
  } else {
    const d = Math.ceil((new Date(t) - new Date(x.date)) / 86400000);
    daysChip = `<span style="font-size:10px;padding:2px 8px;border-radius:20px;
      font-weight:700;background:var(--surface-2);color:var(--text-3)">
      ${d === 1 ? 'أمس' : 'منذ ' + d + ' أيام'}
    </span>`;
  }

  const MONTHS_SH = ['يناير','فبراير','مارس','أبريل','ماي','يونيو',
                     'يوليوز','غشت','شتنبر','أكتوبر','نونبر','دجنبر'];
  const dayNum  = x.date ? parseInt(x.date.slice(8))      : '?';
  const monName = x.date ? MONTHS_SH[parseInt(x.date.slice(5,7))-1] || '' : '';

  const hasBody = x.lesson || x.exercises || x.homework ||
                  x.objectives || x.notes || x.duration || DATA.settings.adminMode;

  return `
    <div class="session-card" data-id="${x.id}" style="
      border-right:4px solid ${sj.color || 'var(--accent)'};
      ${isToday ? 'box-shadow:0 4px 20px rgba(59,79,192,.18);' : ''}
    ">

      <!-- ─── رأس البطاقة ─── -->
      <div class="session-card-head" style="padding:14px;gap:12px">

        <!-- التاريخ -->
        <div style="display:flex;flex-direction:column;align-items:center;
          min-width:44px;flex-shrink:0">
          <div style="font-size:24px;font-weight:800;font-family:var(--mono);
            color:${isToday ? 'var(--accent)' : isPast ? 'var(--text-3)' : 'var(--text)'};
            line-height:1">
            ${dayNum}
          </div>
          <div style="font-size:10px;color:var(--text-3);font-weight:600;
            text-transform:uppercase;margin-top:1px">
            ${monName}
          </div>
          ${x.time ? `<div style="font-size:11px;font-family:var(--mono);
            color:var(--accent);font-weight:700;margin-top:4px;
            background:var(--accent-light);padding:2px 5px;border-radius:5px">
            ${x.time}
          </div>` : ''}
        </div>

        <!-- فاصل عمودي -->
        <div style="width:1px;background:var(--border);
          align-self:stretch;flex-shrink:0"></div>

        <!-- المعلومات -->
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px;
            margin-bottom:6px;flex-wrap:wrap">
            <span class="badge badge-${sj.cls || 'blue'}"
              style="font-size:10px;padding:2px 7px">${sj.short}</span>
            <span class="badge ${classBadge(cl.id)}"
              style="font-size:10px;padding:2px 7px">${cl.short}</span>
            ${daysChip}
          </div>
          <div style="font-size:14px;font-weight:800;color:var(--text);
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${esc(x.title)}
          </div>
          ${x.lesson ? `<div style="font-size:12px;color:var(--text-3);
            margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${IC.book}&nbsp;${esc(x.lesson)}
          </div>` : ''}
        </div>

        <!-- سهم الطي -->
        ${hasBody ? `<div class="sess-chevron" style="color:var(--text-3);
          flex-shrink:0;transition:transform .25s">
          ${IC.chevDown}
        </div>` : `<div style="width:16px"></div>`}
      </div>

      <!-- ─── جسم البطاقة ─── -->
      ${hasBody ? `
        <div class="session-card-body" style="padding:0 14px 14px">

          ${x.lesson ? `
            <div style="display:flex;align-items:flex-start;gap:10px;
              padding:10px 0;border-bottom:1px solid var(--border)">
              <div style="width:34px;height:34px;border-radius:10px;flex-shrink:0;
                background:var(--accent-light);color:var(--accent);
                display:flex;align-items:center;justify-content:center">
                ${IC.book}
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-size:10px;font-weight:800;color:var(--text-3);
                  text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px">
                  الدرس المقرر
                </div>
                <div style="font-size:13px;font-weight:600;color:var(--text)">
                  ${esc(x.lesson)}
                </div>
              </div>
            </div>` : ''}

          ${x.objectives ? `
            <div style="display:flex;align-items:flex-start;gap:10px;
              padding:10px 0;border-bottom:1px solid var(--border)">
              <div style="width:34px;height:34px;border-radius:10px;flex-shrink:0;
                background:var(--green-light);color:var(--green);
                display:flex;align-items:center;justify-content:center">
                ${IC.check}
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-size:10px;font-weight:800;color:var(--text-3);
                  text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px">
                  أهداف الحصة
                </div>
                <div style="font-size:13px;color:var(--text);
                  line-height:1.6;white-space:pre-line">
                  ${esc(x.objectives)}
                </div>
              </div>
            </div>` : ''}

          ${x.exercises ? `
            <div style="display:flex;align-items:flex-start;gap:10px;
              padding:10px 0;border-bottom:1px solid var(--border)">
              <div style="width:34px;height:34px;border-radius:10px;flex-shrink:0;
                background:var(--amber-light);color:var(--amber);
                display:flex;align-items:center;justify-content:center">
                ${IC.pen}
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-size:10px;font-weight:800;color:var(--text-3);
                  text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px">
                  التمارين
                </div>
                <div style="font-size:13px;color:var(--text);
                  line-height:1.6;white-space:pre-line">
                  ${esc(x.exercises)}
                </div>
              </div>
            </div>` : ''}

          ${x.homework ? `
            <div style="display:flex;align-items:flex-start;gap:10px;
              padding:10px 0;border-bottom:1px solid var(--border)">
              <div style="width:34px;height:34px;border-radius:10px;flex-shrink:0;
                background:var(--danger-light);color:var(--danger);
                display:flex;align-items:center;justify-content:center">
                ${IC.clip}
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-size:10px;font-weight:800;color:var(--text-3);
                  text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px">
                  الفرض
                </div>
                <div style="font-size:13px;color:var(--text)">
                  ${esc(x.homework)}
                </div>
              </div>
            </div>` : ''}

          ${x.duration ? `
            <div style="display:flex;align-items:center;gap:10px;
              padding:10px 0;border-bottom:1px solid var(--border)">
              <div style="width:34px;height:34px;border-radius:10px;flex-shrink:0;
                background:var(--purple-light);color:var(--purple);
                display:flex;align-items:center;justify-content:center">
                ${IC.clock}
              </div>
              <div>
                <div style="font-size:10px;font-weight:800;color:var(--text-3);
                  text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px">
                  المدة
                </div>
                <div style="font-size:13px;font-weight:700;color:var(--text)">
                  ${esc(x.duration)} دقيقة
                </div>
              </div>
            </div>` : ''}

          ${x.notes ? `
            <div style="margin-top:10px;padding:12px;
              background:var(--surface-2);border-radius:10px;
              border-right:3px solid var(--border-2)">
              <div style="font-size:10px;font-weight:800;color:var(--text-3);
                text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">
                ملاحظات
              </div>
              <div style="font-size:13px;color:var(--text-2);
                line-height:1.7;white-space:pre-line">
                ${esc(x.notes)}
              </div>
            </div>` : ''}

          <!-- أزرار الإدارة (وضع الإدارة فقط) -->
          ${DATA.settings.adminMode ? `
            <div style="display:flex;gap:8px;margin-top:14px">
              <button class="btn btn-outline btn-sm" style="flex:1"
                onclick="openSessionForm('${x.id}')">
                ${IC.edit}&nbsp; تعديل
              </button>
              <button class="btn btn-danger btn-sm"
                onclick="deleteSession('${x.id}')">
                ${IC.trash}
              </button>
            </div>` : ''}
        </div>` : ''}
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   دوال الفلاتر
   ═══════════════════════════════════════════════════════════ */
function setSessTab(tab)       { _sessInit(); filSess.tab     = tab;  renderSessions(); }
function setSessClsF(cls)      { _sessInit(); filSess.cls     = cls;  renderSessions(); }
function setSessSubjF(subj)    { _sessInit(); filSess.subjFil = subj; renderSessions(); }

/* توافق مع router.js القديم */
function setSessCls(cls)       { filSess.cls = cls;  renderSessions(); }
function setSessSubj(subj)     { filSess.subjFil = subj; renderSessions(); }

/* ════════════════════════════════════════════════════════════
   نموذج إضافة / تعديل حصة
   ═══════════════════════════════════════════════════════════ */
function openSessionForm(id) {
  _sessInit();
  const x    = id ? (DATA.sessions.find(s => s.id === id) || {}) : {};
  const cls  = x.cls  || (filSess.cls  !== 'all' ? filSess.cls  : CLASSES[0].id);
  const subj = x.subj || (filSess.subjFil !== 'all' ? filSess.subjFil : SUBJECTS[0].id);

  const clsOpts  = CLASSES.map(c =>
    `<option value="${c.id}" ${cls  === c.id ? 'selected' : ''}>${c.label}</option>`).join('');
  const subjOpts = SUBJECTS.map(s =>
    `<option value="${s.id}" ${subj === s.id ? 'selected' : ''}>${s.label}</option>`).join('');

  showSheet(id ? 'تعديل حصة' : 'تخطيط حصة جديدة', `

    <!-- ─── قسم 1: الأساسيات ─── -->
    <div style="font-size:11px;font-weight:800;color:var(--accent);
      text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px;
      padding:6px 10px;background:var(--accent-light);border-radius:8px">
      الأساسيات
    </div>

    <div class="field-grid-2">
      <div class="field-row">
        <label>الفصيل <span style="color:var(--danger)">*</span></label>
        <select class="field" id="xf-cls">${clsOpts}</select>
      </div>
      <div class="field-row">
        <label>المادة <span style="color:var(--danger)">*</span></label>
        <select class="field" id="xf-subj">${subjOpts}</select>
      </div>
    </div>

    <div class="field-row">
      <label>عنوان الحصة <span style="color:var(--danger)">*</span></label>
      <input class="field" id="xf-title"
        placeholder="موضوع الحصة أو عنوانها"
        value="${esc(x.title || '')}">
    </div>

    <div class="field-grid-2">
      <div class="field-row">
        <label>التاريخ</label>
        <input class="field" type="date" id="xf-date"
          value="${x.date || today()}">
      </div>
      <div class="field-row">
        <label>الوقت</label>
        <input class="field" type="time" id="xf-time"
          value="${x.time || ''}">
      </div>
    </div>

    <div class="field-row">
      <label>مدة الحصة (بالدقائق)</label>
      <input class="field" type="number" id="xf-duration"
        placeholder="مثال: 60" min="15" max="240"
        value="${esc(x.duration || '')}">
    </div>

    <!-- ─── قسم 2: محتوى الحصة ─── -->
    <div style="height:1px;background:var(--border);margin:14px 0 12px"></div>
    <div style="font-size:11px;font-weight:800;color:var(--purple);
      text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px;
      padding:6px 10px;background:var(--purple-light);border-radius:8px">
      محتوى الحصة
    </div>

    <div class="field-row">
      <label>الدرس المقرر تدريسه</label>
      <input class="field" id="xf-lesson"
        placeholder="عنوان الدرس"
        value="${esc(x.lesson || '')}">
    </div>

    <div class="field-row">
      <label>أهداف الحصة</label>
      <textarea class="field" id="xf-objectives"
        style="min-height:72px"
        placeholder="ما الذي سيتعلمه التلاميذ في هذه الحصة؟">${esc(x.objectives || '')}</textarea>
    </div>

    <div class="field-row">
      <label>التمارين المخططة</label>
      <textarea class="field" id="xf-exercises"
        style="min-height:72px"
        placeholder="التمارين التي ستُنجز خلال الحصة أو تُسند للتلاميذ">${esc(x.exercises || '')}</textarea>
    </div>

    <div class="field-row">
      <label>الفرض (إن وجد)</label>
      <input class="field" id="xf-homework"
        placeholder="عنوان الفرض أو الواجب المنزلي"
        value="${esc(x.homework || '')}">
    </div>

    <!-- ─── قسم 3: ملاحظات ─── -->
    <div style="height:1px;background:var(--border);margin:14px 0 12px"></div>
    <div class="field-row">
      <label>ملاحظات إضافية</label>
      <textarea class="field" id="xf-notes"
        style="min-height:72px"
        placeholder="تذكيرات، وسائل مطلوبة، أشياء يجب تجهيزها...">${esc(x.notes || '')}</textarea>
    </div>

    <input type="hidden" id="xf-id" value="${id || ''}">
  `, [
    { label: 'إلغاء',       cls: 'btn-outline', fn: 'closeSheet()' },
    { label: 'حفظ الحصة',  cls: 'btn-accent',  fn: 'saveSession()' },
  ]);
}

/* ════════════════════════════════════════════════════════════
   حفظ / حذف
   ═══════════════════════════════════════════════════════════ */
function saveSession() {
  const id    = document.getElementById('xf-id').value;
  const title = document.getElementById('xf-title').value.trim();
  if (!title) { toast('أدخل عنوان الحصة', 'error'); return; }

  const obj = {
    cls:        document.getElementById('xf-cls').value,
    subj:       document.getElementById('xf-subj').value,
    title,
    date:       document.getElementById('xf-date').value,
    time:       document.getElementById('xf-time').value,
    duration:   document.getElementById('xf-duration').value.trim(),
    lesson:     document.getElementById('xf-lesson').value.trim(),
    objectives: document.getElementById('xf-objectives').value.trim(),
    exercises:  document.getElementById('xf-exercises').value.trim(),
    homework:   document.getElementById('xf-homework').value.trim(),
    notes:      document.getElementById('xf-notes').value.trim(),
  };

  if (id) {
    const idx = DATA.sessions.findIndex(s => s.id === id);
    if (idx !== -1) Object.assign(DATA.sessions[idx], obj);
    toast('تم تحديث الحصة', 'success');
  } else {
    DATA.sessions.push({ id: uid(), ...obj });
    toast('تمت إضافة الحصة بنجاح', 'success');
  }

  save();
  closeSheet();
  renderSessions();
}

function deleteSession(id) {
  if (!confirm('هل تريد حذف هذه الحصة نهائياً؟')) return;
  DATA.sessions = DATA.sessions.filter(s => s.id !== id);
  save();
  toast('تم حذف الحصة');
  renderSessions();
}
