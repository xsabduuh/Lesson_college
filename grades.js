/* =================================================================
   GRADES (النقاط والأداء) – نسخة متكاملة
================================================================= */

// أنواع التقييم (يمكن تخصيصها)
const GRADE_TYPES = ['فرض', 'اختبار', 'واجب منزلي', 'مشروع', 'شفوي', 'آخر'];

// متغيرات الفلترة
const filGrade = { cls: '1ere', subj: 'math', filterType: '', filterDate: '' };

function renderGrades() {
  const cls  = filGrade.cls;
  const subj = filGrade.subj;
  const s    = subjById(subj);
  const students  = studentsOf(cls);
  
  // فلترة النقاط
  let allGrades = DATA.grades.filter(g => g.cls === cls && g.subj === subj);
  if (filGrade.filterType) {
    allGrades = allGrades.filter(g => g.type === filGrade.filterType);
  }
  if (filGrade.filterDate) {
    allGrades = allGrades.filter(g => g.date === filGrade.filterDate);
  }

  const validG    = allGrades.filter(g => g.max > 0);
  const classAvg  = validG.length > 0
    ? validG.reduce((a, g) => a + (g.score / g.max), 0) / validG.length * 20
    : null;

  // إحصائيات إضافية
  const highest = validG.length > 0 ? Math.max(...validG.map(g => g.score)) : null;
  const lowest = validG.length > 0 ? Math.min(...validG.map(g => g.score)) : null;

  const sec = document.getElementById('sec-grades');
  sec.innerHTML = `
    ${classTabsHtml(cls, "setGradeCls")}
    ${subjPillsHtml(subj, "setGradeSubj")}

    <!-- صف أدوات التصفية -->
    <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
      <select class="field" style="width:auto;padding:6px 10px;font-size:13px;" id="grade-type-filter" onchange="setGradeFilterType(this.value)">
        <option value="">كل الأنواع</option>
        ${GRADE_TYPES.map(t => `<option value="${t}" ${filGrade.filterType === t ? 'selected' : ''}>${t}</option>`).join('')}
      </select>
      <input type="date" class="field" style="width:auto;padding:6px 10px;font-size:13px;" id="grade-date-filter" value="${filGrade.filterDate}" onchange="setGradeFilterDate(this.value)">
      <button class="btn btn-sm btn-outline" onclick="clearGradeFilters()">مسح التصفية</button>
    </div>

    <!-- إحصائيات سريعة -->
    <div class="stat-grid stat-grid-3" style="margin-bottom:12px">
      <div class="stat-card">
        <div class="s-label">النقاط المسجلة</div>
        <div class="s-val">${allGrades.length}</div>
      </div>
      <div class="stat-card">
        <div class="s-label">معدل القسم</div>
        <div class="s-val" style="color:${classAvg!=null?(classAvg>=10?'var(--green)':'var(--danger)'):'var(--text-3)'}">
          ${classAvg != null ? classAvg.toFixed(1) + '/20' : '—'}
        </div>
      </div>
      <div class="stat-card">
        <div class="s-label">أعلى / أدنى نقطة</div>
        <div class="s-val" style="font-size:16px;">
          ${highest != null ? highest : '—'} / ${lowest != null ? lowest : '—'}
        </div>
      </div>
    </div>

    <!-- أداء التلاميذ -->
    ${students.length === 0
      ? `<div class="panel">${emptyHtml('لا يوجد تلاميذ', 'أضف تلاميذ أولاً في قسم التلاميذ')}</div>`
      : `<div class="panel" style="margin-bottom:12px">
          <div class="panel-title" style="display:flex;justify-content:space-between;align-items:center;">
            <span>أداء التلاميذ — ${s.label}</span>
            <span style="font-size:11px;color:var(--text-3);">${students.length} تلميذ</span>
          </div>
          ${students.map(st => {
            const sg  = allGrades.filter(g => g.sid === st.id).filter(g => g.max > 0);
            const avg = sg.length > 0
              ? sg.reduce((a, g) => a + (g.score / g.max), 0) / sg.length * 20
              : null;
            const cnt = sg.length;
            return `<div class="card-item"
              onclick="navigate('student-detail','${st.id}');setTimeout(()=>setDetailTab('grades','${st.id}'),60)">
              <div class="card-item-icon"
                style="background:${classBg(st.cls)};color:${classColor(st.cls)};font-size:17px;font-weight:800">
                ${esc(st.name.charAt(0))}
              </div>
              <div class="card-item-body">
                <div class="card-item-title">${esc(st.name)}</div>
                <div class="card-item-sub">${cnt} نقطة</div>
              </div>
              <div style="text-align:center;min-width:52px">
                <div style="font-size:20px;font-weight:800;font-family:var(--mono);
                  color:${avg!=null?(avg>=10?'var(--green)':'var(--danger)'):'var(--text-3)'}">
                  ${avg != null ? avg.toFixed(1) : '—'}
                </div>
                <div style="font-size:10px;color:var(--text-3)">/20</div>
              </div>
              <span style="color:var(--text-3)">${IC.chev}</span>
            </div>`;
          }).join('')}
        </div>`}

    <!-- آخر النقاط المسجلة -->
    ${allGrades.length > 0 ? `
    <div class="panel">
      <div class="panel-title" style="display:flex;justify-content:space-between;align-items:center;">
        <span>آخر النقاط المسجلة</span>
        <button class="btn btn-sm btn-danger" style="font-size:11px;" onclick="deleteAllGrades('${cls}','${subj}')">حذف الكل</button>
      </div>
      ${allGrades
        .slice()
        .sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1)
        .slice(0, 20)
        .map(g => {
          const st  = DATA.students.find(x => x.id === g.sid);
          const pct = g.max > 0 ? g.score / g.max : 0;
          const sc  = pct >= 0.7 ? 'pass' : pct >= 0.5 ? 'avg' : 'fail';
          return `<div class="grade-item">
            <div class="grade-score ${sc}">
              ${g.score}<span style="font-size:10px;opacity:.5">/${g.max}</span>
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600">${esc(g.title || g.type || 'نقطة')}</div>
              <div style="font-size:11px;color:var(--text-3)">
                ${esc(st ? st.name : '—')} · ${fdate(g.date)} · ${g.type || ''}
              </div>
            </div>
            <div class="admin-actions">
              <button class="btn-icon accent" onclick="openGradeForm('${g.id}')">${IC.edit}</button>
              <button class="btn-icon danger"  onclick="deleteGrade('${g.id}')">${IC.trash}</button>
            </div>
          </div>`;
        }).join('')}
    </div>` : ''}
  `;
}

// فلترة
function setGradeFilterType(type) {
  filGrade.filterType = type;
  renderGrades();
}
function setGradeFilterDate(date) {
  filGrade.filterDate = date;
  renderGrades();
}
function clearGradeFilters() {
  filGrade.filterType = '';
  filGrade.filterDate = '';
  renderGrades();
}

function setGradeCls(cls)  { filGrade.cls = cls; renderGrades(); }
function setGradeSubj(subj){ filGrade.subj = subj; renderGrades(); }

/* -----------------------------------------------------------------
   نموذج إضافة / تعديل نقطة
----------------------------------------------------------------- */
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
      <div class="field-row"><label>القسم <span class="req">*</span></label>
        <select class="field" id="gf-cls"
          onchange="reloadGradeStudents(this.value)">${clsOpts}</select></div>
      <div class="field-row"><label>المادة <span class="req">*</span></label>
        <select class="field" id="gf-subj">${subjOpts}</select></div>
    </div>
    <div class="field-row"><label>التلميذ <span class="req">*</span></label>
      <select class="field" id="gf-sid">
        ${studOpts || '<option value="">— لا يوجد تلاميذ في هذا القسم —</option>'}
      </select></div>
    <div class="field-row"><label>نوع التقييم</label>
      <select class="field" id="gf-type">${typeOpts}</select></div>
    <div class="field-row"><label>عنوان / وصف</label>
      <input class="field" id="gf-title"
        placeholder="مثال: فرض الفصل الأول" value="${esc(g.title || '')}"></div>
    <div class="field-grid-2">
      <div class="field-row"><label>النقطة المحصل عليها <span class="req">*</span></label>
        <input class="field" type="number" id="gf-score"
          min="0" step="0.25" placeholder="0" value="${g.score != null ? g.score : ''}"></div>
      <div class="field-row"><label>من (العلامة القصوى)</label>
        <input class="field" type="number" id="gf-max"
          min="1" step="1" value="${g.max || 20}"></div>
    </div>
    <div class="field-row"><label>التاريخ</label>
      <input class="field" type="date" id="gf-date"
        value="${g.date || today()}"></div>
    <div class="field-row"><label>ملاحظة (اختياري)</label>
      <input class="field" id="gf-note"
        placeholder="ملاحظة حول هذه النقطة" value="${esc(g.note || '')}"></div>
    <input type="hidden" id="gf-id" value="${id || ''}">
  `, [
    { label: 'إلغاء', cls: 'btn-outline', fn: 'closeSheet()' },
    { label: 'حفظ',   cls: 'btn-accent',  fn: 'saveGrade()' }
  ]);
}

function reloadGradeStudents(cls) {
  const sel = document.getElementById('gf-sid');
  if (!sel) return;
  const opts = studentsOf(cls).map(s =>
    `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  sel.innerHTML = opts || '<option value="">— لا يوجد تلاميذ —</option>';
}

function saveGrade() {
  const id    = document.getElementById('gf-id').value;
  const sid   = document.getElementById('gf-sid').value;
  const scoreRaw = document.getElementById('gf-score').value;
  const max   = parseFloat(document.getElementById('gf-max').value) || 20;
  const score = parseFloat(scoreRaw);

  if (!sid)          { toast('اختر التلميذ', 'error'); return; }
  if (scoreRaw === '' || isNaN(score) || score < 0) {
    toast('أدخل نقطة صحيحة (رقم ≥ 0)', 'error'); return;
  }
  if (score > max)   { toast(`النقطة (${score}) تتجاوز العلامة القصوى (${max})`, 'error'); return; }

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

  if (id) {
    Object.assign(DATA.grades.find(x => x.id === id), obj);
  } else {
    DATA.grades.push({ id: uid(), ...obj });
  }
  save(); closeSheet(); toast('تم الحفظ', 'success'); renderGrades();
}

function deleteGrade(id) {
  if (!confirm('سيتم حذف هذه النقطة نهائياً. هل تؤكد؟')) return;
  DATA.grades = DATA.grades.filter(g => g.id !== id);
  save(); toast('تم الحذف'); renderGrades();
}

// حذف جميع نقاط مادة/قسم معين
function deleteAllGrades(cls, subj) {
  if (!confirm(`حذف جميع نقاط ${subjById(subj).label} لقسم ${clsById(cls).label}؟ لا يمكن التراجع.`)) return;
  DATA.grades = DATA.grades.filter(g => !(g.cls === cls && g.subj === subj));
  save(); toast('تم حذف جميع النقاط', 'success'); renderGrades();
}