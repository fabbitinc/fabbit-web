---
name: cv-component
description: 프론트엔드 컴포넌트 작성 규칙을 적용한다. packages/ui 프리미티브, packages/components 도메인 조합, apps/web 페이지 컴포넌트의 3티어 구분, Props 설계, 합성 패턴, 렌더링 책임 경계 정리가 필요할 때 사용한다. 컴포넌트 추가/수정, Props 인터페이스 설계, 컴포넌트 분리/합성 작업에서 사용한다.
---

# Component Conventions

## 목표

- 컴포넌트를 렌더링 전용 계층으로 유지하라.
- 3티어(packages/ui → packages/components → apps/web) 컴포넌트 책임을 명확히 분리하라.
- 이 스킬은 컴포넌트 작성 규칙만 다루고 다른 레이어의 코드 작성 규칙은 다루지 마라.

## 3티어 컴포넌트 구조

| 티어        | 위치                       | 역할                                            | 의존                                                | 예시                                      |
| ----------- | -------------------------- | ----------------------------------------------- | --------------------------------------------------- | ----------------------------------------- |
| 프리미티브  | `packages/ui/src/`         | 도메인 무관, props만으로 동작하는 UI 빌딩 블록  | packages/theme만                                    | Button, Input, Combobox, Dialog, Badge    |
| 도메인 조합 | `packages/components/src/` | 도메인 UI 조합. props-only, 순수 렌더링         | packages/ui, packages/theme                         | IssueCard, MemberSelector, ProjectSidebar |
| 페이지/연결 | `apps/web/src/`            | hook/store로 데이터를 가져와 도메인 조합에 주입 | packages/components, packages/ui, 내부 hooks/stores | IssuePage, IssueListContainer             |

### 티어 간 핵심 차이

- **packages/ui**: 도메인 개념을 전혀 모른다. `string`, `number`, `ReactNode` 등 제네릭 타입만 사용.
- **packages/components**: 도메인 타입(`IssueModel` 등)을 알지만, 데이터를 직접 가져오지 않는다. 모든 데이터는 props로 받는다. API/store/React Query 금지.
- **apps/web**: hook으로 데이터를 가져와 `packages/components`에 props로 주입한다.

## 네이밍 규칙

- 컴포넌트: `PascalCase` (`IssueCard`, `MemberSelector`)
- 파일명: `kebab-case.tsx` (`issue-card.tsx`, `member-selector.tsx`)
- Props: `{Component}Props` (`IssueCardProps`)
- 내보내기: `named export`를 사용하라. `default export`를 금지한다.

## packages/ui 프리미티브 규칙

- API, store, React Query를 import하지 마라.
- 도메인 타입(`IssueModel`, `MemberModel` 등)을 참조하지 마라.
- Props는 제네릭 또는 primitive 타입(`string`, `number`, `boolean`, `ReactNode`)만 사용하라.
- 데이터 소스를 모르게 하라. 데이터는 props/callback으로만 받아라.
- `data-slot` 속성으로 스타일링 훅 포인트를 제공하라.
- `cn()` 유틸리티로 className을 병합하라. 인라인 스타일을 최소화하라.
- `packages/theme`의 CSS 변수만 사용하라. hex/rgb 직접 사용을 금지한다.

## packages/components 도메인 조합 규칙

- `packages/ui` 프리미티브를 조합해 도메인 UI를 구성하라.
- 도메인 타입(`IssueModel` 등)을 Props로 받을 수 있다. 단, 타입은 `packages/components` 내부에 정의하거나 공유 타입 패키지에서 가져와라.
- API, store, React Query를 import하지 마라. 모든 데이터는 props로 받아라.
- 콜백(onEdit, onDelete 등)도 props로 받아라. 내부에서 API를 호출하지 마라.
- mock 데이터로 storybook에서 독립적으로 테스트 가능해야 한다.
- `packages/theme`의 CSS 변수만 사용하라.

## apps/web 페이지/연결 컴포넌트 규칙

- `packages/components`의 도메인 조합을 import해 사용하라.
- hook 호출을 허용한다 (query hook, logic hook, store 접근).
- hook으로 데이터를 가져와 `packages/components`에 props로 주입하라.
- 직접 API 호출(`fetch`, `axios`)을 금지한다. 반드시 hook을 통해 접근하라.
- 페이지 컴포넌트는 데이터 로딩 + 컴포넌트 조합만 하라. 렌더링 로직을 최소화하라.

## Props 설계 규칙

- Props는 컴포넌트가 외부에 공개하는 최소 계약만 포함하라.
- 내부 상태를 Props로 노출하지 마라.
- 콜백 props: `on{Event}` 네이밍 (`onClick`, `onSelect`, `onChange`)
- boolean props: 긍정형 (`isOpen`, `isDisabled`). 부정형(`isNotVisible`)을 금지한다.
- children을 적극 활용하라. 슬롯이 여러 개면 named render props 또는 compound pattern을 사용하라.
- Props 타입이 5개를 넘으면 관련 props를 객체로 그룹핑하거나 compound 패턴을 검토하라.

## 합성(Composition) 패턴

### Compound Component

여러 하위 컴포넌트가 암묵적 상태를 공유할 때 사용하라.

- Context로 상태를 공유하라.
- 루트 컴포넌트에 하위 컴포넌트를 dot notation으로 연결하라.
- 적용 기준: 하위 요소의 순서/조합이 유연해야 할 때.

### Render Props / Slot

외부에서 렌더링을 주입할 때 사용하라.

- `render{Name}` 또는 `{name}Slot` props로 명명하라.
- 적용 기준: 내부 데이터를 외부가 자유롭게 렌더링해야 할 때.

### 합성 판단 기준

| 상황                          | 패턴                         |
| ----------------------------- | ---------------------------- |
| boolean props가 3개 이상 증가 | compound 또는 slot 분리 검토 |
| variant가 렌더링 구조를 바꿈  | compound로 분리              |
| 외부에서 내부 데이터를 렌더링 | render props / slot          |
| 단순 스타일 변형              | `variant` prop 유지          |

## 렌더링 책임 규칙

- 하나의 컴포넌트는 하나의 시각적 영역을 책임진다.
- 컴포넌트가 300줄을 넘으면 분리를 검토하라.
- 리스트 렌더링: 리스트 컴포넌트와 아이템 컴포넌트를 분리하라.
- 조건부 렌더링: 분기가 3개 이상이면 별도 컴포넌트로 추출하라.
- 클릭 가능한 모든 요소에 `cursor-pointer`를 적용하라.

## 접근성 기본 규칙

- 인터랙티브 요소는 시맨틱 HTML(`button`, `a`, `input`)을 우선 사용하라.
- `div`/`span`에 `onClick`을 달 때는 `role`, `tabIndex`, 키보드 핸들러를 함께 제공하라.
- 이미지에 `alt`를 제공하라. 장식 이미지는 `alt=""`로 명시하라.
- 아이콘 버튼에 `aria-label`을 제공하라.

## 참조 라이브러리

### 디자인 참고

- **HeroUI**: 비주얼/감도 참고용. 직접 의존하지 마라. 디자인 방향과 인터랙션 패턴만 수집하라.

### 구현 기반

- **shadcn/ui**: packages/ui 프리미티브의 기반. 컴포넌트가 필요하면 shadcn/ui를 먼저 확인하고, 없을 때만 새로 만들어라.

### 특화 라이브러리

- 용도별 헤드리스/전문 라이브러리를 사용하라 (TanStack Table, Recharts 등).
- 특화 라이브러리는 packages/ui에 넣지 마라. `packages/components`에서 래핑하거나 `apps/web`에서 직접 사용하라.

### 컴포넌트 구현 시 체크 순서

1. shadcn/ui에 해당 컴포넌트가 있는가? → 있으면 packages/ui에서 그대로 사용하거나 확장.
2. 특화 라이브러리가 필요한가? (테이블, 차트, 에디터 등) → packages/components에서 래핑.
3. 둘 다 없으면 HeroUI 디자인을 참고해 새 프리미티브를 packages/ui에 작성.
4. 도메인 조합이 필요하면 packages/components에서 프리미티브를 조합.

## 스토리북 규칙

- packages/ui, packages/components에 컴포넌트를 추가하면 반드시 `apps/storybook/stories/` 에 스토리를 함께 작성하라.
- ui (compoents는 제외) 스토리 파일에는 `Showcase` 스토리를 반드시 포함하라.
- `Showcase` 스토리는 해당 컴포넌트의 주요 variant, 상태, 조합을 한 눈에 볼 수 있는 종합 데모다.
- 제조업(MES, PLM 등) 도메인에 맞는 mock 데이터를 활용하라 (설비, 작업지시, 품질 등).
- mock 데이터는 원어(전문용어, 모델명, 코드 등)를 제외하고 모두 한글로 작성하라.

## 적용 절차

1. 컴포넌트가 프리미티브(packages/ui), 도메인 조합(packages/components), 페이지 연결(apps/web) 중 어디에 속하는지 결정하라.
2. Props 인터페이스를 먼저 정의하라 (최소 계약).
3. packages/ui 프리미티브를 기반으로 조합하라. 없으면 프리미티브 추가를 먼저 검토하라.
4. 도메인 조합은 packages/components에 배치하고, props-only로 동작하는지 확인하라.
5. Props가 5개를 넘으면 compound/slot 패턴을 검토하라.
6. 300줄을 넘으면 하위 컴포넌트로 분리하라.
7. 접근성 기본 규칙을 점검하라.
8. 스토리 파일을 작성하고 Showcase 스토리를 포함하라.

## 빠른 체크리스트

- 컴포넌트가 올바른 티어(packages/ui vs packages/components vs apps/web)에 배치됐는가?
- packages/ui 컴포넌트에 API/store/도메인 타입 의존이 없는가?
- packages/components 컴포넌트에 API/store 의존 없이 props만으로 동작하는가?
- named export를 사용하는가?
- Props가 최소 계약만 포함하는가?
- 도메인 조합이 packages/ui 프리미티브를 기반으로 조합하는가?
- boolean props가 3개 이상 쌓이지 않았는가?
- 300줄 이하인가? 초과하면 분리했는가?
- 클릭 가능한 요소에 `cursor-pointer`가 있는가?
- 인터랙티브 요소가 시맨틱 HTML을 사용하는가?
- hex/rgb 직접 사용 없이 CSS 변수만 사용하는가?
- 스토리 파일이 작성됐는가? Showcase 스토리가 포함됐는가?
