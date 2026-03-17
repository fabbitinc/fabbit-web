# HANDOFF — 부품 상세/편집 레이아웃 정리

## Goal

- 부품 `상세`와 `편집` 화면의 레이아웃 괴리를 줄인다.
- 사용자는 "다른 화면으로 이동했다"보다 "같은 상세 화면에서 편집 상태로 전환됐다"는 감각을 받아야 한다.
- 동시에 `편집 가능한 필드`와 `읽기 전용 필드`는 명확히 구분되어야 한다.

---

## 합의된 원칙

### 1. 헤더 구조

- 헤더는 상세/편집 모두 같은 톤을 유지한다.
- 헤더 본문에는 아래 정보만 남긴다.
  - 품번
  - 리비전
  - 품명
  - 설명
- `카테고리`, `재질`, `단위`, `상태` 같은 값은 헤더가 아니라 `속성` 영역에서 본다.

### 2. 편집 상태 표시는 브레드크럼에서

- 헤더에 `부품 편집` 같은 문구를 크게 넣지 않는다.
- 편집 상태는 브레드크럼에서 `편집 중`으로만 표시한다.
- 사용자는 현재 문맥이 `부품 상세 > 편집 중`임을 이해하면 충분하다.

### 3. 편집 버튼 위치

- `편집` 버튼은 속성 탭 내부보다 `헤더 액션`에 두는 쪽이 맞다.
- draft 상세일 때 헤더 액션은 아래 구조를 따른다.

```text
[ 편집 ]
[ 승인/배포 ]
```

- `DIRECT` 모드에서는 `승인/배포`를 split button으로 묶는다.
- `ENGINEERING_CHANGE_REQUIRED` 모드에서는 직접 승인/배포를 숨긴다.

### 4. 편집 화면 액션

- 편집 화면 헤더 우측 액션은 아래처럼 세로 배치한다.

```text
[ 취소 ]
[ 저장 ]
```

- 버튼 높이는 상세 헤더 액션과 같은 `sm` 높이를 사용한다.
- 현재 기준 폭은 `sm:w-[90px]`.

### 5. 속성 편집은 "같은 표의 편집 상태"처럼 보여야 함

- 가장 중요한 원칙이다.
- 읽기 화면이

```text
품번   TEST-001
품명   테스트 부품
```

처럼 보이는데, 편집 화면이 갑자기

```text
품번
[ TEST-001 ]
```

식의 카드형 폼으로 바뀌면 안 된다.

- 따라서 편집 화면은 `상세와 같은 표 프레임`을 유지하고,
  `값 셀 안에서만 입력 컨트롤이 활성화된 상태`처럼 보여야 한다.

---

## 현재 구현 상태

### 반영된 것

- 헤더 정보 단순화
  - `packages/components/src/part-header-card.tsx`
- 읽기/편집 공용 표 프레임 분리
  - `packages/components/src/part-properties-table.tsx`
- 상세 속성 탭은 공용 표 사용
  - `packages/components/src/part-properties-tab.tsx`
- 편집 화면도 동일한 표 프레임 사용
  - `packages/components/src/part-editor-screen.tsx`
- 헤더 액션 위치 정리
  - `apps/web/src/features/parts/components/part-detail-screen.tsx`
- `DIRECT` 모드 승인/배포 split button 적용
  - `apps/web/src/features/parts/components/part-direct-workflow-actions.tsx`

### 아직 어색한 점

- 편집 화면을 표 기반으로 바꾸면서 입력 컨트롤을 너무 평평하게 눌렀더니,
  어떤 필드가 편집 가능한지 직관이 약해졌다.
- 반대로 기본 Input/Select 스타일을 그대로 쓰면
  `표 안에 또 다른 카드가 들어간` 느낌이 강해진다.

즉 현재 핵심 과제는 이 균형이다.

```text
상세와 최대한 같아야 함
vs
편집 가능하다는 신호는 보여야 함
```

---

## 권장 해결 방향

### 목표 상태

- 표 구조는 상세와 동일
- 편집 가능한 값 셀만 `subtle input` 상태
- 읽기 전용 값은 상세와 거의 동일

### 추천 스타일 규칙

#### 편집 가능 필드

- 완전 평면 텍스트로 두지 않는다.
- 아래 중 하나 수준의 약한 입력 상태를 준다.
  - 아주 연한 배경
  - 1px 연한 테두리
  - hover/focus 시만 조금 더 진해지는 스타일
- 핵심은 `카드형 input`이 아니라 `편집 가능한 셀`처럼 보여야 한다는 점이다.

#### 읽기 전용 필드

- 품번, 리비전, 상태처럼 수정 불가인 필드는 읽기 텍스트처럼 유지한다.
- disabled input처럼 보이면 오히려 전체가 "편집 폼"처럼 느껴져서 상세와 멀어진다.

#### Select

- 셀렉트는 chevron이 보여야 한다.
- chevron은 "이 값은 선택 가능한 필드"라는 가장 직관적인 신호다.
- 다만 외곽 박스는 너무 두껍지 않게 눌러야 한다.

#### Textarea

- 설명은 완전 평면보다 약한 박스 유지가 낫다.
- 이유:
  - 여러 줄 입력 영역이라는 사실을 보여줘야 함
  - 읽기 상태와 동일하게 만들면 편집성이 너무 떨어짐

#### Switch

- `팬텀`처럼 토글형 필드는 현재처럼 우측 스위치를 유지하는 게 맞다.
- 다만 별도 카드 박스는 피하고, 일반 표 행 안에서 정리한다.

---

## 생성 화면 규칙

- 생성 화면은 편집 화면과 비슷한 shell을 쓰되,
  `미리보기 영역`은 굳이 둘 필요 없다.
- 생성의 목적은 초기 속성 입력이므로,
  레이아웃은 상세와 닮아도 내용은 더 단순해야 한다.
- 생성 화면에서도 속성 영역은 같은 표 톤을 유지하는 것이 좋다.

---

## 미리보기 영역 규칙

- 상세 속성 탭의 미리보기 영역은 유지
- 편집 화면에서도 같은 위치에 유지
  - 단, 편집 화면에서는 `참조용`
  - 미리보기 설정 액션은 상세 책임
- 생성 화면은 미리보기 영역 없이 시작해도 됨

---

## 다음 작업 우선순위

1. `subtle input` 스타일 확정
   - 표 프레임은 유지
   - 편집 가능 필드만 약한 입력 상태 부여

2. 읽기 전용 필드/편집 가능 필드 분리
   - 수정 불가 필드는 텍스트 렌더 유지 검토
   - 수정 가능 필드만 Input/Select/Texarea 사용

3. Storybook 비교 스토리 추가/정리
   - 상세 속성 탭
   - 편집 화면
   - 같은 데이터로 두 화면을 나란히 비교 가능하게

4. 생성 화면에도 같은 표 패턴 적용 여부 확인
   - 편집과 동일한 표 톤 유지
   - 생성 전용 안내는 최소화

---

## 바로 봐야 할 파일

- `packages/components/src/part-header-card.tsx`
- `packages/components/src/part-properties-table.tsx`
- `packages/components/src/part-properties-tab.tsx`
- `packages/components/src/part-editor-screen.tsx`
- `apps/web/src/features/parts/components/part-detail-screen.tsx`
- `apps/web/src/features/parts/components/part-direct-workflow-actions.tsx`
- `apps/storybook/stories/components/PartEditorScreen.stories.tsx`
- `apps/storybook/stories/components/PartHeaderCard.stories.tsx`

---

## 한 줄 요약

- 헤더는 단순하게
- 편집 상태는 브레드크럼으로
- 액션은 헤더에
- 속성 본문은 상세와 같은 표를 유지
- 다만 편집 가능한 셀은 "살짝 입력 가능해 보이게" 만들어야 한다
