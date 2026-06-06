/**
 * 내수동 고등부 교사 대시보드 — Apps Script 백엔드
 *
 * 기능:
 *   - GET  : 일정 · 기도제목 · 공지 · 선생님 정보 fetch
 *   - POST : 공지 등록(이메일 발송) · 기도제목 등록 · 공유 토글 · 출석 입력
 *   - 트리거 : 주간 다이제스트 (월요일 7am) · 일일 알림 (매일 7am)
 *
 * 배포: DEPLOY.md 참조
 *
 * 인증 (Phase 1):
 *   - URL 키 ?key=nsdhs2026t (기존 시스템과 호환)
 *   - 관리자 액션은 ?adminKey= 추가
 *   - Phase 6+ 에서 Google id_token 검증으로 업그레이드 예정
 */

const SHEET_ID = '1N_ORB4RTRSmoxY8ueJUozLEu2DUE5v3g_HeFJZOtmKg';
const PUBLIC_KEY = 'nsdhs2026t';
const ADMIN_KEY  = 'admin2026t';

const SHEETS = {
  TEACHERS:  '선생님',
  SCHEDULE:  '일정',
  PRAYERS:   '기도제목',
  NOTICES:   '공지',
  ROSTER:    '26년_1학기_교적부',
};

/* ============================================================
 *  공통 유틸
 * ============================================================ */
function ok(obj)   { return ContentService.createTextOutput(JSON.stringify({ok:true,  ...obj})).setMimeType(ContentService.MimeType.JSON); }
function fail(msg) { return ContentService.createTextOutput(JSON.stringify({ok:false, error:msg})).setMimeType(ContentService.MimeType.JSON); }
function ss()      { return SpreadsheetApp.openById(SHEET_ID); }
function sheet(n)  { return ss().getSheetByName(n); }

function tableOf(sheetName) {
  const sh = sheet(sheetName);
  if (!sh) return [];
  const rng = sh.getDataRange().getValues();
  if (rng.length < 2) return [];
  const headers = rng[0];
  return rng.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function isAdminFromEmail(email) {
  if (!email) return false;
  const teachers = tableOf(SHEETS.TEACHERS);
  const t = teachers.find(r => String(r['이메일']).toLowerCase() === String(email).toLowerCase());
  return t && String(t['관리자']).toUpperCase() === 'TRUE';
}

function adminEmails() {
  return tableOf(SHEETS.TEACHERS)
    .filter(r => String(r['관리자']).toUpperCase() === 'TRUE' && String(r['활성']).toUpperCase() === 'TRUE')
    .map(r => r['이메일'])
    .filter(Boolean);
}

function activeTeacherEmails() {
  return tableOf(SHEETS.TEACHERS)
    .filter(r => String(r['활성']).toUpperCase() === 'TRUE' && r['이메일'])
    .map(r => r['이메일']);
}

function teacherByCell(cell) {
  return tableOf(SHEETS.TEACHERS).filter(r => r['2학기 담당셀'] === cell);
}

function checkKey(e) {
  return e && e.parameter && e.parameter.key === PUBLIC_KEY;
}
function checkAdmin(e) {
  return e && e.parameter && e.parameter.adminKey === ADMIN_KEY;
}

/* ============================================================
 *  doGet — 조회
 *  ?action=dashboard   대시보드 전체 데이터
 *  ?action=schedule    일정만
 *  ?action=prayers     기도제목만
 *  ?action=notices     공지만
 *  ?action=teachers    선생님 목록
 * ============================================================ */
function doGet(e) {
  try {
    if (!checkKey(e)) return fail('접근 권한 없음');
    const action = e.parameter.action || 'dashboard';

    if (action === 'dashboard') {
      return ok({
        schedule: filterActive(tableOf(SHEETS.SCHEDULE), '활성'),
        prayers:  filterActive(tableOf(SHEETS.PRAYERS), '공유'),
        notices:  filterActive(tableOf(SHEETS.NOTICES), '활성').slice(0, 5),
        serverTime: new Date().toISOString(),
      });
    }
    if (action === 'schedule') return ok({ items: filterActive(tableOf(SHEETS.SCHEDULE), '활성') });
    if (action === 'prayers')  return ok({ items: filterActive(tableOf(SHEETS.PRAYERS), '공유') });
    if (action === 'notices')  return ok({ items: filterActive(tableOf(SHEETS.NOTICES), '활성') });
    if (action === 'teachers') return ok({ items: tableOf(SHEETS.TEACHERS).filter(r => String(r['활성']).toUpperCase() === 'TRUE') });

    return fail('Unknown action: ' + action);
  } catch (err) {
    return fail(String(err));
  }
}

function filterActive(rows, col) {
  return rows.filter(r => String(r[col]).toUpperCase() === 'TRUE' || r[col] === '');
}

/* ============================================================
 *  doPost — 등록 / 수정
 *  Body: { action, ...payload }
 *  Content-Type: text/plain (CORS preflight 회피)
 * ============================================================ */
function doPost(e) {
  try {
    if (!checkKey(e)) return fail('접근 권한 없음');
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'addNotice')     return addNotice(body);
    if (action === 'addPrayer')     return addPrayer(body);
    if (action === 'togglePrayer')  return togglePrayer(body);
    if (action === 'markAttendance')return markAttendance(body);

    return fail('Unknown action: ' + action);
  } catch (err) {
    return fail(String(err));
  }
}

/* ===== addNotice ===== */
function addNotice(body) {
  if (!checkAdminBody(body)) return fail('관리자 권한 없음');
  if (!body.title || !body.content) return fail('제목·내용 필수');

  const sh = sheet(SHEETS.NOTICES);
  const id = 'N' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyMMddHHmmss');
  sh.appendRow([
    id,
    new Date(),
    body.author || '관리자',
    body.title,
    body.content,
    body.sendEmail ? true : false,
    true,
  ]);
  if (body.sendEmail) sendNoticeMail(body.title, body.content, body.author || '관리자');
  return ok({id});
}

function checkAdminBody(body) {
  return body && body.adminKey === ADMIN_KEY;
}

/* ===== addPrayer ===== */
function addPrayer(body) {
  if (!body.student || !body.content) return fail('학생·내용 필수');
  const sh = sheet(SHEETS.PRAYERS);
  const id = 'P' + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyMMddHHmmss');
  sh.appendRow([
    id,
    new Date(),
    body.student,
    body.cell || '',
    body.author || '',
    body.content,
    body.share ? true : false,
    body.expireDate || '',
    body.urgent ? true : false,
  ]);
  if (body.share) sendPrayerShareMail(body.student, body.cell, body.author, body.content);
  return ok({id});
}

/* ===== togglePrayer ===== */
function togglePrayer(body) {
  const sh = sheet(SHEETS.PRAYERS);
  const data = sh.getDataRange().getValues();
  const idCol = 0;
  const shareCol = 6;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === body.id) {
      const newShare = !data[i][shareCol];
      sh.getRange(i + 1, shareCol + 1).setValue(newShare);
      if (newShare) sendPrayerShareMail(data[i][2], data[i][3], data[i][4], data[i][5]);
      return ok({id: body.id, share: newShare});
    }
  }
  return fail('ID 없음: ' + body.id);
}

/* ===== markAttendance (Phase 3 스켈레톤) ===== */
function markAttendance(body) {
  // 추후 구현
  return ok({note: 'Phase 3에서 구현 예정'});
}

/* ============================================================
 *  이메일 발송
 * ============================================================ */
function sendNoticeMail(title, content, author) {
  const to = activeTeacherEmails();
  if (to.length === 0) return;
  const subject = '[내수동 고등부] ' + title;
  const body = [
    '안녕하세요, 내수동 고등부 선생님.',
    '',
    '새 공지가 등록되었습니다.',
    '',
    '──────────────',
    '제목: ' + title,
    '작성자: ' + author,
    '──────────────',
    '',
    content,
    '',
    '──────────────',
    '대시보드에서 자세히 확인:',
    'https://tommyseok.github.io/nsdhs-2026-h1/dashboard.html?key=' + PUBLIC_KEY,
    '',
    '— 내수동교회 고등부',
  ].join('\n');
  MailApp.sendEmail({ to: to.join(','), subject, body });
}

function sendPrayerShareMail(student, cell, author, content) {
  const to = activeTeacherEmails();
  if (to.length === 0) return;
  const subject = '[🙏 다함께 기도] ' + student + ' (' + cell + ')';
  const body = [
    '"다함께 기도해 주세요" 라고 표시된 기도제목이 새로 등록되었습니다.',
    '',
    '──────────────',
    '학생: ' + student + ' (' + cell + ')',
    '담당: ' + author + ' 선생님',
    '──────────────',
    '',
    content,
    '',
    '──────────────',
    '대시보드:',
    'https://tommyseok.github.io/nsdhs-2026-h1/dashboard.html?key=' + PUBLIC_KEY,
  ].join('\n');
  MailApp.sendEmail({ to: to.join(','), subject, body });
}

function sendBirthdayAlert(student, dateStr, cell, teacherEmail) {
  if (!teacherEmail) return;
  const subject = '[🎂 생일 D-1] ' + student + ' 내일 생일';
  const body = [
    teacherEmail.split('@')[0] + ' 선생님',
    '',
    '내일은 ' + cell + ' ' + student + ' 학생의 생일입니다.',
    '미리 챙겨주시고, 가능하면 축하 카드·메시지·간식 준비해주세요.',
    '',
    '— 내수동교회 고등부',
  ].join('\n');
  MailApp.sendEmail({ to: teacherEmail, subject, body });
}

function sendAbsenceAlert(student, cell, teacherEmail) {
  if (!teacherEmail) return;
  const subject = '[🚨 결석 알림] ' + student + ' 4주 연속 결석';
  const body = [
    teacherEmail.split('@')[0] + ' 선생님',
    '',
    cell + ' ' + student + ' 학생이 4주 연속 결석 상태입니다.',
    '본인 또는 부모님과 연락하여 상황 확인 부탁드립니다.',
    '',
    '대시보드: https://tommyseok.github.io/nsdhs-2026-h1/dashboard.html?key=' + PUBLIC_KEY,
  ].join('\n');
  MailApp.sendEmail({ to: teacherEmail, subject, body });
}

/* ============================================================
 *  트리거 함수
 * ============================================================ */

/** 매주 월요일 7am 다이제스트 */
function weeklyDigest() {
  const to = activeTeacherEmails();
  if (to.length === 0) return;
  const today = new Date();
  const oneWeek = new Date(today.getTime() + 7 * 86400000);
  const twoWeeks = new Date(today.getTime() + 14 * 86400000);

  // 이번 주 일정 (다음 7일)
  const schedule = tableOf(SHEETS.SCHEDULE)
    .filter(r => String(r['활성']).toUpperCase() === 'TRUE')
    .filter(r => {
      const d = new Date(r['날짜']);
      return d >= today && d <= twoWeeks;
    })
    .sort((a, b) => new Date(a['날짜']) - new Date(b['날짜']));

  // 다가오는 생일 (다음 14일)
  const birthdays = upcomingBirthdays(14);

  // 공유 기도제목
  const prayers = tableOf(SHEETS.PRAYERS)
    .filter(r => String(r['공유']).toUpperCase() === 'TRUE')
    .slice(0, 5);

  const lines = [
    '안녕하세요, 내수동 고등부 선생님.',
    '',
    '이번 주 핵심 정보를 정리해 드립니다.',
    '',
    '📅 다가오는 2주 일정',
  ];
  if (schedule.length === 0) lines.push('  · (등록된 일정 없음)');
  schedule.forEach(s => {
    const d = new Date(s['날짜']);
    lines.push('  · ' + Utilities.formatDate(d, 'Asia/Seoul', 'MM/dd (E)') + '  ' + s['제목']);
  });

  lines.push('', '🎂 다가오는 생일 (14일 이내)');
  if (birthdays.length === 0) lines.push('  · (없음)');
  birthdays.forEach(b => lines.push('  · ' + b.date + '  ' + b.name + ' (' + b.cell + ')'));

  lines.push('', '🙏 다함께 기도제목');
  if (prayers.length === 0) lines.push('  · (현재 없음)');
  prayers.forEach(p => lines.push('  · ' + p['학생'] + ' (' + p['셀'] + ')  ' + p['내용'].substring(0, 60) + '...'));

  lines.push('', '──────────────',
    '대시보드 전체 보기:',
    'https://tommyseok.github.io/nsdhs-2026-h1/dashboard.html?key=' + PUBLIC_KEY,
    '',
    '한 주 평안하시길 기도합니다.',
    '— 내수동교회 고등부');

  MailApp.sendEmail({
    to: to.join(','),
    subject: '[📋 주간 다이제스트] ' + Utilities.formatDate(today, 'Asia/Seoul', 'MM/dd'),
    body: lines.join('\n'),
  });
}

/** 매일 7am — 생일 D-1 + 4주 연속 결석 알림 */
function dailyAlerts() {
  // 1) 생일 D-1
  const tomorrow = new Date(Date.now() + 86400000);
  const tomMMDD = Utilities.formatDate(tomorrow, 'Asia/Seoul', 'MM-dd');
  const roster = tableOf(SHEETS.ROSTER);
  const teachers = tableOf(SHEETS.TEACHERS);
  roster.forEach(r => {
    const bd = r['생일'];
    if (!bd) return;
    const bdStr = formatBirthday(bd);
    if (bdStr !== tomMMDD) return;
    const cell = r['반'];
    const teacher = teachers.find(t => t['2학기 담당셀'] && (t['2학기 담당셀'].includes(cell) || cell.includes(t['2학기 담당셀'])));
    if (teacher) sendBirthdayAlert(r['이름'], bdStr, cell, teacher['이메일']);
  });
  // 2) 4주 연속 결석 알림은 출석 시트 구현 이후 활성화
}

function formatBirthday(bd) {
  if (!bd) return '';
  if (bd instanceof Date) return Utilities.formatDate(bd, 'Asia/Seoul', 'MM-dd');
  const s = String(bd);
  const m = s.match(/(\d{1,2})[-./월\s]+(\d{1,2})/);
  if (m) return String(m[1]).padStart(2,'0') + '-' + String(m[2]).padStart(2,'0');
  return '';
}

function upcomingBirthdays(days) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const roster = tableOf(SHEETS.ROSTER);
  const results = [];
  roster.forEach(r => {
    const bd = formatBirthday(r['생일']);
    if (!bd) return;
    const [m, d] = bd.split('-').map(Number);
    let thisYr = new Date(today.getFullYear(), m-1, d);
    if (thisYr < today) thisYr.setFullYear(today.getFullYear() + 1);
    const diff = Math.round((thisYr - today) / 86400000);
    if (diff <= days) results.push({name: r['이름'], cell: r['반'], date: bd, diff});
  });
  return results.sort((a, b) => a.diff - b.diff);
}

/* ============================================================
 *  최초 1회 셋업 — 트리거 등록
 * ============================================================ */
function setupTriggers() {
  // 기존 트리거 모두 삭제
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // 매주 월요일 7am — 다이제스트
  ScriptApp.newTrigger('weeklyDigest')
    .timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(7)
    .inTimezone('Asia/Seoul').create();

  // 매일 7am — 알림
  ScriptApp.newTrigger('dailyAlerts')
    .timeBased().everyDays(1).atHour(7)
    .inTimezone('Asia/Seoul').create();

  return 'OK: 2 triggers installed';
}

/* ============================================================
 *  테스트 함수 (수동 실행용)
 * ============================================================ */
function testWeeklyDigest() { weeklyDigest(); }
function testDailyAlerts()  { dailyAlerts(); }
function testGet()          { Logger.log(doGet({parameter:{key:PUBLIC_KEY, action:'dashboard'}}).getContent()); }
