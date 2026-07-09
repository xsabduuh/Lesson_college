/* =================================================================
   PAYMENTS (الدفع الشهري)
================================================================= */
function renderPayments(){
  const cls=filPay.cls;
  const stds=studentsOf(cls);
  const months=getYearMonths();
  const sec=document.getElementById('sec-payments');
  let totalPaid=0,totalUnpaid=0;
  stds.forEach(s=>{
    const fee=s.fee||DATA.settings.defaultFee;
    const pays=DATA.payments.filter(p=>p.sid===s.id);
    totalPaid+=pays.reduce((a,p)=>a+Number(p.paid||0),0);
    const paidMonths=pays.filter(p=>p.status==='paid').length;
    totalUnpaid+=(months.length-paidMonths)*fee;
  });
  sec.innerHTML=`
    ${classTabsHtml(cls,"setPayCls")}
    <div class="stat-grid" style="margin-bottom:12px">
      <div class="stat-card" style="border-top:3px solid var(--green)">
        <div class="s-label">المداخيل المجموعة</div>
        <div class="s-val" style="color:var(--green);font-size:22px">${totalPaid}</div>
        <div class="s-sub">درهم مغربي</div>
      </div>
      <div class="stat-card" style="border-top:3px solid var(--danger)">
        <div class="s-label">المبالغ غير المؤداة</div>
        <div class="s-val" style="color:var(--danger);font-size:22px">${totalUnpaid}</div>
        <div class="s-sub">درهم مغربي</div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title">حالة الأداء لكل تلميذ</div>
      ${stds.length===0?emptyHtml('لا يوجد تلاميذ','أضف تلاميذ أولاً')
      :stds.map(s=>{
          const fee=s.fee||DATA.settings.defaultFee;
          const pays=DATA.payments.filter(p=>p.sid===s.id);
          const paidM=pays.filter(p=>p.status==='paid').length;
          const pct=months.length>0?Math.round(paidM/months.length*100):0;
          return `<div class="card-item" onclick="navigate('student-detail','${s.id}');setTimeout(()=>setDetailTab('payments','${s.id}'),50)">
            <div class="card-item-icon" style="background:${classBg(s.cls)};color:${classColor(s.cls)};font-size:16px;font-weight:800">${s.name.charAt(0)}</div>
            <div class="card-item-body">
              <div class="card-item-title">${esc(s.name)}</div>
              <div style="margin-top:6px">
                <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${pct>=75?'var(--green)':pct>=50?'var(--amber)':'var(--danger)'}"></div></div>
              </div>
              <div style="font-size:11px;color:var(--text-3);margin-top:3px">${paidM}/${months.length} أشهر · ${fee} د.م/شهر</div>
            </div>
            <span style="color:var(--text-3)">${IC.chev}</span>
          </div>`;}).join('')}
    </div>`;
}
function setPayCls(cls){ filPay.cls=cls; renderPayments(); }
function openPaymentSheet(){
  // Navigate to student detail payments tab
  toast('اختر تلميذاً لتسجيل الأداء','info');
  navigate('payments');
}