/* 26년 여름수련회 평가 — 문항 정의
 * 원문: 26년 여름수련회 평가.pdf (2026-08)
 * 문구를 고칠 때는 이 파일만 수정한다. survey.html은 건드리지 않는다.
 */
const SURVEY = {};

SURVEY.meta = {
  student: {
    title: '학생 설문',
    sections: [
      '기본 질문 및 수련회 준비 과정',
      '활동 & 교제 프로그램',
      '신앙 프로그램(예배/집회/성경공부)',
      '시간 배분 & 환경',
      '마무리 피드백'
    ],
    intro: '이 설문은 이름을 받지 않습니다. 반별 통계로만 집계하며, 개별 응답은 담임 선생님께 공개되지 않습니다.'
  },
  teacher: {
    title: '교사 설문',
    sections: [
      '기본 질문 및 역할 선택',
      '[담임선생님 전용] 학생 인솔 & 관계 케어 피드백',
      '[헬퍼 / 담당자 전용] 프로그램 기획 & 현장 운영 피드백',
      '[공통] 전체 진행, 타임테이블 & 시스템 개선 (모든 교사 응답)',
      '마무리 피드백'
    ],
    intro: '이 설문은 익명입니다. 이름도, 반 정보도 수집하지 않습니다. 있는 그대로 적어주셔야 다음 수련회가 나아집니다.'
  },
  praise: {
    title: '찬양팀 설문',
    sections: ['준비하는 동안', '집회를 진행하며', '돌아보며'],
    intro: '이 설문은 익명입니다. 잘했는지 못했는지를 묻는 자리가 아니라, 찬양으로 섬기며 지나온 시간을 함께 돌아보는 자리입니다. 떠오르는 대로 편하게 적어주세요.'
  }
};

const PROGRAMS = ['물놀이', '원투원', '멘토-멘티', '레크레이션', '축복의 시간', '경주자의 밤', '종범이네(달란트) 문방구'];

SURVEY.student = [
  { id:'q1', type:'radio', section:1, required:true,
    title:'당신은 몇 학년입니까?',
    options:['1학년','2학년','3학년'] },

  { id:'q2', type:'radio', section:1, required:true,
    title:"이번 수련회는 이전 수련회와 다르게 '금·토·일'로 진행되었습니다. 이전의 일정과 비교했을 때 어땠나요?",
    options:[
      '아주 좋았다 (주일에 수련회 장소에서 바로 모여서 예배드리고 마무리해서 좋음)',
      '주일까지 이어진 일정이 상관없었다 / 둘 다 괜찮다',
      '조금 아쉬웠다 (다음에는 목·금·토 일정이 더 좋겠다)'
    ] },

  { id:'q2_1', type:'textarea', section:1, required:false,
    title:'그렇게 생각한 이유(장점이나 불편했던 점)를 간단히 적어주세요.',
    hint:'예: 피로도, 학업/학원 일정, 주일 예배 집중도 등' },

  { id:'q3', type:'scale', section:1, required:true,
    title:'수련회를 시작할 때를 돌아보면, 당신의 마음은 얼마나 준비되고, 기대하고 있었나요?',
    scale:{ min:1, max:5, minLabel:'전혀 기대/준비되지 않음', maxLabel:'매우 기대되고 준비됨' } },

  { id:'q4', type:'rank', section:1, required:true, pick:3, other:true,
    title:'수련회를 기대하고 참여하도록 마음을 움직인 요소는 무엇인가요? (가장 영향이 컸던 항목 최대 3개 선택, 순서로 표시해주세요)',
    hint:'누른 순서대로 1·2·3 번호가 붙습니다. 다시 누르면 취소됩니다.',
    options:[
      '수련회 전 예배 후 기도회 (4번)',
      '릴레이 기도문 참여',
      '친구/선후배의 권유',
      '지난 수련회에서의 좋은 기억',
      '담임 선생님의 관심과 연락',
      '포스터 / 홍보 영상 / 안내',
      '개인적인 결단 및 영적 필요'
    ] },

  /* 아래 두 문항은 화면에 q6 → q5 순서로 나온다 (2026-08-08 사용자 요청).
     배열 순서가 곧 화면 순서다. id는 데이터 키라서 순서와 무관하게 고정한다 —
     순서 때문에 id의 의미가 바뀌면 나중에 집계할 때 뒤섞인다. */

  // 2026-08-08: 순위형 → 교제 매트릭스 → 다시 순위형으로 되돌림(사용자 요청).
  // 프로그램별 '교제·가까워짐' 점수 문항은 이 교체로 사라졌다.
  // 관계 형성은 q8(가까워지는 데 도움된 순간) 주관식으로만 남는다.
  { id:'q6', type:'rank', section:2, required:true, pick:3,
    title:'수련회 활동 중 나에게 가장 기억에 남았던 프로그램을 최대 3개 선택해 주세요. (1, 2, 3순위를 표시해주세요.)',
    hint:'누른 순서대로 1·2·3 번호가 붙습니다. 다시 누르면 취소됩니다.',
    options:PROGRAMS },

  // 원문 누락 — 평가 항목(행)이 PDF에 없어 프로그램 목록으로 채움 (설계문서 8.1)
  // 2026-08-08: '유익·즐거움' → '교제·가까워짐'으로 축 변경(사용자 요청).
  // q6(기억에 남는 Top3)와 역할이 갈려 프로그램 매트릭스 중복이 해소됐다.
  { id:'q5', type:'matrix', section:2, required:true,
    title:'각 활동 및 교제 프로그램은 선후배·친구들과 자연스럽게 교제하고 가까워지는데 얼마나 도움이 되었나요? (각 항목에 점수를 적어주세요)',
    hint:'1점: 전혀 도움이 되지 않았다 / 3점: 보통이다 / 5점: 매우 도움이 되었다',
    rows:PROGRAMS, cols:['1','2','3','4','5'] },

  { id:'q7', type:'radio', section:2, required:true,
    title:"'종범이네(달란트) 문방구' 운영은 수련회 프로그램에 더 적극적으로 참여하는 데 동기부여가 되었나요?",
    options:[
      '매우 재미있었고 참여하는 데 큰 동기부여가 되었다.',
      '보통이었다.',
      '상품/달란트 기준이 아쉽거나 이용하기 불편했다.'
    ] },

  { id:'q7_1', type:'textarea', section:2, required:false,
    title:'달란트 문방구의 물품, 달란트 획득 방식, 운영 시간 등 좋았던 점이나 개선되었으면 하는 점을 자유롭게 적어주세요.' },

  // 2026-08-08: '프로그램 개선점' → '관계 형성에 도움된 순간'으로 교체.
  // q6가 관계 형성을 점수로 묻고, 이 문항이 그 이유를 서술로 받는다.
  { id:'q8', type:'textarea', section:2, required:false,
    title:'이번 수련회에서 친구나 선후배와 가까워지는 데 특히 도움이 되었던 순간이나 활동이 있었다면 적어주세요.' },

  // 원래 q8이던 프로그램 개선점 문항. 위 문항과 축이 달라 별도 문항으로 되살렸다.
  { id:'q8_1', type:'textarea', section:2, required:false,
    title:"수련회 활동 프로그램 중 아쉬워서 '다음에는 이렇게 바꿨으면 좋겠다' 하는 점이나, 꼭 다시 하고 싶은 프로그램이 있다면 적어주세요." },

  /* ── SECTION 3~5 전면 개편 (2026-08-08 사용자 요청) ──
     신앙 프로그램을 하나의 매트릭스로 묶고, '왜 집중이 어려웠는지'를
     복수선택으로 받아 원인을 집계 가능한 형태로 바꿨다.
     신앙 보완점 주관식(구 q12)은 복수선택 문항들이 대체하여 제거. */

  { id:'q9', type:'matrix', section:3, required:true,
    title:'다음 프로그램이 각각 신앙적으로 의미 있고 집중할 수 있도록 운영되었다고 느꼈나요?',
    hint:'1점 (전혀 그렇지 않았다) ~ 5점 (매우 그렇다)',
    rows:[
      '저녁집회 (찬양, 말씀, 기도)',
      'GBS (기도를 주제로 한 성경공부 시간)',
      '리플렉션 (하루를 돌아보고 묵상하며 정리하는 시간)'
    ],
    cols:['1','2','3','4','5'] },

  { id:'q9_1', type:'checkbox', section:3, required:false, other:true,
    title:'[저녁집회] 저녁집회에서 집중하기 어려웠던 가장 큰 이유가 있었다면 무엇인가요?',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '피곤함',
      '집회 시간이 너무 길었음',
      '집회 시간이 너무 늦었음',
      '찬양/말씀/기도의 구성',
      '장소/온도/좌석 등의 환경',
      '음향/조명 문제',
      '개인적으로 집중하기 어려웠음',
      '특별히 어려운 점이 없었음'
    ] },

  { id:'q10', type:'scale', section:3, required:true,
    title:"[GBS] '기도'를 주제로 한 조별 성경공부(GBS) 내용과 나눔 시간은 기도에 대해 이해하는 데 도움이 되었나요?",
    scale:{ min:1, max:5, minLabel:'전혀 그렇지 않았다', maxLabel:'매우 그렇다' } },

  { id:'q10_1', type:'checkbox', section:3, required:false, other:true,
    title:'[GBS] GBS에서 개선되었으면 하는 부분을 선택해주세요.',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '내용이 너무 어려웠다',
      '내용이 너무 많았다',
      '시간이 부족했다',
      '시간이 너무 길었다',
      '질문이 이해하기 어려웠다',
      '나눔이 충분히 이루어지기 어려웠다',
      '조별 분위기가 어려웠다',
      '특별히 개선할 점이 없었다'
    ] },

  { id:'q11', type:'scale', section:3, required:true,
    title:'[리플렉션] 리플렉션은 하루를 돌아보고 하나님과 나의 상태를 생각하는 데 도움이 되었나요?',
    scale:{ min:1, max:5, minLabel:'전혀 그렇지 않았다', maxLabel:'매우 도움이 되었다' } },

  { id:'q13', type:'radio', section:4, required:true,
    title:'수련회 전체 타임테이블(일정 진행 속도 및 피로도)은 어땠나요?',
    options:[
      '쉬는 시간이 너무 길거나 지루했다',
      '대체로 적당했다',
      '약간 타이트했다',
      '매우 타이트하고 피곤했다'
    ] },

  /* 주의: 이 척도는 점수가 아니라 '부족 ↔ 과다' 방향이 다른 5범주다.
     평균을 내면 "너무 부족" 절반 + "너무 길었다" 절반이 "적당"으로 뒤집혀
     정반대 결론이 난다. 반드시 분포로만 볼 것. (설계문서 8.2)
     cols 를 숫자로 쓰지 않는 이유도 이것이다 — 대시보드가 숫자 열일 때만
     평균을 내고, 문자 열이면 자동으로 분포로 그린다. */
  { id:'q14', type:'matrix', section:4, required:true,
    title:"아래 각 수련회 요소별 '시간 배분'은 적절했는지 평가해 주세요.",
    rows:[
      '프로그램 사이 휴식시간',
      '집회시간 (찬양+말씀)',
      '집회 후 기도시간',
      '깊은 교제를 할 수 있는 시간 (원투원/멘토멘티 등)',
      'GBS',
      '리플렉션',
      '자유시간'
    ],
    cols:['너무 부족했다','조금 부족했다','적당했다','조금 길었다','너무 길었다'] },

  { id:'q15', type:'checkbox', section:4, required:false, other:true,
    title:"집회나 프로그램 참여 시 집중을 방해했던 '환경적 요소'가 있었다면 골라주세요.",
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '실내 온도(냉방/에어컨)',
      '조명',
      '음향/마이크',
      '좌석',
      '장소가 불편함',
      '이동 동선',
      '화장실/샤워시설',
      '소음',
      '안내방송',
      '특별한 문제 없음'
    ] },

  { id:'q16_keep', type:'textarea', section:5, required:false,
    title:'이것만큼은 꼭 유지해 주세요',
    hint:'프로그램뿐 아니라 일정, 분위기, 준비과정, 활동 등 무엇이든 좋습니다' },

  { id:'q16_miss', type:'textarea', section:5, required:false,
    title:'이번 수련회에서는 이런 점이 아쉽기도 했고 불편했어요',
    hint:'사람에 대한 것보다는 프로그램, 일정, 정보, 환경, 운영 방식 등의 관점에서 적어주세요' },

  { id:'q16_try', type:'textarea', section:5, required:false,
    title:'다음 수련회는 이렇게 해주세요, 이렇게 바꿔주세요' }
];

/* 역할 분기. survey.html 의 BRANCH_IDS = ['q4'] 와 짝을 이룬다.
   여기 문자열은 q4 의 options 와 글자 그대로 같아야 한다. 어긋나면 분기가 통째로 죽는다. */
const T_HOMEROOM = a => a.q4 === '담임' || a.q4 === '담임 + 헬퍼/프로그램 담당';
const T_HELPER   = a => a.q4 === '헬퍼/프로그램 담당' || a.q4 === '담임 + 헬퍼/프로그램 담당';

/* 교사 설문 — 2026-08-08 전면 개편.
   원문에 역할 선택이 Q1·Q5 두 번 나왔으나 중복이라 하나로 합쳤다(사용자 승인).
   경력 문항은 유지. 주관식 상당수를 복수선택으로 바꿔 원인을 집계 가능하게 했다. */
SURVEY.teacher = [
  // 분기 트리거. id 를 바꾸면 survey.html 의 BRANCH_IDS 도 함께 바꿔야 한다.
  { id:'q4', type:'radio', section:1, required:true,
    title:'이번 수련회에서 맡으신 역할을 선택해주세요.',
    options:['담임','헬퍼/프로그램 담당','담임 + 헬퍼/프로그램 담당'] },

  { id:'q1', type:'radio', section:1, required:true,
    title:'고등부에서 섬기신 기간은 얼마나 되셨나요?',
    options:['올해가 처음','1~2년','3~5년','5년 이상'] },

  { id:'q2', type:'matrix', section:1, required:true, other:true,
    title:'다음 사전 준비 과정이 실제 수련회를 준비하는 데 얼마나 도움이 되었나요?',
    hint:'1점 (전혀 도움이 되지 않았다) ~ 5점 (매우 도움이 되었다)',
    rows:[
      '교사/학부모 기도회 (반모임 후 전체모임에서, 온라인 줌 기도회)',
      '전체 기도회 (예배 후 전체 기도회)',
      '릴레이 기도',
      '교사 전체 모임 (3주동안 했던 교사모임)',
      '프로그램별 준비회의 (준비TF 모임, 담당자 모임)',
      '사전 공지 및 일정 공유',
      '교사용 자료/가이드',
      '수련회 전체 방향 및 목적 공유'
    ],
    cols:['1','2','3','4','5'] },

  { id:'q3', type:'textarea', section:1, required:false,
    title:'수련회 준비 과정에서 정보가 늦게 전달되거나 누락되어 현장에서 어려움이 있었다면 적어주세요.',
    hint:'무엇이 문제였는지 → 어떤 영향이 있었는지 → 어떻게 개선하면 좋을지 순으로 적어주시면 좋습니다' },

  { id:'q2_1', type:'matrix', section:1, required:true,
    title:'수련회를 준비하는 과정에서 다음 항목은 얼마나 명확했나요?',
    hint:'1점 (매우 불명확) ~ 5점 (매우 명확)',
    rows:[
      '전체 수련회의 목적',
      '전체 일정',
      '나의 역할',
      '다른 교사의 역할',
      '프로그램별 담당자',
      '준비물 및 물품',
      '보고/의사결정 체계',
      '긴급상황 발생 시 대응방법'
    ],
    cols:['1','2','3','4','5'] },

  /* ── SECTION 2 · 담임 전용 ── */
  { id:'q5', type:'scale', section:2, required:true, showIf:T_HOMEROOM,
    title:"[일정 체감] '금·토·일' 일정 전환이 학생들의 참여와 수련회 몰입, 주일예배 연계에 어떤 영향을 주었다고 생각하나요?",
    scale:{ min:1, max:5, minLabel:'학생 인솔 및 주일 연계가 매우 힘들었다', maxLabel:'학생 참여 및 주일 연계에 매우 효과적이었다' } },

  { id:'q5_1', type:'textarea', section:2, required:false, showIf:T_HOMEROOM,
    title:'일정과 관련하여 실제 현장에서 느낀 장점이나 문제점이 있었다면 적어주세요.' },

  { id:'q6', type:'checkbox', section:2, required:true, max:3, showIf:T_HOMEROOM,
    title:'[활동 프로그램] 반 아이들과 친밀감을 형성하고 마음을 여는 데 가장 효과적이었던 프로그램을 선택해 주세요.',
    hint:'최대 3개까지 선택할 수 있습니다',
    options:PROGRAMS },

  { id:'q7', type:'matrix', section:2, required:true, showIf:T_HOMEROOM,
    title:'[신앙 프로그램] 학생들이 신앙 프로그램에 참여할 때 관찰된 집중도와 몰입도는 어땠나요?',
    hint:'1점 (매우 낮았다) ~ 5점 (매우 높았다)',
    rows:['저녁집회','GBS','리플렉션'],
    cols:['1','2','3','4','5'] },

  { id:'q7_1', type:'checkbox', section:2, required:false, other:true, showIf:T_HOMEROOM,
    title:'학생들의 집중이나 참여를 방해했던 원인이 있었다면 선택해주세요.',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '피로도','시간대','프로그램 시간이 너무 길었음','프로그램 간 간격 부족',
      '이동/집합시간 부족','내용의 난이도','학생 간 분위기','장소/온도',
      '음향/조명','안내 부족','특별한 문제 없음'
    ] },

  { id:'q8', type:'scale', section:2, required:true, showIf:T_HOMEROOM,
    title:'[GBS/리플렉션 가이드] 사전에 공유된 교사용 가이드북, 질문지, 사전 모임 안내는 담임으로서 공과 및 나눔을 인도하기에 충분했나요?',
    scale:{ min:1, max:5, minLabel:'매우 부족', maxLabel:'매우 충분' } },

  { id:'q8_1', type:'textarea', section:2, required:false, showIf:T_HOMEROOM,
    title:'GBS/리플렉션 자료나 진행 방식에서 다음 수련회 때 개선되었으면 하는 점을 적어주세요.' },

  /* ── SECTION 3 · 헬퍼/담당자 전용 ── */
  { id:'q9', type:'checkbox', section:3, required:false, other:true, showIf:T_HELPER,
    title:'[사전 준비] 담당 프로그램을 준비하는 과정에서 가장 어려웠던 부분은 무엇이었나요?',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '준비 기간 부족','기획안 확정 지연','예산 / 물품 지원 및 구매 프로세스 아쉬움',
      '스태프 간 역할 분담(R&R) 및 소통 미흡','다른 프로그램과의 일정 조율',
      '수련회 정보 부족','인력 부족','특별한 어려움 없음'
    ] },

  { id:'q11', type:'checkbox', section:3, required:false, other:true, showIf:T_HELPER,
    title:'[섬김의 영역] 현장에서 역할 수행에 어려움이 있었다면 가장 가까운 원인을 선택해주세요.',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '역할 자체가 불명확했다','역할은 알았지만 인력이 부족했다','역할은 알았지만 시간이 부족했다',
      '다른 담당자와 역할이 겹쳤다','다른 담당자와 역할이 비어 있었다','필요한 정보가 부족했다',
      '의사결정 권한이 불명확했다','물품/시설이 부족했다','특별한 어려움이 없었다'
    ] },

  /* 원문 Q12 에 '1~5점 척도'와 '부족했던 영역 최대 3개 선택'이 함께 적혀 있었다.
     두 가지를 묻는 것이라 척도(q12)와 복수선택(q12_a)으로 나눴다. */
  { id:'q12', type:'scale', section:3, required:true, showIf:T_HELPER,
    title:'[인력 및 섬김 배치] 프로그램 진행에 필요한 인력 배치는 적절했나요?',
    scale:{ min:1, max:5, minLabel:'매우 부족', maxLabel:'매우 적절' } },

  { id:'q12_a', type:'checkbox', section:3, required:false, max:3, other:true, showIf:T_HELPER,
    title:'인력이 특히 부족했던 영역을 선택해주세요.',
    hint:'최대 3개까지 선택할 수 있습니다',
    options:[
      '전체 수련회 프로그램 진행','방송/음향','안전관리','학생 이동/통제',
      '사진/영상','물품관리','주방/식사','청소','숙소관리'
    ] },

  { id:'q12_1', type:'textarea', section:3, required:false, showIf:T_HELPER,
    title:'인력 부족 또는 배치 문제를 해결하기 위한 대안을 적어주세요.' },

  /* ── SECTION 4 · 공통 ── */
  { id:'q13', type:'checkbox', section:4, required:true, max:3, other:true,
    title:'[타임테이블 & 딜레이] 프로그램 진행 중 딜레이나 과부하가 발생했을 때, 현장에서 느낀 가장 주된 원인은 무엇이었습니까?',
    hint:'최대 3개까지 선택할 수 있습니다',
    options:[
      '프로그램 자체의 과도한 분량','프로그램 간 이동 및 준비 시간(버퍼 타임) 부족',
      '식사/샤워 등 생활 시간 부족','타임키퍼와 진행자 간의 시간 신호/소통 체계 미흡',
      '안내 방송 및 학생 통제 시스템 부족','담당자간의 일정 공유 부족',
      '예상하지 못한 현장의 변수','특별한 문제 없음'
    ] },

  { id:'q14', type:'checkbox', section:4, required:false, other:true,
    title:'다음 시간 요소 중 다음 수련회에서 조정이 필요하다고 생각하는 항목을 선택해주세요.',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '프로그램 시간','프로그램 사이 이동시간','출발 전 모임 시간 (오전 8시 30분)',
      '수련회 기간 중 학생 집합시간','식사시간','샤워/개인정비시간','자유시간',
      '취침시간','집회시간','GBS 시간','리플렉션 시간','특별히 조정할 필요 없음'
    ] },

  /* ── SECTION 5 · 마무리 (KPT + 근본원인) ── */
  { id:'q15_keep', type:'textarea', section:5, required:false,
    title:'(KEEP) 다음 수련회에서도 반드시 유지해야 한다고 생각하는 시스템 또는 프로그램은 무엇인가요?',
    hint:'가능하면 "왜 유지해야 하는지"도 적어주세요' },

  { id:'q15_problem', type:'textarea', section:5, required:false,
    title:'(PROBLEM) 이번 수련회에서 가장 중요하게 개선해야 한다고 생각하는 시스템상의 문제는 무엇인가요?',
    hint:'사람에 대한 것보다는 일정, 정보, 역할, 프로그램, 인력, 환경 등의 관점에서 적어주세요' },

  { id:'q15_root', type:'textarea', section:5, required:false,
    title:'(ROOT CAUSE) 위 문제의 가장 근본적인 원인은 무엇이라고 생각하나요?',
    hint:'예: 사전 계획 부족, 정보 공유 구조, 역할/책임 불명확, 일정 설계, 인력 배치, 매뉴얼 부족, 현장 의사결정 구조, 프로그램 설계' },

  { id:'q15_try', type:'textarea', section:5, required:false,
    title:'(TRY) 다음 수련회에서 실제로 시도해볼 수 있는 대안을 제안해주세요.' },

  { id:'q15_next', type:'textarea', section:5, required:false,
    title:'(NEXT ACTION) 다음 수련회 준비팀이 반드시 결정해야 할 한 가지가 있다면 무엇인가요?' },

  { id:'q15_free', type:'textarea', section:5, required:false,
    title:'마지막으로 수련회TF에 전달하고 싶은 의견이 있다면 자유롭게 적어주세요.' }
];

SURVEY.praise = [
  { id:'p1', type:'scale', section:1, required:true,
    title:'수련회를 준비하는 동안, 예배자로서 내 마음은 어떻게 준비되고 있었나요?',
    scale:{ min:1, max:5, minLabel:'거의 돌아보지 못했다', maxLabel:'꾸준히 준비했다' } },

  { id:'p2', type:'radio', section:1, required:true,
    title:'준비 기간에 개인적으로 기도하거나 말씀을 붙든 시간이 있었나요?',
    options:['거의 없었다','가끔 있었다','꾸준히 있었다'] },

  { id:'p3', type:'textarea', section:1, required:false,
    title:'팀으로 함께 기도하고 마음을 나눈 시간은 나에게 어떤 의미였나요?' },

  { id:'p4', type:'scale', section:1, required:true,
    title:"선곡과 콘티를 준비하며 '이 곡으로 무엇을 전하고 싶은지' 팀 안에서 충분히 나눴나요?",
    scale:{ min:1, max:5, minLabel:'거의 나누지 못했다', maxLabel:'충분히 나눴다' } },

  { id:'p5', type:'scale', section:2, required:true,
    title:"찬양을 인도하고 연주하는 동안, 나는 얼마나 '예배자'로 있었나요?",
    scale:{ min:1, max:5, minLabel:'내 역할·연주에만 집중했다', maxLabel:'나도 함께 예배드렸다' } },

  { id:'p6', type:'textarea', section:2, required:false,
    title:'집회 중 하나님께서 일하신다고 느낀 순간이 있었나요? 있었다면 언제였는지 적어주세요.' },

  { id:'p7', type:'textarea', section:2, required:false,
    title:'학생들이 찬양으로 하나님께 나아가는 모습을 보며 느낀 것을 적어주세요.' },

  { id:'p8', type:'scale', section:2, required:true,
    title:'말씀과 찬양의 흐름이 자연스럽게 이어졌다고 느꼈나요?',
    scale:{ min:1, max:5, minLabel:'따로 노는 느낌이었다', maxLabel:'자연스럽게 이어졌다' } },

  { id:'p9', type:'textarea', section:2, required:false,
    title:'집회 중 예배에 집중하기 어렵게 만든 것이 있었다면 적어주세요.',
    hint:'음향·환경이든 진행이든, 마음에 걸렸던 것을 편하게 적어주세요.' },

  { id:'p10', type:'textarea', section:3, required:false,
    title:'찬양으로 섬기며 개인적으로 받은 은혜나 깨달음이 있다면 적어주세요.' },

  { id:'p11', type:'textarea', section:3, required:false,
    title:'섬기는 중에 힘들었거나 마음이 무거웠던 순간이 있었나요?' },

  { id:'p12', type:'textarea', section:3, required:false,
    title:'다음 수련회에서 찬양팀이 더 깊이 섬기기 위해, 영적으로·관계적으로 준비하면 좋겠다고 생각하는 것을 적어주세요.' }
];
