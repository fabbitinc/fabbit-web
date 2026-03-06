---
name: cv-api
description: 프론트엔드 API 레이어 규칙을 적용한다. HTTP 함수, TanStack Query의 queryOptions/mutationOptions 정의, DTO 변환, 파일 구조, 에러 처리 규칙 정리가 필요할 때 사용한다. API 함수 추가, 쿼리/뮤테이션 옵션 정의, 서버 통신 코드 작업에서 사용한다.
---

# API Conventions

## 목표

- API 레이어를 서버 통신 전용 계층으로 유지하라.
- HTTP 함수(순수)와 TanStack Query 옵션(캐시 설정)을 명확히 분리하라.
- 이 스킬은 API 레이어 규칙만 다루고 다른 레이어의 코드 작성 규칙은 다루지 마라.

## 파일 구조

```
features/{feature}/api/
  {domain}.api.ts           # 순수 HTTP 함수 (fetch/axios 래핑)
  {domain}.queries.ts       # queryOptions / mutationOptions 팩토리
  {domain}.types.ts         # API DTO (Request/Response)
```

- 공유 API 클라이언트와 공통 타입은 `src/api/`에 배치하라.

```
src/api/
  client.ts                 # HTTP 클라이언트 설정 (base URL, 인터셉터, 인증 헤더)
  types.ts                  # 공통 API 타입 (Paginated<T>, ApiError 등)
```

## 네이밍 규칙

### HTTP 함수 (`*.api.ts`)

- 조회: `fetch{Domain}`, `fetch{Domain}List`, `fetch{Domain}Detail`
- 생성: `create{Domain}`
- 수정: `update{Domain}`
- 삭제: `delete{Domain}`
- 검색/자동완성: `lookup{Domain}`, `search{Domain}`

### Query Options (`*.queries.ts`)

- 파일 내 options 객체를 묶는 네임스페이스: `{domain}Queries`
- 개별 queryOptions: `{domain}Queries.list()`, `{domain}Queries.detail(id)`
- 개별 mutationOptions: `{domain}Mutations.create()`, `{domain}Mutations.update()`

### DTO 변환 함수 (`*.api.ts` 내부)

- 변환 함수: `to{Target}` (`toIssueModel`, `toCreateIssueRequest`)

## HTTP 함수 규칙 (`*.api.ts`)

- React를 import하지 마라. 순수 함수로 유지하라.
- hook을 사용하지 마라 (`useState`, `useEffect`, `useQuery` 등 금지).
- 입력은 primitive 또는 Request DTO, 출력은 Response DTO를 사용하라.
- DTO -> Model 변환 함수를 같은 파일에 배치하라.
- 에러 가공(throw, 재포장)은 하지 마라. HTTP 클라이언트의 에러를 그대로 전파하라.
- 비즈니스 로직을 포함하지 마라. 서버 요청/응답 변환만 수행하라.

## Query Options 규칙 (`*.queries.ts`)

- `queryOptions()`, `mutationOptions()`로 팩토리 객체를 생성하라.
- `queryFn` 안에서 HTTP 함수를 호출하고 Model로 변환하라.
- `queryKey`는 계층적으로 구성하라: `['{domain}', '{action}', ...params]`
- `staleTime`, `gcTime` 등 캐시 설정은 queries 파일에서 관리하라.
- hook이 아니라 설정 객체다. React를 import하지 마라.

## hook에서의 사용 패턴

- 조회: `useQuery({domain}Queries.list(params))`
- 뮤테이션: `useMutation({domain}Mutations.create())`
- invalidation: action hook에서 `queryClient.invalidateQueries({queryKey: ['{domain}']})`
- optimistic update: action hook의 `onMutate`에서 수행

## 에러 처리 규칙

- HTTP 클라이언트 레벨에서 공통 에러(401, 403, 500)를 인터셉터로 처리하라.
- 도메인 특화 에러(409 충돌 등)는 action hook에서 처리하라.
- API 레이어에서 try/catch로 에러를 삼키지 마라.

## 도메인 의존 규칙

- API 파일은 `types`만 import하라. hook, store, component를 import하지 마라.
- 다른 feature의 API를 직접 import하지 마라. 필요하면 공유 API(`src/api/`)로 승격하라.

## 적용 절차

1. API 스펙(엔드포인트, 요청/응답)을 확인하라.
2. DTO 타입을 `{domain}.types.ts`에 정의하라.
3. HTTP 함수를 `{domain}.api.ts`에 작성하라.
4. DTO -> Model 변환 함수를 같은 파일에 작성하라.
5. queryOptions/mutationOptions를 `{domain}.queries.ts`에 정의하라.
6. `queryKey`를 계층적으로 구성하라.
7. 캐시 설정(`staleTime`, `gcTime`)을 결정하라.

## 빠른 체크리스트

- HTTP 함수 파일(`*.api.ts`)에 React import가 없는가?
- HTTP 함수가 순수 함수(hook 없음)인가?
- DTO -> Model 변환이 api 레이어에 배치됐는가?
- queryOptions/mutationOptions가 별도 파일(`*.queries.ts`)에 분리됐는가?
- `queryKey`가 계층적으로 구성됐는가?
- API 파일이 hook/store/component를 import하지 않는가?
- 에러를 api 레이어에서 삼키지 않는가?
- 다른 feature의 API를 직접 import하지 않는가?
