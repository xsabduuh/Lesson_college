/* =================================================================
   LESSONS (الدروس) – Accordion Cards
================================================================= */
function renderLessons(){
  const cls=filLess.cls;
  const subj=filLess.subj;
  const items=DATA.lessons.filter(l=>l.cls===cls&&l.subj===subj).slice().reverse();
  const s=subjById(subj);
  const sec=document.getElementById('sec-lessons');
  sec.innerHTML=`
    ${classTabsHtml(cls,"setLessCls")}
    ${subjPillsHtml(subj,"setLessSubj")}
    <div class="section-header">
      <h2>دروس ${s.label}</h2>
      <span class="count-badge">${items.length}</span>
    </div>
    ${items.length===0?`<div class="panel">${emptyHtml('لا توجد دروس','أضف درساً باستخدام الزر أسفله')}</div>`
    :items.map((l,i)=>lessonCardHtml(l,s,i+1)).join('')}`;
  sec.querySelectorAll('.lesson-card-head').forEach(h=>{
    h.addEventListener('click',e=>{
      if(e.target.closest('button')) return;
      h.parentElement.classList.toggle('open');
    });
  });
}
function lessonCardHtml(l,s,num){
  return `<div class="lesson-card" data-id="${l.id}">
    <div class="lesson-card-head">
      <div style="width:38px;height:38px;border-radius:11px;background:${s.bg};color:${s.color};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;flex-shrink:0">${num}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700">${esc(l.title)}</div>
        <div style="font-size:11px;color:var(--text-3);margin-top:2px">
          ${l.unit?`<span class="badge badge-gray" style="margin-left:4px">${esc(l.unit)}</span>`:''}
          ${l.semester?`<span class="badge badge-${s.cls}">${esc(l.semester)}</span>`:''}
          ${l.date?fdate(l.date):''}
        </div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        ${adminBtns(`event.stopPropagation();openLessonForm('${l.id}')`,`event.stopPropagation();deleteLesson('${l.id}')`)}
        <span style="color:var(--text-3)">${IC.chevDown}</span>
      </div>
    </div>
    <div class="lesson-card-body">
      ${l.summary?`<div class="lesson-section"><div class="lesson-section-title">ملخص الدرس</div><div class="lesson-content">${esc(l.summary)}</div></div>`:''}
      ${l.objectives?`<div class="lesson-section"><div class="lesson-section-title">الأهداف التعليمية</div><div class="lesson-content">${esc(l.objectives)}</div></div>`:''}
      ${l.terms?`<div class="lesson-section"><div class="lesson-section-title">المصطلحات الأساسية</div><div class="lesson-content">${esc(l.terms)}</div></div>`:''}
      ${l.content?`<div class="lesson-section"><div class="lesson-section-title">المحتوى التفصيلي</div><div class="lesson-content">${esc(l.content)}</div></div>`:''}
      ${l.notes?`<div class="lesson-section"><div class="lesson-section-title">ملاحظات</div><div class="lesson-content" style="border-right:3px solid var(--amber);background:var(--amber-light)">${esc(l.notes)}</div></div>`:''}
    </div>
  </div>`;
}
function setLessCls(cls){ filLess.cls=cls; renderLessons(); }
function setLessSubj(subj){ filLess.subj=subj; renderLessons(); }
function openLessonForm(id){
  const l=id?DATA.lessons.find(x=>x.id===id):{};
  const cls=l.cls||filLess.cls;
  const subj=l.subj||filLess.subj;
  const clsOpts=CLASSES.map(c=>`<option value="${c.id}" ${cls===c.id?'selected':''}>${c.label}</option>`).join('');
  const subjOpts=SUBJECTS.map(s=>`<option value="${s.id}" ${subj===s.id?'selected':''}>${s.label}</option>`).join('');
  const semOpts=['الدورة الأولى','الدورة الثانية','الدورة الثالثة'].map(v=>
    `<option value="${v}" ${l.semester===v?'selected':''}>${v}</option>`).join('');
  showSheet(id?'تعديل درس':'إضافة درس جديد',`
    <div class="field-grid-2">
      <div class="field-row"><label>القسم</label><select class="field" id="lf-cls">${clsOpts}</select></div>
      <div class="field-row"><label>المادة</label><select class="field" id="lf-subj">${subjOpts}</select></div>
    </div>
    <div class="field-row"><label>عنوان الدرس <span class="req">*</span></label>
      <input class="field" id="lf-title" placeholder="عنوان الدرس الكامل" value="${esc(l.title||'')}"></div>
    <div class="field-grid-2">
      <div class="field-row"><label>الوحدة</label>
        <input class="field" id="lf-unit" placeholder="الوحدة أو الفصل" value="${esc(l.unit||'')}"></div>
      <div class="field-row"><label>الدورة</label>
        <select class="field" id="lf-semester"><option value="">—</option>${semOpts}</select></div>
    </div>
    <div class="field-row"><label>التاريخ</label>
      <input class="field" type="date" id="lf-date" value="${l.date||today()}"></div>
    <div class="field-row"><label>ملخص الدرس</label>
      <textarea class="field" id="lf-summary" style="min-height:70px" placeholder="ملخص موجز للدرس">${esc(l.summary||'')}</textarea></div>
    <div class="field-row"><label>الأهداف التعليمية</label>
      <textarea class="field" id="lf-objectives" style="min-height:60px" placeholder="ما يجب على التلميذ تحقيقه">${esc(l.objectives||'')}</textarea></div>
    <div class="field-row"><label>المصطلحات الأساسية</label>
      <textarea class="field" id="lf-terms" style="min-height:60px" placeholder="المصطلحات الأساسية للدرس">${esc(l.terms||'')}</textarea></div>
    <div class="field-row"><label>محتوى الدرس التفصيلي</label>
      <textarea class="field" id="lf-content" style="min-height:80px">${esc(l.content||'')}</textarea></div>
    <div class="field-row"><label>ملاحظات</label>
      <textarea class="field" id="lf-notes" style="min-height:50px">${esc(l.notes||'')}</textarea></div>
    <input type="hidden" id="lf-id" value="${id||''}">
  `,[
    {label:'إلغاء',cls:'btn-outline',fn:'closeSheet()'},
    {label:'حفظ',cls:'btn-accent',fn:'saveLesson()'}
  ]);
}
function saveLesson(){
  const id=document.getElementById('lf-id').value;
  const title=document.getElementById('lf-title').value.trim();
  if(!title){toast('أدخل عنوان الدرس','error');return;}
  const obj={
    cls:document.getElementById('lf-cls').value,
    subj:document.getElementById('lf-subj').value,
    title,
    unit:document.getElementById('lf-unit').value.trim(),
    semester:document.getElementById('lf-semester').value,
    date:document.getElementById('lf-date').value,
    summary:document.getElementById('lf-summary').value.trim(),
    objectives:document.getElementById('lf-objectives').value.trim(),
    terms:document.getElementById('lf-terms').value.trim(),
    content:document.getElementById('lf-content').value.trim(),
    notes:document.getElementById('lf-notes').value.trim()
  };
  if(id){ Object.assign(DATA.lessons.find(x=>x.id===id),obj); }
  else { DATA.lessons.push({id:uid(),...obj}); }
  save();closeSheet();toast('تم الحفظ','success');renderLessons();
}
function deleteLesson(id){
  if(!confirm('حذف هذا الدرس؟'))return;
  DATA.lessons=DATA.lessons.filter(l=>l.id!==id);
  save();toast('تم الحذف');renderLessons();
}