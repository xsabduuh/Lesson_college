/* =================================================================
   LESSONS (الدروس) — النسخة الشاملة v2
   ─────────────────────────────────────────────────────────────────
   الهيكل الجديد:
     DATA.units   — وحدات دراسية
     DATA.lessons — دروس مرتبطة بوحدات
       └─ sections[]   فقرات الدرس (عنوان + محتوى)
       └─ objectives[] أهداف (قائمة)
       └─ terms[]      مصطلحات (كلمة + تعريف)
       └─ resources[]  موارد (نوع + عنوان + رابط)
   ─────────────────────────────────────────────────────────────────
   مميزات جديدة:
   ✅ وحدات دراسية تحتوي دروساً منظّمة
   ✅ كل درس: فقرات، أهداف، مصطلحات، موارد، واجب، ملاحظات
   ✅ حالة الدرس: مخطط / مُدرَّس
   ✅ بحث سريع في الدروس والوحدات
   ✅ وضعا عرض: حسب الوحدة | كل الدروس
   ✅ إحصاء: عدد الدروس، نسبة الإنجاز، مدة الحصص
   ✅ نموذج درس شامل: أهداف وفقرات ومصطلحات ديناميكية
   ✅ طباعة ملف الدرس الكامل
   ✅ تصدير CSV للدروس
================================================================= */

/* ── تأكد من وجود units في DATA ────────────────────────────── */
if (!DATA.units) DATA.units = [];

/* ── حالة محلية ──────────────────────────────────────────────── */
let lessonsView   = 'units';   // 'units' | 'all' | 'stats'
let lessonsSearch = '';
let openUnits     = {};        // { unitId: true/false } — أيّ وحدة مفتوحة

/* ═══════════════════════════════════════════════════════════════
   renderLessons — دالة العرض الرئيسية (تبني الهيكل الكامل)
═══════════════════════════════════════════════════════════════ */
function renderLessons() {
  const cls   = filLess.cls;
  const subj  = filLess.subj;
  const s     = subjById(subj);
  const units = DATA.units.filter(u => u.cls === cls && u.subj === subj)
                           .sort((a, b) => (a.order || 0) - (b.order || 0));
  const all   = DATA.lessons.filter(l => l.cls === cls && l.subj === subj);

  /* ── إحصاء سريع ── */
  const done    = all.filter(l => l.status === 'done').length;
  const planned = all.length - done;
  const totalMin = all.reduce((s, l) => s + (parseInt(l.duration) || 0), 0);

  const sec = document.getElementById('sec-lessons');
  sec.innerHTML = `
    ${classTabsHtml(cls, 'setLessCls')}
    ${subjPillsHtml(subj, 'setLessSubj')}

    <!-- شريط الأدوات -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <button class="btn btn-accent" onclick="openLessonForm()">
        ${IC.plus} درس جديد
      </button>
      <button class="btn btn-outline" onclick="openUnitForm()"
        title="إضافة وحدة دراسية جديدة">
        ⊞ وحدة جديدة
      </button>
      <button class="btn btn-outline" onclick="exportLessonsCSV()"
        title="تصدير قائمة الدروس">${IC.download} CSV</button>
      <div style="flex:1"></div>
      <div style="display:flex;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">
        ${['units','all','stats'].map(v => `
          <button onclick="switchLessonsView('${v}')"
            style="padding:6px 13px;font-size:12px;font-weight:600;border:none;cursor:pointer;
              background:${lessonsView===v?'var(--accent)':'var(--surface)'};
              color:${lessonsView===v?'#fff':'var(--text-2)'};transition:background .15s">
            ${v==='units'?'الوحدات':v==='all'?'كل الدروس':'الإحصاء'}
          </button>`).join('')}
      </div>
    </div>

    <!-- شريط البحث -->
    <div style="position:relative;margin-bottom:12px">
      <span style="position:absolute;right:11px;top:50%;transform:translateY(-50%);
        color:var(--text-3);pointer-events:none">${IC.search}</span>
      <input class="field" id="lesson-search-input" style="padding-right:36px"
        placeholder="بحث في الدروس والوحدات…"
        value="${esc(lessonsSearch)}"
        oninput="lessonsSearch=this.value;updateLessonsList()">
      ${lessonsSearch ? `<button onclick="lessonsSearch='';updateLessonsList()"
        style="position:absolute;left:10px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;color:var(--text-3);font-size:16px">✕</button>` : ''}
    </div>

    <!-- بطاقات الإحصاء -->
    <div class="stat-grid" style="margin-bottom:12px">
      <div class="stat-card">
        <div class="s-label">الوحدات</div>
        <div class="s-val">${units.length}</div>
      </div>
      <div class="stat-card">
        <div class="s-label">الدروس</div>
        <div class="s-val">${all.length}</div>
      </div>
      <div class="stat-card">
        <div class="s-label">مُدرَّس</div>
        <div class="s-val" style="color:var(--green)">${done}</div>
      </div>
      <div class="stat-card">
        <div class="s-label">مجموع الحصص</div>
        <div class="s-val" style="font-size:13px">
          ${totalMin ? totalMin + ' د' : '—'}
        </div>
      </div>
    </div>

    <!-- المحتوى الرئيسي (سيتم تحديثه جزئياً عند البحث) -->
    <div id="lessons-list-container">
      ${generateLessonsContent(cls, subj, units, all)}
    </div>
  `;

  /* تفعيل الأكورديون بعد الرسم */
  sec.querySelectorAll('.lesson-card-head').forEach(h => {
    h.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      h.parentElement.classList.toggle('open');
    });
  });
  sec.querySelectorAll('.unit-head').forEach(h => {
    h.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      const uid = h.dataset.uid;
      openUnits[uid] = !openUnits[uid];
      const body = document.getElementById(`unit-body-${uid}`);
      if (body) body.style.display = openUnits[uid] ? 'block' : 'none';
      h.querySelector('.unit-chev').style.transform =
        openUnits[uid] ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  });
}

/* ── توليد محتوى القائمة حسب طريقة العرض الحالية ────────────── */
function generateLessonsContent(cls, subj, units, all) {
  if (lessonsView === 'units') return _renderByUnits(cls, subj, units, all);
  if (lessonsView === 'all')   return _renderAllLessons(all, units);
  return _renderLessonsStats(units, all);
}

/* ── تحديث جزئي للقائمة عند البحث فقط (يحافظ على التركيز) ───── */
function updateLessonsList() {
  const cls   = filLess.cls;
  const subj  = filLess.subj;
  const units = DATA.units.filter(u => u.cls === cls && u.subj === subj)
                           .sort((a, b) => (a.order || 0) - (b.order || 0));
  const all   = DATA.lessons.filter(l => l.cls === cls && l.subj === subj);

  const container = document.getElementById('lessons-list-container');
  if (container) {
    container.innerHTML = generateLessonsContent(cls, subj, units, all);
  }

  // إبقاء التركيز على حقل البحث
  const searchInput = document.getElementById('lesson-search-input');
  if (searchInput) {
    searchInput.focus();
    const val = searchInput.value;
    searchInput.setSelectionRange(val.length, val.length);
  }
}

/* ── تبديل العرض ─────────────────────────────────────────────── */
function switchLessonsView(v) { lessonsView = v; lessonsSearch = ''; renderLessons(); }
function setLessCls(cls)  { filLess.cls  = cls; openUnits = {}; renderLessons(); }
function setLessSubj(subj){ filLess.subj = subj; openUnits = {}; renderLessons(); }

/* ═══════════════════════════════════════════════════════════════
   وضع الوحدات — وحدات تحتوي دروساً
═══════════════════════════════════════════════════════════════ */
function _renderByUnits(cls, subj, units, all) {
  const q = lessonsSearch.toLowerCase();

  /* دروس بدون وحدة (أو وحدة نصية قديمة) */
  const orphans = all.filter(l => {
    if (l.unitId) return !DATA.units.find(u => u.id === l.unitId);
    return true; // قديم: لا unitId
  }).filter(l => !q || l.title.toLowerCase().includes(q) || (l.unit||'').toLowerCase().includes(q));

  /* وحدات مصفّاة */
  let visUnits = units;
  if (q) {
    visUnits = units.filter(u => {
      const uMatch = u.title.toLowerCase().includes(q);
      const lMatch = all.some(l => l.unitId === u.id && l.title.toLowerCase().includes(q));
      return uMatch || lMatch;
    });
  }

  if (!visUnits.length && !orphans.length)
    return `<div class="panel">${emptyHtml(
      q ? 'لا نتائج' : 'لا توجد وحدات بعد',
      q ? 'جرب كلمة بحث أخرى' : 'أضف وحدة دراسية ثم أضف دروساً داخلها'
    )}</div>`;

  return `
    ${visUnits.map((u, ui) => {
      const lessons = all.filter(l => l.unitId === u.id)
        .filter(l => !q || l.title.toLowerCase().includes(q))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      const doneL  = lessons.filter(l => l.status === 'done').length;
      const pct    = lessons.length ? Math.round(doneL / lessons.length * 100) : 0;
      const isOpen = openUnits[u.id] !== false; // مفتوح افتراضياً

      return `
        <div class="panel" style="margin-bottom:10px;padding:0;overflow:hidden">
          <!-- رأس الوحدة -->
          <div class="unit-head" data-uid="${u.id}"
            style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;
              background:var(--surface);border-bottom:1px solid var(--border)">
            <div style="width:36px;height:36px;border-radius:10px;
              background:${subjById(filLess.subj).bg||'var(--bg-2)'};
              color:${subjById(filLess.subj).color||'var(--accent)'};
              display:flex;align-items:center;justify-content:center;
              font-weight:800;font-size:15px;flex-shrink:0">
              ${ui + 1}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:700;font-size:14px">${esc(u.title)}</div>
              <div style="font-size:11px;color:var(--text-3);margin-top:2px;display:flex;gap:10px;flex-wrap:wrap">
                ${u.semester ? `<span>${esc(u.semester)}</span>` : ''}
                <span>${lessons.length} درس · ${doneL} مُدرَّس</span>
                ${u.objective ? `<span style="font-style:italic">${esc(u.objective.slice(0,60))}…</span>` : ''}
              </div>
              <!-- شريط التقدم -->
              <div style="margin-top:6px;height:4px;background:var(--bg-2);border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:var(--green);border-radius:4px;transition:width .4s"></div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:12px;font-weight:700;color:var(--text-3)">${pct}%</span>
              ${adminBtns(`event.stopPropagation();openUnitForm('${u.id}')`, `event.stopPropagation();deleteUnit('${u.id}')`)}
              <span class="unit-chev" style="color:var(--text-3);transition:transform .2s;
                transform:${isOpen?'rotate(180deg)':'rotate(0deg)'}">${IC.chevDown}</span>
            </div>
          </div>
          <!-- دروس الوحدة -->
          <div id="unit-body-${u.id}" style="display:${isOpen?'block':'none'}">
            ${!lessons.length
              ? `<div style="padding:16px;text-align:center;color:var(--text-3);font-size:13px">
                  لا توجد دروس في هذه الوحدة بعد —
                  <button class="btn btn-outline" style="font-size:11px;margin-right:6px"
                    onclick="filLess._unitId='${u.id}';openLessonForm()">+ أضف درساً</button>
                 </div>`
              : lessons.map((l, li) => _lessonCardHtml(l, li + 1)).join('')}
            ${lessons.length > 0 ? `
              <div style="padding:8px 14px;border-top:1px solid var(--border)">
                <button class="btn btn-outline" style="font-size:12px;width:100%"
                  onclick="filLess._unitId='${u.id}';openLessonForm()">
                  ${IC.plus} إضافة درس في "${esc(u.title)}"
                </button>
              </div>` : ''}
          </div>
        </div>`;
    }).join('')}

    <!-- دروس بدون وحدة -->
    ${orphans.length ? `
      <div class="panel" style="margin-bottom:10px;padding:0;overflow:hidden">
        <div style="padding:10px 14px;background:var(--bg-2);
          font-size:12px;font-weight:700;color:var(--text-3);
          border-bottom:1px solid var(--border)">
          دروس غير مصنّفة (${orphans.length})
        </div>
        ${orphans.map((l, i) => _lessonCardHtml(l, i + 1)).join('')}
      </div>` : ''}
  `;
}

/* ═══════════════════════════════════════════════════════════════
   وضع كل الدروس — قائمة شاملة مع البحث
═══════════════════════════════════════════════════════════════ */
function _renderAllLessons(all, units) {
  const q = lessonsSearch.toLowerCase();
  let items = all.slice().sort((a, b) => {
    const uA = units.findIndex(u => u.id === a.unitId);
    const uB = units.findIndex(u => u.id === b.unitId);
    if (uA !== uB) return uA - uB;
    return (a.order || 0) - (b.order || 0);
  });
  if (q) items = items.filter(l =>
    l.title.toLowerCase().includes(q) ||
    (l.summary || '').toLowerCase().includes(q) ||
    (l.unit || '').toLowerCase().includes(q)
  );

  if (!items.length)
    return `<div class="panel">${emptyHtml(q ? 'لا نتائج' : 'لا توجد دروس', 'أضف درساً باستخدام الزر أعلاه')}</div>`;

  return `<div>${items.map((l, i) => _lessonCardHtml(l, i + 1)).join('')}</div>`;
}

/* ═══════════════════════════════════════════════════════════════
   بطاقة الدرس — أكورديون موسّع مع كل التفاصيل
═══════════════════════════════════════════════════════════════ */
function _lessonCardHtml(l, num) {
  const unit     = DATA.units.find(u => u.id === l.unitId);
  const isDone   = l.status === 'done';
  const sections = l.sections   || [];
  const objs     = l.objectives || [];
  const terms    = l.terms      || [];
  const resources= l.resources  || [];

  return `
    <div class="lesson-card ${isDone ? 'done' : ''}"
      style="border-bottom:1px solid var(--border);last-child:border-none">
      <!-- رأس البطاقة -->
      <div class="lesson-card-head"
        style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer">
        <!-- رقم + حالة -->
        <div style="width:32px;height:32px;border-radius:8px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:13px;
          background:${isDone?'var(--green)':'var(--bg-2)'};
          color:${isDone?'#fff':'var(--text-3)'}">
          ${isDone ? '✓' : num}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:13px;
            text-decoration:${isDone?'none':'none'}">${esc(l.title)}</div>
          <div style="font-size:11px;color:var(--text-3);margin-top:2px;display:flex;gap:10px;flex-wrap:wrap">
            ${unit ? `<span style="color:var(--accent);font-weight:600">${esc(unit.title)}</span>` :
                     l.unit ? `<span>${esc(l.unit)}</span>` : ''}
            ${l.semester ? `<span>${esc(l.semester)}</span>` : ''}
            ${l.date ? `<span>${fdate(l.date)}</span>` : ''}
            ${l.duration ? `<span>⏱ ${l.duration} د</span>` : ''}
            ${sections.length ? `<span>📄 ${sections.length} فقرة</span>` : ''}
            ${terms.length    ? `<span>📚 ${terms.length} مصطلح</span>` : ''}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:4px">
          <!-- تبديل الحالة -->
          <button onclick="event.stopPropagation();toggleLessonStatus('${l.id}')"
            class="btn ${isDone?'btn-outline':'btn-accent'}"
            style="font-size:11px;padding:4px 8px"
            title="${isDone?'إلغاء التدريس':'تعليم كمُدرَّس'}">
            ${isDone ? '↺' : '✓'}
          </button>
          <button onclick="event.stopPropagation();printLesson('${l.id}')"
            class="btn btn-outline" style="font-size:11px;padding:4px 8px" title="طباعة">
            ${IC.file}
          </button>
          ${adminBtns(
            `event.stopPropagation();openLessonForm('${l.id}')`,
            `event.stopPropagation();deleteLesson('${l.id}')`
          )}
          <span style="color:var(--text-3);transition:transform .2s">${IC.chevDown}</span>
        </div>
      </div>

      <!-- محتوى الأكورديون -->
      <div class="lesson-card-body" style="padding:0 14px 14px 14px;display:none">

        <!-- ملخص الدرس -->
        ${l.summary ? `
          <div style="background:var(--bg-2);border-radius:var(--radius-lg);
            padding:10px 12px;margin-bottom:10px;font-size:13px;
            color:var(--text-2);line-height:1.7;font-style:italic;border-right:3px solid var(--accent)">
            ${esc(l.summary)}
          </div>` : ''}

        <!-- الأهداف التعليمية -->
        ${objs.length ? `
          <div style="margin-bottom:12px">
            <div style="font-size:12px;font-weight:700;color:var(--text-3);
              text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">
              الأهداف التعليمية
            </div>
            ${objs.map(o => `
              <div style="display:flex;gap:8px;align-items:flex-start;
                padding:4px 0;font-size:13px;color:var(--text)">
                <span style="color:var(--green);font-size:16px;line-height:1.2;flex-shrink:0">✓</span>
                <span>${esc(o)}</span>
              </div>`).join('')}
          </div>` : ''}

        <!-- المتطلبات السابقة -->
        ${l.prerequisites ? `
          <div style="margin-bottom:12px">
            <div style="font-size:12px;font-weight:700;color:var(--text-3);
              margin-bottom:5px">المتطلبات القبلية</div>
            <div style="font-size:13px;color:var(--text-2);line-height:1.6">
              ${esc(l.prerequisites)}
            </div>
          </div>` : ''}

        <!-- فقرات الدرس -->
        ${sections.length ? `
          <div style="margin-bottom:12px">
            <div style="font-size:12px;font-weight:700;color:var(--text-3);
              margin-bottom:8px">محتوى الدرس</div>
            ${sections.map((sec, si) => `
              <div style="margin-bottom:10px;border:1px solid var(--border);
                border-radius:var(--radius-lg);overflow:hidden">
                ${sec.title ? `
                  <div style="padding:7px 12px;background:var(--bg-2);
                    font-weight:700;font-size:13px;border-bottom:1px solid var(--border)">
                    ${si + 1}. ${esc(sec.title)}
                  </div>` : ''}
                <div style="padding:10px 12px;font-size:13px;color:var(--text-2);
                  line-height:1.8;white-space:pre-wrap">${esc(sec.content || '')}</div>
              </div>`).join('')}
          </div>` : ''}

        <!-- المصطلحات -->
        ${terms.length ? `
          <div style="margin-bottom:12px">
            <div style="font-size:12px;font-weight:700;color:var(--text-3);margin-bottom:6px">
              المصطلحات الأساسية
            </div>
            <div style="display:grid;gap:6px">
              ${terms.map(t => `
                <div style="display:flex;gap:8px;align-items:baseline;
                  border-bottom:1px dashed var(--border);padding-bottom:4px;font-size:13px">
                  <span style="font-weight:700;color:var(--accent);min-width:100px">
                    ${esc(t.word)}
                  </span>
                  <span style="color:var(--text-2)">${esc(t.def)}</span>
                </div>`).join('')}
            </div>
          </div>` : ''}

        <!-- الموارد والمراجع -->
        ${resources.length ? `
          <div style="margin-bottom:12px">
            <div style="font-size:12px;font-weight:700;color:var(--text-3);margin-bottom:6px">
              الموارد والمراجع
            </div>
            ${resources.map(r => `
              <div style="display:flex;align-items:center;gap:8px;
                padding:5px 0;font-size:13px;border-bottom:1px solid var(--border)">
                <span style="font-size:16px">${
                  r.type==='video'?'🎬':r.type==='book'?'📖':r.type==='exercise'?'📝':'🔗'
                }</span>
                <span style="flex:1">${esc(r.title)}</span>
                ${r.url ? `<a href="${esc(r.url)}" target="_blank"
                  style="font-size:11px;color:var(--accent)">فتح ↗</a>` : ''}
              </div>`).join('')}
          </div>` : ''}

        <!-- الواجب المنزلي -->
        ${l.homework ? `
          <div style="margin-bottom:12px;background:var(--bg-2);
            border-radius:var(--radius-lg);padding:10px 12px;
            border-right:3px solid var(--accent)">
            <div style="font-size:12px;font-weight:700;color:var(--text-3);margin-bottom:4px">
              📋 الواجب المنزلي
            </div>
            <div style="font-size:13px;color:var(--text-2);line-height:1.6">
              ${esc(l.homework)}
            </div>
          </div>` : ''}

        <!-- ملاحظات الأستاذ -->
        ${l.notes ? `
          <div style="background:var(--bg-2);border-radius:var(--radius-lg);
            padding:10px 12px;font-size:12px;color:var(--text-3);
            border-right:3px solid var(--border);line-height:1.6">
            <span style="font-weight:700">ملاحظات: </span>${esc(l.notes)}
          </div>` : ''}
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════
   وضع الإحصاء
═══════════════════════════════════════════════════════════════ */
function _renderLessonsStats(units, all) {
  if (!all.length)
    return `<div class="panel">${emptyHtml('لا توجد دروس بعد', 'أضف وحدات ودروساً أولاً')}</div>`;

  const done      = all.filter(l => l.status === 'done').length;
  const totalMin  = all.reduce((s, l) => s + (parseInt(l.duration) || 0), 0);
  const withSec   = all.filter(l => (l.sections  || []).length > 0).length;
  const withTerms = all.filter(l => (l.terms     || []).length > 0).length;
  const withObjs  = all.filter(l => (l.objectives|| []).length > 0).length;

  /* توزيع حسب الدورة */
  const bySem = {};
  all.forEach(l => {
    const k = l.semester || 'غير محدد';
    if (!bySem[k]) bySem[k] = { total: 0, done: 0 };
    bySem[k].total++;
    if (l.status === 'done') bySem[k].done++;
  });

  return `
    <!-- شريط الإنجاز الكلي -->
    <div class="panel" style="margin-bottom:10px">
      <div class="panel-title">نسبة الإنجاز الكلية</div>
      <div style="font-size:32px;font-weight:800;font-family:var(--mono);
        color:${done/all.length>=0.5?'var(--green)':'var(--accent)'};margin-bottom:8px">
        ${Math.round(done / all.length * 100)}%
      </div>
      <div style="height:10px;background:var(--bg-2);border-radius:6px;overflow:hidden;margin-bottom:8px">
        <div style="height:100%;width:${Math.round(done/all.length*100)}%;
          background:var(--green);border-radius:6px;transition:width .5s"></div>
      </div>
      <div style="font-size:12px;color:var(--text-3)">
        ${done} مُدرَّس من أصل ${all.length} درس
      </div>
    </div>

    <!-- إحصاء إضافي -->
    <div class="panel" style="margin-bottom:10px">
      <div class="panel-title">إحصاء المحتوى</div>
      ${[
        ['📦 الوحدات الدراسية',   units.length],
        ['📖 مجموع الدروس',       all.length],
        ['✓ الدروس المُدرَّسة',   done],
        ['⏱ مجموع الحصص',        totalMin ? totalMin + ' دقيقة' : '—'],
        ['📄 دروس بها فقرات',      withSec],
        ['📚 دروس بها مصطلحات',    withTerms],
        ['🎯 دروس بها أهداف',      withObjs],
      ].map(([label, val]) => `
        <div style="display:flex;justify-content:space-between;
          padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:13px;color:var(--text-2)">${label}</span>
          <span style="font-weight:700;font-family:var(--mono)">${val}</span>
        </div>`).join('')}
    </div>

    <!-- توزيع حسب الدورة -->
    ${Object.keys(bySem).length > 0 ? `
    <div class="panel">
      <div class="panel-title">الإنجاز حسب الدورة</div>
      ${Object.entries(bySem).map(([sem, d]) => {
        const pct = Math.round(d.done / d.total * 100);
        return `
          <div style="padding:10px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;justify-content:space-between;margin-bottom:5px">
              <span style="font-size:13px;font-weight:600">${esc(sem)}</span>
              <span style="font-size:12px;color:var(--text-3)">
                ${d.done}/${d.total} درس — <b style="color:var(--green)">${pct}%</b>
              </span>
            </div>
            <div style="height:6px;background:var(--bg-2);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:var(--green);border-radius:4px"></div>
            </div>
          </div>`;
      }).join('')}
    </div>` : ''}
  `;
}

/* ═══════════════════════════════════════════════════════════════
   نموذج الوحدة الدراسية
═══════════════════════════════════════════════════════════════ */
function openUnitForm(id) {
  const u    = id ? DATA.units.find(x => x.id === id) : {};
  const cls  = u.cls  || filLess.cls;
  const subj = u.subj || filLess.subj;
  const semOpts = ['', 'الدورة الأولى', 'الدورة الثانية', 'الدورة الثالثة'].map(v =>
    `<option value="${v}" ${(u.semester||'')=== v?'selected':''}>${v||'—'}</option>`).join('');
  const clsOpts  = CLASSES.map(c =>
    `<option value="${c.id}" ${cls===c.id?'selected':''}>${c.label}</option>`).join('');
  const subjOpts = SUBJECTS.map(s =>
    `<option value="${s.id}" ${subj===s.id?'selected':''}>${s.label}</option>`).join('');
  const existingUnits = DATA.units.filter(x => x.cls===cls && x.subj===subj && x.id!==id);

  showSheet(id ? 'تعديل الوحدة' : 'وحدة دراسية جديدة', `
    <div class="field-grid-2">
      <div class="field-row">
        <label>القسم <span class="req">*</span></label>
        <select class="field" id="uf-cls">${clsOpts}</select>
      </div>
      <div class="field-row">
        <label>المادة <span class="req">*</span></label>
        <select class="field" id="uf-subj">${subjOpts}</select>
      </div>
    </div>
    <div class="field-row">
      <label>عنوان الوحدة <span class="req">*</span></label>
      <input class="field" id="uf-title" placeholder="مثال: الوحدة 1 — الأعداد والعمليات"
        value="${esc(u.title || '')}">
    </div>
    <div class="field-grid-2">
      <div class="field-row">
        <label>الدورة</label>
        <select class="field" id="uf-semester">${semOpts}</select>
      </div>
      <div class="field-row">
        <label>الترتيب</label>
        <input class="field" type="number" id="uf-order" min="1" step="1"
          value="${u.order || existingUnits.length + 1}">
      </div>
    </div>
    <div class="field-row">
      <label>الهدف العام للوحدة</label>
      <textarea class="field" id="uf-objective" rows="2"
        placeholder="ماذا سيتعلم التلميذ من هذه الوحدة؟">${esc(u.objective || '')}</textarea>
    </div>
    <div class="field-row">
      <label>الكفايات المستهدفة</label>
      <textarea class="field" id="uf-competencies" rows="2"
        placeholder="الكفايات التي تستهدفها هذه الوحدة">${esc(u.competencies || '')}</textarea>
    </div>
    <div class="field-row">
      <label>ملاحظات</label>
      <input class="field" id="uf-notes" placeholder="ملاحظات حول الوحدة"
        value="${esc(u.notes || '')}">
    </div>
    <input type="hidden" id="uf-id" value="${id || ''}">
  `, [
    { label: 'إلغاء', cls: 'btn-outline', fn: 'closeSheet()' },
    { label: 'حفظ',   cls: 'btn-accent',  fn: 'saveUnit()' }
  ]);
}

function saveUnit() {
  const id    = document.getElementById('uf-id').value;
  const title = document.getElementById('uf-title').value.trim();
  if (!title) { toast('أدخل عنوان الوحدة', 'error'); return; }
  const obj = {
    cls:          document.getElementById('uf-cls').value,
    subj:         document.getElementById('uf-subj').value,
    title,
    semester:     document.getElementById('uf-semester').value,
    order:        parseInt(document.getElementById('uf-order').value) || 1,
    objective:    document.getElementById('uf-objective').value.trim(),
    competencies: document.getElementById('uf-competencies').value.trim(),
    notes:        document.getElementById('uf-notes').value.trim()
  };
  if (id) { Object.assign(DATA.units.find(x => x.id === id), obj); }
  else    { DATA.units.push({ id: uid(), ...obj }); }
  save(); closeSheet(); toast('تم الحفظ', 'success'); renderLessons();
}

function deleteUnit(id) {
  const hasLessons = DATA.lessons.some(l => l.unitId === id);
  if (hasLessons) {
    if (!confirm('هذه الوحدة تحتوي على دروس. هل تريد حذف الوحدة فقط (تبقى الدروس غير مصنّفة)؟')) return;
    DATA.lessons.forEach(l => { if (l.unitId === id) l.unitId = null; });
  } else {
    if (!confirm('حذف هذه الوحدة نهائياً؟')) return;
  }
  DATA.units = DATA.units.filter(u => u.id !== id);
  save(); toast('تم الحذف'); renderLessons();
}

/* ═══════════════════════════════════════════════════════════════
   نموذج الدرس — شامل مع فقرات وأهداف ومصطلحات وموارد ديناميكية
═══════════════════════════════════════════════════════════════ */
function openLessonForm(id) {
  const l    = id ? DATA.lessons.find(x => x.id === id) : {};
  const cls  = l.cls  || filLess.cls;
  const subj = l.subj || filLess.subj;

  /* الوحدة المحددة مسبقاً (عند النقر على "أضف درساً" داخل وحدة) */
  const presetUnitId = l.unitId || (filLess._unitId || '');
  if (filLess._unitId) delete filLess._unitId;

  const clsOpts  = CLASSES.map(c =>
    `<option value="${c.id}" ${cls===c.id?'selected':''}>${c.label}</option>`).join('');
  const subjOpts = SUBJECTS.map(s =>
    `<option value="${s.id}" ${subj===s.id?'selected':''}>${s.label}</option>`).join('');
  const semOpts  = ['', 'الدورة الأولى', 'الدورة الثانية', 'الدورة الثالثة'].map(v =>
    `<option value="${v}" ${(l.semester||'')=== v?'selected':''}>${v||'—'}</option>`).join('');
  const unitOpts = [
    `<option value="">— بدون وحدة —</option>`,
    ...DATA.units.filter(u => u.cls===cls && u.subj===subj).map(u =>
      `<option value="${u.id}" ${(presetUnitId||l.unitId||'')===u.id?'selected':''}>${esc(u.title)}</option>`)
  ].join('');

  /* الأهداف الموجودة */
  const existingObjs = (l.objectives || []);
  /* الفقرات الموجودة */
  const existingSecs = (l.sections || []);
  /* المصطلحات الموجودة */
  const existingTerms = (l.terms || []);
  /* الموارد الموجودة */
  const existingRes  = (l.resources || []);

  showSheet(id ? 'تعديل الدرس' : 'إضافة درس جديد', `
    <!-- ══ المعلومات الأساسية ══ -->
    <div style="font-size:11px;font-weight:700;color:var(--text-3);
      text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;
      padding-bottom:4px;border-bottom:2px solid var(--accent)">
      المعلومات الأساسية
    </div>
    <div class="field-grid-2">
      <div class="field-row">
        <label>القسم <span class="req">*</span></label>
        <select class="field" id="lf-cls">${clsOpts}</select>
      </div>
      <div class="field-row">
        <label>المادة <span class="req">*</span></label>
        <select class="field" id="lf-subj">${subjOpts}</select>
      </div>
    </div>
    <div class="field-row">
      <label>عنوان الدرس <span class="req">*</span></label>
      <input class="field" id="lf-title"
        placeholder="مثال: التحليل إلى جداء عوامل" value="${esc(l.title || '')}">
    </div>
    <div class="field-grid-2">
      <div class="field-row">
        <label>الوحدة الدراسية</label>
        <select class="field" id="lf-unitId">${unitOpts}</select>
      </div>
      <div class="field-row">
        <label>الدورة</label>
        <select class="field" id="lf-semester">${semOpts}</select>
      </div>
    </div>
    <div class="field-grid-2">
      <div class="field-row">
        <label>التاريخ</label>
        <input class="field" type="date" id="lf-date" value="${l.date || today()}">
      </div>
      <div class="field-row">
        <label>مدة الحصة (دقيقة)</label>
        <input class="field" type="number" id="lf-duration"
          min="0" step="5" placeholder="مثال: 55" value="${l.duration || ''}">
      </div>
    </div>
    <div class="field-row">
      <label>ملخص الدرس</label>
      <textarea class="field" id="lf-summary" rows="2"
        placeholder="ملخص مختصر للدرس">${esc(l.summary || '')}</textarea>
    </div>
    <div class="field-row">
      <label>المتطلبات القبلية</label>
      <input class="field" id="lf-prerequisites"
        placeholder="ما يجب أن يعرفه التلميذ قبل هذا الدرس"
        value="${esc(l.prerequisites || '')}">
    </div>

    <!-- ══ الأهداف التعليمية ══ -->
    <div style="font-size:11px;font-weight:700;color:var(--text-3);
      text-transform:uppercase;letter-spacing:.6px;
      margin:14px 0 8px;padding-bottom:4px;border-bottom:2px solid var(--green)">
      الأهداف التعليمية
    </div>
    <div id="lf-objs-list">
      ${existingObjs.map((o, i) => _objRowHtml(i, o)).join('')}
    </div>
    <button class="btn btn-outline" style="width:100%;font-size:12px;margin-bottom:4px"
      onclick="_addObjRow()">+ إضافة هدف</button>

    <!-- ══ فقرات الدرس ══ -->
    <div style="font-size:11px;font-weight:700;color:var(--text-3);
      text-transform:uppercase;letter-spacing:.6px;
      margin:14px 0 8px;padding-bottom:4px;border-bottom:2px solid var(--accent)">
      فقرات الدرس (المحتوى التفصيلي)
    </div>
    <div id="lf-secs-list">
      ${existingSecs.map((sec, i) => _secRowHtml(i, sec)).join('')}
    </div>
    <button class="btn btn-outline" style="width:100%;font-size:12px;margin-bottom:4px"
      onclick="_addSecRow()">+ إضافة فقرة</button>

    <!-- ══ المصطلحات ══ -->
    <div style="font-size:11px;font-weight:700;color:var(--text-3);
      text-transform:uppercase;letter-spacing:.6px;
      margin:14px 0 8px;padding-bottom:4px;border-bottom:2px solid var(--accent)">
      المصطلحات الأساسية
    </div>
    <div id="lf-terms-list">
      ${existingTerms.map((t, i) => _termRowHtml(i, t)).join('')}
    </div>
    <button class="btn btn-outline" style="width:100%;font-size:12px;margin-bottom:4px"
      onclick="_addTermRow()">+ إضافة مصطلح</button>

    <!-- ══ الموارد والمراجع ══ -->
    <div style="font-size:11px;font-weight:700;color:var(--text-3);
      text-transform:uppercase;letter-spacing:.6px;
      margin:14px 0 8px;padding-bottom:4px;border-bottom:2px solid var(--accent)">
      الموارد والمراجع
    </div>
    <div id="lf-res-list">
      ${existingRes.map((r, i) => _resRowHtml(i, r)).join('')}
    </div>
    <button class="btn btn-outline" style="width:100%;font-size:12px;margin-bottom:4px"
      onclick="_addResRow()">+ إضافة مرجع / رابط</button>

    <!-- ══ الواجب والملاحظات ══ -->
    <div style="font-size:11px;font-weight:700;color:var(--text-3);
      text-transform:uppercase;letter-spacing:.6px;
      margin:14px 0 8px;padding-bottom:4px;border-bottom:2px solid var(--border)">
      الواجب المنزلي والملاحظات
    </div>
    <div class="field-row">
      <label>الواجب المنزلي</label>
      <textarea class="field" id="lf-homework" rows="2"
        placeholder="وصف الواجب المنزلي لهذا الدرس">${esc(l.homework || '')}</textarea>
    </div>
    <div class="field-row">
      <label>ملاحظات الأستاذ</label>
      <textarea class="field" id="lf-notes" rows="2"
        placeholder="ملاحظات شخصية حول هذا الدرس">${esc(l.notes || '')}</textarea>
    </div>
    <input type="hidden" id="lf-id" value="${id || ''}">
  `, [
    { label: 'إلغاء', cls: 'btn-outline', fn: 'closeSheet()' },
    { label: 'حفظ',   cls: 'btn-accent',  fn: 'saveLesson()' }
  ]);
}

/* ── صفوف ديناميكية داخل النموذج ─────────────────────────────── */
function _objRowHtml(i, val = '') {
  return `<div class="lf-obj-row" style="display:flex;gap:6px;margin-bottom:6px" data-idx="${i}">
    <input class="field" style="flex:1" placeholder="هدف تعليمي…" value="${esc(val)}">
    <button class="btn btn-outline" style="padding:6px 10px;color:var(--danger)"
      onclick="this.closest('.lf-obj-row').remove()">✕</button>
  </div>`;
}
function _addObjRow() {
  const c = document.getElementById('lf-objs-list');
  if (!c) return;
  const i = c.children.length;
  c.insertAdjacentHTML('beforeend', _objRowHtml(i));
}

function _secRowHtml(i, sec = {}) {
  return `<div class="lf-sec-row" data-idx="${i}"
    style="border:1px solid var(--border);border-radius:var(--radius-lg);
      padding:10px;margin-bottom:8px;background:var(--bg-2)">
    <div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">
      <span style="font-size:12px;font-weight:700;color:var(--text-3);min-width:16px">${i+1}</span>
      <input class="field lf-sec-title" style="flex:1"
        placeholder="عنوان الفقرة (اختياري)" value="${esc(sec.title || '')}">
      <button class="btn btn-outline" style="padding:6px 10px;color:var(--danger)"
        onclick="this.closest('.lf-sec-row').remove();_renumberSecs()">✕</button>
    </div>
    <textarea class="field lf-sec-content" rows="3"
      placeholder="محتوى هذه الفقرة…">${esc(sec.content || '')}</textarea>
  </div>`;
}
function _addSecRow() {
  const c = document.getElementById('lf-secs-list');
  if (!c) return;
  c.insertAdjacentHTML('beforeend', _secRowHtml(c.children.length));
}
function _renumberSecs() {
  document.querySelectorAll('.lf-sec-row').forEach((row, i) => {
    const num = row.querySelector('span');
    if (num) num.textContent = i + 1;
  });
}

function _termRowHtml(i, t = {}) {
  return `<div class="lf-term-row" style="display:flex;gap:6px;margin-bottom:6px" data-idx="${i}">
    <input class="field" style="width:130px" placeholder="المصطلح" value="${esc(t.word || '')}">
    <input class="field" style="flex:1" placeholder="التعريف أو الشرح" value="${esc(t.def || '')}">
    <button class="btn btn-outline" style="padding:6px 10px;color:var(--danger)"
      onclick="this.closest('.lf-term-row').remove()">✕</button>
  </div>`;
}
function _addTermRow() {
  const c = document.getElementById('lf-terms-list');
  if (!c) return;
  c.insertAdjacentHTML('beforeend', _termRowHtml(c.children.length));
}

function _resRowHtml(i, r = {}) {
  const typeOpts = ['link','video','book','exercise'].map(t =>
    `<option value="${t}" ${(r.type||'link')===t?'selected':''}>${
      t==='link'?'رابط':t==='video'?'فيديو':t==='book'?'كتاب':'تمرين'}</option>`
  ).join('');
  return `<div class="lf-res-row" style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap" data-idx="${i}">
    <select class="field" style="width:100px">${typeOpts}</select>
    <input class="field" style="flex:1;min-width:120px" placeholder="العنوان" value="${esc(r.title || '')}">
    <input class="field" style="flex:1;min-width:140px" placeholder="رابط URL (اختياري)" value="${esc(r.url || '')}">
    <button class="btn btn-outline" style="padding:6px 10px;color:var(--danger)"
      onclick="this.closest('.lf-res-row').remove()">✕</button>
  </div>`;
}
function _addResRow() {
  const c = document.getElementById('lf-res-list');
  if (!c) return;
  c.insertAdjacentHTML('beforeend', _resRowHtml(c.children.length));
}

/* ── حفظ الدرس — يجمع كل البيانات الديناميكية ───────────────── */
function saveLesson() {
  const id    = document.getElementById('lf-id').value;
  const title = document.getElementById('lf-title').value.trim();
  if (!title) { toast('أدخل عنوان الدرس', 'error'); return; }

  /* الأهداف */
  const objectives = [...document.querySelectorAll('#lf-objs-list .lf-obj-row input')]
    .map(el => el.value.trim()).filter(Boolean);

  /* الفقرات */
  const sections = [...document.querySelectorAll('#lf-secs-list .lf-sec-row')].map(row => ({
    title:   (row.querySelector('.lf-sec-title')?.value   || '').trim(),
    content: (row.querySelector('.lf-sec-content')?.value || '').trim()
  })).filter(s => s.title || s.content);

  /* المصطلحات */
  const terms = [...document.querySelectorAll('#lf-terms-list .lf-term-row')].map(row => {
    const inputs = row.querySelectorAll('input');
    return { word: (inputs[0]?.value || '').trim(), def: (inputs[1]?.value || '').trim() };
  }).filter(t => t.word || t.def);

  /* الموارد */
  const resources = [...document.querySelectorAll('#lf-res-list .lf-res-row')].map(row => {
    const sel    = row.querySelector('select');
    const inputs = row.querySelectorAll('input');
    return {
      type:  sel?.value    || 'link',
      title: (inputs[0]?.value || '').trim(),
      url:   (inputs[1]?.value || '').trim()
    };
  }).filter(r => r.title);

  const obj = {
    cls:           document.getElementById('lf-cls').value,
    subj:          document.getElementById('lf-subj').value,
    title,
    unitId:        document.getElementById('lf-unitId').value || null,
    semester:      document.getElementById('lf-semester').value,
    date:          document.getElementById('lf-date').value,
    duration:      document.getElementById('lf-duration').value,
    summary:       document.getElementById('lf-summary').value.trim(),
    prerequisites: document.getElementById('lf-prerequisites').value.trim(),
    objectives,
    sections,
    terms,
    resources,
    homework:      document.getElementById('lf-homework').value.trim(),
    notes:         document.getElementById('lf-notes').value.trim(),
  };

  if (id) {
    const existing = DATA.lessons.find(x => x.id === id);
    /* حافظ على status الموجود */
    Object.assign(existing, obj);
  } else {
    DATA.lessons.push({ id: uid(), status: 'planned', order: DATA.lessons.length, ...obj });
  }
  save(); closeSheet(); toast('تم الحفظ', 'success'); renderLessons();
}

/* ── حذف الدرس ───────────────────────────────────────────────── */
function deleteLesson(id) {
  if (!confirm('حذف هذا الدرس نهائياً؟')) return;
  DATA.lessons = DATA.lessons.filter(l => l.id !== id);
  save(); toast('تم الحذف'); renderLessons();
}

/* ── تبديل حالة الدرس (مخطط ↔ مُدرَّس) ─────────────────────── */
function toggleLessonStatus(id) {
  const l = DATA.lessons.find(x => x.id === id);
  if (!l) return;
  l.status = l.status === 'done' ? 'planned' : 'done';
  save();
  toast(l.status === 'done' ? '✓ تم تعليم الدرس كمُدرَّس' : 'تم إلغاء التدريس', 'success');
  renderLessons();
}

/* ═══════════════════════════════════════════════════════════════
   طباعة ملف الدرس
═══════════════════════════════════════════════════════════════ */
function printLesson(id) {
  const l    = DATA.lessons.find(x => x.id === id);
  if (!l) return;
  const unit = DATA.units.find(u => u.id === l.unitId);
  const cls  = CLASSES.find(c => c.id === l.cls)?.label   || l.cls;
  const subj = SUBJECTS.find(s => s.id === l.subj)?.label || l.subj;

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>ملف الدرس — ${l.title}</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0 }
    body { font-family:'Segoe UI',Arial,sans-serif; color:#111; direction:rtl;
           padding:28px; font-size:13px; line-height:1.7 }
    h1 { font-size:20px; color:#1a1a2e; margin-bottom:4px }
    .meta { color:#666; font-size:12px; margin-bottom:20px; display:flex; gap:16px; flex-wrap:wrap }
    .meta span { background:#f0f0f0; padding:2px 10px; border-radius:12px }
    .section { margin-bottom:20px }
    .section-title { font-size:13px; font-weight:800; color:#3B4FC0;
                     text-transform:uppercase; letter-spacing:.5px;
                     padding-bottom:5px; border-bottom:2px solid #3B4FC0; margin-bottom:10px }
    .obj-item { display:flex; gap:8px; padding:3px 0 }
    .obj-item::before { content:'✓'; color:#16a34a; font-weight:700 }
    .para { margin-bottom:12px; border:1px solid #e0e0e0; border-radius:6px; overflow:hidden }
    .para-title { padding:6px 12px; background:#f5f5f5; font-weight:700; font-size:13px;
                  border-bottom:1px solid #e0e0e0 }
    .para-body { padding:10px 12px; white-space:pre-wrap; font-size:13px; color:#333 }
    .terms table { width:100%; border-collapse:collapse }
    .terms th { background:#f0f0f0; padding:5px 10px; text-align:right; font-size:12px }
    .terms td { padding:5px 10px; border-bottom:1px solid #eee; font-size:12px }
    .terms td:first-child { font-weight:700; color:#3B4FC0; width:150px }
    .hw-box { background:#fff8e1; border-right:4px solid #f59e0b;
               padding:10px 14px; border-radius:4px; font-size:13px }
    .notes-box { background:#f0fdf4; border-right:4px solid #22c55e;
                  padding:10px 14px; border-radius:4px; font-size:12px; color:#555 }
    .res-item { padding:4px 0; font-size:12px; border-bottom:1px dashed #eee }
    @media print { body { padding:10px } }
  </style>
</head>
<body>
  <h1>${esc(l.title)}</h1>
  <div class="meta">
    <span>${cls}</span>
    <span>${subj}</span>
    ${unit ? `<span>${esc(unit.title)}</span>` : ''}
    ${l.semester ? `<span>${esc(l.semester)}</span>` : ''}
    ${l.date ? `<span>${fdate(l.date)}</span>` : ''}
    ${l.duration ? `<span>⏱ ${l.duration} دقيقة</span>` : ''}
  </div>

  ${l.summary ? `
  <div class="section">
    <div class="section-title">ملخص الدرس</div>
    <p style="font-style:italic;color:#444">${esc(l.summary)}</p>
  </div>` : ''}

  ${l.prerequisites ? `
  <div class="section">
    <div class="section-title">المتطلبات القبلية</div>
    <p>${esc(l.prerequisites)}</p>
  </div>` : ''}

  ${(l.objectives||[]).length ? `
  <div class="section">
    <div class="section-title">الأهداف التعليمية</div>
    ${l.objectives.map(o => `<div class="obj-item">${esc(o)}</div>`).join('')}
  </div>` : ''}

  ${(l.sections||[]).length ? `
  <div class="section">
    <div class="section-title">محتوى الدرس</div>
    ${l.sections.map((sec, i) => `
      <div class="para">
        ${sec.title ? `<div class="para-title">${i+1}. ${esc(sec.title)}</div>` : ''}
        <div class="para-body">${esc(sec.content || '')}</div>
      </div>`).join('')}
  </div>` : ''}

  ${(l.terms||[]).length ? `
  <div class="section terms">
    <div class="section-title">المصطلحات الأساسية</div>
    <table>
      <thead><tr><th>المصطلح</th><th>التعريف</th></tr></thead>
      <tbody>
        ${l.terms.map(t => `<tr><td>${esc(t.word)}</td><td>${esc(t.def)}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  ${(l.resources||[]).length ? `
  <div class="section">
    <div class="section-title">الموارد والمراجع</div>
    ${l.resources.map(r => `
      <div class="res-item">
        <b>${r.type==='video'?'🎬 فيديو':r.type==='book'?'📖 كتاب':r.type==='exercise'?'📝 تمرين':'🔗 رابط'}</b>
        — ${esc(r.title)} ${r.url ? `<span style="color:#3B4FC0">(${esc(r.url)})</span>` : ''}
      </div>`).join('')}
  </div>` : ''}

  ${l.homework ? `
  <div class="section">
    <div class="section-title">الواجب المنزلي</div>
    <div class="hw-box">${esc(l.homework)}</div>
  </div>` : ''}

  ${l.notes ? `
  <div class="section">
    <div class="section-title">ملاحظات الأستاذ</div>
    <div class="notes-box">${esc(l.notes)}</div>
  </div>` : ''}

  <script>window.print();<\/script>
</body>
</html>`);
  win.document.close();
}

/* ═══════════════════════════════════════════════════════════════
   تصدير CSV قائمة الدروس
═══════════════════════════════════════════════════════════════ */
function exportLessonsCSV() {
  const cls  = filLess.cls;
  const subj = filLess.subj;
  const clsLb = CLASSES.find(c => c.id===cls)?.label   || cls;
  const sbLb  = SUBJECTS.find(s => s.id===subj)?.label || subj;
  const items = DATA.lessons.filter(l => l.cls===cls && l.subj===subj);
  if (!items.length) { toast('لا توجد دروس لتصديرها', 'error'); return; }

  const q = v => `"${String(v??'').replace(/"/g,'""')}"`;
  const header = ['الوحدة','العنوان','الدورة','التاريخ','المدة (د)',
                  'الأهداف','الفقرات','المصطلحات','الحالة'];
  const rows = items.map(l => {
    const unit = DATA.units.find(u => u.id===l.unitId);
    return [
      unit?.title || l.unit || '',
      l.title,
      l.semester || '',
      l.date     || '',
      l.duration || '',
      (l.objectives||[]).length,
      (l.sections ||[]).length,
      (l.terms    ||[]).length,
      l.status==='done' ? 'مُدرَّس' : 'مخطط'
    ].map(q).join(',');
  });

  const csv  = '\uFEFF' + [header.map(q).join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), {
    href: url, download: `دروس_${clsLb}_${sbLb}_${today()}.csv`
  }).click();
  URL.revokeObjectURL(url);
  toast('تم تصدير الملف', 'success');
}