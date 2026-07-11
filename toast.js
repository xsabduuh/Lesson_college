/* =================================================================
   TOAST
================================================================= */
function toast(msg,type=''){
  const el=document.createElement('div');
  el.className='toast'+(type?' '+type:'');
  el.textContent=msg;
  document.getElementById('toast-area').appendChild(el);
  setTimeout(()=>{
    el.style.transition='opacity .3s,transform .3s';
    el.style.opacity='0';el.style.transform='translateY(-8px)';
    setTimeout(()=>el.remove(),300);
  },2600);
}

/* =================================================================
   SHEET (MODAL)
================================================================= */
function showSheet(title,bodyHtml,actions=[]){
  const actHtml=actions.map(a=>`<button class="btn ${a.cls||'btn-outline'}" onclick="${a.fn}">${a.label}</button>`).join('');
  document.getElementById('sheet').innerHTML=`
    <div class="sheet-handle"><span></span></div>
    <div class="sheet-head">
      <h3>${title}</h3>
      <button class="btn-icon" onclick="closeSheet()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="sheet-body">${bodyHtml}</div>
    ${actHtml?`<div class="sheet-foot">${actHtml}</div>`:''}
  `;
  const overlay = document.getElementById('overlay');
  overlay.classList.add('show');
  overlay.addEventListener('touchmove', preventScroll, { passive: false });
}

function closeSheet(){
  const overlay = document.getElementById('overlay');
  overlay.classList.remove('show');
  overlay.removeEventListener('touchmove', preventScroll);
}

function preventScroll(e) {
  e.preventDefault();
}

function overlayClick(e){
  if(e.target===document.getElementById('overlay')) closeSheet();
}