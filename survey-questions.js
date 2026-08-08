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
      '시간 배분 & 타임테이블',
      '마무리 피드백 (환경 & 개선점)'
    ],
    intro: '이 설문은 이름을 받지 않습니다. 반별 통계로만 집계하며, 개별 응답은 담임 선생님께 공개되지 않습니다.'
  },
  teacher: {
    title: '교사 설문',
    sections: [
      '기본 질문 및 역할 선택',
      '[담임선생님 전용] 학생 인솔 & 관계 케어 피드백',
      '[헬퍼 / 담당자 전용] 프로그램 기획 & 현장 운영 피드백',
      '[공통] 전체 진행, 타임테이블 & 시스템 개선 (모든 교사 응답)'
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

  { id:'q9', type:'scale', section:3, required:true,
    title:'[저녁집회] 저녁집회 시간(찬양, 말씀, 기도)은 하나님께 더 깊이 집중하고 은혜를 누리기에 적절했나요?',
    scale:{ min:1, max:5, minLabel:'집중하기 힘들고 아쉬웠다', maxLabel:'매우 몰입되고 은혜로웠다' } },

  { id:'q10', type:'scale', section:3, required:true,
    title:"[GBS] '기도'를 주제로 한 조별 성경공부(GBS) 내용과 나눔 시간은 기도에 대해 이해하는 데 도움이 되었나요?",
    scale:{ min:1, max:5, minLabel:'내용이나 진행이 아쉬웠다', maxLabel:'매우 이해하기 쉽고 유익했다' } },

  { id:'q11', type:'scale', section:3, required:true,
    title:'[리플렉션] 하루를 마무리하며 진행된 리플렉션(묵상 및 정리) 시간과 구성은 어땠나요?',
    scale:{ min:1, max:5, minLabel:'시간이 유익하지 않았다', maxLabel:'하루를 정돈하는 데 큰 도움이 되었다' } },

  { id:'q12', type:'textarea', section:3, required:false,
    title:"신앙 프로그램(저녁집회, GBS, 리플렉션)에 더 깊이 집중하고 은혜를 누릴 수 있도록, 다음 수련회 때 '보완하거나 바꾸고 싶은 점'이 있다면 자유롭게 적어주세요." },

  { id:'q13', type:'radio', section:4, required:true,
    title:'수련회 전체 타임테이블(일정 진행 속도 및 피로도)은 어땠나요?',
    options:['적당했다','조금 타이트해서 피곤했다','쉬는 시간이 너무 길거나 지루했다'] },

  // 주의: 점수가 아니라 방향이 다른 3범주다. 평균을 내면 안 된다 (설계문서 8.2)
  { id:'q14', type:'matrix', section:4, required:true,
    title:"아래 각 수련회 요소별 '시간 배분'은 적절했는지 평가해 주세요.",
    rows:['프로그램 사이 휴식시간','집회시간 (찬양+말씀)','집회 후 기도시간','깊은 교제를 할 수 있는 시간 (원투원/멘토멘티 등)','GBS / 리플렉션'],
    cols:['부족했다','적당했다','너무 길었다'] },

  { id:'q15', type:'textarea', section:5, required:false,
    title:"집회나 프로그램 참여 시 집중을 방해했던 '환경적 요소(조명, 에어컨/온도, 좌석 배치, 마이크/음향 등)'가 있었다면 적어주세요." },

  { id:'q16', type:'textarea', section:5, required:false,
    title:'다음 수련회를 준비하는 선생님들께 "이것만큼은 꼭 유지해 주세요!" 또는 "이건 꼭 시스템을 바꿔주세요!" 하는 점을 자유롭게 적어주세요.' }
];

const T_HOMEROOM = a => a.q4 === '담임 교사' || a.q4 === '담임 + 헬퍼 겸임';
const T_HELPER   = a => a.q4 === '헬퍼 / 프로그램 담당 교사' || a.q4 === '담임 + 헬퍼 겸임';

SURVEY.teacher = [
  // 원문은 '선생님의 성함을 적어주세요' — 익명 운영 결정에 따라 교체 (설계문서 8.1)
  { id:'q1', type:'radio', section:1, required:true,
    title:'고등부에서 섬기신 기간은 얼마나 되셨나요?',
    options:['올해가 처음','1~2년','3~5년','5년 이상'] },

  { id:'q2', type:'scale', section:1, required:true,
    title:'선생님께서는 수련회 사전 준비 과정으로 교사 기도회, 전체 기도회, 릴레이 기도, 교사 모임등이 수련회를 준비하는 과정에서 얼마나 도움이 되었나요?',
    scale:{ min:1, max:5, minLabel:'전혀 안 됨', maxLabel:'매우 크게 도움 됨' } },

  { id:'q3', type:'textarea', section:1, required:false,
    title:'수련회 사전 준비과정에서 정보공유가 늦거나, 누락되거나, 오해가 있어서 당황했던 점이 있었다면 무엇이며, 어떻게 개선하면 좋을까요?' },

  // 원문의 "(선택 시 → SECTION 2로 이동)" 등 괄호 라우팅 안내는 제거 — 웹 폼은 아래 showIf로
  // 실제 분기하므로 응답자에게 섹션 이동 안내를 보여줄 필요가 없음 (선택지 문구 자체는 원문 그대로)
  { id:'q4', type:'radio', section:1, required:true,
    title:'이번 수련회에서 맡으신 주요 역할은 무엇인가요?',
    options:['담임 교사','헬퍼 / 프로그램 담당 교사','담임 + 헬퍼 겸임'] },

  { id:'q5', type:'scale', section:2, required:true, showIf:T_HOMEROOM,
    title:"[일정 체감] '금·토·일' 일정 전환이 학생들의 참여율, 피로도, 주일 예배 연계성에 미친 영향은 어떠했나요?",
    scale:{ min:1, max:5, minLabel:'학생 인솔 및 주일 연계가 매우 힘들었다', maxLabel:'학생 참여 및 주일 연계에 매우 효과적이었다' } },

  { id:'q5_1', type:'textarea', section:2, required:false, showIf:T_HOMEROOM,
    title:'현장에서 느낀 장점이나 보완이 필요한 피로도/일정 관련 의견을 적어주세요.' },

  { id:'q6', type:'checkbox', section:2, required:true, max:3, showIf:T_HOMEROOM,
    title:'[활동 프로그램] 반 아이들과 친밀감을 형성하고 마음을 여는 데 가장 효과적이었던 프로그램 Top 3를 선택해 주세요.',
    options:PROGRAMS },

  { id:'q7', type:'scale', section:2, required:true, showIf:T_HOMEROOM,
    title:'[신앙 프로그램] 저녁집회, GBS, 리플렉션 진행 시 반 학생들의 영적 집중도와 몰입도는 어떠했나요?',
    scale:{ min:1, max:5, minLabel:'산만하고 집중시키기 힘들었다', maxLabel:'매우 몰입하고 은혜를 깊이 누렸다' } },

  { id:'q8', type:'scale', section:2, required:true, showIf:T_HOMEROOM,
    title:'[GBS/리플렉션 가이드] 사전에 공유된 교사용 가이드북, 질문지, 사전 모임 안내는 담임으로서 공과 및 나눔을 인도하기에 충분했나요?',
    scale:{ min:1, max:5, minLabel:'가이드가 아쉽거나 사전 공유가 늦었다', maxLabel:'방향성이 명확하고 나눔에 큰 도움이 되었다' } },

  { id:'q8_1', type:'textarea', section:2, required:false, showIf:T_HOMEROOM,
    title:'교재 내용이나 나눔 가이드에서 다음 수련회 때 보완되었으면 하는 점(난이도, 시간 등)을 적어주세요.' },

  { id:'q9', type:'radio', section:3, required:true, other:true, showIf:T_HELPER,
    title:'[사전 준비] 담당하신 프로그램/업무를 준비하는 과정에서 발생한 가장 큰 어려움이나 난감했던 것은 무엇이었나요?',
    options:[
      '준비 기간 부족 및 기획안 확정 지연',
      '예산 / 물품 지원 및 구매 프로세스 아쉬움',
      '스태프 간 역할 분담(R&R) 및 소통 미흡'
    ] },

  { id:'q10', type:'textarea', section:3, required:false, showIf:T_HELPER,
    title:'[달란트 문방구 운영] 달란트 지급 기준, 물품 준비, 운영 시간 등 현장 진행에서 발견된 문제점과 차기 운영 시 적용할 개선안을 적어주세요.',
    hint:'예시: (문제점) 밤늦게 진행되어 피로도 누적 / (대안) 둘째 날 오후 자유시간에 매점 형태로 분산 운영' },

  // 원문에 응답 형식 미지정 — 주관식으로 구현 (설계문서 8.1)
  // 승인된 수정은 '헬퍼로써' → '헬퍼로서' 오타 정정 하나뿐. '섬길때'(붙여쓰기)와 '생각하는가?' 어미는 원문 그대로.
  { id:'q11', type:'textarea', section:3, required:false, showIf:T_HELPER,
    title:'[섬김의 영역] 헬퍼로서 섬길때 자신의 역할이 무엇인지 분명히 알고, 그것에 따라 참여하였다고 생각하는가?' },

  { id:'q12', type:'textarea', section:3, required:false, showIf:T_HELPER,
    title:'[인력 및 섬김 배치] 프로그램 진행 시 스태프/헬퍼 배치가 적재적소에 이루어졌나요? 부족했던 영역과 해결 대안을 적어주세요.',
    hint:'예: 방송/음향, 안전/이동 통제, 물품 관리, 주방/청소 등 인력이 부족했던 영역과 보완 아이디어' },

  { id:'q13', type:'radio', section:4, required:true,
    title:'[타임테이블 & 딜레이] 프로그램 진행 중 딜레이나 과부하가 발생했을 때, 현장에서 느낀 가장 주된 원인은 무엇이었습니까?',
    options:[
      '프로그램 자체의 과도한 분량',
      '프로그램 간 이동 및 준비 시간(버퍼 타임) 부족',
      '타임키퍼와 진행자 간의 시간 신호/소통 체계 미흡',
      '안내 방송 및 학생 통제 시스템 부족'
    ] },

  { id:'q14', type:'textarea', section:4, required:false,
    title:'[현장 환경] 집회 및 프로그램 진행 시 학생들의 집중을 방해했던 환경적 요인(조명, 에어컨/온도, 음향, 좌석 배치 등)과 개선안을 적어주세요.' },

  // 원문 Q15는 도입 문장 하나 아래 두 칸(유지/대안)으로 구성됨. 입력 UI 편의를 위해
  // 문항 2개(q15_keep/q15_try)로 나눔 — 도입 문장은 두 문항의 hint로 복원해 유지 (설계 의도)
  { id:'q15_keep', type:'textarea', section:4, required:false,
    title:'[최종 KPT 피드백] 다음 수련회에서도 꼭 유지했으면 하는 시스템/프로그램:',
    hint:'수련회TF 회의에 전달할 핵심 피드백을 적어주세요.' },

  { id:'q15_try', type:'textarea', section:4, required:false,
    title:'[최종 KPT 피드백] 문제점 해결을 위해 다음 수련회에서 꼭 바꿨으면 하는 대안:',
    hint:'수련회TF 회의에 전달할 핵심 피드백을 적어주세요.' }
];

/* 찬양팀 설문 — 2026-08-08 전면 개편.
 * 이전 버전은 연습 횟수·악보 공유·리허설 시간·음향·무대 조명을 묻는 운영 점검표였다.
 * "잘했는지 못했는지"가 아니라 신앙적·예배적으로 어떤 시간이었는지를 돌아보는 쪽으로 바꿨다.
 * 파트 선택은 뺐다(집계 의미가 적고, 인원이 적어 오히려 익명성을 해친다).
 * 음향·환경 이슈는 p9 하나로 흡수했다 — 평가표가 되지 않으면서도 실무 문제는 자연히 적히게. */
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
