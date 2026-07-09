/* =================================================================
   EXERCISES (التمارين) - نسخة مطورة مع الصور والملفات
================================================================= */

// ألوان المستويات
const LEVEL_COLORS = {
  'سهل':   'badge-green',
  'متوسط': 'badge-blue',
  'صعب':   'badge-amber',
  'تحدٍّ': 'badge-red',
};

// متغيرات الفلترة
const filExer = { cls: '1ere', subj: 'math' };

function renderExercises(){
  const cls = filExer.cls;
  const subj = filExer.subj;
  const items = DATA.exercises.filter(e => e.cls === cls && e.subj === subj).slice().reverse();
  const s = subjById(subj);

  // تجميع حسب المستوى
  const byLevel = {};
  items.forEach(e => {
    const lvl = e.level || 'غير محدد';
    if (!byLevel[lvl]) byLevel[lvl] = [];
    byLevel[lvl].push(e);
  });

  const sec = document.getElementById('sec-exercises');
  let num = 0;
  sec.innerHTML = `
    ${classTabsHtml(cls, "setExerCls")}
    ${subjPillsHtml(subj, "setExerSubj")}
    <div class="section-header">
      <h2>${IC.pen} تمارين ${s.label}</h2>
      <span class="count-badge">${items.length}</span>
    </div>
    ${items.length === 0
      ? `<div class="panel">${emptyHtml('لا توجد تمارين', 'أضف تمريناً باستخدام الزر أسفله')}</div>`
      : Object.entries(byLevel).map(([level, exs]) => `
        <div style="margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span class="badge ${LEVEL_COLORS[level] || 'badge-gray'}" style="font-size:12px;padding:4px 12px;">${level}</span>
            <span class="count-badge">${exs.length}</span>
          </div>
          ${exs.map(e => {
            num++;
            return exerciseCardHtml(e, s, num);
          }).join('')}
        </div>
      `).join('')}
  `;
}

function exerciseCardHtml(e, s, num){
  // أيقونة الملف المرفق
  const fileAttached = e.fileName
    ? `<div style="margin-top:8px;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--accent);cursor:pointer;" onclick="event.stopPropagation();downloadExFile('${e.id}')">
         ${IC.file} ${esc(e.fileName)} ${IC.download}
       </div>`
    : '';

  // أيقونة صورة الحل
  const solutionImage = e.solutionImage
    ? `<div style="margin-top:8px;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--green);cursor:pointer;" onclick="event.stopPropagation();viewSolutionImage('${e.id}')">
         ${IC.eye} عرض صورة الحل
       </div>`
    : '';

  return `
    <div class="ex-card" data-id="${e.id}">
      <div class="ex-card-head">
        <div class="ex-num" style="background:${s.bg};color:${s.color};">${num}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px;">
            ${esc(e.title)}
            ${e.level ? `<span class="badge ${LEVEL_COLORS[e.level] || 'badge-gray'}" style="font-size:10px;">${e.level}</span>` : ''}
          </div>
          <div style="font-size:12px;color:var(--text-3);margin-top:2px;">
            ${IC.calendar} ${fdate(e.date)}
          </div>
          ${e.content ? `<div style="font-size:13px;color:var(--text-2);margin-top:8px;line-height:1.6;">${esc(e.content)}</div>` : ''}
          ${fileAttached}
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center;">
            ${e.solution ? `<button class="btn btn-outline btn-sm" onclick="event.stopPropagation();toggleSolution('${e.id}')" id="sol-btn-${e.id}">${IC.eye} إظهار الحل</button>` : ''}
            ${solutionImage}
            <div class="admin-actions" style="margin:0;">
              <button class="btn-icon accent" onclick="event.stopPropagation();openExerciseForm('${e.id}')">${IC.edit}</button>
              <button class="btn-icon danger" onclick="event.stopPropagation();deleteExercise('${e.id}')">${IC.trash}</button>
            </div>
          </div>
        </div>
      </div>
      ${e.solution ? `
        <div class="ex-solution" id="sol-${e.id}">
          <div style="font-size:11px;font-weight:800;color:var(--green);margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px;">الحل</div>
          <div style="font-size:13px;color:var(--text-2);line-height:1.7;">${esc(e.solution)}</div>
        </div>` : ''}
    </div>
  `;
}

function toggleSolution(id){
  const sol = document.getElementById('sol-' + id);
  const btn = document.getElementById('sol-btn-' + id);
  if (!sol) return;
  const showing = sol.classList.toggle('show');
  if (btn) btn.innerHTML = showing ? `${IC.eyeOff} إخفاء الحل` : `${IC.eye} إظهار الحل`;
}

function setExerCls(cls){ filExer.cls = cls; renderExercises(); }
function setExerSubj(subj){ filExer.subj = subj; renderExercises(); }

function openExerciseForm(id){
  const e = id ? DATA.exercises.find(x => x.id === id) : {};
  const cls = e.cls || filExer.cls;
  const subj = e.subj || filExer.subj;
  const clsOpts = CLASSES.map(c => `<option value="${c.id}" ${cls === c.id ? 'selected' : ''}>${c.label}</option>`).join('');
  const subjOpts = SUBJECTS.map(s => `<option value="${s.id}" ${subj === s.id ? 'selected' : ''}>${s.label}</option>`).join('');
  const levOpts = ['', 'سهل', 'متوسط', 'صعب', 'تحدٍّ'].map(l => `<option value="${l}" ${(e.level || '') === l ? 'selected' : ''}>${l || 'غير محدد'}</option>`).join('');

  showSheet(id ? 'تعديل تمرين' : 'إضافة تمرين جديد', `
    <div class="field-grid-2">
      <div class="field-row"><label>القسم</label><select class="field" id="ef-cls">${clsOpts}</select></div>
      <div class="field-row"><label>المادة</label><select class="field" id="ef-subj">${subjOpts}</select></div>
    </div>
    <div class="field-row"><label>عنوان التمرين <span class="req">*</span></label>
      <input class="field" id="ef-title" placeholder="عنوان التمرين" value="${esc(e.title || '')}"></div>
    <div class="field-grid-2">
      <div class="field-row"><label>المستوى</label><select class="field" id="ef-level">${levOpts}</select></div>
      <div class="field-row"><label>التاريخ</label><input class="field" type="date" id="ef-date" value="${e.date || today()}"></div>
    </div>
    <div class="field-row"><label>نص التمرين</label>
      <textarea class="field" id="ef-content" style="min-height:100px" placeholder="نص التمرين أو السؤال...">${esc(e.content || '')}</textarea></div>
    <div class="field-row"><label>الحل (اختياري - نص)</label>
      <textarea class="field" id="ef-solution" style="min-height:80px" placeholder="الحل المقترح...">${esc(e.solution || '')}</textarea></div>
    <div class="field-row">
      <label>صورة الحل (اختياري)</label>
      <input type="file" id="ef-solution-image" accept="image/*" style="display:block;margin-top:4px;">
      ${e.solutionImage ? `<div style="font-size:11px;color:var(--text-3);margin-top:4px;">الصورة الحالية: ${esc(e.solutionImageName || 'solution')}</div>` : ''}
    </div>
    <div class="field-row">
      <label>ملف مرفق (PDF أو صورة)</label>
      <input type="file" id="ef-file" accept="image/*,.pdf" style="display:block;margin-top:4px;">
      ${e.fileName ? `<div style="font-size:11px;color:var(--text-3);margin-top:4px;">الملف الحالي: ${esc(e.fileName)}</div>` : ''}
    </div>
    <input type="hidden" id="ef-id" value="${id || ''}">
  `, [
    { label: 'إلغاء', cls: 'btn-outline', fn: 'closeSheet()' },
    { label: 'حفظ', cls: 'btn-accent', fn: 'saveExercise()' }
  ]);
}

function saveExercise(){
  const id = document.getElementById('ef-id').value;
  const title = document.getElementById('ef-title').value.trim();
  if (!title) { toast('أدخل عنوان التمرين', 'error'); return; }

  const fileInput = document.getElementById('ef-file');
  const solImageInput = document.getElementById('ef-solution-image');
  const existing = id ? DATA.exercises.find(x => x.id === id) : null;

  const obj = {
    cls: document.getElementById('ef-cls').value,
    subj: document.getElementById('ef-subj').value,
    title,
    level: document.getElementById('ef-level').value,
    date: document.getElementById('ef-date').value,
    content: document.getElementById('ef-content').value.trim(),
    solution: document.getElementById('ef-solution').value.trim(),
  };

  // الاحتفاظ بالبيانات القديمة إذا لم تُرفع ملفات جديدة
  if (existing) {
    if (!fileInput.files[0]) {
      obj.fileData = existing.fileData;
      obj.fileName = existing.fileName;
      obj.fileType = existing.fileType;
    }
    if (!solImageInput.files[0]) {
      obj.solutionImage = existing.solutionImage;
      obj.solutionImageName = existing.solutionImageName;
    }
  }

  const processSave = () => {
    if (id) {
      Object.assign(DATA.exercises.find(x => x.id === id), obj);
    } else {
      DATA.exercises.push({ id: uid(), ...obj });
    }
    save(); closeSheet(); toast('تم الحفظ', 'success'); renderExercises();
  };

  // معالجة رفع الملفات
  let filesToRead = 0;
  let filesRead = 0;

  function tryProcess() {
    filesRead++;
    if (filesRead >= filesToRead) processSave();
  }

  if (fileInput.files[0]) filesToRead++;
  if (solImageInput.files[0]) filesToRead++;

  if (filesToRead === 0) {
    processSave();
  } else {
    if (fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        obj.fileData = e.target.result;
        obj.fileName = fileInput.files[0].name;
        obj.fileType = fileInput.files[0].type;
        tryProcess();
      };
      reader.readAsDataURL(fileInput.files[0]);
    }
    if (solImageInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        obj.solutionImage = e.target.result;
        obj.solutionImageName = solImageInput.files[0].name;
        tryProcess();
      };
      reader.readAsDataURL(solImageInput.files[0]);
    }
  }
}

function deleteExercise(id){
  if (!confirm('حذف هذا التمرين؟')) return;
  DATA.exercises = DATA.exercises.filter(e => e.id !== id);
  save(); toast('تم الحذف'); renderExercises();
}

// تحميل الملف المرفق
function downloadExFile(id) {
  const ex = DATA.exercises.find(e => e.id === id);
  if (!ex || !ex.fileData) return;
  if (ex.fileType && ex.fileType.startsWith('image/')) {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<img src="${ex.fileData}" style="max-width:100%;">`);
    } else {
      downloadFallback(ex.fileData, ex.fileName || 'file');
    }
  } else {
    downloadFallback(ex.fileData, ex.fileName || 'file');
  }
}

// عرض صورة الحل
function viewSolutionImage(id) {
  const ex = DATA.exercises.find(e => e.id === id);
  if (!ex || !ex.solutionImage) return;
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(`<img src="${ex.solutionImage}" style="max-width:100%;">`);
  }
}

function downloadFallback(data, filename) {
  const a = document.createElement('a');
  a.href = data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}