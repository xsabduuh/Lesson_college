/* =================================================================
   EXERCISES – بطاقات تمارين بسيطة
================================================================= */

function renderExercises(){
  const cls  = filExer.cls;
  const subj = filExer.subj;
  const items = DATA.exercises
    .filter(e => e.cls === cls && e.subj === subj)
    .sort((a,b) => (a.date||'').localeCompare(b.date||''));

  const sec = document.getElementById('sec-exercises');
  sec.innerHTML = `
    ${classTabsHtml(cls, 'setExerCls')}
    ${subjPillsHtml(subj, 'setExerSubj')}

    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
      <h2 style="font-size:16px; font-weight:800;">التمارين</h2>
      <button class="btn btn-accent btn-sm" onclick="openExerciseForm()">
        ${IC.plus} إضافة تمرين
      </button>
    </div>

    <div id="exercises-list" style="display:flex; flex-direction:column; gap:12px;">
      ${items.length === 0
        ? `<div class="panel" style="padding:20px; text-align:center; color:var(--text-3);">
             لا توجد تمارين بعد
           </div>`
        : items.map(e => `
          <div class="panel" style="padding:0; overflow:hidden;">
            <!-- صورة التمرين -->
            ${e.image ? `
              <div style="width:100%; max-height:200px; overflow:hidden; background:var(--surface-2);">
                <img src="${e.image}" alt="صورة التمرين" style="width:100%; height:auto; display:block; object-fit:cover;">
              </div>` : ''}

            <div style="padding:14px;">
              <div style="display:flex; align-items:flex-start; gap:10px;">
                <div style="flex:1; min-width:0;">
                  <!-- العنوان -->
                  <div style="font-size:14px; font-weight:800; margin-bottom:6px; word-break:break-word;">
                    ${esc(e.title)}
                  </div>

                  <!-- المادة + المستوى -->
                  <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                    <span class="badge badge-${subjById(e.subj).cls}" style="font-size:11px;">
                      ${subjById(e.subj).short}
                    </span>
                    ${e.level ? `
                      <span class="badge ${LEVEL_COLORS[e.level] || 'badge-gray'}" style="font-size:11px;">
                        ${e.level}
                      </span>` : ''}
                    ${e.notes ? `
                      <span style="font-size:11px; color:var(--text-3);">
                        ${esc(e.notes.length > 40 ? e.notes.slice(0,40)+'…' : e.notes)}
                      </span>` : ''}
                  </div>
                </div>

                <!-- أزرار الإدارة -->
                <div style="display:flex; gap:4px; flex-shrink:0;">
                  <button class="btn-icon accent" onclick="openExerciseForm('${e.id}')"
                    aria-label="تعديل">${IC.edit}</button>
                  ${DATA.settings.adminMode ? `
                    <button class="btn-icon danger" onclick="deleteExercise('${e.id}')"
                      aria-label="حذف">${IC.trash}</button>` : ''}
                </div>
              </div>
            </div>
          </div>`).join('')}
    </div>
  `;
}

function setExerCls(cls)   { filExer.cls  = cls; renderExercises(); }
function setExerSubj(subj) { filExer.subj = subj; renderExercises(); }

/* ── نموذج إضافة / تعديل تمرين ─────────────────────────────── */
function openExerciseForm(id){
  const e    = id ? DATA.exercises.find(x => x.id === id) : {};
  const cls  = e.cls  || filExer.cls;
  const subj = e.subj || filExer.subj;

  const clsOpts  = CLASSES.map(c =>
    `<option value="${c.id}" ${cls === c.id ? 'selected' : ''}>${c.label}</option>`).join('');
  const subjOpts = SUBJECTS.map(s =>
    `<option value="${s.id}" ${subj === s.id ? 'selected' : ''}>${s.label}</option>`).join('');
  const levelOpts = ['','سهل','متوسط','صعب','تحدٍّ'].map(l =>
    `<option value="${l}" ${(e.level||'') === l ? 'selected' : ''}>${l || '—'}</option>`).join('');

  showSheet(id ? 'تعديل تمرين' : 'إضافة تمرين جديد', `
    <div class="field-row">
      <label>عنوان التمرين <span class="req">*</span></label>
      <input class="field" id="ef-title"
        placeholder="اكتب عنوان التمرين" value="${esc(e.title || '')}">
    </div>

    <div class="field-grid-2">
      <div class="field-row">
        <label>المادة</label>
        <select class="field" id="ef-subj">${subjOpts}</select>
      </div>
      <div class="field-row">
        <label>المستوى</label>
        <select class="field" id="ef-level">${levelOpts}</select>
      </div>
    </div>

    <div class="field-row">
      <label>صورة التمرين</label>
      <input type="file" id="ef-image" accept="image/*" style="display:block; margin-top:4px;">
      ${e.image ? `<div style="margin-top:8px;"><img src="${e.image}" style="max-width:100%; max-height:120px; border-radius:8px;"></div>` : ''}
    </div>

    <div class="field-row">
      <label>ملاحظات</label>
      <textarea class="field" id="ef-notes" rows="2"
        placeholder="ملاحظات سريعة...">${esc(e.notes || '')}</textarea>
    </div>

    <input type="hidden" id="ef-id" value="${id || ''}">
    <input type="hidden" id="ef-cls" value="${cls}">
  `, [
    { label: 'إلغاء', cls: 'btn-outline', fn: 'closeSheet()' },
    { label: 'حفظ',   cls: 'btn-accent',  fn: 'saveExercise()' }
  ]);
}

/* ── حفظ التمرين ─────────────────────────────────────────────── */
function saveExercise(){
  const id    = document.getElementById('ef-id').value;
  const title = document.getElementById('ef-title').value.trim();
  if(!title){ toast('أدخل عنوان التمرين', 'error'); return; }

  const existing = id ? DATA.exercises.find(x => x.id === id) : null;

  const obj = {
    cls:   document.getElementById('ef-cls').value,
    subj:  document.getElementById('ef-subj').value,
    title: title,
    level: document.getElementById('ef-level').value,
    notes: document.getElementById('ef-notes').value.trim(),
    date:  existing ? existing.date : today(),
    image: existing ? existing.image : null
  };

  const fileInput = document.getElementById('ef-image');
  const processSave = () => {
    if (id) {
      Object.assign(DATA.exercises.find(x => x.id === id), obj);
    } else {
      DATA.exercises.push({ id: uid(), ...obj });
    }
    save(); closeSheet(); toast('تم الحفظ', 'success'); renderExercises();
  };

  if (fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      obj.image = e.target.result;
      processSave();
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    processSave();
  }
}

/* ── حذف تمرين ───────────────────────────────────────────────── */
function deleteExercise(id){
  if (!confirm('حذف هذا التمرين؟')) return;
  DATA.exercises = DATA.exercises.filter(e => e.id !== id);
  save();
  toast('تم الحذف');
  renderExercises();
}