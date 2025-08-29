// ==========================
// الجلسة والتحقق من تسجيل الدخول
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if(user) {
    showApp(user);
  } else {
    showLogin();
  }

  // صفحات التداول
  if(document.getElementById('tradeChart')){
    if(!user) { location.href = "index.html"; return; }
    const sel = document.getElementById('trade-symbol');
    sel.addEventListener('change', () => loadMarket(sel.value));
    loadMarket(sel.value);
  }

  // الاستثمار
  if(document.getElementById('invest-type')){
    if(!user) { location.href = "index.html"; return; }
  }

  // الإيداع
  if(document.getElementById('deposit-address')){
    if(!user) { location.href = "index.html"; return; }
  }

  // الألعاب
  if(document.getElementById('crash-bet')){
    if(!user) { location.href = "index.html"; return; }
  }

  // لوحة عامة تعليقات وهمية
  generatePublicFeed();
});

// ==========================
// الوظائف الأساسية
// ==========================
function showApp(user){
  document.getElementById('auth-card').classList.add('hidden');
  document.getElementById('app-card').classList.remove('hidden');
  document.getElementById('user-name').innerText = user.firstName;
  document.getElementById('user-id').innerText = `ID: ${user.id}`;
  if(!localStorage.getItem('demoAdded')){
    document.getElementById('current-balance').innerText = 500; // رصيد تجريبي
    localStorage.setItem('demoAdded', 'true');
  } else {
    document.getElementById('current-balance').innerText = user.balance || 0;
  }
}

function showLogin(){
  document.getElementById('auth-card').classList.remove('hidden');
  document.getElementById('login-block').classList.remove('hidden');
  document.getElementById('register-block').classList.add('hidden');
}

function showRegister(){
  document.getElementById('login-block').classList.add('hidden');
  document.getElementById('register-block').classList.remove('hidden');
}

function logout(){
  localStorage.removeItem('user');
  location.reload();
}

function forgotPassword(){
  alert("يرجى التواصل مع الدعم الفني لاستعادة كلمة المرور.");
}

// ==========================
// تسجيل حساب جديد
// ==========================
function register(){
  const user = {
    id: 'U' + Math.floor(Math.random()*100000),
    firstName: document.getElementById('first-name').value,
    lastName: document.getElementById('last-name').value,
    email: document.getElementById('reg-email').value,
    phone: document.getElementById('phone').value,
    balance: 0
  };
  localStorage.setItem('user', JSON.stringify(user));
  showApp(user);
}

// ==========================
// تسجيل دخول
// ==========================
function login(){
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if(user && user.email === email){
    showApp(user);
  } else {
    alert("البريد الإلكتروني غير مسجل أو خاطئ.");
  }
}

// ==========================
// إضافة رصيد تجريبي مرة واحدة
// ==========================
function quickAdd(){
  const user = JSON.parse(localStorage.getItem("user"));
  if(!localStorage.getItem('demoAdded')){
    user.balance += parseFloat(document.getElementById('quick-amount').value);
    localStorage.setItem('demoAdded', 'true');
    localStorage.setItem('user', JSON.stringify(user));
    document.getElementById('current-balance').innerText = user.balance;
    alert("تم إضافة الرصيد التجريبي.");
  } else {
    alert("يمكنك إضافة الرصيد التجريبي مرة واحدة فقط.");
  }
}

function quickReset(){
  localStorage.removeItem('demoAdded');
  const user = JSON.parse(localStorage.getItem("user"));
  user.balance = 0;
  localStorage.setItem('user', JSON.stringify(user));
  document.getElementById('current-balance').innerText = user.balance;
}

// ==========================
// لوحة عامة تعليقات وهمية
// ==========================
function generatePublicFeed(){
  const feed = document.getElementById('public-feed');
  if(!feed) return;

  const comments = [
    "لقد ربحت 1000$ من هذا التطبيق!",
    "تجربة رائعة وسهلة الاستخدام.",
    "الدعم الفني ممتاز 👍",
    "حصلت على أرباح كبيرة خلال أيام.",
    "واجهة التطبيق سلسة واحترافية.",
    "رائع! أنصح الجميع بتجربته."
  ];

  let i = 0;
  setInterval(() => {
    const div = document.createElement('div');
    div.classList.add('feed-item');
    div.innerHTML = `<i class="fas fa-user-circle"></i> مستخدم وهمي: ${comments[i]}`;
    feed.prepend(div);
    i = (i + 1) % comments.length;
  }, 3000);
}

// ==========================
// تداول - مثال
// ==========================
function loadMarket(symbol){
  document.getElementById('trade-price').innerText = (Math.random()*50000+1000).toFixed(2);
  document.getElementById('trade-change').innerText = (Math.random()*20-10).toFixed(2) + "%";
}

// ==========================
// شراء/بيع - مثال
// ==========================
function doTrade(type){
  const user = JSON.parse(localStorage.getItem("user"));
  const amount = parseFloat(document.getElementById('trade-amount').value);
  if(!amount) return alert("أدخل المبلغ.");
  if(user.balance < amount){
    alert("رصيدك غير كافٍ، يرجى الإيداع أولاً.");
    return;
  }
  if(type === 'buy'){
    user.balance -= amount; // مثال خصم
    alert(`تم شراء العقد بمبلغ ${amount} USDT`);
  } else {
    user.balance -= amount;
    alert(`تم بيع العقد بمبلغ ${amount} USDT`);
  }
  localStorage.setItem('user', JSON.stringify(user));
  document.getElementById('current-balance').innerText = user.balance;
}
