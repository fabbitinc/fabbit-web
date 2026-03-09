# API Audit

기준일: 2026-03-07

## 범위

- 대상: `apps/web/src/api/file.api.ts`
- 대상: `apps/web/src/features/*/api/*.api.ts`
- 기준:
  - 요청 body/query가 legacy snake_case DTO면 `toApiRequest(...)`를 거쳐야 한다
  - 응답 payload를 legacy snake_case DTO로 소비하면 `toLegacyResponse(...)`를 거쳐야 한다
  - `void`, `Blob`, path param, presigned URL 외부 `PUT`은 예외로 본다

## 현재 안 맞는 항목

- 2건

| URL                                    | Method  | 파일                                                             | 문제                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------- | ------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/v1/changes/{issueNumber}/issues` | `PUT`   | `apps/web/src/features/change-request/api/change-request.api.ts` | 서버 런타임은 global `SNAKE_CASE` 설정에 따라 `issue_ids`를 받는데, 생성 스펙의 request model은 아직 `issueIds`로 남아 있다. 현재 API 레이어에서 snake_case 요청을 유지하기 위해 호출부 cast로 맞추고 있다. 서버 OpenAPI 정리가 필요하다.                                                                                                                                           |
| `/api/v1/parts/{partId}/owner`         | `PATCH` | `apps/web/src/features/parts/api/parts.api.ts`                   | OpenAPI와 서버 DTO가 mixed contract다. 스펙은 `ownerIdSet`/`ownerTeamIdSet`와 `owner_id`/`owner_team_id`가 섞여 있고, 프론트 훅은 `owner_id_set`/`owner_team_id_set`를 만든다. 서버는 실제로 `owner_id`/`owner_team_id`만 `@JsonSetter`로 받아 set 플래그를 내부 계산한다. 현재 동작은 가능하지만 casing helper 규칙으로 안전하게 설명되지 않는 예외 계약이라 스펙 정리가 필요하다. |

## 참고

- 이번 점검 중 수정한 항목과 정상 항목은 이 문서에서 제외했다.
- 관련 서버 DTO:
  - `server2/src/main/java/com/fabbitinc/server/application/part/dto/request/UpdatePartOwnerRequest.java`
