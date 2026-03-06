import type { paths } from "@/api/generated/schema";

export type ApiPaths = paths;
export type ApiPath = keyof ApiPaths;
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

type Operation<
  Path extends ApiPath,
  Method extends HttpMethod,
> = NonNullable<ApiPaths[Path][Method]>;

type JsonContent<T> = T extends { "application/json": infer Json } ? Json : never;

type OperationRequestBody<
  Path extends ApiPath,
  Method extends HttpMethod,
> = Operation<Path, Method> extends { requestBody: { content: infer Content } }
  ? JsonContent<Content>
  : never;

type OperationParameters<
  Path extends ApiPath,
  Method extends HttpMethod,
> = Operation<Path, Method> extends { parameters: infer Parameters }
  ? Parameters
  : never;

type OperationResponseByStatus<
  Path extends ApiPath,
  Method extends HttpMethod,
  Status extends number,
> = Operation<Path, Method> extends { responses: Record<Status, { content: infer Content }> }
  ? JsonContent<Content>
  : never;

export type ApiRequestBody<
  Path extends ApiPath,
  Method extends HttpMethod,
> = OperationRequestBody<Path, Method>;

export type ApiParameters<
  Path extends ApiPath,
  Method extends HttpMethod,
> = OperationParameters<Path, Method>;

export type ApiSuccessResponse<
  Path extends ApiPath,
  Method extends HttpMethod,
> =
  | OperationResponseByStatus<Path, Method, 200>
  | OperationResponseByStatus<Path, Method, 201>
  | OperationResponseByStatus<Path, Method, 202>
  | OperationResponseByStatus<Path, Method, 204>;
