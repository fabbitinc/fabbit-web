# AGENTS.md
이 문서는 이 저장소에서 작업하는 에이전트(사람/자동화)용 실행 가이드입니다.
목표는 빠른 이해, 안전한 수정, 일관된 검증입니다.

## 1) 저장소 개요
- 스택: React 19 + TypeScript 5 + Vite 7 + Tailwind CSS 4
- 상태관리: Zustand / TanStack Query
- HTTP: Axios (`src/api/client.ts`)
- 패키지 매니저: npm (`package-lock.json` 기준)
- Node: `v22.22.0` (`.node-version`)
- 백엔드 계약: `openapi.json` (최우선 소스)

## 2) 기본 명령어
루트: `/Users/seongha.moon/code/projects/fabbit/web`
```bash
# 의존성 설치
npm ci
# 개발 서버
npm run dev
# 린트
npm run lint
# 빌드 결과 확인
npm run preview
```
로컬 작업 검증은 사용자가 `npm run dev`로 진행합니다.
에이전트는 로컬에서 `npm run build`를 실행하지 않습니다.
CI(`.github/workflows/ci.yml`)는 `npm ci` → `npm run lint` → `npm run build` 순서입니다.

## 3) 테스트/검증 (단일 테스트 포함)
- 현재 `package.json`에 테스트 스크립트가 없습니다.
- Vitest/Jest/Playwright/Cypress 설정 파일도 없습니다.
- 따라서 **현재는 단일 테스트 실행 명령이 공식적으로 존재하지 않습니다.**
권장 검증:
```bash
# 정적 분석
npm run lint
# 파일 단위 린트
npx eslint src/path/to/file.tsx
```
향후 Vitest 도입 시 예시:
```bash
# 파일 1개 실행
npx vitest run src/foo/bar.test.ts
# 특정 테스트명만 실행
npx vitest run src/foo/bar.test.ts -t "should render"
```

## 4) 환경변수
`.env.example` 기준:
- `VITE_APP_DOMAIN`
- `VITE_API_BASE_URL`
- `VITE_TURNSTILE_SITE_KEY`
규칙:
- 클라이언트 노출 값은 `VITE_` 접두사만 사용
- API URL 변경 시 `src/api/client.ts`의 인터셉터/토큰 재발급 흐름 확인

## 5) 디렉터리 구조
- `src/api`: API 함수, 타입, 어댑터, React Query 훅
- `src/stores`: Zustand 전역 상태
- `src/features`: 기능 단위 UI/로직
- `src/components/ui`: 공용 UI(shadcn)
- `src/components/layout`: 레이아웃
- `src/lib`: 유틸
- 경로 별칭: `@/*` (`tsconfig.json`, `vite.config.ts`)

## 6) 코드 스타일 가이드
### 6.1 TypeScript
- `strict` 기준으로 작성, `any` 지양
- API 함수 반환 타입은 `Promise<명시 타입>` 유지
- 타입 전용 import는 `import type` 사용
- API 타입은 우선 `src/api/types`에 정의
- API DTO와 UI 모델 차이는 `src/api/adapters`에서 변환

### 6.2 Import
- 권장 순서: 외부 라이브러리 → 내부 절대경로(`@/...`) → 상대경로
- `import type`은 관련 import 블록 하단 또는 함께 배치
- 사이드이펙트 import(`@/lib/i18n`, css)는 의도 보이게 배치
- barrel(`index.ts`) 우선 사용, 순환 참조 금지

### 6.3 포맷팅
- ESLint 규칙 우선
- 세미콜론 스타일은 파일마다 혼재하므로 **수정 파일의 기존 스타일 유지**
- 대규모 포맷 변경 금지 (기능 변경과 분리)
- 긴 Tailwind 클래스는 가독성 기준으로 줄바꿈

### 6.4 네이밍
- 컴포넌트/페이지 파일: PascalCase (`ProjectDetailPage.tsx`)
- 훅: `useXxx`
- Zustand 스토어: `useXxxStore`
- 함수/변수: camelCase
- 상수: SCREAMING_SNAKE_CASE
- API 경계에서 snake_case를 받아도 앱 내부 모델은 camelCase 선호

### 6.5 React
- Props 타입은 `interface` 또는 명확한 인라인 타입 사용
- 이벤트 핸들러는 `handleXxx` 네이밍
- 파생 상태는 계산으로 처리, 중복 상태 저장 최소화
- 리스트 key는 안정적인 식별자 사용
- non-null assertion(`!`)은 최소화

### 6.6 Zustand / React Query
- 서버 데이터는 React Query 우선
- UI/세션 전역 상태는 Zustand 사용
- mutation 성공 시 관련 query key invalidate
- persist 스토어는 `partialize`로 최소 상태만 저장
- 토큰 저장/삭제는 기존 헬퍼 재사용

### 6.7 에러 처리
- 사용자 노출 메시지는 한국어로 명확하게 제공
- 에러를 삼킬지 재던질지 의도 명확히
- 401 처리 로직은 `src/api/client.ts` 인터셉터 규칙 준수
- API 디버그 로그는 `import.meta.env.DEV` 고려
- 복구 가능 오류는 UI 안내, 불가 오류는 안전 초기화/리다이렉트

### 6.8 API 계층
- 엔드포인트 주석(`GET /api/v1/...`) 유지
- API 함수는 얇은 래퍼로 `response.data` 반환
- 요청/응답 타입을 함수 시그니처와 정확히 연결
- **백엔드 응답 스펙은 snake_case를 기본으로 간주** (`openapi.json` 우선)
- 프론트 내부 모델/스토어/UI 필드는 camelCase를 유지하고, 키 변환은 `src/api/adapters`에서 처리
- `src/api/types`는 API 원문 스키마(snake_case)와 동일하게 정의하고, UI 타입과 혼용하지 않음
- 스펙 변경 시 `openapi.json` 기준으로 타입/엔드포인트 동기화

### 6.9 UI/Tailwind
- 디자인 토큰은 `src/index.css` 변수 우선 사용
- UI 컴포넌트는 **shadcn(`src/components/ui`) 사용을 기본 원칙으로 강제**
- 새 UI를 만들 때도 shadcn 컴포넌트(`Button`, `Input`, `Select`, `Label`, `Badge` 등) 조합을 우선
- 네이티브 `select`, `input`, `button` 직접 사용은 shadcn 대체가 없는 경우에만 허용
- 클래스 조합은 `cn()`(`src/lib/utils.ts`) 사용
- 접근성(aria, focus-visible) 훼손 금지

## 7) 작업 체크리스트
1. API 변경 여부를 `openapi.json`에서 먼저 확인
2. 기존 모듈 경계(api/store/feature/ui) 안에서 최소 변경
3. `npm run lint` 및 사용자의 `npm run dev` 검증 흐름에 맞춰 확인
4. 라우팅/인증 영향이 있으면 `src/App.tsx`까지 확인
5. 신규 파일은 기존 네이밍/배치 규칙 준수

## 8) Cursor/Copilot/로컬 규칙
확인 결과(현재 저장소):
- `.cursor/rules/` 없음
- `.cursorrules` 없음
- `.github/copilot-instructions.md` 없음
추가 로컬 규칙:
- `CLAUDE.md`: "백엔드 API는 `openapi.json` 참고"
위 경로에 규칙 파일이 생기면 AGENTS.md를 즉시 갱신하세요.

## 9) 금지/주의
- 근거 없는 라이브러리 추가 금지
- 전역 리네이밍/대규모 포맷 변경 단독 커밋 금지
- 비밀정보(.env 실제값, 토큰) 커밋 금지
- 계약 불일치 상태에서 `as any`로 우회 금지
- 에이전트의 `npm run build` 실행 금지 (로컬 검증은 `npm run dev` 기준)

## 10) 빠른 명령 모음
```bash
npm ci
npm run dev
npm run lint
npx eslint src/path/to/file.tsx
npm run preview
```
필수: 백엔드 계약의 기준은 항상 `openapi.json`입니다.
