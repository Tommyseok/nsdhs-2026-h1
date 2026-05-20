# 내수동 고등부 관계도 (2026 1학기)

학생·교사 관계 시각화 사이트.

## 운영 메모

- 학생 민감 정보(신앙·정서·가정 배경 등)를 포함하므로 **Private repo**로 운영
- `noindex` 메타 + `robots.txt`로 검색엔진 차단
- URL은 교사 단톡방·내부에서만 공유

## 업데이트 방법

1. `index.html` 수정
2. `git add . && git commit -m "update" && git push`
3. GitHub Actions가 자동으로 Pages 재배포 (1~2분)
