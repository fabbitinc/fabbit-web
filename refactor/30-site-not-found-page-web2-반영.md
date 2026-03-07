# 30. 워크스페이스 없음 페이지 `web2` 반영

## 목표

- `apps/web`에만 남아 있던 `워크스페이스를 찾을 수 없습니다` 화면의 시각 정보를 `apps/web2`에도 반영한다.
- `web2`에서 별도 해석된 카드형 화면이 아니라 `web`와 동일한 레이아웃과 톤으로 보이게 맞춘다.

## 변경 내용

- `apps/web2/src/app/components/site-not-found-page.tsx`
  - `apps/web/src/App.tsx`의 `SiteNotFoundPage` 마크업과 클래스 구성을 그대로 복제했다.
  - 배경, 로고, 문구, 주소 바, 간격 값을 `web` 구현과 동일하게 맞췄다.
  - 서브도메인 표시는 `web`과 동일하게 `VITE_APP_DOMAIN`과 현재 hostname을 조합해 계산한다.

## 검증

- `pnpm --filter @fabbit/web2 exec tsc --noEmit`
- `pnpm lint:web2`
- `pnpm build:web2`

## 메모

- 이번 변경은 토큰 기반 재해석보다 시각 패리티를 우선해 `web` 구현을 그대로 가져오는 방식으로 정리했다.
