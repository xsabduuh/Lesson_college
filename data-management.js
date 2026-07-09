/* =================================================================
   DATA MANAGEMENT
================================================================= */
function renderData(){
  const counts={
    students:DATA.students.length,sessions:DATA.sessions.length,
    grades:DATA.grades.length,attendance:DATA.attendance.length,
    lessons:DATA.lessons.length,exercises:DATA.exercises.length,
    homework:DATA.homework.length,payments:DATA.payments.length,
    glossary:DATA.glossary.length,
  };
  const total=JSON.stringify(DATA).length;
  const sec=document.getElementById('sec-data');
  sec.innerHTML=`
    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">ملخص البيانات</div>
      ${Object.entries({
        'التلاميذ':counts.students,'الحصص':counts.sessions,'النقاط':counts.grades,
        'سجلات الحضور':counts.attendance,'الدروس':counts.lessons,'التمارين':counts.exercises,
        'الفروض':counts.homework,'الأداءات':counts.payments,'المصطلحات':counts.glossary
      }).map(([k,v])=>`<div class="data-row"><span class="key">${k}</span><span class="val">${v}</span></div>`).join('')}
      <div class="data-row"><span class="key">حجم البيانات</span><span class="val" style="font-family:var(--mono)">${(total/1024).toFixed(1)} KB</span></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <button class="btn btn-accent btn-full" onclick="exportData()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        تصدير البيانات (JSON)
      </button>
      <button class="btn btn-outline btn-full" onclick="document.getElementById('import-input').click()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        استيراد من ملف JSON
      </button>
      <button class="btn btn-danger btn-full" onclick="resetData()">
        ${IC.trash} حذف جميع البيانات
      </button>
    </div>`;
}
function exportData(){
  const blob=new Blob([JSON.stringify(DATA,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`tutor-backup-${today()}.json`;
  a.click();
  toast('تم التصدير بنجاح','success');
}
document.getElementById('import-input').addEventListener('change',function(){
  const f=this.files[0];if(!f)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const parsed=JSON.parse(e.target.result);
      if(!parsed.students)throw new Error('ملف غير صالح');
      DATA={...defaultData(),...parsed,settings:{...defaultData().settings,...(parsed.settings||{})}};
      save();applySettings();toast('تم الاستيراد بنجاح','success');navigate('dashboard');
    }catch(err){toast('خطأ في الملف: '+err.message,'error');}
  };
  reader.readAsText(f);
  this.value='';
});
function resetData(){
  if(!confirm('هذا سيحذف جميع البيانات نهائياً. هل أنت متأكد؟'))return;
  if(!confirm('تأكيد ثانٍ: سيتم حذف كل البيانات بشكل دائم؟'))return;
  const settings=DATA.settings;
  DATA=defaultData();
  DATA.settings=settings;
  save();toast('تم مسح البيانات');navigate('dashboard');
}