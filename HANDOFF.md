# 내수동 고등부 2학기 시스템 — 세션 핸드오프 문서

> **새 Claude 세션에서 이 프로젝트를 이어 작업할 때 가장 먼저 읽을 통합 컨텍스트 문서**
> 마지막 업데이트: 2026-06-06

---

## 🚀 새 세션 시작 시 가장 먼저 해야 할 일

1. **이 문서 (HANDOFF.md) 전체 읽기**
2. 현재 git log 확인:
   ```bash
   cd "C:\Users\MADUP\Desktop\Claude_Projects\Personal_2\Runners\publish" && git log --oneline -20
   ```
3. dashboard.html, attendance.html, prayer.html 등 최근 수정 파일 훑어보기
4. 사용자에게 "이전 작업 이어서 어떤 것을 진행할까요?" 물어봄

---

## 🎯 프로젝트 개요

- **목적**: 내수동교회 고등부 2026년 2학기 (6월~8월) 교사·관리자 운영 시스템
- **기능**: 셀편성 조회 / 출석 입력·통합 / 학생상황·기도제목 / 공지·일정 / 대시보드
- **사용자**: 28명 선생님 (담임 12 + 부담임 8 + 관리자 7명 + 예비 5명)
- **학생**: 86명 (12 소그룹반 + 6 Special)
- **아키텍처**: 완전 정적 사이트, 백엔드 없음, GitHub Pages 호스팅

---

## 📍 핵심 URL · 경로

| 항목 | 값 |
|---|---|
| GitHub repo | https://github.com/Tommyseok/nsdhs-2026-h1 |
| GitHub Pages | https://tommyseok.github.io/nsdhs-2026-h1/ |
| 로컬 작업 폴더 | `C:\Users\MADUP\Desktop\Claude_Projects\Personal_2\Runners\publish\` |
| **현재 PIN 코드** | `nsdhs2026h2` (2026년 2학기. 학기마다 변경: h2→h3→h4→내년 h1) |
| Drive (사용자 개인) | https://drive.google.com (shinycoral@gmail.com) |
| 교적부 시트 (학생 상세) | https://docs.google.com/spreadsheets/d/1N_ORB4RTRSmoxY8ueJUozLEu2DUE5v3g_HeFJZOtmKg |
| **Supabase 프로젝트** (학생 사진) | `hycwzggbgnimuuhporwf` (jwseokCEOSTAFF's Project, ap-southeast-1) |
| Supabase URL | `https://hycwzggbgnimuuhporwf.supabase.co` |
| Storage 버킷 | `student-photos` (public read, 2MB, jpeg/png/webp) |
| anon 키 | publishable 키. 코드에 내장(공개 정상). 각 HTML `Photos` 헬퍼 안 |

---

## 🗺 페이지 맵

| URL | 인증 | 용도 |
|---|---|---|
| `dashboard.html` | PIN + 본인 선택 | 🏠 **교사 메인 화면** (진입점) |
| `attendance.html` | PIN + 본인 선택 | 📋 출석 입력 (본인 + 같은 대가족 셀) |
| `attendance-overview.html` | PIN | 📊 **전체 출석 현황** (모든 선생님 접근) |
| `prayer.html` | PIN + 본인 선택 | 🙏 학생상황+기도제목 (3개 탭) |
| `photos.html` | PIN + 본인 선택 | 📸 **학생 사진 업로드 전용** (선생님=본인 셀, 관리자=전체). 업로드는 여기서만 |
| `teachers.html` | URL `?key=` | 📋 학생 상세·연락처·교적부·옷사이즈 |

모든 교사 페이지 상단에 **공통 네비게이션 바**(site-nav) 자동 주입 → 대시보드·출석입력·출석현황·셀편성·관계도·기도·사진등록 상호 이동. (공개용 `assignments.html` 은 제외)
| `index.html` | URL `?key=` | 🕸 관계도 (1·2학기 토글) |
| `assignments.html` | 공개 | 🌱 공개용 편성표 (학생·학부모) |
| `assignments.pdf` | 공개 | 공개용 PDF (인쇄용) |

기존 페이지 (현재 비공개 처리):
- `index.html` — 이전엔 공개였으나 PIN 추가
- `cells.html` — tombstone 페이지 (부담임 지원 폐지)

---

## 📊 데이터 저장 위치

### 1. GitHub JSON 파일 (전체 공유)
`publish/data/` 폴더:
- `schedule.json` — 일정 (6/7~8/2, items 배열)
- `notices.json` — 공지
- `prayers.json` — 전체 공유 학생상황+기도제목

→ 관리자가 GitHub web UI에서 직접 편집 + commit
→ dashboard.html 등이 fetch
→ 1~2분 후 모든 선생님 화면 반영

### 2. localStorage (브라우저별, 본인만 보임)
- `mock_teacher` — 본인 선생님 이름
- `access_pin` — 통과한 PIN
- `attendance_data` — 출석 입력 데이터
- `prayer_data` — 본인이 등록한 학생상황+기도제목

→ 같은 사람이 같은 브라우저에서만 보임
→ 다른 선생님과 공유는 prayer.html 의 "📤 GitHub 공유" 버튼 → JSON 출력 → 관리자 commit

### 3. Supabase Storage (학생 사진, 전체 공유)
- 버킷 `student-photos`, 파일 키 = **`{학생이름 UTF-8 hex}.jpg`** (Storage 키가 한글 불가 → hex 인코딩)
- **업로드는 `photos.html` 전용 페이지에서만.** 학생 카드 카메라 배지(📷) 클릭 → 파일 선택 → 브라우저에서 정사각 크롭+압축(가로 400px, JPEG) → 즉시 저장
- **권한** (UI 레벨·신뢰 기반): photos.html 에서 일반 선생님 = 본인 셀, 관리자 = 전체 학생
- **표시**: dashboard / attendance / attendance-overview / prayer / teachers 의 이름 옆에 원형 아바타. 없으면 성별 디폴트 SVG. **아바타 클릭 시 라이트박스로 크게 보기**(`#photo-lb`). 공개용 assignments.html·관계도 index.html 노드에는 사진 미표시(개인정보)
- 각 페이지 상단 `Photos` 헬퍼: 표시 페이지는 표시+라이트박스(`avatarImg`/`load`/`refresh`/`enableLightbox`), `photos.html` 만 업로드(`compress`/`upload`) 담당. SDK 없이 `fetch` REST
- 로드 시 Storage `list` 1회 → `_vers` 맵 → 아바타 src 세팅(캐시버스팅 `?v=updated_at`)
- Storage 정책: anon SELECT/INSERT/UPDATE 허용, **DELETE 미허용**
- 사진 교체: 같은 학생에 다시 업로드(upsert). 삭제: 임시 delete 정책 추가 → REST DELETE → 정책 제거 (또는 Supabase 대시보드)

### 4. 코드에 하드코딩 (정적 데이터)
- `TEACHERS` — 선생님 정보 (이름·셀·역할·admin)
- `CELL_STUDENTS` — 12셀 + 6 Special 학생
- `CELL_TEACHERS` — 셀별 담임/부담임
- `CELL_FAMILY` — 셀 → 대가족 매핑
- `BIRTHDAYS` — 학생 생일
- `CONTACT` (teachers.html) — 학교·연락처·주소·부모님·옷사이즈·가족
- `STUDENT_NOTES` (teachers.html) — 학생 케어 메모
- `PREV_INFO` (teachers.html) — 1학기 담임
- `HISTORICAL_ATTENDANCE` — 1학기 출석 데이터 (1/11~5/31, 21주, 84명)

학생 정보 변경 시: 위 데이터 객체들을 코드에서 직접 수정 + git push

---

## 🔑 인증·권한 체계

### PIN 게이트
- 모든 페이지 공통: `nsdhs2026h2`
- localStorage에 저장 → 학기 동안 자동 로그인
- PIN 변경 시 자동 logout 효과 (다음 접속 시 새 PIN 입력 요구)

### 본인 선택 (Mock 로그인)
- PIN 통과 후 28명 드롭다운에서 본인 선택
- localStorage `mock_teacher`에 저장
- 본인 정보로 화면 개인화 (자기 반, 자기 대가족)

### 관리자 권한 (admin: true)
**관리자 7명** — 학생별 모아보기 등 일부 전체 접근 가능:
1. 오신영 (담당 목사)
2. 안종범 (부장집사)
3. 석준원 (총무 + 셀11 담임)
4. 김광현 (교육국장)
5. 송진우 (예배국장 + 셀7 부담임)
6. 오덕현 (미디어국장 + 셀9 담임)
7. 이유성 (홍보국장 + 셀8 담임)

---

## 👨‍👩‍👧 대가족 매핑

| 대가족 | 셀 | 대가족장 |
|---|---|---|
| 1 | 셀1 · 셀2 · Sp1 | 이윤정 (셀1 담임) |
| 2 | 셀3 · 셀4 · Sp2 | 전성희 (셀3 담임) |
| 3 | 셀5 · 셀6 · Sp3 | 이수지 (셀5 담임) |
| 4 | 셀7 · 셀8 · Sp4 | 양지현 (셀7 담임) |
| 5 | 셀9 · 셀10 · Sp5 | 오덕현 (셀9 담임) |
| 6 | 셀11 · 셀12 · Sp6 | 석준원 (셀11 담임) |

홀수 셀 담임 = 대가족장 (★ 표시)

---

## 🔄 사용자 의사결정 (확정된 것)

| 결정 | 내용 |
|---|---|
| ❌ OAuth Google 로그인 | 거부 → PIN 인증으로 일원화 |
| ❌ Apps Script 백엔드 | 보류 → 정적 사이트 운영 |
| ❌ 구글시트 데이터 운영 | 보류 → GitHub JSON 파일로 |
| ❌ 이메일 알림 | 보류 → 화면 알림만 |
| ❌ PWA 변환 | 이번 학기 보류 (추후 가능하게 구조만 유지) |
| ❌ 카카오 알림톡 | 보류 |
| ✅ 학기별 PIN 변경 | h2 → h3 → h4 → 내년 h1 |
| ✅ 라벨 변경 | "기도제목" → "학생상황+기도제목" |
| ✅ 학생별 모아보기 권한 | 관리자만 전체, 일반은 본인 대가족 |
| ✅ 같은 대가족 출석 입력 | 같은 대가족 선생님 사이 가능 |

---

## 🎯 운영 워크플로

### 공지·일정·기도제목 추가 (관리자)
1. GitHub repo → `publish/data/{notices,schedule,prayers}.json` 편집
2. `items` 배열 맨 위에 새 객체 추가
3. **Commit changes...** 클릭 2번
4. 1~2분 후 모든 대시보드에 자동 반영

→ 자세한 가이드: `publish/ADMIN_GUIDE.md`

### PIN 변경 (학기마다)
사용자가 "PIN을 h3으로 바꿔줘" 같은 요청 시:
```bash
# 모든 페이지에서 일괄 치환
cd "C:\Users\MADUP\Desktop\Claude_Projects\Personal_2\Runners\publish"
# nsdhs2026h2 → nsdhs2026h3 등
```
파일 목록:
- `dashboard.html`, `attendance.html`, `attendance-overview.html`
- `prayer.html`, `teachers.html`, `index.html`
- `dashboard_backend.gs`, `DASHBOARD_DEPLOY.md`

### 학생 정보 변경
학생 셀 이동 / 추가 / 정보 수정 시 수정해야 할 파일:
- `assignments.html` — FAMILY_GROUPS
- `teachers.html` — FAMILY_GROUPS, CONTACT, STUDENT_NOTES, PREV_INFO
- `dashboard.html` — CELL_STUDENTS, BIRTHDAYS
- `attendance.html` — CELL_STUDENTS, STUDENT_INFO
- `attendance-overview.html` — CELL_STUDENTS
- `prayer.html` — CELL_STUDENTS, **STUDENT_GENDER** (디폴트 아바타용 성별 맵)
- `attendance-overview.html` — CELL_STUDENTS (이름 옆 아바타)
- `photos.html` — TEACHERS, CELL_TEACHERS, CELL_STUDENTS (업로드 그리드)
- `index.html` — students 배열
- `make_assignment_pdf.py` — CELL_STUDENTS (PDF 재생성 필요)

→ 변경 후 PDF 재생성:
```bash
python make_assignment_pdf.py
```

### 출석 historical 데이터 갱신 (학기 말)
21주 시리즈 → 다음 학기엔 새 데이터로 갱신 필요. 1학기 데이터는 그대로 보존하고 2학기 데이터를 historical로 옮김.

---

## 📋 최근 작업 이력 (역순, 최신이 먼저)

0. **학생 사진 + 페이지 네비 통합** — ① 업로드 전용 `photos.html` (선생님=본인 셀, 관리자=전체). ② dashboard/attendance/attendance-overview/prayer/teachers 이름 옆 아바타 + **클릭 시 라이트박스 확대**. ③ 모든 교사 페이지 상단 공통 네비 바(셀편성·출석현황 등 상호 연결, teachers의 "출석현황 준비중" → 실제 연결). 공개 assignments·관계도 노드엔 사진 미표시. 키=이름 UTF-8 hex
  - (이력: 전용 페이지 → 대시보드 인라인 → 다시 전용 photos.html + 네비/라이트박스 로 정착)
1. **학생별 모아보기 권한 제한** — 관리자만 전체, 일반은 본인 대가족만
2. **일정·생일 더보기 + 대가족 셀 토글** — dashboard 상위 3개 + 펼치기 / 같은 대가족 셀 토글로 출석 입력
3. **prayer.html 대폭 개편** — 탭 4개→3개 (학생별 모아보기 추가, 다함께 공유·시계열 삭제), 라벨 "학생상황+기도제목"
4. **attendance-overview.html 신규** — 전체 선생님이 모든 셀 출석 한눈에
5. **prayer.html 확장** — 선생님 개인 기도제목·대가족 공유·시계열 기반
6. **GitHub JSON 데이터 전환** — 구글시트 X, data/*.json 사용
7. **1학기 historical 21주 통합** — 1/11~5/31 출석 데이터
8. **누적 출석률 분모 통일** — 빈 칸도 결석으로 처리, 모든 학생 21주 기준
9. **PIN 학기별 변경 체계** — nsdhs2026t → nsdhs2026h2 (학기별)
10. **dashboard.html 프로토타입** — 4개 핵심 박스 + 내 반 미니뷰
11. **attendance.html 신규** — 주차별 출석 입력
12. **teachers.html 확장** — 연락처·옷사이즈·가족관계 + 공유용 탭
13. **index.html (관계도)** — 1·2학기 토글 + 가족장 표기
14. **assignments.html / pdf** — 공개용 편성표 (학생·학부모용)

---

## 🚧 알려진 제약사항·이슈

1. **localStorage 격리** — 데이터 본인 브라우저만, 공유는 GitHub commit 통해서
2. **백엔드 없음** — 실시간 동기화·이메일 발송 X (사용자 결정)
3. **OAuth 자동화 어려움** — Apps Script 권한 부여 시 Chrome popup이 별도 window로 떠서 browser-harness 잡기 어려움
4. **시트 fetch 사용 안 함** — 한때 시도했으나 사용자가 GitHub JSON 방식 선호
5. **PWA·푸시 보류** — 코드 구조는 유지하되 활성화 X

---

## 🛠 기술 스택

- **Frontend**: HTML + 바닐라 CSS + 바닐라 JS (프레임워크 없음)
- **저장소**: localStorage + GitHub JSON 파일 + **Supabase Storage (학생 사진)**
- **호스팅**: GitHub Pages (정적)
- **PDF 생성**: Python reportlab (`make_assignment_pdf.py`)
- **데이터 변환**: Python (`_make_historical.py` 등 임시 스크립트)
- **MCP 도구**: google-sheets (시트 조회), google-drive (파일 메타), 기타
- **browser-harness**: 브라우저 자동화 (Apps Script 셋업 시도 등)

---

## 📂 publish/ 파일 목록

```
publish/
├── HANDOFF.md (이 파일)
├── ADMIN_GUIDE.md (관리자 운영 가이드)
├── DASHBOARD_DEPLOY.md (이전 Apps Script 가이드, 현재 사용 X)
├── README.md
├── .nojekyll
├── robots.txt
├── data/
│   ├── schedule.json
│   ├── notices.json
│   └── prayers.json
├── dashboard.html ⭐ 메인
├── attendance.html
├── attendance-overview.html
├── prayer.html
├── photos.html (학생 사진 업로드 전용 — Supabase Storage)
├── teachers.html
├── index.html (관계도)
├── assignments.html (공개용)
├── assignments.pdf (공개용 PDF)
├── cells.html (tombstone)
├── make_assignment_pdf.py (PDF 생성기)
├── dashboard_backend.gs (Apps Script — 사용 안 함, 보관용)
└── apps_script_backend.gs (구 부담임 지원, 사용 안 함)
```

---

## 🔍 디버깅 시 자주 보는 곳

- 학생 출석률이 이상함 → `cumulativeAttRate`, `cumulativeRate` 함수
- 학생 데이터 안 보임 → `CELL_STUDENTS` 객체 + 셀 키 매핑
- 권한 우회 → `MY.admin`, `canViewStudent` 함수
- PIN 안 통과 → `localStorage.getItem('access_pin')` + `PRIVATE_KEY` 비교
- 시간 관련 → 클라이언트 브라우저 시간 (서버 시간 X)

---

## ✉️ 사용자 정보

- **이메일**: shinycoral@gmail.com
- **GitHub**: Tommyseok
- **역할**: 내수동 고등부 교사 + 셀11 담임 + 총무 (관리자)
- **소속**: jwsuk@madup.com (회사 계정, MCP가 이 계정으로 OAuth됨)
- **언어**: 한국어
- **선호**: 결과물 중심, 자율적 문제 해결, 시각적 검증
