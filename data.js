/* =================================================================
   CONSTANTS
================================================================= */
const SK = 'tutorV4';
const CLASSES = [
  { id:'1ere', label:'1ère Collège', color:'var(--c1)', bg:'var(--c1-bg)', short:'1ère' },
  { id:'2eme', label:'2ème Collège', color:'var(--c2)', bg:'var(--c2-bg)', short:'2ème' }
];
const SUBJECTS = [
  { id:'math', label:'Mathématiques', short:'Maths',   color:'var(--math)', bg:'var(--math-bg)', cls:'math' },
  { id:'phy',  label:'Physique-Chimie', short:'Physique', color:'var(--phy)',  bg:'var(--phy-bg)',  cls:'phy'  },
  { id:'svt',  label:'SVT',            short:'SVT',    color:'var(--svt)',  bg:'var(--svt-bg)',  cls:'svt'  }
];
const GRADE_TYPES = ['فرض محروس','اختبار','مشاركة','ملاحظة','فرض منزلي'];
const ATT_STATUS  = { present:'حاضر', absent:'غائب', late:'متأخر' };
const PAY_STATUS  = { paid:'مدفوع', unpaid:'غير مدفوع', partial:'جزئي', late:'متأخر', none:'—' };
const PAY_STATUS_CLS = { paid:'paid', unpaid:'unpaid', partial:'partial', late:'late', none:'none' };
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليوز','غشت','شتنبر','أكتوبر','نونبر','دجنبر'];
const LEVEL_COLORS = {
  'سهل':'badge-green','متوسط':'badge-amber','صعب':'badge-red','تحدٍّ':'badge-blue'
};
const ACCENT_COLORS = [
  {name:'أزرق داكن',val:'#3B4FC0'},
  {name:'أخضر',val:'#178A6F'},
  {name:'بنفسجي',val:'#7C3AED'},
  {name:'برتقالي',val:'#D05A20'},
  {name:'وردي',val:'#C0396A'},
  {name:'سماوي',val:'#0891B2'},
];

function subjById(id){ return SUBJECTS.find(s=>s.id===id)||SUBJECTS[0] }
function clsById(id){  return CLASSES.find(c=>c.id===id)||CLASSES[0]  }

/* =================================================================
   DATA
================================================================= */
function defaultData(){
  return {
    students:[],
    sessions:[],
    attendance:[],
    grades:[],
    payments:[],      // monthly subscription payments
    lessons:[],
    exercises:[],
    homework:[],
    glossary:[],
    settings:{
      defaultFee:200,
      darkMode:false,
      accentColor:'#3B4FC0',
      adminMode:false
    }
  };
}
let DATA = (function(){
  try{
    const r=localStorage.getItem(SK);
    if(r){
      const p=JSON.parse(r);
      const merged={...defaultData(),...p};
      merged.settings={...defaultData().settings,...(p.settings||{})};
      return merged;
    }
    // Migrate from old key
    const old=localStorage.getItem('tutorV3');
    if(old){
      const p=JSON.parse(old);
      const d=defaultData();
      return {...d,...p,settings:{...d.settings,...(p.settings||{})}};
    }
    return defaultData();
  }catch(e){return defaultData();}
})();

function save(){ localStorage.setItem(SK,JSON.stringify(DATA)); updateBadges(); }
function uid(){ return '_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function esc(s){ if(s==null)return''; return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }
function today(){ return new Date().toISOString().slice(0,10); }
function currentYM(){ return new Date().toISOString().slice(0,7); }
function fdate(d){ if(!d)return'—'; const p=d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; }
function monthLabel(ym){ if(!ym)return'—'; const [y,m]=ym.split('-'); return (MONTHS_AR[+m-1]||ym)+' '+y; }
function getYearMonths(){ 
  const months=[];
  const now=new Date();
  const yr=now.getFullYear();
  // Academic year Sep → Jun
  const start=now.getMonth()<8?yr-1:yr;
  for(let m=8;m<12;m++) months.push(`${start}-${String(m+1).padStart(2,'0')}`);
  for(let m=0;m<6;m++) months.push(`${start+1}-${String(m+1).padStart(2,'0')}`);
  return months;
}

/* =================================================================
   APPLY SETTINGS
================================================================= */
function applySettings(){
  document.body.classList.toggle('dark',!!DATA.settings.darkMode);
  document.body.classList.toggle('admin-mode',!!DATA.settings.adminMode);
  const r=document.documentElement;
  const c=DATA.settings.accentColor||'#3B4FC0';
  r.style.setProperty('--accent',c);
  r.style.setProperty('--accent-dark',shadeColor(c,-15));
  r.style.setProperty('--accent-light',hexToLight(c));
}
function shadeColor(hex,pct){
  const n=parseInt(hex.slice(1),16);
  const r=Math.min(255,Math.max(0,(n>>16)+(pct*2.55|0)));
  const g=Math.min(255,Math.max(0,((n>>8)&0xff)+(pct*2.55|0)));
  const b=Math.min(255,Math.max(0,(n&0xff)+(pct*2.55|0)));
  return `#${(r<<16|g<<8|b).toString(16).padStart(6,'0')}`;
}
function hexToLight(hex){
  const n=parseInt(hex.slice(1),16);
  const r=(n>>16);const g=(n>>8)&0xff;const b=n&0xff;
  if(document.body.classList.contains('dark'))
    return `rgba(${r},${g},${b},0.18)`;
  return `rgba(${r},${g},${b},0.12)`;
}