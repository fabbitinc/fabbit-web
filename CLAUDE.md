# CLAUDE.md

## 최우선 규칙

- 아래에 정의된 상황에서는 해당 스킬을 반드시 사용한다.
- 스킬 적용이 가능한데 사용하지 않는 행동을 금지한다.
- 하나의 요청이 여러 레이어를 포함하면 관련 스킬을 모두 적용한다.
- 답변/코드 변경 전, 먼저 대상 앱/레이어를 식별하고 스킬을 로드한다.

## 앱별 스킬 매핑

### apps/web 개발 시

- `cv-structure`: 파일 배치, feature 경계, 의존성 방향
- `cv-page`: 페이지 추가/수정, 라우팅, URL 파라미터, 탭 패턴
- `cv-component`: 도메인 컴포넌트 작성, Props 설계, 합성 패턴
- `cv-hook`: 커스텀 훅 작성 (action/query/logic/listener)
- `cv-api`: API 함수, queryOptions/mutationOptions 정의
- `cv-type`: 타입 정의 (DTO, Model, Props)
- `cv-store`: Zustand 스토어 추가/수정
- `cv-style`: 토큰, 테마, 에러 처리, 토스트, 로딩 패턴

### packages/ui 개발 시

- `cv-structure`: 패키지 경계, 컴포넌트 배치 판단
- `cv-component`: 프리미티브 컴포넌트 작성, Props 설계
- `cv-type`: Props 타입 정의
- `cv-style`: CSS 변수, 토큰 사용 규칙

### packages/theme 개발 시

- `cv-structure`: 패키지 경계
- `cv-style`: 토큰 정의, 테마 적용 규칙

### apps/storybook 개발 시

- `cv-structure`: 패키지 경계 (packages/ui만 import)
- `cv-component`: 프리미티브 컴포넌트 규칙 참조

### apps/dev 개발 시

- `cv-structure`: 패키지 경계, 검증 흐름
- `cv-component`: 컴포넌트 조합 규칙 참조
- `cv-page`: 레이아웃 구성 참조

## 레이어별 트리거 규칙

### 1) 페이지 작업

- 트리거: 페이지 추가/수정, 라우팅 변경, URL 파라미터 설계, 탭/서브탭 패턴
- 반드시 사용할 스킬: `cv-page`

### 2) 컴포넌트 작업

- 트리거: 컴포넌트 추가/수정, Props 설계/변경, 합성 패턴 적용, packages/ui 승격
- 반드시 사용할 스킬: `cv-component`

### 3) 훅 작업

- 트리거: 커스텀 훅 추가/수정, action/query/logic/listener 훅 작성
- 반드시 사용할 스킬: `cv-hook`

### 4) API 작업

- 트리거: API 함수 추가/수정, queryOptions/mutationOptions 정의, DTO 변환
- 반드시 사용할 스킬: `cv-api`

### 5) 타입 작업

- 트리거: DTO/Model/Props 타입 추가/수정, 타입 변환 규칙 적용
- 반드시 사용할 스킬: `cv-type`

### 6) 스토어 작업

- 트리거: Zustand 스토어 추가/수정, 전역 상태 설계
- 반드시 사용할 스킬: `cv-store`

### 7) 스타일/횡단 관심사 작업

- 트리거: 토큰/색상 추가, 테마 변경, 에러 처리, 토스트/로딩 패턴
- 반드시 사용할 스킬: `cv-style`

### 8) 구조/배치 작업

- 트리거: 파일/폴더 배치 결정, feature 추가, 패키지 경계 변경, 의존성 방향 점검
- 반드시 사용할 스킬: `cv-structure`

## 다중 레이어 요청 처리 규칙

- 요청이 두 개 이상 레이어를 포함하면, 해당 스킬을 모두 적용한다.
- 적용 순서는 요청의 변경 시작점 기준으로 선택하되, 누락 없이 전부 반영한다.
- 리뷰/질문/설계 토론도 동일하게 스킬 규칙을 강제 적용한다.

## 예외 처리

- 스킬 파일이 없거나 읽을 수 없으면 즉시 그 사실을 보고하고, 가능한 범위에서 가장 가까운 규칙을 적용한다.
- 예외 상황에서도 "스킬 사용 시도" 자체는 생략하지 않는다.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.
