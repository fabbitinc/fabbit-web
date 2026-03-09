// ── 탭 수정 체크리스트 ──
// 1. PartDetailTab union type에 새 탭 ID 추가
// 2. VALID_PART_DETAIL_TABS Set에 새 탭 ID 추가
// 3. detailTabs 배열에 { id, label, icon } 추가
// 4. 탭 콘텐츠 컴포넌트 생성 및 연결
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { PartDetailScreen } from "@/features/parts";
import type { PartDetailTab } from "@/features/parts/types/parts-model";

const VALID_PART_DETAIL_TABS = new Set<PartDetailTab>([
  "properties",
  "bom",
  "attachments",
  "suppliers",
  "projects",
  "owner",
  "history",
]);

export function PartDetailPage() {
  const { partId } = useParams<{ partId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!partId) {
    return <Navigate replace to="/parts" />;
  }

  const tabParam = searchParams.get("tab");
  const basePath = `/parts/${partId}`;

  if (tabParam === "properties") {
    return <Navigate replace to={basePath} />;
  }

  if (tabParam !== null && !VALID_PART_DETAIL_TABS.has(tabParam as PartDetailTab)) {
    return <Navigate replace to={basePath} />;
  }

  const activeTab: PartDetailTab = tabParam && VALID_PART_DETAIL_TABS.has(tabParam as PartDetailTab)
    ? (tabParam as PartDetailTab)
    : "properties";

  return (
    <PartDetailScreen
      activeTab={activeTab}
      partId={partId}
      onTabChange={(tab) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);

          if (tab === "properties") {
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
