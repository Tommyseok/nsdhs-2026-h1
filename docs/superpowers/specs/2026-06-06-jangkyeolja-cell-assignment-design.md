# 장결자(더 자주 보고 싶은 친구들) 셀 배정 표기 + 각 반 DB 기록 — 설계

> 작성 2026-06-06 · 승인됨 · 출처: `04_개인_리소스/Tommy/경주자/lineup.pptx` (수동 편성본)

## 배경
장기결석 그룹 Sp1~Sp6(24명)은 현재 대가족별 별도 그룹으로만 존재. 장결자도 한 반에 소속돼야 하므로,
PPT 라인업에서 사용자가 각 학생을 같은 대가족 내 두 셀에 2명씩 배정함. 이 배정을 웹에 **표기(꼬리표)**하고,
각 반 담임이 장결자의 **출석·기도제목을 자기 반 DB에 기록**할 수 있게 한다.

## 확정 매핑 (HOME_CELL) — PPT 대조 검증 완료(중복·오배치 0)
```
김민채·송성모→셀1   최승아·고예나→셀2   최서윤·최지윤→셀3   백결·조혁준→셀4
김유진·김강희→셀5   김재원·박서연→셀6   박시우·하어림→셀7   박진서·임소명→셀8
오희수·장세민→셀9   정원영·박민주→셀10  김도헌·이하준→셀11  이서현·이소민→셀12
```

## 원칙
- **Sp1~6 그룹 정의는 변경/이동 없음.** 표기·입력 경로만 추가(additive).
- DB 스키마 변경 없음: `attendance`(PK=week+student)·`prayers`는 학생명 기준 → 그대로 수용, 마이그레이션 불필요.

## 변경 사항

### A. 단일 기준 데이터 + 헬퍼 (수정 페이지마다 삽입)
```js
const HOME_CELL = { '김민채':'셀1', … '이소민':'셀12' };          // 24명
const SPECIAL_SET = new Set(Object.keys(HOME_CELL));
const specialsOfCell = c => Object.keys(HOME_CELL).filter(n => HOME_CELL[n] === c);
function specialTag(name, ctxCell){                               // 꼬리표
  if(!SPECIAL_SET.has(name)) return '';
  const home = HOME_CELL[name];
  return ctxCell === home
    ? '<span …>💛 보고 싶은 친구</span>'                          // 자기 반 안: 장결자 표식
    : `<span …>🏠 소그룹반 ${home.slice(1)}</span>`;              // 그 외: 배정 반 안내
}
```
배지는 inline style(각 파일 CSS 무수정, 자기완결).

### B. 꼬리표 표시 (교사용 5개 페이지)
- `dashboard.html` — renderMyClass 학생 행 (Sp 셀 보기에서 `🏠 소그룹반 N`)
- `attendance-overview.html` — student-row (Sp 카드)
- `teachers.html` — FAMILY_GROUPS special.students 렌더
- `attendance.html` — 로스터 학생 행
- `prayer.html` — 학생별 모아보기 picker
- ❌ 공개 `assignments.html` · 관계도 `relations.html` 제외

### C. 출석 DB — `attendance.html`
- `cellRoster(cell)` 헬퍼: 일반 셀이면 `CELL_STUDENTS[cell] + specialsOfCell(cell)`. renderStudents·renderSummary 공용.
- `STUDENT_TO_CELL[장결자] = HOME_CELL[장결자]` 보정 → 어느 탭에서 입력해도 cell=배정셀로 저장.
- 기존 대가족 "💛 보고 싶은 친구들" 탭 유지(대가족장 열람).

### D. 기도 DB — `prayer.html`
- fillStudentSelect: `CELL_STUDENTS[MY.cell] + specialsOfCell(MY.cell)` (장결자 옵션은 💛 표시) → 저장 시 cell=MY.cell.
- ALL_STUDENTS_FLAT에 장결자(cell=배정셀) 추가 → 학생별 모아보기 노출 + 꼬리표.

## 검증
로컬에서 ① 각 페이지 꼬리표 표시 ② 셀 담임이 장결자 출석·기도 입력 가능 ③ 저장 레코드 cell=배정셀 확인.
