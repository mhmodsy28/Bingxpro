let balance = 10.00;

// تحديث الرصيد
function updateBalance() {
  const el = document.getElementById('current-balance');
  if (el) el.innerText = balance.toFixed(2);
}

// تسجيل مستخدم جديد
function register() {
  const user = {
    firstName: document.getElementById('first-name').value,
    lastName: document.getElementById('last-name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('register-email').value,
    password: document.getElementById('register-password').value
  };

  if (!user.email || !user.password) {
    alert("يرجى إدخال البريد وكلمة المرور");
    return;
  }

  localStorage.setItem("user", JSON.stringify(user));
  alert("✅ تم إنشاء الحساب بنجاح");
  showLogin();
}

// تسجيل الدخول
function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const user = JSON.parse(localStorage.getItem("user"));

  if (user && user.email === email && user.password === password) {
    localStorage.setItem("loggedIn", "true");
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("register-section").classList.add("hidden");
    document.getElementById("main-app").classList.remove("hidden");
    updateBalance();
  } else {
    alert("❌ البريد أو كلمة المرور غير صحيحة");
  }
}

// فحص تسجيل الدخول عند فتح الصفحة
function checkLogin() {
  if (localStorage.getItem("loggedIn") === "true") {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("register-section").classList.add("hidden");
    document.getElementById("main-app").classList.remove("hidden");
    updateBalance();
  }
}

// التبديل بين التسجيل وتسجيل الدخول
function showRegister() {
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("register-section").classList.remove("hidden");
}
function showLogin() {
  document.getElementById("register-section").classList.add("hidden");
  document.getElementById("login-section").classList.remove("hidden");
}

// المحفظة
function toggleWalletInfo() {
  const walletInfo = document.getElementById('wallet-info');
  if (walletInfo) walletInfo.classList.toggle('hidden');
}

// القائمة الجانبية
function openSidebar() { document.getElementById("sidebar").style.width = "260px"; }
function closeSidebar() { document.getElementById("sidebar").style.width = "0"; }

// الاستثمار
function invest() {
  const amount = parseFloat(document.getElementById('investment-amount').value);
  const type = document.getElementById('contract-type').value;
  const status = document.getElementById('investment-status');

  if (isNaN(amount) || amount <= 0) {
    alert("أدخل مبلغ صحيح");
    return;
  }

  status.innerText = `✅ تم استثمار ${amount} USDT في عقد ${type === "short" ? "قصير" : "طويل"} المدى`;
}

// جلب أسعار العملات من CoinGecko
async function loadPrices() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana&vs_currencies=usd");
    const data = await res.json();

    document.getElementById("btc-price").innerText = data.bitcoin.usd;
    document.getElementById("eth-price").innerText = data.ethereum.usd;
    document.getElementById("bnb-price").innerText = data.binancecoin.usd;
    document.getElementById("sol-price").innerText = data.solana.usd;
  } catch (err) {
    console.error("خطأ في جلب الأسعار:", err);
  }
}
