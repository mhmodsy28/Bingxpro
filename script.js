/* script.js - مبسّط وموحّد */
const USERS_KEY = 'bx_users_simple';
const LOGGED_KEY = 'bx_logged_simple';

/* storage helpers */
function getUsers(){ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
function saveUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function findUser(email){ if(!email) return null; return getUsers().find(x=>x.email.toLowerCase()===email.toLowerCase()) || null; }
function saveOrUpdateUser(u){
  const arr = getUsers(); const idx = arr.findIndex(x=>x.email.toLowerCase()===u.email.toLowerCase());
  if(idx===-1) arr.push(u); else arr[idx]=u; saveUsers(arr);
}
function setLogged(u){ localStorage.setItem(LOGGED_KEY, JSON.stringify(u)); }
function getLogged(){ return JSON.parse(localStorage.getItem(LOGGED_KEY) || 'null'); }
function ensureLoggedInOrRedirect(){
  const u = getLogged();
  if(!u){ alert('🔒 يرجى تسجيل الدخول أولاً'); window.location.href='index.html'; return false; }
  return true;
}

/* --------- Auth on index.html --------- */
function showRegister(){ document.getElementById('login-block').classList.add('hidden'); document.getElementById('register-block').classList.remove('hidden'); }
function showLogin(){ document.getElementById('register-block').classList.add('hidden'); document.getElementById('login-block').classList.remove('hidden'); }

function register(){
  const first = (document.getElementById('first-name')?.value || '').trim();
  const last  = (document.getElementById('last-name')?.value || '').trim();
  const phone = (document.getElementById('phone')?.value || '').trim();
  const email = (document.getElementById('reg-email')?.value || '').trim();
  const pass  = (document.getElementById('reg-password')?.value || '').trim();
  if(!first||!last||!phone||!email||!pass){ alert('يرجى ملء جميع الحقول'); return; }
  if(findUser(email)){ alert('هذا البريد مستخدم مسبقاً'); return; }
  const user = { first, last, phone, email, password: pass, balance:50.00, history:[] };
  saveOrUpdateUser(user); setLogged(user); alert('تم الإنشاء وتسجيل الدخول'); openApp();
}

function login(){
  const email = (document.getElementById('login-email')?.value || '').trim();
  const pass = (document.getElementById('login-password')?.value || '').trim();
  if(!email||!pass){ alert('املأ الحقول'); return; }
  const u = findUser(email);
  if(!u){ alert('البريد غير موجود'); return; }
  if(u.password !== pass){ alert('كلمة المرور غير صحيحة'); return; }
  setLogged(u); alert('تم تسجيل الدخول'); openApp();
}

function openApp(){
  // if index page with app area
  const auth = document.getElementById('auth-card');
  const app = document.getElementById('app-card');
  if(auth && app){
    auth.classList.add('hidden'); app.classList.remove('hidden'); renderUser();
  } else {
    window.location.href='index.html';
  }
}

/* render user info */
function renderUser(){
  const u = getLogged(); if(!u) return;
  const name = `${u.first} ${u.last}`;
  const elName = document.getElementById('user-name'); if(elName) elName.innerText = name;
  const bal = document.getElementById('current-balance'); if(bal) bal.innerText = Number(u.balance||0).toFixed(2);
}

/* logout */
function logout(){ localStorage.removeItem(LOGGED_KEY); window.location.href='index.html'; }

/* quick add/reset */
function quickAdd(){
  const v = parseFloat(document.getElementById('quick-amount')?.value);
  if(isNaN(v)||v<=0){ alert('أدخل مبلغ صالح'); return; }
  const u = getLogged(); if(!u){ alert('سجل أولاً'); return; }
  u.balance = Number((Number(u.balance||0) + v).toFixed(8)); saveOrUpdateUser(u); setLogged(u); renderUser(); alert('تمت إضافة الرصيد تجريبي');
}
function quickReset(){
  if(!confirm('إعادة ضبط الرصيد إلى 0؟')) return;
  const u = getLogged(); if(!u){ alert('سجل أولاً'); return; }
  u.balance = 0; saveOrUpdateUser(u); setLogged(u); renderUser(); alert('تمت الإعادة');
}

/* copy wallet */
function copyWallet(){ const a = document.getElementById('wallet-address')?.innerText || ''; if(!a) return; navigator.clipboard.writeText(a).then(()=>alert('تم نسخ العنوان')); }

/* deposit page */
function copyDepositAddress(){ const a = document.getElementById('deposit-address')?.innerText || ''; if(!a) return; navigator.clipboard.writeText(a).then(()=>alert('تم نسخ عنوان الإيداع')); }
function submitProof(){
  if(!ensureLoggedInOrRedirect()) return;
  const amt = parseFloat(document.getElementById('proof-amount')?.value);
  const file = document.getElementById('proof-file')?.files?.[0];
  if(isNaN(amt) || !file){ alert('أدخل المبلغ وأرفق صورة'); return; }
  document.getElementById('proof-msg').innerText = 'تم إرسال الإثبات — قيد المراجعة (محاكاة)';
  alert('تم إرسال إثبات الإيداع (محاكاة)');
}

/* --------- Trading (CoinGecko + Chart.js) --------- */
let tradeChart = null;
const COIN_MAP = { bitcoin:'bitcoin', ethereum:'ethereum', binancecoin:'binancecoin', solana:'solana' };

async function loadMarket(id='bitcoin'){
  if(!ensureLoggedInOrRedirect()) return;
  try{
    const sp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`).then(r=>r.json());
    const info = sp[id];
    document.getElementById('trade-price').innerText = info ? `$${info.usd.toLocaleString(undefined,{maximumFractionDigits:2})}` : '--';
    document.getElementById('trade-change').innerText = info ? `${info.usd_24h_change.toFixed(2)}%` : '--';
  }catch(e){ console.warn(e); }

  try{
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7&interval=hourly`);
    const json = await res.json();
    const prices = (json.prices||[]).map(p=>p[1]);
    const labels = (json.prices||[]).map(p=>new Date(p[0]).toLocaleString());
    const ctx = document.getElementById('tradeChart')?.getContext('2d');
    if(ctx){
      if(tradeChart) tradeChart.destroy();
      tradeChart = new Chart(ctx, { type:'line', data:{labels, datasets:[{label:'السعر (USD)',data:prices,borderColor:'#f1c40f',backgroundColor:'rgba(241,196,15,0.06)',tension:0.18}]}, options:{responsive:true,maintainAspectRatio:false,scales:{x:{display:false}}} });
    }
    const sma = smaCalc(prices,14);
    const rsi = rsiCalc(prices,14);
    document.getElementById('trade-sma').innerText = isNaN(sma)?'--':`$${sma.toFixed(2)}`;
    document.getElementById('trade-rsi').innerText = isNaN(rsi)?'--':rsi.toFixed(2);
  }catch(e){ console.warn(e); }
}
function refreshMarket(){ const sel = document.getElementById('trade-symbol'); if(sel) loadMarket(sel.value); }
function doTrade(type){
  if(!ensureLoggedInOrRedirect()) return;
  const amt = parseFloat(document.getElementById('trade-amount')?.value);
  if(isNaN(amt) || amt <= 0){ alert('أدخل مبلغ صالح'); return; }
  const u = getLogged();
  if(type==='buy' && amt > u.balance){ alert('رصيد غير كافٍ'); return; }
  if(type==='buy'){ u.balance = Number((u.balance - amt).toFixed(8)); u.history.push({type:'buy',amt,date:new Date().toISOString()}); }
  else { u.history.push({type:'sell',amt,date:new Date().toISOString()}); }
  saveOrUpdateUser(u); setLogged(u); renderUser(); document.getElementById('trade-log').innerText = `تم ${type} بمبلغ ${amt} USDT (محاكاة)`; alert('تم تنفيذ (محاكاة)');
}
function smaCalc(arr,period){ if(!arr||arr.length<period) return NaN; const slice=arr.slice(-period); return slice.reduce((a,b)=>a+b,0)/period; }
function rsiCalc(prices,period=14){ if(!prices||prices.length<=period) return NaN; let gains=0,losses=0; for(let i=prices.length-period;i<prices.length;i++){ const d=prices[i]-prices[i-1]; if(d>0) gains+=d; else losses+=Math.abs(d);} const avgG=gains/period, avgL=losses/period; if(avgL===0) return 100; const rs=avgG/avgL; return 100 - (100/(1+rs)); }

/* --------- Investment --------- */
function calculateInvest(){
  const type = document.getElementById('invest-type')?.value;
  const amt = parseFloat(document.getElementById('invest-amount')?.value);
  if(isNaN(amt) || amt<=0){ alert('أدخل مبلغ صالح'); return; }
  const factor = type==='long'?1.12:1.05;
  document.getElementById('invest-est').innerText = `${(amt*factor).toFixed(2)} USDT`;
  document.getElementById('apr').innerText = type==='long'?'12%':'5%';
  document.getElementById('risk').innerText = type==='long'?'متوسط':'مرتفع';
}
function startInvestment(){
  if(!ensureLoggedInOrRedirect()) return;
  const amt = parseFloat(document.getElementById('invest-amount')?.value);
  const type = document.getElementById('invest-type')?.value;
  if(isNaN(amt) || amt<=0){ alert('أدخل مبلغ صالح'); return; }
  const u = getLogged(); if(amt > u.balance){ alert('رصيد غير كاف'); return; }
  u.balance = Number((u.balance - amt).toFixed(8)); u.history.push({type:'invest',contract:type,amt,date:new Date().toISOString()});
  saveOrUpdateUser(u); setLogged(u); renderUser(); alert('تم بدء الاستثمار (محاكاة)');
}

/* --------- Game: Crash (plane) --------- */
let crashState = {running:false,interval:null,mult:1,crashAt: null,bet:0,cashed:false};
function crashStart(){
  if(!ensureLoggedInOrRedirect()) return;
  if(crashState.running){ alert('جولة تعمل'); return; }
  const bet = parseFloat(document.getElementById('crash-bet')?.value);
  if(isNaN(bet) || bet<=0){ alert('أدخل مبلغ صالح'); return; }
  const u = getLogged(); if(bet > u.balance){ alert('رصيد غير كاف'); return; }
  // deduct immediately
  u.balance = Number((u.balance - bet).toFixed(8)); saveOrUpdateUser(u); setLogged(u); renderUser();
  crashState.running = true; crashState.mult = 1; crashState.bet = bet; crashState.cashed = false;
  // random crash point
  const r = Math.random(); crashState.crashAt = Math.max(1.05, 1 + Math.pow(r,2)*6);
  document.getElementById('crash-cash').disabled = false; document.getElementById('crash-log').innerText = 'الجولة بدأت — اضغط سحب قبل الانهيار';
  const planeEl = document.getElementById('plane'); planeEl.style.left = '10px';
  crashState.interval = setInterval(()=>{
    crashState.mult += 0.02 + crashState.mult*0.0015;
    document.getElementById('crash-multi').innerText = crashState.mult.toFixed(2) + 'x';
    // move plane
    const cur = parseInt(planeEl.style.left || '10');
    planeEl.style.left = (cur + 6) + 'px';
    if(crashState.mult >= crashState.crashAt) endCrash(false);
  },120);
}
function crashCashOut(){
  if(!crashState.running || crashState.cashed) return;
  crashState.cashed = true;
  const win = Number((crashState.bet * crashState.mult).toFixed(8));
  const u = getLogged(); u.balance = Number((u.balance + win).toFixed(8));
  u.history.push({type:'crash-win',bet:crashState.bet,mult:crashState.mult,win,date:new Date().toISOString()});
  saveOrUpdateUser(u); setLogged(u); renderUser();
  document.getElementById('crash-log').innerText = `تم السحب عند ${crashState.mult.toFixed(2)}x — ربح ${win.toFixed(4)} USDT`;
  endCrash(true);
}
function endCrash(won){
  clearInterval(crashState.interval); crashState.running = false; document.getElementById('crash-cash').disabled = true;
  if(!won){ const u=getLogged(); u.history.push({type:'crash-lose',bet:crashState.bet,crashAt:crashState.crashAt,date:new Date().toISOString()}); saveOrUpdateUser(u); setLogged(u); renderUser(); document.getElementById('crash-log').innerText = `💥 انهارت عند ${crashState.crashAt.toFixed(2)}x — خسرت ${crashState.bet.toFixed(4)} USDT`; }
  setTimeout(()=>{ document.getElementById('crash-multi').innerText='1.00x'; const p = document.getElementById('plane'); if(p) p.style.left='10px'; },900);
}

/* ---------- page init ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // Index page UI
  if(document.getElementById('auth-card')){
    const logged = getLogged();
    if(logged){ document.getElementById('auth-card').classList.add('hidden'); document.getElementById('app-card').classList.remove('hidden'); renderUser(); }
    else { document.getElementById('auth-card').classList.remove('hidden'); document.getElementById('app-card')?.classList?.add?.('hidden'); }
  }

  // Trade page
  if(document.getElementById('tradeChart')){
    if(!ensureLoggedInOrRedirect()) return;
    const sel = document.getElementById('trade-symbol'); sel.addEventListener('change', ()=> loadMarket(sel.value));
    loadMarket(document.getElementById('trade-symbol').value);
  }

  // Invest page
  if(document.getElementById('invest-type')){ if(!ensureLoggedInOrRedirect()) return; }

  // Deposit page
  if(document.getElementById('deposit-address')){ ensureLoggedInOrRedirect(); }

  // Games page
  if(document.getElementById('crash-bet')){ ensureLoggedInOrRedirect(); }
});
