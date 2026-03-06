# Handoff: 3-Tier Design System + Storybook 페이지 프로토타이핑

## Goal

3-tier 컴포넌트 아키텍처(`packages/ui` → `packages/components` → `apps/web`)를 구축하고, `apps/storybook`에서 테마 기반으로 UI 프리미티브, 도메인 컴포넌트, **완성된 피처 화면**까지 시각 검증할 수 있게 한다. `apps/web`은 건드리지 않는다.

## Current Progress

### 1. 테마 시스템 (이전 세션에서 완료)

- 10개 Primary 테마 (`packages/theme/src/primary-themes.css`)
- 스토리북 툴바 테마 전환 동작
- Badge 6종 status variant, LabelBadge 등

### 2. packages/ui 프리미티브 (총 40+개)

**이번 세션에서 추가한 것:**
- 1차 배치: Table, Card, Sheet, Breadcrumb, Skeleton, Sonner
- 2차 배치: Accordion, Toggle, ToggleGroup, Pagination, Command, RadioGroup, Slider
- 3차 배치: **Alert** (5 variants), **Calendar** (react-day-picker + date-fns), **HoverCard** (@radix-ui)
- 기존 스토리 누락: **Collapsible** 스토리 추가

모든 UI 스토리에 **Showcase** 섹션 포함. Mock 데이터는 전문용어 제외 전부 한글.

**주의**: `cn()` import 경로는 `./lib/cn`이다 (`@fabbit/utils` 아님).

### 3. packages/components 도메인 컴포넌트 (총 20+개)

**레이아웃 컴포넌트 (신규):**
- `AppHeader` — props-only 헤더 (brand, user, search, notification, menuItems)
- `AppSidebar` — props-only 사이드바 (sections, collapsed, footer, mobileOpen)
- `AppShell` — 레이아웃 셸 (header + sidebar + banner + children, CSS Grid)

**데이터 표시 컴포넌트 (신규):**
- `KpiCard` — KPI 지표 (label, value, change, changePositive)
- `StatusCard` — 설비/항목 상태 (name, status, progress)
- `SummaryCard` — 요약 카드 (icon, label, value, sub, onClick)
- `ActivityList` — 작업 목록 (icon, number, title, label, status, author)
- `UsageCard` — 사용량 카드 (icon, label, used/limit, unit, warningThreshold)
- `TimelineList` — 이력 타임라인 (icon, title, timestamp, badge)
- `DescriptionList` — 키-값 쌍 (items, columns 1/2/3)
- `EmptyState` — 빈 상태 (icon, title, description, actionLabel)
- `StatGroup` — 카드 그리드 배치 (columns 2/3/4)

**폼/필터 컴포넌트 (신규):**
- `FormSection` — 폼 섹션 묶음 (title, description, children)
- `FilterBar` — 검색 + 필터 칩 (searchValue, chips, actions)
- `StepIndicator` — 공정/워크플로우 단계 (steps, currentStepId)

**기존 (이전 세션에서 생성):**
- SelectionDialog, SettingsShell, ProjectListTable, PartsListTable
- IssueSidebar, ChangeRequestSidebar, ChangeRequestDiffTab
- PartHeaderCard, PartDrawingPreview, PartHistoryTab, PartPropertiesTab
- ProjectOverviewTab, ProjectSettingsLabelsTab
- OrganizationAdvancedTab, OrganizationLogsTab
- MappingSaveDialog, SynthesisProgressPanel
- AIUsagePanel, StorageUsagePanel, CardManagementPanel

**규칙**: 컴포넌트 스토리에는 Showcase 섹션 **없음** (UI만 Showcase).

### 4. stories/pages/ 피처 화면 프로토타입

| 페이지 | 아키타입 | 조합 컴포넌트 |
|---|---|---|
| `Pages/Dashboard` | 대시보드 | AppShell + StatGroup + SummaryCard + ActivityList + KpiCard + UsageCard |
| `Pages/IssueDetail` | 상세 화면 | AppShell + IssueSidebar + TimelineList + Badge + Button + Separator |
| `Pages/ProjectList` | 목록 화면 | AppShell + FilterBar + Table + Pagination + EmptyState |

**핵심 규칙**: pages 스토리에서 인라인 div 마크업 금지. 반드시 `@fabbit/ui` + `@fabbit/components`만 조합.
- Dashboard에서 이 규칙을 위반해서 SummaryCard, ActivityList, UsageCard 3개를 도메인 컴포넌트로 추출함.

### 5. 스토리북 빌드

모든 변경 후 `pnpm --filter @fabbit/storybook build-storybook` 성공 확인됨.

## What Worked

- **3-tier 분리**: UI primitive → domain composition → page story 흐름이 명확
- **props-only 도메인 컴포넌트**: API/스토어 의존 없이 스토리북에서 독립 시각화
- **AppShell CSS Grid**: `gridTemplateRows` + `gridTemplateColumns`로 sidebar/header/banner/content 유연한 배치
- **stories/pages/ 패턴**: 새 패키지 없이 피처 화면 프로토타이핑 가능
- **Mock 데이터 한글화**: 전문용어(CNC, AL-6061, WO-2026-0198 등) 제외 모두 한글

## What Didn't Work

- **`@fabbit/utils` import**: UI 컴포넌트에서 `cn`을 `@fabbit/utils`에서 가져오면 storybook 빌드 실패. `./lib/cn`으로 import 해야 함
- **`date-fns` resolve**: Calendar 추가 후 storybook에서 `date-fns` resolve 실패. storybook 패키지에도 `date-fns`, `react-day-picker` 의존성 추가 필요
- **Card에 `asChild` 없음**: Card는 순수 div 기반이라 `asChild` prop이 없음. SummaryCard에서 `onClick` + `role="button"` 패턴으로 해결
- **pages 스토리에서 인라인 마크업**: Dashboard에서 내 작업 목록/사용량 카드를 직접 div로 작성 → 패키지 원칙 위반. 도메인 컴포넌트로 추출해서 해결

## Next Steps

### 즉시 할 일

1. **IssueDetail/ProjectList 스토리 정리**: 아직 일부 인라인 마크업 존재 (이슈 본문 Card, 댓글 입력 영역). 필요 시 도메인 컴포넌트 추출
2. **추가 pages 스토리**: 부품 상세(PartDetail), 설정(Settings), 변경 요청 상세(ChangeRequestDetail) 등
3. **테마 10개 시각 검증**: 특히 Agentic Dark(7)에서 AppShell/AppSidebar 가독성 확인

### 이후 작업

4. **`apps/web` 리팩토링**: 기존 `apps/web/src/components/layout/Header.tsx`, `Sidebar.tsx`를 `@fabbit/components`의 AppHeader/AppSidebar로 교체. 데이터만 주입하는 wrapper 패턴
5. **`apps/web` 페이지 컴포넌트 분리**: 현재 페이지에 인라인된 도메인 UI를 `packages/components`로 올리기 (DashboardPage의 SummaryCard 등)
6. **스킬 파일 업데이트**: `stories/pages/` 패턴과 "pages 스토리는 packages만 조합" 규칙을 cv-component 스킬에 추가

## Key Files

| File | Role |
|------|------|
| `packages/theme/src/primary-themes.css` | 10개 브랜드 테마 |
| `packages/ui/src/index.ts` | UI 프리미티브 전체 export (40+개) |
| `packages/ui/src/alert.tsx` | Alert (5 variants: default/destructive/warning/success/info) |
| `packages/ui/src/calendar.tsx` | Calendar (react-day-picker 래퍼) |
| `packages/ui/src/hover-card.tsx` | HoverCard (@radix-ui 래퍼) |
| `packages/components/src/index.ts` | 도메인 컴포넌트 전체 export (20+개) |
| `packages/components/src/app-header.tsx` | props-only 헤더 |
| `packages/components/src/app-sidebar.tsx` | props-only 사이드바 |
| `packages/components/src/app-shell.tsx` | 레이아웃 셸 (CSS Grid) |
| `packages/components/src/activity-list.tsx` | 작업 목록 컴포넌트 |
| `packages/components/src/summary-card.tsx` | 요약 카드 컴포넌트 |
| `packages/components/src/usage-card.tsx` | 사용량 카드 컴포넌트 |
| `apps/storybook/stories/pages/Dashboard.stories.tsx` | 대시보드 피처 화면 |
| `apps/storybook/stories/pages/IssueDetail.stories.tsx` | 이슈 상세 피처 화면 |
| `apps/storybook/stories/pages/ProjectList.stories.tsx` | 프로젝트 목록 피처 화면 |
| `apps/storybook/.storybook/preview.ts` | 테마 10개 툴바 등록 + decorator |
| `.codex/skills/cv-component/SKILL.md` | 3-tier 컴포넌트 규칙 |
| `.codex/skills/cv-structure/SKILL.md` | 모노레포 구조 규칙 |
