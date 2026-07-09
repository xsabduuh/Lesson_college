/* =================================================================
   STUDENT DETAIL
================================================================= */
let detailTab='info';
function renderStudentDetail(id){
  if(!id){navigate('students');return;}
  currentStudentId=id;
  const s=DATA.students.find(x=>x.id===id);
  if(!s){navigate('students');return;}
  document.getElementById('topbar-title').textContent=s.name;
  const sec=document.getElementById('sec-student-detail');
  // إضافة فحص لإنشاء العنصر إذا كان مفقوداً (حل سريع)
  if(!sec){
    alert('العنصر sec-student-detail غير موجود! تأكد من إضافته في HTML.');
    return;
  }
  sec.innerHTML=`
    <div class="panel" style="padding:16px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
        <div style="width:58px;height:58px;border-radius:18px;background:${classBg(s.cls)};color:${classColor(s.cls)};display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800">
          ${s.name.charAt(0)}
        </div>
        <div style="flex:1">
          <div style="font-size:18px;font-weight:800">${esc(s.name)}</div>
          <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
            <span class="badge ${classBadge(s.cls)}">${clsById(s.cls).label}</span>
            ${s.status?`<span class="badge ${s.status==='نشط'?'badge-green':s.status==='متوقف'?'badge-amber':'badge-red'}">${esc(s.status)}</span>`:''}
          </div>
        </div>
        <div class="admin-actions">
          <button class="btn-icon accent" onclick="openStudentForm('${s.id}')">${IC.edit}</button>
        </div>
      </div>
    </div>
    <div class="tabs-scroll">
      <button class="tab-btn ${detailTab==='info'?'active':''}" onclick="setDetailTab('info','${id}')">المعلومات</button>
      <button class="tab-btn ${detailTab==='attendance'?'active':''}" onclick="setDetailTab('attendance','${id}')">الحضور</button>
      <button class="tab-btn ${detailTab==='grades'?'active':''}" onclick="setDetailTab('grades','${id}')">النتائج</button>
      <button class="tab-btn ${detailTab==='payments'?'active':''}" onclick="setDetailTab('payments','${id}')">الدفع</button>
      <button class="tab-btn ${detailTab==='notes'?'active':''}" onclick="setDetailTab('notes','${id}')">ملاحظات</button>
    </div>
    <div id="detail-tab-content"></div>
  `;
  renderDetailTab(id);
}
function setDetailTab(tab,id){
  detailTab=tab;
  renderStudentDetail(id);
}
function renderDetailTab(id){
  const s=DATA.students.find(x=>x.id===id);
  const cont=document.getElementById('detail-tab-content');
  if(!cont)return;
  if(detailTab==='info'){
    cont.innerHTML=`
      <div class="panel">
        ${s.phone?`<div class="data-row"><span class="key">هاتف ولي الأمر</span><span class="val" style="font-family:var(--mono)">${esc(s.phone)}</span></div>`:''}
        <div class="data-row"><span class="key">تاريخ التسجيل</span><span class="val">${fdate(s.regDate)}</span></div>
        <div class="data-row"><span class="key">الأجر الشهري</span><span class="val">${s.fee||DATA.settings.defaultFee||200} د.م</span></div>
        <div class="data-row"><span class="key">القسم</span><span class="val">${clsById(s.cls).label}</span></div>
      </div>`;
  } else if(detailTab==='attendance'){
    const atts=DATA.attendance.filter(a=>a.sid===id);
    const present=atts.filter(a=>a.status==='present').length;
    const absent=atts.filter(a=>a.status==='absent').length;
    const late=atts.filter(a=>a.status==='late').length;
    const total=atts.length;
    const pct=total>0?Math.round(present/total*100):0;
    cont.innerHTML=`
      <div class="stat-grid-3" style="margin-bottom:12px">
        <div class="stat-card" style="align-items:center;padding:12px 8px">
          <div class="s-val" style="color:var(--green);font-size:22px">${present}</div>
          <div class="s-label">حاضر</div>
        </div>
        <div class="stat-card" style="align-items:center;padding:12px 8px">
          <div class="s-val" style="color:var(--danger);font-size:22px">${absent}</div>
          <div class="s-label">غائب</div>
        </div>
        <div class="stat-card" style="align-items:center;padding:12px 8px">
          <div class="s-val" style="color:var(--amber);font-size:22px">${late}</div>
          <div class="s-label">متأخر</div>
        </div>
      </div>
      <div class="panel" style="padding:14px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:13px;font-weight:700;color:var(--text-3)">نسبة الحضور</span>
          <span style="font-size:15px;font-weight:800;font-family:var(--mono);color:${pct>=75?'var(--green)':pct>=50?'var(--amber)':'var(--danger)'}">${pct}%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${pct>=75?'var(--green)':pct>=50?'var(--amber)':'var(--danger)'}"></div></div>
      </div>
      <div class="panel">
        <div class="panel-title">سجل الحضور</div>
        ${atts.length===0?`<div style="padding:16px;text-align:center;color:var(--text-3);font-size:13px">لا توجد سجلات</div>`
        : atts.slice().reverse().slice(0,20).map(a=>{
            const sc=a.status==='present'?'badge-green':a.status==='absent'?'badge-red':'badge-amber';
            return `<div class="data-row">
              <span class="key">${fdate(a.date)}</span>
              <span class="badge ${sc}">${ATT_STATUS[a.status]}</span>
            </div>`;
          }).join('')}
      </div>`;
  } else if(detailTab==='grades'){
    const grades=DATA.grades.filter(g=>g.sid===id);
    const avg=grades.length>0?grades.reduce((a,g)=>a+(g.max>0?g.score/g.max:0),0)/grades.length*20:null;
    cont.innerHTML=`
      ${avg!=null?`<div class="panel" style="padding:14px;display:flex;align-items:center;gap:14px;margin-bottom:12px">
        <div style="width:56px;height:56px;border-radius:16px;background:var(--accent-light);color:var(--accent);display:flex;flex-direction:column;align-items:center;justify-content:center">
          <span style="font-size:18px;font-weight:800;font-family:var(--mono)">${avg.toFixed(1)}</span>
          <span style="font-size:10px;opacity:.7">/20</span>
        </div>
        <div>
          <div style="font-size:12px;color:var(--text-3);font-weight:600">المعدل العام</div>
          <div style="font-size:13px;color:var(--text-2);margin-top:2px">${grades.length} نقطة مسجلة</div>
        </div>
      </div>`:''}
      <div class="panel">
        <div class="panel-title">النقاط المسجلة</div>
        ${grades.length===0?`<div style="padding:16px;text-align:center;color:var(--text-3);font-size:13px">لا توجد نقاط</div>`
        :grades.slice().reverse().map(g=>{
            const subj=subjById(g.subj);
            const pct=g.max>0?g.score/g.max:0;
            const sc=pct>=0.7?'pass':pct>=0.5?'avg':'fail';
            return `<div class="grade-item">
              <div class="grade-score ${sc}">${g.score}<span style="font-size:11px;opacity:.5">/${g.max}</span></div>
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:600">${esc(g.title)}</div>
                <div style="font-size:11px;color:var(--text-3)">${subj.label} · ${fdate(g.date)}</div>
              </div>
              <span class="badge badge-${subj.cls}">${subj.short}</span>
            </div>`;
          }).join('')}
      </div>
      <div class="chart-wrap" style="padding:10px 4px">
        <canvas id="grade-chart-${id}" height="140"></canvas>
      </div>`;
    setTimeout(()=>drawStudentGradeChart(id,grades),0);
  } else if(detailTab==='payments'){
    const fee=s.fee||DATA.settings.defaultFee||200;
    const months=getYearMonths();
    const pays=DATA.payments.filter(p=>p.sid===id);
    const paidTotal=pays.reduce((a,p)=>a+Number(p.paid||0),0);
    const totalExpected=months.length*fee;
    const unpaidTotal=Math.max(0,totalExpected-paidTotal);
    cont.innerHTML=`
      <div class="stat-grid" style="margin-bottom:12px">
        <div class="stat-card" style="border-color:var(--green)">
          <div class="s-label">المدفوع</div>
          <div class="s-val" style="color:var(--green);font-size:22px">${paidTotal}</div>
          <div class="s-sub">درهم</div>
        </div>
        <div class="stat-card" style="border-color:var(--danger)">
          <div class="s-label">المتبقي</div>
          <div class="s-val" style="color:var(--danger);font-size:22px">${unpaidTotal}</div>
          <div class="s-sub">درهم</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-title" style="padding:12px 16px 8px;display:flex;justify-content:space-between;align-items:center">
          <span>الأشهر الدراسية</span>
          <span style="font-size:11px;color:var(--text-3)">${fee} د.م/شهر</span>
        </div>
        <div class="pay-month-grid">
          ${months.map(ym=>{
            const p=pays.find(x=>x.month===ym)||{status:'none'};
            const st=p.status||'none';
            return `<div class="pay-month-card ${PAY_STATUS_CLS[st]||'none'}" onclick="openMonthPayment('${id}','${ym}')">
              <div style="font-size:10px;margin-bottom:3px">${monthLabel(ym).split(' ')[0]}</div>
              <div style="font-size:10px">${PAY_STATUS[st]}</div>
              ${p.paid?`<div style="font-size:9px;margin-top:2px">${p.paid} د.م</div>`:''}
            </div>`;
          }).join('')}
        </div>
      </div>`;
  } else if(detailTab==='notes'){
    cont.innerHTML=`
      <div class="panel" style="padding:14px">
        <textarea class="field" id="student-notes-ta" style="min-height:180px;border:none;background:transparent;padding:0"
          placeholder="اكتب ملاحظاتك عن التلميذ هنا..."
          oninput="autoSaveNotes('${id}')">${esc(s.notes||'')}</textarea>
        <div style="text-align:left;font-size:11px;color:var(--text-3);margin-top:8px" id="notes-saved-ind">تحفظ تلقائياً</div>
      </div>`;
  }
}
let notesSaveTimer=null;
function autoSaveNotes(id){
  clearTimeout(notesSaveTimer);
  notesSaveTimer=setTimeout(()=>{
    const ta=document.getElementById('student-notes-ta');
    if(!ta)return;
    const s=DATA.students.find(x=>x.id===id);
    if(s){ s.notes=ta.value; save(); }
    const ind=document.getElementById('notes-saved-ind');
    if(ind) ind.textContent='✓ تم الحفظ';
  },800);
}
function openMonthPayment(sid,ym){
  const s=DATA.students.find(x=>x.id===sid);
  const fee=s?s.fee||DATA.settings.defaultFee:DATA.settings.defaultFee;
  const pays=DATA.payments.filter(p=>p.sid===sid);
  const existing=pays.find(p=>p.month===ym)||{};
  const statusOpts=['none','paid','partial','late','unpaid'].map(v=>
    `<option value="${v}" ${(existing.status||'none')===v?'selected':''}>${PAY_STATUS[v]}</option>`).join('');
  showSheet(`أداء ${monthLabel(ym)}`,`
    <div class="field-row"><label>الحالة</label>
      <select class="field" id="mp-status">${statusOpts}</select></div>
    <div class="field-grid-2">
      <div class="field-row"><label>المبلغ المدفوع (د.م)</label>
        <input class="field" type="number" id="mp-paid" value="${existing.paid||fee}"></div>
      <div class="field-row"><label>تاريخ الدفع</label>
        <input class="field" type="date" id="mp-date" value="${existing.date||today()}"></div>
    </div>
    <div class="field-row"><label>ملاحظة</label>
      <input class="field" id="mp-note" value="${esc(existing.note||'')}"></div>
    <input type="hidden" id="mp-sid" value="${sid}">
    <input type="hidden" id="mp-month" value="${ym}">
    <input type="hidden" id="mp-id" value="${existing.id||''}">
  `,[
    {label:'إلغاء',cls:'btn-outline',fn:'closeSheet()'},
    {label:'حفظ',cls:'btn-accent',fn:'saveMonthPayment()'}
  ]);
}
function saveMonthPayment(){
  const sid=document.getElementById('mp-sid').value;
  const month=document.getElementById('mp-month').value;
  const existId=document.getElementById('mp-id').value;
  const obj={
    sid,month,
    status:document.getElementById('mp-status').value,
    paid:+document.getElementById('mp-paid').value,
    date:document.getElementById('mp-date').value,
    note:document.getElementById('mp-note').value.trim()
  };
  if(existId){
    const idx=DATA.payments.findIndex(p=>p.id===existId);
    if(idx>=0) DATA.payments[idx]={...DATA.payments[idx],...obj};
    else DATA.payments.push({id:uid(),...obj});
  } else {
    const existing=DATA.payments.find(p=>p.sid===sid&&p.month===month);
    if(existing) Object.assign(existing,obj);
    else DATA.payments.push({id:uid(),...obj});
  }
  save();closeSheet();toast('تم الحفظ','success');
  renderStudentDetail(sid);
}