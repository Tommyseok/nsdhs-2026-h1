# 월간 아웃팅 기록 기능 — 설계

> 작성 2026-06-06 · 승인됨

## 목적
매달 셀별 아웃팅(모임)을 **날짜 + 사진 여러 장 + 간단한 텍스트**로 기록·공유. 다 같이 추억을 본다.

## 결정 (확정)
- 위치: **새 페이지 `outings.html`** (공통 네비에 `🎒 아웃팅`)
- 게시 권한: 담임·부담임 = 본인 셀 / 관리자 7명 = 전체 셀
- 열람: **전체 공개** (모든 선생님이 전 셀 열람, 셀 필터 제공)
- 사진: **여러 장** (한 아웃팅당 최대 10장)

## 데이터 (Supabase)
**테이블 `outings`** — RLS: anon SELECT/INSERT/UPDATE, DELETE 미허용 (기존 테이블과 동일 신뢰 모델)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | text PK | 클라 생성 `'O'+Date.now()` |
| cell | text | 셀1~셀12 |
| date | date | 아웃팅 날짜 |
| text | text | 간단한 기록 (nullable) |
| photos | jsonb | storage 키 배열 `["O123_0.jpg", ...]` |
| teacher | text | 작성자 |
| created_at | timestamptz default now() | |
| active | boolean default true | 소프트 삭제 |

**버킷 `outing-photos`** — public read, 파일 3MB, `image/jpeg|png|webp`. 키 = `{id}_{n}.jpg`.
브라우저 압축: 가로 최대 1280px(비율 유지), JPEG 0.8 (풍경용 — 학생 아바타 400px 정사각과 별개).
Storage 정책: anon SELECT/INSERT/UPDATE, DELETE 미허용.

## 페이지 `outings.html`
PIN 게이트(`runners2026@jesus`) + 본인 선택(mock) → 공통 네비.
1. **등록 폼** — 셀(담임/부담임 고정·관리자 선택) · 날짜(기본 오늘) · 텍스트 · 사진 다중 선택(썸네일 미리보기·개별 제거). 저장: 사진 전부 업로드 → 성공 키들로 `outings` insert.
2. **갤러리** — 셀 필터(전체/셀1~12) + 날짜 내림차순. 카드 = 셀 배지·날짜·작성자·텍스트 + 사진 썸네일 그리드 → 클릭 라이트박스. 작성자/관리자만 소프트 삭제(`active=false`).

## 헬퍼
`OutingDB`: `list()` (GET `?active=eq.true&order=date.desc`), `insert(rec)` (POST), `update(id, patch)` (PATCH). 사진 `compressWide`/`uploadPhoto`/`photoUrl` (Storage REST). anon 키·URL은 기존 페이지와 동일 값 재사용.

## 네비
공통 네비 ITEMS에 `['outings.html','🎒 아웃팅','']` 추가 — 교사 페이지 7곳(dashboard·attendance·attendance-overview·prayer·teachers·relations·photos) + outings.html. 공개 assignments 제외.

## 에러·제약
- 업로드 실패 → 토스트·재시도. 사진 업로드 후 row insert 실패 시 사진 잔존(허용).
- Storage DELETE 미허용 → 소프트 삭제(사진 파일 잔존, 학생 사진과 동일 정책). 하드 삭제는 Supabase 대시보드.
- 실시간 동기화 없음 → 새로고침 시 반영.

## 검증
로컬 서버 + 브라우저: ① 게이트·네비 ② 담임 본인 셀 고정/관리자 셀 선택 ③ 다중 사진 업로드·압축·미리보기 ④ 저장 후 갤러리 카드·라이트박스 ⑤ 셀 필터 ⑥ 소프트 삭제 ⑦ 콘솔 에러 0.
