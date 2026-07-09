/* =================================================================
   ATTENDANCE — الحضور والغياب v2 · متكامل
   ─────────────────────────────────────────────────────────────────
   3 تبويبات:
     1. التسجيل اليومي  — تنقل سريع بين الأيام، تسجيل جماعي، فلتر
     2. التقويم الشهري  — مشبكة ألوان تعكس نسبة الحضور يوماً بيوم
     3. إحصاءات التلاميذ — نسبة حضور مع شريط تقدم لكل تلميذ
================================================================= */

/* ── ثوابت مساعدة ───────────────────────────────────────────── */
const DAYS_AR_SHORT = ['أحد','اثن','ثلا','أرب','خمس','جمع','سبت'];
const DAYS_AR_FULL  = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const MONTHS_ATT    = ['يناير','فبراير','مارس','أبريل','ماي','يونيو',
                       'يوليوز','غشت','شتنبر','أكتوبر','نونبر','دجنبر'];

/* ── تهيئة حالة الفلاتر ─────────────────────────────────────── */
function _attInit() {
  if (!filAtt.date)         filAtt.date         = today();
  if (!filAtt.tab)          filAtt.tab          = 'daily';
  if (!filAtt.statusFilter) filAtt.statusFilter = 'all';
  if (!filAtt.month)        filAtt.month        = today().slice(0, 7);
  if (!filAtt.cls)          filAtt.cls          = CLASSES[0].id;
}

/* ── دالة مساعدة: جلب حالة حضور تلميذ ─────────────────────── */
function _attStatus(sid, cls, date) {
  const r = DATA.attendance.find(a => a.sid === sid && a.date === date && a.cls === cls);
  return r ? r.status : '';
}

/* ── دالة مساعدة: إحصاءات يوم واحد لقسم ────────────────────── */
function _dayStats(cls, date) {
  const stds = studentsOf(cls);
  const recs = DATA.attendance.filter(a => a.date === date && a.cls === cls);
  const nP   = recs.filter(a => a.status === 'present').length;
  const nA   = recs.filter(a => a.status === 'absent').length;
  const nL   = recs.filter(a => a.status === 'late').length;
  const total = stds.length;
  const pct  = total > 0 ? Math.round(((nP + nL) / total) * 100) : 0;
  return { nP, nA, nL, total, pct, recorded: recs.length };
}

/* ════════════════════════════════════════════════════════════
   renderAttendance — الدالة الرئيسية
   ═══════════════════════════════════════════════════════════ */
function renderAttendance() {
  _attInit();
  const sec = document.getElementById('sec-attendance');
  sec.innerHTML = `

    <!-- ══ تبويبات رئيسية ══ -->
    <div class="tabs-scroll" style="margin-bottom:14px">
      ${[
        { key:'daily',    label:`${IC.check}&nbsp; التسجيل اليومي` },
        { key:'calendar', label:`${IC.calendar}&nbsp; التقويم الشهري` },
        { key:'stats',    label:`${IC.chart}&nbsp; إحصاءات التلاميذ` },
      ].map(t => `
        <button class="tab-btn ${filAtt.tab === t.key ? 'active' : ''}"
          onclick="setAttTab('${t.key}')">
          ${t.label}
        </button>`).join('')}
    </div>

    <!-- ══ محتوى التبويب النشط ══ -->
    <div id="att-tab-body"></div>
  `;

  _renderAttTab();
}

function _renderAttTab() {
  const body = document.getElementById('att-tab-body');
  if (!body) return;
  switch (filAtt.tab) {
    case 'daily':    body.innerHTML = _dailyHtml();    break;
    case 'calendar': body.innerHTML = _calendarHtml(); break;
    case 'stats':    body.innerHTML = _statsHtml();    break;
  }
  // إعادة ربط الأحداث بعد إعادة البناء
  _bindAttEvents();
}

/* ════════════════════════════════════════════════════════════
   تبويب 1 — التسجيل اليومي
   ═══════════════════════════════════════════════════════════ */
function _dailyHtml() {
  const { cls, date, statusFilter } = filAtt;
  const stds   = studentsOf(cls);
  const { nP, nA, nL, total, pct } = _dayStats(cls, date);

  const t        = today();
  const isToday  = date === t;
  const dateObj  = new Date(date + 'T00:00:00');
  const dowFull  = DAYS_AR_FULL[dateObj.getDay()];
  const dateDisp = `${parseInt(date.slice(8))} ${MONTHS_ATT[parseInt(date.slice(5,7))-1]} ${date.slice(0,4)}`;

  /* فلترة التلاميذ حسب الحالة */
  let displayStds = stds;
  if (statusFilter !== 'all') {
    displayStds = stds.filter(s => _attStatus(s.id, cls, date) === statusFilter);
  }

  /* نسبة الحضور — لون ديناميكي */
  const pctColor = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--danger)';

  return `
    <!-- فلتر الفصيل -->
    ${classTabsHtml(cls, 'setAttCls')}

    <!-- شريط التنقل بين الأيام -->
    <div class="panel" style="padding:10px 12px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px">
        <button class="btn btn-outline btn-sm" style="padding:8px 10px;flex-shrink:0"
          onclick="shiftAttDate(-1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style="flex:1;text-align:center">
          <div style="font-size:14px;font-weight:800;color:var(--text)">${dateDisp}</div>
          <div style="font-size:11px;color:${isToday ? 'var(--accent)' : 'var(--text-3)'};
            font-weight:700;margin-top:1px">
            ${isToday ? '● اليوم' : dowFull}
          </div>
        </div>
        <button class="btn btn-outline btn-sm" style="padding:8px 10px;flex-shrink:0"
          onclick="shiftAttDate(1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        ${!isToday ? `
          <button class="btn btn-accent btn-sm" style="flex-shrink:0"
            onclick="setAttDate('${t}')">
            اليوم
          </button>` : ''}
      </div>
      <input type="date" id="att-date-inp" value="${date}"
        style="width:100%;margin-top:8px;padding:7px 10px;
          font-size:14px;border-radius:8px;border:1.5px solid var(--border);
          background:var(--surface-2);color:var(--text);font-family:inherit"
        onchange="setAttDate(this.value)">
    </div>

    <!-- الإحصاءات السريعة -->
    ${total === 0 ? '' : `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
      ${_attChip(nP,   'حاضر',    'var(--green)',   'var(--green-light)',  'present')}
      ${_attChip(nA,   'غائب',    'var(--danger)',  'var(--danger-light)', 'absent')}
      ${_attChip(nL,   'متأخر',   'var(--amber)',   'var(--amber-light)',  'late')}
      <div style="
        background:var(--surface-2);border-radius:14px;
        padding:12px 6px;text-align:center">
        <div style="font-size:22px;font-weight:800;font-family:var(--mono);
          color:${pctColor};line-height:1.1">${pct}%</div>
        <div style="font-size:10px;font-weight:700;margin-top:4px;
          color:${pctColor}">نسبة</div>
      </div>
    </div>
    <!-- شريط التقدم -->
    <div class="progress-bar" style="margin-bottom:14px">
      <div class="progress-fill" style="width:${pct}%;background:${pctColor}"></div>
    </div>`}

    <!-- شريط الإجراءات -->
    ${total === 0 ? '' : `
    <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
      <button class="btn btn-green btn-sm" style="gap:5px"
        onclick="markAllPresent('${cls}','${date}')">
        ${IC.check}&nbsp; تحضير الكل
      </button>
      <button class="btn btn-outline btn-sm"
        onclick="clearAttDay('${cls}','${date}')">
        مسح اليوم
      </button>
      <div style="flex:1"></div>
      <select id="att-status-filter"
        style="padding:7px 10px;font-size:12px;font-weight:700;
          border-radius:9px;border:1.5px solid var(--border);
          background:var(--surface);color:var(--text);font-family:inherit"
        onchange="setAttStatusFilter(this.value)">
        <option value="all"     ${statusFilter==='all'     ?'selected':''}>الكل</option>
        <option value="present" ${statusFilter==='present' ?'selected':''}>الحاضرون</option>
        <option value="absent"  ${statusFilter==='absent'  ?'selected':''}>الغائبون</option>
        <option value="late"    ${statusFilter==='late'    ?'selected':''}>المتأخرون</option>
      </select>
    </div>`}

    <!-- قائمة التلاميذ -->
    ${total === 0
      ? `<div class="panel">${emptyHtml('لا يوجد تلاميذ', 'أضف تلاميذ أولاً في قسم التلاميذ')}</div>`
      : displayStds.length === 0
      ? `<div class="panel">${emptyHtml('لا يوجد تلاميذ في هذه الحالة', 'غيّر الفلتر لعرض التلاميذ الآخرين')}</div>`
      : `<div class="panel" style="padding:0">
          ${displayStds.map((s, i) => {
            const st = _attStatus(s.id, cls, date);
            return `
              <div style="
                display:flex;align-items:center;gap:10px;
                padding:11px 14px;
                border-bottom:${i < displayStds.length-1 ? '1px solid var(--border)' : 'none'};
                background:${st==='present' ? 'rgba(23,138,111,.04)' : st==='absent' ? 'rgba(220,53,69,.04)' : st==='late' ? 'rgba(180,135,0,.04)' : 'transparent'};
                transition:background .1s
              ">
                <!-- رقم التلميذ -->
                <div style="width:26px;height:26px;border-radius:50%;flex-shrink:0;
                  display:flex;align-items:center;justify-content:center;
                  font-size:11px;font-weight:800;font-family:var(--mono);
                  background:var(--surface-2);color:var(--text-3)">
                  ${i + 1}
                </div>
                <!-- الاسم -->
                <div style="flex:1;min-width:0">
                  <div style="font-size:14px;font-weight:700;color:var(--text);
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    ${esc(s.name)}
                  </div>
                </div>
                <!-- أزرار التسجيل -->
                <div class="quick-mark-row" style="gap:5px;flex-shrink:0">
                  <button class="qm-btn ${st==='present'?'present':''}"
                    onclick="quickMark('${s.id}','present','${cls}','${date}')">✓</button>
                  <button class="qm-btn ${st==='absent'?'absent':''}"
                    onclick="quickMark('${s.id}','absent','${cls}','${date}')">✗</button>
                  <button class="qm-btn ${st==='late'?'late':''}"
                    onclick="quickMark('${s.id}','late','${cls}','${date}')">تأخر</button>
                </div>
              </div>`;
          }).join('')}
        </div>`}

    <!-- ملاحظة الغائبين -->
    ${nA > 0 ? `
      <div style="margin-top:10px;padding:10px 14px;border-radius:10px;
        background:var(--danger-light);border-right:3px solid var(--danger)">
        <div style="font-size:12px;font-weight:800;color:var(--danger);margin-bottom:4px">
          الغائبون اليوم (${nA})
        </div>
        <div style="font-size:13px;color:var(--text-2);line-height:1.7">
          ${stds.filter(s => _attStatus(s.id, cls, date) === 'absent')
            .map(s => esc(s.name)).join(' · ') || '—'}
        </div>
      </div>` : ''}

    <!-- ملاحظة المتأخرين -->
    ${nL > 0 ? `
      <div style="margin-top:8px;padding:10px 14px;border-radius:10px;
        background:var(--amber-light);border-right:3px solid var(--amber)">
        <div style="font-size:12px;font-weight:800;color:var(--amber);margin-bottom:4px">
          المتأخرون اليوم (${nL})
        </div>
        <div style="font-size:13px;color:var(--text-2);line-height:1.7">
          ${stds.filter(s => _attStatus(s.id, cls, date) === 'late')
            .map(s => esc(s.name)).join(' · ') || '—'}
        </div>
      </div>` : ''}
  `;
}

/* ── بطاقة إحصاء صغيرة قابلة للفلترة ─────────────────────── */
function _attChip(value, label, color, bg, filterKey) {
  const active = filAtt.statusFilter === filterKey;
  return `
    <button onclick="setAttStatusFilter('${active ? 'all' : filterKey}')" style="
      background:${active ? color : bg};
      border:none;border-radius:14px;
      padding:12px 6px;text-align:center;
      cursor:pointer;transition:all .2s;
      box-shadow:${active ? '0 4px 12px rgba(0,0,0,.15)' : 'none'};
    ">
      <div style="font-size:22px;font-weight:800;font-family:var(--mono);
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
   تبويب 2 — التقويم الشهري
   ═══════════════════════════════════════════════════════════ */
function _calendarHtml() {
  const { cls, month } = filAtt;
  const [y, m]   = month.split('-').map(Number);
  const firstDay = new Date(y, m - 1, 1).getDay();   // 0=أحد
  const daysInM  = new Date(y, m, 0).getDate();
  const t        = today();

  /* بناء مصفوفة الأيام مع إحصاءاتها */
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);    // خلايا فارغة
  for (let d = 1; d <= daysInM; d++) {
    const iso = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const st  = _dayStats(cls, iso);
    cells.push({ d, iso, ...st });
  }

  /* شهر السابق والتالي */
  const prevM = m === 1 ? `${y-1}-12` : `${y}-${String(m-1).padStart(2,'0')}`;
  const nextM = m === 12? `${y+1}-01` : `${y}-${String(m+1).padStart(2,'0')}`;
  const canNext = nextM <= (today().slice(0,7) + '-01').slice(0,7);

  /* إجمالي شهري للقسم */
  const monthRecs = DATA.attendance.filter(a => a.cls === cls && a.date.startsWith(month));
  const stds      = studentsOf(cls);

  return `
    <!-- فلتر الفصيل -->
    ${classTabsHtml(cls, 'setAttCls')}

    <!-- التنقل بين الأشهر -->
    <div class="panel" style="padding:10px 14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <button class="btn btn-outline btn-sm" style="padding:8px 12px"
          onclick="shiftAttMonth(-1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style="text-align:center">
          <div style="font-size:16px;font-weight:800;color:var(--text)">
            ${MONTHS_ATT[m-1]} ${y}
          </div>
          <div style="font-size:11px;color:var(--text-3);margin-top:2px">
            ${monthRecs.length} سجل مُدوَّن
          </div>
        </div>
        <button class="btn btn-outline btn-sm"
          style="padding:8px 12px;${!canNext ? 'opacity:.4;pointer-events:none' : ''}"
          onclick="shiftAttMonth(1)" ${!canNext ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- مشبكة التقويم -->
    <div class="panel" style="padding:14px;margin-bottom:12px">
      <!-- رؤوس الأيام -->
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;
        margin-bottom:6px">
        ${DAYS_AR_SHORT.map(d => `
          <div style="text-align:center;font-size:10px;font-weight:800;
            color:var(--text-3);padding:4px 0">
            ${d}
          </div>`).join('')}
      </div>
      <!-- خلايا التقويم -->
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
        ${cells.map(cell => {
          if (!cell) return `<div></div>`;
          const isToday    = cell.iso === t;
          const isSelected = cell.iso === filAtt.date;
          const hasData    = cell.recorded > 0;
          /* لون خلفية حسب نسبة الحضور */
          const bg = !hasData ? 'var(--surface-2)'
            : cell.pct >= 80 ? 'var(--green-light)'
            : cell.pct >= 50 ? 'var(--amber-light)'
            : 'var(--danger-light)';
          const col = !hasData ? 'var(--text-3)'
            : cell.pct >= 80 ? 'var(--green)'
            : cell.pct >= 50 ? 'var(--amber)'
            : 'var(--danger)';
          return `
            <button onclick="goAttDay('${cell.iso}')" style="
              background:${isToday ? 'var(--accent)' : isSelected ? bg : bg};
              border:2px solid ${isToday ? 'var(--accent)' : isSelected ? col : 'transparent'};
              border-radius:10px;padding:6px 2px;
              display:flex;flex-direction:column;align-items:center;gap:2px;
              cursor:pointer;transition:all .15s;
              box-shadow:${isSelected && !isToday ? '0 2px 8px rgba(0,0,0,.1)' : 'none'};
            ">
              <div style="font-size:14px;font-weight:800;font-family:var(--mono);
                color:${isToday ? '#fff' : hasData ? col : 'var(--text)'}">
                ${cell.d}
              </div>
              ${hasData && !isToday ? `
                <div style="font-size:9px;font-weight:800;color:${col};line-height:1">
                  ${cell.pct}%
                </div>` : isToday && hasData ? `
                <div style="font-size:9px;font-weight:800;color:rgba(255,255,255,.75);line-height:1">
                  ${cell.pct}%
                </div>` : `<div style="height:13px"></div>`}
            </button>`;
        }).join('')}
      </div>
    </div>

    <!-- مفتاح الألوان -->
    <div class="panel" style="padding:12px 14px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:800;color:var(--text-3);
        text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">
        مفتاح الألوان
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        ${[
          { col:'var(--green)',   bg:'var(--green-light)',  label:'80% فأكثر' },
          { col:'var(--amber)',   bg:'var(--amber-light)',  label:'50% - 79%' },
          { col:'var(--danger)',  bg:'var(--danger-light)', label:'أقل من 50%' },
          { col:'var(--text-3)', bg:'var(--surface-2)',    label:'بدون تسجيل' },
        ].map(k => `
          <div style="display:flex;align-items:center;gap:6px">
            <div style="width:14px;height:14px;border-radius:4px;
              background:${k.bg};border:1.5px solid ${k.col}"></div>
            <span style="font-size:12px;color:var(--text-3);font-weight:600">${k.label}</span>
          </div>`).join('')}
      </div>
    </div>

    <!-- معاينة اليوم المختار -->
    ${_dayPreviewHtml(cls, filAtt.date)}
  `;
}

/* ── معاينة يوم محدد (مستخدمة في التقويم) ──────────────────── */
function _dayPreviewHtml(cls, date) {
  const stds = studentsOf(cls);
  if (stds.length === 0) return '';
  const { nP, nA, nL, total, pct } = _dayStats(cls, date);
  const dateDisp = fdate(date);
  const dateObj  = new Date(date + 'T00:00:00');
  const dow      = DAYS_AR_FULL[dateObj.getDay()];
  const hasRecs  = DATA.attendance.some(a => a.date === date && a.cls === cls);

  return `
    <div class="panel" style="padding:0;overflow:hidden">
      <div style="padding:12px 14px;background:var(--surface-2);
        border-bottom:1px solid var(--border);
        display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:13px;font-weight:800;color:var(--text)">${dateDisp}</div>
          <div style="font-size:11px;color:var(--text-3);margin-top:1px">${dow}</div>
        </div>
        <button class="btn btn-accent btn-sm"
          onclick="setAttTab('daily')">
          ${IC.edit}&nbsp; سجّل
        </button>
      </div>
      ${!hasRecs
        ? `<div style="padding:18px 14px;text-align:center;
            font-size:13px;color:var(--text-3);font-weight:600">
            لم يُسجَّل حضور لهذا اليوم
          </div>`
        : `<div style="padding:10px 14px">
            <div style="display:flex;gap:10px;justify-content:center;
              font-size:13px;font-weight:700">
              <span style="color:var(--green)">${IC.check}&nbsp;${nP} حاضر</span>
              <span style="color:var(--danger)">✗&nbsp;${nA} غائب</span>
              <span style="color:var(--amber)">⏱ ${nL} متأخر</span>
            </div>
            <div class="progress-bar" style="margin-top:8px">
              <div class="progress-fill" style="width:${pct}%;
                background:${pct>=80?'var(--green)':pct>=50?'var(--amber)':'var(--danger)'}">
              </div>
            </div>
          </div>`}
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   تبويب 3 — إحصاءات التلاميذ
   ═══════════════════════════════════════════════════════════ */
function _statsHtml() {
  const { cls, month } = filAtt;
  const [y, m] = month.split('-').map(Number);
  const stds   = studentsOf(cls);

  /* كل الأيام المسجّلة في الشهر لهذا القسم */
  const monthDates = [...new Set(
    DATA.attendance
      .filter(a => a.cls === cls && a.date.startsWith(month))
      .map(a => a.date)
  )].sort();

  const totalDays = monthDates.length;

  /* إحصاءات لكل تلميذ */
  const rows = stds.map(s => {
    const recs = DATA.attendance.filter(a => a.sid === s.id && a.cls === cls && a.date.startsWith(month));
    const nP   = recs.filter(r => r.status === 'present').length;
    const nL   = recs.filter(r => r.status === 'late').length;
    const nA   = recs.filter(r => r.status === 'absent').length;
    const pct  = totalDays > 0 ? Math.round(((nP + nL) / totalDays) * 100) : null;
    return { ...s, nP, nL, nA, pct, total: nP + nL + nA };
  }).sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));

  /* شهر السابق والتالي */
  const prevM = m === 1 ? `${y-1}-12` : `${y}-${String(m-1).padStart(2,'0')}`;
  const nextM = m === 12? `${y+1}-01` : `${y}-${String(m+1).padStart(2,'0')}`;
  const canNext = nextM <= today().slice(0,7);

  /* ملخص الشهر الكلي */
  const allRecs = DATA.attendance.filter(a => a.cls === cls && a.date.startsWith(month));
  const totP = allRecs.filter(r => r.status === 'present').length;
  const totA = allRecs.filter(r => r.status === 'absent').length;
  const totL = allRecs.filter(r => r.status === 'late').length;
  const avgPct = totalDays > 0 && stds.length > 0
    ? Math.round(((totP + totL) / (totalDays * stds.length)) * 100) : 0;

  return `
    <!-- فلتر الفصيل -->
    ${classTabsHtml(cls, 'setAttCls')}

    <!-- التنقل بين الأشهر -->
    <div class="panel" style="padding:10px 14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <button class="btn btn-outline btn-sm" style="padding:8px 12px"
          onclick="shiftAttMonth(-1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style="text-align:center">
          <div style="font-size:15px;font-weight:800;color:var(--text)">
            ${MONTHS_ATT[m-1]} ${y}
          </div>
          <div style="font-size:11px;color:var(--text-3);margin-top:2px">
            ${totalDays} يوم مُسجَّل · ${stds.length} تلميذ
          </div>
        </div>
        <button class="btn btn-outline btn-sm"
          style="padding:8px 12px;${!canNext ? 'opacity:.4;pointer-events:none' : ''}"
          onclick="shiftAttMonth(1)" ${!canNext ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- ملخص الشهر -->
    ${totalDays > 0 ? `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
      <div style="background:var(--green-light);border-radius:14px;
        padding:12px 6px;text-align:center">
        <div style="font-size:22px;font-weight:800;font-family:var(--mono);
          color:var(--green);line-height:1.1">${totP}</div>
        <div style="font-size:10px;font-weight:700;margin-top:4px;color:var(--green)">حضور</div>
      </div>
      <div style="background:var(--danger-light);border-radius:14px;
        padding:12px 6px;text-align:center">
        <div style="font-size:22px;font-weight:800;font-family:var(--mono);
          color:var(--danger);line-height:1.1">${totA}</div>
        <div style="font-size:10px;font-weight:700;margin-top:4px;color:var(--danger)">غياب</div>
      </div>
      <div style="background:var(--amber-light);border-radius:14px;
        padding:12px 6px;text-align:center">
        <div style="font-size:22px;font-weight:800;font-family:var(--mono);
          color:var(--amber);line-height:1.1">${totL}</div>
        <div style="font-size:10px;font-weight:700;margin-top:4px;color:var(--amber)">تأخر</div>
      </div>
      <div style="background:var(--surface-2);border-radius:14px;
        padding:12px 6px;text-align:center">
        <div style="font-size:22px;font-weight:800;font-family:var(--mono);
          color:${avgPct>=80?'var(--green)':avgPct>=50?'var(--amber)':'var(--danger)'};line-height:1.1">
          ${avgPct}%
        </div>
        <div style="font-size:10px;font-weight:700;margin-top:4px;
          color:${avgPct>=80?'var(--green)':avgPct>=50?'var(--amber)':'var(--danger)'}">
          معدل
        </div>
      </div>
    </div>` : ''}

    <!-- جدول إحصاءات التلاميذ -->
    ${stds.length === 0
      ? `<div class="panel">${emptyHtml('لا يوجد تلاميذ','أضف تلاميذ في قسم التلاميذ')}</div>`
      : totalDays === 0
      ? `<div class="panel">${emptyHtml('لا توجد سجلات','لم يُسجَّل أي حضور هذا الشهر')}</div>`
      : `<div class="panel" style="padding:0;overflow:hidden">
          <!-- رأس الجدول -->
          <div style="display:flex;align-items:center;gap:8px;
            padding:10px 14px;background:var(--surface-2);
            border-bottom:1px solid var(--border)">
            <div style="flex:1;font-size:11px;font-weight:800;color:var(--text-3)">التلميذ</div>
            <div style="width:32px;text-align:center;font-size:10px;
              font-weight:800;color:var(--green)">✓</div>
            <div style="width:32px;text-align:center;font-size:10px;
              font-weight:800;color:var(--danger)">✗</div>
            <div style="width:32px;text-align:center;font-size:10px;
              font-weight:800;color:var(--amber)">⏱</div>
            <div style="width:56px;text-align:center;font-size:10px;
              font-weight:800;color:var(--text-3)">النسبة</div>
          </div>
          <!-- صفوف التلاميذ -->
          ${rows.map((s, i) => {
            const pct  = s.pct;
            const col  = pct === null ? 'var(--text-3)'
              : pct >= 80 ? 'var(--green)'
              : pct >= 50 ? 'var(--amber)'
              : 'var(--danger)';
            const bg   = pct === null ? 'var(--surface-2)'
              : pct >= 80 ? 'var(--green-light)'
              : pct >= 50 ? 'var(--amber-light)'
              : 'var(--danger-light)';
            return `
              <div style="
                padding:10px 14px;
                border-bottom:${i < rows.length-1 ? '1px solid var(--border)' : 'none'};
              ">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                  <!-- الاسم -->
                  <div style="flex:1;font-size:13px;font-weight:700;color:var(--text);
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    ${esc(s.name)}
                  </div>
                  <!-- حاضر -->
                  <div style="width:32px;text-align:center;font-size:13px;
                    font-weight:800;font-family:var(--mono);color:var(--green)">
                    ${s.nP}
                  </div>
                  <!-- غائب -->
                  <div style="width:32px;text-align:center;font-size:13px;
                    font-weight:800;font-family:var(--mono);color:var(--danger)">
                    ${s.nA}
                  </div>
                  <!-- متأخر -->
                  <div style="width:32px;text-align:center;font-size:13px;
                    font-weight:800;font-family:var(--mono);color:var(--amber)">
                    ${s.nL}
                  </div>
                  <!-- النسبة -->
                  <div style="width:56px;text-align:center;font-size:13px;
                    font-weight:800;font-family:var(--mono);
                    color:#fff;background:${pct===null?'var(--border-2)':col};
                    padding:3px 0;border-radius:8px">
                    ${pct === null ? '—' : pct + '%'}
                  </div>
                </div>
                <!-- شريط التقدم -->
                ${pct !== null ? `
                  <div class="progress-bar">
                    <div class="progress-fill" style="width:${pct}%;background:${col}"></div>
                  </div>` : ''}
              </div>`;
          }).join('')}
        </div>`}
  `;
}

/* ════════════════════════════════════════════════════════════
   ربط الأحداث بعد كل render
   ═══════════════════════════════════════════════════════════ */
function _bindAttEvents() {
  /* لا حاجة حالياً — كل شيء inline onclick */
}

/* ════════════════════════════════════════════════════════════
   دوال التحكم العامة
   ═══════════════════════════════════════════════════════════ */

/* تبديل التبويب */
function setAttTab(tab) {
  _attInit();
  filAtt.tab = tab;
  renderAttendance();
}

/* تغيير الفصيل */
function setAttCls(cls) {
  _attInit();
  filAtt.cls = cls;
  renderAttendance();
}

/* تغيير التاريخ مباشرة */
function setAttDate(d) {
  _attInit();
  filAtt.date = d;
  renderAttendance();
}

/* الانتقال بين الأيام بالسهام — يستخدم مكونات التاريخ المحلية لتجنب إزاحة UTC */
function shiftAttDate(delta) {
  _attInit();
  const d = new Date(filAtt.date + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  filAtt.date = `${yy}-${mm}-${dd}`;
  renderAttendance();
}

/* الانتقال بين الأشهر في التقويم والإحصاءات */
function shiftAttMonth(delta) {
  _attInit();
  const [y, m] = filAtt.month.split('-').map(Number);
  const d      = new Date(y, m - 1 + delta, 1);
  filAtt.month = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  renderAttendance();
}

/* الانتقال لتاريخ محدد من التقويم */
function goAttDay(date) {
  _attInit();
  filAtt.date = date;
  filAtt.tab  = 'daily';
  renderAttendance();
}

/* فلتر الحالة (حاضر/غائب/متأخر) */
function setAttStatusFilter(val) {
  _attInit();
  filAtt.statusFilter = val;
  renderAttendance();
}

/* ════════════════════════════════════════════════════════════
   إجراءات الحضور
   ═══════════════════════════════════════════════════════════ */

/* تسجيل حالة تلميذ واحد — toggle */
function quickMark(sid, status, cls, date) {
  const idx = DATA.attendance.findIndex(
    a => a.sid === sid && a.date === date && a.cls === cls
  );
  if (idx >= 0) {
    if (DATA.attendance[idx].status === status) {
      DATA.attendance.splice(idx, 1);     // إلغاء التحديد
    } else {
      DATA.attendance[idx].status = status;
    }
  } else {
    DATA.attendance.push({ id: uid(), sid, cls, date, status });
  }
  save();
  renderAttendance();
}

/* تحضير كل التلاميذ دفعة واحدة */
function markAllPresent(cls, date) {
  const stds = studentsOf(cls);
  stds.forEach(s => {
    const idx = DATA.attendance.findIndex(
      a => a.sid === s.id && a.date === date && a.cls === cls
    );
    if (idx >= 0) {
      DATA.attendance[idx].status = 'present';
    } else {
      DATA.attendance.push({ id: uid(), sid: s.id, cls, date, status: 'present' });
    }
  });
  save();
  toast(`تم تحضير ${stds.length} تلميذ`, 'success');
  renderAttendance();
}

/* مسح كل سجلات يوم معين لقسم */
function clearAttDay(cls, date) {
  const count = DATA.attendance.filter(a => a.cls === cls && a.date === date).length;
  if (count === 0) { toast('لا توجد سجلات لمسحها'); return; }
  if (!confirm(`هل تريد مسح جميع سجلات هذا اليوم (${count} سجل)؟`)) return;
  DATA.attendance = DATA.attendance.filter(a => !(a.cls === cls && a.date === date));
  save();
  toast('تم مسح سجلات اليوم');
  renderAttendance();
}
