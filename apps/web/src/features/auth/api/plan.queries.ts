import { queryOptions } from "@tanstack/react-query";
import { fetchPlans } from "@/features/auth/api/plan.api";

export const planQueries = {
  list: () =>
    queryOptions({
      queryKey: ["auth", "plans"],
      queryFn: fetchPlans,
      staleTime: 5 * 60_000,
    }),
};
