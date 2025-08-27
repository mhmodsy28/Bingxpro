/* ===== تخزين المفاتيح ===== */
const STORAGE_USERS_KEY = 'bx_users_v3';
const STORAGE_LOGGED_KEY = 'bx_logged_user_v3';

/* ===== مساعدات المستخدم ===== */
function getAllUsers(){ return JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]'); }
function saveAllUsers(u){ localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(u)); }
function findUserByEmail(email){ if(!email) return null; return getAllUsers().find(x=>x.email.toLowerCase()===email.toLowerCase()) || null; }
function saveOrUpdateUser(user){ const arr=getAllUsers(); const i=arr.findIndex(x=>x.email.toLowerCase()===user.email.toLowerCase()); if(i===-1) arr.push(user); else arr[i]=user; saveAllUsers(arr); }
function setLoggedUser(user){ localStorage.setItem(STORAGE_LOGGED_KEY, JSON.stringify(user)); }
function getLoggedUser(){ return JSON.parse(localStorage.getItem(STORAGE_LOGGED_KEY) || 'null'); }

/* ===== واجهة التسجيل / الدخول ===== */
function showRegisterForm(){ document.getElementById('login-block').classList.add('hidden'); document.getElementById('register-block').classList.remove('hidden'); }
function showLoginForm(){ document.getElementById('register-block').classList.add('hidden'); document.getElementById('login-block').classList.remove('hidden'); }

function register(){
  const firstName = (document.getElementById('first-name')?.value || '').trim();
  const lastName = (document.getElementById('last-name')?.value || '').trim();
  const phone = (document.getElementById('phone')?.value || '').trim();
  const email = (document.getElementById('reg-email')?.value || '').trim();
  const password = (document.getElementById('reg-password')?.value || '').trim();
  if(!firstName || !lastName || !phone || !email || !password){ alert('يرجى تعبئة جميع الحقول'); return; }
  if(findUserByEmail(email)){ alert('هذا البريد مسجل مسبقاً، قم بتسجيل الدخول'); showLoginForm(); return; }
  const user = { firstName, lastName, phone, email, password, balance: 50.00, createdAt:new Date().toISOString() };
  saveOrUpdateUser(user); setLoggedUser(user); alert('تم إنشاء الحساب وتسجيل الدخول'); goToMain();
}

function login(){
  const email = (document.getElementById('login-email')?.value || '').trim();
  const password = (document.getElementById('login-password')?.value || '').trim();
  if(!email || !password){ alert('يرجى تعبئة الحقول'); return; }
  const user = findUserByEmail(email);
  if(!user){ alert('البريد الإلكتروني غير موجود'); return; }
  if(user.password !== password){ alert('كلمة المرور غير صحيحة'); return; }
  setLoggedUser(user); alert(`أهلاً ${user.firstName}`); goToMain();
}

/* ===== التحويل للواجهة الرئيسية ===== */
function goToMain(){
  // إذا نحن في index.html
  const auth = document.getElementById('auth-wrap');
  const main = document.getElementById('main-wrap');
  if(auth && main){
    auth.classList.add('hidden'); main.classList.remove('hidden');
    renderUserName(); updateBalanceOnPage();
  } else {
    window.location.href = 'index.html';
  }
}

/* ===== صفحة التحميل الأساسية (عند فتح index.html) ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  // index.html specific
  if(document.getElementById('auth-wrap')){
    const logged = getLoggedUser();
    if(logged){ document.getElementById('auth-wrap').classList.add('hidden'); document.getElementById('main-wrap').classList.remove('hidden'); renderUserName(); updateBalanceOnPage(); }
    else { document.getElementById('auth-wrap').classList.remove('hidden'); document.getElementById('main-wrap').classList.add('hidden'); }
  }
});

/* ===== عرض اسم المستخدم والرصيد ===== */
function renderUserName(){ const u=getLoggedUser(); if(!u) return; const el=document.getElementById('user-name'); if(el) el.innerText = `${u.firstName} ${u.lastName}`; }
function updateBalanceOnPage(){ const u=getLoggedUser(); if(!u) return; const el=document.getElementById('current-balance'); if(el) el.innerText = Number(u.balance||0).toFixed(2); }

/* ===== الخروج ===== */
function logout(){ localStorage.removeItem(STORAGE_LOGGED_KEY); window.location.href = 'index.html'; }

/* ===== نسخ المحفظة ===== */
function copyWallet(){ const addr = document.getElementById('wallet-address')?.innerText || ''; if(!addr){ alert('لا يوجد عنوان'); return; } navigator.clipboard?.writeText(addr).then(()=>alert('تم نسخ العنوان')); }

/* ===== QUICK ADD / RESET (تجريبي) ===== */
function quickAdd(){
  const amt = parseFloat(document.getElementById('quick-deposit-amount')?.value);
  if(isNaN(amt) || amt <= 0){ alert('أدخل مبلغاً صالحاً'); return; }
  const u = getLoggedUser(); if(!u){ alert('سجل الدخول أولاً'); return; }
  u.balance = Number((Number(u.balance||0) + amt).toFixed(8));
  saveOrUpdateUser(u); setLoggedUser(u); updateBalanceOnPage(); alert('تمت إضافة الرصيد التجريبي');
}
function quickReset(){
  if(!confirm('هل تريد إعادة ضبط الرصيد إلى 0؟')) return;
  const u = getLoggedUser(); if(!u){ alert('سجل الدخول أولاً'); return; }
  u.balance = 0; saveOrUpdateUser(u); setLoggedUser(u); updateBalanceOnPage(); alert('تمت الإعادة');
}

/* ===== صفحة الإيداع (deposit.html) ===== */
function copyDepositAddress(){ const addr = document.getElementById('deposit-address')?.innerText || ''; if(!addr){ alert('لا يوجد عنوان'); return; } navigator.clipboard?.writeText(addr).then(()=>alert('تم نسخ عنوان الإيداع')); }
function submitDepositProof(){
  const u = getLoggedUser(); if(!u){ alert('سجل الدخول أولاً'); window.location.href='index.html'; return; }
  const amt = parseFloat(document.getElementById('deposit-amount-input')?.value);
  const fileInput = document.getElementById('proof-image');
  if(isNaN(amt) || amt <= 0){ alert('أدخل مبلغ صالح'); return; }
  if(!fileInput || !fileInput.files || fileInput.files.length === 0){ alert('أرفق صورة الإثبات'); return; }
  // هنا مجرد محاكاة — نعرض رسالة أن الطلب قيد المراجعة
  document.getElementById('deposit-msg').innerText = 'تم استلام إثبات الإيداع — قيد المراجعة.';
  alert('تم إرسال إثبات الإيداع — سيتم المراجعة وإضافة الرصيد يدوياً.');
}

/* ===== التحقق العام للصفحات الفرعية ===== */
function ensureLoggedInOrRedirect(){
  const u = getLoggedUser();
  if(!u){ alert('🔒 يجب تسجيل الدخول أولاً'); window.location.href = 'index.html'; return false; }
  return true;
}

/* ===== تداول: جلب الأسعار و-chart.js (trading.html) ===== */
const COIN_MAP = { BTC:'bitcoin', ETH:'ethereum', BNB:'binancecoin', SOL:'solana' };
let priceChart = null;

async function loadMarketFor(symbol){
  const id = COIN_MAP[symbol] || 'bitcoin';
  try{
    const sp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`).then(r=>r.json());
    const info = sp[id];
    const price = info?.usd ?? null;
    const change = info?.usd_24h_change ?? 0;
    const priceEl = document.getElementById('price'); if(priceEl) priceEl.innerText = price ? `$${price.toLocaleString(undefined,{maximumFractionDigits:2})}` : '--';
    const changeEl = document.getElementById('change'); if(changeEl) changeEl.innerText = `${change ? change.toFixed(2) + '%' : '--'}`;
  }catch(e){ console.warn('price fetch error', e); }

  try{
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7&interval=hourly`);
    const json = await res.json();
    const prices = (json.prices || []).map(p=>({t:new Date(p[0]), v:p[1]}));
    const labels = prices.map(p=>p.t.toLocaleString());
    const data = prices.map(p=>p.v);
    const ctx = document.getElementById('priceChart')?.getContext('2d');
    if(ctx){
      if(priceChart) priceChart.destroy();
      priceChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label:'السعر (USD)', data, borderWidth:1.6, tension:0.18, pointRadius:0 }]},
        options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{display:false}, y:{ticks:{callback: v => `$${v}`}}} }
      });
    }
    const sma = calculateSMA(data,14);
    const rsi = calculateRSI(data,14);
    const smaEl = document.getElementById('sma'); if(smaEl) smaEl.innerText = isNaN(sma)?'--':`$${sma.toFixed(2)}`;
    const rsiEl = document.getElementById('rsi'); if(rsiEl) rsiEl.innerText = isNaN(rsi)?'--':rsi.toFixed(2);
  }catch(e){ console.error('chart fetch error', e); }
}

function refreshMarket(){ const sel = document.getElementById('crypto-select'); if(sel) loadMarketFor(sel.value); }

function calculateSMA(values, period){
  if(!values || values.length < period) return NaN;
  const slice = values.slice(-period); const sum = slice.reduce((s,v)=>s+v,0); return sum/period;
}
function calculateRSI(values, period=14){
  if(!values || values.length <= period) return NaN;
  let gains=0, losses=0;
  for(let i=values.length-period; i<values.length; i++){
    const change = values[i] - values[i-1];
    if(change>0) gains += change; else losses += Math.abs(change);
  }
  const avgGain = gains/period; const avgLoss = losses/period;
  if(avgLoss===0) return 100;
  const rs = avgGain/avgLoss; return 100 - (100 / (1 + rs));
}

async function executeTrade(){
  if(!ensureLoggedInOrRedirect()) return;
  const amt = parseFloat(document.getElementById('trade-amount')?.value);
  if(isNaN(amt) || amt <=0){ alert('أدخل مبلغاً صالحاً'); return; }
  const u = getLoggedUser();
  if(amt > (u.balance || 0)){ alert('رصيد غير كافٍ'); return; }
  u.balance = Number((u.balance - amt).toFixed(8));
  saveOrUpdateUser(u); setLoggedUser(u); updateBalanceOnPage();
  const log = document.getElementById('trade-log'); if(log) log.innerText = `تم تنفيذ صفقة بمبلغ ${amt} USDT`;
  alert('✅ تم تنفيذ الصفقة (محاكاة)');
}

/* ===== الاستثمار ===== */
function updateEstimate(){
  const type = document.getElementById('contract-type')?.value || 'long';
  const amount = parseFloat(document.getElementById('invest-input')?.value);
  if(isNaN(amount) || amount <=0){ alert('أدخل مبلغاً صالحاً'); return; }
  const factor = type==='long'?1.12:1.05;
  const est = amount * factor;
  const el = document.getElementById('invest-estimate'); if(el) el.innerText = `العائد المتوقع: ${est.toFixed(2)} USDT (تقريبي)`;
  // إظهار APR & risk
  document.getElementById('apr').innerText = type==='long' ? '12%' : '5%';
  document.getElementById('risk').innerText = type==='long' ? 'متوسط' : 'مرتفع';
}

async function startInvestment(){
  if(!ensureLoggedInOrRedirect()) return;
  const amount = parseFloat(document.getElementById('invest-input')?.value);
  const type = document.getElementById('contract-type')?.value || 'long';
  if(isNaN(amount) || amount <=0){ alert('أدخل مبلغاً صالحاً'); return; }
  const u = getLoggedUser();
  if(amount > (u.balance || 0)){ alert('رصيد غير كافٍ'); return; }
  u.balance = Number((u.balance - amount).toFixed(8));
  saveOrUpdateUser(u); setLoggedUser(u); updateBalanceOnPage();
  alert(`تم بدء استثمار ${type} بمبلغ ${amount} USDT (محاكاة)`);
}

/* ===== الألعاب: لعبة الطائرة (Crash) =====
   آلية مبسطة:
   - يُدخل اللاعب مبلغ الرهان.
   - عند بدء الجولة تتصاعد المضاعف من 1.00 وصولاً إلى قيمة عشوائية (crashMultiplier).
   - اللاعب يمكن الضغط على "سحب" قبل حدوث الcrash ليحصل على المبلغ * المضاعف.
   - إذا حدث crash قبل السحب يخسر الرهان.
*/
let crashState = { running:false, intervalId:null, multiplier:1, crashAt: null, bet:0, cashed:false };

function startRound(){
  if(!ensureLoggedInOrRedirect()) return;
  if(crashState.running){ alert('جولة قيد التشغيل'); return; }
  const bet = parseFloat(document.getElementById('bet-amount')?.value);
  if(isNaN(bet) || bet <=0){ alert('أدخل مبلغاً صالحاً'); return; }
  const u = getLoggedUser();
  if(bet > (u.balance || 0)){ alert('رصيد غير كافٍ'); return; }

  // خصم الرهان فوراً
  u.balance = Number((u.balance - bet).toFixed(8));
  saveOrUpdateUser(u); setLoggedUser(u); updateBalanceOnPage();

  // إعداد الجلسة
  crashState.running = true;
  crashState.multiplier = 1.0;
  crashState.bet = bet;
  crashState.cashed = false;
  // حد عشوائي للcrash — نستخدم توزيع يعطي احتمالية كبيرة لصمود لبعض الوقت
  // نولد قيمة بين 1.1 و 10 عشوائياً مع ميل إلى قيم صغيرة
  const r = Math.random();
  const crashAt = Math.max(1.1, (1 + (Math.pow(r, 2) * 9))); // 1.0..10
  crashState.crashAt = crashAt;

  document.getElementById('game-log').innerText = 'الجولة بدأت — اضغط سحب قبل الانهيار!';
  document.getElementById('cash-btn').disabled = false;

  // نزيد المضاعف تدريجياً كل 60ms (تسريع مع الوقت)
  let last = Date.now();
  crashState.intervalId = setInterval(()=>{
    const now = Date.now();
    const dt = (now - last) / 1000; last = now;
    // زيادة أسية خفيفة لسرعة التصاعد
    crashState.multiplier += 0.01 * (1 + crashState.multiplier/5) * dt * 60;
    document.getElementById('multiplier').innerText = crashState.multiplier.toFixed(2) + 'x';
    // تحقق الانهيار
    if(crashState.multiplier >= crashState.crashAt){
      // crash
      endRound(false);
    }
  }, 60);
}

function cashOut(){
  if(!crashState.running) return;
  if(crashState.cashed) return;
  crashState.cashed = true;
  // حساب المبلغ الفائز
  const win = Number((crashState.bet * crashState.multiplier).toFixed(8));
  const u = getLoggedUser();
  u.balance = Number((u.balance + win).toFixed(8));
  saveOrUpdateUser(u); setLoggedUser(u); updateBalanceOnPage();
  document.getElementById('game-log').innerText = `✅ سحبت عند ${crashState.multiplier.toFixed(2)}x — ربحت ${win.toFixed(4)} USDT`;
  endRound(true);
}

function endRound(won){
  clearInterval(crashState.intervalId);
  crashState.running = false;
  document.getElementById('cash-btn').disabled = true;
  if(!won){
    // اللاعب خسر، المبلغ تم خصمه بالفعل عند بداية الجولة
    document.getElementById('game-log').innerText = `💥 انهارت الطائرة عند ${crashState.crashAt.toFixed(2)}x — خسرت ${crashState.bet.toFixed(4)} USDT`;
  }
  // Reset multiplier display after ثواني
  setTimeout(()=>{ document.getElementById('multiplier').innerText = '1.00x'; }, 1200);
}

/* ===== مساعدة عند تحميل الصفحات الفرعية ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  // trading.html init
  if(document.getElementById('crypto-select')){
    if(!ensureLoggedInOrRedirect()) return;
    const sel = document.getElementById('crypto-select');
    sel.addEventListener('change', ()=> loadMarketFor(sel.value));
    loadMarketFor(sel.value);
  }
  // investment.html init
  if(document.getElementById('contract-type')){
    if(!ensureLoggedInOrRedirect()) return;
    // set defaults
    document.getElementById('apr').innerText = 'طويل: 12% ، قصير: 5%';
    document.getElementById('risk').innerText = 'متوسط';
  }
  // deposit.html: nothing special (just ensure login)
  if(document.getElementById('deposit-address')){
    if(!ensureLoggedInOrRedirect()) return;
  }
  // games.html init: ensure login
  if(document.getElementById('bet-amount')){
    if(!ensureLoggedInOrRedirect()) return;
  }
});
