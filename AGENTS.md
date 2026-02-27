# Fabbit web

## 공통

- 백엔드 API는 `openapi.json` 참고해서 진행
- 사용자는 `npm run dev` 로 개발중. 코드 수정이후 `npm run build`로 검증할 필요 없음
- 작업 성격에 맞는 스킬을 먼저 로드해서 사용
  - `frontend-design`: 신규 화면/컴포넌트 UI 구현, 스타일 개선
  - `web-design-guidelines`: UI/UX/a11y 리뷰, 가이드 준수 점검
  - `vercel-react-best-practices`: React/Next 성능 최적화, 렌더링/번들 개선
  - `vercel-composition-patterns`: 컴포넌트 API 설계, compound/render props/context 리팩터링
  - `remotion-best-practices`: Remotion 기반 영상/컴포지션 작업
- 스킬이 겹치면 구현용 스킬 + 리뷰용 스킬 순서로 함께 사용

## 스타일

- Attlasian Design System 을 참고 해서 제작
- UI 컴포넌트는 기본적으로 shadcn/ui 프리미티브(`src/components/ui`)를 기반으로 조합/확장해서 사용
- 새 UI가 필요하면 기존 shadcn 컴포넌트(Button, Input, Select, Badge 등) 재사용을 우선하고, 중복 커스텀 구현은 지양
- 필요한 프리미티브가 없으면 shadcn 컴포넌트를 먼저 추가/도입하고, 그래도 커버되지 않는 경우에만 새 컴포넌트 생성
- 색상은 컴포넌트에 직접 하드코딩하지 않고 토큰(CSS 변수)으로만 사용
- 새 색상/톤 추가 시 "정의 먼저, 사용 나중" 원칙 준수
  - 기본 fallback: `src/index.css`의 `:root`와 `.dark`에 모두 추가(삭제하지 않고 최소 안전값 유지)
  - 브랜드 계열: `src/styles/themes/primary-themes.css`의 모든 `theme-primary-*`에 추가
  - 공통 상태(success/warning/danger/info) 계열: `src/styles/themes/common-themes.css`의 모든 `theme-common-*`에 추가
- 실제 운영/브랜드 값은 `theme-primary-*`, `theme-common-*`에서 우선 관리하고, `:root`/`.dark`는 fallback 역할로 유지
- 특정 테마에만 필요한 토큰을 단독 추가하지 않음(모든 테마에 동일 키로 제공)
- 의미 기반 네이밍 사용 (`--brand-*`, `--status-*`, `--theme-*`)하고 용도 불명 토큰명 금지
- 컴포넌트는 가능하면 클래스 기반으로 적용하고, 인라인 스타일은 CSS 변수 참조가 필요한 최소 범위에서만 사용
- 테마 작업 후 `/dev/design`에서 primary/common 선택 전환으로 시각 검증 후 마무리

## 주석 규칙

- 나중에 구현할 기능은 `// BACKLOG: 구체적 설명` 형식으로 표기
- 설명은 **무엇을**, **왜 미뤘는지**(선행 조건 등)를 구체적으로 작성
- 예: `// BACKLOG: 이력 탭 — 리비전 이력 및 감사 로그 표시. 백엔드 리비전/감사 API 설계 후 구현.`
- `TODO`는 당장 고쳐야 하는 항목, `BACKLOG`은 의도적으로 미룬 기능으로 구분

## TurboRepo 관리 방안

- **web을 개발할때 사용자가 요청하지 않는 이상 packages, storybook을 사용하지 않는다.**
- 새 색상은 반드시 packages/tokens → packages/theme 순서로 추가
- packages/ui 컴포넌트에서 hex/rgb 직접 사용 금지, var(--\*)만 허용
