import { useMemo } from "react";
import { AIUsagePanel } from "@fabbit/components";
import { Loader2 } from "lucide-react";
import { useCreditUsageQuery } from "@/features/billing/hooks/use-credit-usage-query";
import { generateCreditCategoryTrend } from "@/features/billing/mock-data/usage-mock";

export function AIUsageTab() {
  const creditTrend = useMemo(() => generateCreditCategoryTrend(365), []);
  const creditUsageQuery = useCreditUsageQuery();

  if (creditUsageQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!creditUsageQuery.data) {
    return null;
  }

  return <AIUsagePanel trend={creditTrend} usage={creditUsageQuery.data} />;
}
