import type { ReactNode } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  FileWarning,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  InlineTabs,
} from "@fabbit/ui";
import { DescriptionList } from "./description-list";

export interface ProductionResultDetailData {
  id: string;
  orderNumber: string;
  productName: string;
  plannedQuantity: number;
  goodQuantity: number;
  defectQuantity: number;
  workStartTime: string;
  workEndTime: string;
  workDuration: string;
  recorder: string;
  team: string;
  recordedAt: string;
  memo: string;
  defectRecordCount: number;
  lastUpdatedAt: string;
}

export type ProductionResultDetailTab = "history" | "defects";

export interface ProductionResultDetailScreenProps {
  result: ProductionResultDetailData;
  activeTab: ProductionResultDetailTab;
  tabContent?: ReactNode;
  onBack: () => void;
  onTabChange: (tab: ProductionResultDetailTab) => void;
  onEdit: () => void;
  onCreateDefectRecord: () => void;
}

const TABS = [
  { key: "history", label: "수정 이력" },
  { key: "defects", label: "불량 기록" },
] as const;

export function ProductionResultDetailScreen({
  result,
  activeTab,
  tabContent,
  onBack,
  onTabChange,
  onEdit,
  onCreateDefectRecord,
}: ProductionResultDetailScreenProps) {
  const totalQuantity = result.goodQuantity + result.defectQuantity;
  const achievementRate = result.plannedQuantity > 0
    ? Math.round((result.goodQuantity / result.plannedQuantity) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-0.5"
            onClick={onBack}
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{result.orderNumber}</h1>
              <Badge variant={achievementRate >= 100 ? "success" : "info"} className="gap-1">
                달성률 {achievementRate}%
              </Badge>
              {result.defectQuantity > 0 && (
                <Badge variant="danger" className="gap-1">
                  <FileWarning className="size-3" />
                  불량 {result.defectQuantity}건
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{result.productName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result.defectQuantity > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={onCreateDefectRecord}>
              <FileWarning className="size-3.5" />
              불량 기록
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            <Edit className="size-3.5" />
            수정
          </Button>
        </div>
      </div>

      {/* 정보 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">실적 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList
              columns={2}
              items={[
                { label: "양품 수량", value: `${result.goodQuantity.toLocaleString()}개` },
                {
                  label: "불량 수량",
                  value: (
                    <span className={result.defectQuantity > 0 ? "text-destructive" : ""}>
                      {result.defectQuantity.toLocaleString()}개
                    </span>
                  ),
                },
                { label: "총 생산", value: `${totalQuantity.toLocaleString()}개` },
                { label: "계획 수량", value: `${result.plannedQuantity.toLocaleString()}개` },
              ]}
            />
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>달성률</span>
                <span>{achievementRate}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(achievementRate, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">작업 시간</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList
              columns={2}
              items={[
                {
                  label: "시작",
                  value: (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {result.workStartTime}
                    </span>
                  ),
                },
                {
                  label: "종료",
                  value: (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {result.workEndTime}
                    </span>
                  ),
                },
                { label: "총 작업시간", value: result.workDuration },
                {
                  label: "기록 일시",
                  value: (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      {result.recordedAt}
                    </span>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">담당 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList
              columns={2}
              items={[
                { label: "입력자", value: result.recorder },
                { label: "담당 팀", value: result.team },
                { label: "최종 수정", value: result.lastUpdatedAt },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">비고</CardTitle>
          </CardHeader>
          <CardContent>
            {result.memo ? (
              <p className="text-sm text-foreground">{result.memo}</p>
            ) : (
              <p className="text-sm text-muted-foreground">메모가 없습니다</p>
            )}
            {result.defectRecordCount > 0 && (
              <div className="mt-3">
                <Badge variant="danger" className="text-[10px]">
                  연결된 불량기록 {result.defectRecordCount}건
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 탭 영역 */}
      <div>
        <InlineTabs
          items={TABS.map((t) => ({ key: t.key, label: t.label }))}
          activeKey={activeTab}
          onChange={(key) => onTabChange(key as ProductionResultDetailTab)}
        />
        <div className="mt-4">
          {tabContent ?? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              탭 콘텐츠 영역
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
