/* =================================================================
   HOMEWORK (الفروض)
================================================================= */
function renderHomework(){
  const cls=filHW.cls;
  const subj=filHW.subj;
  const items=DATA.homework.filter(h=>h.cls===cls&&h.subj===subj)
    .sort((a,b)=>a.dueDate>b.dueDate?1:-1);
  const s=subjById(subj);
  const sec=document.getElementById('sec-homework');
  sec.innerHTML=`
    ${classTabsHtml(cls,"setHWCls")}
    ${subjPillsHtml(subj,"setHWSubj")}
    <div class="section-header">
      <h2>فروض ${s.label}</h2>
      <span class="count-badge">${items.length}</span>
    </div>
    <div class="panel">
      ${items.length===0
        ? emptyHtml('لا توجد فروض','أضف فرضاً باستخدام الزر أسفله')
        : items.map(h=>{
            const overdue=h.dueDate&&h.dueDate<today();
            return `<div class="card-item">
              <div class="card-item-icon" style="background:${s.bg};color:${s.color}">${IC.clip}</div>
              <div class="card-item-body">
                <div class="card-item-title">${esc(h.title)}</div>
                <div class="card-item-sub">تسليم: ${fdate(h.dueDate||'')} ${overdue?'<span class="badge badge-red" style="font-size:10px">متأخر</span>':''}</div>
                ${h.content?`<div style="font-size:12px;color:var(--text-3);margin-top:3px">${esc(h.content.slice(0,80))}${h.content.length>80?'…':''}</div>`:''}
              </div>
              <div class="admin-actions">
                <button class="btn-icon accent" onclick="openHomeworkForm('${h.id}')">${IC.edit}</button>
                <button class="btn-icon danger"  onclick="deleteHomework('${h.id}')">${IC.trash}</button>
              </div>
            </div>`;}).join('')}
    </div>`;
}
function setHWCls(cls){ filHW.cls=cls; renderHomework(); }
function setHWSubj(subj){ filHW.subj=subj; renderHomework(); }
function openHomeworkForm(id){
  const h=id?DATA.homework.find(x=>x.id===id):{};
  const cls=h.cls||filHW.cls;
  const subj=h.subj||filHW.subj;
  const clsOpts=CLASSES.map(c=>`<option value="${c.id}" ${cls===c.id?'selected':''}>${c.label}</option>`).join('');
  const subjOpts=SUBJECTS.map(s=>`<option value="${s.id}" ${subj===s.id?'selected':''}>${s.label}</option>`).join('');
  showSheet(id?'تعديل فرض':'إضافة فرض جديد',`
    <div class="field-grid-2">
      <div class="field-row"><label>القسم</label><select class="field" id="hf-cls">${clsOpts}</select></div>
      <div class="field-row"><label>المادة</label><select class="field" id="hf-subj">${subjOpts}</select></div>
    </div>
    <div class="field-row"><label>عنوان الفرض <span class="req">*</span></label>
      <input class="field" id="hf-title" placeholder="عنوان الفرض" value="${esc(h.title||'')}"></div>
    <div class="field-grid-2">
      <div class="field-row"><label>تاريخ الإعطاء</label>
        <input class="field" type="date" id="hf-date" value="${h.date||today()}"></div>
      <div class="field-row"><label>تاريخ التسليم</label>
        <input class="field" type="date" id="hf-due" value="${h.dueDate||''}"></div>
    </div>
    <div class="field-row"><label>وصف الفرض</label>
      <textarea class="field" id="hf-content" style="min-height:80px" placeholder="تعليمات وتفاصيل الفرض">${esc(h.content||'')}</textarea></div>
    <input type="hidden" id="hf-id" value="${id||''}">
  `,[
    {label:'إلغاء',cls:'btn-outline',fn:'closeSheet()'},
    {label:'حفظ',cls:'btn-accent',fn:'saveHomework()'}
  ]);
}
function saveHomework(){
  const id=document.getElementById('hf-id').value;
  const title=document.getElementById('hf-title').value.trim();
  if(!title){toast('أدخل عنوان الفرض','error');return;}
  const obj={
    cls:document.getElementById('hf-cls').value,
    subj:document.getElementById('hf-subj').value,
    title,date:document.getElementById('hf-date').value,
    dueDate:document.getElementById('hf-due').value,
    content:document.getElementById('hf-content').value.trim()
  };
  if(id){ Object.assign(DATA.homework.find(x=>x.id===id),obj); }
  else { DATA.homework.push({id:uid(),...obj}); }
  save();closeSheet();toast('تم الحفظ','success');renderHomework();
}
function deleteHomework(id){
  if(!confirm('حذف هذا الفرض؟'))return;
  DATA.homework=DATA.homework.filter(h=>h.id!==id);
  save();toast('تم الحذف');renderHomework();
}