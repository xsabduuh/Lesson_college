/* =================================================================
   EXERCISES (التمارين) — النسخة الشاملة v2
   ─────────────────────────────────────────────────────────────────
   هيكل البيانات الجديد:
     DATA.exercises = [{
       id, cls, subj,
       title,
       type,        // نوع التمرين
       level,       // المستوى: سهل / متوسط / صعب / تحدٍّ
       duration,    // وقت الإنجاز (دقيقة)
       date,
       lessonId,    // ربط بدرس
       unit,        // الوحدة (نص حر)
       objectives,  // الأهداف التي يختبرها
       content,     // نص التمرين الرئيسي
       parts[],     // أجزاء/أسئلة فرعية { label, text, hint, solution }
       solution,    // حل عام (إذا لم تكن هناك أجزاء)
       hint,        // تلميح عام
       tags[],      // كلمات مفتاحية
       note,        // ملاحظات الأستاذ
       isFavorite,  // مفضلة
     }]
   ─────────────────────────────────────────────────────────────────
   مميزات جديدة:
   ✅ أنواع تمارين: سؤال مفتوح، QCM، صح/خطأ، تعبئة، حساب، برهان
   ✅ أجزاء/أسئلة فرعية ديناميكية مع تلميح وحل لكل جزء
   ✅ ربط التمرين بدرس من DATA.lessons
   ✅ تلميح قابل للإخفاء/الإظهار
   ✅ إظهار/إخفاء الحل داخل البطاقة
   ✅ 3 أوضاع عرض: حسب المستوى / الكل / الإحصاء
   ✅ بحث + فلترة (مستوى، نوع، مفضلة)
   ✅ تمييز التمارين المفضلة ⭐
   ✅ نسخ تمرين (Duplicate)
   ✅ طباعة ورقة تمرين (مع/بدون حل)
   ✅ طباعة ورقة عمل جماعية (اختيار عدة تمارين)
   ✅ تصدير CSV
   ✅ إحصاء شامل بالرسوم البيانية
================================================================= */

/* ── ثوابت أنواع التمارين ──────────────────────────────────── */
const EXERCISE_TYPES = [
  { id: 'open',      label: 'سؤال مفتوح',     icon: '✏️' },
  { id: 'mcq',       label: 'اختيار من متعدد', icon: '🔘' },
  { id: 'truefalse', label: 'صح / خطأ',        icon: '✓✗' },
  { id: 'fillblank', label: 'تعبئة الفراغ',    icon: '▭' },
  { id: 'calc',      label: 'حساب / تطبيق',   icon: '🧮' },
  { id: 'proof',     label: 'برهان / إثبات',   icon: '📐' },
];

/* ── حالة محلية ──────────────────────────────────────────────── */
let exerView      = 'bylevel'; // 'bylevel' | 'all' | 'stats'
let exerSearch    = '';
let exerLevelF    = '';        // فلتر المستوى
let exerTypeF     = '';        // فلتر النوع
let exerFavOnly   = false;     // المفضلة فقط
let exerShowSol   = {};        // { id: true } — التمارين المعروض حلّها
let exerSelected  = {};        // { id: true } — تمارين مختارة للطباعة الجماعية

/* ═══════════════════════════════════════════════════════════════
   renderExercises — دالة العرض الرئيسية
═══════════════════════════════════════════════════════════════ */
function renderExercises() {
  const cls  = filExer.cls;
  const subj = filExer.subj;
  const s    = subjById(subj);
  const all  = DATA.exercises.filter(e => e.cls === cls && e.subj === subj);

  /* إحصاء سريع */
  const byLevel = {};
  LEVEL_COLORS && Object.keys(LEVEL_COLORS).forEach(l => {
    byLevel[l] = all.filter(e => e.level === l).length;
  });
  const favCount = all.filter(e => e.isFavorite).length;

  const sec = document.getElementById('sec-exercises');
  sec.innerHTML = `
    ${classTabsHtml(cls, 'setExerCls')}
    ${subjPillsHtml(subj, 'setExerSubj')}

    <!-- شريط الأدوات -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <button class="btn btn-accent" onclick="openExerciseForm()">
        ${IC.plus} تمرين جديد
      </button>
      <button class="btn btn-outline" onclick="openWorksheetPrint()"
        title="طباعة ورقة عمل من تمارين مختارة">
        🖨 ورقة عمل
      </button>
      <button class="btn btn-outline" onclick="exportExercisesCSV()"
        title="تصدير إلى CSV">${IC.download} CSV</button>
      <div style="flex:1"></div>
      <!-- تبديل العرض -->
      <div style="display:flex;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">
        ${[['bylevel','المستويات'],['all','الكل'],['stats','إحصاء']].map(([v,l]) => `
          <button onclick="switchExerView('${v}')"
            style="padding:6px 13px;font-size:12px;font-weight:600;border:none;cursor:pointer;
              background:${exerView===v?'var(--accent)':'var(--surface)'};
              color:${exerView===v?'#fff':'var(--text-2)'};transition:background .15s">
            ${l}
          </button>`).join('')}
      </div>
    </div>

    <!-- شريط البحث والفلاتر -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <div style="flex:1;min-width:160px;position:relative">
        <span style="position:absolute;right:11px;top:50%;transform:translateY(-50%);
          color:var(--text-3);pointer-events:none">${IC.search}</span>
        <input class="field" id="exer-search-input" style="padding-right:36px"
          placeholder="بحث في التمارين…"
          value="${esc(exerSearch)}"
          oninput="exerSearch=this.value;updateExercisesList()">
        ${exerSearch ? `<button onclick="exerSearch='';updateExercisesList()"
          style="position:absolute;left:10px;top:50%;transform:translateY(-50%);
            background:none;border:none;cursor:pointer;color:var(--text-3)">✕</button>` : ''}
      </div>
      <select class="field" style="width:120px"
        onchange="exerLevelF=this.value;renderExercises()">
        <option value="">كل المستويات</option>
        ${['سهل','متوسط','صعب','تحدٍّ'].map(l =>
          `<option value="${l}" ${exerLevelF===l?'selected':''}>${l}</option>`).join('')}
      </select>
      <select class="field" style="width:140px"
        onchange="exerTypeF=this.value;renderExercises()">
        <option value="">كل الأنواع</option>
        ${EXERCISE_TYPES.map(t =>
          `<option value="${t.id}" ${exerTypeF===t.id?'selected':''}>${t.icon} ${t.label}</option>`).join('')}
      </select>
      <button class="btn ${exerFavOnly?'btn-accent':'btn-outline'}"
        style="font-size:13px" onclick="exerFavOnly=!exerFavOnly;renderExercises()">
        ⭐ ${exerFavOnly ? 'إلغاء' : 'المفضلة'}
      </button>
      ${(exerSearch||exerLevelF||exerTypeF||exerFavOnly) ? `
        <button class="btn btn-outline" style="font-size:12px"
          onclick="exerSearch='';exerLevelF='';exerTypeF='';exerFavOnly=false;renderExercises()">
          ✕ مسح الفلاتر
        </button>` : ''}
    </div>

    <!-- بطاقات الإحصاء السريع -->
    <div class="stat-grid" style="margin-bottom:12px">
      <div class="stat-card">
        <div class="s-label">المجموع</div>
        <div class="s-val">${all.length}</div>
      </div>
      <div class="stat-card">
        <div class="s-label">سهل / متوسط</div>
        <div class="s-val" style="color:var(--green);font-size:14px">
          ${(byLevel['سهل']||0)} / ${(byLevel['متوسط']||0)}
        </div>
      </div>
      <div class="stat-card">
        <div class="s-label">صعب / تحدٍّ</div>
        <div class="s-val" style="color:var(--danger);font-size:14px">
          ${(byLevel['صعب']||0)} / ${(byLevel['تحدٍّ']||0)}
        </div>
      </div>
      <div class="stat-card">
        <div class="s-label">المفضلة ⭐</div>
        <div class="s-val">${favCount}</div>
      </div>
    </div>

    <!-- المحتوى الرئيسي (سيتم تحديثه جزئياً عند البحث) -->
    <div id="exercises-list-container">
      ${generateExercisesContent(cls, subj, all)}
    </div>
  `;
}

/* ── توليد محتوى القائمة حسب طريقة العرض الحالية ────────────── */
function generateExercisesContent(cls, subj, all) {
  if (exerView === 'bylevel') return _renderByLevel(all);
  if (exerView === 'all')     return _renderAllExercises(all);
  return _renderExerStats(all);
}

/* ── تحديث جزئي للقائمة عند البحث فقط (يحافظ على التركيز) ───── */
function updateExercisesList() {
  const cls  = filExer.cls;
  const subj = filExer.subj;
  const all  = DATA.exercises.filter(e => e.cls === cls && e.subj === subj);

  const container = document.getElementById('exercises-list-container');
  if (container) {
    container.innerHTML = generateExercisesContent(cls, subj, all);
  }

  // إبقاء التركيز على حقل البحث
  const searchInput = document.getElementById('exer-search-input');
  if (searchInput) {
    searchInput.focus();
    const val = searchInput.value;
    searchInput.setSelectionRange(val.length, val.length);
  }
}

/* ── تبديل العرض ─────────────────────────────────────────────── */
function switchExerView(v) { exerView = v; exerSearch = ''; exerLevelF = ''; exerTypeF = ''; renderExercises(); }
function setExerCls(cls)   { filExer.cls  = cls;  exerSelected = {}; renderExercises(); }
function setExerSubj(subj) { filExer.subj = subj; exerSelected = {}; renderExercises(); }

/* ── تطبيق الفلاتر ───────────────────────────────────────────── */
function _applyFilters(items) {
  let r = items.slice();
  if (exerSearch) {
    const q = exerSearch.toLowerCase();
    r = r.filter(e =>
      e.title.toLowerCase().includes(q) ||
      (e.content || '').toLowerCase().includes(q) ||
      (e.unit    || '').toLowerCase().includes(q) ||
      (e.tags    || []).some(t => t.toLowerCase().includes(q))
    );
  }
  if (exerLevelF)  r = r.filter(e => e.level === exerLevelF);
  if (exerTypeF)   r = r.filter(e => e.type  === exerTypeF);
  if (exerFavOnly) r = r.filter(e => e.isFavorite);
  return r;
}

/* ═══════════════════════════════════════════════════════════════
   وضع المستويات — تمارين مجمّعة حسب المستوى
═══════════════════════════════════════════════════════════════ */
function _renderByLevel(all) {
  const filtered = _applyFilters(all);
  const levels = ['سهل','متوسط','صعب','تحدٍّ'];

  if (!filtered.length)
    return `<div class="panel">${emptyHtml(
      exerSearch||exerLevelF||exerTypeF||exerFavOnly ? 'لا نتائج' : 'لا توجد تمارين بعد',
      exerSearch||exerLevelF||exerTypeF||exerFavOnly ? 'جرب تغيير معايير البحث' : 'أضف تمريناً باستخدام الزر أعلاه'
    )}</div>`;

  const levelMeta = {
    'سهل':   { color:'var(--green)',  bg:'#dcfce7', icon:'🟢', badge:'badge-green' },
    'متوسط': { color:'#d97706',       bg:'#fef9c3', icon:'🟡', badge:'badge-amber' },
    'صعب':   { color:'var(--danger)', bg:'#fee2e2', icon:'🔴', badge:'badge-red'   },
    'تحدٍّ': { color:'#7c3aed',       bg:'#ede9fe', icon:'💜', badge:'badge-blue'  },
  };

  return levels.map(level => {
    const items = filtered.filter(e => e.level === level || (!e.level && level === 'سهل' && !['متوسط','صعب','تحدٍّ'].includes(e.level)));
    const all_lv = filtered.filter(e => (e.level || 'سهل') === level);
    if (!all_lv.length) return '';
    const m = levelMeta[level] || { color:'var(--text-2)', bg:'var(--bg-2)', icon:'⚪', badge:'' };
    return `
      <div class="panel" style="margin-bottom:12px;padding:0;overflow:hidden">
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;
          background:${m.bg};border-bottom:1px solid var(--border)">
          <span style="font-size:18px">${m.icon}</span>
          <span style="font-weight:800;font-size:14px;color:${m.color}">${level}</span>
          <span class="badge ${m.badge}" style="font-size:11px">${all_lv.length}</span>
        </div>
        ${all_lv.map((e, i) => _exerciseCardHtml(e, i + 1)).join('')}
      </div>`;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════════
   وضع الكل — قائمة مع بحث
═══════════════════════════════════════════════════════════════ */
function _renderAllExercises(all) {
  const filtered = _applyFilters(all);
  if (!filtered.length)
    return `<div class="panel">${emptyHtml('لا توجد تمارين','أضف تمريناً باستخدام الزر أعلاه')}</div>`;
  return `<div>${filtered.map((e, i) => _exerciseCardHtml(e, i + 1)).join('')}</div>`;
}

/* ═══════════════════════════════════════════════════════════════
   بطاقة التمرين — أكورديون متكامل
═══════════════════════════════════════════════════════════════ */
function _exerciseCardHtml(e, num) {
  const typeInfo   = EXERCISE_TYPES.find(t => t.id === e.type) || EXERCISE_TYPES[0];
  const parts      = e.parts || [];
  const tags       = e.tags  || [];
  const showSol    = exerShowSol[e.id];
  const isSelected = exerSelected[e.id];
  const lesson     = e.lessonId ? DATA.lessons?.find(l => l.id === e.lessonId) : null;

  const levelColors = {
    'سهل':'var(--green)', 'متوسط':'#d97706', 'صعب':'var(--danger)', 'تحدٍّ':'#7c3aed'
  };
  const levelColor = levelColors[e.level] || 'var(--text-3)';
  const levelBadge = { 'سهل':'badge-green','متوسط':'badge-amber','صعب':'badge-red','تحدٍّ':'badge-blue' };

  return `
    <div class="lesson-card" style="border-bottom:1px solid var(--border)">
      <!-- رأس البطاقة -->
      <div class="lesson-card-head"
        style="display:flex;align-items:flex-start;gap:10px;padding:12px 14px;cursor:pointer">
        <!-- اختيار للطباعة الجماعية -->
        <input type="checkbox" ${isSelected?'checked':''}
          onclick="event.stopPropagation();exerSelected['${e.id}']=this.checked"
          style="margin-top:3px;flex-shrink:0;width:15px;height:15px;cursor:pointer"
          title="اختر للطباعة الجماعية">
        <!-- رقم -->
        <div style="width:30px;height:30px;border-radius:8px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          background:var(--bg-2);color:var(--text-3);font-weight:800;font-size:13px">
          ${num}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:13px;line-height:1.4">
            ${e.isFavorite ? '<span style="color:#f59e0b">⭐</span> ' : ''}${esc(e.title)}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;align-items:center">
            ${e.level ? `<span class="badge ${levelBadge[e.level]||''}" style="font-size:10px">${e.level}</span>` : ''}
            <span style="font-size:11px;color:var(--text-3)">${typeInfo.icon} ${typeInfo.label}</span>
            ${e.duration ? `<span style="font-size:11px;color:var(--text-3)">⏱ ${e.duration} د</span>` : ''}
            ${parts.length ? `<span style="font-size:11px;color:var(--text-3)">${parts.length} أجزاء</span>` : ''}
            ${lesson ? `<span style="font-size:11px;color:var(--accent)">📖 ${esc(lesson.title.slice(0,25))}</span>` : ''}
            ${e.unit ? `<span style="font-size:11px;color:var(--text-3)">📦 ${esc(e.unit.slice(0,20))}</span>` : ''}
            ${e.date ? `<span style="font-size:11px;color:var(--text-3)">${fdate(e.date)}</span>` : ''}
            ${tags.map(t => `<span style="font-size:10px;padding:1px 7px;border-radius:20px;
              background:var(--bg-2);color:var(--text-3)">#${esc(t)}</span>`).join('')}
          </div>
        </div>
        <!-- أزرار الرأس -->
        <div style="display:flex;align-items:center;gap:4px;flex-shrink:0">
          <button onclick="event.stopPropagation();toggleExerFav('${e.id}')"
            class="btn btn-outline" style="font-size:13px;padding:4px 8px"
            title="${e.isFavorite?'إزالة من المفضلة':'إضافة للمفضلة'}">
            ${e.isFavorite ? '⭐' : '☆'}
          </button>
          <button onclick="event.stopPropagation();printExercise('${e.id}',false)"
            class="btn btn-outline" style="font-size:11px;padding:4px 8px" title="طباعة للتلاميذ">
            ${IC.file}
          </button>
          <button onclick="event.stopPropagation();duplicateExercise('${e.id}')"
            class="btn btn-outline" style="font-size:11px;padding:4px 8px" title="نسخ التمرين">
            ⧉
          </button>
          ${adminBtns(
            `event.stopPropagation();openExerciseForm('${e.id}')`,
            `event.stopPropagation();deleteExercise('${e.id}')`
          )}
          <span style="color:var(--text-3)">${IC.chevDown}</span>
        </div>
      </div>

      <!-- جسم الأكورديون -->
      <div class="lesson-card-body" style="padding:0 14px 14px;display:none">

        <!-- الأهداف المُختبَرة -->
        ${e.objectives ? `
          <div style="margin-bottom:10px;padding:8px 12px;background:var(--bg-2);
            border-radius:var(--radius-lg);font-size:12px;color:var(--text-2);
            border-right:3px solid var(--accent)">
            <b style="display:block;margin-bottom:3px;font-size:11px;color:var(--text-3)">
              الأهداف التي يختبرها
            </b>
            ${esc(e.objectives)}
          </div>` : ''}

        <!-- نص التمرين الرئيسي -->
        ${e.content ? `
          <div style="margin-bottom:12px;font-size:14px;line-height:1.9;
            color:var(--text);white-space:pre-wrap;
            padding:10px;background:var(--bg-2);border-radius:var(--radius-lg)">
            ${esc(e.content)}
          </div>` : ''}

        <!-- الأجزاء الفرعية -->
        ${parts.length ? `
          <div style="margin-bottom:12px">
            ${parts.map((p, pi) => `
              <div style="margin-bottom:8px;border:1px solid var(--border);
                border-radius:var(--radius-lg);overflow:hidden">
                <div style="padding:7px 12px;background:var(--bg-2);
                  display:flex;align-items:center;gap:8px;
                  border-bottom:1px solid var(--border)">
                  <span style="font-weight:800;font-size:13px;color:var(--accent)">
                    ${p.label || _partLabel(pi)}
                  </span>
                  ${p.hint ? `<span style="font-size:10px;color:var(--text-3);
                    font-style:italic">💡 يوجد تلميح</span>` : ''}
                </div>
                <div style="padding:10px 12px;font-size:13px;
                  line-height:1.8;white-space:pre-wrap">${esc(p.text || '')}</div>
                ${p.hint && showSol ? `
                  <div style="padding:6px 12px;background:#fef9c3;
                    font-size:12px;color:#92400e;border-top:1px solid #fde68a">
                    💡 <b>تلميح:</b> ${esc(p.hint)}
                  </div>` : ''}
                ${p.solution && showSol ? `
                  <div style="padding:8px 12px;background:#dcfce7;
                    font-size:12px;color:#14532d;border-top:1px solid #bbf7d0">
                    ✓ <b>الحل:</b> ${esc(p.solution)}
                  </div>` : ''}
              </div>`).join('')}
          </div>` : ''}

        <!-- تلميح عام -->
        ${e.hint && showSol ? `
          <div style="margin-bottom:8px;padding:8px 12px;background:#fef9c3;
            border-radius:var(--radius-lg);font-size:13px;color:#92400e">
            💡 <b>تلميح:</b> ${esc(e.hint)}
          </div>` : ''}

        <!-- الحل العام -->
        ${e.solution && showSol ? `
          <div style="margin-bottom:8px;padding:10px 12px;background:#dcfce7;
            border-radius:var(--radius-lg);font-size:13px;color:#14532d;
            white-space:pre-wrap;line-height:1.8">
            ✓ <b>الحل:</b><br>${esc(e.solution)}
          </div>` : ''}

        <!-- ملاحظات الأستاذ -->
        ${e.note ? `
          <div style="padding:8px 12px;background:var(--bg-2);
            border-radius:var(--radius-lg);font-size:12px;color:var(--text-3);
            border-right:3px solid var(--border)">
            📝 ${esc(e.note)}
          </div>` : ''}

        <!-- أزرار الجسم -->
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          ${(e.hint || e.solution || parts.some(p=>p.solution||p.hint)) ? `
            <button class="btn btn-outline" style="font-size:12px"
              onclick="exerShowSol['${e.id}']=!exerShowSol['${e.id}'];renderExercises()">
              ${showSol ? '🙈 إخفاء الحل' : '👁 إظهار الحل / التلميح'}
            </button>` : ''}
          <button class="btn btn-outline" style="font-size:12px"
            onclick="printExercise('${e.id}',false)">
            🖨 طباعة بدون حل
          </button>
          <button class="btn btn-outline" style="font-size:12px"
            onclick="printExercise('${e.id}',true)">
            🖨 طباعة مع الحل
          </button>
        </div>
      </div>
    </div>`;
}

/* ── تسمية الأجزاء (أ، ب، ج…) ──────────────────────────────── */
function _partLabel(i) {
  return ['أ','ب','ج','د','ه','و','ز','ح','ط','ي'][i] || `${i+1}`;
}

/* ═══════════════════════════════════════════════════════════════
   وضع الإحصاء
═══════════════════════════════════════════════════════════════ */
function _renderExerStats(all) {
  if (!all.length)
    return `<div class="panel">${emptyHtml('لا توجد تمارين بعد','أضف تمارين لعرض الإحصاءات')}</div>`;

  const byLevel = {};
  ['سهل','متوسط','صعب','تحدٍّ'].forEach(l => { byLevel[l] = all.filter(e => e.level===l).length; });
  const maxL   = Math.max(...Object.values(byLevel), 1);

  const byType = {};
  EXERCISE_TYPES.forEach(t => { byType[t.id] = all.filter(e => e.type===t.id).length; });

  const withParts   = all.filter(e => (e.parts||[]).length > 0).length;
  const withSol     = all.filter(e => e.solution || (e.parts||[]).some(p=>p.solution)).length;
  const withHint    = all.filter(e => e.hint    || (e.parts||[]).some(p=>p.hint)).length;
  const totalDur    = all.reduce((s,e)=>s+(parseInt(e.duration)||0),0);
  const favCount    = all.filter(e=>e.isFavorite).length;

  const levelColors = { 'سهل':'#22c55e','متوسط':'#f59e0b','صعب':'#ef4444','تحدٍّ':'#7c3aed' };

  return `
    <!-- توزيع حسب المستوى -->
    <div class="panel" style="margin-bottom:10px">
      <div class="panel-title">التوزيع حسب المستوى</div>
      <div style="display:flex;align-items:flex-end;gap:10px;height:90px;padding:4px 0">
        ${['سهل','متوسط','صعب','تحدٍّ'].map(l => {
          const cnt = byLevel[l] || 0;
          const h   = Math.round(cnt / maxL * 80);
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">
            <div style="font-size:11px;font-weight:700;min-height:14px">${cnt||''}</div>
            <div style="width:100%;height:${h}px;min-height:${cnt?4:0}px;
              background:${levelColors[l]};border-radius:4px 4px 0 0;transition:height .4s"></div>
            <div style="font-size:11px;color:var(--text-3)">${l}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- ملخص إحصائي -->
    <div class="panel" style="margin-bottom:10px">
      <div class="panel-title">ملخص إحصائي</div>
      ${[
        ['📊 مجموع التمارين',           all.length],
        ['⭐ المفضلة',                  favCount],
        ['📄 تمارين بها أجزاء',          withParts],
        ['✓ تمارين بها حلول',            withSol],
        ['💡 تمارين بها تلميحات',        withHint],
        ['⏱ مجموع وقت الإنجاز',         totalDur ? totalDur + ' دقيقة' : '—'],
        ['⌀ متوسط وقت التمرين',         all.filter(e=>e.duration).length
          ? Math.round(totalDur/all.filter(e=>e.duration).length) + ' دقيقة' : '—'],
      ].map(([label, val]) => `
        <div style="display:flex;justify-content:space-between;
          padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:13px;color:var(--text-2)">${label}</span>
          <span style="font-weight:700;font-family:var(--mono)">${val}</span>
        </div>`).join('')}
    </div>

    <!-- توزيع حسب النوع -->
    <div class="panel">
      <div class="panel-title">التوزيع حسب نوع التمرين</div>
      ${EXERCISE_TYPES.map(t => {
        const cnt  = byType[t.id] || 0;
        const pct  = all.length ? Math.round(cnt/all.length*100) : 0;
        return `<div style="padding:8px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:13px">${t.icon} ${t.label}</span>
            <span style="font-size:12px;font-weight:700;color:var(--text-2)">
              ${cnt} <span style="color:var(--text-3);font-weight:400">(${pct}%)</span>
            </span>
          </div>
          <div style="height:5px;background:var(--bg-2);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:var(--accent);border-radius:4px"></div>
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════
   نموذج إضافة / تعديل تمرين
═══════════════════════════════════════════════════════════════ */
function openExerciseForm(id) {
  const e    = id ? DATA.exercises.find(x => x.id === id) : {};
  const cls  = e.cls  || filExer.cls;
  const subj = e.subj || filExer.subj;

  const clsOpts  = CLASSES.map(c =>
    `<option value="${c.id}" ${cls===c.id?'selected':''}>${c.label}</option>`).join('');
  const subjOpts = SUBJECTS.map(s =>
    `<option value="${s.id}" ${subj===s.id?'selected':''}>${s.label}</option>`).join('');
  const levOpts  = ['','سهل','متوسط','صعب','تحدٍّ'].map(l =>
    `<option value="${l}" ${(e.level||'')===l?'selected':''}>${l||'— المستوى —'}</option>`).join('');
  const typeOpts = EXERCISE_TYPES.map(t =>
    `<option value="${t.id}" ${(e.type||'open')===t.id?'selected':''}>${t.icon} ${t.label}</option>`).join('');

  /* دروس القسم للربط */
  const lessons = (DATA.lessons||[]).filter(l => l.cls===cls && l.subj===subj);
  const lessOpts = [
    `<option value="">— بدون ربط —</option>`,
    ...lessons.map(l =>
      `<option value="${l.id}" ${(e.lessonId||'')===l.id?'selected':''}>${esc(l.title)}</option>`)
  ].join('');

  /* الأجزاء الموجودة */
  const existingParts = e.parts || [];

  showSheet(id ? 'تعديل تمرين' : 'تمرين جديد', `
    <!-- ══ المعلومات الأساسية ══ -->
    <div style="font-size:11px;font-weight:700;color:var(--text-3);
      text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;
      padding-bottom:4px;border-bottom:2px solid var(--accent)">
      المعلومات الأساسية
    </div>
    <div class="field-grid-2">
      <div class="field-row">
        <label>القسم <span class="req">*</span></label>
        <select class="field" id="ef-cls">${clsOpts}</select>
      </div>
      <div class="field-row">
        <label>المادة <span class="req">*</span></label>
        <select class="field" id="ef-subj">${subjOpts}</select>
      </div>
    </div>
    <div class="field-row">
      <label>عنوان التمرين <span class="req">*</span></label>
      <input class="field" id="ef-title"
        placeholder="مثال: تمرين في الضرب والقسمة" value="${esc(e.title || '')}">
    </div>
    <div class="field-grid-2">
      <div class="field-row">
        <label>نوع التمرين</label>
        <select class="field" id="ef-type">${typeOpts}</select>
      </div>
      <div class="field-row">
        <label>المستوى</label>
        <select class="field" id="ef-level">${levOpts}</select>
      </div>
    </div>
    <div class="field-grid-2">
      <div class="field-row">
        <label>وقت الإنجاز (دقيقة)</label>
        <input class="field" type="number" id="ef-duration"
          min="1" step="5" placeholder="مثال: 20" value="${e.duration || ''}">
      </div>
      <div class="field-row">
        <label>التاريخ</label>
        <input class="field" type="date" id="ef-date" value="${e.date || today()}">
      </div>
    </div>
    <div class="field-grid-2">
      <div class="field-row">
        <label>الوحدة (نص حر)</label>
        <input class="field" id="ef-unit"
          placeholder="الوحدة التي ينتمي إليها" value="${esc(e.unit || '')}">
      </div>
      <div class="field-row">
        <label>ربط بدرس</label>
        <select class="field" id="ef-lessonId">${lessOpts}</select>
      </div>
    </div>
    <div class="field-row">
      <label>الأهداف التي يختبرها</label>
      <input class="field" id="ef-objectives"
        placeholder="مثال: التمييز بين المفاهيم، تطبيق القانون…"
        value="${esc(e.objectives || '')}">
    </div>

    <!-- ══ نص التمرين ══ -->
    <div style="font-size:11px;font-weight:700;color:var(--text-3);
      text-transform:uppercase;letter-spacing:.6px;
      margin:14px 0 8px;padding-bottom:4px;border-bottom:2px solid var(--accent)">
      نص التمرين
    </div>
    <div class="field-row">
      <label>التمهيد / السياق العام</label>
      <textarea class="field" id="ef-content" rows="3"
        placeholder="السياق العام للتمرين (تُقرأ قبل الأسئلة)…">${esc(e.content || '')}</textarea>
    </div>

    <!-- ══ الأجزاء الفرعية ══ -->
    <div style="font-size:11px;font-weight:700;color:var(--text-3);
      text-transform:uppercase;letter-spacing:.6px;
      margin:14px 0 8px;padding-bottom:4px;border-bottom:2px solid var(--green)">
      الأجزاء / الأسئلة الفرعية
    </div>
    <div id="ef-parts-list">
      ${existingParts.map((p, i) => _partRowHtml(i, p)).join('')}
    </div>
    <button class="btn btn-outline" style="width:100%;font-size:12px;margin-bottom:4px"
      onclick="_addPartRow()">+ إضافة جزء / سؤال فرعي</button>

    <!-- ══ الحل والتلميح العام ══ -->
    <div style="font-size:11px;font-weight:700;color:var(--text-3);
      text-transform:uppercase;letter-spacing:.6px;
      margin:14px 0 8px;padding-bottom:4px;border-bottom:2px solid var(--border)">
      الحل والتلميح (إذا لم تكن هناك أجزاء)
    </div>
    <div class="field-row">
      <label>تلميح عام</label>
      <input class="field" id="ef-hint"
        placeholder="تلميح يساعد التلميذ دون إعطاء الحل مباشرة"
        value="${esc(e.hint || '')}">
    </div>
    <div class="field-row">
      <label>الحل النموذجي العام</label>
      <textarea class="field" id="ef-solution" rows="3"
        placeholder="الحل الكامل للتمرين…">${esc(e.solution || '')}</textarea>
    </div>

    <!-- ══ الكلمات المفتاحية والملاحظات ══ -->
    <div style="font-size:11px;font-weight:700;color:var(--text-3);
      text-transform:uppercase;letter-spacing:.6px;
      margin:14px 0 8px;padding-bottom:4px;border-bottom:2px solid var(--border)">
      تصنيف وملاحظات
    </div>
    <div class="field-row">
      <label>كلمات مفتاحية (Tags)</label>
      <input class="field" id="ef-tags"
        placeholder="مثال: مشتقات، دالة، برهان (مفصولة بفاصلة)"
        value="${esc((e.tags||[]).join(', '))}">
    </div>
    <div class="field-row">
      <label>ملاحظات الأستاذ</label>
      <textarea class="field" id="ef-note" rows="2"
        placeholder="ملاحظات شخصية حول هذا التمرين">${esc(e.note || '')}</textarea>
    </div>
    <div class="field-row" style="display:flex;align-items:center;gap:10px">
      <input type="checkbox" id="ef-fav" ${e.isFavorite?'checked':''}
        style="width:16px;height:16px">
      <label for="ef-fav" style="cursor:pointer;font-size:13px">⭐ إضافة إلى المفضلة</label>
    </div>
    <input type="hidden" id="ef-id" value="${id || ''}">
  `, [
    { label: 'إلغاء', cls: 'btn-outline', fn: 'closeSheet()' },
    { label: 'حفظ',   cls: 'btn-accent',  fn: 'saveExercise()' }
  ]);
}

/* ── صف جزء فرعي ─────────────────────────────────────────────── */
function _partRowHtml(i, p = {}) {
  const lbl = p.label || _partLabel(i);
  return `
    <div class="ef-part-row" data-idx="${i}"
      style="border:1px solid var(--border);border-radius:var(--radius-lg);
        padding:10px;margin-bottom:8px;background:var(--bg-2)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-weight:800;font-size:14px;color:var(--accent);min-width:28px">
          ${lbl}
        </span>
        <input class="field ef-part-label" style="width:80px"
          placeholder="التسمية" value="${esc(p.label || '')}">
        <div style="flex:1"></div>
        <button class="btn btn-outline" style="padding:4px 10px;color:var(--danger);font-size:12px"
          onclick="this.closest('.ef-part-row').remove();_renumberParts()">✕ حذف</button>
      </div>
      <textarea class="field ef-part-text" rows="2"
        placeholder="نص الجزء / السؤال الفرعي…">${esc(p.text || '')}</textarea>
      <div class="field-grid-2" style="margin-top:6px">
        <div class="field-row">
          <label style="font-size:11px">💡 تلميح (اختياري)</label>
          <input class="field ef-part-hint" placeholder="تلميح لهذا الجزء"
            value="${esc(p.hint || '')}">
        </div>
        <div class="field-row">
          <label style="font-size:11px">✓ الحل (اختياري)</label>
          <input class="field ef-part-sol" placeholder="حل هذا الجزء"
            value="${esc(p.solution || '')}">
        </div>
      </div>
    </div>`;
}

function _addPartRow() {
  const c = document.getElementById('ef-parts-list');
  if (!c) return;
  c.insertAdjacentHTML('beforeend', _partRowHtml(c.children.length));
}

function _renumberParts() {
  document.querySelectorAll('.ef-part-row').forEach((row, i) => {
    const span = row.querySelector('span');
    if (span && !row.querySelector('.ef-part-label')?.value)
      span.textContent = _partLabel(i);
  });
}

/* ── حفظ التمرين ─────────────────────────────────────────────── */
function saveExercise() {
  const id    = document.getElementById('ef-id').value;
  const title = document.getElementById('ef-title').value.trim();
  if (!title) { toast('أدخل عنوان التمرين', 'error'); return; }

  /* الأجزاء */
  const parts = [...document.querySelectorAll('#ef-parts-list .ef-part-row')].map((row, i) => ({
    label:    (row.querySelector('.ef-part-label')?.value || _partLabel(i)).trim(),
    text:     (row.querySelector('.ef-part-text')?.value  || '').trim(),
    hint:     (row.querySelector('.ef-part-hint')?.value  || '').trim(),
    solution: (row.querySelector('.ef-part-sol')?.value   || '').trim(),
  })).filter(p => p.text || p.label !== _partLabel(0));

  /* الكلمات المفتاحية */
  const tagsRaw = document.getElementById('ef-tags').value;
  const tags = tagsRaw.split(/[,،]/).map(t => t.trim()).filter(Boolean);

  const obj = {
    cls:        document.getElementById('ef-cls').value,
    subj:       document.getElementById('ef-subj').value,
    title,
    type:       document.getElementById('ef-type').value,
    level:      document.getElementById('ef-level').value,
    duration:   document.getElementById('ef-duration').value,
    date:       document.getElementById('ef-date').value,
    unit:       document.getElementById('ef-unit').value.trim(),
    lessonId:   document.getElementById('ef-lessonId').value || null,
    objectives: document.getElementById('ef-objectives').value.trim(),
    content:    document.getElementById('ef-content').value.trim(),
    parts,
    hint:       document.getElementById('ef-hint').value.trim(),
    solution:   document.getElementById('ef-solution').value.trim(),
    tags,
    note:       document.getElementById('ef-note').value.trim(),
    isFavorite: document.getElementById('ef-fav').checked,
  };

  if (id) { Object.assign(DATA.exercises.find(x => x.id === id), obj); }
  else    { DATA.exercises.push({ id: uid(), ...obj }); }
  save(); closeSheet(); toast('تم الحفظ', 'success'); renderExercises();
}

/* ── حذف التمرين ─────────────────────────────────────────────── */
function deleteExercise(id) {
  if (!confirm('حذف هذا التمرين نهائياً؟')) return;
  DATA.exercises = DATA.exercises.filter(e => e.id !== id);
  delete exerSelected[id];
  save(); toast('تم الحذف'); renderExercises();
}

/* ── تعبئة / إفراغ المفضلة ───────────────────────────────────── */
function toggleExerFav(id) {
  const e = DATA.exercises.find(x => x.id === id);
  if (!e) return;
  e.isFavorite = !e.isFavorite;
  save();
  toast(e.isFavorite ? '⭐ أضيف إلى المفضلة' : 'أُزيل من المفضلة', 'success');
  renderExercises();
}

/* ── نسخ تمرين ───────────────────────────────────────────────── */
function duplicateExercise(id) {
  const e = DATA.exercises.find(x => x.id === id);
  if (!e) return;
  const copy = JSON.parse(JSON.stringify(e));
  copy.id    = uid();
  copy.title = 'نسخة من: ' + copy.title;
  copy.isFavorite = false;
  DATA.exercises.push(copy);
  save(); toast('تم نسخ التمرين', 'success'); renderExercises();
}

/* ═══════════════════════════════════════════════════════════════
   طباعة تمرين واحد
   withSolution: true = مع الحل، false = للتلاميذ بدون حل
═══════════════════════════════════════════════════════════════ */
function printExercise(id, withSolution) {
  const e    = DATA.exercises.find(x => x.id === id);
  if (!e) return;
  const cls  = CLASSES.find(c => c.id===e.cls)?.label   || e.cls;
  const subj = SUBJECTS.find(s => s.id===e.subj)?.label || e.subj;
  const parts = e.parts || [];
  const typeInfo = EXERCISE_TYPES.find(t => t.id===e.type) || EXERCISE_TYPES[0];

  _openPrintWindow([e], cls, subj, withSolution, false);
}

/* ═══════════════════════════════════════════════════════════════
   طباعة ورقة عمل جماعية من تمارين مختارة
═══════════════════════════════════════════════════════════════ */
function openWorksheetPrint() {
  const ids = Object.keys(exerSelected).filter(id => exerSelected[id]);
  if (!ids.length) {
    toast('اختر تمارين أولاً (الخانة ☐ يسار كل تمرين)', 'error');
    return;
  }
  const cls  = CLASSES.find(c => c.id===filExer.cls)?.label   || filExer.cls;
  const subj = SUBJECTS.find(s => s.id===filExer.subj)?.label || filExer.subj;
  const items = ids.map(id => DATA.exercises.find(e => e.id===id)).filter(Boolean);
  _openPrintWindow(items, cls, subj, false, true);
}

/* ── دالة الطباعة المشتركة ───────────────────────────────────── */
function _openPrintWindow(items, cls, subj, withSolution, isWorksheet) {
  const win = window.open('', '_blank');
  const date = new Date().toLocaleDateString('ar-MA', { day:'2-digit', month:'long', year:'numeric' });

  const exHtml = items.map((e, ei) => {
    const parts = e.parts || [];
    const typeInfo = EXERCISE_TYPES.find(t => t.id===e.type) || EXERCISE_TYPES[0];
    return `
      <div class="exercise" style="${ei>0?'margin-top:24px;padding-top:20px;border-top:2px dashed #ccc':''}">
        <div class="ex-header">
          <span class="ex-num">التمرين ${isWorksheet ? ei+1 : ''}</span>
          <span class="ex-title">${esc(e.title)}</span>
          <span class="ex-meta">
            ${e.level ? `[${e.level}]` : ''}
            ${e.duration ? `· ${e.duration} دقيقة` : ''}
          </span>
        </div>
        ${e.content ? `<p class="ex-content">${esc(e.content)}</p>` : ''}
        ${parts.length
          ? parts.map((p,pi) => `
            <div class="part">
              <div class="part-label">${p.label || _partLabel(pi)}) ${esc(p.text||'')}</div>
              ${withSolution && p.solution ? `<div class="sol">✓ ${esc(p.solution)}</div>` : ''}
              ${withSolution && p.hint ? `<div class="hint">💡 ${esc(p.hint)}</div>` : ''}
              ${!withSolution ? '<div class="answer-line"></div><div class="answer-line"></div>' : ''}
            </div>`).join('')
          : (!withSolution ? '<div class="answer-line"></div><div class="answer-line"></div><div class="answer-line"></div>' : '')}
        ${withSolution && e.solution && !parts.length ? `
          <div class="sol full-sol">✓ الحل: ${esc(e.solution)}</div>` : ''}
      </div>`;
  }).join('');

  win.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${isWorksheet ? 'ورقة عمل' : 'تمرين'} — ${subj} — ${cls}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#111;direction:rtl;
         padding:24px;font-size:13px;line-height:1.8}
    .page-header{display:flex;justify-content:space-between;align-items:center;
                 margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #111}
    .school-info{font-size:12px;color:#555}
    .exam-info{text-align:center}
    .exam-info h2{font-size:15px;margin-bottom:2px}
    .student-box{border:1px solid #ccc;padding:4px 16px;font-size:12px;
                 border-radius:4px;min-width:200px;text-align:center}
    .exercise{page-break-inside:avoid}
    .ex-header{display:flex;align-items:baseline;gap:8px;margin-bottom:8px}
    .ex-num{font-size:13px;font-weight:800;color:#3B4FC0;min-width:80px}
    .ex-title{font-size:14px;font-weight:700;flex:1}
    .ex-meta{font-size:11px;color:#888}
    .ex-content{margin-bottom:10px;font-size:13px;padding:6px 12px;
                background:#f8f8f8;border-right:3px solid #3B4FC0;border-radius:3px}
    .part{margin-bottom:10px;padding-right:12px}
    .part-label{font-weight:600;font-size:13px;margin-bottom:4px}
    .answer-line{height:24px;border-bottom:1px solid #ccc;margin-bottom:4px}
    .sol{background:#dcfce7;padding:6px 10px;border-radius:4px;
         font-size:12px;color:#14532d;margin-top:4px}
    .hint{background:#fef9c3;padding:5px 10px;border-radius:4px;
          font-size:12px;color:#92400e;margin-top:4px}
    .full-sol{margin-top:8px;white-space:pre-wrap}
    @media print{body{padding:8px}}
  </style>
</head>
<body>
  <div class="page-header">
    <div class="school-info">
      <div>${cls} — ${subj}</div>
      <div>${date}</div>
    </div>
    <div class="exam-info">
      <h2>${isWorksheet ? 'ورقة عمل' : esc(items[0]?.title || 'تمرين')}</h2>
      ${withSolution ? '<small style="color:red">[ نسخة الأستاذ — مع الحل ]</small>' : ''}
    </div>
    <div class="student-box">الاسم: _______________<br>النقطة: ___/20</div>
  </div>
  ${exHtml}
  <script>window.print();<\/script>
</body>
</html>`);
  win.document.close();
}

/* ═══════════════════════════════════════════════════════════════
   تصدير CSV
═══════════════════════════════════════════════════════════════ */
function exportExercisesCSV() {
  const cls  = filExer.cls;
  const subj = filExer.subj;
  const clsLb = CLASSES.find(c => c.id===cls)?.label   || cls;
  const sbLb  = SUBJECTS.find(s => s.id===subj)?.label || subj;
  const items = DATA.exercises.filter(e => e.cls===cls && e.subj===subj);
  if (!items.length) { toast('لا توجد تمارين لتصديرها', 'error'); return; }

  const q = v => `"${String(v??'').replace(/"/g,'""')}"`;
  const header = ['العنوان','النوع','المستوى','الوحدة','وقت الإنجاز',
                  'الأجزاء','له حل','مفضلة','التاريخ','Tags'];
  const rows = items.map(e => {
    const typeInfo = EXERCISE_TYPES.find(t => t.id===e.type);
    return [
      e.title,
      typeInfo?.label || e.type || '',
      e.level || '',
      e.unit  || '',
      e.duration || '',
      (e.parts||[]).length,
      (e.solution||(e.parts||[]).some(p=>p.solution)) ? 'نعم' : 'لا',
      e.isFavorite ? '⭐' : '',
      e.date || '',
      (e.tags||[]).join('، ')
    ].map(q).join(',');
  });

  const csv  = '\uFEFF' + [header.map(q).join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), {
    href: url,
    download: `تمارين_${clsLb}_${sbLb}_${today()}.csv`
  }).click();
  URL.revokeObjectURL(url);
  toast('تم تصدير الملف', 'success');
}
