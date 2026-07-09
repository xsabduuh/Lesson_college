/* =================================================================
   CHARTS (Canvas only — no external libs)
================================================================= */
function drawDashChart(){
  const canvas=document.getElementById('dash-chart');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const W=canvas.offsetWidth;canvas.width=W;canvas.height=160;
  const isDark=document.body.classList.contains('dark');
  const gridColor=isDark?'rgba(255,255,255,.08)':'rgba(0,0,0,.06)';
  const textColor=isDark?'#5A6490':'#8892B0';
  ctx.clearRect(0,0,W,160);

  // Two sections: attendance (%) left, grades (/20) right
  // Section 1: Attendance by class (0–100%)
  const attBars=CLASSES.map(c=>{
    const total=DATA.attendance.filter(a=>a.cls===c.id).length;
    const present=DATA.attendance.filter(a=>a.cls===c.id&&a.status==='present').length;
    return {label:c.short,val:total>0?Math.round(present/total*100):0,color:c.id==='1ere'?'#3B82F6':'#E55B20',unit:'%',max:100};
  });
  // Section 2: Grade averages by subject (0–20)
  const gradeBars=SUBJECTS.map(s=>{
    const gs=DATA.grades.filter(g=>g.subj===s.id&&g.max>0);
    const avg=gs.length>0?gs.reduce((a,g)=>a+g.score/g.max,0)/gs.length*20:0;
    return {label:s.short,val:+avg.toFixed(1),color:s.id==='math'?'#3B4FC0':s.id==='phy'?'#E09B2F':'#178A6F',unit:'/20',max:20};
  });

  const allBars=[...attBars,...gradeBars];
  const barW=Math.max(18,Math.floor((W-50)/allBars.length)-8);
  const chartH=115;const topPad=16;const leftPad=38;

  // Grid for attendance side (left, 0-100%)
  [0,50,100].forEach(v=>{
    const y=topPad+chartH*(1-v/100);
    ctx.strokeStyle=gridColor;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(leftPad,y);ctx.lineTo(W-10,y);ctx.stroke();
    ctx.fillStyle=textColor;ctx.font='9px sans-serif';ctx.textAlign='right';
    ctx.fillText(v+'%',leftPad-3,y+3);
  });

  // Divider between sections
  const divX=leftPad+(attBars.length*(barW+8));
  ctx.strokeStyle=gridColor;ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
  ctx.beginPath();ctx.moveTo(divX,topPad);ctx.lineTo(divX,topPad+chartH);ctx.stroke();
  ctx.setLineDash([]);

  // Grade axis labels (right side)
  [0,10,20].forEach(v=>{
    const y=topPad+chartH*(1-v/20);
    ctx.fillStyle=textColor;ctx.font='9px sans-serif';ctx.textAlign='left';
    ctx.fillText(v,W-18,y+3);
  });

  // Draw bars
  allBars.forEach((b,i)=>{
    const pct=b.val/b.max;
    const x=leftPad+i*(barW+8);
    const h=Math.max(2,chartH*pct);
    const y=topPad+chartH-h;
    ctx.fillStyle=b.color+'CC';
    roundRect(ctx,x,y,barW,h,4);ctx.fill();
    // Label below
    ctx.fillStyle=textColor;ctx.font='9px sans-serif';ctx.textAlign='center';
    ctx.fillText(b.label,x+barW/2,155);
    // Value above bar
    ctx.fillStyle=b.color;ctx.font='bold 9px sans-serif';
    const valTxt=b.unit==='%'?b.val+'%':b.val.toString();
    ctx.fillText(valTxt,x+barW/2,Math.max(y-3,topPad+2));
  });

  // Section labels
  ctx.fillStyle=textColor;ctx.font='bold 9px sans-serif';ctx.textAlign='center';
  ctx.fillText('الحضور',leftPad+attBars.length*(barW+8)/2-4,11);
  ctx.fillText('المعدلات',divX+(gradeBars.length*(barW+8))/2-4,11);
}
function drawStudentGradeChart(sid,grades){
  const canvas=document.getElementById('grade-chart-'+sid);
  if(!canvas||grades.length===0)return;
  const W=canvas.offsetWidth;canvas.width=W;canvas.height=140;
  const ctx=canvas.getContext('2d');
  const isDark=document.body.classList.contains('dark');
  const textColor=isDark?'#5A6490':'#8892B0';
  const accentColor=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#3B4FC0';
  const sorted=grades.filter(g=>g.max>0).slice().sort((a,b)=>a.date>b.date?1:-1).slice(-8);
  if(sorted.length===0)return;
  const maxV=20;const points=sorted.map(g=>({y:g.score/g.max*20,label:g.title.slice(0,8)}));
  const W2=W-40;const H=110;const top=16;const left=36;
  ctx.clearRect(0,0,W,140);
  // Grid
  [0,5,10,15,20].forEach(v=>{
    const y=top+H*(1-v/maxV);
    ctx.strokeStyle=isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)';
    ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(W-8,y);ctx.stroke();
    ctx.fillStyle=textColor;ctx.font='9px sans-serif';ctx.textAlign='right';
    ctx.fillText(v,left-3,y+3);
  });
  // Line
  const step=points.length>1?W2/(points.length-1):W2;
  ctx.strokeStyle=accentColor;ctx.lineWidth=2;ctx.lineJoin='round';
  ctx.beginPath();
  points.forEach((p,i)=>{
    const x=left+i*step;const y=top+H*(1-p.y/maxV);
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  ctx.stroke();
  // Points
  points.forEach((p,i)=>{
    const x=left+i*step;const y=top+H*(1-p.y/maxV);
    ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fillStyle=p.y>=10?'#178A6F':p.y>=7?'#E09B2F':'#D04040';
    ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=textColor;ctx.font='8px sans-serif';ctx.textAlign='center';
    ctx.fillText(p.label,x,140-2);
    ctx.fillStyle=p.y>=10?'#178A6F':p.y>=7?'#E09B2F':'#D04040';
    ctx.fillText(p.y.toFixed(1),x,y-8);
  });
}
function drawGradeBarChart(grades,stds,subj){
  const canvas=document.getElementById('grade-bar-chart');
  if(!canvas||grades.length===0||stds.length===0)return;
  const W=canvas.offsetWidth;canvas.width=W;canvas.height=150;
  const ctx=canvas.getContext('2d');
  const isDark=document.body.classList.contains('dark');
  const textColor=isDark?'#5A6490':'#8892B0';
  const s=subjById(subj);
  const data=stds.map(st=>{
    const gs=grades.filter(g=>g.sid===st.id&&g.max>0);
    const avg=gs.length>0?gs.reduce((a,g)=>a+g.score/g.max,0)/gs.length*20:null;
    return {name:st.name.split(' ')[0],avg};
  }).filter(d=>d.avg!=null).slice(0,8);
  if(data.length===0)return;
  const barW=Math.floor((W-50)/data.length)-6;
  const chartH=110;const top=10;const left=40;
  ctx.clearRect(0,0,W,150);
  [0,5,10,15,20].forEach(v=>{
    const y=top+chartH*(1-v/20);
    ctx.strokeStyle=isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)';
    ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(W-4,y);ctx.stroke();
    ctx.fillStyle=textColor;ctx.font='9px sans-serif';ctx.textAlign='right';
    ctx.fillText(v,left-3,y+3);
  });
  data.forEach((d,i)=>{
    const x=left+i*(barW+6);
    const h=chartH*(d.avg/20);
    const y=top+chartH-h;
    const col=d.avg>=14?'#178A6F':d.avg>=10?getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||s.color:d.avg>=7?'#E09B2F':'#D04040';
    ctx.fillStyle=col+'CC';
    roundRect(ctx,x,y,barW,h,4);ctx.fill();
    ctx.fillStyle=textColor;ctx.font='9px sans-serif';ctx.textAlign='center';
    ctx.fillText(d.name.slice(0,6),x+barW/2,148);
    ctx.fillStyle=col;ctx.font='bold 10px sans-serif';
    ctx.fillText(d.avg.toFixed(1),x+barW/2,y-4);
  });
}
function drawReportsChart(){
  const canvas=document.getElementById('reports-chart');
  if(!canvas)return;
  const W=canvas.offsetWidth;canvas.width=W;canvas.height=180;
  const ctx=canvas.getContext('2d');
  const isDark=document.body.classList.contains('dark');
  const textColor=isDark?'#5A6490':'#8892B0';
  // Donut chart: students by class
  const cx=W/2,cy=90,R=60,r=35;
  const total=DATA.students.length;
  if(total===0){
    ctx.fillStyle=textColor;ctx.font='13px sans-serif';ctx.textAlign='center';
    ctx.fillText('لا يوجد تلاميذ',cx,cy);return;
  }
  let startAngle=-Math.PI/2;
  CLASSES.forEach((c,i)=>{
    const n=studentsOf(c.id).length;
    const angle=n/total*Math.PI*2;
    const col=c.id==='1ere'?'#3B82F6':'#E55B20';
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,R,startAngle,startAngle+angle);
    ctx.closePath();
    ctx.fillStyle=col;ctx.fill();
    startAngle+=angle;
  });
  // Inner circle (donut hole)
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.fillStyle=isDark?'#131729':'#F0F2F8';ctx.fill();
  // Center text
  ctx.fillStyle=isDark?'#E8EAF6':'#1C2340';
  ctx.font='bold 18px sans-serif';ctx.textAlign='center';
  ctx.fillText(total,cx,cy+6);
  ctx.fillStyle=textColor;ctx.font='11px sans-serif';
  ctx.fillText('تلميذ',cx,cy+20);
  // Legend
  let lx=10;
  CLASSES.forEach((c,i)=>{
    const n=studentsOf(c.id).length;
    const col=c.id==='1ere'?'#3B82F6':'#E55B20';
    const ly=160+i*16;
    ctx.fillStyle=col;ctx.fillRect(10,ly-8,10,10);
    ctx.fillStyle=textColor;ctx.font='11px sans-serif';ctx.textAlign='right';
    ctx.fillText(`${c.short}: ${n}`,W-10,ly+2);
  });
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}