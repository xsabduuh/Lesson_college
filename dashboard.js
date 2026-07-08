/* =================================================================
   DASHBOARD
================================================================= */
function renderDashboard(){
  const t=today();
  const todaySess=DATA.sessions.filter(s=>s.date===t);
  const upcomingSess=DATA.sessions.filter(s=>s.date>t).sort((a,b)=>a.date>b.date?1:-1).slice(0,3);
  const pendingHW=DATA.homework.filter(h=>h.dueDate&&h.dueDate>=t);
  // Today attendance
  const todayAtt=DATA.attendance.filter(a=>a.date===t);
  const todayPresent=todayAtt.filter(a=>a.status==='present').length;
  const todayAbsent=todayAtt.filter(a=>a.status==='absent').length;
  const todayLate=todayAtt.filter(a=>a.status==='late').length;
  const totalStud=DATA.students.length;
  const activeStud=DATA.students.filter(s=>s.status==='نشط'||!s.status).length;
  const sec=document.getElementById('sec-dashboard');
  sec.innerHTML=`
    <!-- Quick class overview -->
    <div style="display:flex;gap:10px;margin-bottom:12px">
      ${CLASSES.map(c=>{
        const n=studentsOf(c.id).length;
        const nextSess=DATA.sessions.filter(s=>s.cls===c.id&&s.date>=t).sort((a,b)=>a.date>b.date?1:-1)[0];
        return `<div class="stat-card" style="flex:1;border-top:3px solid ${c.color}">
          <div style="font-size:11px;font-weight:800;color:${c.color}">${c.short}</div>
          <div style="font-size:24px;font-weight:800;font-family:var(--mono);margin-top:4px">${n}</div>
          <div style="font-size:11px;color:var(--text-3)">تلميذ</div>
          ${nextSess?`<div style="font-size:10px;margin-top:6px;padding:3px 7px;border-radius:5px;background:${c.bg};color:${c.color};font-weight:700">⏰ ${fdate(nextSess.date)}</div>`:''}
        </div>`;}).join('')}
    </div>

    <!-- Stats Grid -->
    <div class="stat-grid" style="margin-bottom:12px">
      <div class="stat-card">
        <div class="s-label">الدروس المسجلة</div>
        <div class="s-val">${DATA.lessons.length}</div>
      </div>
      <div class="stat-card">
        <div class="s-label">التمارين</div>
        <div class="s-val">${DATA.exercises.length}</div>
      </div>
      <div class="stat-card">
        <div class="s-label">الفروض</div>
        <div class="s-val">${DATA.homework.length}</div>
        <div class="s-sub">${pendingHW.length} قيد التنفيذ</div>
      </div>
      <div class="stat-card">
        <div class="s-label">المصطلحات</div>
        <div class="s-val">${DATA.glossary.length}</div>
      </div>
    </div>

    <!-- Today Attendance -->
    ${todayAtt.length>0?`
    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">حضور اليوم</div>
      <div style="display:flex;gap:0">
        <div style="flex:1;padding:12px;text-align:center;border-left:1px solid var(--border)">
          <div style="font-size:22px;font-weight:800;color:var(--green)">${todayPresent}</div>
          <div style="font-size:11px;color:var(--text-3);font-weight:700">حاضر</div>
        </div>
        <div style="flex:1;padding:12px;text-align:center;border-left:1px solid var(--border)">
          <div style="font-size:22px;font-weight:800;color:var(--danger)">${todayAbsent}</div>
          <div style="font-size:11px;color:var(--text-3);font-weight:700">غائب</div>
        </div>
        <div style="flex:1;padding:12px;text-align:center">
          <div style="font-size:22px;font-weight:800;color:var(--amber)">${todayLate}</div>
          <div style="font-size:11px;color:var(--text-3);font-weight:700">متأخر</div>
        </div>
      </div>
    </div>`:''}

    <!-- Chart -->
    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">نسب الحضور والأداء</div>
      <div class="chart-wrap">
        <canvas id="dash-chart" height="150"></canvas>
      </div>
    </div>

    ${todaySess.length>0?`
    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">حصص اليوم</div>
      ${todaySess.map(s=>{
        const sj=subjById(s.subj);
        const cl=clsById(s.cls);
        return `<div class="card-item" onclick="navigate('sessions')">
          <div class="card-item-icon" style="background:${sj.bg};color:${sj.color}">${IC.clock}</div>
          <div class="card-item-body">
            <div class="card-item-title">${esc(s.title)}</div>
            <div class="card-item-sub">${cl.label} · ${sj.label}${s.time?' · '+s.time:''}</div>
          </div>
          <span class="badge badge-blue">اليوم</span>
        </div>`;}).join('')}
    </div>`:''}

    ${upcomingSess.length>0?`
    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">الحصص القادمة</div>
      ${upcomingSess.map(s=>{
        const sj=subjById(s.subj);
        const cl=clsById(s.cls);
        return `<div class="card-item" onclick="navigate('sessions')">
          <div class="card-item-icon" style="background:${sj.bg};color:${sj.color}">${IC.clock}</div>
          <div class="card-item-body">
            <div class="card-item-title">${esc(s.title)}</div>
            <div class="card-item-sub">${fdate(s.date)} · ${cl.label}</div>
          </div>
        </div>`;}).join('')}
    </div>`:''}

    <!-- Quick Nav -->
    <div class="panel">
      <div class="panel-title">وصول سريع</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:12px">
        ${[
          ['lessons','الدروس','var(--math)','var(--math-bg)',IC.book],
          ['exercises','التمارين','var(--phy)','var(--phy-bg)',IC.pen],
          ['homework','الفروض','var(--danger)','var(--danger-light)',IC.clip],
          ['attendance','الحضور','var(--green)','var(--green-light)',IC.check],
          ['sessions','الحصص','var(--accent)','var(--accent-light)',IC.clock],
          ['glossary','المصطلحات','var(--purple)','var(--purple-light)',IC.book2],
        ].map(([k,l,c,b,icon])=>`
          <button onclick="navigate('${k}')" style="
            display:flex;flex-direction:column;align-items:center;gap:6px;
            padding:12px 6px;border-radius:12px;font-size:11px;font-weight:700;
            background:${b};color:${c};border:1.5px solid ${b};
          ">
            ${icon}<span>${l}</span>
          </button>`).join('')}
      </div>
    </div>`;
  setTimeout(()=>drawDashChart(),0);
}