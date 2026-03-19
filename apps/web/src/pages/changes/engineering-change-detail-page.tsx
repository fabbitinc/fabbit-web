// ── 탭 수정 체크리스트 ──
// 1. EngineeringChangeDetailTab union type에 새 탭 ID 추가
// 2. VALID_CHANGE_REQUEST_DETAIL_TABS Set에 새 탭 ID 추가
// 3. detailTabs 배열에 { id, label } 추가
// 4. 탭 콘텐츠 컴포넌트 생성 및 연결
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { EngineeringChangeDetailScreen } from "@/features/engineering-change";
import type { EngineeringChangeDetailTab } from "@/features/engineering-change/types/engineering-change-model";

const VALID_ENGINEERING_CHANGE_DETAIL_TABS = new Set<EngineeringChangeDetailTab>(["conversation", "changes"]);

export function EngineeringChangeDetailPage() {
  const { engineeringChangeId } = useParams<{ engineeringChangeId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!engineeringChangeId) {
    return <Navigate replace to="/changes?view=engineering-changes" />;
  }

  const tabParam = searchParams.get("tab");
  const basePath = `/changes/engineering-changes/${engineeringChangeId}`;

  if (tabParam === "conversation") {
    return <Navigate replace to={basePath} />;
  }

  if (tabParam !== null && !VALID_ENGINEERING_CHANGE_DETAIL_TABS.has(tabParam as EngineeringChangeDetailTab)) {
    return <Navigate replace to={basePath} />;
  }

  const activeTab: EngineeringChangeDetailTab = tabParam === "changes" ? "changes" : "conversation";

  return (
    <EngineeringChangeDetailScreen
      engineeringChangeId={engineeringChangeId}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);

          if (tab === "conversation") {
            next.delete("tab");
          } else {
            next.set("tab", tab);
          }

          return next;
        });
      }}
    />
  );
}
