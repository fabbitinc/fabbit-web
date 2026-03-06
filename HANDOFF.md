# Handoff: Design System (packages/ui + storybook)

## Goal

`packages/ui`와 `apps/storybook`에서 테마 기반 디자인 시스템을 완성한다.
`apps/web`은 건드리지 않는다 — 디자인 시스템 완료 후 별도 마이그레이션 예정.

## Current Progress

### 1. 테마 시스템 구축 완료

- **10개 Primary 테마** (`packages/theme/src/primary-themes.css`):
  1. Eco-Digital Sustainability (틸 그린)
  2. High-Tech Precision (시안 블루)
  3. Moody Heritage (다크 슬레이트 + 엠버)
  4. Blueprint Blue (시그널 블루) - PLM 추천 1순위
  5. Professional Ink (잉크 블랙)
  6. Neo-Mint Wellness (민트 틸)
  7. Agentic Dark (시안 on 차콜) - 유일한 다크 테마
  8. Mossy Production (모스 그린) - PLM 추천 3순위
  9. Kinetic Energy (엠버 오렌지)
  10. Elevated Mahogany (마호가니)

- **각 테마에 포함된 토큰 그룹**:
  - Brand (brand-50/500/600, accent-500)
  - AI gradient (ai-from/to/hover/text)
  - Logo gradient (logo-from/to)
  - Theme surface (text-primary/secondary, border, surface, background)
  - Base shadcn 토큰 매핑 (primary, secondary, muted, accent, destructive, background, foreground, card, popover, border, input, ring, sidebar-*)
  - Nav tokens (topbar-*, sidebar-*, resizer-*)
  - Status tokens (success/warning/danger/info/neutral/accent - 각 fg/bg/border)

- **Common 테마** (`common-themes.css`): theme-common-1 하나, status 6종(success/warning/danger/info/neutral/accent)

- **Core tokens** (`core-tokens.css`): `:root`와 `.dark` fallback. neutral/accent status 토큰 추가됨.

- **Tailwind 매핑** (`packages/ui/src/styles.css`): `@theme inline`에 `--color-status-*` 18개 매핑 추가.

### 2. Badge 컴포넌트 status variant 추가 완료

- `packages/ui/src/badge.tsx`에 6개 variant 추가: `success`, `warning`, `danger`, `info`, `neutral`, `accent`
- 모두 `bg-status-*-bg text-status-* border-status-*-border` 패턴
- 기존 shadcn variant (default, secondary, destructive, outline, ghost, link) 유지

### 3. Storybook 구성 완료

- **`apps/storybook/.storybook/preview.ts`**: 10개 테마 전부 툴바에 등록
- **`apps/storybook/.storybook/preview.css`**: 테마 CSS import
- **Color Palette 스토리** (`stories/ColorPalette.stories.tsx`):
  - `Palette` (Token Palette): 브랜드/AI/로고/테마/네비/상태 토큰을 시각 스워치로 표시
  - `Components` (Component Preview): `Showcase` 스토리만 자동 수집
- **UI 스토리 파일별 `Showcase` 스토리 추가 완료**:
  - Badge, Button, Input, Textarea, Controls(Checkbox/Switch/Select/OTP), Feedback(Progress), Navigation(Tabs/ScrollArea/Separator), Overlays(Popover/Tooltip/DropdownMenu), ConfirmDialog, UserAvatar

### 4. Base shadcn 토큰 → 테마 연결 완료

각 primary-theme이 `--primary`, `--background`, `--foreground`, `--border` 등 기본 shadcn 토큰을 override하여, 테마 전환 시 Button/Checkbox/Switch/Progress 등 모든 UI가 브랜드 색상을 반영함.

## What Worked

- **CSS 변수 참조 (`var()`)**: 테마 내에서 `--primary: var(--brand-500)` 패턴으로 중복 최소화. 9개 라이트 테마가 동일한 `var()` 매핑 사용.
- **`@layer components` 제거**: 이전 세션에서 테마 CSS의 `@layer components` 래퍼를 제거하여 specificity 문제 해결. 테마 클래스가 `:root` fallback을 정상 override.
- **`import.meta.glob` auto-scan**: `stories/ui/*.stories.tsx`에서 `Showcase` export만 자동 수집하여 Component Preview 구성.
- **NotebookLM 리서치**: 2026 색상 트렌드를 기반으로 테마 방향성 결정 (기존 "2026 웹 UI/UX 디자인 트렌드" 노트북 활용).

## What Didn't Work

- **MDX → CSF 전환 필요**: MDX 페이지에서는 decorator가 실행되지 않아 테마 전환이 안됨. CSF `.stories.tsx`로 전환 후 해결.
- **`@layer components`로 테마 감싸기**: Tailwind v4에서 layer 우선순위 문제로 테마 값이 적용 안됨. layer 제거 필수.
- **Storybook decorator `minHeight: "100vh"`**: 모든 스토리에 적용되면 Badge 같은 작은 컴포넌트에 거대한 빈 공간 생김. `context.parameters.layout === "fullscreen"` 조건부 적용으로 해결.

## Next Steps

### 즉시 할 일

1. **스토리북 시각 검증**: 10개 테마 전환하면서 모든 Showcase가 정상 렌더되는지 확인. 특히 테마 7(Agentic Dark)의 다크 배경에서 가독성 체크.
2. **LabelBadge 컴포넌트 검토**: 현재 동적 hex 기반 인라인 스타일 사용 중. 디자인 시스템 토큰과의 관계 정리 필요 (사용자 커스텀 라벨이므로 현행 유지 가능).
3. **다크 모드 토큰 정합성**: 테마 7은 자체 다크이지만, 다른 테마 + colorMode=dark 조합 시 `:root` → `.dark` → `.theme-primary-*` 우선순위 확인 필요.

### 이후 작업

4. **`apps/web` 마이그레이션**: 하드코딩된 Tailwind 기본 팔레트(`emerald-200`, `gray-500` 등)를 디자인 토큰으로 교체. 43개 파일에서 약 1009건의 hex 사용 확인됨.
5. **추가 UI 컴포넌트**: `packages/ui`에 필요한 컴포넌트 추가 시 반드시 토큰 기반으로 구현 + Showcase 스토리 포함.
6. **테마 최종 선정**: 제조/PLM용 추천 — Blueprint Blue(4), High-Tech Precision(2), Mossy Production(8).

## Key Files

| File | Role |
|------|------|
| `packages/theme/src/primary-themes.css` | 10개 브랜드 테마 (brand + nav + status + base shadcn 토큰) |
| `packages/theme/src/common-themes.css` | 공통 상태 색상 테마 |
| `packages/theme/src/core-tokens.css` | `:root` / `.dark` fallback |
| `packages/ui/src/styles.css` | Tailwind `@theme inline` 매핑 |
| `packages/ui/src/badge.tsx` | 6종 status variant 포함 |
| `apps/storybook/.storybook/preview.ts` | 테마 10개 툴바 등록 + decorator |
| `apps/storybook/stories/ColorPalette.stories.tsx` | Token Palette + Component Preview |
| `apps/storybook/stories/ui/*.stories.tsx` | 각 컴포넌트별 Showcase 스토리 |
