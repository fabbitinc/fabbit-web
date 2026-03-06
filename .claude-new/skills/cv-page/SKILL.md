---
name: cv-page
description: 프론트엔드 Page 레이어 규칙을 적용한다. 라우트 진입점 역할, URL 파라미터 파싱, 레이아웃 구성, 데이터 로딩 위임, 탭/서브탭 패턴 정리가 필요할 때 사용한다. 페이지 추가/수정, 라우팅 구성, 레이아웃 변경 작업에서 사용한다.
---

# Page Conventions

## 목표

- Page를 라우트 진입점(controller 대응) 계층으로 유지하라.
- Page는 hook과 component를 조합만 하고 직접 로직을 수행하지 마라.
- 이 스킬은 Page 규칙만 다루고 다른 레이어의 코드 작성 규칙은 다루지 마라.

## 네이밍 규칙

- 페이지 컴포넌트: `{Feature}Page` (`IssuePage`, `SettingsPage`)
- 레이아웃 컴포넌트: `{Feature}Layout` (`DashboardLayout`, `SettingsLayout`)
- 파일명: `{feature}-page.tsx`, `{feature}-layout.tsx`
- 배치: `pages/{feature}/`

## 페이지 역할 규칙

- Page는 라우트 진입점이다. 백엔드 controller와 동일한 역할로 취급하라.
- Page가 수행하는 것: URL 파라미터 파싱, hook 호출, component 조합, 레이아웃 선택.
- Page가 수행하지 않는 것: API 직접 호출, 비즈니스 로직, 상태 계산, 데이터 변환.

## URL 파라미터 규칙

- URL 파라미터 파싱은 Page에서만 수행하라.
- `useParams`, `useSearchParams`는 Page 레벨에서 호출하라.
- 파싱한 값을 하위 component와 hook에 props/인자로 전달하라.
- 하위 component에서 `useParams`/`useSearchParams`를 직접 호출하지 마라.
- 유효하지 않은 파라미터(잘못된 ID, 없는 탭 등)는 Page에서 처리하라 (리다이렉트 또는 에러).

## 레이아웃 규칙

- 레이아웃은 페이지와 같은 폴더에 배치하라.
- 레이아웃은 공통 UI 구조(사이드바, 헤더, 네비게이션)만 담당하라.
- 레이아웃에서 API 호출이나 비즈니스 로직을 수행하지 마라.
- 중첩 레이아웃이 필요하면 React Router의 `Outlet`을 사용하라.

## 탭/서브탭 패턴

- 탭 상태는 URL 파라미터(`?menu=`, `?tab=`)로 관리하라. 로컬 state로 관리하지 마라.
- 기본 탭은 파라미터를 생략하라 (URL 깔끔하게 유지).
- 유효 탭 목록은 상수로 관리하라 (`VALID_TABS` Set 또는 union type).
- 각 탭의 콘텐츠는 독립 컴포넌트로 분리하라.
- 데이터 페칭은 탭 콘텐츠 컴포넌트 내부에서 수행하라 (lazy loading).

### 탭 추가 시 수정 체크리스트

탭 기반 페이지에 새 탭을 추가할 때 파일 상단에 아래 형식의 주석을 유지하라:

```
// ── 탭 수정 체크리스트 ──
// 1. Tab union type에 새 탭 ID 추가
// 2. VALID_TABS Set에 새 탭 ID 추가
// 3. tabs 배열에 { id, label, icon } 추가
// 4. 탭 콘텐츠 컴포넌트 생성 및 연결
```

## 데이터 로딩 위임 규칙

- Page에서 직접 `useQuery`를 호출하지 마라.
- query hook을 호출하거나, 탭 콘텐츠 컴포넌트에 위임하라.
- 전역 데이터(인증 사용자, 조직 정보)는 레이아웃 또는 상위 provider에서 로딩하라.
- 페이지 진입 시 필요한 데이터가 아직 없으면 로딩/에러 상태를 Page에서 처리하라.

## 가드/리다이렉트 규칙

- 인증/인가 가드는 레이아웃 또는 라우터 가드에서 처리하라. Page 내부에서 처리하지 마라.
- 온보딩 미완료, 권한 부족 등 조건부 리다이렉트는 가드 컴포넌트로 분리하라.
- Page는 "이 페이지에 도달했으면 이미 인증/인가가 통과된 상태"를 전제로 작성하라.

## 적용 절차

1. 라우트 경로와 URL 파라미터를 먼저 확정하라.
2. `{feature}-page.tsx`를 `pages/{feature}/`에 생성하라.
3. URL 파라미터 파싱을 Page에서 수행하라.
4. 필요한 hook을 호출하고 component를 조합하라.
5. 레이아웃이 필요하면 `{feature}-layout.tsx`를 같은 폴더에 생성하라.
6. 탭이 필요하면 URL 파라미터 기반 탭 패턴을 적용하라.
7. Page에 비즈니스 로직이나 직접 API 호출이 없는지 점검하라.

## 빠른 체크리스트

- 파일명이 `{feature}-page.tsx` 규칙을 따르는가?
- Page가 hook과 component 조합만 수행하는가?
- Page에서 직접 API 호출(`fetch`, `axios`, `useQuery` 인라인)이 없는가?
- URL 파라미터 파싱이 Page에서만 이뤄지는가?
- 하위 component가 `useParams`/`useSearchParams`를 직접 호출하지 않는가?
- 탭 상태가 URL 파라미터로 관리되는가 (로컬 state 아님)?
- 탭 콘텐츠 컴포넌트가 독립적이고 자체 데이터 페칭을 수행하는가?
- 인증/인가 가드가 Page 외부(라우터/레이아웃)에서 처리되는가?
- 레이아웃에 비즈니스 로직이 없는가?
