---
name: cv-structure
description: 모노레포 전체의 폴더 구조, 파일 배치, 패키지 경계, feature 슬라이스, 의존성 방향 규칙을 적용한다. 새 feature/페이지/모듈/컴포넌트 추가, 파일 위치 결정, import 방향 점검, 폴더 구조 리팩터링이 필요할 때 사용한다.
---

# Structure Conventions

## 목표

- 모노레포 내 패키지 경계와 파일 배치를 일관되게 유지하라.
- feature 간 의존성 방향을 단방향으로 강제하라.
- 이 스킬은 프로젝트 구조 규칙만 다루고 각 레이어의 코드 작성 규칙은 다루지 마라.

## 모노레포 패키지 구조

```
packages/
  ui/src/                   # 도메인 무관 UI 프리미티브 (Button, Input, Combobox)
  components/src/           # 도메인 컴포넌트 조합 (IssueCard, MemberSelector 등)
  theme/                    # 디자인 토큰, CSS 변수
apps/
  web/src/                  # 메인 앱 (페이지, API 연동, 상태 관리, 라우팅)
  storybook/stories/        # packages/ui + packages/components 스토리
```

## 패키지 경계 규칙

- `packages/ui`: 도메인 무관, API/store 의존 없는 순수 UI 컴포넌트만 배치하라.
- `packages/components`: 도메인 컴포넌트 조합. props만으로 동작하는 순수 렌더링 컴포넌트. API/store 직접 의존 금지. `packages/ui` 프리미티브를 조합해 도메인 UI를 구성한다.
- `packages/theme`: CSS 변수, 토큰 정의만 배치하라.
- `apps/web`: 페이지, API 연동, 상태 관리, 라우팅을 배치하라. hook으로 데이터를 가져와 `packages/components`에 props로 주입한다.
- `apps/storybook`: `packages/ui`와 `packages/components`의 스토리를 배치하라. `apps/web`을 import하지 마라.

### 패키지 간 의존 방향

```
apps/storybook   -> packages/components, packages/ui, packages/theme
apps/web         -> packages/components, packages/ui, packages/theme
packages/components -> packages/ui, packages/theme
packages/ui      -> packages/theme (only)
packages/theme   -> 없음 (의존 금지)
```

- 모든 의존은 `apps → packages` 단방향이다. `packages → apps` import를 금지한다.
- `packages/components`는 `packages/ui`와 `packages/theme`만 의존한다.
- `packages/ui`에서 `packages/components`를 import하지 마라.
- `packages/ui`에서 API 클라이언트, store, React Query를 import하지 마라.
- `packages/components`에서 API 클라이언트, store, React Query를 import하지 마라.

### 컴포넌트 배치 판단

| 질문 | packages/ui | packages/components | apps/web |
|---|---|---|---|
| 도메인 개념을 모르는가? | ✅ | — | — |
| 도메인 개념을 알지만 props만으로 동작하는가? | — | ✅ | — |
| API/store/hook에 의존하는가? | — | — | ✅ |
| 2개 이상 feature에서 재사용되는 순수 UI인가? | ✅ | — | — |
| 2개 이상 feature에서 재사용되는 도메인 조합인가? | — | ✅ | — |

## apps/web 내부 폴더 구조

```
apps/web/src/
  pages/                    # 라우트 진입점 (controller 대응)
    {feature}/
      {feature}-page.tsx
      {feature}-layout.tsx
  features/                 # feature 단위 수직 슬라이스
    {feature}/
      hooks/                # feature 전용 훅 (action/query/logic/listener)
      api/                  # feature 전용 API 함수 + queryOptions
      types/                # feature 전용 타입 (DTO, model, props)
      stores/               # feature 전용 zustand 스토어 (필요 시)
  components/               # 공유 컴포넌트 (apps/web 전용, 2개 이상 feature에서 사용)
  hooks/                    # 공유 훅
  api/                      # 공유 API (인증, 공통 클라이언트)
  types/                    # 공유 타입
  stores/                   # 공유 스토어
  lib/                      # 유틸리티, 헬퍼 함수
```

> **참고**: 기존 `features/{feature}/components/` 폴더의 도메인 컴포넌트는 props-only로 리팩터링해 `packages/components`로 승격하라. `apps/web` feature 폴더에는 hooks/api/types/stores만 남긴다.

## 네이밍 규칙

- 파일명: `kebab-case` (`issue-card.tsx`, `use-create-issue-action.ts`)
- 컴포넌트: `PascalCase` (`IssueCard`, `MemberSelector`)
- 훅: `camelCase`, `use` 접두사 (`useCreateIssueAction`)
- 타입: `PascalCase` (`IssueModel`, `IssueResponse`)
- 배럴 파일: feature 루트에 `index.ts`를 두어 외부 공개 API를 관리하라

## apps/web 의존성 방향 규칙

```
허용되는 import 방향:

pages      -> features/{feature}/hooks, types
              components/ (공유)
              packages/components
              packages/ui

components -> hooks, types
              packages/components
              packages/ui

hooks      -> api, stores, types

api        -> types (only)

stores     -> types (only)

types      -> 없음 (의존 금지)
```

- 상위 레이어가 하위 레이어를 import한다. 역방향을 금지한다.
- `api`는 React를 import하지 마라 (순수 함수로 유지).
- feature 간 직접 import를 금지한다. 공유가 필요하면 `features/{feature}/index.ts`를 통해 내보내거나 공유 폴더로 승격하라.

## Feature 경계 규칙

- 하나의 feature 폴더는 하나의 도메인 영역을 책임진다.
- feature 내부 폴더(`hooks/`, `api/`, `types/`)는 필요한 것만 생성하라. 빈 폴더를 미리 만들지 마라.
- 2개 이상 feature에서 동일 코드를 사용하면 공유 폴더(`src/components/`, `src/hooks/` 등)로 승격하라.
- 1개 feature에서만 사용하는 코드를 공유 폴더에 두지 마라.

## 라우팅 규칙

- 페이지 컴포넌트는 `pages/` 하위에 배치하라.
- 페이지 컴포넌트는 훅과 컴포넌트를 조합만 하라. 직접 API 호출과 비즈니스 로직을 금지한다.
- 레이아웃은 같은 feature 폴더의 `{feature}-layout.tsx`에 배치하라.
- URL 파라미터 파싱은 페이지 컴포넌트에서 수행하고 하위 컴포넌트에 props로 전달하라.

## 검증 흐름

```
packages/ui 프리미티브       → apps/storybook  (프리미티브 단위 확인)
packages/components 조합     → apps/storybook  (도메인 컴포넌트 조합 확인, mock 데이터)
확정된 화면                  → apps/web/pages  (실제 라우트로 배포)
```

- `apps/storybook`: packages/ui 프리미티브를 개별 확인한다.
- `apps/storybook`: packages/components의 도메인 조합을 mock 데이터로 확인한다. 여러 variant를 비교할 수 있다.
- 프리뷰가 확정되면 `apps/web/pages`의 실제 라우트로 반영한다.

## 파일 헤더 주석 규칙

- 특정 파일 수정 시 반드시 함께 수정해야 하는 곳이 있으면 파일 상단에 체크리스트 주석을 작성하라.
- 형식: `// ── 수정 체크리스트 ──` 블록 안에 항목을 나열하라.

## 적용 절차

1. 새 코드가 속할 패키지(`packages/ui` vs `packages/components` vs `apps/web`)를 먼저 결정하라.
2. `apps/web`이면 속할 feature를 결정하라.
3. feature 폴더가 없으면 생성하고, 필요한 하위 폴더만 추가하라.
4. 의존성 방향 규칙에 맞는 위치에 파일을 배치하라.
5. 2개 이상 feature에서 사용할 코드는 공유 폴더로 승격하라.
6. 도메인 컴포넌트가 props-only로 동작하면 `packages/components`로 승격을 검토하라.
7. 배럴 파일(`index.ts`)로 feature의 외부 공개 API를 관리하라.
8. 페이지 컴포넌트가 직접 API를 호출하거나 비즈니스 로직을 포함하지 않는지 점검하라.

## 빠른 체크리스트

- 새 컴포넌트가 `packages/ui` vs `packages/components` vs `apps/web` 중 올바른 위치에 배치됐는가?
- `packages/ui` 컴포넌트에 API/store/도메인 타입 의존이 없는가?
- `packages/components` 컴포넌트에 API/store 의존 없이 props만으로 동작하는가?
- 패키지 간 import 방향이 `apps -> packages` 단방향인가?
- 새 파일이 올바른 feature 폴더에 배치됐는가?
- feature 내부에 빈 폴더가 미리 생성되지 않았는가?
- apps/web 내 import 방향이 상위 -> 하위 단방향인가?
- feature 간 직접 import가 없는가?
- 1개 feature 전용 코드가 공유 폴더에 있지 않은가?
- 페이지 컴포넌트가 훅/컴포넌트 조합만 하고 있는가?
- api 레이어에 React import가 없는가?
