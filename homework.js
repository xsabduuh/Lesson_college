/* =================================================================
   HOMEWORK (الفروض) – تصميم راقٍ مع ملفات وتاريخ الاجتياز
================================================================= */
function renderHomework(){
  const cls=filHW.cls;
  const subj=filHW.subj;
  const items=DATA.homework.filter(h=>h.cls===cls&&h.subj===subj)
    .sort((a,b)=>a.examDate>b.examDate?1:-1);
  const s=subjById(subj);
  const sec=document.getElementById('sec-homework');

  sec.innerHTML=`
    ${classTabsHtml(cls,"setHWCls")}
    ${subjPillsHtml(subj,"setHWSubj")}
    
    <!-- شريط علوي مع زر الإضافة -->
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
      <h2 style="font-size:16px; font-weight:800;">${IC.clip} فروض ${s.label}</h2>
      <button class="btn btn-accent btn-sm" onclick="openHomeworkForm()">
        ${IC.plus} إضافة فرض
      </button>
    </div>
    
    <div id="homework-container" style="display:flex;flex-direction:column;gap:12px;margin-top:8px;">
      ${items.length===0
        ? emptyHtml('لا توجد فروض','أضف فرضاً باستخدام الزر أعلاه')
        : items.map(h=>renderHomeworkCard(h,s)).join('')}
    </div>
  `;
}

// أيقونات SVG مساعدة
const calendarIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const clockIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const fileIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
const downloadIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

function renderHomeworkCard(h, s){
  const overdue = h.examDate && h.examDate < today();
  const statusBadge = h.completed
    ? `<span class="badge badge-green" style="font-size:11px;margin-left:auto;">${IC.check} أُنجز</span>`
    : (overdue ? `<span class="badge badge-red" style="font-size:11px;margin-left:auto;">${clockIcon} متأخر</span>` : '');

  const fileLink = h.fileName
    ? `<div class="homework-file" onclick="event.stopPropagation();downloadHWFile('${h.id}')" style="margin-top:10px;display:flex;align-items:center;gap:8px;background:var(--surface-2);padding:8px 12px;border-radius:8px;cursor:pointer;">
         <span style="display:flex;color:var(--accent);">${fileIcon}</span>
         <span style="font-size:12px;color:var(--accent);font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(h.fileName)}</span>
         <span style="display:flex;color:var(--accent);">${downloadIcon}</span>
       </div>`
    : '';

  return `
    <div class="homework-card" style="background:var(--surface);border-radius:var(--radius-lg);border:1px solid var(--border);overflow:hidden;box-shadow:var(--shadow);transition:all 0.2s;">
      <div style="display:flex;align-items:stretch;">
        <div style="background:${s.bg};color:${s.color};display:flex;align-items:center;justify-content:center;min-width:60px;font-size:24px;">
          ${IC.clip}
        </div>
        <div style="flex:1;padding:14px;display:flex;flex-direction:column;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <h3 style="font-size:15px;font-weight:800;color:var(--text);margin:0;flex:1;">${esc(h.title)}</h3>
            ${statusBadge}
            <button class="btn-icon ${h.completed?'green':''}" style="width:32px;height:32px;border-radius:8px;" onclick="event.stopPropagation();toggleHomeworkComplete('${h.id}')" title="${h.completed?'إلغاء الإنجاز':'تعليم كمنجز'}">
              ${IC.check}
            </button>
            <div class="admin-actions" style="margin:0;">
              <button class="btn-icon accent" style="width:32px;height:32px;border-radius:8px;" onclick="event.stopPropagation();openHomeworkForm('${h.id}')">${IC.edit}</button>
              <button class="btn-icon danger" style="width:32px;height:32px;border-radius:8px;" onclick="event.stopPropagation();deleteHomework('${h.id}')">${IC.trash}</button>
            </div>
          </div>
          <div style="font-size:12px;color:var(--text-3);margin-bottom:8px;display:flex;align-items:center;gap:4px;">
            ${calendarIcon} تاريخ الاجتياز: ${fdate(h.examDate||'')}
          </div>
          ${h.content ? `<p style="font-size:13px;color:var(--text-2);line-height:1.5;margin:0 0 8px 0;word-break:break-word;">${esc(h.content.length > 120 ? h.content.slice(0,120)+'…' : h.content)}</p>` : ''}
          ${fileLink}
        </div>
      </div>
    </div>
  `;
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
    <div class="field-row"><label>تاريخ الاجتياز</label>
      <input class="field" type="date" id="hf-examDate" value="${h.examDate||today()}"></div>
    <div class="field-row"><label>وصف الفرض</label>
      <textarea class="field" id="hf-content" style="min-height:80px" placeholder="تعليمات وتفاصيل الفرض">${esc(h.content||'')}</textarea></div>
    <div class="field-row">
      <label>ملف الفرض (صورة أو PDF)</label>
      <input type="file" id="hf-file" accept="image/*,.pdf" style="display:block;margin-top:4px;">
      ${id && h.fileName ? `<div style="font-size:11px;color:var(--text-3);margin-top:4px">الملف الحالي: ${esc(h.fileName)}</div>` : ''}
    </div>
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

  const fileInput = document.getElementById('hf-file');
  const existing = id ? DATA.homework.find(x=>x.id===id) : null;

  const obj = {
    cls: document.getElementById('hf-cls').value,
    subj: document.getElementById('hf-subj').value,
    title,
    examDate: document.getElementById('hf-examDate').value,
    content: document.getElementById('hf-content').value.trim(),
    completed: existing ? existing.completed : false
  };

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
      obj.fileData = e.target.result;
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

function toggleHomeworkComplete(id){
  const hw = DATA.homework.find(h=>h.id===id);
  if (!hw) return;
  hw.completed = !hw.completed;
  save();
  toast(hw.completed ? 'تم تعليم الفرض كمنجز' : 'تم إلغاء الإنجاز', 'success');
  renderHomework();
}

function downloadHWFile(id) {
  const hw = DATA.homework.find(h => h.id === id);
  if (!hw || !hw.fileData) return;

  if (hw.fileType && hw.fileType.startsWith('image/')) {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<img src="${hw.fileData}" style="max-width:100%;height:auto;display:block;margin:auto;">`);
      win.document.title = hw.fileName || 'صورة الفرض';
    } else {
      downloadFallback(hw);
    }
  } else {
    downloadFallback(hw);
  }
}

function downloadFallback(hw) {
  const a = document.createElement('a');
  a.href = hw.fileData;
  let fileName = hw.fileName || 'homework_file';
  if (!fileName.includes('.')) {
    const ext = hw.fileType ? hw.fileType.split('/').pop() : 'bin';
    fileName += '.' + ext;
  }
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}