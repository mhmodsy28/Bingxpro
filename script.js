let balance = 10.00; // الرصيد الحالي

// التحقق من تسجيل الدخول
function checkLogin() {
    const loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn === 'true') {
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('main-container').classList.remove('hidden');
        showWelcomeMessage();
    }
}

// تسجيل الدخول الوهمي
function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (email === "" || password === "") {
        alert("يرجى ملء جميع الحقول.");
        return;
    }

    // تسجيل دخول مباشر (وهمي)
    sessionStorage.setItem('loggedIn', 'true');
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('main-container').classList.remove('hidden');
    showWelcomeMessage();
}

// تحديث الرصيد المعروض
function updateBalance() {
    document.getElementById('current-balance').innerText = balance.toFixed(2);
}

// دالة الترحيب
function showWelcomeMessage() {
    alert("👋 مرحباً بك في منصة BingX! نتمنى لك تجربة موفقة.");
    updateBalance();
}

// دالة الإيداع
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

// دالة السحب
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

// منع إضافة رصيد مباشر
function requestBalanceUpdate() {
    alert("⚠️ يرجى التواصل مع الوكيل لإضافة رصيد.");
}

// إظهار/إخفاء المحفظة
function toggleWalletInfo() {
    const walletInfo = document.getElementById('wallet-info');
    walletInfo.classList.toggle('hidden');
}

// فتح وإغلاق القائمة
function openSidebar() {
    document.getElementById("sidebar").style.width = "260px";
}
function closeSidebar() {
    document.getElementById("sidebar").style.width = "0";
}
