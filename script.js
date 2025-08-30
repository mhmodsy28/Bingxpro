// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', ()=>{
    const loggedUser = JSON.parse(localStorage.getItem('current-user'));
    if(loggedUser && localStorage.getItem('logged')==='true'){
        alert('أهلاً '+loggedUser.name+'! أنت مسجل الدخول.');
        // يمكنك توجيه المستخدم مباشرة للواجهة الرئيسية
        // window.location.href='app.html';
    }
});

// عناصر الصفحة
const loginBtn = document.getElementById('login-btn');
const forgotBtn = document.getElementById('forgot-btn');
const showRegisterBtn = document.getElementById('show-register');
const registerBtn = document.getElementById('register-btn');
const cancelRegisterBtn = document.getElementById('cancel-register');

// عرض التسجيل أو الدخول
showRegisterBtn.onclick = ()=> {
    document.getElementById('login-block').classList.add('hidden');
    document.getElementById('register-block').classList.remove('hidden');
};
cancelRegisterBtn.onclick = ()=> {
    document.getElementById('login-block').classList.remove('hidden');
    document.getElementById('register-block').classList.add('hidden');
};
forgotBtn.onclick = ()=> alert('اتصل بالدعم الفني لاستعادة كلمة السر');

// تسجيل الدخول
loginBtn.onclick = ()=>{
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value.trim();
    const users = JSON.parse(localStorage.getItem('users')||'[]');
    const user = users.find(u=>u.email===email && u.password===pass);
    if(user){
        localStorage.setItem('logged','true');
        localStorage.setItem('current-user',JSON.stringify(user));
        alert('تم تسجيل الدخول بنجاح');
        // window.location.href='app.html';
    } else alert('البريد أو كلمة المرور غير صحيحة');
};

// إنشاء حساب وتسجيل تلقائي
registerBtn.onclick = ()=>{
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
    // window.location.href='app.html';
};
