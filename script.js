// تسجيل الدخول والتسجيل محليًا باستخدام LocalStorage
document.addEventListener('DOMContentLoaded', ()=>{
  const logged = localStorage.getItem('logged');
  if(logged){
    document.getElementById('auth-card').classList.add('hidden');
    document.getElementById('app-card').classList.remove('hidden');
    renderUser();
  }
});

function login(){
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  if(!email || !password){ alert('الرجاء إدخال البريد وكلمة المرور'); return; }
  localStorage.setItem('logged',true);
  localStorage.setItem('user_name', email.split('@')[0]);
  renderUser();
  document.getElementById('auth-card').classList.add('hidden');
  document.getElementById('app-card').classList.remove('hidden');
}

function register(){
  const firstName = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  if(!firstName || !lastName || !email || !password){ alert('الرجاء ملء جميع الحقول'); return; }
  localStorage.setItem('logged',true);
  localStorage.setItem('user_name',firstName);
  renderUser();
  document.getElementById('auth-card').classList.add('hidden');
  document.getElementById('app-card').classList.remove('hidden');
}

function renderUser(){
  document.getElementById('user-name').innerText = localStorage.getItem('user_name') || 'مستخدم';
}

function logout(){
  localStorage.removeItem('logged');
  localStorage.removeItem('user_name');
  location.reload();
}

// الرصيد التجريبي
if(!localStorage.getItem('demo_added')) localStorage.setItem('balance',1000);
function quickAdd(){
  if(localStorage.getItem('demo_added')){ alert('يمكنك إضافة الرصيد التجريبي مرة واحدة فقط'); return; }
  const amt = parseFloat(document.getElementById('quick-amount').value);
  if(isNaN(amt)||amt<=0) return;
  localStorage.setItem('balance',parseFloat(localStorage.getItem('balance')||0)+amt);
  localStorage.setItem('demo_added',true);
  alert('تم إضافة الرصيد التجريبي');
}

function quickReset(){
  localStorage.setItem('balance',1000);
  alert('تم إعادة ضبط الرصيد التجريبي');
}
