/* =================================================================
   SETTINGS (الإعدادات)
================================================================= */
function renderSettings(){
  const s=DATA.settings;
  const sec=document.getElementById('sec-settings');
  sec.innerHTML=`
    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">المظهر</div>
      <div class="setting-row">
        <div>
          <div class="setting-label">${s.darkMode?IC.moon:IC.sun} الوضع الليلي</div>
          <div class="setting-sub">تغيير مظهر التطبيق</div>
        </div>
        <div class="toggle ${s.darkMode?'on':''}" onclick="toggleDark()"></div>
      </div>
      <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:12px">
        <div>
          <div class="setting-label">اللون الرئيسي</div>
          <div class="setting-sub">تخصيص لون واجهة التطبيق</div>
        </div>
        <div class="color-options">
          ${ACCENT_COLORS.map(c=>`
            <div class="color-opt ${(s.accentColor||'#3B4FC0')===c.val?'selected':''}"
              style="background:${c.val}" title="${c.name}"
              onclick="setAccent('${c.val}')"></div>`).join('')}
        </div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">الإدارة</div>
      <div class="setting-row">
        <div>
          <div class="setting-label">وضع الإدارة</div>
          <div class="setting-sub">إظهار أزرار التعديل والحذف</div>
        </div>
        <div class="toggle ${s.adminMode?'on':''}" onclick="toggleAdminMode()"></div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">الإعدادات الافتراضية</div>
      <div class="setting-row">
        <div class="setting-label">الأجر الشهري الافتراضي</div>
        <div style="display:flex;align-items:center;gap:8px">
          <input id="set-fee" type="number" class="field" style="width:90px;padding:7px 10px;text-align:center" value="${s.defaultFee||200}">
          <span style="font-size:13px;color:var(--text-3)">د.م</span>
          <button class="btn btn-accent btn-sm" onclick="saveFee()">حفظ</button>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:12px">
      <div class="panel-title">البيانات</div>
      <div style="display:flex;flex-direction:column;gap:0">
        <div class="setting-row" style="cursor:pointer" onclick="exportData()">
          <div>
            <div class="setting-label">تصدير البيانات</div>
            <div class="setting-sub">حفظ نسخة احتياطية بصيغة JSON</div>
          </div>
          <span style="color:var(--accent)">${IC.chev}</span>
        </div>
        <div class="setting-row" style="cursor:pointer" onclick="document.getElementById('import-input').click()">
          <div>
            <div class="setting-label">استيراد البيانات</div>
            <div class="setting-sub">استعادة من ملف JSON</div>
          </div>
          <span style="color:var(--accent)">${IC.chev}</span>
        </div>
        <div class="setting-row" style="cursor:pointer" onclick="resetData()">
          <div>
            <div class="setting-label" style="color:var(--danger)">مسح جميع البيانات</div>
            <div class="setting-sub">حذف كل البيانات نهائياً</div>
          </div>
          <span style="color:var(--danger)">${IC.chev}</span>
        </div>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:var(--text-3);padding:8px">مساعد الأستاذ v4.0 · جميع البيانات محفوظة محلياً</p>
  `;
}
function toggleDark(){
  DATA.settings.darkMode=!DATA.settings.darkMode;
  save();applySettings();renderSettings();
  // Update accent light after dark mode switch
  setTimeout(()=>{ const c=DATA.settings.accentColor||'#3B4FC0'; document.documentElement.style.setProperty('--accent-light',hexToLight(c)); },50);
}
function setAccent(val){
  DATA.settings.accentColor=val;
  save();applySettings();renderSettings();
}
function saveFee(){
  const v=+document.getElementById('set-fee').value;
  if(v<=0){toast('أدخل مبلغاً صحيحاً','error');return;}
  DATA.settings.defaultFee=v;
  save();toast('تم الحفظ','success');
}