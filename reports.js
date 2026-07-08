/* =================================================================
   GLOSSARY (المصطلحات)
================================================================= */
function renderGlossary(){
  const subj=filGloss.subj;
  const items=DATA.glossary.filter(t=>t.subj===subj||!subj).slice().reverse();
  const sec=document.getElementById('sec-glossary');
  sec.innerHTML=`
    ${subjPillsHtml(subj,"setGlossSubj",true)}
    <div class="section-header">
      <h2>المصطلحات</h2>
      <span class="count-badge">${items.length}</span>
    </div>
    ${items.length===0?`<div class="panel">${emptyHtml('لا توجد مصطلحات','أضف مصطلحاً باستخدام الزر أسفله')}</div>`
    :items.map(t=>{
        const s=subjById(t.subj);
        return `<div class="term-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div class="term-word">${esc(t.word)}</div>
            <div class="admin-actions">
              <button class="btn-icon accent" onclick="openGlossaryForm('${t.id}')">${IC.edit}</button>
              <button class="btn-icon danger"  onclick="deleteGlossary('${t.id}')">${IC.trash}</button>
            </div>
          </div>
          ${t.wordFr?`<div style="font-size:13px;color:var(--accent);font-style:italic;margin-bottom:4px">${esc(t.wordFr)}</div>`:''}
          <div class="term-def">${esc(t.definition)}</div>
          <div class="term-tags">
            <span class="badge badge-${s.cls}">${s.short}</span>
            ${t.unit?`<span class="badge badge-gray">${esc(t.unit)}</span>`:''}
          </div>
        </div>`;}).join('')}`;
}
function setGlossSubj(subj){ filGloss.subj=subj; renderGlossary(); }
function openGlossaryForm(id){
  const t=id?DATA.glossary.find(x=>x.id===id):{};
  const subjOpts=SUBJECTS.map(s=>`<option value="${s.id}" ${(t.subj||'math')===s.id?'selected':''}>${s.label}</option>`).join('');
  showSheet(id?'تعديل مصطلح':'إضافة مصطلح جديد',`
    <div class="field-row"><label>المصطلح بالعربية <span class="req">*</span></label>
      <input class="field" id="tf-word" value="${esc(t.word||'')}"></div>
    <div class="field-row"><label>المصطلح بالفرنسية</label>
      <input class="field" id="tf-wordfr" value="${esc(t.wordFr||'')}"></div>
    <div class="field-row"><label>التعريف <span class="req">*</span></label>
      <textarea class="field" id="tf-def" style="min-height:80px">${esc(t.definition||'')}</textarea></div>
    <div class="field-grid-2">
      <div class="field-row"><label>المادة</label><select class="field" id="tf-subj">${subjOpts}</select></div>
      <div class="field-row"><label>الوحدة</label><input class="field" id="tf-unit" value="${esc(t.unit||'')}"></div>
    </div>
    <input type="hidden" id="tf-id" value="${id||''}">
  `,[
    {label:'إلغاء',cls:'btn-outline',fn:'closeSheet()'},
    {label:'حفظ',cls:'btn-accent',fn:'saveGlossary()'}
  ]);
}
function saveGlossary(){
  const id=document.getElementById('tf-id').value;
  const word=document.getElementById('tf-word').value.trim();
  const def=document.getElementById('tf-def').value.trim();
  if(!word||!def){toast('أدخل المصطلح والتعريف','error');return;}
  const obj={word,wordFr:document.getElementById('tf-wordfr').value.trim(),
    definition:def,
    subj:document.getElementById('tf-subj').value,
    unit:document.getElementById('tf-unit').value.trim()};
  if(id){ Object.assign(DATA.glossary.find(x=>x.id===id),obj); }
  else { DATA.glossary.push({id:uid(),...obj}); }
  save();closeSheet();toast('تم الحفظ','success');renderGlossary();
}
function deleteGlossary(id){
  if(!confirm('حذف هذا المصطلح؟'))return;
  DATA.glossary=DATA.glossary.filter(t=>t.id!==id);
  save();toast('تم الحذف');renderGlossary();
}