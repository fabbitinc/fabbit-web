# Fabbit Web

Fabbit SaaS 플랫폼의 프론트엔드입니다. **Turborepo 모노레포** 위에서 제품 앱, 랜딩 페이지, 공유 패키지를 함께 관리합니다.

> 이 포트폴리오의 주된 초점은 백엔드이며, 프론트엔드는 제품 완성도 참고용으로 포함합니다.

---

## 기술 스택

| 분류 | 기술 |
|---|---|
| 프레임워크 | React 19, TypeScript, Vite 7 |
| 상태 관리 | Zustand (클라이언트), TanStack Query (서버) |
| 스타일링 | Tailwind CSS 4, CSS 변수 기반 디자인 토큰 (OKLCH) |
| UI 기반 | Radix UI, Tiptap (리치 에디터), Recharts, Three.js (3D) |
| API 연동 | OpenAPI 코드젠 (openapi-typescript + Orval), Axios |
| 빌드 | Turborepo, pnpm workspace |
| 기타 | i18next (다국어), React Router 7, dnd-kit (드래그앤드롭) |

---

## 모노레포 구조

```
apps/
  web/         메인 제품 앱 — 25개 페이지, 16개 feature slice
  landing/     마케팅 랜딩 페이지
  storybook/   공유 UI/컴포넌트 검증
packages/
  ui/          도메인 무관 프리미티브 (45개 컴포넌트)
  components/  도메인 조합 컴포넌트 (108개 컴포넌트)
  theme/       디자인 토큰, 테마, 공통 스타일
```

### 패키지를 분리한 이유

초기에는 단일 패키지로 관리했으나, 랜딩 페이지와 제품 앱의 스타일이 같은 서비스임에도 달라지고, 화면마다 컴포넌트가 제각각이 되는 문제가 발생했습니다. 브랜드 UI/UX 일관성이 깨지는 것을 방지하기 위해 3개 패키지로 분리했습니다.

- **`ui`** — 버튼, 다이얼로그 등 도메인 무관 프리미티브. 이 계층을 건드리면 전체 앱에 영향이 가므로 독립 패키지로 격리
- **`components`** — 부품 카드, BOM 트리 등 도메인 의미를 가지는 조합 컴포넌트. `ui`만 import 가능
- **`theme`** — CSS 변수와 디자인 토큰. `ui`와 `components`가 모두 참조하는 단일 진실 공급원(SSOT)

백엔드의 ArchUnit처럼 테스트로 강제하지는 못하지만, 패키지 경계 자체가 의존성 방향을 구조적으로 제한합니다.

---

## Feature Slices 아키텍처

`apps/web/src/features/` 하위에 도메인별 수직 슬라이스로 구성합니다. 각 feature는 자체 API, 컴포넌트, 훅, 타입을 캡슐화합니다.

```
features/{feature}/
├── api/          queryOptions, mutationOptions, API 함수
├── components/   도메인 컴포넌트
├── hooks/        action / query / logic / listener 훅
├── stores/       Zustand 스토어
├── types/        DTO, Model, Props
└── index.ts      공개 API
```

| Feature | 설명 |
|---|---|
| auth | 로그인, 회원가입, 토큰 관리, 워크스페이스 생성 |
| parts | 부품 CRUD, BOM, 템플릿 매핑, 도면 뷰어 |
| chat | AI 채팅 (SSE 스트리밍, 마크다운 렌더링) |
| issue | 이슈 생성/수정, 타임라인, 파일 첨부 |
| engineering-change | 엔지니어링 변경 워크플로우 |
| billing | 구독/결제 |
| dashboard | 메인 대시보드 |
| registration | 가입/온보딩 (이메일 인증 → 워크스페이스 설정 → 플랜 선택) |

---

## OpenAPI 기반 타입 안전 API 연동

백엔드의 OpenAPI 스펙(`openapi.json`, 27,855줄)을 단일 진실 공급원으로 사용합니다. 타입과 API 클라이언트를 자동 생성하여 백엔드-프론트엔드 간 계약을 코드 수준에서 보장합니다.

```bash
pnpm --filter @fabbit/web generate:api
```

1. `openapi-typescript` → TypeScript 스키마 타입 생성
2. `Orval` → 38개 도메인별 API 함수 + TanStack Query 옵션 생성
3. 생성된 코드는 공통 Axios 인스턴스를 통해 토큰 관리, 401 자동 갱신을 처리

---

## 디자인 시스템

`DESIGN.md`에 완전히 문서화된 디자인 시스템을 운영합니다.

- **테마**: Cobalt Trust (산업/신뢰감) 기본, 4개 산업 테마 지원
- **색상**: OKLCH 기반, 다크모드 지원
- **타이포그래피**: Outfit (헤딩) + DM Sans (본문), 7단계 스케일
- **토큰**: 8단계 간격 체계 (4px base unit), 모션 4단계 (50ms~300ms)

---

## 주요 화면

| 영역 | 페이지 |
|---|---|
| 온보딩 | 로그인, 회원가입, 워크스페이스 설정, 플랜 선택 |
| 부품 | 목록, 생성/수정, 상세(BOM/도면/리비전), BOM 탐색, 도면 뷰어 |
| 변경관리 | 이슈 생성/상세, 엔지니어링 변경 생성/상세 |
| 템플릿 매핑 | BOM 엑셀 분석 → LLM 매핑 제안 → 사용자 확인/커스터마이징 |
| 프로젝트 | 목록, 상세 |
| 설정 | 조직 설정, 사용자 설정 |
| 대시보드 | 메인 대시보드 |

---

## 로컬 실행

```bash
pnpm install
pnpm dev            # 제품 앱
pnpm dev:landing    # 랜딩 페이지
pnpm storybook      # Storybook
```

**API 코드 생성:**

```bash
pnpm --filter @fabbit/web generate:api
```

**환경 변수:**

| 변수 | 설명 |
|---|---|
| `VITE_API_BASE_URL` | 백엔드 API 주소 |
| `VITE_APP_DOMAIN` | 앱 도메인 |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile CAPTCHA |
