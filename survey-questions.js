/* 26년 여름수련회 평가 — 문항 정의
 * 원문: 26년 여름수련회 평가.pdf (2026-08)
 * 문구를 고칠 때는 이 파일만 수정한다. survey.html은 건드리지 않는다.
 */
const SURVEY = {};

SURVEY.meta = {
  student: {
    title: '학생 설문',
    sections: [
      // 미참석 학생에게도 보이는 섹션이라 '준비 과정' 같은 말을 넣지 않는다
      '기본 질문',
      '활동 & 교제 프로그램',
      '신앙 프로그램(예배/집회/성경공부)',
      '시간 배분 & 환경',
      '마무리 피드백',
      '수련회에 함께하지 못한 이야기',
      '다음에는 함께하기 위해',
      '지금 마음과 필요한 것'
    ],
    intro: '이 설문은 이름을 받지 않습니다. 익명으로 처리되니, 안심하고 설문에 응답해 주세요.'
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
    sections: ['섬기게 된 계기와 일정', '어떤 방식으로 섬기면 좋을지', '필요한 것과 다음 계획', '나눔'],
    intro: '이 설문은 익명입니다. 잘했는지 못했는지를 묻지 않습니다. 찬양으로 섬기시는 데 무엇이 부담이었고 무엇이 더 필요한지 알기 위한 설문입니다. 마지막에는 나누고 싶은 이야기를 적는 자리도 있습니다.'
  }
};

const PROGRAMS = ['물놀이', '원투원', '멘토-멘티', '레크레이션', '축복의 시간', '경주자의 밤', '종범이네(달란트) 문방구'];

/* 학생 설문은 '수련회 참석 여부'로 갈린다.
   survey.html 의 BRANCH_IDS 에 'attend' 가 들어 있어야 선택 즉시 화면이 다시 그려진다.
   아래 문자열은 attend 의 options 와 글자 그대로 같아야 한다. */
const S_WENT   = a => a.attend === '참석했어요';
const S_ABSENT = a => a.attend === '참석하지 못했어요';

SURVEY.student = [
  { id:'q1', type:'radio', section:1, required:true,
    title:'몇 학년인가요?',
    options:['1학년','2학년','3학년'] },

  // 분기 트리거. id 를 바꾸면 survey.html 의 BRANCH_IDS 도 함께 바꿔야 한다.
  { id:'attend', type:'radio', section:1, required:true,
    title:'이번 여름수련회에 참석했나요?',
    options:['참석했어요','참석하지 못했어요'] },

  { id:'q2', type:'radio', section:1, showIf:S_WENT, required:true,
    title:"이번 수련회는 이전 수련회와 다르게 '금·토·일'로 진행되었습니다. 이전의 일정과 비교했을 때 어땠나요?",
    options:[
      '아주 좋았다 (주일에 수련회 장소에서 바로 모여서 예배드리고 마무리해서 좋음)',
      '주일까지 이어진 일정이 상관없었다 / 둘 다 괜찮다',
      '조금 아쉬웠다 (다음에는 목·금·토 일정이 더 좋겠다)'
    ] },

  { id:'q2_1', type:'textarea', section:1, showIf:S_WENT, required:false,
    title:'그렇게 생각한 이유(장점이나 불편했던 점)를 간단히 적어주세요.',
    hint:'예: 피로도, 학업/학원 일정, 주일 예배 집중도 등' },

  { id:'q3', type:'scale', section:1, showIf:S_WENT, required:true,
    title:'수련회를 시작할 때, 마음이 얼마나 준비되고 기대되었나요?',
    scale:{ min:1, max:5, minLabel:'전혀 기대/준비되지 않음', maxLabel:'매우 기대되고 준비됨' } },

  { id:'q4', type:'rank', section:1, showIf:S_WENT, required:true, pick:3, other:true,
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
  { id:'q6', type:'rank', section:2, showIf:S_WENT, required:true, pick:3,
    title:'수련회 활동 중 나에게 가장 기억에 남았던 프로그램을 최대 3개 선택해 주세요. (1, 2, 3순위를 표시해주세요.)',
    hint:'누른 순서대로 1·2·3 번호가 붙습니다. 다시 누르면 취소됩니다.',
    options:PROGRAMS },

  // 원문 누락 — 평가 항목(행)이 PDF에 없어 프로그램 목록으로 채움 (설계문서 8.1)
  // 2026-08-08: '유익·즐거움' → '교제·가까워짐'으로 축 변경(사용자 요청).
  // q6(기억에 남는 Top3)와 역할이 갈려 프로그램 매트릭스 중복이 해소됐다.
  { id:'q5', type:'matrix', section:2, showIf:S_WENT, required:true,
    title:'각 프로그램이 선후배·친구들과 가까워지는 데 얼마나 도움이 되었나요?',
    hint:'1점: 전혀 도움이 되지 않았다 / 3점: 보통이다 / 5점: 매우 도움이 되었다',
    rows:PROGRAMS, cols:['1','2','3','4','5'] },

  { id:'q7', type:'radio', section:2, showIf:S_WENT, required:true,
    title:"'종범이네(달란트) 문방구'가 프로그램에 더 열심히 참여하게 만들었나요?",
    options:[
      '재미있었고 더 열심히 참여하게 되었다',
      '보통이었다',
      '상품이나 달란트 기준이 아쉽고 이용하기 불편했다'
    ] },

  { id:'q7_1', type:'textarea', section:2, showIf:S_WENT, required:false,
    title:'달란트 문방구의 물품, 달란트 획득 방식, 운영 시간 등 좋았던 점이나 개선되었으면 하는 점을 자유롭게 적어주세요.' },

  // 2026-08-08: '프로그램 개선점' → '관계 형성에 도움된 순간'으로 교체.
  // q6가 관계 형성을 점수로 묻고, 이 문항이 그 이유를 서술로 받는다.
  { id:'q8', type:'textarea', section:2, showIf:S_WENT, required:false,
    title:'이번 수련회에서 친구나 선후배와 가까워지는 데 특히 도움이 되었던 순간이나 활동이 있었다면 적어주세요.' },

  // 원래 q8이던 프로그램 개선점 문항. 위 문항과 축이 달라 별도 문항으로 되살렸다.
  { id:'q8_1', type:'textarea', section:2, showIf:S_WENT, required:false,
    title:"아쉬워서 다음에는 바꿨으면 하는 점이나, 꼭 다시 하고 싶은 프로그램이 있다면 적어주세요." },

  /* ── SECTION 3~5 전면 개편 (2026-08-08 사용자 요청) ──
     신앙 프로그램을 하나의 매트릭스로 묶고, '왜 집중이 어려웠는지'를
     복수선택으로 받아 원인을 집계 가능한 형태로 바꿨다.
     신앙 보완점 주관식(구 q12)은 복수선택 문항들이 대체하여 제거. */

  { id:'q9', type:'matrix', section:3, showIf:S_WENT, required:true,
    title:'다음 프로그램이 신앙적으로 의미 있었고, 집중할 수 있게 진행되었다고 느꼈나요?',
    hint:'1점 (전혀 그렇지 않았다) ~ 5점 (매우 그렇다)',
    rows:[
      '저녁집회 (찬양, 말씀, 기도)',
      'GBS (기도를 주제로 한 성경공부 시간)',
      '리플렉션 (하루를 돌아보고 묵상하며 정리하는 시간)'
    ],
    cols:['1','2','3','4','5'] },

  { id:'q9_1', type:'checkbox', section:3, showIf:S_WENT, required:false, other:true,
    title:'[저녁집회] 저녁집회에 집중하기 어려웠다면, 그 이유는 무엇이었나요?',
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

  { id:'q10', type:'scale', section:3, showIf:S_WENT, required:true,
    title:"[GBS] '기도'를 주제로 한 조별 성경공부(GBS) 내용과 나눔 시간은 기도에 대해 이해하는 데 도움이 되었나요?",
    scale:{ min:1, max:5, minLabel:'전혀 그렇지 않았다', maxLabel:'매우 그렇다' } },

  { id:'q10_1', type:'checkbox', section:3, showIf:S_WENT, required:false, other:true,
    title:'[GBS] 성경공부 시간에서 나아졌으면 하는 점을 골라주세요.',
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

  { id:'q11', type:'scale', section:3, showIf:S_WENT, required:true,
    title:'[리플렉션] 리플렉션은 하루를 돌아보고 하나님과 나의 상태를 생각하는 데 도움이 되었나요?',
    scale:{ min:1, max:5, minLabel:'전혀 그렇지 않았다', maxLabel:'매우 도움이 되었다' } },

  { id:'q13', type:'radio', section:4, showIf:S_WENT, required:true,
    title:'수련회 전체 일정은 어떻게 느껴졌나요?',
    options:[
      '여유로웠지만 조금 지루했다',
      '대체로 적당했다',
      '조금 빡빡했다',
      '많이 빡빡하고 피곤했다'
    ] },

  /* 주의: 이 척도는 점수가 아니라 '부족 ↔ 과다' 방향이 다른 5범주다.
     평균을 내면 "너무 부족" 절반 + "너무 길었다" 절반이 "적당"으로 뒤집혀
     정반대 결론이 난다. 반드시 분포로만 볼 것. (설계문서 8.2)
     cols 를 숫자로 쓰지 않는 이유도 이것이다 — 대시보드가 숫자 열일 때만
     평균을 내고, 문자 열이면 자동으로 분포로 그린다. */
  { id:'q14', type:'matrix', section:4, showIf:S_WENT, required:true,
    title:"아래 각 시간이 알맞았는지 골라주세요.",
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

  { id:'q15', type:'checkbox', section:4, showIf:S_WENT, required:false, other:true,
    title:"집회나 프로그램에 집중하기 어렵게 만든 것이 있었다면 골라주세요.",
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

  { id:'q16_keep', type:'textarea', section:5, showIf:S_WENT, required:false,
    title:'이것만큼은 꼭 유지해 주세요',
    hint:'프로그램뿐 아니라 일정, 분위기, 활동 무엇이든 좋아요' },

  { id:'q16_miss', type:'textarea', section:5, showIf:S_WENT, required:false,
    title:'이번 수련회에서는 이런 점이 아쉽기도 했고 불편했어요',
    hint:'사람보다는 프로그램, 일정, 안내, 환경 쪽으로 적어주면 좋아요' },

  { id:'q16_try', type:'textarea', section:5, showIf:S_WENT, required:false,
    title:'다음 수련회는 이렇게 해주세요, 이렇게 바꿔주세요' },

  /* ── 미참석 학생 전용 (SECTION 6~8) ──
     못 온 이유를 캐묻는 자리가 아니라, 왜 못 왔는지 이해하고
     다음에 함께 갈 방법을 찾고, 남아 있는 마음을 살피기 위한 문항들이다.
     대부분 선택 응답으로 두어 부담을 줄였다. */

  { id:'na1', type:'radio', section:6, required:true, showIf:S_ABSENT,
    title:'이번 수련회에 가고 싶은 마음은 어땠나요?',
    options:[
      '정말 가고 싶었는데 사정이 있어서 못 갔어요',
      '가고 싶은 마음이 조금 있었어요',
      '별로 가고 싶지 않았어요',
      '잘 모르겠어요'
    ] },

  { id:'na2', type:'checkbox', section:6, required:true, other:true, showIf:S_ABSENT,
    title:'수련회에 가지 못한 이유는 무엇이었나요?',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '학원·학교 일정 (시험, 보충수업 등)',
      '가족 일정 (여행, 행사 등)',
      '건강 문제',
      '비용이 부담돼서',
      '친한 친구가 안 가서',
      '낯설고 어색할 것 같아서',
      '단체 생활이 부담스러워서',
      '일정이 너무 길어서',
      '신앙적으로 마음이 내키지 않아서',
      '수련회가 어떤 건지 잘 몰라서',
      '특별한 이유는 없었어요'
    ] },

  { id:'na3', type:'textarea', section:6, required:false, showIf:S_ABSENT,
    title:'더 이야기하고 싶은 것이 있다면 편하게 적어주세요.' },

  { id:'na4', type:'checkbox', section:7, required:false, other:true, showIf:S_ABSENT,
    title:'어떤 점이 달라지면 다음에는 함께 갈 수 있을까요?',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '날짜를 훨씬 미리 알려주면 (학원·가족 일정을 조율할 수 있게)',
      '기간이 짧아지면',
      '비용이 줄어들면',
      '친한 친구와 같은 반이 되면',
      '프로그램을 미리 알 수 있으면',
      '담임 선생님이 미리 연락해 주시면',
      '가기 전에 미리 친해질 기회가 있으면',
      '일부만 참여하거나 중간에 합류할 수 있으면',
      '잘 모르겠어요'
    ] },

  { id:'na5', type:'scale', section:7, required:true, showIf:S_ABSENT,
    title:'다음 수련회에는 참여하고 싶은 마음이 있나요?',
    scale:{ min:1, max:5, minLabel:'전혀 없어요', maxLabel:'꼭 가고 싶어요' } },

  { id:'na6', type:'textarea', section:7, required:false, showIf:S_ABSENT,
    title:'다음 수련회가 어떤 모습이면 가고 싶어질까요?' },

  { id:'na7', type:'scale', section:8, required:false, showIf:S_ABSENT,
    title:'수련회가 끝난 뒤, 다녀온 친구들과 나 사이에 거리감을 느낀 적이 있나요?',
    scale:{ min:1, max:5, minLabel:'전혀 없었어요', maxLabel:'많이 느꼈어요' } },

  { id:'na8', type:'checkbox', section:8, required:false, other:true, showIf:S_ABSENT,
    title:'요즘 교회에 나올 때 마음은 어떤가요?',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '편하고 좋아요',
      '그럭저럭 괜찮아요',
      '조금 어색해요',
      '친구들과 거리감이 느껴져요',
      '나만 빠진 것 같아 아쉬워요',
      '잘 모르겠어요'
    ] },

  { id:'na9', type:'checkbox', section:8, required:false, other:true, showIf:S_ABSENT,
    title:'수련회에 못 간 친구들을 위해 교회에서 무엇을 해주면 좋을까요?',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '수련회에서 나눈 말씀이나 내용을 따로 나눠주는 시간',
      '못 간 친구들끼리 따로 모이는 시간',
      '담임 선생님과 따로 만나 이야기하는 시간',
      '수련회 사진·영상 공유',
      '다음 수련회 전에 미리 친해지는 모임',
      '특별히 필요 없어요'
    ] },

  { id:'na10', type:'textarea', section:8, required:false, showIf:S_ABSENT,
    title:'담임 선생님이나 교회에 하고 싶은 말이 있다면 자유롭게 적어주세요.' }
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
      '교사 전체 모임 (3주 동안 진행한 교사 모임)',
      '프로그램별 준비회의 (준비TF 모임, 담당자 모임)',
      '사전 공지 및 일정 공유',
      '교사용 자료/가이드',
      '수련회 전체 방향 및 목적 공유'
    ],
    cols:['1','2','3','4','5'] },

  { id:'q3', type:'textarea', section:1, required:false,
    title:'준비 과정에서 정보가 늦게 오거나 빠져서 현장에서 어려웠던 일이 있었다면 적어주세요.',
    hint:'무엇이 문제였는지, 그래서 어떤 일이 있었는지, 어떻게 하면 좋을지 순으로 적어주시면 좋습니다' },

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
    title:"[일정] '금·토·일'로 바뀐 일정이 학생들의 참여와 몰입, 주일예배 연결에 어떤 영향을 주었다고 보시나요?",
    scale:{ min:1, max:5, minLabel:'학생 인솔 및 주일 연계가 매우 힘들었다', maxLabel:'학생 참여 및 주일 연계에 매우 효과적이었다' } },

  { id:'q5_1', type:'textarea', section:2, required:false, showIf:T_HOMEROOM,
    title:'일정과 관련하여 실제 현장에서 느낀 장점이나 문제점이 있었다면 적어주세요.' },

  { id:'q6', type:'checkbox', section:2, required:true, max:3, showIf:T_HOMEROOM,
    title:'[활동 프로그램] 반 아이들과 친밀감을 형성하고 마음을 여는 데 가장 효과적이었던 프로그램을 선택해 주세요.',
    hint:'최대 3개까지 선택할 수 있습니다',
    options:PROGRAMS },

  { id:'q7', type:'matrix', section:2, required:true, showIf:T_HOMEROOM,
    title:'[신앙 프로그램] 학생들이 신앙 프로그램에 참여할 때 집중도는 어땠나요?',
    hint:'1점 (매우 낮았다) ~ 5점 (매우 높았다)',
    rows:['저녁집회','GBS','리플렉션'],
    cols:['1','2','3','4','5'] },

  { id:'q7_1', type:'checkbox', section:2, required:false, other:true, showIf:T_HOMEROOM,
    title:'학생들이 집중하거나 참여하기 어려웠던 이유가 있었다면 골라주세요.',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '피로도','시간대','프로그램 시간이 너무 길었음','프로그램 간 간격 부족',
      '이동/집합시간 부족','내용의 난이도','학생 간 분위기','장소/온도',
      '음향/조명','안내 부족','특별한 문제 없음'
    ] },

  { id:'q8', type:'scale', section:2, required:true, showIf:T_HOMEROOM,
    title:'[성경공부 자료] 미리 받으신 교사용 자료와 질문지, 사전 안내는 공과와 나눔을 이끌기에 충분했나요?',
    scale:{ min:1, max:5, minLabel:'매우 부족', maxLabel:'매우 충분' } },

  { id:'q8_1', type:'textarea', section:2, required:false, showIf:T_HOMEROOM,
    title:'성경공부·리플렉션 자료나 진행 방식에서 나아졌으면 하는 점을 적어주세요.' },

  /* ── SECTION 3 · 헬퍼/담당자 전용 ── */
  { id:'q9', type:'checkbox', section:3, required:false, other:true, showIf:T_HELPER,
    title:'[사전 준비] 맡으신 프로그램을 준비하며 어려웠던 점은 무엇이었나요?',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '준비 기간 부족','기획안 확정 지연','예산·물품 지원이나 구매 절차의 아쉬움',
      '교사 사이의 역할 분담과 소통 부족','다른 프로그램과의 일정 조율',
      '수련회 정보 부족','인력 부족','특별한 어려움 없음'
    ] },

  { id:'q11', type:'checkbox', section:3, required:false, other:true, showIf:T_HELPER,
    title:'[현장 섬김] 현장에서 맡은 일을 하며 어려움이 있었다면, 그 이유를 골라주세요.',
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
    title:'인력이 부족하거나 배치가 아쉬웠다면, 어떻게 하면 좋을지 적어주세요.' },

  /* ── SECTION 4 · 공통 ── */
  { id:'q13', type:'checkbox', section:4, required:true, max:3, other:true,
    title:'[일정 지연] 프로그램이 밀리거나 한꺼번에 몰렸을 때, 현장에서 느낀 주된 원인은 무엇이었나요?',
    hint:'최대 3개까지 선택할 수 있습니다',
    options:[
      '프로그램 자체의 과도한 분량','프로그램 사이 이동·준비 시간 부족',
      '식사/샤워 등 생활 시간 부족','시간을 챙기는 사람과 진행자 사이의 신호·소통 부족',
      '안내 방송이나 학생을 모으는 방식의 부족','담당자 사이의 일정 공유 부족',
      '예상하지 못한 현장의 변수','특별한 문제 없음'
    ] },

  { id:'q14', type:'checkbox', section:4, required:false, other:true,
    title:'다음 수련회에서 시간을 조정하면 좋겠다고 생각하는 것을 골라주세요.',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '프로그램 시간','프로그램 사이 이동시간','출발 전 모임 시간 (오전 8시 30분)',
      '수련회 기간 중 학생 집합시간','식사시간','샤워/개인정비시간','자유시간',
      '취침시간','집회시간','GBS 시간','리플렉션 시간','특별히 조정할 필요 없음'
    ] },

  /* ── SECTION 5 · 마무리 (KPT + 근본원인) ── */
  { id:'q15_keep', type:'textarea', section:5, required:false,
    title:'다음 수련회에서도 반드시 이어갔으면 하는 것은 무엇인가요?',
    hint:'제도, 프로그램, 준비 방식 무엇이든 좋습니다. 왜 그런지도 함께 적어주시면 좋습니다' },

  { id:'q15_problem', type:'textarea', section:5, required:false,
    title:'이번 수련회에서 가장 먼저 고쳐야 한다고 생각하는 문제는 무엇인가요?',
    hint:'사람보다는 일정, 정보 전달, 역할, 프로그램, 인력, 환경 쪽으로 적어주시면 좋습니다' },

  { id:'q15_root', type:'textarea', section:5, required:false,
    title:'그 문제가 생긴 근본 원인은 무엇이라고 보시나요?',
    hint:'예: 준비 기간 부족, 정보가 공유되는 방식, 역할과 책임이 불분명함, 일정 짜임새, 인력 배치, 안내 문서 부족, 현장에서 결정하는 방식' },

  { id:'q15_try', type:'textarea', section:5, required:false,
    title:'다음 수련회에서 실제로 해볼 만한 방법을 제안해주세요.' },

  { id:'q15_next', type:'textarea', section:5, required:false,
    title:'다음 수련회 준비팀이 가장 먼저 결정해야 할 한 가지는 무엇일까요?' },

  { id:'q15_free', type:'textarea', section:5, required:false,
    title:'그 밖에 수련회 준비팀에 전하고 싶은 말이 있다면 자유롭게 적어주세요.' }
];

/* 찬양팀 설문 — 2026-08-08 재개편.
   1차 개편에서 '예배자로서 내 마음이 준비되었나', '개인적으로 기도한 시간이 있었나' 처럼
   개인의 영성을 점수로 묻는 문항을 뒀는데, 익명 설문으로 개인 신앙을 평가하는 셈이라 걷어냈다.
   대신 팀 안에서의 협업, 다른 팀과의 손발, 그리고 무엇이 더 필요한지를 묻는다. */
/* 찬양팀 설문 — 2026-08-08 3차 개편.
   앞선 두 버전은 '연습이 충분했나', '소통이 잘 되었나', '협업이 원활했나' 처럼
   결국 찬양팀이 잘했는지를 점수로 묻는 구조였다. 평가가 아니라 지원이 목적이므로
   잘잘못을 묻는 문항을 전부 걷어내고, 부담이 된 지점과 필요한 것만 남겼다.
   아쉬웠던 점도 점수가 아니라 '무엇이 문제였는지' 선택지로만 받는다.

   SECTION 4(나눔과 기도)는 평가가 아니라 나누는 자리다.
   1차 개편에서 뺀 것은 '내 마음이 얼마나 준비되었나'를 점수로 매기는 문항이었고,
   여기 있는 은혜 나눔·기도제목은 척도 없이 자유 서술로만 받는다. 전부 선택 사항이다. */
SURVEY.praise = [
  { id:'p1', type:'radio', section:1, required:true,
    title:'수련회에서 찬양팀으로 섬긴 것은 이번이 몇 번째인가요?',
    hint:'처음 섬기시는 분들께 필요한 안내를 따로 준비하기 위한 문항입니다',
    options:['이번이 처음입니다','두세 번째입니다','여러 번 섬겼습니다'] },

  { id:'p2', type:'checkbox', section:1, required:true, other:true,
    title:'어떤 계기로 이번 수련회 찬양팀에 함께하시게 되었나요?',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '인도자나 팀원의 권유를 받아서',
      '담당 선생님의 요청을 받아서',
      '이전에도 섬겨와서 자연스럽게',
      '고등부 학생들을 위해 섬기고 싶어서',
      '찬양으로 섬기는 것이 좋아서',
      '사람이 필요하다는 것을 알게 되어서',
      '개인적인 결단이나 기도 응답으로'
    ] },

  { id:'p3', type:'radio', section:1, required:true,
    title:"이번 '금·토·일' 일정에 시간을 내시는 것은 어떠셨나요?",
    options:[
      '전 일정 참여에 무리가 없었다',
      '일정을 조정해서 겨우 맞췄다',
      '일부만 참여할 수 있었다',
      '시간을 내기가 많이 부담스러웠다'
    ] },

  { id:'p4', type:'checkbox', section:1, required:false, other:true,
    title:'시간을 내기 어려우셨다면, 무엇 때문이었나요?',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '직장·학업 일정',
      '가정 일정',
      '주일에 맡은 다른 사역',
      '오가는 거리와 이동 시간',
      '체력 부담',
      '비용 부담',
      '특별히 어렵지 않았다'
    ] },

  { id:'p5', type:'radio', section:1, required:true,
    title:'다음 수련회 일정은 어떻게 잡히면 좋을까요?',
    options:[
      "지금처럼 '금·토·일'이 좋다",
      "'목·금·토'가 더 낫다",
      '기간이 더 짧으면 좋겠다',
      '일부만 참여할 수 있으면 좋겠다',
      '어느 쪽이든 괜찮다'
    ] },

  { id:'p6', type:'radio', section:2, required:true,
    title:'찬양팀으로 섬길 때, 어떤 방식이 더 좋을까요?',
    options:[
      '찬양과 집회에만 집중하고, 나머지 시간에는 쉬거나 준비하고 싶다',
      '수련회 프로그램에도 학생들과 함께 참여하고 싶다',
      '상황에 따라 유연하게 정하면 좋겠다',
      '잘 모르겠다'
    ] },

  { id:'p7', type:'textarea', section:2, required:false,
    title:'그렇게 생각하신 이유가 있다면 적어주세요.' },

  // p8(준비 과정에서 아쉬웠던 점)은 2026-08-08 사용자 요청으로 제거.
  // 아래 p9(가장 필요한 것)가 같은 문제를 '무엇이 필요한가' 쪽에서 받는다.
  // p9(가장 필요한 것)도 2026-08-08 사용자 요청으로 제거.
  // 아래 p10(어떤 도움이 있으면 좋을지)이 같은 축을 이미 묻고 있어 중복이었다.
  { id:'p10', type:'checkbox', section:3, required:false, other:true,
    title:'어떤 도움이 있으면 더 편하게 섬기실 수 있을까요?',
    hint:'해당되는 것을 모두 골라주세요',
    options:[
      '찬양팀을 챙겨주는 담당 선생님',
      '리허설 시간을 일정에 미리 넣어주기',
      '이동이나 식사 시간 배려',
      '쉴 수 있는 공간 마련',
      '장비를 미리 점검해 주기',
      '집회 순서를 미리 알려주기',
      '연습 공간 예약을 도와주기',
      '특별히 필요한 도움은 없다'
    ] },

  { id:'p11', type:'radio', section:3, required:true,
    title:'다음에 다시 섬길 기회가 있다면 어떻게 하시겠어요?',
    options:[
      '다음에도 꼭 함께하고 싶다',
      '상황이 되면 함께하고 싶다',
      '다음에는 쉬고 싶다',
      '아직 잘 모르겠다'
    ] },

  { id:'p12', type:'textarea', section:4, required:false,
    title:'고등부 학생들과 함께 예배하며 느끼신 것이 있다면 나눠주세요.' },

  // p13(기도제목)은 2026-08-08 사용자 요청으로 제거.
  { id:'p14', type:'textarea', section:4, required:false,
    title:'그 밖에 수련회 준비팀에 전하고 싶은 말이 있다면 자유롭게 적어주세요.' }
];
