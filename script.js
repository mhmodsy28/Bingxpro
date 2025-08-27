let balance = 10.00;

// التحقق من تسجيل الدخول
function checkLogin() {
  if (sessionStorage.getItem("loggedIn") === "true") {
    document.getElementById("auth-container").classList.add("hidden");
    document.getElementById("main-container").classList.remove("hidden");
    updateBalance();
  }
}

// تبديل بين تسجيل الدخول وإنشاء الحساب
function toggleAuthForms() {
  document.getElementById("login-form").classList.toggle("hidden");
  document.getElementById("register-form").classList.toggle("hidden");
}

// إنشاء حساب
function register() {
  let email = document.getElementById("reg-email").value;
  let password = document.getElementById("reg-password").value;

  if (!email || !password) {
    alert("⚠️ يرجى ملء جميع الحقول.");
    return;
  }

  localStorage.setItem("userEmail", email);
  localStorage.setItem("userPassword", password);

  alert("✅ تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول الآن.");
  toggleAuthForms();
}

// تسجيل الدخول
function login() {
  let email = document.getElementById("login-email").value;
  let password = document.getElementById("login-password").value;

  if (email === localStorage.getItem("userEmail") &&
      password === localStorage.getItem("userPassword")) {
    sessionStorage.setItem("loggedIn", "true");
    document.getElementById("auth-container").classList.add("hidden");
    document.getElementById("main-container").classList.remove("hidden");
    updateBalance();
    alert("👋 مرحباً بك في منصة BingX!");
  } else {
    alert("❌ بيانات الدخول غير صحيحة.");
  }
}

// تسجيل الخروج
function logout() {
  sessionStorage.clear();
  location.reload();
}

// تحديث الرصيد
function updateBalance() {
  document.getElementById('current-balance').innerText = balance.toFixed(2);
}

// إيداع
function deposit() {
  const depositAmount = parseFloat(document.getElementById('deposit-amount').value);
  const depositStatus = document.getElementById('deposit-status');
  const imageInput = document.getElementById('deposit-image');

  if (isNaN(depositAmount) || depositAmount <= 0) {
    alert("يرجى إدخال مبلغ صحيح للإيداع.");
    return;
  }
  if (imageInput.files.length === 0) {
    alert("يرجى تحميل صورة من عملية الإيداع.");
    return;
  }
  depositStatus.classList.remove('hidden');
  depositStatus.innerText = "إيداعك قيد الانتظار...";
  alert("تم إرسال طلب الإيداع. سيتم إضافة الرصيد بعد المراجعة.");
}

// سحب
function withdraw() {
  const withdrawAmount = parseFloat(document.getElementById('withdraw-amount').value);
  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    alert("يرجى إدخال مبلغ صحيح للسحب.");
    return;
  }
  if (withdrawAmount > balance) {
    alert("لا يوجد رصيد كافٍ للسحب.");
    return;
  }
  balance -= withdrawAmount;
  updateBalance();
  alert("✅ تم سحب المبلغ بنجاح.");
}

// استثمار
function invest() {
  const type = document.getElementById("invest-type").value;
  const amount = parseFloat(document.getElementById("invest-amount").value);

  if (isNaN(amount) || amount <= 0) {
    alert("⚠️ أدخل مبلغ صالح للاستثمار.");
    return;
  }
  if (amount > balance) {
    alert("❌ لا يوجد رصيد كافٍ.");
    return;
  }

  balance -= amount;
  updateBalance();
  alert(`✅ تم بدء استثمار ${type === "long" ? "طويل الأجل" : "قصير الأجل"} بمبلغ ${amount} USDT`);
}

// تداول
function trade() {
  const coin = document.getElementById("trade-coin").value;
  const amount = parseFloat(document.getElementById("trade-amount").value);

  if (isNaN(amount) || amount <= 0) {
    alert("⚠️ أدخل مبلغ صالح للتداول.");
    return;
  }
  if (amount > balance) {
    alert("❌ لا يوجد رصيد كافٍ للتداول.");
    return;
  }

  balance -= amount;
  updateBalance();
  alert(`✅ تم تنفيذ صفقة تداول ${coin} بمبلغ ${amount} USDT`);
}

// القائمة الجانبية
function toggleWalletInfo() {
  const walletInfo = document.getElementById('wallet-info');
  walletInfo.classList.toggle('hidden');
}
function openSidebar() {
  document.getElementById("sidebar").style.width = "260px";
}
function closeSidebar() {
  document.getElementById("sidebar").style.width = "0";
}
function toggleSection(id) {
  const section = document.getElementById(id);
  section.classList.toggle('hidden');
}
