/* =================================================================
   ATTENDANCE
================================================================= */
function renderAttendance(){
  const cls=filAtt.cls;
  const date=filAtt.date;
  const stds=studentsOf(cls);
  const todayAtts=DATA.attendance.filter(a=>a.date===date&&a.cls===cls);
  const getStatus=sid=>{ const r=todayAtts.find(a=>a.sid===sid); return r?r.status:''; };
  const nP=stds.filter(s=>getStatus(s.id)==='present').length;
  const nA=stds.filter(s=>getStatus(s.id)==='absent').length;
  const nL=stds.filter(s=>getStatus(s.id)==='late').length;
  const sec=document.getElementById('sec-attendance');
  sec.innerHTML=`
    ${classTabsHtml(cls,"setAttCls")}
    <div class="panel" style="padding:12px 14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:10px">
        <label style="font-size:13px;font-weight:700;color:var(--text-3);white-space:nowrap">التاريخ</label>
        <input class="field" type="date" id="att-date" value="${date}" onchange="setAttDate(this.value)" style="flex:1;padding:8px 10px">
        <button class="btn btn-accent btn-sm" onclick="setAttDate('${today()}')">اليوم</button>
      </div>
    </div>
    ${stds.length===0
      ? `<div class="panel">${emptyHtml('لا يوجد تلاميذ','أضف تلاميذ أولاً في قسم التلاميذ')}</div>`
      : `<div class="stat-grid-3" style="margin-bottom:12px">
          <div class="stat-card" style="align-items:center;padding:12px 8px">
            <div class="s-val" style="color:var(--green)">${nP}</div>
            <div class="s-label">حاضر</div>
          </div>
          <div class="stat-card" style="align-items:center;padding:12px 8px">
            <div class="s-val" style="color:var(--danger)">${nA}</div>
            <div class="s-label">غائب</div>
          </div>
          <div class="stat-card" style="align-items:center;padding:12px 8px">
            <div class="s-val" style="color:var(--amber)">${nL}</div>
            <div class="s-label">متأخر</div>
          </div>
        </div>
        <div class="panel" style="padding:0 14px">
          ${stds.map(s=>{
            const st=getStatus(s.id);
            return `<div class="att-row">
              <div class="att-name">${esc(s.name)}</div>
              <div class="quick-mark-row">
                <button class="qm-btn ${st==='present'?'present':''}" onclick="quickMark('${s.id}','present','${cls}','${date}')">✓</button>
                <button class="qm-btn ${st==='absent'?'absent':''}"  onclick="quickMark('${s.id}','absent','${cls}','${date}')">✗</button>
                <button class="qm-btn ${st==='late'?'late':''}"    onclick="quickMark('${s.id}','late','${cls}','${date}')">تأخر</button>
              </div>
            </div>`;
          }).join('')}
        </div>`}
    <div class="panel" style="margin-top:12px">
      <div class="panel-title">آخر السجلات</div>
      ${DATA.attendance.filter(a=>a.cls===cls).slice(-20).reverse().map(a=>{
        const st=DATA.students.find(s=>s.id===a.sid);
        const sc=a.status==='present'?'badge-green':a.status==='absent'?'badge-red':'badge-amber';
        return `<div class="data-row">
          <span class="key">${fdate(a.date)} · ${esc(st?.name||'—')}</span>
          <span class="badge ${sc}">${ATT_STATUS[a.status]||a.status}</span>
        </div>`;
      }).join('')||`<div style="padding:14px;text-align:center;color:var(--text-3);font-size:13px">لا توجد سجلات</div>`}
    </div>`;
}
function setAttCls(cls){ filAtt.cls=cls; renderAttendance(); }
function setAttDate(d){ filAtt.date=d; renderAttendance(); }
function quickMark(sid,status,cls,date){
  const idx=DATA.attendance.findIndex(a=>a.sid===sid&&a.date===date&&a.cls===cls);
  if(idx>=0){
    if(DATA.attendance[idx].status===status) DATA.attendance.splice(idx,1);
    else DATA.attendance[idx].status=status;
  } else {
    DATA.attendance.push({id:uid(),sid,cls,date,status});
  }
  save();renderAttendance();
}