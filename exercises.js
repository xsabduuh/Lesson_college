/* =================================================================
   EXERCISES (التمارين)
================================================================= */
function renderExercises(){
  const cls=filExer.cls;
  const subj=filExer.subj;
  const items=DATA.exercises.filter(e=>e.cls===cls&&e.subj===subj).slice().reverse();
  const s=subjById(subj);
  const byLevel={
    'سهل':items.filter(e=>e.level==='سهل'),
    'متوسط':items.filter(e=>e.level==='متوسط'),
    'صعب':items.filter(e=>e.level==='صعب'),
    'تحدٍّ':items.filter(e=>e.level==='تحدٍّ'),
    'أخرى':items.filter(e=>!['سهل','متوسط','صعب','تحدٍّ'].includes(e.level))
  };
  const sec=document.getElementById('sec-exercises');
  let num=0;
  sec.innerHTML=`
    ${classTabsHtml(cls,"setExerCls")}
    ${subjPillsHtml(subj,"setExerSubj")}
    <div class="section-header">
      <h2>تمارين ${s.label}</h2>
      <span class="count-badge">${items.length}</span>
    </div>
    ${items.length===0?`<div class="panel">${emptyHtml('لا توجد تمارين','أضف تمريناً باستخدام الزر أسفله')}</div>`
    :Object.entries(byLevel).filter(([,v])=>v.length>0).map(([level,exs])=>`
      <div style="margin-bottom:4px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span class="badge ${LEVEL_COLORS[level]||'badge-gray'}" style="font-size:12px;padding:4px 12px">${level}</span>
          <span class="count-badge">${exs.length}</span>
        </div>
        ${exs.map(e=>{
          num++;
          return exerciseCardHtml(e,s,num);
        }).join('')}
      </div>`).join('')}
  `;
}
function exerciseCardHtml(e,s,num){
  return `<div class="ex-card" data-id="${e.id}">
    <div class="ex-card-head">
      <div class="ex-num">${num}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700">${esc(e.title)}</div>
        <div style="font-size:12px;color:var(--text-3);margin-top:2px">${fdate(e.date)}${e.level?` · <span class="badge ${LEVEL_COLORS[e.level]||'badge-gray'}">${esc(e.level)}</span>`:''}</div>
        ${e.content?`<div style="font-size:13px;color:var(--text-2);margin-top:8px;line-height:1.6">${esc(e.content)}</div>`:''}
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          ${e.solution?`<button class="btn btn-outline btn-sm" onclick="toggleSolution('${e.id}')" id="sol-btn-${e.id}">${IC.eye} إظهار الحل</button>`:''}
          ${adminBtns(`openExerciseForm('${e.id}')`,`deleteExercise('${e.id}')`)}
        </div>
      </div>
    </div>
    ${e.solution?`<div class="ex-solution" id="sol-${e.id}">
      <div style="font-size:11px;font-weight:800;color:var(--green);margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px">الحل</div>
      <div style="font-size:13px;color:var(--text-2);line-height:1.7">${esc(e.solution)}</div>
    </div>`:''}
  </div>`;
}
function toggleSolution(id){
  const sol=document.getElementById('sol-'+id);
  const btn=document.getElementById('sol-btn-'+id);
  if(!sol)return;
  const showing=sol.classList.toggle('show');
  if(btn) btn.innerHTML=showing?`${IC.eyeOff} إخفاء الحل`:`${IC.eye} إظهار الحل`;
}
function setExerCls(cls){ filExer.cls=cls; renderExercises(); }
function setExerSubj(subj){ filExer.subj=subj; renderExercises(); }
function openExerciseForm(id){
  const e=id?DATA.exercises.find(x=>x.id===id):{};
  const cls=e.cls||filExer.cls;
  const subj=e.subj||filExer.subj;
  const clsOpts=CLASSES.map(c=>`<option value="${c.id}" ${cls===c.id?'selected':''}>${c.label}</option>`).join('');
  const subjOpts=SUBJECTS.map(s=>`<option value="${s.id}" ${subj===s.id?'selected':''}>${s.label}</option>`).join('');
  const levOpts=['','سهل','متوسط','صعب','تحدٍّ'].map(l=>`<option value="${l}" ${(e.level||'')===l?'selected':''}>${l||'غير محدد'}</option>`).join('');
  showSheet(id?'تعديل تمرين':'إضافة تمرين جديد',`
    <div class="field-grid-2">
      <div class="field-row"><label>القسم</label><select class="field" id="ef-cls">${clsOpts}</select></div>
      <div class="field-row"><label>المادة</label><select class="field" id="ef-subj">${subjOpts}</select></div>
    </div>
    <div class="field-row"><label>عنوان التمرين <span class="req">*</span></label>
      <input class="field" id="ef-title" placeholder="عنوان التمرين" value="${esc(e.title||'')}"></div>
    <div class="field-grid-2">
      <div class="field-row"><label>المستوى</label><select class="field" id="ef-level">${levOpts}</select></div>
      <div class="field-row"><label>التاريخ</label><input class="field" type="date" id="ef-date" value="${e.date||today()}"></div>
    </div>
    <div class="field-row"><label>نص التمرين</label>
      <textarea class="field" id="ef-content" style="min-height:100px" placeholder="نص التمرين أو السؤال...">${esc(e.content||'')}</textarea></div>
    <div class="field-row"><label>الحل (اختياري)</label>
      <textarea class="field" id="ef-solution" style="min-height:80px" placeholder="الحل المقترح...">${esc(e.solution||'')}</textarea></div>
    <input type="hidden" id="ef-id" value="${id||''}">
  `,[
    {label:'إلغاء',cls:'btn-outline',fn:'closeSheet()'},
    {label:'حفظ',cls:'btn-accent',fn:'saveExercise()'}
  ]);
}
function saveExercise(){
  const id=document.getElementById('ef-id').value;
  const title=document.getElementById('ef-title').value.trim();
  if(!title){toast('أدخل عنوان التمرين','error');return;}
  const obj={
    cls:document.getElementById('ef-cls').value,
    subj:document.getElementById('ef-subj').value,
    title,level:document.getElementById('ef-level').value,
    date:document.getElementById('ef-date').value,
    content:document.getElementById('ef-content').value.trim(),
    solution:document.getElementById('ef-solution').value.trim()
  };
  if(id){ Object.assign(DATA.exercises.find(x=>x.id===id),obj); }
  else { DATA.exercises.push({id:uid(),...obj}); }
  save();closeSheet();toast('تم الحفظ','success');renderExercises();
}
function deleteExercise(id){
  if(!confirm('حذف هذا التمرين؟'))return;
  DATA.exercises=DATA.exercises.filter(e=>e.id!==id);
  save();toast('تم الحذف');renderExercises();
}