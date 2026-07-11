/* =================================================================
   STUDENTS
================================================================= */

function renderStudents(){
  const cls=filStud.cls;
  const q=(filStud.q||'').toLowerCase();
  let list=studentsOf(cls);
  list = list.filter(s => s && s.name && s.name.trim() !== '');
  if(q) list=list.filter(s=>s.name.toLowerCase().includes(q)||(s.phone||'').includes(q));
  const sec=document.getElementById('sec-students');
  sec.innerHTML=`
    ${classTabsHtml(cls,"setStudCls")}
    <div class="search-bar">
      ${IC.search}
      <input id="stud-search" placeholder="بحث بالاسم أو الهاتف..." value="${esc(filStud.q||'')}"
        oninput="filterStudents(this.value)">
      ${filStud.q?`<button onclick="filterStudents('')" style="color:var(--text-3)">✕</button>`:''}
    </div>
    <div class="section-header">
      <h2>تلاميذ ${clsById(cls).label}</h2>
      <span class="count-badge" id="student-count">${list.length}</span>
    </div>
    <div class="panel" id="student-list-container">
      ${studentListHTML(list)}
    </div>`;
}

function studentListHTML(list){
  list = list.filter(s => s && s.name && s.name.trim() !== '');
  if(list.length===0){
    const q=filStud.q||'';
    return emptyHtml(q?'لا نتائج':'لا يوجد تلاميذ',q?'جرب كلمة بحث أخرى':'أضف تلميذاً باستخدام الزر أسفله');
  }
  return list.map((s,i)=>`
    <div class="card-item" onclick="navigate('student-detail','${s.id}')">
      <div class="card-item-icon" style="background:${classBg(s.cls)};color:${classColor(s.cls)}">
        <span style="font-size:17px;font-weight:800;font-family:var(--mono)">${i+1}</span>
      </div>
      <div class="card-item-body">
        <div class="card-item-title">${esc(s.name)}</div>
        <div class="card-item-sub">${s.phone?esc(s.phone):'لا يوجد هاتف'} ${s.status?`· <span style="color:${s.status==='نشط'?'var(--green)':'var(--danger)'}">${esc(s.status)}</span>`:''}</div>
      </div>
      <div class="card-item-actions">
        ${DATA.settings.adminMode ? `
          <button class="btn-icon accent" onclick="event.stopPropagation();openStudentForm('${s.id}')">${IC.edit}</button>
          <button class="btn-icon danger" onclick="event.stopPropagation();deleteStudent('${s.id}')">${IC.trash}</button>
        ` : ''}
        <span style="color:var(--text-3)">${IC.chev}</span>
      </div>
    </div>`).join('');
}

function setStudCls(cls){ filStud.cls=cls; filStud.q=''; renderStudents(); }

function filterStudents(q){
  filStud.q=q;
  const cls=filStud.cls;
  const query=q.toLowerCase();
  let list=studentsOf(cls);
  list = list.filter(s => s && s.name && s.name.trim() !== '');
  if(query) list=list.filter(s=>s.name.toLowerCase().includes(query)||(s.phone||'').includes(query));
  
  const countSpan=document.getElementById('student-count');
  if(countSpan) countSpan.textContent=list.length;
  
  const container=document.getElementById('student-list-container');
  if(container){
    container.innerHTML=studentListHTML(list);
  }
  
  const searchInput=document.getElementById('stud-search');
  if(searchInput){
    searchInput.focus();
    const val=searchInput.value;
    searchInput.setSelectionRange(val.length,val.length);
  }
}

function openStudentForm(id){
  const s=id?DATA.students.find(x=>x.id===id):{};
  const clsOpts=CLASSES.map(c=>`<option value="${c.id}" ${(s.cls||filStud.cls)===c.id?'selected':''}>${c.label}</option>`).join('');
  const statusOpts=['نشط','متوقف','منسحب'].map(v=>`<option value="${v}" ${(s.status||'نشط')===v?'selected':''}>${v}</option>`).join('');
  showSheet(id?'تعديل بيانات التلميذ':'تسجيل تلميذ جديد',`
    <div class="field-row"><label>الاسم الكامل <span class="req">*</span></label>
      <input class="field" id="sf-name" placeholder="اسم ولقب التلميذ" value="${esc(s.name||'')}"></div>
    <div class="field-grid-2">
      <div class="field-row"><label>القسم <span class="req">*</span></label>
        <select class="field" id="sf-cls">${clsOpts}</select></div>
      <div class="field-row"><label>الحالة</label>
        <select class="field" id="sf-status">${statusOpts}</select></div>
    </div>
    <div class="field-row"><label>رقم ولي الأمر</label>
      <input class="field" id="sf-phone" type="tel" placeholder="0600000000" value="${esc(s.phone||'')}"></div>
    <div class="field-grid-2">
      <div class="field-row"><label>تاريخ التسجيل</label>
        <input class="field" type="date" id="sf-regdate" value="${s.regDate||today()}"></div>
      <div class="field-row"><label>الأجر الشهري (د.م)</label>
        <input class="field" type="number" id="sf-fee" value="${s.fee||DATA.settings.defaultFee||150}"></div>
    </div>
    <div class="field-row"><label>ملاحظات</label>
      <textarea class="field" id="sf-notes">${esc(s.notes||'')}</textarea></div>
    <input type="hidden" id="sf-id" value="${id||''}">
  `,[
    {label:'إلغاء',cls:'btn-outline',fn:'closeSheet()'},
    {label:'حفظ',cls:'btn-accent',fn:'saveStudent()'}
  ]);
}

function saveStudent(){
  const id=document.getElementById('sf-id').value;
  const name=document.getElementById('sf-name').value.trim();
  const cls=document.getElementById('sf-cls').value;
  if(!name){toast('أدخل اسم التلميذ','error');return;}
  const obj={name,cls,
    status:document.getElementById('sf-status').value,
    phone:document.getElementById('sf-phone').value.trim(),
    regDate:document.getElementById('sf-regdate').value,
    fee:+document.getElementById('sf-fee').value||DATA.settings.defaultFee,
    notes:document.getElementById('sf-notes').value.trim()
  };
  if(id){ Object.assign(DATA.students.find(x=>x.id===id),obj); }
  else { DATA.students.push({id:uid(),...obj}); }
  save();closeSheet();toast('تم الحفظ','success');renderStudents();
}

function deleteStudent(id){
  if(!confirm('سيتم حذف التلميذ وجميع بياناته (الحضور، النقاط، الأداءات). هل تؤكد؟'))return;
  DATA.students=DATA.students.filter(s=>s.id!==id);
  DATA.attendance=DATA.attendance.filter(a=>a.sid!==id);
  DATA.grades=DATA.grades.filter(g=>g.sid!==id);
  DATA.payments=DATA.payments.filter(p=>p.sid!==id);
  save();toast('تم الحذف');renderStudents();
}