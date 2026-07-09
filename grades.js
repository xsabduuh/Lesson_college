/* =================================================================
   GRADES (النقاط)
================================================================= */
function renderGrades(){
  const cls=filGrades.cls;
  const subj=filGrades.subj;
  const s=subjById(subj);
  const stds=studentsOf(cls);
  const grades=DATA.grades.filter(g=>g.cls===cls&&g.subj===subj);
  const avg=grades.length>0?grades.reduce((a,g)=>a+(g.max>0?g.score/g.max:0),0)/grades.length*20:null;
  const sec=document.getElementById('sec-grades');
  sec.innerHTML=`
    ${classTabsHtml(cls,"setGradeCls")}
    ${subjPillsHtml(subj,"setGradeSubj")}
    ${avg!=null?`<div class="panel" style="padding:14px;margin-bottom:12px;display:flex;align-items:center;gap:12px">
      <div style="width:50px;height:50px;border-radius:14px;background:${s.bg};color:${s.color};display:flex;flex-direction:column;align-items:center;justify-content:center">
        <span style="font-size:18px;font-weight:800;font-family:var(--mono)">${avg.toFixed(1)}</span>
        <span style="font-size:10px;opacity:.7">/20</span>
      </div>
      <div>
        <div style="font-size:12px;color:var(--text-3);font-weight:600">المعدل العام</div>
        <div style="font-size:22px;font-weight:800;font-family:var(--mono);color:${s.color}">${avg.toFixed(2)}/20</div>
      </div>
      <div style="flex:1;text-align:left"><span class="badge badge-${s.cls}">${s.label}</span></div>
    </div>`:''}
    <div class="panel">
      <div style="padding:12px 14px 8px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:13px;font-weight:800;color:var(--text-3)">النقاط المسجلة</span>
        <span class="count-badge">${grades.length}</span>
      </div>
      ${grades.length===0
        ? emptyHtml('لا توجد نقاط','أضف نقطة باستخدام الزر أسفله')
        : grades.slice().reverse().map(g=>{
            const std=stds.find(s=>s.id===g.sid);
            const pct=g.max>0?g.score/g.max:0;
            const sc=pct>=0.7?'pass':pct>=0.5?'avg':'fail';
            return `<div class="grade-item">
              <div class="grade-score ${sc}">${g.score}<span style="font-size:11px;opacity:.5">/${g.max}</span></div>
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:600">${esc(g.title)}</div>
                <div style="font-size:11px;color:var(--text-3)">${esc(std?.name||'—')} · ${fdate(g.date)}</div>
                ${g.type?`<span class="badge badge-gray" style="margin-top:3px">${esc(g.type)}</span>`:''}
              </div>
              <div class="admin-actions">
                <button class="btn-icon accent" onclick="openGradeForm('${g.id}')">${IC.edit}</button>
                <button class="btn-icon danger"  onclick="deleteGrade('${g.id}')">${IC.trash}</button>
              </div>
              <span class="badge badge-${s.cls}" style="margin-right:4px">${s.short}</span>
            </div>`;
          }).join('')}
    </div>
    <div class="chart-wrap">
      <canvas id="grade-bar-chart" height="150"></canvas>
    </div>`;
  setTimeout(()=>drawGradeBarChart(grades,stds,subj),0);
}
function setGradeCls(cls){ filGrades.cls=cls; renderGrades(); }
function setGradeSubj(subj){ filGrades.subj=subj; renderGrades(); }

function openGradeForm(id){
  const g=id?DATA.grades.find(x=>x.id===id):{};
  const cls=g.cls||filGrades.cls;
  const subj=g.subj||filGrades.subj;
  const stds=studentsOf(cls);
  const clsOpts=CLASSES.map(c=>`<option value="${c.id}" ${cls===c.id?'selected':''}>${c.label}</option>`).join('');
  const subjOpts=SUBJECTS.map(s=>`<option value="${s.id}" ${subj===s.id?'selected':''}>${s.label}</option>`).join('');
  const stdOpts=stds.map(s=>`<option value="${s.id}" ${g.sid===s.id?'selected':''}>${esc(s.name)}</option>`).join('');
  const typeOpts=GRADE_TYPES.map(t=>`<option value="${t}" ${g.type===t?'selected':''}>${t}</option>`).join('');
  showSheet(id?'تعديل نقطة':'إضافة نقطة',`
    <div class="field-grid-2">
      <div class="field-row"><label>القسم</label><select class="field" id="gf-cls" onchange="reloadGradeStd(this.value)">${clsOpts}</select></div>
      <div class="field-row"><label>المادة</label><select class="field" id="gf-subj">${subjOpts}</select></div>
    </div>
    <div class="field-row"><label>التلميذ <span class="req">*</span></label>
      <select class="field" id="gf-sid"><option value="">-- اختر التلميذ --</option>${stdOpts}</select></div>
    <div class="field-row"><label>عنوان التقييم <span class="req">*</span></label>
      <input class="field" id="gf-title" placeholder="مثال: فرض محروس 1" value="${esc(g.title||'')}"></div>
    <div class="field-grid-2">
      <div class="field-row"><label>النقطة المحصل عليها</label><input class="field" type="number" id="gf-score" min="0" value="${g.score??0}"></div>
      <div class="field-row"><label>من (المجموع)</label><input class="field" type="number" id="gf-max" min="1" value="${g.max||20}"></div>
    </div>
    <div class="field-grid-2">
      <div class="field-row"><label>نوع التقييم</label><select class="field" id="gf-type">${typeOpts}</select></div>
      <div class="field-row"><label>التاريخ</label><input class="field" type="date" id="gf-date" value="${g.date||today()}"></div>
    </div>
    <div class="field-row"><label>ملاحظة</label><textarea class="field" id="gf-note" style="min-height:60px">${esc(g.note||'')}</textarea></div>
    <input type="hidden" id="gf-id" value="${id||''}">
  `,[
    {label:'إلغاء',cls:'btn-outline',fn:'closeSheet()'},
    {label:'حفظ',cls:'btn-accent',fn:'saveGrade()'}
  ]);
}
function reloadGradeStd(cls){
  const stds=studentsOf(cls);
  const sel=document.getElementById('gf-sid');
  if(!sel)return;
  sel.innerHTML='<option value="">-- اختر التلميذ --</option>'+stds.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');
}
function saveGrade(){
  const id=document.getElementById('gf-id').value;
  const sid=document.getElementById('gf-sid').value;
  const title=document.getElementById('gf-title').value.trim();
  if(!sid||!title){toast('اختر التلميذ وأدخل العنوان','error');return;}
  const obj={
    cls:document.getElementById('gf-cls').value,
    subj:document.getElementById('gf-subj').value,
    sid,title,
    score:+document.getElementById('gf-score').value,
    max:+document.getElementById('gf-max').value||20,
    type:document.getElementById('gf-type').value,
    date:document.getElementById('gf-date').value,
    note:document.getElementById('gf-note').value.trim()
  };
  if(id){ Object.assign(DATA.grades.find(x=>x.id===id),obj); }
  else { DATA.grades.push({id:uid(),...obj}); }
  save();closeSheet();toast('تم الحفظ','success');renderGrades();
}
function deleteGrade(id){
  if(!confirm('حذف هذه النقطة؟'))return;
  DATA.grades=DATA.grades.filter(g=>g.id!==id);
  save();toast('تم الحذف');renderGrades();
}