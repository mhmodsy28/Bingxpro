/* SCRIPT مشترك: تسجيل/دخول/رصيد/إجراءات */
const STORAGE_USERS_KEY = 'bx_users_v1';
const STORAGE_LOGGED_KEY = 'bx_logged_user_v1';

/* ===== مساعدات المستخدمين ===== */
function getAllUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]');
}
function saveAllUsers(users) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}
function findUserByEmail(email) {
  if (!email) return null;
  const users = getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}
function saveOrUpdateUser(user) {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
  if (idx === -1) users.push(user); else users[idx] = user;
  saveAllUsers(users);
}

/* ===== حالة الجلسة ===== */
function setLoggedUser(user) {
  localStorage.setItem(STORAGE_LOGGED_KEY, JSON.stringify(user));
}
function getLoggedUser() {
  return JSON.parse(localStorage.getItem(STORAGE_LOGGED_KEY) || 'null');
}
function ensureLoggedInOrRedirect() {
  const u = getLoggedUser();
  if (!u) {
    alert('🔒 يجب تسجيل الدخول أولاً');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

/* ===== عرض / تبديل واجهات التسجيل ===== */
function showRegisterForm() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
}
function showLoginForm() {
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
}

/* ===== تسجيل جديد (يحفظ المستخدم ويدخله مباشرة) ===== */
function register() {
  const firstName = (document.getElementById('first-name')?.value || '').trim();
  const lastName = (document.getElementById('last-name')?.value || '').trim();
  const phone = (document.getElementById('phone')?.value || '').trim();
  const email = (document.getElementById('reg-email')?.value || '').trim();
  const password = (document.getElementById('reg-password')?.value || '').trim();

  if (!firstName || !lastName || !phone || !email || !password) {
    alert('⚠️ يرجى ملء جميع الحقول');
    return;
  }

  const exists = findUserByEmail(email);
  if (exists) {
    alert('❌ هذا البريد مسجل مسبقاً. الرجاء تسجيل الدخول.');
    showLoginForm();
    return;
  }

  const user = {
    firstName, lastName, phone, email, password,
    balance: 10.00, // رصيد مبدئي تجريبي
    createdAt: new Date().toISOString()
  };

  saveOrUpdateUser(user);
  setLoggedUser(user);
  alert('✅ تم إنشاء الحساب وتسجيل الدخول تلقائياً');
  goToMainView();
}

/* ===== تسجيل الدخول ===== */
function login() {
  const email = (document.getElementById('login-email')?.value || '').trim();
  const password = (document.getElementById('login-password')?.value || '').trim();
  if (!email || !password) { alert('⚠️ يرجى ملء جميع الحقول'); return; }

  const user = findUserByEmail(email);
  if (!user) { alert('❌ البريد الإلكتروني غير موجود. يرجى إنشاء حساب.'); return; }
  if (user.password !== password) { alert('❌ كلمة المرور غير صحيحة.'); return; }

  setLoggedUser(user);
  alert(`✅ أهلاً ${user.firstName} !`);
  goToMainView();
}

/* ===== الانتقال إلى العرض الرئيسي بعد تسجيل الدخول ===== */
function goToMainView() {
  // إن هذه الصفحة index.html تحوي العنصرين auth-section و main-content
  const auth = document.getElementById('auth-section');
  const main = document.getElementById('main-content');
  if (auth && main) {
    auth.classList.add('hidden');
    main.classList.remove('hidden');
    updateBalanceOnPage();
    renderUserName();
  } else {
    // إن لم تكن في index.html نعيد التوجيه
    window.location.href = 'index.html';
  }
}

/* ===== تحديث واجهة المستخدم بالرصيد والاسم ===== */
function updateBalanceOnPage() {
  const user = getLoggedUser();
  if (!user) return;
  const el = document.getElementById('current-balance');
  if (el) el.innerText = Number(user.balance || 0).toFixed(2);
  renderUserName();
}
function renderUserName() {
  const user = getLoggedUser();
  if (!user) return;
  const nameEl = document.getElementById('user-name');
  if (nameEl) nameEl.innerText = `${user.firstName} ${user.lastName}`;
}

/* ===== تسجيل الخروج ===== */
function logout() {
  localStorage.removeItem(STORAGE_LOGGED_KEY);
  // لو نحن في صفحة فرعية أعِد للتوجه للصفحة الرئيسية
  window.location.href = 'index.html';
}

/* ===== محفظة (عرض/اخفاء) ===== */
function toggleWalletInfo() {
  const w = document.getElementById('wallet-info');
  if (!w) return;
  w.classList.toggle('hidden');
}

/* ===== إيداع/سحب ===== */
function deposit() {
  const amount = parseFloat(document.getElementById('deposit-amount')?.value);
  const img = document.getElementById('deposit-image')?.files?.length || 0;
  if (isNaN(amount) || amount <= 0) { alert('يرجى إدخال مبلغ صحيح'); return; }
  if (img === 0) { alert('يرجى إرفاق صورة الإيداع'); return; }
  // نضع طلب قيد المراجعة (لا نضيف الرصيد تلقائياً)
  const status = document.getElementById('deposit-status');
  if (status) { status.classList.remove('hidden'); status.innerText = 'إيداع قيد المراجعة...'; }
  alert('تم إرسال طلب الإيداع. سيتم إضافته بعد المراجعة.');
}
async function withdraw() {
  const amount = parseFloat(document.getElementById('withdraw-amount')?.value);
  if (isNaN(amount) || amount <= 0) { alert('يرجى إدخال مبلغ صحيح'); return; }
  const ok = await tryConsumeBalance(amount);
  if (!ok) { alert('رصيد غير كافٍ'); return; }
  alert('✅ تم سحب المبلغ بنجاح');
  updateBalanceOnPage();
}

/* ===== محاولات استهلاك الرصيد مع حفظ المستخدم ===== */
async function tryConsumeBalance(amount) {
  const user = getLoggedUser();
  if (!user) { alert('يجب تسجيل الدخول'); return false; }
  if (amount > (user.balance || 0)) return false;
  user.balance = Number((user.balance - amount).toFixed(8));
  // حفظ المستخدم في users و loggedUser
  saveOrUpdateUser(user);
  setLoggedUser(user);
  return true;
}

/* ===== تشغيل التحقق عند تحميل الصفحة (index) ===== */
document.addEventListener('DOMContentLoaded', () => {
  // إذا كنا في index.html
  if (document.getElementById('auth-section')) {
    const logged = getLoggedUser();
    if (logged) {
      // عرض الصفحة الرئيسية
      document.getElementById('auth-section').classList.add('hidden');
      document.getElementById('main-content').classList.remove('hidden');
      updateBalanceOnPage();
    } else {
      // عرض شاشة تسجيل الدخول
      document.getElementById('auth-section').classList.remove('hidden');
      document.getElementById('main-content').classList.add('hidden');
    }
  }
});
