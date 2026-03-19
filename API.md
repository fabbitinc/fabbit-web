# API Guide

기준일: 2026-03-19

## 목적

이 문서는 `fabbit/web` 모노레포에서 `@fabbit/web` 앱의 API 레이어가 어디서 생성되고, 어떤 파일에 어떤 책임을 두는지 설명하는 현재 기준 문서다.

## Source Of Truth

- 루트 스펙: `openapi.json`
- 생성 설정: `apps/web/orval.config.ts`
- 메인 앱 패키지: `apps/web/package.json`

`apps/web/orval.config.ts`는 기본적으로 루트 `openapi.json`을 사용하고, 파일이 없을 때만 `http://localhost:8080/openapi.json`을 fallback으로 사용한다.

## 생성 명령

`@fabbit/web`는 아래 명령으로 타입과 API 클라이언트를 생성한다.

```bash
pnpm --filter @fabbit/web generate:schema
pnpm --filter @fabbit/web generate:api
```

실제 `generate:api`는 아래 두 단계를 수행한다.

1. `openapi-typescript`로 `apps/web/src/api/generated/schema.ts` 생성
2. `orval`로 `apps/web/src/api/generated/orval/**` 생성

## 디렉터리 구조

### 공통 API 레이어

```text
apps/web/src/api/
  client.ts                 Axios 인스턴스, 인증 헤더, 401 refresh 처리
  query-client.ts           TanStack Query 공통 QueryClient
  file.api.ts               파일 업로드 전용 수기 API
  file.types.ts             파일 업로드 DTO
  file-hash.ts              업로드 전 요청 body 준비
  generated/
    schema.ts               openapi-typescript 결과물
    orval/**                Orval 생성 함수/모델
  orval/
    custom-instance.ts      생성 함수가 공통으로 쓰는 mutator
```

### feature API 레이어

각 feature는 아래 구조를 따른다.

```text
apps/web/src/features/{feature}/api/
  {domain}.api.ts           순수 HTTP 함수 + DTO -> Model 변환
  {domain}.queries.ts       queryOptions / mutationOptions / queryKey
  {domain}.types.ts         생성 타입 alias와 feature DTO 정의
```

현재 이 패턴을 사용하는 대표 feature는 아래와 같다.

- `auth`
- `billing`
- `change-management`
- `change-shared`
- `dashboard`
- `engineering-change`
- `issue`
- `organization-settings`
- `part-template-mapping`
- `parts`
- `project-detail`
- `projects-list`
- `properties`
- `settings`
- `user-settings`

## 책임 분리

### `client.ts`

- `apiClient`를 생성한다.
- `VITE_API_BASE_URL`을 사용한다.
- access token을 자동으로 붙인다.
- 401 응답 시 refresh token으로 재발급을 시도한다.
- 인증 복구 실패 시 저장 토큰을 정리하고 unauthorized handler를 실행한다.

### `orval/custom-instance.ts`

- Orval 생성 함수가 공통으로 쓰는 mutator다.
- 생성 함수가 모두 같은 Axios 인스턴스와 옵션 흐름을 쓰도록 맞춘다.
- 응답을 `response.data` 기준으로 정규화한다.

### `*.api.ts`

- React를 import하지 않는다.
- hook을 사용하지 않는다.
- 서버 호출과 DTO 변환만 담당한다.
- feature의 UI model 변환 함수는 가능하면 이 레이어에 둔다.
- 예외 처리 로직은 여기서 삼키지 않고 상위로 전파한다.

### `*.queries.ts`

- `queryOptions`, `mutationOptions`를 정의한다.
- `queryKey`를 계층적으로 관리한다.
- 캐시 정책(`staleTime` 등)을 이 레이어에 둔다.
- 컴포넌트에서 바로 `useQuery`/`useMutation`에 연결할 수 있는 옵션 팩토리를 제공한다.

### `*.types.ts`

- `apps/web/src/api/generated/schema.ts` 또는 `apps/web/src/api/generated/orval/model/**`를 기반으로 DTO alias를 만든다.
- feature API가 소비하는 요청/응답 타입의 경계를 정리한다.

## 작업 흐름

새 API를 추가하거나 스펙이 바뀌었을 때는 아래 순서를 따른다.

1. 루트 `openapi.json`을 갱신한다.
2. `pnpm --filter @fabbit/web generate:api`를 실행한다.
3. 생성 코드 diff를 확인한다.
4. 필요한 feature의 `*.types.ts`에 DTO alias를 추가한다.
5. `*.api.ts`에서 생성 함수를 감싸고 UI model 변환을 정리한다.
6. `*.queries.ts`에 query/mutation 옵션을 정의한다.
7. hook 또는 페이지/컴포넌트에서 새 query/mutation을 사용한다.

## 현재 저장소의 예외 패턴

### 파일 업로드

`apps/web/src/api/file.api.ts`는 일반 feature API와 성격이 다르다.

- presigned URL 업로드가 필요하다.
- 업로드 전 해시 계산과 request body 구성이 필요하다.
- 실제 바이너리 업로드는 외부 URL에 `fetch(..., { method: "PUT" })`로 수행한다.

즉, 파일 업로드는 OpenAPI 생성 코드만으로 해결되지 않기 때문에 공통 API 레이어의 수기 구현으로 유지한다.

## 유지보수 규칙

- `apps/web/src/api/generated/**`는 수동 편집하지 않는다.
- 생성 스펙이 바뀌면 문서보다 먼저 생성 코드를 갱신한다.
- 계약 예외가 생기면 아래 형식으로 별도 섹션이나 감사 문서에 남긴다.

```text
- 날짜
- 엔드포인트
- 영향 파일
- 현재 우회 방식
- 서버/OpenAPI 정리 필요 여부
```

## 이번 정리에서 제거한 stale 항목

- 과거 `API.md`에 있던 `apps/web/src/features/change-request/api/change-request.api.ts` 경로 기반 감사 메모는 현행 구조와 맞지 않아 본문 기준선에서 제거했다.
- 현재 change 관련 API는 `change-management`, `change-shared`, `engineering-change`, `issue` feature로 나뉘어 관리된다.
