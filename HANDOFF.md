# 내수동 고등부 4학기 시스템 — 세션 핸드오프 문서

> **새 Claude 세션에서 이 프로젝트를 이어 작업할 때 가장 먼저 읽을 통합 컨텍스트 문서**
> 마지막 업데이트: 2026-09-01 (**4학기 새 반편성 배포** — 셀1~12+Sp1~6(3학기) 폐지 → 1반~6반+고3-1~4(10반) 전환, 전 시스템 반영 + 회의록 수정/이력 + nav B안 + 공지·기도 관리 + 라인업 단계별 확정)
> 상세 기획·설계(국장단 포털): project/active/council-portal/ · 4학기 배포 상세: project/active/lineup-deploy/ (context·tasks 2파일)

---

## 🚀 새 세션 시작 시 가장 먼저 해야 할 일

1. **이 문서 (HANDOFF.md) 전체 읽기**
2. 현재 git log 확인:
   ```bash
   cd "C:\Users\MADUP\Desktop\Claude_Projects\Personal_2\Runners\publish" && git log --oneline -20
   ```
3. 주요 파일 훑어보기: dashboard.html(Home) · admin.html(관리자) · photos.html · attendance.html · prayer.html
4. **현재 시스템 한눈에**: 정적 사이트(GitHub Pages) + Supabase(Storage=사진, Postgres=출석/접속/기도/공지/일정 5개 테이블). 브랜딩 "Runners 2026 / 내수동 경주자 2026". 모든 작업은 commit→push 시 1~2분 후 라이브 반영
5. 사용자에게 "이전 작업 이어서 어떤 것을 진행할까요?" 물어봄

---

## 🎯 프로젝트 개요

- **목적**: 내수동교회 고등부 2026년 4학기 (9월~) 교사·관리자 운영 시스템
- **기능**: 셀편성 조회 / 출석 입력·통합 / 학생상황·기도제목 / 공지·일정 / 대시보드 / 국장단 포털 / 라인업 스튜디오
- **사용자**: 24명 선생님(TEACHERS 배열 기준, 이번 학기 16명이 실제 반 배정). 4학기 안식: **조세경·이수지·이승헌·정명경**("(안식)"), 27년 합류 예정: **박진호·송가원**("(27년 섬김)", 기존 "신규 교사" 라벨에서 변경) — 둘 다 role 필드 + `ROLE_TAGS`/`roleTag()`(council.html·menu.html·admin.html, 이름 단독 표시되는 참석자·모임명단·미접속목록에 사용)로 반영. dashboard/photos/outings/prayer/admin/council/menu.html 총 7개 파일의 TEACHERS 배열 동기화 필요(명단 변경 시)
- **학생**: 85명, **10개 반**(1반~6반 혼합 9명×2교사 + 고3-1~4 7~8명×1교사) · **2026-09-01부터 Sp1~6(장결자 특별반) 폐지, 장결 학생은 일반 반에 흡수 + 🤍 장결 라벨로 표시**(교사 화면만, 공개용 편성표엔 미노출)
- **아키텍처**: 완전 정적 사이트, 백엔드 없음, GitHub Pages 호스팅

---

## 📍 핵심 URL · 경로

| 항목 | 값 |
|---|---|
| GitHub repo | https://github.com/Tommyseok/nsdhs-2026-h1 |
| GitHub Pages | https://tommyseok.github.io/nsdhs-2026-h1/ |
| 로컬 작업 폴더 | `C:\Users\MADUP\Desktop\Claude_Projects\Personal_2\Runners\publish\` |
| **현재 PIN 코드** | `runners2026@jesus` (2026-07-04 전체 강제 로그아웃 겸 교체. 이전: nsdhs2026h2. 변경 시 아래 "PIN 변경" 절차) |
| Drive (사용자 개인) | https://drive.google.com (shinycoral@gmail.com) |
| 교적부 시트 (학생 상세) | https://docs.google.com/spreadsheets/d/1N_ORB4RTRSmoxY8ueJUozLEu2DUE5v3g_HeFJZOtmKg |
| **Supabase 프로젝트** (학생 사진) | `hycwzggbgnimuuhporwf` (jwseokCEOSTAFF's Project, ap-southeast-1) |
| Supabase URL | `https://hycwzggbgnimuuhporwf.supabase.co` |
| Storage 버킷 | `student-photos` (public read, 2MB) · `outing-photos` (아웃팅 사진, public read, 3MB, jpeg/png/webp) |
| anon 키 | 각 HTML의 `Photos`/`Hub`/`PrayerDB`/`OutingDB`/`logAccess` 헬퍼 안에 내장 (publishable anon 키 — 공개 정상). PIN 변경과 무관 |
| Supabase 테이블 | `access_log`, `attendance`, `prayers`, `notices`(+`show_home` 컬럼), `schedule`, `outings`, `council_meetings`(+`updated_at`), `council_meeting_history`(SEL/INS만, UPD/DEL 없음 — 변경불가 이력 로그), `council_notices`(2026-09부터 미사용 — council.html 공지탭은 `notices` 사용), `council_polls`, `council_votes`, `nav_settings`, `lineup_stages`, `menu_sessions`, `menu_items`(session_id+teacher 유니크), `lessons`(주차=일요일 날짜 PK, +Storage 버킷 `lesson-files`), `worship_duty`(주차 PK, prayer_people/offering_people/usher_people jsonb + confirmed) (그 외는 모두 RLS: anon SEL/INS/UPD, DEL 미허용) |

---

## 🗺 페이지 맵

| URL | 인증 | 용도 |
|---|---|---|
| `index.html` | 공개 | 🔀 **루트 → dashboard.html 리다이렉트** (메인 화면 = Home) |
| `dashboard.html` | PIN + 본인 선택 | 🏠 **Home · 교사 메인 화면** (진입점) |
| `attendance.html` | PIN + 본인 선택 | 📝 출석 입력 (본인 + 같은 대가족 셀) |
| `prayer.html` | PIN + 본인 선택 | 🙏 학생상황+기도제목 (3개 탭) |
| `teachers.html` | URL `?key=` | 🗂 셀편성 — 학생 상세·연락처·교적부·옷사이즈 |
| `relations.html` | URL `?key=` | 🕸 관계도 (1·3학기 토글) ※ 이전 파일명 index.html |
| `attendance-overview.html` | PIN | 📊 전체 출석현황 (모든 선생님 접근) |
| `photos.html` | PIN + 본인 선택 | 📸 학생 사진 업로드 전용 (선생님=본인 셀, 관리자=전체) |
| `outings.html` | PIN + 본인 선택 | 🎒 월간 아웃팅 기록 — 셀별 날짜·사진(여러 장)·텍스트. 게시=담임·부담임 본인 셀/관리자 전체, 열람=**전체 공개**(셀 필터) |
| `council.html` | PIN + 본인 선택 | 🏛 국장단 포털 — 회의록(공개범위 국장단전용/전체공개, **수정 가능 + 수정 시 이전 버전이 `council_meeting_history`에 자동 저장·"수정 이력 보기"로 열람**, 목록은 접힘/펼침 토글)·공지(**2026-09 부터 Home과 같은 `notices` 테이블 사용 — 별도 채널 아님**, 수정·삭제·메인노출 토글)·투표(안건별 익명/기명, 마감 전 참여여부만·마감 후 집계공개). 회의록·공지·안건 작성=국장단(admin 7인), 열람·투표참여=전체 교사 |
| `menu.html` | PIN + 본인 선택 | 🍱 메뉴신청 — 모임(식사·음료 주문) 생성·항목 입력/수정/마감 **모두 전체 교사 자유롭게 가능**(권한 제한 없음). **모임 생성 시 만든 사람이 가게 지정**(`STORE_MENUS` 하드코딩: 모던김밥·교남김밥·본김밥·매머드익스프레스, 음료는 Hot/Ice 별도 항목 — 미지정 시 "🙌 자유선택") → 해당 모임 항목 입력 시 그 가게 메뉴가 칩으로 떠서 클릭 한 번으로 채움(자유 텍스트 입력도 항상 가능), 가게는 "✏️ 수정"으로 나중에 변경 가능(`menu_sessions.store` 컬럼). 모임 클릭 시 접힘/펼침, 본인 줄 강조+자동 스크롤, 항목은 칩(뱃지) 형태로 표시하고 클릭해서 수정(빈 줄은 "＋ 입력" 버튼). 마감 시 항목 종류별 집계("📊 취합 결과") 자동 표시, 마감취소로 재오픈 가능. **🔗 카톡 공유** 버튼으로 모임명·진행상태·취합요약+직행 링크(`menu.html?id=...`, 접속 시 해당 모임 자동 펼침 + **본인 줄로 스크롤**)를 Web Share API(미지원 시 클립보드)로 전달. **명단에서 안식·27년섬김 6명은 자동 제외**(`activeTeachers()` — ROLE_TAGS 있는 사람 필터, 명단 18명 기준). 모바일(≤560px)에서 이름·입력칸이 세로로 쌓이는 전용 레이아웃(터치 영역 확대) |
| `lessons.html` | PIN + 본인 선택 | 📖 공과공부 — 주별 공과 제목·상세 내용·첨부파일. Home(dashboard.html)에는 **이번 주 것만** 미리보기 카드로 노출, 이 페이지에서 "📋 전체 공과 목록 보기"를 누르면 전체 17주(9~12월) 목록 확인 가능, 목록 클릭 시 상세로 전환. 상세 내용 입력·수정·파일 첨부는 **관리자만**, 열람은 전체 교사. `lessons` 테이블(주차=일요일 날짜 PK) + Storage 버킷 `lesson-files`(20MB, 공개) |
| `worship-duty.html` | PIN + 본인 선택 | ⛪ 예배위원 — 예배기도·헌금위원·안내위원을 반 순서(1반→2반→…→고3-4→1반 순환, 4학기 시작 9/6=1반 기준 계산, DB 없이 매주 자동 산정)대로 섬김. Home에는 **다음 주**(준비 시간 확보용) 담당 반만 미리보기, 이 페이지에서 그 반 학생 중 **여러 명을 칩(토글)으로 선택**(인원 제한 없음) + 결석 대비 대체 인원(목사님·부장님 안종범·해당 반 선생님)도 선택 가능 → "✅ 완료"를 눌러야 저장·확정되고 이후 "✏️ 수정"으로 다시 열림. "📋 전체 일정 보기"로 지난 순서·이후 순서 모두 조회 가능. 작성=전체 교사 자유, `worship_duty` 테이블(주차 PK, prayer_people/offering_people/usher_people jsonb 배열 + confirmed) |
| `admin.html` | PIN + 관리자 본인 선택 | 👑 **관리자 페이지** — 접속(지난 7일)·출석누락·사진 현황 + **공지·일정·전체공유 기도 등록/수정/삭제/메인노출 토글** + **🧭 상단 메뉴 on/off 관리**(nav_settings). admin 7명만 |
| `assignments.html` | 공개 | 🌱 공개용 편성표 (학생·학부모) — **전체 라인업(4 대가족·10반) 한눈에 보기**. 교사도 이 페이지로 전체 편성 확인(더보기▾ 자료 그룹 "🌱 공개용 편성표" 링크) |
| `assignments.pdf` | 공개 | 공개용 PDF (인쇄용) |

모든 교사 페이지 상단에 **공통 네비 바**(site-nav, 각 페이지 `</body>` 직전 스크립트가 `<header>` 뒤에 주입) 자동 표시.
**2026-09-01 B안으로 리뉴얼**: PRIMARY 4개(`🏠 Home · 📝 출석입력 · 🙏 학생상황·기도 · 👤 학생 정보`)는 항상 노출 + 오른쪽 `더보기 ▾` 버튼을 누르면 GROUPS 패널이 펼쳐짐 — `운영`(🏛 국장단 포털 · 🍱 메뉴신청 · 🧩 라인업 스튜디오 · 🗳 새학기 편성) / `자료`(📖 공과공부 · ⛪ 예배위원 · 🗂 셀편성 · 🕸 관계도 · 📊 전체출석현황 · 📸 사진등록 · 🎒 아웃팅). 현재 페이지가 GROUPS 안에 있으면 더보기 버튼 라벨이 `📍 <페이지명>`으로 바뀜. 공개용 `assignments.html` 은 제외. **네비 항목 추가/변경 시 16개 페이지(dashboard·attendance·attendance-overview·prayer·teachers·relations·photos·admin·students·outings·term3·term3-results·council·menu·lessons·worship-duty)의 PRIMARY/GROUPS 배열을 모두 수정** (각 페이지에 복제됨 — `nav.querySelector`로 버튼에 리스너를 붙이므로 `document.getElementById`로 바꾸면 안 됨, nav가 아직 DOM에 붙기 전이라 못 찾음). Home(dashboard.html) 제외한 항목은 `nav_settings` 테이블(key=파일명, enabled)로 on/off 가능 — 각 페이지 nav 스크립트가 렌더 후 `enabled=eq.false`인 항목을 비동기로 숨김. admin.html "🧭 상단 메뉴 관리"에서 토글.

기존 페이지:
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
- `attendance_data` — 출석 입력 (로컬 캐시 / 오프라인 fallback. **공유 원본은 Supabase attendance 테이블** — 아래 #3.5)
- `prayer_data` — 본인이 등록한 학생상황+기도제목
- `lastlog_*` — 접속 로그 쓰로틀 타임스탬프(페이지별)

→ 같은 사람이 같은 브라우저에서만 보임 (개인 기록 보관)
→ 출석·기도(전체 공유)는 저장/토글 시 자동으로 Supabase 공유됨(#3.5). prayer_data는 본인 화면용 로컬 보관

### 3. Supabase Storage (학생 사진, 전체 공유)
- 버킷 `student-photos`, 파일 키 = **`{학생이름 UTF-8 hex}.jpg`** (Storage 키가 한글 불가 → hex 인코딩)
- **업로드는 `photos.html` 전용 페이지에서만.** 학생 카드 카메라 배지(📷) 클릭 → 파일 선택 → 브라우저에서 정사각 크롭+압축(가로 400px, JPEG) → 즉시 저장
- **권한** (UI 레벨·신뢰 기반): photos.html 에서 일반 선생님 = 본인 셀, 관리자 = 전체 학생
- **표시**: dashboard / attendance / attendance-overview / prayer / teachers 의 이름 옆에 원형 아바타. 없으면 성별 디폴트 SVG. **아바타 클릭 시 라이트박스로 크게 보기**(`#photo-lb`). 공개용 assignments.html·관계도 relations.html 노드에는 사진 미표시(개인정보)
- 각 페이지 상단 `Photos` 헬퍼: 표시 페이지는 표시+라이트박스(`avatarImg`/`load`/`refresh`/`enableLightbox`), `photos.html` 만 업로드(`compress`/`upload`) 담당. SDK 없이 `fetch` REST
- 로드 시 Storage `list` 1회 → `_vers` 맵 → 아바타 src 세팅(캐시버스팅 `?v=updated_at`)
- Storage 정책: anon SELECT/INSERT/UPDATE 허용, **DELETE 미허용**
- 사진 교체: 같은 학생에 다시 업로드(upsert). 삭제: 임시 delete 정책 추가 → REST DELETE → 정책 제거 (또는 Supabase 대시보드)

### 3.5 Supabase Postgres (접속·출석, 전체 공유) — PostgREST `fetch`
각 페이지의 `Hub` 헬퍼(또는 prayer/photos의 `logAccess`)가 `{URL}/rest/v1/...` 호출. RLS: anon SELECT/INSERT/UPDATE 허용(신뢰 기반), DELETE 미허용.
- **`access_log`** (id, teacher, page, at) — 로그인/입장 시 1줄 기록(브라우저별 30분 쓰로틀, localStorage `lastlog_*`). admin.html 접속 현황·미접속 명단에 사용
- **`attendance`** (cell, week, student, status, note, teacher, updated_at · PK=week+student) — **출석 공유 원본**. attendance.html 저장 시 내가 수정한 것만 upsert(`merge-duplicates`, DIRTY 추적으로 남의 입력 보호). dashboard/attendance-overview/attendance/admin 가 로드 시 병합(`Hub.loadAttendance`) → 전 선생님 공유
- **`prayers`** (id, date, type, student, cell, family, teacher, text, share, urgent, active) — **기도제목 전체 공유 원본**. prayer.html에서 "전체 공유 ON" 토글 시 자동 upsert(`PrayerDB.upsert`), OFF/삭제 시 share=false/active=false. dashboard "전체 공유 기도제목" 카드·prayer "다같이" 뷰·admin이 `share=true&active=true` 로드. **GitHub JSON 복사·commit 수동 단계는 폐지**(data/prayers.json은 관리자 선택 채널로만 잔존, 둘 다 병합 표시)
- **`notices`** (id, date, author, title, body, urgent, active, **show_home**) / **`schedule`** (id, date, title, note, active) — **공지·일정**. admin.html에서 등록/수정/삭제(`Hub.upsert`/`Hub.update`) + **`show_home` 토글**로 삭제 없이 Home 노출만 껐다 켤 수 있음(대시보드 쿼리에 `show_home=eq.true` 추가됨). dashboard가 data/{notices,schedule}.json + Supabase 병합 표시. (GitHub JSON 편집은 고급 옵션으로만 잔존)
- **`nav_settings`** (key=파일명 PK, label, enabled, updated_at) — 상단 nav 항목 on/off. admin.html "🧭 상단 메뉴 관리"에서 토글 → 각 페이지 nav 스크립트가 `enabled=eq.false` 목록을 받아 즉시 숨김.
- **`lineup_stages`** (key='1'|'2'|'3·4'|'5'|'6'|'7', status='future'|'now'|'done') — lineup-studio.html 프로세스 허브 단계 진행 상태. 각 단계 카드의 [✅ 이 단계 확정] 버튼으로 done 전환 + `STAGE_NEXT`/`STAGE_REQUIRES` 의존관계에 따라 다음 단계 자동으로 now 오픈(7은 5·6 모두 done이어야 now). [↩️ 확정 취소]로 done→now 되돌리기 가능(future로는 못 돌아감, 필요 시 SQL로).
- ⚠️ **`prayers`의 admin 관리 목록은 `share=eq.true` (이미 공유 중인 것만) 유지** — `active=eq.true`로만 필터링하면 다른 선생님이 비공유로 남긴 개인 기도까지 admin 화면에 노출되므로 절대 풀지 말 것.
- **`outings`** (id, cell, date, text, photos jsonb=storage 키 배열, teacher, created_at, active) — **월간 아웃팅 기록**. `outings.html`에서 등록(사진은 `outing-photos` 버킷 업로드 후 키 배열 저장), 전체 공개 갤러리. 소프트 삭제(active=false). 사진 파일은 Storage `outing-photos`(public read, 3MB, anon SEL/INS/UPD, DEL 미허용 — 학생 사진과 동일)
- 삭제·초기화는 Supabase `execute_sql`(truncate)로. 학기 말 데이터 정리 시 사용. ⚠️ Storage 객체는 직접 SQL 삭제 불가(보호 트리거) → Storage API(HTTP DELETE) 또는 대시보드 사용
- 관리자가 직접 보려면: admin.html (접속·출석누락·사진·기도 현황 한 화면)

### 4. 코드에 하드코딩 (정적 데이터)
- `TEACHERS` — 선생님 정보 (이름·반·역할·admin)
- `CELL_STUDENTS` — 10개 반(1반~6반+고3-1~4) 학생. **2026-09-01부터 Sp1~6 특별반 폐지, 장결 학생도 이 안에 포함**
- `CELL_TEACHERS` — 반별 담임/부담임
- `CELL_FAMILY` — 반 → 대가족 매핑 (4개 대가족)
- `BIRTHDAYS` — 학생 생일
- `CONTACT` (teachers.html) — 학교·연락처·주소·부모님·옷사이즈·가족
- `STUDENT_NOTES` (teachers.html) — 학생 케어 메모
- `PREV_INFO` (teachers.html) — 1학기 담임 (역사 기록, 미변경)
- `PREV3_INFO` (teachers.html, 2026-09-01 신규) — 3학기(셀1~12+Sp1~6, 폐지됨) 담임 기록. 각 학생 카드에 1학기 줄 바로 아래 "3학기: 소그룹반N 담임 XXX" 줄로 표시(더 자주 보고 싶은 친구들이었던 학생은 담임 없이 그룹명만). 출처: git `4ac745d~1`(4학기 배포 직전) teachers.html의 FAMILY_GROUPS/HOMEROOM_TEACHERS
- `HISTORICAL_ATTENDANCE` — 1학기 출석 데이터 (1/11~5/31, 21주, 84명, 미변경)
- ~~`HOME_CELL`~~ — **2026-09-01 폐지**. 장결자를 별도 셀(Sp1~6)에 배정하던 매핑이었으나, 이제 장결 학생도 일반 반의 정식 멤버로 포함되고 `JANGGYEOL` Set(la:1인 27명, students.html STUDENTS 기준)으로 배지만 표시. dashboard·attendance·attendance-overview·prayer.html의 `specialTag()`, teachers.html은 `LABELS.jangkyeol` — **공개용 assignments.html에는 미노출**(학생 프라이버시)

학생 정보 변경 시: 위 데이터 객체들을 코드에서 직접 수정 + git push. **`JANGGYEOL` 명단 변경 시 위 4개 파일 + teachers.html 총 5곳 동기화 필수**

---

## 🔑 인증·권한 체계

### PIN 게이트
- 모든 페이지 공통: `runners2026@jesus`
- localStorage에 저장 → 학기 동안 자동 로그인
- PIN 변경 시 자동 logout 효과 (다음 접속 시 새 PIN 입력 요구)

### 본인 선택 (Mock 로그인)
- PIN 통과 후 28명 드롭다운에서 본인 선택
- localStorage `mock_teacher`에 저장
- 본인 정보로 화면 개인화 (자기 반, 자기 대가족)

### 관리자 권한 (admin: true)
**관리자 6명** — 학생별 모아보기 등 일부 전체 접근 가능:
1. 안종범 (부장집사)
2. 석준원 (총무 + 6반 담임, 4학기부터)
3. 김광현 (교육국장)
4. 송진우 (예배국장 + 셀7 부담임)
5. 오덕현 (미디어국장 + 셀9 담임)
6. 이유성 (홍보국장 + 셀8 담임)

> ⚠️ **오신영 목사님은 2026-08-17부로 전 시스템 명단·권한에서 제외** (사역 이동). 전용 환영문구·Home 전체보기 코드도 제거됨. relations.html의 과거 심방일지·관계도 기록은 역사 기록물로 보존. 신규 교사 **박진호·송가원** 추가 (cell 없음, 새 텀 배치 예정).

---

## 👨‍👩‍👧 대가족 매핑 (2026-09-01 4학기 기준 — CELL_FAMILY 참고)

| 대가족 | 반 | 대가족장 |
|---|---|---|
| 1 | 1반 · 2반 | 이윤정 (2반 담임) |
| 2 | 3반 · 4반 | 박대철 (4반 담임) |
| 3 | 5반 · 6반 | 석준원 (6반 담임) |
| 4 | 고3-1 · 고3-2 · 고3-3 · 고3-4 | 전성희 (고3-2 담임) |

대가족장은 국장단이 지정(짝수 반이 아닌 특정 인원 지정 — 패턴 없음, FAMILY_LEADERS 하드코딩). Sp1~6(장결자 특별반)는 폐지됨.

---

## 🔄 사용자 의사결정 (확정된 것)

| 결정 | 내용 |
|---|---|
| ❌ OAuth Google 로그인 | 거부 → PIN 인증으로 일원화 |
| ❌ Apps Script 백엔드 | 보류 → 정적 사이트 운영 |
| ❌ 구글시트 데이터 운영 | 보류 → GitHub JSON 파일로 |
| ❌ 이메일 알림 | 보류 → 화면 알림만 |
| ✅ PWA 홈화면 | **적용됨** — manifest + apple-touch-icon, 홈화면 추가 시 이름 "내수동 경주자 2026", 녹색 R 아이콘 (서비스워커·푸시는 미적용) |
| ❌ 카카오 알림톡 | 보류 |
| ✅ 사진/출석/기도/접속 Supabase | 정적 사이트 유지하되 공유 데이터는 Supabase(Storage+Postgres)로 |
| ✅ Special 명칭 변경 | "더 자주 보고 싶은 친구들" (낙인 방지) |
| ✅ 학기별 PIN 변경 | h2 → h3 → h4 → 내년 h1 |
| ✅ 라벨 변경 | "기도제목" → "학생상황+기도제목" |
| ✅ 학생별 모아보기 권한 | 관리자만 전체, 일반은 본인 대가족 |
| ✅ 같은 대가족 출석 입력 | 같은 대가족 선생님 사이 가능 |

---

## 🎯 운영 워크플로

### 공지·일정·기도제목 추가 (관리자)
- **권장: `admin.html` (👑 관리자 페이지) "직접 등록" 폼** — 공지·일정·전체공유 기도를 바로 등록/삭제 → Supabase(notices/schedule/prayers) 저장 → 즉시 대시보드 반영 (GitHub 편집 불필요)
- 대안(고급): GitHub repo `publish/data/{notices,schedule}.json` 직접 편집 + commit → 1~2분 후 반영 (admin 폼 데이터와 병합 표시)

→ 자세한 가이드: `publish/ADMIN_GUIDE.md`

### PIN 변경 (학기마다)
사용자가 "PIN을 h3으로 바꿔줘" 같은 요청 시:
```bash
# 모든 페이지에서 일괄 치환
cd "C:\Users\MADUP\Desktop\Claude_Projects\Personal_2\Runners\publish"
# runners2026@jesus → (새 PIN) 으로 일괄 치환 — 치환만으로 전 사용자 강제 로그아웃 효과
```
파일 목록:
- `dashboard.html`, `attendance.html`, `attendance-overview.html`
- `prayer.html`, `teachers.html`, `relations.html`, `photos.html`, `admin.html`
- `dashboard_backend.gs`, `DASHBOARD_DEPLOY.md`
- ⚠️ 각 페이지 하단 **공통 네비 주입 스크립트의 `const KEY = 'runners2026@jesus'`** 도 함께 치환 (teachers/관계도 링크에 사용)

### 학생 정보 변경
> ⚠️ **장결(장기결석) 학생 명단 변경 시**: `JANGGYEOL` Set을 dashboard·attendance·attendance-overview·teachers·prayer **5개 파일에서 동일하게** 수정 (한 곳만 바꾸면 페이지마다 배지가 어긋남). Sp1~6/HOME_CELL 방식은 2026-09-01 폐지됨.

학생 셀 이동 / 추가 / 정보 수정 시 수정해야 할 파일:
- `assignments.html` — FAMILY_GROUPS
- `teachers.html` — FAMILY_GROUPS, CONTACT, STUDENT_NOTES, PREV_INFO
- `dashboard.html` — CELL_STUDENTS, BIRTHDAYS
- `attendance.html` — CELL_STUDENTS, STUDENT_INFO
- `attendance-overview.html` — CELL_STUDENTS
- `prayer.html` — CELL_STUDENTS, **STUDENT_GENDER** (디폴트 아바타용 성별 맵)
- `attendance-overview.html` — CELL_STUDENTS (이름 옆 아바타)
- `photos.html` — TEACHERS, CELL_TEACHERS, CELL_STUDENTS (업로드 그리드)
- `relations.html` — students 배열 (관계도, 이전 index.html)
- `make_assignment_pdf.py` — CELL_STUDENTS (공개 편성표 assignments.pdf 재생성)
- `make_lineup_pdf.py` — CELL_STUDENTS (전체 라인업 lineup.pdf 1장 재생성 · `python make_lineup_pdf.py`)
- `make_lineup_pptx.py` — 라인업 PPT(lineup.pptx, 타이틀+대가족 6장) 재생성 · `python make_lineup_pptx.py` (python-pptx 필요)

→ 변경 후 PDF 재생성:
```bash
python make_assignment_pdf.py
```

### 출석 historical 데이터 갱신 (학기 말)
21주 시리즈 → 다음 학기엔 새 데이터로 갱신 필요. 1학기 데이터는 그대로 보존하고 2학기 데이터를 historical로 옮김.

---

## 📋 최근 작업 이력 (역순, 최신이 먼저)

0. **오신영 목사님 전 시스템 제외 + 신규 교사 2명** — 전 페이지 TEACHERS/ADMINS에서 오신영 제거(관리자 6명), dashboard 전용 환영문구·전체보기 코드 삭제. 신규 교사 **박진호·송가원**(cell 없음) 전 페이지 추가. relations.html 과거 기록은 보존
0. **term3 UI 개편(화이트) + 비교표 투표** — 본문 화이트 테마(게이트·헤더는 다크 유지), 취지 옵션중립화, 섬김 응답을 "교사 섬김 상황 제출하기" 설문형 UI(라디오+서술+제출)로, 상의 항목="부장님/국장단과 상의하고 싶어요", 투표 버튼 "🗳 N안에 투표하기", **맨 하단 세 안 비교 테이블 + 투표 라디오 + "OOO 선생님은 N안을 선택하셨습니다" 상태 문구**. term3-results.html은 **관리자 6명 전용**(비관리자 게이트 거부, 확정 후 공개 방침)
0. **term3 개편: 교사 섬김 응답 + 결과 분리 (`term3-results.html` 신규)** — ① 상단 취지 옵션중립화(팀사역 문구는 1안 설명으로), ② 프로세스 4단계 실제 버전(교사 섬김 파악→라인업 선정→학생 조합→교사 배치)+맡고싶은 학생 반영 각주, ③ **교사 섬김 응답** 섹션(5택: 반인도/케어선호/역할무관/안식/상의 + 메모, 테이블 **`term3_teacher_status`** teacher PK upsert), ④ 실시간 투표 현황은 **term3-results.html**로 분리(PIN+본인선택, 바 차트 10초 폴링, **관리자 7명만** 섬김 응답 상세·미투표/미응답 명단 열람), 의견은 term3.html 각 안 아래 실시간 유지
0. **3학기(9월~) 편성 투표 페이지 (`term3.html` 신규)** — 새 텀 편성안 3가지(1안 찬양팀 대가족 10반 / 2안 14반 세분화 / 3안 12반 새 조합)를 게시하고 교사가 **투표 + 안별 의견**을 남기는 페이지. 실시간 현황(12초 폴링), 투표 변경 가능(teacher PK upsert). 새 테이블 **`term3_votes`**(teacher PK, option 1~3)·**`term3_comments`**(id, teacher, option, text, active) — RLS 기존과 동일. 학생 이름 옆 2학기 출석률 표시(RATES 하드코딩), 장결자는 반 안 별도 칸. 교사 게이트 명단에 신규 3명(박진호·김현진·안강훈) 포함. **공통 네비 최상위 메뉴 '🗳 새학기 편성'** — 10개 페이지 전체 ITEMS 첫 항목. 편성 원본: `../project/active/2026-term3/` (option1-편성안·lineup-3options·teacher-survey). 투표 마감 후: 결과 확인은 term3_votes/term3_comments 조회, 페이지 내리려면 네비 항목 제거
0. **전체출석현황 주차별(날짜별) 매트릭스** — attendance-overview에 `[📊 요약]/[📅 주차별]` 보기 토글. 주차별 = 행=학생·열=주일 날짜(●◐○·) 매트릭스, 셀 카드별(반별)로 표시 + 행 끝 누적% + 카드 하단 주차별 출석수/재적. 기본 2학기(6/7~이번 주), `☑ 1학기 포함` 토글(1/11~). 이름 열 sticky + 가로 스크롤(모바일 OK). 데이터 변경 없음(기존 병합 로직 재사용). 설계: `docs/superpowers/specs/2026-07-04-weekly-attendance-matrix-design.md`
0. **월간 아웃팅 기록 기능 (`outings.html` 신규)** — 셀별 모임을 **날짜 + 사진 여러 장(최대 10) + 간단한 텍스트**로 기록·공유. 새 테이블 `outings`(id·cell·date·text·photos jsonb·teacher·active) + 새 버킷 `outing-photos`(public, 3MB, 가로 1280px 압축). 게시=담임·부담임 본인 셀/관리자 전체, 열람=전체 공개(셀 필터), 라이트박스, 작성자·관리자 소프트 삭제. `OutingDB`/`OutingPhotos` 헬퍼(REST). 공통 네비에 `🎒 아웃팅` 추가(8개 페이지). 설계: `docs/superpowers/specs/2026-06-06-outings-design.md`
0. **장결자(보고 싶은 친구들) 셀 배정 표기 + 각 반 DB 기록** — Sp1~6(24명)은 그대로 두되, PPT 라인업 기준으로 각 학생을 같은 대가족 내 두 셀에 2명씩 배정(`HOME_CELL` 맵, 단일 기준). ① 교사용 5개 페이지(dashboard·attendance·attendance-overview·teachers·prayer)에 `🏠 소그룹반 N`(그 외) / `💛 보고 싶은 친구`(자기 반 안) 꼬리표. ② **출석**: 담임 자기 셀 로스터에 배정 장결자 합류(`cellRoster`), `STUDENT_TO_CELL[장결자]=배정셀`로 어느 탭에서 입력해도 배정 셀로 저장. ③ **기도**: 담임 기도 드롭다운 + 학생별 모아보기에 배정 장결자 추가(`ALL_STUDENTS_FLAT` 보강) → 기도제목 cell=배정셀. DB 스키마 변경 없음(학생명 기준). 공개 assignments·관계도 제외. 설계: `docs/superpowers/specs/2026-06-06-jangkyeolja-cell-assignment-design.md`
0. **라인업 PDF·PPT (발표/인쇄용)** — 전체 라인업 1장 PDF(`lineup.pdf`) + 발표용 PPT(`lineup.pptx`, 타이틀+대가족 6장, 이름 22pt 크게·성별 색상). 웹 UI엔 미연결(파일만). 생성기 `make_lineup_pdf.py`/`make_lineup_pptx.py`
0. **오신영 목사님 전용 처리** — Home 환영문구 "💛 사랑하는 오신영 목사님 환영합니다 + 🎉 우리 목사님 최고!!!" (이름 `'오신영'` 기준, 다른 관리자/선생님엔 미적용) + 내 반 카드에 대가족 1~6 선택기로 **전체 열람**. 관리자 페이지는 그대로 admin 전용. 접속 현황은 **지난 7일** 기준 통계
0. **'Special' → '더 자주 보고 싶은 친구들' 명칭 변경** — 장기결석 그룹 라벨이 예민한 청소년에게 낙인/오해가 될 수 있어 따뜻한 이름으로 전면 교체(웹 전 페이지 + 공개편성표/라인업 PDF·PPT). "특별케어" 문구도 "대가족 선생님이 더 자주 함께"로 순화. **내부 코드 Sp1~6는 그대로 유지**(미변경), 좁은 탭엔 "💛 보고 싶은 친구들" 단축 표기
0. **모바일 홈화면(PWA)** — 매니페스트 + apple-touch-icon으로 홈화면 추가 시 이름 "내수동 경주자 2026", 아이콘 = **녹색 바탕 흰 R**(`icon-*.png`/`apple-touch-icon.png`). 탭 favicon(보라 러너)과는 별개. 전 페이지 `<head>`에 manifest·apple 메타 추가
0. **브랜딩(Runners 2026) + 관리자 공지·일정 등록** — 모든 페이지 제목 "Runners 2026 · X", 러너 로고(`logo-runner.svg`) favicon + 게이트 표시. 관리자 페이지에서 공지(`notices`)·일정(`schedule`)·전체공유 기도(`prayers`) 직접 등록/삭제 → 대시보드 즉시 반영. (GitHub JSON 편집 불필요)
0. **기도제목 자동 공유(Supabase)** — prayer.html의 "GitHub 공유(JSON 복사·commit)" 수동 UI 폐지. "전체 공유 ON" 토글 시 `prayers` 테이블에 자동 upsert → dashboard·admin·prayer 에 즉시 공유. (사용자 화면에서 개발자스러운 JSON 단계 제거)
0. **관리자 페이지(admin.html) + 출석 중앙화** — Supabase 테이블 `access_log`·`attendance` 신규. 모든 로그인에 접속 기록, 출석 저장 시 Supabase upsert(전 선생님 공유, dashboard/overview/attendance 병합). admin.html(관리자 7명): 접속 현황·미접속 / 셀별 출석 입력·누락(주차 선택) / 사진 등록 현황·미등록 / 기도·공지 현황+GitHub 편집 링크
0. **메인 화면 = Home(대시보드)** — 루트 `index.html` 을 dashboard.html 리다이렉트로 변경, 기존 관계도 → `relations.html` 로 분리. 공통 네비 라벨 "대시보드"→"Home", 순서 재정렬: `Home·출석입력·학생상황기도` │ `셀편성·관계도·전체출석현황·사진등록` (구분선 2그룹)
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
9. **PIN 학기별 변경 체계** — nsdhs2026t → nsdhs2026h2 (학기별) → 2026-07-04 runners2026@jesus (강제 로그아웃 겸 교체)
10. **dashboard.html 프로토타입** — 4개 핵심 박스 + 내 반 미니뷰
11. **attendance.html 신규** — 주차별 출석 입력
12. **teachers.html 확장** — 연락처·옷사이즈·가족관계 + 공유용 탭
13. **index.html (관계도)** — 1·3학기 토글 + 가족장 표기
14. **assignments.html / pdf** — 공개용 편성표 (학생·학부모용)

---

## 🚧 알려진 제약사항·이슈

1. **localStorage 격리(부분 해결)** — prayer_data 등은 여전히 본인 브라우저만. 단 **출석·접속·사진은 Supabase로 공유**됨(attendance/access_log 테이블 + Storage). 출석은 저장 시 자동 동기화
2. **백엔드 없음** — 실시간 동기화·이메일 발송 X (사용자 결정)
3. **OAuth 자동화 어려움** — Apps Script 권한 부여 시 Chrome popup이 별도 window로 떠서 browser-harness 잡기 어려움
4. **시트 fetch 사용 안 함** — 한때 시도했으나 사용자가 GitHub JSON 방식 선호
5. **PWA 홈화면 적용 / 푸시·오프라인 미적용** — 홈화면 추가(이름·아이콘)는 지원. 서비스워커·오프라인 캐시·푸시알림은 없음

---

## 🛠 기술 스택

- **Frontend**: HTML + 바닐라 CSS + 바닐라 JS (프레임워크 없음)
- **저장소**: localStorage + GitHub JSON 파일 + **Supabase Storage (사진) + Supabase Postgres (접속 access_log·출석 attendance)**
- **호스팅**: GitHub Pages (정적)
- **PDF/PPT 생성**: reportlab (`make_assignment_pdf.py` 공개편성표, `make_lineup_pdf.py` 라인업 1장) · python-pptx (`make_lineup_pptx.py` 라인업 슬라이드) · 렌더 QA는 PowerPoint COM(win32com) 또는 PyMuPDF(fitz)
- **Supabase MCP**: DB 테이블/정책/데이터 작업 (프로젝트 `hycwzggbgnimuuhporwf`) — `execute_sql`, `apply_migration` 등
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
├── outings.html (월간 아웃팅 기록 — outings 테이블 + outing-photos 버킷)
├── admin.html (관리자 — 접속·출석·사진 현황 + 공지·일정·기도 등록)
├── logo-runner.svg (러너 로고 · 브라우저 탭 favicon)
├── manifest.webmanifest (PWA · 홈화면 이름 "내수동 경주자 2026")
├── icon-192.png / icon-512.png / apple-touch-icon.png (홈화면 아이콘 · 녹색 R)
├── teachers.html
├── index.html (루트 → dashboard.html 리다이렉트)
├── relations.html (관계도 · 이전 index.html)
├── assignments.html (공개용)
├── assignments.pdf (공개용 편성표 PDF)
├── lineup.pdf (전체 라인업 1장 PDF · 인쇄용)
├── lineup.pptx (전체 라인업 PPT · 발표용, 7장)
├── cells.html (tombstone)
├── make_assignment_pdf.py (공개 편성표 PDF 생성기)
├── make_lineup_pdf.py (라인업 1장 PDF 생성기)
├── make_lineup_pptx.py (라인업 PPT 생성기 · python-pptx)
├── docs/superpowers/specs/ (설계 문서: 학생 사진 기능 등)
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
- **역할**: 내수동 고등부 교사 + 6반 담임(4학기부터) + 총무 (관리자)
- **소속**: jwsuk@madup.com (회사 계정, MCP가 이 계정으로 OAuth됨)
- **언어**: 한국어
- **선호**: 결과물 중심, 자율적 문제 해결, 시각적 검증

## 2026-08-23 — 편성 스튜디오 + 학생 정보 허브 + 교적부 암호화

- **lineup-studio.html** (신규, 국장단 7인 전용, nav 미등재): 편성 보드(반 컬럼+학생 카드+사진, DnD/모바일 탭이동), 한국어 명령 바("이름 N반으로"/"교환"/"분리"/"같이"/"취소"), 제약 관리(직접 추가·삭제), 자동 편성(JS — SEP/KEEP/이력/균형), 드래프트 저장·불러오기·확정(lineup_drafts), 사진 클릭 확대
- **students.html** (신규, 전 교사): 학생 그리드(사진·학년·성별·현재반·출석%·장결)+검색/필터, 상세 패널(주차별 출석 스트립·연락처🔒·상황 메모 타임라인 열람/작성)
- **신규 테이블**: lineup_drafts / student_vault / student_notes (anon SEL/INS/UPD, DELETE 미허용)
- **🔒 교적부 암호화 체계**: 연락처·상황메모는 AES-GCM(PBKDF2 150k, salt 'nsdhs-vault-2026') 브라우저 암호화 후 저장. 키 = 교적부 코드(소스 미포함, 총무 관리·카톡 공유). 열람 시 1회 입력 → sessionStorage. 코드 변경 시 재암호화 스크립트(scratchpad/vault_migrate.mjs) 필요
- **teachers.html PII 제거**: 평문 CONTACT(86명 연락처)·STUDENT_NOTES(212건) 소스에서 삭제 → vault 로더로 대체(교적부 코드 입력 시 기존 탭 그대로 동작). ⚠️ git 히스토리에는 평문 잔존 — 완전 제거는 history rewrite 별도 결정
- 전 페이지 nav에 '👤 학생 정보' 추가. 시드 드래프트 D-seed-v1 = 10반 확정용 초안(final-lineup-10.md)

## 2026-08-23 (2) — 라인업 편성 스튜디오 7단계 프로세스 개편

- **lineup-studio.html** → "라인업 편성 스튜디오": 로그인 후 **프로세스 허브**(7단계 카드: 1 선생님현황✅ / 2 초기라인업 / 3·4 교사지망 접수 / 5 교사배치 / 6 학생조정 / 7 최종배포⚪예정) ↔ 편성 보드 전환
- **lineup-apply.html** (신규, 전 교사, nav 미등재): 반 구성 미리보기 + 1~3지망·역할·동역자·맡고 싶은 학생·코멘트 제출 → `lineup_applications` 테이블(teacher PK upsert). 비공개(국장단만 열람)
- **교사 배치**: 보드 반 카드에 교사 슬롯([+ 교사] 팝업 — 지망자 ★ 표시), 명령 "이름 N반 배치"/"배치 해제", 하드제약(오은규T↔오은수·김주영T↔홍기진) 경고, draft.classes[].teachers에 저장
- 지망 현황 모달(국장단): 반별 ★☆ + 교사별 상세 + 미제출 명단
- 향후: 1단계 Poll 생성기(텀별 섬김 설문 자동 생성·공유·집계), 7단계 원클릭 배포(확정본→시스템 데이터 전환)

## 2026-08-23 (3) — 지망 폼 고도화 (lineup-apply.html 최종 스펙)

- Q1 지망 1~3 (반 카드 버튼/셀렉트, 중복 방지) · Q2 강점 8은사(4영역×2, 성경 근거 범례, 플랫 칩) · Q3 "동역자가 채워주면 좋겠는 부분"(같은 8칩) · Q4 동역자(①이름 체크 — 배정가능 17명, 본인 제외 ②협업 성향 6유형 ③협업 방식 6유형[역할구분/멘토링/운영리듬 3축]+기타) · Q5 케어 리듬(택1)+케어 방식(복수)+기타 · Q6 맡고 싶은 학생 · Q7 코멘트
- Q6·Q7은 term3_teacher_status.note에서 자동 프리필(학생명 추출→Q6, 원문→Q7, 지망 미제출자만)
- lineup_applications 컬럼: teacher PK, term, choice1~3, strengths, needs, partner, partner_traits, collab_types, collab, visit_avail, visit_types, visit_etc, wish, comment, updated_at, active
- 박진호·송가원 = 다음 텀 합류 (이번 텀 배치 풀·동역자 후보 제외, 17명 기준)
