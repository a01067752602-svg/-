/* ===========================
   튼튼탐험대 — app.js
   =========================== */

/* ── 전역 상태 ── */
var points      = 20;
var missionDone = {};
var curMonth    = 6;
var STORAGE_KEY = 'tuntun_body_records_v2';

/* ── 레벨 정의 ── */
var LEVELS = [
  { name: '1단계: 건강새내기', icon: '🌱', max: 200  },
  { name: '2단계: 튼튼탐험가', icon: '🧭', max: 600  },
  { name: '3단계: 건강챔피언', icon: '🏅', max: 1200 },
  { name: '4단계: 슈퍼히어로', icon: '🦸', max: 99999 }
];

/* ── 로컬스토리지 헬퍼 ── */
function loadRecords() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}
function saveRecords(recs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recs)); } catch (e) {}
}

/* ── 레벨 인덱스 ── */
function getLvIdx(p) {
  for (var i = 0; i < LEVELS.length; i++) {
    if (p <= LEVELS[i].max) return i;
  }
  return 3;
}

/* ── UI 업데이트 ── */
function updateUI() {
  var i    = getLvIdx(points);
  var lv   = LEVELS[i];
  var prev = i === 0 ? 0 : LEVELS[i - 1].max;
  var next = lv.max === 99999 ? prev + 500 : lv.max;
  var pct  = Math.min(100, Math.round((points - prev) / (next - prev) * 100));

  document.getElementById('coin-count').textContent  = points;
  document.getElementById('cur-level').textContent   = lv.name;
  document.getElementById('cur-icon').textContent    = lv.icon;
  document.getElementById('cur-next').textContent    = i < 3
    ? '다음 단계까지 포인트 ' + (next - points) + '개 더!'
    : '최고 단계 달성! 슈퍼히어로!';
  document.getElementById('prog-fill').style.width   = pct + '%';
  document.getElementById('prog-max').textContent    = (i < 3 ? next : '최고') + '포인트';

  for (var j = 0; j < 4; j++) {
    document.getElementById('lv' + j).className = 'lv-card' + (j === i ? ' active' : '');
  }
}

/* ── 토스트 ── */
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent  = msg;
  t.style.display = 'block';
  setTimeout(function () { t.style.display = 'none'; }, 2500);
}

/* ── 포인트 추가 ── */
function addPoints(n) {
  var before = getLvIdx(points);
  points += n;
  var after = getLvIdx(points);
  updateUI();
  if (after > before) {
    showLevelup(after);
  } else {
    showToast('⭐ 탐험 포인트 +' + n + ' 획득!');
  }
  // 패널이 열려 있으면 퍼즐도 즉시 업데이트
  if (document.getElementById('panel-picture').classList.contains('open')) {
    initPicture();
  }
}

/* ── 레벨업 축하 모달 ── */
var LEVELUP_DATA = [
  null,
  { badge:'2단계 달성! 🎉', icon:'🧭', title:'튼튼탐험가', msg:'멋진 탐험가가 됐어요!\n계속 건강을 쌓아가요!', stars:'⭐ ⭐ ⭐', btnText:'계속 도전! →', theme:'theme-2', emoji:['🎉','⭐','🌟','🎊','✨','💚','🍀','🌿'] },
  { badge:'3단계 달성! 🏅', icon:'🏅', title:'건강챔피언', msg:'건강 챔피언 등극!\n정말 대단해요!', stars:'🏅 🔥 🏅 🔥 🏅', btnText:'챔피언처럼 고고! →', theme:'theme-3', emoji:['🏅','🔥','💪','🎯','⭐','🎉','👊','✨'] }
];

function showLevelup(lvIdx) {
  if (lvIdx === 3) { showHeroModal(); return; }
  var d = LEVELUP_DATA[lvIdx];
  if (!d) { showToast('🎉 레벨업!'); return; }

  var box = document.getElementById('lum-box');
  box.className = 'lum-box ' + d.theme;
  document.getElementById('lum-icon').textContent  = d.icon;
  document.getElementById('lum-badge').textContent = d.badge;
  document.getElementById('lum-title').textContent = d.title;
  document.getElementById('lum-msg').textContent   = d.msg;
  document.getElementById('lum-stars').textContent = d.stars;
  document.getElementById('lum-btn').textContent   = d.btnText;

  var cc = document.getElementById('lum-confetti');
  cc.innerHTML = '';
  for (var i = 0; i < 20; i++) {
    var s = document.createElement('span');
    s.textContent = d.emoji[i % d.emoji.length];
    s.style.cssText = 'position:absolute;left:' + Math.random()*90 + '%;top:-20px;font-size:' + (14+Math.random()*14) + 'px;animation:confettiFall ' + (1.2+Math.random()*1.2) + 's ' + (Math.random()*1.2) + 's ease-in forwards;';
    cc.appendChild(s);
  }
  document.getElementById('levelup-modal').classList.add('open');
}

function closeLevelup() {
  document.getElementById('levelup-modal').classList.remove('open');
}

/* ── 슈퍼히어로 특별 모달 ── */
function showHeroModal() {
  var cc = document.getElementById('hero-confetti');
  cc.innerHTML = '';
  var heroEmoji = ['🦸','👑','🌈','💫','🎆','🎇','⭐','🌟','✨','🎉','🎊','🏆'];
  for (var i = 0; i < 30; i++) {
    var s = document.createElement('span');
    s.textContent = heroEmoji[i % heroEmoji.length];
    s.style.cssText = 'position:absolute;left:' + Math.random()*90 + '%;top:-20px;font-size:' + (16+Math.random()*18) + 'px;animation:confettiFall ' + (1.5+Math.random()*1.5) + 's ' + (Math.random()*1.5) + 's ease-in forwards;';
    cc.appendChild(s);
  }
  document.getElementById('hero-modal').classList.add('open');
}

function closeHeroModal() {
  document.getElementById('hero-modal').classList.remove('open');
  showToast('🦸 슈퍼히어로 달성! 선생님께 선물을 받으세요! 🎁');
}

/* ── 패널 열기 / 닫기 ── */
function openPanel(id) {
  document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('open'); });
  var panel = document.getElementById(id);
  panel.classList.add('open');
  document.getElementById('main-menu').style.display = 'none';
  if (id === 'panel-body-score') initBodyScore();
  if (id === 'panel-picture')    initPicture();
  if (id === 'panel-mission')    initMissionPanel();
  window.scrollTo(0, 0);
  /* 패널 내 모든 a 태그 클릭 이벤트 보장 */
  panel.querySelectorAll('a[href]').forEach(function(a) {
    a.style.pointerEvents = 'auto';
    a.style.position = 'relative';
    a.style.zIndex = '10';
  });
}
function closePanel(id) {
  document.getElementById(id).classList.remove('open');
  document.getElementById('main-menu').style.display = 'block';
}

/* ── 미션 관련 상수 ── */
var MISSION_STORAGE_KEY = 'tuntun_mission_daily';
var MISSION_MAX_PT = 30; // 하루 최대 포인트 (5+5+8+5+7)
var MISSION_CONFIG = { m1:5, m2:5, m3:8, m4:5, m5:7 };

/* 오늘 날짜 문자열 */
function getTodayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
}

/* 오늘 미션 데이터 로드 */
function loadMissionToday() {
  try {
    var raw = localStorage.getItem(MISSION_STORAGE_KEY);
    if (!raw) return { date: getTodayStr(), done: {}, pts: 0 };
    var data = JSON.parse(raw);
    if (data.date !== getTodayStr()) {
      // 날짜가 바뀌면 초기화
      return { date: getTodayStr(), done: {}, pts: 0 };
    }
    return data;
  } catch(e) { return { date: getTodayStr(), done: {}, pts: 0 }; }
}

/* 오늘 미션 데이터 저장 */
function saveMissionToday(data) {
  try { localStorage.setItem(MISSION_STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
}

/* 미션 패널 열릴 때 오늘 상태 복원 */
function initMissionPanel() {
  var data = loadMissionToday();
  var ids = ['m1','m2','m3','m4','m5'];
  ids.forEach(function(id) {
    var el  = document.getElementById(id);
    var btn = document.getElementById('btn-' + id);
    if (!el || !btn) return;
    if (data.done[id]) {
      el.classList.add('done');
      btn.textContent = '완료 ✓';
      btn.classList.add('done');
    } else {
      el.classList.remove('done');
      btn.textContent = '완료!';
      btn.classList.remove('done');
    }
  });
  renderMissionInfo(data);
}

/* 미션 현황 표시 */
function renderMissionInfo(data) {
  var el = document.getElementById('mission-daily-info');
  if (!el) return;
  var earned = data.pts || 0;
  var remain = MISSION_MAX_PT - earned;
  if (earned >= MISSION_MAX_PT) {
    el.innerHTML = '<span class="mdi-done">🎉 오늘 미션 포인트를 모두 획득했어요! (+' + earned + 'P)<br>내일 또 도전해요!</span>';
  } else {
    el.innerHTML = '오늘 획득 <strong>' + earned + 'P</strong> / 최대 <strong>' + MISSION_MAX_PT + 'P</strong> &nbsp;|&nbsp; 남은 포인트 <span class="mdi-done">+' + remain + 'P</span>';
  }
}

/* ── 미션 완료 (일일 제한 포함) ── */
function doMission(id, n) {
  var data = loadMissionToday();
  // 이미 완료한 미션
  if (data.done[id]) {
    showToast('✅ 이미 완료한 미션이에요!');
    return;
  }
  // 일일 포인트 한도 초과 체크
  if (data.pts + n > MISSION_MAX_PT) {
    showToast('⚠️ 오늘 미션 포인트(' + MISSION_MAX_PT + 'P)를 모두 채웠어요!');
    return;
  }
  // 완료 처리
  data.done[id] = true;
  data.pts = (data.pts || 0) + n;
  saveMissionToday(data);
  missionDone[id] = true;
  var el  = document.getElementById(id);
  var btn = document.getElementById('btn-' + id);
  el.classList.add('done');
  btn.textContent = '완료 ✓';
  btn.classList.add('done');
  addPoints(n);
  renderMissionInfo(data);
}

/* ─────────────────────────────
   이번달 내 몸은 몇점? 기능
───────────────────────────── */

/* 대한비만학회 기준 BMI 판정 */
function getBmiStatus(bmi) {
  if (bmi < 18.5) return { label: '저체중',              color: '#378ADD', bg: '#E6F1FB', desc: '몸무게가 조금 부족해요. 균형 잡힌 식사로 건강하게 몸을 키워봐요!' };
  if (bmi < 23  ) return { label: '정상',                color: '#1D9E75', bg: '#E1F5EE', desc: '아주 건강한 상태예요! 지금처럼 건강한 생활을 유지해요!' };
  if (bmi < 25  ) return { label: '과체중 (비만 전단계)', color: '#EF9F27', bg: '#FAEEDA', desc: '비만 전단계예요. 규칙적인 운동과 균형 잡힌 식사를 시작해봐요!' };
  if (bmi < 30  ) return { label: '1단계 비만',           color: '#D85A30', bg: '#FAECE7', desc: '1단계 비만이에요. 건강한 식습관과 운동이 꼭 필요해요!' };
  if (bmi < 35  ) return { label: '2단계 비만',           color: '#E24B4A', bg: '#FCEBEB', desc: '2단계 비만이에요. 선생님 또는 전문가와 함께 건강 계획을 세워봐요!' };
  return               { label: '3단계 비만 (고도비만)',  color: '#A32D2D', bg: '#FCEBEB', desc: '고도비만이에요. 전문가의 도움이 필요해요. 선생님께 꼭 말씀드려요!' };
}

/* 패널 초기화 */
function initBodyScore() {
  var recs = loadRecords();
  updateTabStyles(recs);
  selectMonth(curMonth, document.getElementById('tab-' + curMonth));
}

/* 탭 색상 업데이트 (기록 있는 달 표시) */
function updateTabStyles(recs) {
  [6, 7, 8, 9, 10, 11, 12].forEach(function (m) {
    var tab = document.getElementById('tab-' + m);
    if (!tab) return;
    if (recs[m]) { tab.classList.add('has-data');    }
    else         { tab.classList.remove('has-data'); }
  });
}

/* 월 선택 */
function selectMonth(m, el) {
  curMonth = m;
  document.querySelectorAll('.month-tab').forEach(function (t) { t.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('month-input-title').textContent = m + '월 체중 기록';

  var recs = loadRecords();
  var rc   = document.getElementById('result-card');
  rc.className = 'result-card';
  rc.innerHTML = '';

  if (recs[m]) {
    document.getElementById('input-height').value = recs[m].h;
    document.getElementById('input-weight').value = recs[m].w;
    showResultCard(recs[m].bmi);
  } else {
    document.getElementById('input-height').value = '';
    document.getElementById('input-weight').value = '';
  }
  renderHistory(recs);
}

/* 결과 카드 표시 */
function showResultCard(bmi) {
  var st = getBmiStatus(bmi);
  var rc = document.getElementById('result-card');
  rc.style.background   = st.bg;
  rc.style.borderRadius = '8px';
  rc.style.padding      = '14px';
  rc.innerHTML =
    '<div class="result-bmi" style="color:' + st.color + '">BMI ' + bmi.toFixed(1) + '</div>' +
    '<div class="result-label" style="color:' + st.color + '">' + st.label + '</div>' +
    '<div class="result-desc">' + st.desc + '</div>' +
    '<div style="font-size:10px;color:#888;margin-top:6px">기준: 대한비만학회</div>';
  rc.className = 'result-card show';
}

/* BMI 계산 & 저장 */
function calcBMI() {
  var h = parseFloat(document.getElementById('input-height').value);
  var w = parseFloat(document.getElementById('input-weight').value);
  if (!h || !w || h < 80 || h > 220 || w < 10 || w > 200) {
    showToast('키와 몸무게를 올바르게 입력해 주세요!');
    return;
  }
  var bmi  = w / ((h / 100) * (h / 100));
  var recs = loadRecords();
  recs[curMonth] = { h: h, w: w, bmi: bmi };
  saveRecords(recs);
  showResultCard(bmi);
  updateTabStyles(recs);
  renderHistory(recs);
  showToast(curMonth + '월 기록 저장 완료! 🔒');
}

/* 누적 기록 렌더링 */
function renderHistory(recs) {
  var keys = Object.keys(recs).map(Number).sort(function (a, b) { return a - b; });
  if (keys.length === 0) {
    document.getElementById('history-section').style.display = 'none';
    return;
  }
  document.getElementById('history-section').style.display = 'block';
  var html = '';
  keys.forEach(function (m, idx) {
    var r  = recs[m];
    var st = getBmiStatus(r.bmi);
    var trend = '';
    if (idx > 0) {
      var diff = r.bmi - recs[keys[idx - 1]].bmi;
      trend = diff > 0.2
        ? '<span style="color:#E24B4A">↑</span>'
        : diff < -0.2
          ? '<span style="color:#1D9E75">↓</span>'
          : '<span style="color:#888">→</span>';
    }
    html +=
      '<div class="history-item">' +
        '<span class="hi-month">'  + m + '월</span>' +
        '<span class="hi-data">키 ' + r.h + 'cm · ' + r.w + 'kg</span>' +
        '<span class="hi-bmi" style="color:' + st.color + '">' + r.bmi.toFixed(1) + trend + '</span>' +
        '<span class="hi-status" style="background:' + st.bg + ';color:' + st.color + '">' + st.label + '</span>' +
      '</div>';
  });
  document.getElementById('history-list').innerHTML = html;
}

/* ── 초기 실행 ── */
updateUI();

/* ── 이달의 퍼즐 완성 ── */
function initPicture() {
  var today     = new Date();
  var month     = today.getMonth() + 1;
  var day       = today.getDate();
  var goalPts   = getLvIdx(points) < 1 ? 200 : getLvIdx(points) < 2 ? 600 : 1200;

  // 28일 기준 목표치 (월 목표의 28/31 비율로 일할 계산도 가능하지만 심플하게 월 목표 고정)
  var goal      = 200; // 월 기본 목표
  var ratio     = Math.min(1, points / goal);
  var pct       = Math.round(ratio * 100);

  // 28일 지났으면 완성 여부 확정
  var isDeadline = day >= 28;

  document.getElementById('pic-cur').textContent  = points;
  document.getElementById('pic-goal').textContent = goal;
  document.getElementById('pic-pct').textContent  = pct + '%';
  document.getElementById('pic-month-badge').textContent = month + '월의 퍼즐';

  // 진행 바
  document.getElementById('pic-fill').style.width = pct + '%';

  // 이미지 선명도: 0%→투명(밑그림), 100%→완전 선명
  var imgOpacity   = 0.08 + (ratio * 0.92);   // 0.08 ~ 1.0
  var grayScale    = Math.round((1 - ratio) * 60); // 60% → 0%
  var overlayOpacity = Math.max(0, 1 - ratio * 1.4);

  var img = document.getElementById('pic-img');
  img.style.opacity = imgOpacity.toFixed(2);
  img.style.filter  = 'grayscale(' + grayScale + '%)';

  var overlay = document.getElementById('pic-overlay');
  overlay.style.opacity = overlayOpacity.toFixed(2);
  if (overlayOpacity <= 0) overlay.style.display = 'none';
  else overlay.style.display = 'flex';

  // 오버레이 문구
  var overlayText = document.getElementById('pic-overlay-text');
  if (pct < 25)       overlayText.innerHTML = '🧩 포인트를 모아<br>퍼즐을 완성해요!';
  else if (pct < 50)  overlayText.innerHTML = '✨ ' + pct + '% 완성!<br>계속 모아봐요!';
  else if (pct < 75)  overlayText.innerHTML = '🌟 절반 넘었어요!<br>' + pct + '% 달성!';
  else if (pct < 100) overlayText.innerHTML = '🔥 거의 다 왔어요!<br>' + pct + '% 달성!';
  else                overlayText.innerHTML = '🎉 완성!';

  // 완성 메시지 (28일 이후 + 100% 달성 or 28일 이후 현황)
  var completeEl = document.getElementById('pic-complete');
  if (ratio >= 1) {
    completeEl.style.display = 'block';
  } else {
    completeEl.style.display = 'none';
  }
}


/* ── 관리자 로그인 ── */
var ADMIN_PW = '1234'; // 비밀번호 여기서 변경하세요

function openAdminLogin() {
  document.getElementById('admin-modal').classList.add('open');
  document.getElementById('admin-pw').value = '';
  document.getElementById('admin-err').textContent = '';
  setTimeout(function(){ document.getElementById('admin-pw').focus(); }, 100);
}

function closeAdminLogin() {
  document.getElementById('admin-modal').classList.remove('open');
}

function checkAdmin() {
  var pw = document.getElementById('admin-pw').value;
  if (pw === ADMIN_PW) {
    closeAdminLogin();
    openPanel('panel-admin');
  } else {
    document.getElementById('admin-err').textContent = '❌ 비밀번호가 틀렸어요';
    document.getElementById('admin-pw').value = '';
    document.getElementById('admin-pw').focus();
  }
}

/* ── 포인트 수동 지급 ── */
function grantPoint() {
  var name   = document.getElementById('grant-name').value;
  var reason = document.getElementById('grant-reason').value;
  var pt     = parseInt(document.getElementById('grant-pt').value) || 0;
  if (!name) { alert('학생을 선택해 주세요'); return; }
  if (pt < 1) { alert('포인트를 입력해 주세요'); return; }

  var log  = document.getElementById('grant-log');
  var now  = new Date();
  var time = now.getHours() + ':' + String(now.getMinutes()).padStart(2,'0');
  var item = document.createElement('div');
  item.className = 'grant-log-item';
  item.innerHTML =
    '<span><strong>' + name + '</strong> · ' + reason + '</span>' +
    '<span style="color:#1D9E75;font-weight:600">+' + pt + 'P · ' + time + '</span>';
  log.insertBefore(item, log.firstChild);
  showToast('✅ ' + name + ' 에게 ' + pt + '포인트 지급 완료!');
  document.getElementById('grant-pt').value = '5';
  document.getElementById('grant-name').value = '';
}
