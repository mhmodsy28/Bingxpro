document.addEventListener("DOMContentLoaded", () => {
  const authCard = document.getElementById("auth-card");
  const appCard = document.getElementById("app-card");

  // التحقق إذا المستخدم مسجل دخول مسبقاً
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    renderUser(userData);
    authCard.classList.add("hidden");
    appCard.classList.remove("hidden");
  } else {
    authCard.classList.remove("hidden");
    appCard.classList.add("hidden");
  }

  // تسجيل الدخول
  window.login = async function () {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const res = await fetch("login.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    });

    const data = await res.json();
    if (data.status === "success") {
      localStorage.setItem("user", JSON.stringify(data.user));
      renderUser(data.user);
      authCard.classList.add("hidden");
      appCard.classList.remove("hidden");
    } else {
      alert(data.message);
    }
  };

  // إنشاء حساب
  window.register = async function () {
    const first = document.getElementById("first-name").value;
    const last = document.getElementById("last-name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("reg-email").value;
    const pass = document.getElementById("reg-password").value;

    const res = await fetch("register.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `first_name=${encodeURIComponent(first)}&last_name=${encodeURIComponent(last)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(pass)}`
    });

    const data = await res.json();
    if (data.status === "success") {
      alert("تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول الآن.");
      showLogin();
    } else {
      alert(data.message);
    }
  };

  // تسجيل الخروج
  window.logout = function () {
    localStorage.removeItem("user");
    authCard.classList.remove("hidden");
    appCard.classList.add("hidden");
  };

  // عرض بيانات المستخدم
  function renderUser(user) {
    document.getElementById("user-name").innerText = user.first_name;
    document.getElementById("current-balance").innerText = parseFloat(user.balance).toFixed(2);
    document.getElementById("user-id").innerText = `ID-${user.id}`;
  }
});
