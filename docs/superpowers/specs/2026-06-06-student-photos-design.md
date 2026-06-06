# 학생 사진 기능 — 설계 문서

> 작성일: 2026-06-06
> 프로젝트: 내수동 고등부 2026 2학기 운영 시스템
> 상태: 승인됨 (사용자 확인 2026-06-06)
>
> **변경 (2026-06-06, 구현 후):** 전용 페이지(`photos.html`) 대신 **dashboard "내 반+대가족" 뷰에서 인라인 업로드**로 변경(사용자 요청). 아바타 카메라 배지 클릭 → 업로드. 관리자는 대가족 1~6 선택기로 전체 접근. `photos.html` 제거. 저장소·키·권한 모델·표시 페이지는 아래 설계 그대로 유지.

---

## 1. 목표

- 선생님이 **자기 반(배정된 셀) 학생들**의 사진을 직접 업로드할 수 있다.
- **관리자(admin 7명)**는 **전체 학생**의 사진을 업로드할 수 있다.
- 학생 이름 옆에 사진을 표시한다. 사진이 없으면 **성별별 디폴트 아바타**를 표시한다.
- 업로드한 사진은 **즉시 모든 선생님에게 공유**된다.

## 2. 결정 사항 (브레인스토밍 확정)

| 항목 | 결정 |
|---|---|
| 사진 저장소 | **Supabase Storage** (즉시 공유, 진짜 직접 업로드) |
| 업로드 UI | **전용 관리 페이지 `photos.html`** 신규 |
| 표시 페이지 | dashboard / attendance / prayer / teachers (이름 옆 아바타) |
| 디폴트 이미지 | **성별별 SVG 아바타** (코드 내장, 추가 파일 0) |
| 권한 모델 | **UI 레벨**(신뢰 기반) — 기존 PIN·출석·기도제목과 동일 수준 |
| Supabase 프로젝트 | 기존 `hycwzggbgnimuuhporwf` 복원 후 사용 (사용자 승인) |

## 3. 아키텍처

- 기존 스택(바닐라 HTML/CSS/JS, 프레임워크·빌드 없음) 유지.
- **SDK 없이 `fetch`로 Supabase Storage REST API 직접 호출** → 의존성 0 추가.
- Supabase 프로젝트 `hycwzggbgnimuuhporwf`(ap-southeast-1)를 INACTIVE → 복원.
- 전용 버킷 **`student-photos`** 신규 생성 (public read). 기존 데이터와 분리.
- 무료 티어 1GB로 충분 (86명 × ~40KB ≈ 4MB).

### Supabase 설정
- 버킷: `student-photos`, `public = true`.
- Storage 정책 (storage.objects):
  - 공개 읽기: public 버킷이므로 public URL로 read 가능.
  - 업로드: `anon` 롤에 대해 `bucket_id = 'student-photos'` INSERT + UPDATE 허용 (upsert).
- 클라이언트에 **publishable(anon) 키** + **프로젝트 URL** 내장 (publishable 키는 공개용이라 노출 정상).

## 4. 사진 ↔ 학생 매핑

- 학생은 고유 ID가 없고 `name`이 유일 식별자(86명 중복 없음).
- 파일 키(canonical) = **`{학생이름}.jpg`** (원본 한글). URL에 넣을 때만 `encodeURIComponent` 적용.
- 업로드 시 **브라우저에서 자동 리사이즈/압축**: `FileReader → Image → canvas`(가로 최대 400px) → `canvas.toBlob('image/jpeg', 0.8)` → 30~50KB.
- 페이지 로드 시 Storage `list` 1회 호출 → `{이름: updated_at}` 맵 생성.
  - 사진 있으면 표시 URL = `public_url + '?v=' + encodeURIComponent(updated_at)` (캐시버스팅).
  - 없으면 `defaultAvatar(gender)`.

### REST 엔드포인트 (헤더: `apikey`, `Authorization: Bearer <anon>`)
- 목록: `POST {URL}/storage/v1/object/list/student-photos` body `{"prefix":"","limit":1000}` → `[{name, updated_at, ...}]`.
- 업로드(upsert): `POST {URL}/storage/v1/object/student-photos/{encoded-key}` 헤더 `x-upsert: true`, body = JPEG blob.
- 공개 읽기: `GET {URL}/storage/v1/object/public/student-photos/{encoded-key}`.
- 목록 결과의 `name`은 디코딩된 원본 키 → `name.replace(/\.jpg$/, '')`로 학생명 매칭.

## 5. 공통 헬퍼 (`Photos`)

각 파일에 인라인으로 복사 (정적 사이트라 공유 모듈 없음 — 기존 방식과 동일). ~40줄:
- `Photos.URL`, `Photos.KEY` (상수).
- `Photos.list()` → `Promise<Map<name, updated_at>>`.
- `Photos.publicUrl(name, ver)` → 캐시버스팅 포함 URL.
- `Photos.defaultAvatar(gender)` → 성별별 SVG data URI.
- `Photos.upload(name, blob)` → 업로드 (photos.html 전용).
- `Photos.compress(file)` → 리사이즈된 JPEG blob (photos.html 전용).
- `Photos.avatarImg(name, gender, verMap)` → `<img>` HTML (src=사진 or onerror로 디폴트 fallback).

## 6. photos.html (신규 — 업로드 전용)

- 기존 PIN 게이트 + 본인 선택(mock teacher) 패턴 재사용.
- 권한별 그리드:
  - 일반 선생님: 본인이 담임/부담임으로 배정된 셀의 학생만.
  - 관리자(`MY.admin`): 전체 12셀 + 6 Special.
- 각 학생 카드: 현재 사진(또는 디폴트) + 파일 선택 버튼. 선택 즉시 압축 → 업로드 → 카드 갱신 → 완료 토스트.
- 업로드 진행/에러 상태 표시 (자율 처리, alert 최소화).

## 7. 표시 페이지 (4개)

각 페이지에서 학생 이름 렌더링 지점에 아바타(`Photos.avatarImg`) 삽입. 로드 시 `Photos.list()` 1회 호출해 verMap 확보 후 렌더.

| 파일 | 삽입 위치 |
|---|---|
| dashboard.html | 내 반 미니뷰 학생 목록 이름 옆 |
| attendance.html | 출석 입력 행 학생 이름 옆 |
| prayer.html | 학생별 모아보기 이름 옆 |
| teachers.html | 학생 상세 이름 옆 |

- 아바타 스타일: 작은 원형(예: 28~32px), `object-fit: cover`. 기존 레이아웃 깨지지 않게 inline-flex 정렬.

## 8. 디폴트 아바타

- 코드 내장 SVG → data URI.
- 남: 파랑 계열 배경 + 실루엣. 여: 분홍/보라 계열 배경 + 실루엣. 추가 파일 0.

## 9. 보안 모델 (명시)

- 정적 사이트라 권한은 **UI 레벨**. publishable 키는 코드에 노출되며, 기술적으로는 키를 아는 사람이 임의 업로드 가능.
- **기존 PIN·출석·기도제목과 동일한 신뢰 기반**(28명 아는 선생님) 모델. 그 이상의 서버 인증 없음.
- Storage 정책으로 버킷 외 접근·삭제는 차단 (INSERT/UPDATE만 허용, DELETE 미허용).

## 10. 운영 영향 (문서 갱신)

- `HANDOFF.md`: 페이지 맵에 photos.html 추가 / 데이터 저장 위치에 Supabase Storage 추가 / "학생 정보 변경" 파일 목록에 photos.html 추가 / 기술 스택에 Supabase Storage 추가.
- `ADMIN_GUIDE.md`: 사진 업로드 워크플로 + Supabase 버킷/키 정보.
- Supabase URL·anon 키·버킷명은 HANDOFF.md 핵심 URL 표에 기록.

## 11. 범위 밖 (YAGNI)

- 사진 삭제 UI (필요 시 추후 — Storage 정책에서 DELETE 미허용).
- 얼굴 인식·크롭 에디터 (단순 중앙 크롭만).
- 사진 승인 워크플로 (신뢰 기반).
- 서버 인증·RLS 기반 진짜 권한 (정적 사이트 범위 밖).

## 12. 검증 방법

- Supabase 복원·버킷 생성·정책 적용 확인 (MCP `execute_sql`/`get_project_url`/`get_publishable_keys`).
- photos.html에서 실제 사진 업로드 → Storage에 객체 생성 확인.
- 4개 표시 페이지에서 사진/디폴트 아바타가 이름 옆에 뜨는지 브라우저(playwright)로 시각 확인.
- 일반 선생님 계정: 본인 셀만 보이는지 / 관리자: 전체 보이는지 권한 확인.
