/* =================================================================
   HOMEWORK (الفروض) – مع الملفات وحالة الإنجاز
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
                <div class="card-item-title">${esc(h.title)} ${h.completed?'<span class="badge badge-green" style="font-size:10px;margin-right:6px">✓ تم</span>':''}</div>
                <div class="card-item-sub">تسليم: ${fdate(h.dueDate||'')} ${overdue?'<span class="badge badge-red" style="font-size:10px">متأخر</span>':''}</div>
                ${h.content?`<div style="font-size:12px;color:var(--text-3);margin-top:3px">${esc(h.content.slice(0,80))}${h.content.length>80?'…':''}</div>`:''}
                ${h.fileName?`<div style="font-size:11px;margin-top:4px"><span style="color:var(--accent);cursor:pointer" onclick="downloadHWFile('${h.id}')">📎 ${esc(h.fileName)}</span></div>`:''}
              </div>
              <div class="card-item-actions" style="display:flex;gap:6px;align-items:center">
                <button class="btn-icon ${h.completed?'green':'gray'}" onclick="toggleHomeworkComplete('${h.id}')" title="${h.completed?'إلغاء الإنجاز':'تعليم كمنجز'}">${IC.check}</button>
                <div class="admin-actions">
                  <button class="btn-icon accent" onclick="openHomeworkForm('${h.id}')">${IC.edit}</button>
                  <button class="btn-icon danger"  onclick="deleteHomework('${h.id}')">${IC.trash}</button>
                </div>
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
    <!-- حقل رفع الملف -->
    <div class="field-row">
      <label>ملف الفرض (صورة أو PDF)</label>
      <input type="file" id="hf-file" accept="image/*,.pdf" style="display:block;margin-top:4px;">
      ${id && h.fileName ? `<div style="font-size:11px;color:var(--text-3);margin-top:4px">الملف الحالي: ${esc(h.fileName)}</div>` : ''}
    </div>
    <input type="hidden" id="hf-id" value="${id||''}">
    <input type="hidden" id="hf-completed" value="${h.completed?1:0}">
  `,[
    {label:'إلغاء',cls:'btn-outline',fn:'closeSheet()'},
    {label:'حفظ',cls:'btn-accent',fn:'saveHomework()'}
  ]);
}

function saveHomework(){
  const id=document.getElementById('hf-id').value;
  const title=document.getElementById('hf-title').value.trim();
  if(!title){toast('أدخل عنوان الفرض','error');return;}

  const fileInput = document.getElementById('hf-file');
  const existing = id ? DATA.homework.find(x=>x.id===id) : null;

  const obj = {
    cls: document.getElementById('hf-cls').value,
    subj: document.getElementById('hf-subj').value,
    title,
    date: document.getElementById('hf-date').value,
    dueDate: document.getElementById('hf-due').value,
    content: document.getElementById('hf-content').value.trim(),
    completed: document.getElementById('hf-completed').value === '1'
  };

  // الاحتفاظ بالملف القديم إذا لم يُرفع ملف جديد
  if (existing && existing.fileData && !fileInput.files[0]) {
    obj.fileData = existing.fileData;
    obj.fileName = existing.fileName;
    obj.fileType = existing.fileType;
  }

  const processSave = () => {
    if (id) { 
      const hw = DATA.homework.find(x=>x.id===id);
      Object.assign(hw, obj);
    } else { 
      DATA.homework.push({id:uid(), ...obj}); 
    }
    save(); closeSheet(); toast('تم الحفظ','success'); renderHomework();
  };

  if (fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      obj.fileData = e.target.result; // Base64
      obj.fileName = fileInput.files[0].name;
      obj.fileType = fileInput.files[0].type;
      processSave();
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    processSave();
  }
}

function deleteHomework(id){
  if(!confirm('حذف هذا الفرض؟'))return;
  DATA.homework=DATA.homework.filter(h=>h.id!==id);
  save();toast('تم الحذف');renderHomework();
}

// تبديل حالة الإنجاز
function toggleHomeworkComplete(id){
  const hw = DATA.homework.find(h=>h.id===id);
  if (!hw) return;
  hw.completed = !hw.completed;
  save();
  toast(hw.completed ? 'تم تعليم الفرض كمنجز' : 'تم إلغاء الإنجاز', 'success');
  renderHomework();
}

// تحميل الملف المرتبط بالفرض
function downloadHWFile(id){
  const hw = DATA.homework.find(h=>h.id===id);
  if (!hw || !hw.fileData) return;
  const a = document.createElement('a');
  a.href = hw.fileData;
  a.download = hw.fileName || 'homework_file';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}