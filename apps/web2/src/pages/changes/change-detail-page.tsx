// ── 탭 수정 체크리스트 ──
// 1. ChangeRequestDetailTab union type에 새 탭 ID 추가
// 2. VALID_CHANGE_REQUEST_DETAIL_TABS Set에 새 탭 ID 추가
// 3. detailTabs 배열에 { id, label } 추가
// 4. 탭 콘텐츠 컴포넌트 생성 및 연결
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { ChangeRequestDetailScreen } from "@/features/change-request";
import type { ChangeRequestDetailTab } from "@/features/change-request/types/change-request-model";

const VALID_CHANGE_REQUEST_DETAIL_TABS = new Set<ChangeRequestDetailTab>(["conversation", "changes"]);

export function ChangeDetailPage() {
  const { changeNumber: changeNumberParam } = useParams<{ changeNumber: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const changeNumber = changeNumberParam ? Number(changeNumberParam) : Number.NaN;

  if (!Number.isInteger(changeNumber) || changeNumber <= 0) {
    return <Navigate replace to="/changes?view=requests" />;
  }

  const tabParam = searchParams.get("tab");
  const basePath = `/changes/requests/${changeNumber}`;

  if (tabParam === "conversation") {
    return <Navigate replace to={basePath} />;
  }

  if (tabParam !== null && !VALID_CHANGE_REQUEST_DETAIL_TABS.has(tabParam as ChangeRequestDetailTab)) {
    return <Navigate replace to={basePath} />;
  }

  const activeTab: ChangeRequestDetailTab = tabParam === "changes" ? "changes" : "conversation";

  return (
    <ChangeRequestDetailScreen
      changeNumber={changeNumber}
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
