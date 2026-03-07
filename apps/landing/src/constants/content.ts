export const NAV_ITEMS = [
  { label: "문제", href: "#problem" },
  { label: "제품 구조", href: "#solution" },
  { label: "적합 팀", href: "#target" },
  { label: "도입 방식", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

export const HERO = {
  eyebrow: "제조 데이터 플랫폼",
  headline: "도면·BOM 기준본\n하나로 정리하고\n생산까지 연결하세요",
  sub: "도면 업로드, 구조화 BOM, 리비전 추적, 생산 연결 포인트를 하나의 흐름으로 정리하는 제조 데이터 플랫폼. 실제 사례와 수치가 들어오기 전에도 제품 구조와 운영 감도는 먼저 설계할 수 있습니다.",
  badges: ["도면 업로드", "구조화 BOM", "리비전 추적", "생산 연결 설계"],
  focusCards: [
    {
      label: "입력 장면",
      value: "도면 업로드",
      detail: "업로드와 인식이 한 장면에서 이어집니다.",
    },
    {
      label: "기준본",
      value: "구조화 BOM",
      detail: "엑셀 대신 시스템 기준본이 중심이 됩니다.",
    },
    {
      label: "변경 흐름",
      value: "변경 추적",
      detail: "승인과 후속 연결이 하나의 흐름으로 이어집니다.",
    },
  ],
} as const;

export const SPOTLIGHT = {
  title: "업로드 직후 바로\n기준본이 만들어지는 경험",
  description:
    "첫 번째 시나리오는 늘 가장 단순해야 합니다. 도면을 올리고, AI가 읽고, 구조화된 BOM이 만들어지고, 검토와 변경 연결로 이어지는 흐름을 한 장면으로 보여줍니다.",
  steps: ["도면 업로드", "AI 인식", "BOM 생성", "검토 연결"],
  bullets: [
    "추출 결과가 파일이 아니라 시스템 상태로 남는 경험을 강조",
    "업로드 캔버스와 결과 패널을 함께 배치해 첫 장면의 밀도를 확보",
    "실제 캡처가 없어도 충분히 제품처럼 보이는 화면 리듬을 우선 설계",
  ],
} as const;

export const PROBLEMS = [
  {
    title: "수동 전사",
    quote: "도면을 보고 다시 입력하는 흐름",
    detail: "입력 작업이 반복될수록 기준본은 파일 단위로 흩어지고 운영 비용은 커집니다.",
    tag: "입력",
  },
  {
    title: "최신본 혼선",
    quote: "폴더와 메신저에 흩어진 기준본",
    detail: "파일 위치와 리비전이 분산되면 누가 최신본을 보고 있는지 설명하기 어려워집니다.",
    tag: "리비전",
  },
  {
    title: "변경 반영 지연",
    quote: "설계 변경이 현장으로 늦게 닿는 흐름",
    detail: "변경 요청, 승인, 반영 상태가 분리될수록 운영 리듬이 끊깁니다.",
    tag: "흐름",
  },
  {
    title: "생산 피드백 단절",
    quote: "현장 이슈가 설계 기준본으로 돌아오지 않는 구조",
    detail: "설계와 생산이 분리된 조직일수록 이후 연결 구조를 먼저 보여주는 편이 좋습니다.",
    tag: "피드백",
  },
] as const;

export const BEFORE_AFTER = {
  before: [
    { label: "도면", value: "폴더 / 메신저 / 메일" },
    { label: "BOM", value: "엑셀 / 로컬 파일" },
    { label: "변경", value: "구두 / 메일 체인" },
    { label: "생산", value: "수기 보고 / 별도 시스템" },
  ],
  after: [
    { label: "입력", value: "도면 업로드" },
    { label: "기준본", value: "구조화 BOM" },
    { label: "추적", value: "변경 요청 / 리비전" },
    { label: "확장", value: "생산 연결 / 후속 데이터" },
  ],
  checkpoints: [
    "입력, 기준본, 추적, 확장 순서가 같은 화면에서 이어지는 구조",
    "이전과 이후의 시각 톤을 명확히 갈라 전환감을 강화",
    "세부 수치 전에도 구조 변화가 먼저 읽히는 보드 중심 구성",
  ],
  summary:
    "랜딩 초반에는 실제 수치보다도 데이터가 어떤 방식으로 하나의 기준본으로 합쳐지는지 한눈에 읽히는 구조가 더 중요합니다.",
} as const;

export const SOLUTION_STEPS = [
  {
    step: 1,
    title: "도면 입력 장면을 먼저 보여줍니다",
    description:
      "첫 진입 화면은 업로드, 인식, 등록이라는 흐름이 즉시 읽히도록 단순하고 크게 보여줘야 합니다.",
    status: "구현" as const,
    compare:
      "단순 카드 나열 대신, 큰 화면 하나와 보조 패널을 조합해 제품 스케일을 먼저 전달합니다.",
    points: [
      "업로드 캔버스",
      "인식 결과 리스트",
      "상태 배지",
    ],
  },
  {
    step: 2,
    title: "구조화된 기준본을 중심에 둡니다",
    description:
      "문제 섹션 이후에는 기준본 워크스페이스가 모든 정보의 중심처럼 보여야 합니다.",
    status: "구현" as const,
    compare:
      "문제 카드만 보여주면 평평해집니다. 기준본 워크스페이스를 크게 두고, 오른쪽에 단계 설명을 쌓아 리듬을 만듭니다.",
    points: [
      "트리/테이블 혼합 뷰",
      "리비전 상태",
      "연결된 메타 데이터",
    ],
  },
  {
    step: 3,
    title: "확장 영역은 로드맵 톤으로 분리합니다",
    description:
      "생산 연결, 품질, 후속 운영 기능은 현재 구현과 다른 톤으로 분리해 과장 없이 보여주는 편이 낫습니다.",
    status: "준비 중" as const,
    compare:
      "준비 중인 기능은 실화면처럼 보이게 만들지 말고 와이어프레임과 로드맵 카드로 처리합니다.",
    points: [
      "와이어프레임 프리뷰",
      "확장 영역 칩",
      "도입 순서 설명",
    ],
  },
] as const;

export const PRODUCT_SCREENS = [
  {
    title: "프로젝트 / 업로드 워크스페이스",
    message: "가장 큰 화면으로 제품 첫 인상을 잡는 자리",
    status: "구현" as const,
    layout: "workspace" as const,
  },
  {
    title: "BOM 트리 / 상세 패널",
    message: "구조화된 기준본이 어떤 밀도로 보일지 설명하는 자리",
    status: "구현" as const,
    layout: "tree" as const,
  },
  {
    title: "변경 요청 / 승인 타임라인",
    message: "설계 변경 흐름과 히스토리를 보여주는 자리",
    status: "구현" as const,
    layout: "timeline" as const,
  },
  {
    title: "생산 연결 로드맵",
    message: "미구현 영역은 로드맵형 와이어프레임으로 처리하는 자리",
    status: "준비 중" as const,
    layout: "roadmap" as const,
  },
] as const;

export const COVERAGE = {
  lanes: [
    {
      label: "현재 기준본",
      note: "지금 화면에 올릴 수 있는 영역",
      items: ["DWG/PDF 도면", "부품", "BOM", "공급사", "변경 요청", "프로젝트"],
    },
    {
      label: "연결 데이터",
      note: "기준본 주변을 두껍게 만드는 영역",
      items: ["대시보드", "리비전", "이슈", "담당자", "승인 상태"],
    },
    {
      label: "확장 예정",
      note: "로드맵 또는 와이어프레임 톤으로 분리",
      items: ["작업지시", "생산실적", "품질", "설비", "원가 흐름"],
    },
  ],
} as const;

export const TARGET_FIT = {
  profiles: [
    {
      title: "대표 / 공장 책임자",
      summary: "도입 난이도와 운영 안정성을 빠르게 보고 싶은 팀",
      bullets: ["엑셀 의존도 축소", "기준본 일원화", "도입 리스크 최소화"],
    },
    {
      title: "설계 / 생산 팀장",
      summary: "변경 전파와 협업 구조를 정리하고 싶은 팀",
      bullets: ["리비전 흐름 정리", "승인 상태 노출", "협업 경로 시각화"],
    },
    {
      title: "설계 엔지니어 / 생산기술",
      summary: "반복 입력과 검색 시간을 줄이고 싶은 팀",
      bullets: ["업로드 중심 진입", "검색 가능한 BOM", "피드백 연결"],
    },
  ],
  decisionSignals: [
    "ERP는 있으나 도면·BOM은 별도 파일로 운영",
    "리비전 체계가 약해 최신본 전달 이슈가 반복",
    "설계-생산 연결을 한 번에 설명할 랜딩이 필요한 단계",
  ],
  notFit: [
    "도면/BOM 비중이 낮은 조직",
    "이미 엔터프라이즈 PLM이 깊게 정착한 조직",
    "셀프서브 가격표만 빠르게 보고 싶은 유입",
  ],
} as const;

export const ADOPTION_STAGES = [
  {
    name: "파일럿",
    title: "핵심 장면 검증",
    description: "첫 도입은 가격표보다, 어떤 장면을 먼저 검증할지 정리하는 단계가 더 중요합니다.",
    deliverables: ["도면 업로드 흐름", "기준본 화면 정의", "초기 운영 시나리오"],
    highlighted: true,
  },
  {
    name: "팀 확장",
    title: "협업 구조 확장",
    description: "기준본과 변경 흐름이 설계/생산/구매까지 읽히도록 정보 구조를 넓히는 단계입니다.",
    deliverables: ["역할별 화면 분기", "상태 관리 규칙", "승인/이슈 흐름"],
    highlighted: false,
  },
  {
    name: "엔터프라이즈 연동",
    title: "확장 영역 연결",
    description: "생산, 품질, 후속 데이터 연결처럼 아직 열려 있는 영역을 로드맵으로 설계하는 단계입니다.",
    deliverables: ["확장 로드맵", "준비 중 화면 처리", "추가 데이터 모델 자리"],
    highlighted: false,
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "실제 수치와 사례가 정해지지 않아도 먼저 보여줄 수 있나요?",
    a: "가능합니다. 먼저 제품 구조와 화면 리듬을 설계하고, 이후에 실제 수치와 사례를 각 슬롯에 교체하는 편이 일반적으로 더 빠릅니다.",
  },
  {
    q: "실제 제품 화면이 없으면 어떤 화면을 넣어야 하나요?",
    a: "실제 캡처가 없을 때는 스켈레톤, 상태 배지, 테이블/트리/타임라인 같은 제품형 프레임을 먼저 넣는 편이 좋습니다.",
  },
  {
    q: "요금이 미정이면 어떤 정보를 먼저 보여주는 편이 좋나요?",
    a: "실제 가격표보다 파일럿, 팀 도입, 확장 구조처럼 도입 단계를 먼저 보여주는 편이 안전합니다.",
  },
  {
    q: "엔터프라이즈급 랜딩은 무엇에서 차이가 나나요?",
    a: "실화면 여부도 중요하지만, 더 큰 차이는 첫 화면의 무게감, 제품 증거 구간의 밀도, 전환 블록의 완성도에서 납니다.",
  },
  {
    q: "나중에 실제 카피와 화면으로 바꾸기 쉬운 구조인가요?",
    a: "네. 이번 구조는 섹션 위계와 화면 슬롯을 먼저 정리했기 때문에, 실제 캡처와 문구를 넣어도 큰 구조 변경 없이 교체할 수 있습니다.",
  },
] as const;

export const PILOT_SECTORS = [
  {
    name: "금속가공",
    focus: "다품종 수주품과 부품 구조가 자주 바뀌는 시나리오",
    metrics: ["입력 시간 단축 자리", "최신본 전달 검증", "도면 검색 흐름"],
  },
  {
    name: "기계장비",
    focus: "프로젝트 단위로 도면과 변경 요청이 쌓이는 시나리오",
    metrics: ["리비전 관리", "승인 흐름", "협력사 커뮤니케이션"],
  },
  {
    name: "전기장비",
    focus: "부품 추적성과 후속 생산 연결이 중요한 시나리오",
    metrics: ["부품 탐색", "이슈 히스토리", "확장 로드맵"],
  },
] as const;

export const FINAL_FORM_FIELDS = [
  { label: "회사명", placeholder: "예: 에이스정밀" },
  { label: "업종", placeholder: "예: 금속가공 / 기계장비 / 전기장비" },
  { label: "현재 운영 방식", placeholder: "예: 엑셀 + 폴더 + ERP" },
  { label: "가장 큰 문제", placeholder: "예: 최신본 혼선 / 변경 반영 지연" },
  { label: "연락처", placeholder: "이메일 또는 전화번호" },
  { label: "추가 메모", placeholder: "현재 운영 맥락이나 검토 중인 범위를 적어주세요", wide: true },
] as const;
