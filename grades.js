/* =================================================================
   GRADES (النقاط والأداء) — النسخة المطوّرة v2
   متوافق 100% مع بنية المشروع (helpers.js / data.js / style.css)
   ─────────────────────────────────────────────────────────────────
   مميزات جديدة:
   ✅ إحصائيات متقدمة: معدل، وسيط، أعلى/أدنى، نسبة النجاح
   ✅ ثلاثة أوضاع عرض: التلاميذ · القائمة · الإحصاء
   ✅ ترتيب التلاميذ بالميداليات + شريط تقدم + مؤشر اتجاه ↑↓→
   ✅ بحث وفلاتر سريعة (نوع، نتيجة) + تجميع حسب نوع التقييم
   ✅ معاينة فورية /20 لحظة إدخال النقطة
   ✅ إدخال جماعي لكل التلاميذ دفعة واحدة
   ✅ تصدير CSV
   ✅ طباعة تقرير منسق
   ✅ مخطط توزيع النقاط (CSS فقط، بدون مكتبات)
================================================================= */

/* ── حالة محلية ──────────────────────────────────────────────── */
let gradesView   = 'students';      // 'students' | 'list' | 'stats'
let gradesSearch = '';
let gradesTypeF  = '';
let gradesResF   = '';              // '' | 'pass' | 'fail'

/* ═══════════════════════════════════════════════════════════════
   renderGrades — دالة العرض الرئيسية
═══════════════════════════════════════════════════════════════ */
function renderGrades() {
  const cls       = filGrade.cls;
  const subj      = filGrade.subj;
  const students  = studentsOf(cls);
  const allGrades = DATA.grades.filter(g => g.cls === cls && g.subj === subj);
  const validG    = allGrades.filter(g => g.max > 0);
  const stats     = _gradeStats(validG);
  const sec       = document.getElementById('sec-grades');

  sec.innerHTML = `
    ${classTabsHtml(cls, 'setGradeCls')}
    ${subjPillsHtml(subj, 'setGradeSubj')}

    <!-- شريط الأدوات -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <button class="btn btn-accent" onclick="openGradeForm()">
        ${IC.plus} نقطة جديدة
      </button>
      <button class="btn btn-outline" onclick="openBulkGradeForm()"
        title="تسجيل نقاط كل التلاميذ دفعة واحدة">
        ⊞ إدخال جماعي
      </button>
      <button class="btn btn-outline" onclick="exportGradesCSV()"
        title="تصدير إلى CSV">
        ${IC.download} CSV
      </button>
      <button class="btn btn-outline" onclick="printGradesReport()"
        title="طباعة تقرير">
        ${IC.file} طباعة
      </button>
      <div style="flex:1"></div>
      <div style="display:flex;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">
        ${['students','list','stats'].map(v => `
          <button onclick="switchGradesView('${v}')"
            style="padding:6px 13px;font-size:12px;font-weight:600;border:none;cursor:pointer;
              background:${gradesView===v?'var(--accent)':'var(--surface)'};
              color:${gradesView===v?'#fff':'var(--text-2)'};
              transition:background .15s">
            ${v==='students'?'التلاميذ':v==='list'?'القائمة':'الإحصاء'}
          </button>`).join('')}
      </div>
    </div>

    <!-- بطاقات الإحصاء السريع -->
    <div class="stat-grid" style="margin-bottom:12px">
      <div class="stat-card">
        <div class="s-label">النقاط المسجلة</div>
        <div class="s-val">${allGrades.length}</div>
      </div>
      <div class="stat-card">
        <div class="s-label">معدل الفصل</div>
        <div class="s-val" style="color:${
          stats.avg != null
            ? (stats.avg >= 10 ? 'var(--green)' : 'var(--danger)')
            : 'var(--text-3)'}">
          ${stats.avg != null ? stats.avg.toFixed(2) + '/20' : '—'}
        </div>
      </div>
      <div class="stat-card">
        <div class="s-label">نسبة النجاح</div>
        <div class="s-val" style="color:${stats.passRate != null && stats.passRate >= 50 ? 'var(--green)' : 'var(--danger)'}">
          ${stats.passRate != null ? stats.passRate + '%' : '—'}
        </div>
      </div>
      <div class="stat-card">
        <div class="s-label">أعلى / أدنى</div>
        <div class="s-val" style="font-size:13px">
          ${stats.max != null ? stats.max.toFixed(1) : '—'} / ${stats.min != null ? stats.min.toFixed(1) : '—'}
        </div>
      </div>
    </div>

    <!-- المحتوى الرئيسي حسب وضع العرض -->
    ${gradesView === 'students'
      ? _renderStudentsView(cls, subj, students, allGrades, stats)
      : gradesView === 'list'
      ? _renderListView(allGrades)
      : _renderStatsView(allGrades, validG, stats)}
  `;
}

/* ── تبديل وضع العرض ─────────────────────────────────────────── */
function switchGradesView(v) {
  gradesView = v;
  gradesSearch = '';
  gradesTypeF  = '';
  gradesResF   = '';
  renderGrades();
}

function setGradeCls(cls)   { filGrade.cls  = cls;  gradesView='students'; renderGrades(); }
function setGradeSubj(subj) { filGrade.subj = subj; gradesView='students'; renderGrades(); }

/* ═══════════════════════════════════════════════════════════════
   حساب الإحصاء
═══════════════════════════════════════════════════════════════ */
function _gradeStats(validG) {
  if (!validG.length)
    return { avg: null, median: null, min: null, max: null, passRate: null, scores: [] };

  const scores = validG.map(g => (g.score / g.max) * 20).sort((a, b) => a - b);
  const sum    = scores.reduce((a, b) => a + b, 0);
  const mid    = Math.floor(scores.length / 2);
  const median = scores.length % 2 === 0
    ? (scores[mid - 1] + scores[mid]) / 2
    : scores[mid];
  const pass = scores.filter(s => s >= 10).length;

  return {
    avg:      sum / scores.length,
    median,
    min:      scores[0],
    max:      scores[scores.length - 1],
    passRate: Math.round(pass / scores.length * 100),
    scores
  };
}

/* إحصاء تلميذ واحد (مع مؤشر الاتجاه) */
function _studentStats(sid, cls, subj) {
  const sg = DATA.grades.filter(g => g.sid === sid && g.cls === cls && g.subj === subj && g.max > 0);
  if (!sg.length) return { avg: null, trend: null, count: 0 };
  const sorted = sg.slice().sort((a, b) => ((a.date || '') > (b.date || '') ? 1 : -1));
  const scores = sorted.map(g => (g.score / g.max) * 20);
  const avg    = scores.reduce((a, b) => a + b, 0) / scores.length;
  let trend = null;
  if (scores.length >= 2) {
    const diff = scores[scores.length - 1] - scores[scores.length - 2];
    trend = diff > 0.5 ? 'up' : diff < -0.5 ? 'down' : 'stable';
  }
  return { avg, trend, count: sg.length };
}

/* ═══════════════════════════════════════════════════════════════
   وضع التلاميذ — ترتيب + ميداليات + شريط تقدم + مؤشر اتجاه
═══════════════════════════════════════════════════════════════ */
function _renderStudentsView(cls, subj, students, allGrades, classStats) {
  if (!students.length)
    return `<div class="panel">${emptyHtml('لا يوجد تلاميذ', 'أضف تلاميذ أولاً في قسم التلاميذ')}</div>`;

  const subjLabel = subjById(subj).label;

  const ranked = students.map(st => {
    const sg = _studentStats(st.id, cls, subj);
    return { ...st, ...sg };
  }).sort((a, b) => {
    if (a.avg == null && b.avg == null) return 0;
    if (a.avg == null) return 1;
    if (b.avg == null) return -1;
    return b.avg - a.avg;
  });

  const medal = r => r === 0 ? '🥇' : r === 1 ? '🥈' : r === 2 ? '🥉' : `<span style="font-size:13px;color:var(--text-3);font-weight:700">${r + 1}</span>`;
  const trendIcon = t =>
    t === 'up'     ? `<span style="color:var(--green);font-size:13px;font-weight:700" title="في تحسن">↑</span>` :
    t === 'down'   ? `<span style="color:var(--danger);font-size:13px;font-weight:700" title="في تراجع">↓</span>` :
    t === 'stable' ? `<span style="color:var(--text-3);font-size:12px">→</span>` : '';

  return `
    <div class="panel">
      <div class="panel-title">ترتيب التلاميذ — ${esc(subjLabel)}</div>
      ${ranked.map((st, rank) => {
        const barW = st.avg != null ? Math.round(st.avg / 20 * 100) : 0;
        const col  = st.avg != null ? (st.avg >= 10 ? 'var(--green)' : 'var(--danger)') : 'var(--text-3)';
        return `
          <div class="card-item"
            onclick="navigate('student-detail','${st.id}');setTimeout(()=>setDetailTab('grades','${st.id}'),60)">
            <div style="min-width:28px;text-align:center;font-size:20px">${medal(rank)}</div>
            <div class="card-item-icon"
              style="background:${classBg(st.cls)};color:${classColor(st.cls)};font-size:17px;font-weight:800">
              ${esc(st.name.charAt(0))}
            </div>
            <div class="card-item-body" style="flex:1;min-width:0">
              <div class="card-item-title">${esc(st.name)}</div>
              <div style="margin:4px 0 2px;height:5px;background:var(--bg-2);border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${barW}%;background:${col};border-radius:4px;transition:width .4s"></div>
              </div>
              <div class="card-item-sub">${st.count} نقطة مسجلة</div>
            </div>
            <div style="text-align:center;min-width:52px">
              <div style="font-size:20px;font-weight:800;font-family:var(--mono);color:${col}">
                ${st.avg != null ? st.avg.toFixed(1) : '—'}
              </div>
              <div style="font-size:10px;color:var(--text-3)">/20 ${trendIcon(st.trend)}</div>
            </div>
            <span style="color:var(--text-3)">${IC.chev}</span>
          </div>`;
      }).join('')}
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════
   وضع القائمة — بحث + فلاتر + تجميع حسب النوع
═══════════════════════════════════════════════════════════════ */
function _renderListView(allGrades) {
  const typeOpts = ['', ...GRADE_TYPES].map(t =>
    `<option value="${t}" ${gradesTypeF === t ? 'selected' : ''}>${t || 'كل الأنواع'}</option>`
  ).join('');

  /* تطبيق الفلاتر */
  let filtered = allGrades.slice();
  if (gradesSearch) {
    const q = gradesSearch.toLowerCase();
    filtered = filtered.filter(g => {
      const st = DATA.students.find(x => x.id === g.sid);
      return (g.title || '').toLowerCase().includes(q) ||
             (st ? st.name.toLowerCase().includes(q) : false);
    });
  }
  if (gradesTypeF)            filtered = filtered.filter(g => g.type === gradesTypeF);
  if (gradesResF === 'pass')  filtered = filtered.filter(g => g.max > 0 && g.score / g.max >= 0.5);
  if (gradesResF === 'fail')  filtered = filtered.filter(g => g.max > 0 && g.score / g.max < 0.5);

  /* تجميع حسب النوع */
  const byType = {};
  filtered.forEach(g => {
    const k = g.type || 'غير محدد';
    if (!byType[k]) byType[k] = [];
    byType[k].push(g);
  });

  const hasFilter = gradesSearch || gradesTypeF || gradesResF;

  return `
    <!-- شريط البحث والفلاتر -->
    <div class="panel" style="margin-bottom:8px;padding:10px 14px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <div style="flex:1;min-width:160px;position:relative">
          <span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);
            pointer-events:none;color:var(--text-3)">${IC.search}</span>
          <input class="field" style="padding-right:34px"
            placeholder="بحث باسم التلميذ أو العنوان…"
            value="${esc(gradesSearch)}"
            oninput="gradesSearch=this.value;renderGrades()">
        </div>
        <select class="field" style="width:150px"
          onchange="gradesTypeF=this.value;renderGrades()">${typeOpts}</select>
        <select class="field" style="width:120px"
          onchange="gradesResF=this.value;renderGrades()">
          <option value="" ${gradesResF===''?'selected':''}>كل النتائج</option>
          <option value="pass" ${gradesResF==='pass'?'selected':''}>ناجح فقط ✓</option>
          <option value="fail" ${gradesResF==='fail'?'selected':''}>راسب فقط ✗</option>
        </select>
        ${hasFilter ? `<button class="btn btn-outline" style="font-size:12px"
          onclick="gradesSearch='';gradesTypeF='';gradesResF='';renderGrades()">✕ مسح</button>` : ''}
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-top:6px">
        ${filtered.length} نتيجة${filtered.length < allGrades.length ? ` من أصل ${allGrades.length}` : ''}
      </div>
    </div>

    ${!filtered.length
      ? `<div class="panel">${emptyHtml('لا توجد نتائج', 'جرب تغيير معايير البحث')}</div>`
      : Object.entries(byType)
          .sort((a, b) => b[1].length - a[1].length)
          .map(([type, grades]) => `
            <div class="panel" style="margin-bottom:10px">
              <div class="panel-title">${esc(type)}
                <span style="font-size:11px;color:var(--text-3);font-weight:400">— ${grades.length} نقطة</span>
              </div>
              ${grades
                .slice().sort((a, b) => ((b.date || '') > (a.date || '') ? 1 : -1))
                .map(g => {
                  const st  = DATA.students.find(x => x.id === g.sid);
                  const pct = g.max > 0 ? g.score / g.max : 0;
                  const sc  = pct >= 0.7 ? 'pass' : pct >= 0.5 ? 'avg' : 'fail';
                  const v20 = (pct * 20).toFixed(1);
                  return `
                    <div class="grade-item">
                      <div class="grade-score ${sc}">
                        ${g.score}<span style="font-size:10px;opacity:.5">/${g.max}</span>
                      </div>
                      <div style="flex:1;min-width:0">
                        <div style="font-size:13px;font-weight:600">${esc(g.title || g.type || 'نقطة')}</div>
                        <div style="font-size:11px;color:var(--text-3)">
                          ${esc(st ? st.name : '—')} · ${fdate(g.date)}
                        </div>
                      </div>
                      <div style="text-align:center;min-width:44px">
                        <div style="font-size:14px;font-weight:800;font-family:var(--mono);
                          color:${pct >= 0.5 ? 'var(--green)' : 'var(--danger)'}">
                          ${v20}
                        </div>
                        <div style="font-size:9px;color:var(--text-3)">/20</div>
                      </div>
                      ${adminBtns(`openGradeForm('${g.id}')`, `deleteGrade('${g.id}')`)}
                    </div>`;
                }).join('')}
            </div>`
          ).join('')
    }`;
}

/* ═══════════════════════════════════════════════════════════════
   وضع الإحصاء — توزيع + ملخص + تحليل حسب النوع
═══════════════════════════════════════════════════════════════ */
function _renderStatsView(allGrades, validG, stats) {
  if (!validG.length)
    return `<div class="panel">${emptyHtml('لا توجد نقاط كافية', 'أضف نقاط لعرض الإحصاءات')}</div>`;

  /* ── فئات التوزيع ── */
  const ranges = [
    { label: '18–20', min: 18, max: 20.01, color: '#22c55e' },
    { label: '16–18', min: 16, max: 18,    color: '#86efac' },
    { label: '14–16', min: 14, max: 16,    color: '#bef264' },
    { label: '12–14', min: 12, max: 14,    color: '#facc15' },
    { label: '10–12', min: 10, max: 12,    color: '#fb923c' },
    { label: '08–10', min:  8, max: 10,    color: '#f87171' },
    { label: '0–8',   min:  0, max:  8,    color: '#ef4444' },
  ];
  const sc20     = stats.scores;
  const maxCount = Math.max(...ranges.map(r => sc20.filter(s => s >= r.min && s < r.max).length), 1);

  /* ── معدل حسب نوع التقييم ── */
  const byType = {};
  validG.forEach(g => {
    const k = g.type || 'غير محدد';
    if (!byType[k]) byType[k] = { sum: 0, count: 0 };
    byType[k].sum   += (g.score / g.max) * 20;
    byType[k].count += 1;
  });

  return `
    <!-- مخطط التوزيع -->
    <div class="panel" style="margin-bottom:10px">
      <div class="panel-title">توزيع النقاط</div>
      <div style="display:flex;align-items:flex-end;gap:5px;height:100px;padding:4px 0">
        ${ranges.map(r => {
          const cnt = sc20.filter(s => s >= r.min && s < r.max).length;
          const h   = Math.round(cnt / maxCount * 88);
          return `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">
              <div style="font-size:10px;font-weight:700;color:var(--text-2);min-height:14px">
                ${cnt || ''}
              </div>
              <div style="width:100%;height:${h}px;min-height:${cnt ? 3 : 0}px;
                background:${r.color};border-radius:4px 4px 0 0;transition:height .4s"></div>
              <div style="font-size:9px;color:var(--text-3);text-align:center;line-height:1.2">
                ${r.label}
              </div>
            </div>`;
        }).join('')}
      </div>
      <div style="margin-top:8px;display:flex;gap:16px;font-size:11px;color:var(--text-3)">
        <span>✓ ناجح (≥10): <b style="color:var(--green)">${sc20.filter(s=>s>=10).length}</b></span>
        <span>✗ راسب (&lt;10): <b style="color:var(--danger)">${sc20.filter(s=>s<10).length}</b></span>
      </div>
    </div>

    <!-- ملخص إحصائي -->
    <div class="panel" style="margin-bottom:10px">
      <div class="panel-title">ملخص إحصائي</div>
      ${[
        ['المعدل العام',   stats.avg    != null ? stats.avg.toFixed(2)    + '/20' : '—'],
        ['الوسيط',         stats.median != null ? stats.median.toFixed(2) + '/20' : '—'],
        ['أعلى نقطة',      stats.max    != null ? stats.max.toFixed(2)    + '/20' : '—'],
        ['أدنى نقطة',      stats.min    != null ? stats.min.toFixed(2)    + '/20' : '—'],
        ['نسبة النجاح',    stats.passRate != null ? stats.passRate + '%'          : '—'],
        ['عدد التقييمات',  validG.length],
        ['عدد التلاميذ',   new Set(validG.map(g=>g.sid)).size],
      ].map(([label, val]) => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;
          border-bottom:1px solid var(--border)">
          <span style="color:var(--text-2);font-size:13px">${label}</span>
          <span style="font-weight:700;font-family:var(--mono)">${val}</span>
        </div>`).join('')}
    </div>

    <!-- معدل حسب نوع التقييم -->
    ${Object.keys(byType).length > 0 ? `
    <div class="panel">
      <div class="panel-title">المعدل حسب نوع التقييم</div>
      ${Object.entries(byType)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([type, d]) => {
            const avg  = d.sum / d.count;
            const barW = Math.round(avg / 20 * 100);
            const col  = avg >= 10 ? 'var(--green)' : 'var(--danger)';
            return `
              <div style="padding:10px 0;border-bottom:1px solid var(--border)">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                  <span style="font-size:13px;font-weight:600">${esc(type)}</span>
                  <span style="font-family:var(--mono);font-weight:700;color:${col}">
                    ${avg.toFixed(2)}/20
                    <span style="color:var(--text-3);font-weight:400;font-size:11px">(${d.count})</span>
                  </span>
                </div>
                <div style="height:6px;background:var(--bg-2);border-radius:4px;overflow:hidden">
                  <div style="height:100%;width:${barW}%;background:${col};border-radius:4px"></div>
                </div>
              </div>`;
          }).join('')}
    </div>` : ''}`;
}

/* ═══════════════════════════════════════════════════════════════
   نموذج إضافة / تعديل نقطة
   (مع معاينة /20 فورية)
═══════════════════════════════════════════════════════════════ */
function openGradeForm(id) {
  const g    = id ? DATA.grades.find(x => x.id === id) : {};
  const cls  = g.cls  || filGrade.cls;
  const subj = g.subj || filGrade.subj;

  const clsOpts  = CLASSES.map(c =>
    `<option value="${c.id}" ${cls === c.id ? 'selected' : ''}>${c.label}</option>`).join('');
  const subjOpts = SUBJECTS.map(s =>
    `<option value="${s.id}" ${subj === s.id ? 'selected' : ''}>${s.label}</option>`).join('');
  const studOpts = studentsOf(cls).map(s =>
    `<option value="${s.id}" ${(g.sid || '') === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
  const typeOpts = GRADE_TYPES.map(t =>
    `<option value="${t}" ${(g.type || GRADE_TYPES[0]) === t ? 'selected' : ''}>${t}</option>`).join('');

  showSheet(id ? 'تعديل نقطة' : 'تسجيل نقطة جديدة', `
    <div class="field-grid-2">
      <div class="field-row">
        <label>القسم <span class="req">*</span></label>
        <select class="field" id="gf-cls" onchange="reloadGradeStudents(this.value)">${clsOpts}</select>
      </div>
      <div class="field-row">
        <label>المادة <span class="req">*</span></label>
        <select class="field" id="gf-subj">${subjOpts}</select>
      </div>
    </div>
    <div class="field-row">
      <label>التلميذ <span class="req">*</span></label>
      <select class="field" id="gf-sid">
        ${studOpts || '<option value="">— لا يوجد تلاميذ في هذا القسم —</option>'}
      </select>
    </div>
    <div class="field-row">
      <label>نوع التقييم</label>
      <select class="field" id="gf-type">${typeOpts}</select>
    </div>
    <div class="field-row">
      <label>عنوان / وصف</label>
      <input class="field" id="gf-title"
        placeholder="مثال: فرض الفصل الأول" value="${esc(g.title || '')}">
    </div>
    <div class="field-grid-2">
      <div class="field-row">
        <label>النقطة <span class="req">*</span></label>
        <input class="field" type="number" id="gf-score"
          min="0" step="0.25" placeholder="0"
          value="${g.score != null ? g.score : ''}"
          oninput="_updateGradePreview()">
      </div>
      <div class="field-row">
        <label>من (العلامة القصوى)</label>
        <input class="field" type="number" id="gf-max"
          min="1" step="1" value="${g.max || 20}"
          oninput="_updateGradePreview()">
      </div>
    </div>
    <!-- معاينة /20 فورية -->
    <div id="gf-preview"
      style="text-align:center;padding:10px;background:var(--bg-2);border-radius:var(--radius-lg);
        font-family:var(--mono);font-size:22px;font-weight:800;color:var(--text-3);margin-bottom:4px">
      —/20
    </div>
    <div class="field-row">
      <label>التاريخ</label>
      <input class="field" type="date" id="gf-date" value="${g.date || today()}">
    </div>
    <div class="field-row">
      <label>ملاحظة (اختياري)</label>
      <input class="field" id="gf-note"
        placeholder="ملاحظة حول هذه النقطة" value="${esc(g.note || '')}">
    </div>
    <input type="hidden" id="gf-id" value="${id || ''}">
  `, [
    { label: 'إلغاء', cls: 'btn-outline', fn: 'closeSheet()' },
    { label: 'حفظ',   cls: 'btn-accent',  fn: 'saveGrade()' }
  ]);

  /* تشغيل المعاينة بعد رسم النموذج */
  setTimeout(_updateGradePreview, 40);
}

function _updateGradePreview() {
  const sc = parseFloat(document.getElementById('gf-score')?.value);
  const mx = parseFloat(document.getElementById('gf-max')?.value)  || 20;
  const el = document.getElementById('gf-preview');
  if (!el) return;
  if (isNaN(sc) || sc < 0) { el.textContent = '—/20'; el.style.color = 'var(--text-3)'; return; }
  const v20 = (sc / mx * 20).toFixed(2);
  el.textContent  = v20 + '/20';
  el.style.color  = sc / mx >= 0.5 ? 'var(--green)' : 'var(--danger)';
}

/* تحديث قائمة التلاميذ عند تغيير القسم */
function reloadGradeStudents(cls) {
  const sel = document.getElementById('gf-sid');
  if (!sel) return;
  const opts = studentsOf(cls).map(s =>
    `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  sel.innerHTML = opts || '<option value="">— لا يوجد تلاميذ —</option>';
}

/* ─── حفظ نقطة ───────────────────────────────────────────────── */
function saveGrade() {
  const id       = document.getElementById('gf-id').value;
  const sid      = document.getElementById('gf-sid').value;
  const scoreRaw = document.getElementById('gf-score').value;
  const max      = parseFloat(document.getElementById('gf-max').value) || 20;
  const score    = parseFloat(scoreRaw);

  if (!sid)                                        { toast('اختر التلميذ', 'error'); return; }
  if (scoreRaw === '' || isNaN(score) || score < 0) { toast('أدخل نقطة صحيحة (رقم ≥ 0)', 'error'); return; }
  if (score > max)                                  { toast(`النقطة (${score}) تتجاوز العلامة القصوى (${max})`, 'error'); return; }

  const cls = document.getElementById('gf-cls').value;
  const obj = {
    sid, cls,
    subj:  document.getElementById('gf-subj').value,
    type:  document.getElementById('gf-type').value,
    title: document.getElementById('gf-title').value.trim(),
    score, max,
    date:  document.getElementById('gf-date').value,
    note:  document.getElementById('gf-note').value.trim()
  };

  if (id) { Object.assign(DATA.grades.find(x => x.id === id), obj); }
  else    { DATA.grades.push({ id: uid(), ...obj }); }

  save(); closeSheet(); toast('تم الحفظ', 'success'); renderGrades();
}

/* ─── حذف نقطة ───────────────────────────────────────────────── */
function deleteGrade(id) {
  if (!confirm('سيتم حذف هذه النقطة نهائياً. هل تؤكد؟')) return;
  DATA.grades = DATA.grades.filter(g => g.id !== id);
  save(); toast('تم الحذف'); renderGrades();
}

/* ═══════════════════════════════════════════════════════════════
   إدخال جماعي — تسجيل نقاط كل التلاميذ دفعة واحدة
═══════════════════════════════════════════════════════════════ */
function openBulkGradeForm() {
  const cls      = filGrade.cls;
  const subj     = filGrade.subj;
  const students = studentsOf(cls);

  if (!students.length) { toast('لا يوجد تلاميذ في هذا القسم', 'error'); return; }

  const typeOpts = GRADE_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');

  showSheet('إدخال جماعي للنقاط', `
    <div class="field-grid-2">
      <div class="field-row">
        <label>نوع التقييم</label>
        <select class="field" id="bf-type">${typeOpts}</select>
      </div>
      <div class="field-row">
        <label>العلامة القصوى</label>
        <input class="field" type="number" id="bf-max" value="20" min="1" step="1"
          oninput="_updateAllBulkPreviews()">
      </div>
    </div>
    <div class="field-row">
      <label>العنوان</label>
      <input class="field" id="bf-title" placeholder="مثال: فرض كتابي رقم 2">
    </div>
    <div class="field-row">
      <label>التاريخ</label>
      <input class="field" type="date" id="bf-date" value="${today()}">
    </div>
    <!-- جدول الإدخال -->
    <div style="margin-top:10px;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">
      <div style="display:flex;padding:8px 12px;background:var(--bg-2);
        font-size:11px;font-weight:700;color:var(--text-3);gap:8px">
        <div style="flex:1">الاسم</div>
        <div style="width:90px;text-align:center">النقطة</div>
        <div style="width:54px;text-align:center">/20</div>
      </div>
      <div style="max-height:280px;overflow-y:auto">
        ${students.map(st => `
          <div style="display:flex;align-items:center;gap:8px;padding:7px 12px;
            border-top:1px solid var(--border)">
            <div style="flex:1;font-size:13px;font-weight:600">${esc(st.name)}</div>
            <input class="field bulk-score" data-sid="${st.id}"
              type="number" min="0" step="0.25" placeholder="—"
              style="width:90px;text-align:center"
              oninput="_updateBulkPreview('${st.id}',this.value)">
            <div id="bp-${st.id}"
              style="width:54px;text-align:center;font-size:12px;
                font-family:var(--mono);font-weight:700;color:var(--text-3)">
              —/20
            </div>
          </div>`).join('')}
      </div>
    </div>
    <div style="margin-top:8px;font-size:11px;color:var(--text-3)">
      💡 اترك الخانة فارغة للتلاميذ الغائبين — لن تُسجَّل نقطتهم
    </div>
  `, [
    { label: 'إلغاء',    cls: 'btn-outline', fn: 'closeSheet()' },
    { label: 'حفظ الكل', cls: 'btn-accent',  fn: 'saveBulkGrades()' }
  ]);
}

function _updateBulkPreview(sid, val) {
  const max = parseFloat(document.getElementById('bf-max')?.value) || 20;
  const el  = document.getElementById(`bp-${sid}`);
  if (!el) return;
  const score = parseFloat(val);
  if (isNaN(score) || val === '') {
    el.textContent = '—/20'; el.style.color = 'var(--text-3)'; return;
  }
  el.textContent = (score / max * 20).toFixed(1) + '/20';
  el.style.color = score / max >= 0.5 ? 'var(--green)' : 'var(--danger)';
}

function _updateAllBulkPreviews() {
  document.querySelectorAll('.bulk-score').forEach(inp =>
    _updateBulkPreview(inp.dataset.sid, inp.value));
}

function saveBulkGrades() {
  const max   = parseFloat(document.getElementById('bf-max')?.value)  || 20;
  const type  = document.getElementById('bf-type')?.value  || '';
  const title = document.getElementById('bf-title')?.value.trim() || '';
  const date  = document.getElementById('bf-date')?.value  || today();
  const cls   = filGrade.cls;
  const subj  = filGrade.subj;
  let added   = 0;

  document.querySelectorAll('.bulk-score').forEach(inp => {
    const val = inp.value;
    if (val === '' || val == null) return;
    const score = parseFloat(val);
    if (isNaN(score) || score < 0 || score > max) return;
    DATA.grades.push({ id: uid(), sid: inp.dataset.sid, cls, subj, type, title, score, max, date, note: '' });
    added++;
  });

  if (!added) { toast('لم يتم إدخال أي نقطة', 'error'); return; }
  save(); closeSheet(); toast(`تم تسجيل ${added} نقطة بنجاح`, 'success'); renderGrades();
}

/* ═══════════════════════════════════════════════════════════════
   تصدير CSV
═══════════════════════════════════════════════════════════════ */
function exportGradesCSV() {
  const cls   = filGrade.cls;
  const subj  = filGrade.subj;
  const clsLb = CLASSES.find(c => c.id === cls)?.label   || cls;
  const sbLb  = SUBJECTS.find(s => s.id === subj)?.label || subj;
  const grades = DATA.grades.filter(g => g.cls === cls && g.subj === subj);

  if (!grades.length) { toast('لا توجد نقاط لتصديرها', 'error'); return; }

  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const header = ['الاسم', 'القسم', 'المادة', 'نوع التقييم', 'العنوان',
                  'النقطة', 'من', '/20', 'النتيجة', 'التاريخ', 'ملاحظة'];

  const rows = grades
    .slice().sort((a, b) => ((b.date || '') > (a.date || '') ? 1 : -1))
    .map(g => {
      const st    = DATA.students.find(x => x.id === g.sid);
      const v20   = g.max > 0 ? (g.score / g.max * 20).toFixed(2) : '';
      const res   = g.max > 0 ? (g.score / g.max >= 0.5 ? 'ناجح' : 'راسب') : '';
      return [
        st?.name || '', clsLb, sbLb, g.type || '', g.title || '',
        g.score, g.max, v20, res, g.date || '', g.note || ''
      ].map(q).join(',');
    });

  const csv  = '\uFEFF' + [header.map(q).join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `نقاط_${clsLb}_${sbLb}_${today()}.csv`
  });
  a.click();
  URL.revokeObjectURL(url);
  toast('تم تصدير الملف', 'success');
}

/* ═══════════════════════════════════════════════════════════════
   طباعة تقرير
═══════════════════════════════════════════════════════════════ */
function printGradesReport() {
  const cls     = filGrade.cls;
  const subj    = filGrade.subj;
  const clsLb   = CLASSES.find(c => c.id === cls)?.label   || cls;
  const sbLb    = SUBJECTS.find(s => s.id === subj)?.label || subj;
  const students = studentsOf(cls);
  const allGrades = DATA.grades.filter(g => g.cls === cls && g.subj === subj);
  const validG    = allGrades.filter(g => g.max > 0);
  const stats     = _gradeStats(validG);

  const ranked = students.map(st => {
    const sg = _studentStats(st.id, cls, subj);
    return { ...st, ...sg };
  }).sort((a, b) => {
    if (a.avg == null && b.avg == null) return 0;
    if (a.avg == null) return 1;
    if (b.avg == null) return -1;
    return b.avg - a.avg;
  });

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>تقرير النقاط — ${clsLb} — ${sbLb}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0 }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111;
           direction: rtl; padding: 24px; font-size: 13px }
    h1 { font-size: 18px; margin-bottom: 4px }
    .meta { color: #666; margin-bottom: 16px; font-size: 12px }
    .stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px }
    .stat { background: #f5f5f5; border-radius: 8px; padding: 8px 16px;
            text-align: center; min-width: 100px }
    .stat b { display: block; font-size: 18px; font-family: monospace }
    .stat small { font-size: 11px; color: #777 }
    table { border-collapse: collapse; width: 100% }
    th { background: #eee; padding: 7px 10px; text-align: right;
         font-size: 12px; border: 1px solid #ddd }
    td { padding: 6px 10px; border: 1px solid #eee; font-size: 12px }
    tr:nth-child(even) { background: #fafafa }
    .pass { color: #16a34a; font-weight: 700 }
    .fail { color: #dc2626; font-weight: 700 }
    .footer { margin-top: 16px; font-size: 11px; color: #999; text-align: center }
    @media print { body { padding: 8px } }
  </style>
</head>
<body>
  <h1>تقرير النقاط — ${clsLb} — ${esc(sbLb)}</h1>
  <div class="meta">
    تاريخ الطباعة: ${new Date().toLocaleDateString('ar-MA', { day: '2-digit', month: 'long', year: 'numeric' })}
  </div>
  <div class="stats">
    <div class="stat"><b>${stats.avg  != null ? stats.avg.toFixed(2)  : '—'}</b><small>المعدل/20</small></div>
    <div class="stat"><b>${stats.median != null ? stats.median.toFixed(2) : '—'}</b><small>الوسيط/20</small></div>
    <div class="stat"><b>${stats.passRate != null ? stats.passRate + '%' : '—'}</b><small>نسبة النجاح</small></div>
    <div class="stat"><b>${stats.max  != null ? stats.max.toFixed(1)  : '—'}</b><small>أعلى نقطة</small></div>
    <div class="stat"><b>${stats.min  != null ? stats.min.toFixed(1)  : '—'}</b><small>أدنى نقطة</small></div>
    <div class="stat"><b>${allGrades.length}</b><small>التقييمات</small></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>الترتيب</th>
        <th>اسم التلميذ</th>
        <th>المعدل/20</th>
        <th>عدد التقييمات</th>
        <th>النتيجة</th>
      </tr>
    </thead>
    <tbody>
      ${ranked.map((st, i) => `
        <tr>
          <td style="text-align:center">${i + 1}</td>
          <td>${esc(st.name)}</td>
          <td class="${st.avg != null ? (st.avg >= 10 ? 'pass' : 'fail') : ''}"
            style="text-align:center;font-family:monospace">
            ${st.avg != null ? st.avg.toFixed(2) : '—'}
          </td>
          <td style="text-align:center">${st.count}</td>
          <td class="${st.avg != null ? (st.avg >= 10 ? 'pass' : 'fail') : ''}" style="text-align:center">
            ${st.avg != null ? (st.avg >= 10 ? 'ناجح ✓' : 'راسب ✗') : '—'}
          </td>
        </tr>`).join('')}
    </tbody>
  </table>
  <div class="footer">تم إنشاء هذا التقرير بواسطة نظام مساعد الأستاذ</div>
  <script>window.print();<\/script>
</body>
</html>`);
  win.document.close();
}
