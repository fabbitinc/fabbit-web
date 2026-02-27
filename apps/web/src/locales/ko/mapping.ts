export default {
  // 페이지
  title: "The Bridge - AI 매핑",
  description:
    "AI가 원본 데이터와 표준 속성을 매핑했습니다. 확인하고 수정해 주세요.",

  // 섹션
  columnMapping: "컬럼 매핑",
  relationMapping: "관계 매핑",
  excluded: "제외됨",

  // 서머리 바
  approvalProgress: "승인 진행률",
  approveAll: "모두 승인",
  selectTarget: "타겟 선택",
  selectProperty: "속성 선택",
  createMapping: "매핑",

  // 관계 유형
  relType: {
    CONSISTS_OF: "구성",
    SUPPLIED_BY: "공급",
    DEFINED_BY: "정의",
    HAS_ITEM: "포함",
  },

  // 노드 레이블
  nodeLabel: {
    Part: "부품",
    Supplier: "공급사",
    Drawing: "도면",
    Project: "프로젝트",
  },

  // 온톨로지 속성명
  property: {
    // Part
    part_number: "품번",
    name: "부품명",
    revision: "리비전",
    material: "재질",
    unit: "단위",
    unit_price: "단가",
    specification: "규격",
    description: "설명",
    category: "분류",
    is_phantom: "팬텀 여부",
    lifecycle_state: "수명주기",
    lead_time_days: "리드타임(일)",
    // Supplier
    company_name: "업체명",
    code: "업체코드",
    contact: "담당자",
    country: "국가",
    contact_info: "연락처",
    lead_time: "납기(일)",
    // Drawing
    drawing_number: "도면번호",
    file_path: "파일경로",
    version: "버전",
    status: "상태",
    // Project
    project_code: "프로젝트코드",
    manager: "담당자",
    target_date: "목표일",
    // Relation properties
    quantity: "수량",
    sequence: "순서",
    reference_designator: "참조번호",
    find_number: "찾기번호",
    unit_cost: "단가",
  },
};
