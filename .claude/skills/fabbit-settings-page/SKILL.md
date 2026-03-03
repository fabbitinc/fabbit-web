---
name: fabbit-settings-page
description: 조직 설정(OrganizationSettingsPage) 또는 사용자 설정(UserSettingsPage) 화면에 메뉴/탭을 추가하거나 수정할 때 사용. 'settings', '설정', '조직 설정', '사용자 설정' 키워드가 포함된 작업에서 자동 적용.
user-invocable: false
---

# 설정 화면 구현 규칙

조직 설정(`OrganizationSettingsPage`)과 사용자 설정(`UserSettingsPage`)에 공통 적용되는 패턴.

## 1. URL 기반 메뉴/탭 라우팅

- 사이드바 메뉴 선택: `?menu=<tab-id>` (기본 탭이면 `menu` 파라미터 삭제)
- 내부 서브탭 선택: `?menu=<tab-id>&tab=<sub-tab-id>` (기본 서브탭이면 `tab` 파라미터 삭제)
- `useSearchParams`로 읽고 쓰기

### 메뉴 추가 시 반드시 수정할 3곳

1. **타입**: `SettingsTab` union에 새 탭 ID 추가
2. **유효성 Set**: `VALID_TABS`(또는 `VALID_MENUS`)에 새 탭 ID 추가
3. **탭 배열**: `settingsTabs`(또는 `tabs`)에 `{ id, label, icon }` 항목 추가

## 2. Lazy 데이터 페칭

**모든 API 호출은 해당 탭/서브탭 컴포넌트 내부에서만 수행한다.**

- 부모 컴포넌트(`OrganizationSettingsPage`, `UserSettingsPage`)에서 API 훅을 호출하지 않는다
- 각 탭의 UI와 데이터 로직은 독립된 서브 컴포넌트로 분리한다
- React Query 훅(`useQuery`, `useMutation`)은 서브 컴포넌트 내부에 배치하여, 해당 탭이 렌더링될 때만 API가 호출되도록 한다

```
// 좋음: 서브 컴포넌트 내부에서 데이터 페칭
function MembersUsersTabContent() {
  const { data } = useMembers(); // 멤버 탭 진입 시에만 호출
  ...
}

// 나쁨: 부모에서 데이터 페칭
function OrganizationSettingsPage() {
  const { data } = useMembers(); // 모든 탭에서 항상 호출됨
  ...
}
```

## 3. 서브탭 구조

메뉴 안에 내부 탭이 필요할 때:

- 서브탭 상태도 URL `tab` 파라미터로 관리
- 탭 UI는 `flex gap-1 border-b` 패턴의 버튼 목록 사용
- 활성 탭 표시: `absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground` 언더라인
- 각 서브탭 콘텐츠는 독립 컴포넌트로 분리

## 4. 사이드바 아이콘 일관성

- 설정 사이드바 메뉴의 아이콘은 메인 사이드바(`Sidebar.tsx`)의 동일 기능 아이콘과 통일
- 예: 부품 = `Package`, 변경 관리 = `GitPullRequestArrow`
