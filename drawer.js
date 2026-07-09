/* =================================================================
   DRAWER
================================================================= */
function openDrawer(){
  renderDrawer();
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('show');
  document.body.style.overflow='hidden';
}
function closeDrawer(){
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('show');
  document.body.style.overflow='';
}
function renderDrawer(){
  const items=[
    {key:'dashboard',    icon:IC.home,   color:'var(--accent)',  bg:'var(--accent-light)',label:'الرئيسية'},
    {key:'students',     icon:IC.user,   color:'var(--c1)',      bg:'var(--c1-bg)',       label:'التلاميذ',        count:DATA.students.length},
    {key:'lessons',      icon:IC.book,   color:'var(--math)',    bg:'var(--math-bg)',     label:'الدروس',          count:DATA.lessons.length},
    {key:'exercises',    icon:IC.pen,    color:'var(--phy)',     bg:'var(--phy-bg)',      label:'التمارين',        count:DATA.exercises.length},
    {key:'homework',     icon:IC.clip,   color:'var(--danger)',  bg:'var(--danger-light)',label:'الفروض',          count:DATA.homework.length},
    {key:'glossary',     icon:IC.book2,  color:'var(--purple)',  bg:'var(--purple-light)',label:'المصطلحات',       count:DATA.glossary.length},
    {key:'sessions',     icon:IC.clock,  color:'var(--accent)',  bg:'var(--accent-light)',label:'التخطيط الزمني',  count:DATA.sessions.length},
    {key:'attendance',   icon:IC.check,  color:'var(--green)',   bg:'var(--green-light)', label:'الحضور والغياب'},
    {key:'grades',       icon:IC.star,   color:'var(--amber)',   bg:'var(--amber-light)', label:'الأداء والنقاط'},
    {key:'payments',     icon:IC.money,  color:'var(--green)',   bg:'var(--green-light)', label:'الدفع الشهري'},
    {key:'reports',      icon:IC.chart,  color:'var(--purple)',  bg:'var(--purple-light)',label:'التقارير'},
    {key:'settings',     icon:IC.gear,   color:'var(--text-3)',  bg:'var(--surface-2)',   label:'الإعدادات'},
    {key:'data',         icon:IC.db,     color:'var(--text-3)',  bg:'var(--surface-2)',   label:'النسخ الاحتياطي'},
  ];
  document.getElementById('drawer-content').innerHTML=`
    <div class="drawer-section">
      ${items.map(it=>`
        <div class="drawer-item ${currentSection===it.key?'active':''}" onclick="closeDrawer();navigate('${it.key}')">
          <div class="di-icon" style="background:${it.bg};color:${it.color}">${it.icon}</div>
          <span>${it.label}</span>
          ${it.count!=null?`<span class="di-count">${it.count}</span>`:''}
        </div>`).join('')}
    </div>
    <div class="drawer-divider"></div>
    <div class="drawer-section" style="padding:12px 20px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:13px;font-weight:700;color:var(--text-3)">وضع الإدارة</span>
        <div class="toggle ${DATA.settings.adminMode?'on':''}" onclick="toggleAdminMode()"></div>
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-top:4px">تفعيل أدوات التعديل والحذف</div>
    </div>
  `;
}
function toggleAdminMode(){
  DATA.settings.adminMode = !DATA.settings.adminMode;
  save();
  applySettings();
  
  // تحديث شكل المفتاح في شاشة الإعدادات فوراً (بدون إعادة تحميل الصفحة)
  const adminToggle = document.getElementById('admin-toggle');
  if (adminToggle) {
    if (DATA.settings.adminMode) {
      adminToggle.classList.add('on');
    } else {
      adminToggle.classList.remove('on');
    }
  }
  
  // إعادة بناء الدرج فقط إذا كان ظاهراً (لتخفيف الحمل)
  const drawer = document.getElementById('drawer');
  if (drawer.classList.contains('open')) {
    renderDrawer();
  }
  
  toast(DATA.settings.adminMode ? 'وضع الإدارة مفعّل' : 'وضع الإدارة مُعطَّل', 'info');
}