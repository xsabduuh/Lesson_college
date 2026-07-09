/* =================================================================
   ROUTER.JS — Navigation, Filter State, FAB
   ملاحظة: today(), fdate(), monthLabel(), currentYM(), getYearMonths(),
           applySettings(), shadeColor(), hexToLight(), studentsOf()
           معرَّفة في data.js — لا تُكرَّر هنا
           toggleAdminMode() معرَّفة في drawer.js
================================================================= */

/* -----------------------------------------------------------------
   FILTER STATE — حالة الفلاتر لكل صفحة
----------------------------------------------------------------- */
let currentStudentId = null;

let filStud  = { cls: '1ere', q: '' };
let filAtt   = { cls: '1ere', date: '' };   // date تُعيَّن في init()
let filSess  = { cls: '1ere', subj: 'math' };
let filGrade = { cls: '1ere', subj: 'math' };
let filPay   = { cls: '1ere' };
let filLess  = { cls: '1ere', subj: 'math' };
let filExer  = { cls: '1ere', subj: 'math' };
let filHW    = { cls: '1ere', subj: 'math' };
let filGloss = { subj: 'math' };

/* -----------------------------------------------------------------
   NAVIGATION STATE
----------------------------------------------------------------- */
let currentSection = 'dashboard';
let navHistory = [];

const NAV_TITLES = {
  dashboard:        'مساعد الأستاذ',
  students:         'التلاميذ',
  attendance:       'الحضور',
  grades:           'النقاط',
  sessions:         'التخطيط الزمني',
  lessons:          'الدروس',
  exercises:        'التمارين',
  homework:         'الفروض',
  glossary:         'المصطلحات',
  payments:         'المدفوعات',
  reports:          'التقارير',
  settings:         'الإعدادات',
  'student-detail': 'ملف التلميذ',
  search:           'البحث',
  data:             'إدارة البيانات'
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

const MAIN_SECTIONS = ['dashboard', 'students', 'attendance', 'grades', 'settings'];

/* الصفحات التي يظهر فيها زر الإضافة العائم (FAB) */
const FAB_SECTIONS = {
  students:  () => openStudentForm(),
  grades:    () => openGradeForm(),
  sessions:  () => openSessionForm(),
  lessons:   () => openLessonForm(),
  exercises: () => openExerciseForm(),
  homework:  () => openHomeworkForm(),
  glossary:  () => openGlossaryForm(),
};

/* -----------------------------------------------------------------
   navigate(key, extra)
----------------------------------------------------------------- */
function navigate(key, extra) {
  if (!key) key = 'dashboard';

  /* حفظ الصفحة الحالية في السجل (تفادي التكرار) */
  if (currentSection && currentSection !== key) {
    navHistory.push({ key: currentSection });
    if (navHistory.length > 30) navHistory.shift();
  }

  currentSection = key;
  localStorage.setItem('lastNav', extra ? key + '|' + extra : key);

  /* إظهار القسم المطلوب وإخفاء الباقي */
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById('sec-' + key);
  if (sec) sec.classList.add('active');

  /* عنوان الشريط العلوي */
  const titleEl = document.getElementById('topbar-title');
  if (titleEl) titleEl.textContent = NAV_TITLES[key] || '';

  /* زر الرجوع ← أو زر القائمة ☰ */
  const isMain = MAIN_SECTIONS.includes(key);
  const topbar = document.getElementById('topbar');
  if (topbar) {
    const existingMenu = topbar.querySelector('.menu-btn');
    const existingBack = topbar.querySelector('.back-btn');

    if (!isMain && !existingBack) {
      /* نضع زر الرجوع بدل زر القائمة */
      const backBtn = document.createElement('button');
      backBtn.className = 'back-btn';
      backBtn.setAttribute('onclick', 'navigateBack()');
      backBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <polyline points="15 18 9 12 15 6"/></svg>`;
      if (existingMenu) existingMenu.replaceWith(backBtn);
    } else if (isMain && existingBack) {
      /* نعيد زر القائمة */
      const menuBtn = document.createElement('button');
      menuBtn.className = 'menu-btn';
      menuBtn.setAttribute('onclick', 'openDrawer()');
      menuBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/></svg>`;
      existingBack.replaceWith(menuBtn);
    }
  }

  /* تحديث الشريط السفلي */
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.nav === key);
  });

  /* إظهار / إخفاء زر الإضافة العائم */
  const fab = document.getElementById('main-fab');
  if (fab) {
    fab.style.display = FAB_SECTIONS[key] ? '' : 'none';
  }

  /* تصيير محتوى الصفحة */
  if (RENDER_MAP[key]) {
    RENDER_MAP[key](extra);
  }

  window.scrollTo(0, 0);
}

/* -----------------------------------------------------------------
   navigateBack() — الرجوع للصفحة السابقة
----------------------------------------------------------------- */
function navigateBack() {
  if (navHistory.length > 0) {
    const prev = navHistory.pop();
    currentSection = ''; /* تفادي إضافة الصفحة الحالية للسجل مرة أخرى */
    navigate(prev.key, prev.extra);
  } else {
    navigate('dashboard');
  }
}

/* -----------------------------------------------------------------
   handleFab() — ينفّذ إجراء زر الإضافة حسب الصفحة الحالية
----------------------------------------------------------------- */
function handleFab() {
  if (FAB_SECTIONS[currentSection]) {
    FAB_SECTIONS[currentSection]();
  }
}

/* -----------------------------------------------------------------
   updateBadges() — تحديث عدادات الشريط السفلي
----------------------------------------------------------------- */
function updateBadges() {
  const nd = document.getElementById('nd-students');
  if (nd) {
    nd.textContent = DATA.students.length > 0 ? DATA.students.length : '';
    nd.style.display = DATA.students.length > 0 ? '' : 'none';
  }
}
