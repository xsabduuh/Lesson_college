/* =================================================================
   LESSONS — دروس مع فقرات قابلة للسحب والإفلات
   يتطلب SortableJS (محمّل في index.html)
================================================================= */

let currentView = 'list';
let currentLessonId = null;

/* ═══════════════════════════════════════════════════════════════
   renderLessons — عرض قائمة الدروس
═══════════════════════════════════════════════════════════════ */
function renderLessons() {
  const cls  = filLess.cls;
  const subj = filLess.subj;
  const items = DATA.lessons
    .filter(l => l.cls === cls && l.subj === subj)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const sec = document.getElementById('sec-lessons');
  sec.innerHTML = `
    ${classTabsHtml(cls, 'setLessCls')}
    ${subjPillsHtml(subj, 'setLessSubj')}

    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
      <h2 style="font-size:16px; font-weight:800;">الدروس</h2>
      <button class="btn btn-accent btn-sm" onclick="openLessonForm()">
        ${IC.plus} إضافة درس
      </button>
    </div>

    <div id="lessons-list" style="display:flex; flex-direction:column; gap:12px;">
      ${items.length === 0
        ? `<div class="panel" style="padding:20px; text-align:center; color:var(--text-3);">
             لا توجد دروس بعد
           </div>`
        : items.map(l => lessonCard(l)).join('')}
    </div>
  `;

  if (typeof Sortable !== 'undefined') initLessonsDrag();
}

function lessonCard(l) {
  updateLessonStatus(l);
  const s = subjById(l.subj);
  const cl = clsById(l.cls);
  const isDone = l.status === 'done';
  const totalSections = l.sections ? l.sections.length : 0;
  const doneSections = l.sections ? l.sections.filter(sec => sec.done).length : 0;
  const pct = totalSections > 0 ? Math.round(doneSections / totalSections * 100) : (isDone ? 100 : 0);

  return `
    <div class="panel" data-id="${l.id}" style="padding:0; overflow:hidden; border-right:4px solid ${s.color};">
      <div style="padding:14px; display:flex; align-items:center; gap:10px;" onclick="viewLesson('${l.id}')">
        <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
          <div style="width:40px;height:40px;border-radius:10px;background:${s.bg};color:${s.color};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;flex-shrink:0;">
            ${s.short.charAt(0)}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-size:14px; font-weight:800; word-break:break-word; margin-bottom:6px;">${esc(l.title)}</div>
            <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:4px;">
              <span class="badge ${classBadge(l.cls)}" style="font-size:10px;">${cl.short}</span>
              <span class="badge badge-${s.cls}" style="font-size:10px;">${s.short}</span>
              ${l.date ? `<span style="font-size:10px; color:var(--text-3);">${fdate(l.date)}</span>` : ''}
            </div>
            ${totalSections > 0 ? `
              <div style="margin-top:8px;">
                <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-3); margin-bottom:3px;">
                  <span>${doneSections}/${totalSections} فقرة</span>
                  <span>${pct}%</span>
                </div>
                <div class="progress-bar" style="margin:0;">
                  <div class="progress-fill" style="width:${pct}%; background:${isDone ? 'var(--green)' : 'var(--accent)'};"></div>
                </div>
              </div>` : ''}
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;" onclick="event.stopPropagation();">
          <span class="grip">⠿</span>
          ${adminBtns(`event.stopPropagation();openLessonForm('${l.id}')`, `event.stopPropagation();deleteLesson('${l.id}')`)}
        </div>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════
   viewLesson — عرض تفاصيل الدرس (فقرات)
═══════════════════════════════════════════════════════════════ */
function viewLesson(id) {
  currentView = 'detail';
  currentLessonId = id;
  const l = DATA.lessons.find(x => x.id === id);
  if (!l) return;
  updateLessonStatus(l);
  const s = subjById(l.subj);
  const cl = clsById(l.cls);
  const isDone = l.status === 'done';
  const sections = l.sections || [];
  const doneSections = sections.filter(sec => sec.done).length;
  const totalSections = sections.length;
  const pct = totalSections > 0 ? Math.round(doneSections / totalSections * 100) : (isDone ? 100 : 0);

  const sec = document.getElementById('sec-lessons');
  sec.innerHTML = `
    <div style="margin-bottom:14px; cursor:pointer; color:var(--accent); display:flex; align-items:center; gap:4px;" onclick="renderLessons()">
      ${IC.chev} الرجوع للقائمة
    </div>
    <div class="panel" style="padding:14px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
        <div style="width:40px;height:40px;border-radius:10px;background:${s.bg};color:${s.color};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;">${s.short.charAt(0)}</div>
        <div>
          <div style="font-size:16px; font-weight:800;">${esc(l.title)}</div>
          <div style="font-size:12px; color:var(--text-3);">${cl.label} · ${s.label}</div>
        </div>
      </div>
      <div style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
          <span>نسبة الإنجاز</span>
          <span style="font-weight:700; color:${isDone ? 'var(--green)' : 'var(--text-2)'};">${pct}%</span>
        </div>
        <div class="progress-bar" style="margin:0;">
          <div class="progress-fill" style="width:${pct}%; background:${isDone ? 'var(--green)' : 'var(--accent)'};"></div>
        </div>
      </div>

      <div style="display:flex; gap:8px; margin-bottom:16px;">
        <button class="btn btn-outline btn-sm" onclick="openAddSectionSheet('${id}')">${IC.plus} إضافة فقرة</button>
      </div>

      <div id="sections-list" style="display:flex; flex-direction:column;">
        ${sections.length === 0 ? `<div style="text-align:center; color:var(--text-3); padding:20px;">لا توجد فقرات بعد</div>` : ''}
        ${sections.map((sec, i) => `
          <div class="section-row" data-index="${i}">
            <span class="grip" style="margin-left:8px;">⠿</span>
            <div class="checkbox-custom ${sec.done ? 'checked' : ''}" onclick="toggleSectionDone('${id}', ${i})" style="margin-left:8px;"></div>
            <div class="section-title" style="color:${sec.done ? 'var(--green)' : 'var(--text)'};">${esc(sec.title || 'فقرة '+(i+1))}</div>
            <button class="btn-icon danger" style="width:28px;height:28px;" onclick="deleteSection('${id}', ${i})">${IC.trash}</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  if (typeof Sortable !== 'undefined') initSectionsDrag(id);
}

/* ═══════════════════════════════════════════════════════════════
   إضافة فقرة (نافذة منبثقة)
═══════════════════════════════════════════════════════════════ */
function openAddSectionSheet(lessonId) {
  showSheet('إضافة فقرة', `
    <div class="field-row">
      <label>عنوان الفقرة <span class="req">*</span></label>
      <input class="field" id="new-section-title" placeholder="مثلاً: تعريف الدالة">
    </div>
    <input type="hidden" id="new-section-lesson-id" value="${lessonId}">
  `, [
    { label: 'إلغاء', cls: 'btn-outline', fn: 'closeSheet()' },
    { label: 'إضافة', cls: 'btn-accent',  fn: 'addSectionFromSheet()' }
  ]);
}

function addSectionFromSheet() {
  const title = document.getElementById('new-section-title').value.trim();
  const lessonId = document.getElementById('new-section-lesson-id').value;
  if (!title) { toast('أدخل عنوان الفقرة', 'error'); return; }
  const l = DATA.lessons.find(x => x.id === lessonId);
  if (l) {
    if (!l.sections) l.sections = [];
    l.sections.push({ title: title, done: false });
    updateLessonStatus(l);
    save();
    closeSheet();
    viewLesson(lessonId);
  }
}

/* ═══════════════════════════════════════════════════════════════
   دوال التحكم في الفقرات
═══════════════════════════════════════════════════════════════ */
function toggleSectionDone(lessonId, secIndex) {
  const l = DATA.lessons.find(x => x.id === lessonId);
  if (l && l.sections[secIndex]) {
    l.sections[secIndex].done = !l.sections[secIndex].done;
    updateLessonStatus(l);
    save();
    viewLesson(lessonId);
  }
}

function deleteSection(lessonId, secIndex) {
  if (!confirm('حذف هذه الفقرة؟')) return;
  const l = DATA.lessons.find(x => x.id === lessonId);
  if (l && l.sections[secIndex]) {
    l.sections.splice(secIndex, 1);
    updateLessonStatus(l);
    save();
    viewLesson(lessonId);
  }
}

/* ═══════════════════════════════════════════════════════════════
   دوال إدارة الدروس
═══════════════════════════════════════════════════════════════ */
function openLessonForm(id) {
  const l    = id ? DATA.lessons.find(x => x.id === id) : {};
  const cls  = l.cls  || filLess.cls;
  const subj = l.subj || filLess.subj;
  const clsOpts  = CLASSES.map(c => `<option value="${c.id}" ${cls === c.id ? 'selected' : ''}>${c.label}</option>`).join('');
  const subjOpts = SUBJECTS.map(s => `<option value="${s.id}" ${subj === s.id ? 'selected' : ''}>${s.label}</option>`).join('');

  showSheet(id ? 'تعديل درس' : 'إضافة درس جديد', `
    <div class="field-row">
      <label>عنوان الدرس <span class="req">*</span></label>
      <input class="field" id="lf-title" placeholder="اكتب عنوان الدرس" value="${esc(l.title || '')}">
    </div>
    <div class="field-grid-2">
      <div class="field-row">
        <label>المادة</label>
        <select class="field" id="lf-subj">${subjOpts}</select>
      </div>
      <div class="field-row">
        <label>القسم</label>
        <select class="field" id="lf-cls">${clsOpts}</select>
      </div>
    </div>
    <div class="field-row">
      <label>التاريخ</label>
      <input class="field" type="date" id="lf-date" value="${l.date || today()}">
    </div>
    <input type="hidden" id="lf-id" value="${id || ''}">
  `, [
    { label: 'إلغاء', cls: 'btn-outline', fn: 'closeSheet()' },
    { label: 'حفظ',   cls: 'btn-accent',  fn: 'saveLessonForm()' }
  ]);
}

function saveLessonForm() {
  const id    = document.getElementById('lf-id').value;
  const title = document.getElementById('lf-title').value.trim();
  if (!title) { toast('أدخل عنوان الدرس', 'error'); return; }

  const obj = {
    cls:  document.getElementById('lf-cls').value,
    subj: document.getElementById('lf-subj').value,
    title: title,
    date:  document.getElementById('lf-date').value,
  };

  if (id) {
    const existing = DATA.lessons.find(x => x.id === id);
    if (existing) {
      Object.assign(existing, obj);
      updateLessonStatus(existing);
    }
  } else {
    DATA.lessons.push({ id: uid(), sections: [], status: 'planned', ...obj });
  }
  save(); closeSheet(); toast('تم الحفظ', 'success'); renderLessons();
}

function deleteLesson(id) {
  if (!confirm('حذف هذا الدرس؟')) return;
  DATA.lessons = DATA.lessons.filter(l => l.id !== id);
  save(); toast('تم الحذف'); renderLessons();
}

function updateLessonStatus(lesson) {
  if (!lesson.sections || lesson.sections.length === 0) {
    lesson.status = 'planned';
    return;
  }
  const allDone = lesson.sections.every(sec => sec.done === true);
  lesson.status = allDone ? 'done' : 'planned';
}

/* ═══════════════════════════════════════════════════════════════
   السحب والإفلات (SortableJS)
═══════════════════════════════════════════════════════════════ */

function initLessonsDrag() {
  const list = document.getElementById('lessons-list');
  if (!list) return;
  if (window.lessonsSortable) window.lessonsSortable.destroy();
  window.lessonsSortable = new Sortable(list, {
    animation: 200,
    handle: '.grip',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd: function(evt) {
      const id = evt.item.getAttribute('data-id');
      const oldIndex = evt.oldIndex;
      const newIndex = evt.newIndex;
      if (oldIndex !== newIndex && id) {
        const movedLesson = DATA.lessons.find(l => l.id === id);
        if (movedLesson) {
          const remaining = DATA.lessons.filter(l => l.id !== id);
          remaining.splice(newIndex, 0, movedLesson);
          // إعادة ترتيب المصفوفة الأساسية حسب القائمة الجديدة
          const mainList = DATA.lessons;
          mainList.sort((a, b) => {
            const indexA = remaining.indexOf(a);
            const indexB = remaining.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
          });
          save();
        }
      }
    }
  });
}

function initSectionsDrag(lessonId) {
  const list = document.getElementById('sections-list');
  if (!list) return;
  if (window.sectionsSortable) window.sectionsSortable.destroy();
  window.sectionsSortable = new Sortable(list, {
    animation: 200,
    handle: '.grip',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd: function(evt) {
      const oldIndex = evt.oldIndex;
      const newIndex = evt.newIndex;
      if (oldIndex !== newIndex) {
        const l = DATA.lessons.find(x => x.id === lessonId);
        if (l && l.sections) {
          const moved = l.sections.splice(oldIndex, 1)[0];
          l.sections.splice(newIndex, 0, moved);
          save();
          viewLesson(lessonId);
        }
      }
    }
  });
}

/* ── دوال مساعدة للفلاتر (مطلوبة من router.js) ───────────── */
function setLessCls(cls)   { filLess.cls  = cls; renderLessons(); }
function setLessSubj(subj) { filLess.subj = subj; renderLessons(); }