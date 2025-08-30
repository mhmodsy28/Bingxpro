// عند تحميل الصفحة، تحقق من تسجيل الدخول
document.addEventListener('DOMContentLoaded', ()=>{
  if(localStorage.getItem('logged')==='true'){
    window.location.href='app.html'; // فتح الواجهة الرئيسية إذا كان مسجلًا
  }
});

// تسجيل الدخول
function login(){
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value.trim();
  const users = JSON.parse(localStorage.getItem('users')||'[]');
  const user = users.find(u=>u.email===email && u.password===pass);
  if(user){
    localStorage.setItem('logged','true');
    localStorage.setItem('current-user',JSON.stringify(user));
    alert('تم تسجيل الدخول بنجاح');
    window.location.href='app.html';
  } else {
    alert('البريد أو كلمة المرور غير صحيحة');
  }
}

// إنشاء حساب وتسجيل تلقائي
function register(){
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-password').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const country = document.getElementById('reg-country').value;
  if(!name||!email||!pass||!phone||!country){
    alert('يرجى ملء جميع الحقول');
    return;
  }
  let users = JSON.parse(localStorage.getItem('users')||'[]');
  if(users.some(u=>u.email===email)){
    alert('هذا البريد مستخدم مسبقاً');
    return;
  }
  const user = {name,email,password:pass,phone,country,id:'USER'+Date.now(),balance:0};
  users.push(user);
  localStorage.setItem('users',JSON.stringify(users));
  localStorage.setItem('logged','true');
  localStorage.setItem('current-user',JSON.stringify(user));
  alert('تم إنشاء الحساب وتسجيل الدخول تلقائياً');
  window.location.href='app.html';
}

// عرض التسجيل أو الدخول
function showRegister(){ document.getElementById('login-block').classList.add('hidden'); document.getElementById('register-block').classList.remove('hidden'); }
function showLogin(){ document.getElementById('login-block').classList.remove('hidden'); document.getElementById('register-block').classList.add('hidden'); }
function forgotPassword(){ alert('اتصل بالدعم الفني لاستعادة كلمة السر'); }
