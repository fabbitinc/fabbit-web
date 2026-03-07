# 12 Tiptap Primitive 패키지 소유권 회수

## 작업 목표

- [x] `packages/ui`의 `TiptapEditor`가 스타일과 멘션 렌더링까지 직접 소유하도록 정리한다.
- [x] `apps/web2`의 앱 로컬 Tiptap 구현(`ChangeRichTextEditor`, 로컬 멘션 구현, 로컬 CSS 중복)을 제거하거나 소비층 수준으로 축소한다.
- [x] `apps/web2`의 이슈/변경 요청 타임라인이 `@fabbit/ui` 기반 에디터를 직접 사용하도록 전환한다.

## 작업 메모

- `apps/web`는 읽기 전용이며, `web`의 Tiptap spacing/멘션 규칙을 기준으로 `packages/ui`에 정리한다.
- `packages/components`는 props-only 조합물로 유지하고, `apps/web2`는 hook/query 연결만 남긴다.
- `apps/web2/src/index.css`에 남아 있는 Tiptap/mention 스타일은 `packages/ui/src/styles.css`로 이동해야 한다.
- 실제 수행:
  - `packages/ui/src/styles.css`에 `.tiptap-content`, `.mention-*`, `.mention-dropdown*`를 이동했다.
  - `apps/web2/src/index.css`에서 Tiptap/mention 스타일을 제거했고, 함께 남아 있던 공용 셸 중복(`app-panel`, `sidebar-*`, `topbar-*`)도 걷어냈다.
  - `apps/web2/src/features/change-request/components/change-request-timeline-section.tsx`
    와 `apps/web2/src/features/issue/components/issue-timeline-section.tsx`는 `@fabbit/ui`의 `TiptapEditor`와 `useTiptapMentionFetchers()`만 사용하도록 바꿨다.
  - `apps/web2`의 로컬 Tiptap 체인(`change-rich-text-editor.tsx`, `change-rich-text-mention.tsx`, `change-rich-text-mention-dropdown.tsx`)과 그 전용 lookup 추상화 파일을 제거했다.
  - `useTiptapMentionFetchers()`는 `changeSharedQueries`를 직접 사용하는 hook으로 단순화했다.

## 완료 결과

- `TiptapEditor` primitive의 스타일 소유권이 `packages/ui`로 모였다.
- `apps/web2`의 타임라인 댓글 작성/수정/읽기 경로는 앱 로컬 에디터 대신 `@fabbit/ui`를 직접 소비한다.
- `apps/web2`에는 Tiptap 전용 앱 로컬 컴포넌트 체인이 남아 있지 않다.
- 이번 단계는 Tiptap primitive 정리까지 완료한 것이고, 전체 과제 기준의 남은 핵심은 여전히 `issue detail` / `change request detail`의 `web` 기준 조합 완전 승격이다.

## 검증 항목

- [x] `pnpm lint:web2`
- [x] `pnpm build:web2`
- [x] `pnpm build-storybook`
