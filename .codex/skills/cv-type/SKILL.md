---
name: cv-type
description: 프론트엔드 타입 정의 규칙을 적용한다. API DTO, UI 모델, 컴포넌트 Props의 3단 타입 경계, 네이밍, 변환 책임, 배치 규칙 정리가 필요할 때 사용한다. 타입/인터페이스 추가, DTO 정의, 모델 설계, Props 계약 정의 작업에서 사용한다.
---

# Type Conventions

## 목표

- API 응답, UI 소비 모델, 컴포넌트 계약을 명확히 분리하라.
- 타입 변환 책임을 올바른 레이어에 배치하라.
- 이 스킬은 타입 정의 규칙만 다루고 다른 레이어의 코드 작성 규칙은 다루지 마라.

## 3단 타입 체계

| 단계 | 접미사 | 역할 | 위치 |
|---|---|---|---|
| API DTO | `*Request`, `*Response` | 서버 요청/응답 shape 그대로 | `api/` 하위 colocate |
| UI Model | `*Model` | 프론트가 소비하는 정규화 형태 | `types/` |
| Component Props | `*Props` | 컴포넌트 외부 공개 계약 | 컴포넌트 파일 내부 또는 `types/` |

## 네이밍 규칙

- API DTO: `{Domain}{Action}Request`, `{Domain}{Action}Response`, `{Domain}ListResponse`
- 목록 항목: `{Domain}ItemResponse` (목록 내 개별 항목)
- 자동완성/검색: `{Domain}LookupResponse`, `{Domain}LookupItemResponse`
- UI Model: `{Domain}Model` (`IssueModel`, `MemberModel`)
- Component Props: `{Component}Props` (`IssueCardProps`, `MemberSelectorProps`)
- Enum/Union: `{Domain}{Field}` (`IssueState`, `IssueType`)
- 제네릭 유틸: `Paginated<T>`, `ListOf<T>` (공유 타입에 정의)

## 타입 정의 규칙

- `interface`를 기본으로 사용하라. union/intersection이 필요한 경우에만 `type`을 사용하라.
- API DTO는 서버 응답 shape을 그대로 반영하라. 프론트 편의를 위한 필드를 추가하지 마라.
- UI Model은 컴포넌트가 소비하기 편한 형태로 정규화하라 (날짜 파싱, null 처리, 중첩 평탄화).
- Props는 컴포넌트가 외부에 공개하는 최소 계약만 포함하라. 내부 상태를 Props로 노출하지 마라.
- optional 필드(`?`)는 실제로 없을 수 있는 값에만 사용하라. 항상 존재하는 필드를 optional로 두지 마라.

## 타입 변환 책임

| 변환 | 담당 레이어 | 위치 |
|---|---|---|
| API DTO -> UI Model | api 레이어 | `{feature}/api/{domain}.api.ts` 내 변환 함수 |
| UI Model -> Component Props | hook 레이어 | hook에서 props 조립 시 수행 |
| 사용자 입력 -> API Request DTO | hook 레이어 | action hook에서 수행 |

- 컴포넌트에서 API DTO를 직접 소비하지 마라. 반드시 UI Model을 거쳐라.
- 변환 함수 네이밍: `to{Target}` (`toIssueModel`, `toCreateIssueRequest`)

## packages/ui 타입 규칙

- `packages/ui` 컴포넌트의 Props는 도메인 타입을 참조하지 마라.
- 제네릭 또는 primitive 타입만 사용하라 (`string`, `number`, `boolean`, `ReactNode`).
- 도메인 타입과 packages/ui Props의 연결은 `apps/web`의 hook 또는 컴포넌트에서 수행하라.

## 공유 타입 규칙

- 2개 이상 feature에서 사용하는 타입은 `src/types/`에 배치하라.
- 1개 feature에서만 사용하는 타입은 `features/{feature}/types/`에 배치하라.
- API 클라이언트 공통 타입(`Paginated<T>`, `ApiError` 등)은 `src/api/types.ts`에 배치하라.

## 적용 절차

1. 서버 API 스펙을 확인하고 API DTO(`*Request`, `*Response`)를 먼저 정의하라.
2. 프론트에서 소비할 UI Model(`*Model`)을 정의하라.
3. DTO -> Model 변환 함수를 api 레이어에 작성하라.
4. 컴포넌트 Props(`*Props`)를 정의하라.
5. Props가 UI Model과 동일하면 별도 정의 없이 Model을 직접 사용해도 된다.
6. 타입 배치 위치가 feature 전용인지 공유인지 판단하라.

## 빠른 체크리스트

- API DTO가 서버 응답 shape을 그대로 반영하는가?
- UI Model이 프론트 소비에 맞게 정규화됐는가?
- 컴포넌트가 API DTO를 직접 소비하지 않는가?
- DTO -> Model 변환이 api 레이어에 있는가?
- `packages/ui` Props에 도메인 타입 참조가 없는가?
- optional 필드가 실제 nullable인 경우에만 사용됐는가?
- 네이밍이 `*Request/*Response/*Model/*Props` 규칙을 따르는가?
- 1개 feature 전용 타입이 공유 폴더에 있지 않은가?
