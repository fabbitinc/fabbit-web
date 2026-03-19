# fabbit Web Workspace

`fabbit/web`는 `pnpm` workspace와 Turborepo 위에서 운영되는 프론트엔드 모노레포다. 메인 제품 앱인 `@fabbit/web`, 랜딩 페이지인 `@fabbit/landing`, UI 검증용 `@fabbit/storybook`, 그리고 공유 패키지(`@fabbit/ui`, `@fabbit/components`, `@fabbit/theme`)를 함께 관리한다.

## Workspace 구성

```text
apps/
  web/         메인 제품 앱 (Vite + React + React Router + TanStack Query)
  landing/     랜딩 페이지
  storybook/   공유 UI/컴포넌트 검증
packages/
  ui/          도메인 무관 UI 프리미티브
  components/  도메인 조합 컴포넌트
  theme/       디자인 토큰과 공통 스타일
```

## 필수 환경

- Node.js
- `pnpm@10.15.0`
- 루트 `openapi.json`

`apps/web`에서 현재 확인되는 주요 환경 변수는 아래와 같다.

- `VITE_API_BASE_URL`
- `VITE_APP_DOMAIN`
- `VITE_TURNSTILE_SITE_KEY`

## 루트 명령

루트 `package.json`은 workspace 실행 진입점 역할을 한다.

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm storybook
pnpm build-storybook
pnpm dev:landing
pnpm build:landing
pnpm --filter @fabbit/web generate:api
```

## 앱별 역할

### `@fabbit/web`

메인 제품 앱이다. 현재 라우트 축은 아래와 같다.

- 인증/가입: `/login`, `/signup`, `/workspace`, `/plan`, `/invite/accept`
- 대시보드: `/`
- 부품: `/parts`, `/parts/new`, `/parts/:partId/revisions/:revisionId`, 템플릿/가공/도면/BOM 관련 하위 경로
- 변경관리: `/changes/*`, `/changes/issues/*`, `/changes/engineering-changes/*`
- 프로젝트: `/projects`, `/projects/:projectId/*`
- 설정: `/organization/settings`, `/user/settings`

`apps/web/src`의 주요 폴더는 다음과 같다.

```text
app/         앱 엔트리, 라우터, 레이아웃, provider
pages/       라우트 진입점
features/    도메인별 수직 슬라이스
api/         공통 API 클라이언트, 파일 업로드, 생성 코드
components/  web 전용 공유 컴포넌트
hooks/       web 전용 공유 훅
lib/         유틸리티
types/       공용 타입
```

### `@fabbit/landing`

마케팅/소개용 랜딩 앱이다. 별도 Vite 앱으로 동작하며 루트에서 `pnpm dev:landing`으로 실행한다.

### `@fabbit/storybook`

`@fabbit/ui`와 `@fabbit/components`를 검증하는 Storybook 앱이다. 앱 구현보다 앞선 컴포넌트 확인과 비교 작업에 사용한다.

## 패키지 역할

### `@fabbit/ui`

버튼, 입력, 다이얼로그 같은 도메인 무관 프리미티브를 제공한다.

### `@fabbit/components`

부품 화면, 프로젝트 화면처럼 도메인 의미를 가지지만 props만으로 동작하는 조합 컴포넌트를 제공한다.

### `@fabbit/theme`

공통 CSS 변수와 테마 토큰을 제공한다.

## API 생성 흐름

메인 앱은 루트 `openapi.json`을 기준으로 타입과 API 클라이언트를 생성한다.

```bash
pnpm --filter @fabbit/web generate:api
```

이 명령은 아래 순서로 실행된다.

1. `openapi-typescript`로 `apps/web/src/api/generated/schema.ts` 생성
2. `orval`로 `apps/web/src/api/generated/orval/**` 생성
3. 생성 코드는 `apps/web/src/api/orval/custom-instance.ts`와 `apps/web/src/api/client.ts`를 통해 Axios 인스턴스를 공유

자세한 규칙은 [API.md](./API.md)를 참고한다.

## 관련 문서

- [API.md](./API.md): API 생성/구성/운영 기준
- [HANDOFF.md](./HANDOFF.md): 루트 handoff 기록 문서
- [`handoff/`](./handoff): 설계 기록 및 작업 handoff 문서 모음
