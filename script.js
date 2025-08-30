// تسجيل الدخول
function login(){
  const email=document.getElementById('login-email').value.trim();
  const pass=document.getElementById('login-password').value.trim();
  if(!email||!pass){ alert('أدخل جميع البيانات'); return; }
  localStorage.setItem('user-email', email);
  localStorage.setItem('logged', 'true');
  localStorage.setItem('current-balance', localStorage.getItem('current-balance')||'0');
  window.location.href='index.html'; // يبقى مسجلاً
}

// تسجيل حساب جديد
function register(){
  const name=document.getElementById('reg-name').value.trim();
  const email=document.getElementById('reg-email').value.trim();
  const pass=document.getElementById('reg-password').value.trim();
  if(!name||!email||!pass){ alert('أدخل جميع البيانات'); return; }
  localStorage.setItem('user-name', name);
  localStorage.setItem('user-email', email);
  localStorage.setItem('logged','true');
  localStorage.setItem('current-balance','0');
  window.location.href='index.html';
}

function showRegister(){ document.getElementById('login-block').classList.add('hidden'); document.getElementById('register-block').classList.remove('hidden'); }
function showLogin(){ document.getElementById('login-block').classList.remove('hidden'); document.getElementById('register-block').classList.add('hidden'); }
function forgotPassword(){ alert('اتصل بالدعم الفني لاستعادة كلمة السر'); }

// محفظة
function copyDepositAddress(){
  const addr=document.getElementById('deposit-address').innerText;
  navigator.clipboard.writeText(addr);
  alert('تم نسخ العنوان');
}

// Crash Game
function crashStart(){
  const bet=parseFloat(document.getElementById('crash-bet').value||0);
  if(isNaN(bet)||bet<=0){ alert('أدخل مبلغ صالح'); return; }
  const plane=document.getElementById('plane');
  plane.style.top='-50px';
  setTimeout(()=>{ document.getElementById('game-log').innerHTML+='<p>لقد خسرت '+bet+'$ 😢</p>'; },1500);
}
function crashCashOut(){ alert('تم سحب الرهان (مثال)'); }
