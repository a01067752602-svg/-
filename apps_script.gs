// ================================================
// 튼튼탐험대 Google Apps Script
// ================================================
// 사용법:
// 1. 구글 시트 → 확장 프로그램 → Apps Script
// 2. 이 코드 전체 붙여넣기
// 3. 저장 후 배포 → 새 배포 → 웹 앱
//    실행: 나, 액세스: 모든 사용자
// 4. 배포 URL을 앱의 SHEETS_URL에 붙여넣기
// ================================================

var SHEET_DAILY = '누적 데이터(일)';  // 매일 쌓이는 탭
var MONTH_TABS  = { 6:'6월', 7:'7월', 8:'8월', 9:'9월', 10:'10월', 11:'11월', 12:'12월' };

// ── POST 요청 수신 ──────────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var type = data.type || '';

    if (type === 'mission') {
      saveMission(data);
    } else if (type === 'bmi') {
      saveBmi(data);
    } else if (type === 'monthly_transfer') {
      transferToMonthTab(data.month);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', msg: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── GET 요청 (테스트용) ─────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput('튼튼탐험대 시트 연동 OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ── 미션 포인트 저장 ────────────────────────────
function saveMission(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_DAILY);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_DAILY);
    // 헤더 설정
    sheet.getRange(1,1,1,6).setValues([['타임스탬프','학년반번호','이름','미션','일일 포인트','수동지급포인트']]);
    sheet.getRange(1,1,1,6).setBackground('#673AB7').setFontColor('#ffffff').setFontWeight('bold');
  }

  var now   = new Date();
  var stamp = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
  var num   = data.number || '미입력';
  var name  = data.name   || '';
  var mission = data.mission || '';
  var pts   = data.pts    || 0;

  // 같은 학번+같은 미션이 오늘 이미 있는지 확인 (중복 방지)
  var today = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd');
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var existing = sheet.getRange(2, 1, lastRow-1, 4).getValues();
    for (var i = 0; i < existing.length; i++) {
      var rowDate = existing[i][0] ? existing[i][0].toString().substring(0,10) : '';
      var rowNum  = existing[i][1] ? existing[i][1].toString() : '';
      var rowMission = existing[i][3] ? existing[i][3].toString() : '';
      if (rowDate === today && rowNum === num.toString() && rowMission === mission) {
        return; // 오늘 같은 미션 이미 저장됨 → 중복 무시
      }
    }
  }

  // 새 행 추가 (절대 기존 데이터 삭제 안 함)
  sheet.appendRow([stamp, num, name, mission, pts, '']);
}

// ── BMI 저장 ────────────────────────────────────
function saveBmi(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'BMI 기록';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1,1,1,8).setValues([['타임스탬프','학년반번호','이름','월','키(cm)','몸무게(kg)','BMI','판정']]);
    sheet.getRange(1,1,1,8).setBackground('#1565C0').setFontColor('#ffffff').setFontWeight('bold');
  }

  var now   = new Date();
  var stamp = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

  // 같은 학번+같은 월 기록이 이미 있으면 업데이트, 없으면 추가
  var num   = data.number || '미입력';
  var month = data.month  || '';
  var lastRow = sheet.getLastRow();
  var updated = false;
  if (lastRow > 1) {
    var rows = sheet.getRange(2, 1, lastRow-1, 8).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][1].toString() === num.toString() && rows[i][3].toString() === month.toString()) {
        // 같은 학번 + 같은 월 → 해당 행 업데이트
        sheet.getRange(i+2, 1, 1, 8).setValues([[
          stamp, num, data.name||'', month,
          data.height||'', data.weight||'', data.bmi||'', data.status||''
        ]]);
        updated = true;
        break;
      }
    }
  }
  if (!updated) {
    sheet.appendRow([stamp, num, data.name||'', month, data.height||'', data.weight||'', data.bmi||'', data.status||'']);
  }
}

// ── 월 누적 탭으로 이동 (매월 28일 자동) ────────
function transferToMonthTab(month) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var daily = ss.getSheetByName(SHEET_DAILY);
  if (!daily || daily.getLastRow() < 2) return;

  var monthNum = month || new Date().getMonth() + 1;
  var tabName  = MONTH_TABS[monthNum];
  if (!tabName) return;

  var monthSheet = ss.getSheetByName(tabName);
  if (!monthSheet) {
    monthSheet = ss.insertSheet(tabName);
  }

  // 월 탭 헤더
  if (monthSheet.getLastRow() === 0) {
    monthSheet.getRange(1,1,1,6).setValues([['타임스탬프','학년반번호','이름','미션','일일 포인트','수동지급포인트']]);
    monthSheet.getRange(1,1,1,6).setBackground('#2E7D32').setFontColor('#ffffff').setFontWeight('bold');
  }

  // 누적 데이터(일)에서 해당 월 데이터만 필터링하여 복사
  var allData = daily.getRange(2, 1, daily.getLastRow()-1, 6).getValues();
  var monthStr = monthNum < 10 ? '0' + monthNum : monthNum.toString();

  allData.forEach(function(row) {
    var dateStr = row[0] ? row[0].toString() : '';
    // 날짜에서 월 추출 (yyyy-MM-dd 형식)
    var rowMonth = dateStr.substring(5, 7);
    if (rowMonth === monthStr) {
      monthSheet.appendRow(row);
    }
  });
}

// ── 매월 28일 자동 실행 트리거 설정 ─────────────
// ★ 이 함수를 한 번만 수동 실행하면 자동 트리거가 등록됩니다
function setupMonthlyTrigger() {
  // 기존 트리거 삭제 (중복 방지)
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'runMonthlyTransfer') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // 매일 자정 체크 트리거 (28일인지 매일 확인)
  ScriptApp.newTrigger('runMonthlyTransfer')
    .timeBased()
    .everyDays(1)
    .atHour(0)  // 매일 자정
    .create();

  Logger.log('트리거 설정 완료: 매일 자정 실행, 28일에 월 탭으로 복사');
}

// ── 매일 자정 실행 함수 ──────────────────────────
function runMonthlyTransfer() {
  var today = new Date();
  var day   = today.getDate();
  var month = today.getMonth() + 1; // 1~12

  // 28일이면 해당 월 탭으로 복사
  if (day === 28) {
    transferToMonthTab(month);
    Logger.log(month + '월 데이터 → ' + MONTH_TABS[month] + ' 탭으로 복사 완료');
  }
}
