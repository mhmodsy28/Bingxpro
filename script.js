let balance = 0.00; // الرصيد الحالي

// تحديث الرصيد المعروض
function updateBalance() {
    document.getElementById('current-balance').innerText = balance.toFixed(2);
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

    // إظهار حالة الإيداع
    depositStatus.classList.remove('hidden');
    depositStatus.innerText = "إيداعك قيد الانتظار...";

    // تحديث الرصيد
    balance += depositAmount;
    updateBalance();

    // رسالة للمستخدم
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
    alert("تم سحب المبلغ بنجاح.");
}

// دالة لتواصل مع
