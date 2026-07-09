/* =================================================================
   DATE HELPERS
================================================================= */
function today(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function fdate(d){
  if(!d) return '';
  const parts = d.split('-');
  if(parts.length < 3) return d;
  return `${parseInt(parts[2])} ${MONTHS_AR[parseInt(parts[1])-1]} ${parts[0]}`;
}
function monthLabel(ym){
  if(!ym) return '';
  const parts = ym.split('-');
  return `${MONTHS_AR[parseInt(parts[1])-1]} ${parts[0]}`;
}
function currentYM(){
  return today().slice(0,7);
}

/* =================================================================
   FILTER STATE
================================================================= */
let filStud  = { cls:'1ere', q:'' };
let filAtt   = { cls:'1ere', date:'' };
let filSess  = { cls:'1ere', subj:'math' };
let filGrade = { cls:'1ere', subj:'math' };
let filPay   = { cls:'1ere', ym:'' };
let filLess  = { cls:'1ere', subj:'math' };
let filExer  = { cls:'1ere', subj:'math' };
let filHW    = { cls:'1ere', subj:'math' };
let filGloss = { subj:'math' };

/* =================================================================
   NAVIGATION
================================================================= */
let currentSection = 'dashboard';
let navHistory = [];

const NAV_TITLES = {
  dashboard:       'مساعد الأستاذ',
  students:        'التلاميذ',
  attendance:      'الحضور',
  grades:          'النقاط',
  sessions:        'التخطيط الزمني',
  lessons:         'الدروس',
  exercises:       'التمارين',
  homework:        'الفروض',
  glossary:        'المصطلحات',
  payments:        'المدفوعات',
  reports:         'التقارير',
  settings:        'الإعدادات',
  'student-detail':'ملف التلميذ',
  search:          'البحث',
  data:            'إدارة البيانات'
};

const RENDER_MAP = {
  dashboard:        ()    => renderDashboard(),
  students:         ()    => renderStudents(),
  attendance:       ()    => renderAttendance(),
  grades:           ()    => renderGrades(),
  sessions:         ()    => renderSessions(),
  lessons:          ()    => renderLessons(),
  exercises:        ()    => renderExercises(),
  homework:         ()    => renderHomework(),
  glossary:         ()    => renderGlossary(),
  payments:         ()    => renderPayments(),
  reports:          ()    => renderReports(),
  settings:         ()    => renderSettings(),
  'student-detail': (id)  => renderStudentDetail(id),
  search:           ()    => renderSearch(),
  data:             ()    => renderData()
};

const MAIN_SECTIONS = ['dashboard','students','attendance','grades','settings'];

function navigate(key, extra){
  if(!key) key = 'dashboard';

  // Push current to history
  if(currentSection && currentSection !== key){
    navHistory.push({ key: currentSection });
    if(navHistory.length > 30) navHistory.shift();
  }

  currentSection = key;
  localStorage.setItem('lastNav', extra ? key + '|' + extra : key);

  // Switch visible section
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById('sec-' + key);
  if(sec) sec.classList.add('active');

  // Topbar title
  const titleEl = document.getElementById('topbar-title');
  if(titleEl) titleEl.textContent = NAV_TITLES[key] || '';

  // Back button vs menu button
  const isMain = MAIN_SECTIONS.includes(key);
  const topbar = document.getElementById('topbar');
  if(topbar){
    const existingMenu = topbar.querySelector('.menu-btn');
    const existingBack = topbar.querySelector('.back-btn');

    if(!isMain && !existingBack){
      // Replace menu btn with back btn
      const backBtn = document.createElement('button');
      backBtn.className = 'back-btn';
      backBtn.setAttribute('onclick','navigateBack()');
      backBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>`;
      if(existingMenu) existingMenu.replaceWith(backBtn);
    } else if(isMain && !existingMenu && existingBack){
      // Replace back btn with menu btn
      const menuBtn = document.createElement('button');
      menuBtn.className = 'menu-btn';
      menuBtn.setAttribute('onclick','openDrawer()');
      menuBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
      existingBack.replaceWith(menuBtn);
    }
  }

  // Update bottom nav active state
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.nav === key);
  });

  // Render section content
  if(RENDER_MAP[key]){
    RENDER_MAP[key](extra);
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

function navigateBack(){
  if(navHistory.length > 0){
    const prev = navHistory.pop();
    currentSection = ''; // avoid re-pushing to history
    navigate(prev.key, prev.extra);
  } else {
    navigate('dashboard');
  }
}

function updateBadges(){
  // Badge counts can be extended here
  // Currently no badges on bottom nav
}

/* =================================================================
   SETTINGS APPLY
================================================================= */
function applySettings(){
  const s = DATA.settings || {};

  // Dark mode
  document.body.classList.toggle('dark', !!s.darkMode);

  // Accent color
  const color = s.accentColor || '#3B4FC0';
  document.documentElement.style.setProperty('--accent', color);

  // Accent light (needs hexToLight from dashboard.js — available after all scripts load)
  if(typeof hexToLight === 'function'){
    document.documentElement.style.setProperty('--accent-light', hexToLight(color));
  }

  // Admin badge
  const topbarRight = document.getElementById('topbar-right');
  if(topbarRight){
    let adminBadgeEl = topbarRight.querySelector('.admin-badge');
    if(s.adminMode){
      if(!adminBadgeEl){
        adminBadgeEl = document.createElement('span');
        adminBadgeEl.className = 'admin-badge';
        adminBadgeEl.textContent = 'ADMIN';
        topbarRight.prepend(adminBadgeEl);
      }
    } else {
      if(adminBadgeEl) adminBadgeEl.remove();
    }
  }
}

function toggleAdminMode(){
  DATA.settings.adminMode = !DATA.settings.adminMode;
  save();
  applySettings();
  renderSettings();
}
