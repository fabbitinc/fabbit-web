import type { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  fetchQueryMock: vi.fn(),
  toAuthSessionModelMock: vi.fn(),
  sessionModel: {
    user: null,
    memberships: [],
    currentMembership: null,
  },
  meQuery: {
    queryKey: ["auth", "me"],
    queryFn: vi.fn(),
    staleTime: 30_000,
  },
}));

vi.mock("@/features/auth/api/auth.queries", () => ({
  authQueries: {
    me: () => hoisted.meQuery,
  },
}));

vi.mock("@/features/auth/api/auth.api", () => ({
  toAuthSessionModel: hoisted.toAuthSessionModelMock,
}));

import { refreshAuthSession } from "@/features/auth/api/auth-session";

describe("refreshAuthSession", () => {
  beforeEach(() => {
    hoisted.fetchQueryMock.mockReset();
    hoisted.toAuthSessionModelMock.mockReset();
    hoisted.toAuthSessionModelMock.mockReturnValue(hoisted.sessionModel);
  });

  it("auth.me 캐시가 fresh여도 최신 세션을 다시 조회한다", async () => {
    const response = { user: { id: "user-1" } };
    hoisted.fetchQueryMock.mockResolvedValue(response);

    const queryClient = {
      fetchQuery: hoisted.fetchQueryMock,
    } as unknown as QueryClient;

    const result = await refreshAuthSession(queryClient);

    expect(hoisted.fetchQueryMock).toHaveBeenCalledWith({
      ...hoisted.meQuery,
      staleTime: 0,
    });
    expect(hoisted.toAuthSessionModelMock).toHaveBeenCalledWith(response);
    expect(result).toBe(hoisted.sessionModel);
  });
});
