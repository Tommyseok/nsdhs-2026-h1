/**
 * 내수동 고등부 2026 2학기 셀편성 — 지원 백엔드
 *
 * 배포 방법:
 * 1. https://script.google.com 접속 → "새 프로젝트"
 * 2. 이 파일 내용 전체를 붙여넣기 → 저장 (Ctrl+S)
 * 3. 좌측 톱니바퀴 → "Apps Script API 사용" 활성화 (필요 시)
 * 4. 우측 상단 "배포" → "새 배포"
 *    - 유형: 웹 앱
 *    - 설명: 셀편성 신청 백엔드 v1
 *    - 실행: 나(본인 이메일)
 *    - 액세스 권한: 모든 사용자 (익명 포함)
 * 5. 배포 → 권한 검토 → 본인 구글 계정 선택 → "고급" → "신뢰할 수 없는 앱" 진행
 * 6. 발급된 "웹 앱 URL" 복사 (https://script.google.com/macros/s/.../exec)
 * 7. cells.html 최상단 APPS_SCRIPT_URL 상수에 붙여넣기 → git push
 *
 * 재배포 (코드 수정 후):
 * - 배포 → "배포 관리" → 연필 아이콘 → 버전 "새 버전" → 배포
 * - URL은 동일하게 유지됨
 */

const SHEET_ID = '1N_ORB4RTRSmoxY8ueJUozLEu2DUE5v3g_HeFJZOtmKg';
const SHEET_NAME = '신청내역';
const ADMIN_KEY = 'nsdhs2026';

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['timestamp', 'groupTitle', 'cellId', 'cellName', 'applicantName']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * GET: 셀별 지원 카운트 (관리자 키 있으면 이름 명단도)
 * 예: /exec  → 카운트만
 *     /exec?key=nsdhs2026  → 카운트 + 이름 + sheet row 번호
 */
function doGet(e) {
  try {
    const sheet = getSheet();
    const values = sheet.getDataRange().getValues();
    const isAdmin = e && e.parameter && e.parameter.key === ADMIN_KEY;

    const cells = {};
    for (let i = 1; i < values.length; i++) {
      const [ts, groupTitle, cellId, cellName, applicantName] = values[i];
      const cid = String(cellId);
      const rowIndex = i + 1; // 1-indexed sheet row

      if (!cells[cid]) {
        cells[cid] = { count: 0, names: [], cellName: String(cellName || '') };
      }
      cells[cid].count++;
      if (isAdmin) {
        cells[cid].names.push({
          row: rowIndex,
          name: String(applicantName || ''),
          ts: ts ? new Date(ts).toISOString() : null
        });
      }
    }

    return jsonResponse({
      ok: true,
      isAdmin: isAdmin,
      cells: cells,
      total: values.length - 1,
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

/**
 * POST: 지원 추가 / 삭제 (관리자만)
 * Content-Type: text/plain (CORS preflight 회피)
 * Body: JSON.stringify({ action, ... })
 */
function doPost(e) {
  try {
    const sheet = getSheet();
    const body = JSON.parse(e.postData.contents);

    if (body.action === 'add') {
      if (!body.cellId || !body.applicantName) {
        return jsonResponse({ ok: false, error: 'cellId와 applicantName 필요' });
      }
      const name = String(body.applicantName).trim();
      if (!name) return jsonResponse({ ok: false, error: '이름이 비었습니다' });
      if (name.length > 30) return jsonResponse({ ok: false, error: '이름이 너무 깁니다' });

      sheet.appendRow([
        new Date(),
        String(body.groupTitle || ''),
        String(body.cellId),
        String(body.cellName || ''),
        name
      ]);
      return jsonResponse({ ok: true });
    }

    if (body.action === 'delete') {
      if (body.key !== ADMIN_KEY) {
        return jsonResponse({ ok: false, error: '관리자 권한 없음' });
      }
      const row = parseInt(body.row, 10);
      if (!row || row < 2) {
        return jsonResponse({ ok: false, error: 'row 번호 잘못됨' });
      }
      const lastRow = sheet.getLastRow();
      if (row > lastRow) {
        return jsonResponse({ ok: false, error: '존재하지 않는 row' });
      }
      sheet.deleteRow(row);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: 'Unknown action: ' + body.action });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

/**
 * 테스트용: 스크립트 에디터에서 직접 실행해서 동작 확인
 */
function testGet() {
  const r = doGet({ parameter: { key: ADMIN_KEY } });
  Logger.log(r.getContent());
}

function testAdd() {
  const r = doPost({
    postData: {
      contents: JSON.stringify({
        action: 'add',
        groupTitle: '그룹 1',
        cellId: '셀1',
        cellName: '셀 1',
        applicantName: '테스트선생님'
      })
    }
  });
  Logger.log(r.getContent());
}
