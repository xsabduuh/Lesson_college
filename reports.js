/* =================================================================
   REPORTS (التقارير)
================================================================= */
function renderReports(){
  const totalSt=DATA.students.length;
  const totalSess=DATA.sessions.length;
  const totalGr=DATA.grades.length;
  const totalAtt=DATA.attendance.length;
  const presentAtt=DATA.attendance.filter(a=>a.status==='present').length;
  const attRate=totalAtt>0?Math.round(presentAtt/totalAtt*100):0;
  const avgBySubj=SUBJECTS.map(s=>{
    const gs=DATA.grades.filter(g=>g.subj===s.id&&g.max>0);
    const avg=gs.length>0?gs.reduce((a,g)=>a+g.score/g.max,0)/gs.length*20:null;
    return {s,avg};
  });
  const sec=document.getElementById('sec-reports');
  sec.innerHTML=`
    <div class="stat-grid">
      <div class="stat-card">
        <div class="s-label">إجمالي التلاميذ</div>
        <div class="s-val">${totalSt}</div>
        <div class="s-sub">مسجلون</div>
      </div>
      <div class="stat-card">
        <div class="s-label">الحصص المخططة</div>
        <div class="s-val">${totalSess}</div>
      </div>
      <div class="stat-card">
        <div class="s-label">النقاط المسجلة</div>
        <div class="s-val">${totalGr}</div>
      </div>
      <div class="stat-card">
        <div class="s-label">نسبة الحضور</div>
        <div class="s-val" style="color:${attRate>=75?'var(--green)':attRate>=50?'var(--amber)':'var(--danger)'}">${attRate}%</div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">المعدل العام حسب المادة</div>
      ${avgBySubj.map(({s,avg})=>`
        <div class="data-row">
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge badge-${s.cls}">${s.label}</span>
          </div>
          <span style="font-size:18px;font-weight:800;font-family:var(--mono);color:${s.color}">
            ${avg!=null?avg.toFixed(2)+'/20':'—'}
          </span>
        </div>`).join('')}
    </div>

    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">الحضور حسب القسم</div>
      ${CLASSES.map(c=>{
        const total=DATA.attendance.filter(a=>a.cls===c.id).length;
        const present=DATA.attendance.filter(a=>a.cls===c.id&&a.status==='present').length;
        const pct=total>0?Math.round(present/total*100):0;
        return `<div style="padding:12px 14px;border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-weight:700;color:${c.color}">${c.label}</span>
            <span style="font-size:13px;color:var(--text-3)">${present}/${total} · ${pct}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${c.color}"></div></div>
        </div>`;}).join('')}
    </div>

    <div class="chart-wrap" style="padding:8px 0">
      <canvas id="reports-chart" height="180"></canvas>
    </div>

    <div class="panel">
      <div class="panel-title">أداء التلاميذ</div>
      ${studentPerformanceRows()}
    </div>`;
  setTimeout(()=>drawReportsChart(),0);
}
function studentPerformanceRows(){
  const allStds=DATA.students;
  if(allStds.length===0) return `<div style="padding:14px;text-align:center;color:var(--text-3);font-size:13px">لا يوجد تلاميذ</div>`;
  return allStds.map(s=>{
    const gs=DATA.grades.filter(g=>g.sid===s.id&&g.max>0);
    const avg=gs.length>0?gs.reduce((a,g)=>a+g.score/g.max,0)/gs.length*20:null;
    const atts=DATA.attendance.filter(a=>a.sid===s.id);
    const pct=atts.length>0?Math.round(DATA.attendance.filter(a=>a.sid===s.id&&a.status==='present').length/atts.length*100):null;
    return `<div class="data-row">
      <div>
        <div style="font-size:13px;font-weight:700">${esc(s.name)}</div>
        <span class="badge ${classBadge(s.cls)}" style="margin-top:3px">${clsById(s.cls).short}</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        ${pct!=null?`<span class="badge badge-gray">${pct}% حضور</span>`:''}
        <span style="font-size:17px;font-weight:800;font-family:var(--mono);color:var(--accent)">${avg!=null?avg.toFixed(1):'—'}</span>
      </div>
    </div>`;
  }).join('');
}