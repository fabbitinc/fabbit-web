---
name: cv-hook
description: 프론트엔드 Hook 레이어 규칙을 적용한다. 4종 hook(action/query/logic/listener) 네이밍, 역할 경계, 의존성 규칙, 상태 관리 패턴 정리가 필요할 때 사용한다. 커스텀 훅 추가/수정, 뮤테이션 오케스트레이션, 데이터 조회, 공유 로직, 이벤트 구독 작업에서 사용한다.
---

# Hook Conventions

## 목표

- Hook을 프론트엔드 비즈니스 로직 계층으로 유지하라.
- 네이밍 접미사로 4종 hook의 역할을 명확히 구분하라.
- 이 스킬은 Hook 규칙만 다루고 다른 레이어의 코드 작성 규칙은 다루지 마라.

## 4종 Hook 분류

| 접미사 | 역할 | 백엔드 대응 | 예시 |
|---|---|---|---|
| `use{Action}Action` | 뮤테이션 오케스트레이션 (생성/수정/삭제) | UseCase | `useCreateIssueAction` |
| `use{Domain}Query` | 데이터 조회 (TanStack Query 래핑) | Query | `useIssuesQuery` |
| `use{Name}Logic` | 공유 계산/포맷/유효성 검증 | Service | `useDateFormatLogic` |
| `use{Name}Listener` | 이벤트 구독 (WebSocket, SSE, 브라우저 이벤트) | EventHandler | `useWebSocketListener` |

## 네이밍 규칙

### Action Hook

- 파일명: `use-{action}-{domain}-action.ts`
- 함수명: `use{Action}{Domain}Action`
- 하나의 action hook은 하나의 사용자 시나리오를 책임지게 하라.
- 반환: `{ mutate, isPending, error }` 또는 시나리오에 필요한 핸들러 함수

### Query Hook

- 파일명: `use-{domain}-query.ts` 또는 `use-{domain}-{variant}-query.ts`
- 함수명: `use{Domain}Query`, `use{Domain}ListQuery`, `use{Domain}DetailQuery`
- 조회 변형(목록/상세/검색)은 접미사 앞에 variant를 넣어라.

### Logic Hook

- 파일명: `use-{name}-logic.ts`
- 함수명: `use{Name}Logic`
- 여러 feature에서 재사용하는 계산/변환/검증 로직을 캡슐화하라.

### Listener Hook

- 파일명: `use-{name}-listener.ts`
- 함수명: `use{Name}Listener`
- 구독 시작/정리(cleanup)를 hook 내부에서 완결하라.

## Action Hook 규칙 (= UseCase 대응)

- 하나의 action hook은 하나의 사용자 시나리오를 책임진다.
- `useMutation`으로 서버 뮤테이션을 실행하라.
- 뮤테이션 성공 후 관련 쿼리 invalidation을 같은 hook에서 수행하라.
- optimistic update가 필요하면 `onMutate`/`onError`/`onSettled`에서 처리하라.
- 토스트/알림 등 사용자 피드백을 hook 내부에서 트리거하라.
- API DTO를 직접 다루지 마라. queryOptions/mutationOptions를 통해 접근하라.

## Query Hook 규칙 (= Query 대응)

- `useQuery`로 서버 데이터를 조회하라.
- queryOptions 팩토리(`{domain}Queries.list()` 등)를 사용하라. 인라인 queryFn을 금지한다.
- 상태 변경 로직을 query hook에 넣지 마라 (조회 전용).
- 파생 데이터(필터링, 정렬, 그룹핑)는 `select` 옵션 또는 `useMemo`로 처리하라.
- 로딩/에러 상태를 반환에 포함하라.

## Logic Hook 규칙 (= Service 대응)

- React 상태나 API 호출 없이 동작할 수 있는 로직을 우선 순수 함수로 추출하라.
- 순수 함수로 불가능한 경우(ref, effect, 브라우저 API 의존)에만 hook으로 만들어라.
- logic hook은 API를 직접 호출하지 마라.
- 2개 이상 feature에서 사용하면 `src/hooks/`로 승격하라.

## Listener Hook 규칙 (= EventHandler 대응)

- 구독 대상: WebSocket, SSE, `window` 이벤트, `IntersectionObserver`, `ResizeObserver` 등.
- `useEffect` 내부에서 구독을 시작하고 cleanup 함수에서 정리하라.
- 이벤트 수신 시 비즈니스 로직을 직접 처리하지 마라. 콜백 또는 store dispatch로 위임하라.
- 재연결/재시도 정책이 필요하면 hook 내부에서 관리하라.
- 이벤트 데이터 파싱/검증만 hook에서 수행하라.

## 의존성 규칙

```
허용되는 import:

action hook   -> api (mutationOptions), store, type, logic hook
query hook    -> api (queryOptions), type
logic hook    -> type, lib (유틸리티)
listener hook -> store, type, lib
```

- 모든 hook에서 컴포넌트를 import하지 마라.
- hook에서 다른 feature의 hook을 직접 import하지 마라. 공유 hook으로 승격하라.
- API DTO 타입을 hook에서 직접 사용하지 마라. UI Model을 사용하라.

## 반환값 규칙

- action hook: `{ mutate, isPending, error }` + 시나리오별 핸들러 함수
- query hook: `{ data, isLoading, error }` + 파생 데이터
- logic hook: 계산 결과값 또는 유틸리티 함수 묶음
- listener hook: 연결 상태 (`{ isConnected, lastEvent }`)

## 적용 절차

1. 훅의 역할을 action/query/logic/listener 중 하나로 확정하라.
2. 네이밍 접미사를 역할에 맞게 적용하라.
3. 해당 종류의 규칙(의존성, 반환값)에 맞게 구현하라.
4. action hook이면 invalidation/optimistic update 전략을 결정하라.
5. listener hook이면 cleanup과 재연결 정책을 확인하라.
6. 2개 이상 feature에서 사용하면 공유 훅으로 승격하라.

## 빠른 체크리스트

- 훅 이름이 4종 접미사(`Action`/`Query`/`Logic`/`Listener`) 중 하나를 사용하는가?
- 하나의 action hook이 하나의 시나리오만 책임지는가?
- query hook이 상태 변경 없이 조회만 수행하는가?
- query hook이 인라인 queryFn 대신 queryOptions 팩토리를 사용하는가?
- logic hook이 순수 함수로 추출 가능한데도 hook으로 만들지 않았는가?
- listener hook이 cleanup을 수행하는가?
- hook에서 컴포넌트를 import하지 않는가?
- hook에서 API DTO 대신 UI Model을 사용하는가?
- 다른 feature의 hook을 직접 import하지 않는가?
