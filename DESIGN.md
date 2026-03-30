# Design System — fabbit

## Product Context
- **What this is:** 하드웨어 스타트업/중소제조기업을 위한 클라우드 PLM SaaS
- **Who it's for:** 하드웨어 엔지니어, PLM 관리자, 제조 팀
- **Space/industry:** PLM (Product Lifecycle Management), 하드웨어 제조
- **Project type:** 데이터 중심 웹 앱 (부품 관리, BOM, 엔지니어링 변경, 이슈 트래킹)

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian + 따뜻함
- **Decoration level:** Minimal. 타이포그래피와 여백이 일을 한다.
- **Mood:** 단단하고 신뢰감 있지만 차갑지 않은 도구. 하드웨어 엔지니어가 매일 쓰고 싶은 느낌.
- **Differentiation:** PLM 경쟁사들(Arena, Teamcenter)의 차갑고 무거운 엔터프라이즈 느낌 대신, 기능적이면서도 사람 가까운 느낌. Duro의 모던함 + 더 개성 있는 색상(cobalt + amber).

## Theme Architecture

`packages/theme/src/`에 CSS variable 기반 토큰 시스템이 정의되어 있음.

### 테마 구조
- **core-tokens.css:** 기본 UI 토큰 (OKLCH 색상, radius, 네비게이션)
- **primary-themes.css:** 4개 산업 테마 (brand, accent, AI gradient, surface)
- **common-themes.css:** 테마 간 공유 토큰 (status, file icon 색상)

### 현재 적용 테마
- **웹앱 (apps/web):** `theme-primary-4` (Cobalt Trust)
- **랜딩 (apps/landing):** `theme-primary-1` (Blueprint Blue)

### Theme 4: Cobalt Trust (웹앱 기본)
| Token | Value | Usage |
|-------|-------|-------|
| `--brand` | `#002c8c` | deep cobalt. 사이드바 active, 주요 액션 |
| `--accent` | `#fab005` | bright amber. 보조 강조, AI 인디케이터 |
| `--ai-from` → `--ai-to` | `#002c8c` → `#fab005` | AI 기능 그라디언트 |
| `--theme-surface` | `#f8f9fa` | 밝은 neutral gray 배경 |

### Brand Tokens (전체 공유)
| Token | Value | Usage |
|-------|-------|-------|
| `--brand-50` | `#eef4ff` | active 배경, 선택 상태 |
| `--brand-500` | `#2563eb` | 기본 브랜드 블루 |
| `--brand-600` | `#1d4ed8` | hover 상태 |
| `--accent-500` | `#7c3aed` | 보라색 강조 (AI 관련) |

### Status Colors
| Status | Value | Background |
|--------|-------|------------|
| Success | `#16a34a` | `#f0fdf4` |
| Warning | `#d97706` | `#fffbeb` |
| Danger | `#dc2626` | `#fef2f2` |
| Info | `#0284c7` | `#eff6ff` |

## Typography

### Fonts
| Role | Font | Source | Usage |
|------|------|--------|-------|
| Heading / Display | **Outfit** | `@fontsource-variable/outfit` | 페이지 제목, 섹션 헤딩, 통계 숫자 |
| Body | **DM Sans** | `@fontsource-variable/dm-sans` | 본문, 설명, 라벨, 버튼 |
| Data / Tables | system default (DM Sans) | — | 테이블 셀, 품번, 날짜. `font-variant-numeric: tabular-nums` 사용 |
| Code | monospace (system) | — | 코드 블록, 기술 데이터 |

### Typography Scale
| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| Display | 36px / 2.25rem | 700 | 1.2 | -0.02em | 페이지 히어로 제목 |
| H1 | 28px / 1.75rem | 600 | 1.3 | -0.01em | 페이지 제목 |
| H2 | 22px / 1.375rem | 600 | 1.35 | -0.01em | 섹션 제목 |
| H3 | 18px / 1.125rem | 600 | 1.4 | 0 | 서브섹션, 카드 제목 |
| H4 | 16px / 1rem | 600 | 1.4 | 0 | 작은 제목, 모달 제목 |
| Body | 14px / 0.875rem | 400 | 1.6 | 0 | 본문, 설명 |
| Body Small | 13px / 0.8125rem | 400 | 1.5 | 0 | 테이블 셀, 보조 정보 |
| Caption | 12px / 0.75rem | 500 | 1.4 | 0.02em | 라벨, 헬퍼 텍스트 |
| Overline | 11px / 0.6875rem | 600 | 1.3 | 0.08em | 섹션 라벨 (uppercase) |

## Color
- **Approach:** Restrained. 1개 브랜드 색 + 1개 accent + neutrals. 색상은 의미가 있을 때만.
- **Color Format:** OKLCH (core-tokens.css에서 사용)
- **Dark Mode:** `.dark` 클래스 기반. 배경/전경 반전, 보더에 semi-transparent white 사용.

### Neutral Scale (Light Mode)
| Token | OKLCH | Approx Hex | Usage |
|-------|-------|------------|-------|
| `--background` | `oklch(1 0 0)` | `#ffffff` | 페이지 배경 |
| `--card` | `oklch(1 0 0)` | `#ffffff` | 카드, 모달 배경 |
| `--muted` | `oklch(0.967 0 0)` | `#f5f5f5` | 비활성 배경, 테이블 헤더 |
| `--border` | `oklch(0.922 0 0)` | `#e5e5e5` | 보더 |
| `--muted-foreground` | `oklch(0.556 0 0)` | `#737373` | 보조 텍스트 |
| `--foreground` | `oklch(0.145 0 0)` | `#1a1a1a` | 주요 텍스트 |

## Spacing
- **Base unit:** 4px (Tailwind 기본값 사용)
- **Density:** Comfortable (일반 UI), Compact (테이블, 데이터 밀도 높은 영역)

| Token | Value | Usage |
|-------|-------|-------|
| 2xs | 2px | 미세 간격 |
| xs | 4px | 인라인 요소 간격 |
| sm | 8px | 컴팩트 패딩, 아이콘 간격 |
| md | 16px | 기본 패딩, 카드 내부 |
| lg | 24px | 섹션 간격, 모달 패딩 |
| xl | 32px | 대 섹션 간격 |
| 2xl | 48px | 페이지 섹션 간 |
| 3xl | 64px | 히어로/대형 간격 |

## Layout
- **Approach:** Grid-disciplined. 데이터 밀도가 높으므로 예측 가능한 정렬 우선.
- **Max content width:** 1280px (일반), 전체 너비 (테이블, 목록)
- **Sidebar:** 220px 고정 너비

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 0.625rem (10px) | 기본 radius |
| sm | 0.25rem (4px) | 버튼, 인풋, 배지 |
| md | 0.375rem (6px) | 드롭다운, 팝오버 |
| lg | 0.5rem (8px) | 카드, 모달 |
| xl | 0.75rem (12px) | 대형 카드, 섹션 |
| full | 9999px | 아바타, 토글 |

## Motion
- **Approach:** Minimal-functional. 상태 전환과 피드백만.
- **원칙:** 엔지니어링 도구는 빠르고 예측 가능해야 한다. 장식적 애니메이션 없음.

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 50-100ms | ease-out | 호버, 포커스 링 |
| Short | 150ms | ease-out | 토글, 체크박스, 드롭다운 |
| Medium | 200-250ms | ease-in-out | 모달 진입/퇴장, 사이드바 |
| Toast | 300ms | ease-out | 알림 슬라이드인 |

## Component Patterns

### UI Package (`packages/ui/`)
- shadcn/ui 기반 프리미티브 컴포넌트
- Tailwind CSS v4 `@theme` 문법으로 CSS variable 매핑
- `packages/ui/src/styles.css`에서 토큰 소비

### Components Package (`packages/components/`)
- 도메인 조합 컴포넌트 (PartsListScreen, EngineeringChangeDetailScreen 등)
- UI 프리미티브를 조합하여 PLM 도메인 화면 구성

### File Icon Colors
| Type | Color | Usage |
|------|-------|-------|
| PDF | `#dc2626` | PDF 문서 |
| Document | `#2563eb` | 워드/텍스트 |
| CAD | `#0891b2` | CAD 파일 |
| Sheet | `#16a34a` | 스프레드시트 |
| Image | `#7c3aed` | 이미지 |
| Archive | `#78716c` | 압축 파일 |
| Code | `#d97706` | 코드 파일 |

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-30 | DESIGN.md 초기 생성 | 기존 `packages/theme/` 토큰을 문서화. /design-consultation + /plan-design-review 결과 반영 |
| 2026-03-30 | Typography scale 정의 | 기존 코드에 명시적 스케일 없었음. Tailwind 기본값 기반으로 PLM 데이터 밀도에 맞게 정의 |
| 2026-03-30 | Motion 토큰 정의 | 기존 코드에 중앙화된 motion 토큰 없었음. 엔지니어링 도구에 맞는 minimal-functional 접근 |
| 2026-03-30 | Cobalt Trust 테마를 웹앱 기본으로 문서화 | 이미 `theme-primary-4`로 적용 중이었음을 공식화 |
