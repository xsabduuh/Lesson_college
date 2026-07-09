/* =================================================================
   NAVIGATION
================================================================= */
let currentSection='dashboard';
let currentStudentId=null;
let navHistory=['dashboard'];

let filAtt   ={cls:'1ere', date:today()};
let filGrades={cls:'1ere', subj:'math'};
let filSess  ={cls:'1ere', subj:'math'};
let filLess  ={cls:'1ere', subj:'math'};
let filExer  ={cls:'1ere', subj:'math'};
let filHW    ={cls:'1ere', subj:'math'};
let filPay   ={cls:'1ere'};
let filStud  ={cls:'1ere', q:''};
let filGloss ={subj:'math'};

const SECTION_TITLES={
  dashboard:'مساعد الأستاذ',
  students:'التلاميذ',
  attendance:'الحضور والغياب',
  grades:'النقاط والأداء',
  sessions:'التخطيط الزمني',
  lessons:'الدروس',
  exercises:'التمارين',
  homework:'الفروض',
  payments:'الدفع الشهري',
  glossary:'المصطلحات',
  reports:'التقارير',
  settings:'الإعدادات',
  data:'النسخ الاحتياطي',
  'student-detail':'بطاقة التلميذ',
  search:'البحث',
};
const MAIN_NAVS=['dashboard','students','attendance','grades','settings'];
const NO_FAB=['settings','data','reports','search'];

function _nav(key,extra){
  document.querySelectorAll('.section').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn=>{
    const k=MAIN_NAVS.includes(key)?key:'';
    btn.classList.toggle('active',btn.dataset.nav===k);
  });
  const fab=document.getElementById('main-fab');
  fab.style.display=NO_FAB.includes(key)?'none':'flex';
  currentSection=key;
  document.getElementById('topbar-title').textContent=SECTION_TITLES[key]||key;
  const sec=document.getElementById('sec-'+key);
  if(sec){ sec.classList.add('active'); document.getElementById('page-content').scrollTop=0; }
  // Render
  const renderers={
    dashboard:renderDashboard,
    students:renderStudents,
    attendance:renderAttendance,
    grades:renderGrades,
    sessions:renderSessions,
    lessons:renderLessons,
    exercises:renderExercises,
    homework:renderHomework,
    payments:renderPayments,
    glossary:renderGlossary,
    reports:renderReports,
    settings:renderSettings,
    data:renderData,
    search:renderSearch,
  };
  if(key==='student-detail') renderStudentDetail(extra);
  else if(renderers[key]) renderers[key]();
}
function navigate(key,extra,noHistory){
  if(!noHistory) navHistory.push(key+(extra?'|'+extra:''));
  _nav(key,extra);
  localStorage.setItem('lastNav',key+'|'+(extra||''));
}
function goBack(){
  navHistory.pop();
  const prev=navHistory[navHistory.length-1]||'dashboard';
  const [k,e]=prev.split('|');
  _nav(k,e);
}
function updateBadges(){
  const nd=document.getElementById('nd-students');
  if(nd){
    const n=DATA.students.length;
    nd.textContent=n;
    nd.classList.toggle('show',n>0);
  }
}

/* =================================================================
   FAB
================================================================= */
function handleFab(){
  const s=currentSection;
  if(s==='students')    openStudentForm();
  else if(s==='attendance') toast('اختر التاريخ وانقر على حالة كل تلميذ','info');
  else if(s==='grades') openGradeForm();
  else if(s==='sessions') openSessionForm();
  else if(s==='lessons')  openLessonForm();
  else if(s==='exercises') openExerciseForm();
  else if(s==='homework') openHomeworkForm();
  else if(s==='payments') openPaymentSheet();
  else if(s==='glossary') openGlossaryForm();
  else openStudentForm();
}