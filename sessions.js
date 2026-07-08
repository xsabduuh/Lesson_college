/* =================================================================
   SESSIONS (التخطيط الزمني)
================================================================= */
function renderSessions(){
  const cls=filSess.cls;
  const subj=filSess.subj;
  const s=subjById(subj);
  const sessions=DATA.sessions.filter(x=>x.cls===cls&&x.subj===subj).sort((a,b)=>a.date>b.date?1:-1);
  const upcoming=sessions.filter(x=>x.date>=today());
  const past=sessions.filter(x=>x.date<today());
  const sec=document.getElementById('sec-sessions');
  sec.innerHTML=`
    ${classTabsHtml(cls,"setSessCls")}
    ${subjPillsHtml(subj,"setSessSubj")}
    ${upcoming.length>0?`
      <div class="section-header"><h2>الحصص القادمة</h2><span class="count-badge">${upcoming.length}</span></div>
      ${upcoming.map(x=>sessionCardHtml(x,s)).join('')}`:''}
    ${past.length>0?`
      <div class="section-header" style="margin-top:6px"><h2>الحصص السابقة</h2><span class="count-badge">${past.length}</span></div>
      ${past.slice().reverse().map(x=>sessionCardHtml(x,s)).join('')}`:''}
    ${sessions.length===0?`<div class="panel">${emptyHtml('لا توجد حصص','خطط لحصتك القادمة باستخدام الزر أسفله')}</div>`:''}
  `;
  sec.querySelectorAll('.session-card-head').forEach(h=>{
    h.addEventListener('click',()=>h.parentElement.classList.toggle('open'));
  });
}
function sessionCardHtml(x,s){
  const isPast=x.date<today();
  return `<div class="session-card" data-id="${x.id}">
    <div class="session-card-head">
      <div class="session-date-badge">${fdate(x.date)} ${x.time||''}</div>
      <div style="flex:1;margin:0 8px;min-width:0">
        <div style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.title)}</div>
        <div style="font-size:11px;color:var(--text-3)">${esc(x.lesson||'')}</div>
      </div>
      <span class="badge ${isPast?'badge-gray':'badge-blue'}">${isPast?'منتهية':'قادمة'}</span>
      <span style="margin-right:6px;color:var(--text-3)">${IC.chevDown}</span>
    </div>
    <div class="session-card-body">
      ${x.lesson?`<div style="margin:10px 0 6px"><span class="badge badge-${s.cls}">الدرس</span> <span style="font-size:13px;margin-right:6px">${esc(x.lesson)}</span></div>`:''}
      ${x.exercises?`<div style="margin-bottom:6px"><span class="badge badge-amber">التمارين</span> <span style="font-size:13px;margin-right:6px">${esc(x.exercises)}</span></div>`:''}
      ${x.homework?`<div style="margin-bottom:6px"><span class="badge badge-red">الفرض</span> <span style="font-size:13px;margin-right:6px">${esc(x.homework)}</span></div>`:''}
      ${x.notes?`<div style="font-size:12px;color:var(--text-3);margin-top:8px;padding:8px 10px;background:var(--surface-2);border-radius:8px">${esc(x.notes)}</div>`:''}
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn btn-outline btn-sm" style="flex:1" onclick="openSessionForm('${x.id}')">${IC.edit} تعديل</button>
        <button class="btn btn-danger btn-sm" onclick="deleteSession('${x.id}')">${IC.trash}</button>
      </div>
    </div>
  </div>`;
}
function setSessCls(cls){ filSess.cls=cls; renderSessions(); }
function setSessSubj(subj){ filSess.subj=subj; renderSessions(); }
function openSessionForm(id){
  const x=id?DATA.sessions.find(s=>s.id===id):{};
  const cls=x.cls||filSess.cls;
  const subj=x.subj||filSess.subj;
  const clsOpts=CLASSES.map(c=>`<option value="${c.id}" ${cls===c.id?'selected':''}>${c.label}</option>`).join('');
  const subjOpts=SUBJECTS.map(s=>`<option value="${s.id}" ${subj===s.id?'selected':''}>${s.label}</option>`).join('');
  showSheet(id?'تعديل حصة':'تخطيط حصة جديدة',`
    <div class="field-grid-2">
      <div class="field-row"><label>القسم <span class="req">*</span></label><select class="field" id="xf-cls">${clsOpts}</select></div>
      <div class="field-row"><label>المادة <span class="req">*</span></label><select class="field" id="xf-subj">${subjOpts}</select></div>
    </div>
    <div class="field-row"><label>عنوان الحصة <span class="req">*</span></label>
      <input class="field" id="xf-title" placeholder="موضوع الحصة" value="${esc(x.title||'')}"></div>
    <div class="field-grid-2">
      <div class="field-row"><label>التاريخ</label><input class="field" type="date" id="xf-date" value="${x.date||today()}"></div>
      <div class="field-row"><label>الوقت</label><input class="field" type="time" id="xf-time" value="${x.time||''}"></div>
    </div>
    <div class="field-row"><label>الدرس المقرر تدريسه</label>
      <input class="field" id="xf-lesson" placeholder="عنوان الدرس" value="${esc(x.lesson||'')}"></div>
    <div class="field-row"><label>التمارين المخططة</label>
      <textarea class="field" id="xf-exercises" style="min-height:60px" placeholder="تمارين الحصة">${esc(x.exercises||'')}</textarea></div>
    <div class="field-row"><label>الفرض (إن وجد)</label>
      <input class="field" id="xf-homework" placeholder="عنوان الفرض" value="${esc(x.homework||'')}"></div>
    <div class="field-row"><label>ملاحظات</label>
      <textarea class="field" id="xf-notes" style="min-height:60px">${esc(x.notes||'')}</textarea></div>
    <input type="hidden" id="xf-id" value="${id||''}">
  `,[
    {label:'إلغاء',cls:'btn-outline',fn:'closeSheet()'},
    {label:'حفظ',cls:'btn-accent',fn:'saveSession()'}
  ]);
}
function saveSession(){
  const id=document.getElementById('xf-id').value;
  const title=document.getElementById('xf-title').value.trim();
  if(!title){toast('أدخل عنوان الحصة','error');return;}
  const obj={
    cls:document.getElementById('xf-cls').value,
    subj:document.getElementById('xf-subj').value,
    title,date:document.getElementById('xf-date').value,
    time:document.getElementById('xf-time').value,
    lesson:document.getElementById('xf-lesson').value.trim(),
    exercises:document.getElementById('xf-exercises').value.trim(),
    homework:document.getElementById('xf-homework').value.trim(),
    notes:document.getElementById('xf-notes').value.trim()
  };
  if(id){ Object.assign(DATA.sessions.find(s=>s.id===id),obj); }
  else { DATA.sessions.push({id:uid(),...obj}); }
  save();closeSheet();toast('تم الحفظ','success');renderSessions();
}
function deleteSession(id){
  if(!confirm('حذف هذه الحصة؟'))return;
  DATA.sessions=DATA.sessions.filter(s=>s.id!==id);
  save();toast('تم الحذف');renderSessions();
}