/* =================================================================
   GRADES (النقاط والأداء) – متوافق مع iOS/Chrome
================================================================= */
if (typeof filGrade === 'undefined') {
  var filGrade = { cls: '1ere', subj: 'math', filterType: '', filterDate: '' };
}

const GRADES_TYPES = ['فرض', 'اختبار', 'واجب منزلي', 'مشروع', 'شفوي', 'آخر'];

function renderGrades() {
  try {
    const cls  = filGrade.cls;
    const subj = filGrade.subj;
    const s    = subjById(subj);
    const students = studentsOf(cls);

    let allGrades = DATA.grades.filter(function(g) { return g.cls === cls && g.subj === subj; });
    if (filGrade.filterType) allGrades = allGrades.filter(function(g) { return g.type === filGrade.filterType; });
    if (filGrade.filterDate) allGrades = allGrades.filter(function(g) { return g.date === filGrade.filterDate; });

    const validG   = allGrades.filter(function(g) { return g.max > 0; });
    const classAvg = validG.length ? (validG.reduce(function(a, g) { return a + (g.score / g.max); }, 0) / validG.length) * 20 : null;
    const highest  = validG.length ? Math.max.apply(null, validG.map(function(g) { return g.score; })) : null;
    const lowest   = validG.length ? Math.min.apply(null, validG.map(function(g) { return g.score; })) : null;

    const sec = document.getElementById('sec-grades');
    if (!sec) return;

    sec.innerHTML = 
      classTabsHtml(cls, "setGradeCls") +
      subjPillsHtml(subj, "setGradeSubj") +
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">' +
        '<select class="field" style="width:auto;padding:6px 10px;font-size:13px;" id="grade-type-filter" onchange="setGradeFilterType(this.value)">' +
          '<option value="">كل الأنواع</option>' +
          GRADES_TYPES.map(function(t) { return '<option value="' + t + '" ' + (filGrade.filterType === t ? 'selected' : '') + '>' + t + '</option>'; }).join('') +
        '</select>' +
        '<input type="date" class="field" style="width:auto;padding:6px 10px;font-size:13px;" id="grade-date-filter" value="' + (filGrade.filterDate || '') + '" onchange="setGradeFilterDate(this.value)">' +
        '<button class="btn btn-sm btn-outline" onclick="clearGradeFilters()">مسح التصفية</button>' +
      '</div>' +

      '<div class="stat-grid stat-grid-3" style="margin-bottom:12px">' +
        '<div class="stat-card"><div class="s-label">النقاط المسجلة</div><div class="s-val">' + allGrades.length + '</div></div>' +
        '<div class="stat-card"><div class="s-label">معدل القسم</div><div class="s-val" style="color:' + (classAvg != null ? (classAvg >= 10 ? 'var(--green)' : 'var(--danger)') : 'var(--text-3)') + '">' + (classAvg != null ? classAvg.toFixed(1) + '/20' : '—') + '</div></div>' +
        '<div class="stat-card"><div class="s-label">أعلى / أدنى</div><div class="s-val" style="font-size:16px;">' + (highest != null ? highest : '—') + ' / ' + (lowest != null ? lowest : '—') + '</div></div>' +
      '</div>' +

      (students.length === 0 ? emptyHtml('لا يوجد تلاميذ','أضف تلاميذ في قسم التلاميذ') :
      '<div class="panel" style="margin-bottom:12px">' +
        '<div class="panel-title">أداء التلاميذ — ' + s.label + '</div>' +
        students.map(function(st) {
          const sg = allGrades.filter(function(g) { return g.sid === st.id && g.max > 0; });
          const avg = sg.length ? sg.reduce(function(a, g) { return a + (g.score / g.max); }, 0) / sg.length * 20 : null;
          return '<div class="card-item" style="cursor:pointer;" onclick="navigate(\'student-detail\',\'' + st.id + '\');setTimeout(function(){setDetailTab(\'grades\',\'' + st.id + '\')},60)">' +
            '<div class="card-item-icon" style="background:' + classBg(st.cls) + ';color:' + classColor(st.cls) + ';font-weight:800;">' + esc(st.name.charAt(0)) + '</div>' +
            '<div class="card-item-body"><div class="card-item-title">' + esc(st.name) + '</div><div class="card-item-sub">' + sg.length + ' نقطة</div></div>' +
            '<div style="text-align:center;min-width:52px;"><div style="font-size:20px;font-weight:800;font-family:var(--mono);color:' + (avg != null ? (avg >= 10 ? 'var(--green)' : 'var(--danger)') : 'var(--text-3)') + '">' + (avg != null ? avg.toFixed(1) : '—') + '</div><div style="font-size:10px;color:var(--text-3)">/20</div></div>' +
          '</div>';
        }).join('') +
      '</div>') +

      (allGrades.length > 0 ?
      '<div class="panel">' +
        '<div class="panel-title" style="display:flex;justify-content:space-between;align-items:center;"><span>آخر النقاط المسجلة</span><button class="btn btn-sm btn-danger" onclick="deleteAllGrades(\'' + cls + '\',\'' + subj + '\')">حذف الكل</button></div>' +
        allGrades.slice().sort(function(a,b) { return (b.date||'').localeCompare(a.date||''); }).slice(0,20).map(function(g) {
          const st = DATA.students.find(function(x) { return x.id === g.sid; });
          const pct = g.max > 0 ? g.score / g.max : 0;
          const sc = pct >= 0.7 ? 'pass' : pct >= 0.5 ? 'avg' : 'fail';
          return '<div class="grade-item">' +
            '<div class="grade-score ' + sc + '">' + g.score + '<span style="font-size:10px;opacity:.5">/' + g.max + '</span></div>' +
            '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;">' + esc(g.title || g.type || 'نقطة') + '</div><div style="font-size:11px;color:var(--text-3);">' + esc(st ? st.name : '—') + ' · ' + fdate(g.date) + ' · ' + (g.type || '') + '</div>' + (g.fileData ? '<div style="margin-top:4px;font-size:11px;color:var(--accent);cursor:pointer;" onclick="event.stopPropagation();downloadGradeFile(\'' + g.id + '\')">📎 ' + esc(g.fileName || 'ملف') + '</div>' : '') + '</div>' +
            '<div class="admin-actions"><button class="btn-icon accent" onclick="event.stopPropagation();openGradeForm(\'' + g.id + '\')">' + IC.edit + '</button><button class="btn-icon danger" onclick="event.stopPropagation();deleteGrade(\'' + g.id + '\')">' + IC.trash + '</button></div>' +
          '</div>';
        }).join('') +
      '</div>' : '');
  } catch (error) {
    const sec = document.getElementById('sec-grades');
    if (sec) {
      sec.innerHTML = '<div style="padding:16px;background:#fff3f3;border:1px solid red;border-radius:10px;margin:12px;">' +
        '<strong>خطأ في قسم النقاط:</strong><br>' + error.message + '<br><small>' + error.stack + '</small></div>';
    }
  }
}

// دوال مساعدة
function setGradeFilterType(t) { filGrade.filterType = t; renderGrades(); }
function setGradeFilterDate(d) { filGrade.filterDate = d; renderGrades(); }
function clearGradeFilters() { filGrade.filterType = ''; filGrade.filterDate = ''; renderGrades(); }
function setGradeCls(cls)   { filGrade.cls = cls; renderGrades(); }
function setGradeSubj(subj) { filGrade.subj = subj; renderGrades(); }

function openGradeForm(id) {
  const g = id ? DATA.grades.find(function(x) { return x.id === id; }) : {};
  const cls  = g.cls || filGrade.cls;
  const subj = g.subj || filGrade.subj;
  const clsOpts  = CLASSES.map(function(c) { return '<option value="' + c.id + '" ' + (cls === c.id ? 'selected' : '') + '>' + c.label + '</option>'; }).join('');
  const subjOpts = SUBJECTS.map(function(s) { return '<option value="' + s.id + '" ' + (subj === s.id ? 'selected' : '') + '>' + s.label + '</option>'; }).join('');
  const studOpts = studentsOf(cls).map(function(s) { return '<option value="' + s.id + '" ' + ((g.sid||'') === s.id ? 'selected' : '') + '>' + esc(s.name) + '</option>'; }).join('');
  const typeOpts = GRADES_TYPES.map(function(t) { return '<option value="' + t + '" ' + ((g.type||GRADES_TYPES[0]) === t ? 'selected' : '') + '>' + t + '</option>'; }).join('');

  showSheet(id ? 'تعديل نقطة' : 'تسجيل نقطة جديدة',
    '<div class="field-grid-2">' +
      '<div class="field-row"><label>القسم</label><select class="field" id="gf-cls" onchange="reloadGradeStudents(this.value)">' + clsOpts + '</select></div>' +
      '<div class="field-row"><label>المادة</label><select class="field" id="gf-subj">' + subjOpts + '</select></div>' +
    '</div>' +
    '<div class="field-row"><label>التلميذ <span class="req">*</span></label>' +
      '<select class="field" id="gf-sid">' + (studOpts || '<option value="">— لا يوجد تلاميذ —</option>') + '</select></div>' +
    '<div class="field-row"><label>نوع التقييم</label>' +
      '<select class="field" id="gf-type">' + typeOpts + '</select></div>' +
    '<div class="field-row"><label>عنوان / وصف</label>' +
      '<input class="field" id="gf-title" placeholder="مثال: فرض الفصل الأول" value="' + esc(g.title||'') + '"></div>' +
    '<div class="field-grid-2">' +
      '<div class="field-row"><label>النقطة <span class="req">*</span></label>' +
        '<input class="field" type="number" id="gf-score" min="0" step="0.25" value="' + (g.score!=null ? g.score : '') + '"></div>' +
      '<div class="field-row"><label>العلامة القصوى</label>' +
        '<input class="field" type="number" id="gf-max" min="1" step="1" value="' + (g.max||20) + '"></div>' +
    '</div>' +
    '<div class="field-row"><label>التاريخ</label>' +
      '<input class="field" type="date" id="gf-date" value="' + (g.date||today()) + '"></div>' +
    '<div class="field-row"><label>ملاحظة</label>' +
      '<input class="field" id="gf-note" placeholder="ملاحظة" value="' + esc(g.note||'') + '"></div>' +
    '<div class="field-row">' +
      '<label>ملف مرفق (صورة أو PDF)</label>' +
      '<input type="file" id="gf-file" accept="image/*,.pdf" style="display:block;margin-top:4px;">' +
      (id && g.fileName ? '<div style="font-size:11px;color:var(--text-3);">الملف الحالي: ' + esc(g.fileName) + '</div>' : '') +
    '</div>' +
    '<input type="hidden" id="gf-id" value="' + (id||'') + '">',
    [
      {label:'إلغاء',cls:'btn-outline',fn:'closeSheet()'},
      {label:'حفظ',cls:'btn-accent',fn:'saveGrade()'}
    ]
  );
}

function reloadGradeStudents(cls) {
  const sel = document.getElementById('gf-sid');
  if (!sel) return;
  sel.innerHTML = studentsOf(cls).map(function(s) { return '<option value="' + s.id + '">' + esc(s.name) + '</option>'; }).join('') || '<option value="">— لا يوجد تلاميذ —</option>';
}

function saveGrade() {
  const id    = document.getElementById('gf-id').value;
  const sid   = document.getElementById('gf-sid').value;
  const scoreRaw = document.getElementById('gf-score').value;
  const max   = parseFloat(document.getElementById('gf-max').value) || 20;
  const score = parseFloat(scoreRaw);

  if (!sid)                     { toast('اختر التلميذ','error'); return; }
  if (scoreRaw === '' || isNaN(score) || score < 0) { toast('نقطة غير صحيحة','error'); return; }
  if (score > max)              { toast('النقطة تتجاوز العلامة القصوى','error'); return; }

  const fileInput = document.getElementById('gf-file');
  const existing  = id ? DATA.grades.find(function(x) { return x.id === id; }) : null;

  const obj = {
    sid: sid,
    cls: document.getElementById('gf-cls').value,
    subj: document.getElementById('gf-subj').value,
    type: document.getElementById('gf-type').value,
    title: document.getElementById('gf-title').value.trim(),
    score: score,
    max: max,
    date: document.getElementById('gf-date').value,
    note: document.getElementById('gf-note').value.trim()
  };

  if (existing && existing.fileData && !fileInput.files[0]) {
    obj.fileData = existing.fileData;
    obj.fileName = existing.fileName;
    obj.fileType = existing.fileType;
  }

  function finalize() {
    if (id) {
      const grade = DATA.grades.find(function(x) { return x.id === id; });
      Object.assign(grade, obj);
    } else {
      DATA.grades.push({ id: uid(), obj: obj });
    }
    save(); closeSheet(); toast('تم الحفظ','success'); renderGrades();
  }

  if (fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      obj.fileData = e.target.result;
      obj.fileName = fileInput.files[0].name;
      obj.fileType = fileInput.files[0].type;
      finalize();
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    finalize();
  }
}

function deleteGrade(id) {
  if (!confirm('حذف هذه النقطة؟')) return;
  DATA.grades = DATA.grades.filter(function(g) { return g.id !== id; });
  save(); toast('تم الحذف'); renderGrades();
}

function deleteAllGrades(cls, subj) {
  if (!confirm('حذف جميع نقاط ' + subjById(subj).label + ' لقسم ' + clsById(cls).label + '؟')) return;
  DATA.grades = DATA.grades.filter(function(g) { return !(g.cls === cls && g.subj === subj); });
  save(); toast('تم حذف جميع النقاط','success'); renderGrades();
}

function downloadGradeFile(id) {
  const g = DATA.grades.find(function(x) { return x.id === id; });
  if (!g || !g.fileData) return;
  if (g.fileType && g.fileType.indexOf('image/') === 0) {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write('<img src="' + g.fileData + '" style="max-width:100%;height:auto;">');
      win.document.title = g.fileName || 'صورة';
    } else {
      const a = document.createElement('a');
      a.href = g.fileData; a.download = g.fileName || 'file'; a.click();
    }
  } else {
    const a = document.createElement('a');
    a.href = g.fileData; a.download = g.fileName || 'file';
    document.body.appendChild(a); a.click(); a.remove();
  }
}