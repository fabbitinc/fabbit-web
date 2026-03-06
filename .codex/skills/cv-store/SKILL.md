---
name: cv-store
description: 프론트엔드 전역 상태(Zustand) 관리 규칙을 적용한다. 스토어 생성, 슬라이스 분리, 서버 상태와의 경계, persist 전략, 셀렉터 최적화 규칙 정리가 필요할 때 사용한다. 전역 상태 추가/수정, Zustand 스토어 작업에서 사용한다.
---

# Store Conventions

## 목표

- Store를 클라이언트 UI 상태 전용 계층으로 유지하라.
- 서버 상태(TanStack Query)와 클라이언트 상태(Zustand)의 경계를 명확히 하라.
- 이 스킬은 Store 규칙만 다루고 다른 레이어의 코드 작성 규칙은 다루지 마라.

## 서버 상태 vs 클라이언트 상태

| 구분 | 관리 도구 | 예시 |
|---|---|---|
| 서버 상태 | TanStack Query | 이슈 목록, 멤버 정보, 프로젝트 설정 |
| 클라이언트 상태 | Zustand | 사이드바 열림/닫힘, 테마, 인증 토큰, 모달 상태 |

- 서버에서 온 데이터를 Zustand에 복사하지 마라. TanStack Query 캐시가 단일 소스다.
- Zustand에는 UI 상태, 사용자 환경설정, 인증 정보만 저장하라.

## 네이밍 규칙

- 스토어 파일명: `{domain}-store.ts` (`auth-store.ts`, `sidebar-store.ts`)
- 스토어 hook: `use{Domain}Store` (`useAuthStore`, `useSidebarStore`)
- 액션 함수: 동사 기반 (`toggleSidebar`, `setTheme`, `clearAuth`)
- 슬라이스: `{domain}Slice` (슬라이스 분리 시)

## 파일 구조

```
# feature 전용 스토어
features/{feature}/stores/
  {domain}-store.ts

# 공유 스토어
src/stores/
  auth-store.ts
  sidebar-store.ts
  theme-store.ts
```

## 스토어 생성 규칙

- `create`로 스토어를 생성하라.
- 상태(state)와 액션(action)을 같은 스토어에 정의하라.
- 타입을 interface로 먼저 정의하고 `create<StoreType>()`으로 생성하라.
- 파생 값(computed)은 스토어에 저장하지 마라. 셀렉터 또는 hook에서 계산하라.

## 슬라이스 분리 규칙

- 스토어가 단일 관심사를 넘어서면 슬라이스로 분리하라.
- 분리 기준: 상태 필드가 8개를 넘거나, 서로 독립적인 상태 그룹이 2개 이상일 때.
- 슬라이스는 같은 파일 내 함수로 분리하라. 별도 파일은 필요 시에만 생성하라.

## Persist 규칙

- 브라우저 새로고침 후에도 유지해야 하는 상태만 persist하라.
- persist 대상: 인증 토큰, 테마 선호, 사이드바 상태 등.
- persist 제외: 모달 열림, 임시 폼 상태, 로딩 상태 등.
- `persist` 미들웨어를 사용하라. storage는 `localStorage`를 기본으로 하라.
- `partialize`로 persist 대상 필드를 명시적으로 지정하라. 전체 상태를 persist하지 마라.
- `version`을 관리하고 `migrate`로 스키마 변경을 처리하라.

## 셀렉터 규칙

- 컴포넌트에서 스토어를 사용할 때 반드시 셀렉터로 필요한 상태만 구독하라.
- 전체 스토어를 구독하지 마라 (`useAuthStore()` 대신 `useAuthStore((s) => s.user)`).
- 여러 필드가 필요하면 `useShallow`로 얕은 비교를 적용하라.
- 자주 사용하는 셀렉터는 스토어 파일에 미리 정의하라.

## 의존성 규칙

```
허용되는 import:

store -> types (only)
```

- 스토어에서 API를 직접 호출하지 마라. API 호출 후 스토어 업데이트는 action hook에서 수행하라.
- 스토어에서 다른 스토어를 import하지 마라. 스토어 간 연동이 필요하면 hook에서 조합하라.
- 스토어에서 컴포넌트, hook을 import하지 마라.

## 액션 규칙

- 액션은 동기 함수로 유지하라. 비동기 작업(API 호출)을 액션에 넣지 마라.
- 상태 변경은 `set`으로만 수행하라. 직접 mutation을 금지한다.
- 초기화 액션(`reset`, `clear`)을 제공하라 (로그아웃, 페이지 이탈 시 정리용).

## 적용 절차

1. 상태가 서버 상태인지 클라이언트 상태인지 먼저 판단하라.
2. 서버 상태면 TanStack Query를 사용하라. Zustand에 넣지 마라.
3. 클라이언트 상태면 feature 전용인지 공유인지 결정하라.
4. 스토어 interface를 먼저 정의하라.
5. persist가 필요한 필드를 결정하고 `partialize`로 명시하라.
6. 셀렉터를 미리 정의하라.
7. 초기화 액션(`reset`)을 포함하라.

## 빠른 체크리스트

- 서버에서 온 데이터를 Zustand에 복사하지 않는가?
- 스토어가 클라이언트 UI 상태만 관리하는가?
- 컴포넌트에서 셀렉터로 필요한 상태만 구독하는가?
- 전체 스토어를 구독하는 곳이 없는가?
- persist 대상이 `partialize`로 명시됐는가?
- persist에 `version`이 설정됐는가?
- 액션이 동기 함수인가? (비동기 API 호출이 없는가?)
- 스토어에서 다른 스토어를 import하지 않는가?
- 스토어에서 API/hook/컴포넌트를 import하지 않는가?
- 초기화 액션(`reset`/`clear`)이 있는가?
