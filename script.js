/* script.js - إدارة المستخدم/رصيد/تداول/استثمار/ألعاب */
/* مفاتيح التخزين */
const USERS_KEY = 'bx_users_final';
const LOGGED_KEY = 'bx_logged_final';

/* ---- helpers ---- */
function getUsers(){ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
function saveUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function findUser(email){ if(!email) return null; return getUsers().find(x=>x.email.toLowerCase()===email.toLowerCase()) || null; }
function saveOrUpdateUser(user){ const arr=getUsers(); const i=arr.findIndex(x=>x.email.toLowerCase()===user.email.toLowerCase()); if(i===-1) arr.push(user); else arr[i]=user; saveUsers(arr); }
function setLogged(user){ localStorage.setItem(LOGGED_KEY, JSON.stringify(user)); }
function getLogged(){ return JSON.parse(localStorage.getItem(LOGGED_KEY) || 'null'); }
function ensureLoggedInOrRedirect(){ const u=getLogged(); if(!u){ alert('🔒 يرجى تسجيل الدخول أولاً'); window.location.href='index.html'; return false; } return true; }

/* ---- Auth (index.html) ---- */
function showRegister(){ document.getElementById('login-form').classList.add('hidden'); document.getElementById('register-form').classList.remove('hidden'); }
function showLogin(){ document.getElementById('register-form').classList.add('hidden'); document.getElementById('login-form').classList.remove('hidden'); }
function register(){
  const first = document.getElementById('first-name').value.trim();
  const last = document.getElementById('last-name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-password').value.trim();
  if(!first || !last || !phone || !email || !pass){ alert('يرجى ملء الحقول'); return; }
  if(findUser(email)){ alert('هذا البريد مستخدم'); return; }
  const user = { first, last, phone, email, password: pass, balance: 50.00, created: new Date().toISOString(), history:[] };
  saveOrUpdateUser(user); setLogged(user);
  alert('تم إنشاء الحساب وتسجيل الدخول'); goToApp();
}
function login(){
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value.trim();
  if(!email || !pass){ alert('املأ الحقول'); return; }
  const u = findUser(email);
  if(!u){ alert('البريد غير موجود'); return; }
  if(u.password !== pass){ alert('كلمة المرور خطأ'); return; }
  setLogged(u); alert('تم تسجيل الدخول'); goToApp();
}
function goToApp(){
  if(document.getElementById('auth-wrap')){
    document.getElementById('auth-wrap').classList.add('hidden');
    document.getElementById('app-wrap').classList.remove('hidden');
    renderUser();
  } else {
    window.location.href='index.html';
  }
}
function renderUser(){
  const u = getLogged(); if(!u) return;
  document.getElementById('user-name').innerText = `${u.first} ${u.last}`;
  document.getElementById('current-balance').innerText = Number(u.balance || 0).toFixed(2);
}
function logout(){ localStorage.removeItem(LOGGED_KEY); window.location.href='index.html'; }

/* quick add/reset */
function quickAdd(){
  const amt = parseFloat(document.getElementById('quick-amount')?.value);
  if(isNaN(amt) || amt <=0){ alert('ادخل مبلغ صالح'); return; }
  const u = getLogged(); if(!u){ alert('سجل اولاً'); return; }
  u.balance = Number((Number(u.balance||0) + amt).toFixed(8));
  saveOrUpdateUser(u); setLogged(u); renderUser(); alert('تم اضافة الرصيد التجريبي');
}
function quickReset(){
  if(!confirm('اعادة ضبط الرصيد؟')) return;
  const u=getLogged(); if(!u){ alert('سجل اولاً'); return; }
  u.balance = 0; saveOrUpdateUser(u); setLogged(u); renderUser(); alert('تمت الاعادة');
}

/* wallet copy */
function copyWallet(){
  const addr = document.getElementById('wallet-address')?.innerText || '';
  if(!addr) return;
  navigator.clipboard.writeText(addr).then(()=> alert('تم نسخ العنوان'));
}

/* deposit page */
function copyDepositAddress(){ const addr=document.getElementById('deposit-address')?.innerText || ''; if(!addr) return; navigator.clipboard.writeText(addr).then(()=> alert('تم نسخ عنوان الإيداع'));}
function submitProof(){
  if(!ensureLoggedInOrRedirect()) return;
  const amt = parseFloat(document.getElementById('proof-amount')?.value);
  const f = document.getElementById('proof-file')?.files?.[0];
  if(isNaN(amt) || !f){ alert('أدخل المبلغ وأرفق صورة'); return; }
  document.getElementById('proof-msg').innerText = 'تم إرسال الإثبات — قيد المراجعة';
  alert('تم إرسال إثبات الإيداع (محاكاة)');
}

/* ---- Trading: coinGecko + Chart.js ---- */
let tradeChart = null;
async function loadMarket(id='bitcoin'){
  if(!ensureLoggedInOrRedirect()) return;
  try{
    // price + 24h change
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
      tradeChart = new Chart(ctx, { type:'line', data:{labels, datasets:[{label:'السعر (USD)',data:prices,borderColor:'#f1c40f',backgroundColor:'rgba(241,196,15,0.08)',tension:0.2}]}, options:{responsive:true,maintainAspectRatio:false,scales:{x:{display:false}}} });
    }
    // sma & rsi simple
    const sma = smaCalc(prices,14);
    const rsi = rsiCalc(prices,14);
    document.getElementById('trade-sma').innerText = isNaN(sma)?'--':`$${sma.toFixed(2)}`;
    document.getElementById('trade-rsi').innerText = isNaN(rsi)?'--':rsi.toFixed(2);
  }catch(e){ console.warn(e); }
}
function refreshMarket(){ const sel=document.getElementById('trade-symbol'); loadMarket(sel.value); }
function doTrade(type){
  if(!ensureLoggedInOrRedirect()) return;
  const amt = parseFloat(document.getElementById('trade-amount')?.value);
  if(isNaN(amt) || amt<=0){ alert('ادخل مبلغ صالح'); return; }
  const u=getLogged();
  if(type==='buy' && amt>u.balance){ alert('رصيد غير كاف'); return; }
  if(type==='buy'){ u.balance = Number((u.balance - amt).toFixed(8)); u.history.push({type:'buy',amount:amt,date:new Date().toISOString()}); }
  else { u.history.push({type:'sell',amount:amt,date:new Date().toISOString()}); }
  saveOrUpdateUser(u); setLogged(u); renderUser(); document.getElementById('trade-log').innerText = `تم ${type} بمبلغ ${amt} USDT`; alert('تم تنفيذ الصفقة (محاكاة)');
}
function smaCalc(arr,period){ if(!arr||arr.length<period) return NaN; const slice=arr.slice(-period); return slice.reduce((a,b)=>a+b,0)/period; }
function rsiCalc(prices,period=14){ if(!prices || prices.length<=period) return NaN; let gains=0,losses=0; for(let i=prices.length-period;i<prices.length;i++){ const d = prices[i]-prices[i-1]; if(d>0) gains+=d; else losses+=Math.abs(d);} const avgG=gains/period, avgL=losses/period; if(avgL===0) return 100; const rs=avgG/avgL; return 100 - (100/(1+rs)); }

/* ---- Investment ---- */
function calculateInvest(){ const type=document.getElementById('invest-type')?.value; const amt=parseFloat(document.getElementById('invest-amount')?.value); if(isNaN(amt)||amt<=0){ alert('ادخل مبلغ'); return;} const factor = type==='long'?1.12:1.05; document.getElementById('invest-est').innerText = `${(amt*factor).toFixed(2)} USDT`; document.getElementById('apr').innerText = type==='long'?'12%':'5%'; document.getElementById('risk').innerText = type==='long'?'متوسط':'مرتفع'; }
function startInvestment(){ if(!ensureLoggedInOrRedirect()) return; const amt=parseFloat(document.getElementById('invest-amount')?.value); const type=document.getElementById('invest-type')?.value; if(isNaN(amt)||amt<=0){ alert('ادخل مبلغ'); return;} const u=getLogged(); if(amt>u.balance){ alert('رصيد غير كاف'); return;} u.balance = Number((u.balance - amt).toFixed(8)); u.history.push({type:'invest',contract:type,amount:amt,date:new Date().toISOString()}); saveOrUpdateUser(u); setLogged(u); renderUser(); alert('تم بدء الاستثمار (محاكاة)'); }

/* ---- Games: Crash (plane), Wheel, Dice ---- */

/* Crash game */
let crashState = { running:false, interval:null, multiplier:1, crashAt: null, bet:0, cashed:false };
function crashStart(){
  if(!ensureLoggedInOrRedirect()) return;
  if(crashState.running){ alert('جولة تعمل'); return;}
  const bet = parseFloat(document.getElementById('crash-bet')?.value);
  if(isNaN(bet)||bet<=0){ alert('ادخل مبلغ'); return; }
  const u=getLogged(); if(bet>u.balance){ alert('رصيد غير كاف'); return; }
  // deduct bet immediately
  u.balance = Number((u.balance - bet).toFixed(8)); saveOrUpdateUser(u); setLogged(u); renderUser();
  crashState.running = true; crashState.multiplier = 1; crashState.bet = bet; crashState.cashed=false;
  // random crash
  const r = Math.random(); crashState.crashAt = Math.max(1.05, 1 + Math.pow(r,2)*6); // 1.05 .. ~7
  document.getElementById('crash-cash').disabled=false; document.getElementById('crash-log').innerText='الجولة تعمل — اضغط سحب قبل الانهيار';
  const planeEl = document.getElementById('plane'); planeEl.style.left='8px';
  crashState.interval = setInterval(()=>{
    crashState.multiplier += 0.02 + crashState.multiplier*0.002;
    document.getElementById('crash-multi').innerText = crashState.multiplier.toFixed(2)+'x';
    // animate plane
    const curLeft = parseInt(planeEl.style.left || '8');
    planeEl.style.left = (curLeft + 6) + 'px';
    if(crashState.multiplier >= crashState.crashAt){ // crash
      endCrash(false);
    }
  },120);
}
function crashCashOut(){
  if(!crashState.running || crashState.cashed) return;
  crashState.cashed = true;
  const win = Number((crashState.bet * crashState.multiplier).toFixed(8));
  const u = getLogged(); u.balance = Number((u.balance + win).toFixed(8));
  u.history.push({type:'crash-win',bet:crashState.bet,mult:crashState.multiplier,win, date:new Date().toISOString()});
  saveOrUpdateUser(u); setLogged(u); renderUser();
  document.getElementById('crash-log').innerText = `تم السحب عند ${crashState.multiplier.toFixed(2)}x — ربح ${win.toFixed(4)} USDT`;
  endCrash(true);
}
function endCrash(won){
  clearInterval(crashState.interval); crashState.running=false; document.getElementById('crash-cash').disabled=true;
  if(!won){ const u=getLogged(); u.history.push({type:'crash-lose',bet:crashState.bet, crashAt:crashState.crashAt, date:new Date().toISOString()}); saveOrUpdateUser(u); setLogged(u); renderUser(); document.getElementById('crash-log').innerText = `💥 انهارت عند ${crashState.crashAt.toFixed(2)}x — خسرت ${crashState.bet.toFixed(4)} USDT`; }
  setTimeout(()=>{ document.getElementById('crash-multi').innerText='1.00x'; document.getElementById('plane').style.left='8px'; },1000);
}

/* Wheel */
function spinWheel(){
  if(!ensureLoggedInOrRedirect()) return;
  const bet = parseFloat(document.getElementById('wheel-bet')?.value);
  if(isNaN(bet)||bet<=0){ alert('ادخل مبلغ'); return; }
  const u=getLogged(); if(bet>u.balance){ alert('رصيد غير كاف'); return; }
  // deduct
  u.balance = Number((u.balance - bet).toFixed(8)); saveOrUpdateUser(u); setLogged(u); renderUser();
  const outcomes = [1.2,1.5,2,0,0.5,3]; // multiplier outcomes (0 means lose)
  const idx = Math.floor(Math.random()*outcomes.length);
  const multi = outcomes[idx];
  document.getElementById('wheel-log').innerText='الدوران...';
  // animation (rotate wheel element)
  const wheelEl = document.getElementById('wheel');
  const fullRot = 360*3 + idx*(360/outcomes.length);
  wheelEl.style.transition = 'transform 3s cubic-bezier(.2,.9,.2,1)';
  wheelEl.style.transform = `rotate(${fullRot}deg)`;
  setTimeout(()=>{
    wheelEl.style.transition = ''; wheelEl.style.transform = '';
    if(multi>0){
      const win = Number((bet * multi).toFixed(8));
      u.balance = Number((u.balance + win).toFixed(8)); saveOrUpdateUser(u); setLogged(u); renderUser();
      document.getElementById('wheel-log').innerText = `ربحت ${win.toFixed(4)} USDT (×${multi})`;
      u.history.push({type:'wheel-win',bet,multi,win,date:new Date().toISOString()});
    } else {
      document.getElementById('wheel-log').innerText = `خسرت ${bet.toFixed(4)} USDT`;
      u.history.push({type:'wheel-lose',bet,date:new Date().toISOString()});
      saveOrUpdateUser(u); setLogged(u);
    }
  },3200);
}

/* Dice */
function rollDice(){
  if(!ensureLoggedInOrRedirect()) return;
  const bet = parseFloat(document.getElementById('dice-bet')?.value);
  if(isNaN(bet)||bet<=0){ alert('ادخل مبلغ'); return; }
  const u=getLogged(); if(bet>u.balance){ alert('رصيد غير كاف'); return; }
  // deduct
  u.balance = Number((u.balance - bet).toFixed(8)); saveOrUpdateUser(u); setLogged(u); renderUser();
  const roll = Math.floor(Math.random()*6)+1;
  document.getElementById('dice-display').innerText = roll;
  if(roll>=5){
    const win = Number((bet * 1.8).toFixed(8));
    u.balance = Number((u.balance + win).toFixed(8)); saveOrUpdateUser(u); setLogged(u); renderUser();
    document.getElementById('dice-log').innerText = `ربحت ${win.toFixed(4)} USDT (الرقم ${roll})`;
    u.history.push({type:'dice-win',bet,roll,win,date:new Date().toISOString()});
  } else {
    document.getElementById('dice-log').innerText = `خسرت ${bet.toFixed(4)} USDT (الرقم ${roll})`;
    u.history.push({type:'dice-lose',bet,roll,date:new Date().toISOString()}); saveOrUpdateUser(u); setLogged(u);
  }
}

/* ---- page inits ---- */
document.addEventListener('DOMContentLoaded', ()=>{
  // index page
  if(document.getElementById('auth-wrap')){
    const logged = getLogged();
    if(logged){ document.getElementById('auth-wrap').classList.add('hidden'); document.getElementById('app-wrap').classList.remove('hidden'); renderUser(); }
    else { document.getElementById('auth-wrap').classList.remove('hidden'); document.getElementById('app-wrap').classList.add('hidden'); }
  }

  // trade page
  if(document.getElementById('tradeChart')){ if(!ensureLoggedInOrRedirect()) return; const sel=document.getElementById('trade-symbol'); sel.addEventListener('change', ()=> loadMarket(sel.value)); loadMarket('bitcoin'); }

  // invest page
  if(document.getElementById('invest-type')){ if(!ensureLoggedInOrRedirect()) return; }

  // deposit page ensure login
  if(document.getElementById('deposit-address')){ ensureLoggedInOrRedirect(); }

  // games page ensure login
  if(document.getElementById('crash-bet')){ ensureLoggedInOrRedirect(); }
});
