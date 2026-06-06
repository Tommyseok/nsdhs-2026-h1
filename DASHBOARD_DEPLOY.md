# 교사 대시보드 — 배포 가이드

이 문서는 Apps Script 백엔드를 배포하고 dashboard.html을 실데이터로 연결하는 절차입니다.

## 0. 사전 준비 (사용자 작업)

### 0-1. 선생님 이메일 채우기 (필수)

[교적부 시트 → 선생님 탭](https://docs.google.com/spreadsheets/d/1N_ORB4RTRSmoxY8ueJUozLEu2DUE5v3g_HeFJZOtmKg/edit?gid=1582382043)

**A열 "이메일"** 에 각 선생님의 지메일 주소를 입력해 주세요.

- 이메일이 없으면 그 선생님은 알림을 못 받습니다 (다른 기능은 정상)
- 화이트리스트는 향후 OAuth 전환 시 활용됩니다

---

## 1. Apps Script 백엔드 배포 (10분)

### Step 1. 새 Apps Script 프로젝트 만들기

1. https://script.google.com 접속
2. "새 프로젝트" 클릭
3. 프로젝트 이름: `nsdhs-dashboard-backend`
4. 좌측 `코드.gs` 파일 내용 **전체 삭제**

### Step 2. 코드 붙여넣기

1. 이 폴더의 `dashboard_backend.gs` 파일 열기
2. **전체 복사 → 붙여넣기**
3. Ctrl+S (저장)

### Step 3. 권한 부여 (최초 1회)

1. 함수 선택 드롭다운에서 `setupTriggers` 선택
2. ▶ 실행 클릭
3. "권한 검토" 클릭 → 본인 구글 계정 선택
4. **"Google이 확인하지 않은 앱"** 화면 나오면:
   - 좌하단 "고급" 클릭
   - "nsdhs-dashboard-backend (안전하지 않음)으로 이동" 클릭
5. 권한 허용 (Sheets·Mail·Trigger 권한)
6. 실행 로그에 `OK: 2 triggers installed` 나오면 성공

### Step 4. Web App 배포

1. 우측 상단 **배포 → 새 배포**
2. 톱니바퀴 아이콘 → "**웹 앱**" 선택
3. 설정:
   - **설명**: 대시보드 백엔드 v1
   - **다음으로 실행**: 나
   - **액세스 권한**: **모든 사용자** (익명 포함)
4. 배포 → 다시 권한 허용 (Step 3와 동일)
5. **배포된 URL 복사** (`https://script.google.com/macros/s/AKfycb.../exec`)

### Step 5. dashboard.html 에 URL 등록

복사한 URL을 `dashboard.html` 최상단 상수에 입력:

```js
const BACKEND_URL = '여기에 복사한 URL';
```

이건 제가 다음 단계에서 처리합니다. URL만 알려주세요.

---

## 2. 트리거 동작 확인

배포 후 다음을 한번 수동 실행해 확인:

1. Apps Script 에디터에서 `testWeeklyDigest` 함수 선택 → 실행
2. 본인 지메일로 "주간 다이제스트" 메일이 오는지 확인
3. 실패하면 Apps Script 로그(왼쪽 메뉴 "실행")에서 오류 메시지 확인

---

## 3. 시트 구조 안내

### 선생님 (gid=1582382043)
| 컬럼 | 설명 |
|---|---|
| A 이메일 | 지메일 주소 |
| B 이름 | 자동 |
| C 2학기 담당셀 | 셀X 형식 |
| D 역할 | 담임 · 부담임 등 |
| E 직책 | 국장단·목사·총무 등 |
| F 관리자 | TRUE/FALSE — 관리자만 공지 작성 가능 |
| G 활성 | TRUE/FALSE — FALSE 면 알림 안 받음 |
| H 비고 | 자유 |

### 일정 (gid=1630792367)
| 컬럼 | 설명 |
|---|---|
| A 날짜 | YYYY-MM-DD |
| B 제목 | |
| C 종류 | 예배·행사·수련회·마감 |
| D 설명 | |
| E 장소 | |
| F 활성 | TRUE 만 화면에 표시 |

→ **관리자가 직접 row 추가**해서 운영. 추후 admin.html 에서도 추가 가능.

### 기도제목 (gid=187658934)
| 컬럼 | 설명 |
|---|---|
| A ID | P + 타임스탬프 자동 |
| B 등록일 | |
| C 학생 | |
| D 셀 | |
| E 작성자 | |
| F 내용 | |
| G 공유 | TRUE → 다함께 기도 (전체 알림) |
| H 만료일 | 이 날짜 이후 화면에서 안 보임 |
| I 긴급 | TRUE → 빨강 박스 |

### 공지 (gid=2052266423)
| 컬럼 | 설명 |
|---|---|
| A ID | N + 타임스탬프 자동 |
| B 등록일 | |
| C 작성자 | |
| D 제목 | |
| E 내용 | |
| F 이메일발송 | TRUE → 등록 시 전체 발송 |
| G 활성 | TRUE 만 대시보드 표시 |

---

## 4. 이메일 알림 동작

### 자동 (트리거)
- **매주 월요일 7am**: 주간 다이제스트
- **매일 7am**: 생일 D-1 알림 (담임에게)
- 4주 연속 결석 알림은 출석 시트 구현 후 (Phase 3+)

### 즉시 발송
- 공지 등록 + `이메일발송=TRUE` → 전체 활성 선생님
- 기도제목 `공유=TRUE` 등록 또는 토글 → 전체 활성 선생님

### 발송 제한
Apps Script MailApp 일일 무료 한도: **100통/일**
- 28명 × 2~3통 = 일 60통 정도 → 무료 한도 내
- 초과 시 Google Workspace 계정으로 업그레이드 (1500통/일)

---

## 5. 향후 업그레이드 경로

이 백엔드는 다음을 염두에 두고 구조화되어 있습니다:

| 기능 | 활성화 방법 |
|---|---|
| Google OAuth | `checkKey` → `verifyIdToken` 로 교체 |
| PWA | dashboard.html에 manifest.json + service-worker.js 추가 |
| Web Push | `subscribeForPush` 엔드포인트 추가 + FCM 연동 |
| 출석 입력 UI | `markAttendance` 함수 채우기 + attendance.html |
| 카카오 알림톡 | 알림톡 발송 함수 추가 (비즈 채널 인증 후) |

---

## 6. 문의 / 트러블슈팅

- "권한 없음" 에러: URL 키 확인 (`?key=nsdhs2026t`)
- 이메일 안 옴: 선생님 시트의 `이메일` 컬럼 비어있지 않은지 확인
- 트리거 안 돔: Apps Script → 트리거 메뉴에서 등록 여부 확인
