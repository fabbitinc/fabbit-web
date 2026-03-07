import type { ReactNode } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  Copy,
  FileText,
  MoreHorizontal,
  Play,
  XCircle,
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

export type WorkOrderDetailStatus = "draft" | "released" | "in_progress" | "done" | "cancelled";

export interface WorkOrderDetailBom {
  bomCode: string;
  drawingCode: string;
  drawingRevision: string;
  releasedAt: string;
}

export interface WorkOrderDetailProgress {
  startedAt: string | null;
  completedAt: string | null;
  goodQuantity: number;
  defectQuantity: number;
}

export interface WorkOrderDetailLink {
  id: string;
  type: "production" | "defect" | "eco";
  label: string;
  onClick: () => void;
}

export interface WorkOrderDetail {
  id: string;
  orderNumber: string;
  productName: string;
  status: WorkOrderDetailStatus;
  quantity: number;
  dueDate: string;
  priority: "high" | "medium" | "low";
  team: string;
  assigneeName: string;
  createdAt: string;
  bom: WorkOrderDetailBom;
  progress: WorkOrderDetailProgress;
  links: WorkOrderDetailLink[];
}

export type WorkOrderDetailTab = "progress" | "bom" | "history";

export interface WorkOrderDetailScreenProps {
  workOrder: WorkOrderDetail;
  activeTab: WorkOrderDetailTab;
  tabContent?: ReactNode;
  onBack: () => void;
  onTabChange: (tab: WorkOrderDetailTab) => void;
  onStatusChange: (status: WorkOrderDetailStatus) => void;
  onDuplicate: () => void;
  onEdit: () => void;
}

function getStatusConfig(status: WorkOrderDetailStatus) {
  switch (status) {
    case "draft":
      return { icon: CircleDot, label: "초안", variant: "neutral" as const };
    case "released":
      return { icon: Clock, label: "예정", variant: "info" as const };
    case "in_progress":
      return { icon: Play, label: "진행 중", variant: "success" as const };
    case "done":
      return { icon: CheckCircle2, label: "완료", variant: "accent" as const };
    case "cancelled":
      return { icon: XCircle, label: "취소", variant: "danger" as const };
  }
}

function getPriorityLabel(priority: "high" | "medium" | "low") {
  switch (priority) {
    case "high":
      return "긴급";
    case "medium":
      return "보통";
    case "low":
      return "낮음";
  }
}

const TABS = [
  { key: "progress", label: "진행 현황" },
  { key: "bom", label: "기준본" },
  { key: "history", label: "이력" },
] as const;

export function WorkOrderDetailScreen({
  workOrder,
  activeTab,
  tabContent,
  onBack,
  onTabChange,
  onStatusChange,
  onDuplicate,
  onEdit,
}: WorkOrderDetailScreenProps) {
  const statusCfg = getStatusConfig(workOrder.status);
  const StatusIcon = statusCfg.icon;
  const progressRate = workOrder.quantity > 0
    ? Math.round((workOrder.progress.goodQuantity / workOrder.quantity) * 100)
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
              <h1 className="text-xl font-bold text-foreground">{workOrder.orderNumber}</h1>
              <Badge variant={statusCfg.variant} className="gap-1">
                <StatusIcon className="size-3" />
                {statusCfg.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{workOrder.productName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {workOrder.status === "draft" && (
            <Button type="button" size="sm" onClick={() => onStatusChange("released")}>
              배포
            </Button>
          )}
          {workOrder.status === "released" && (
            <Button type="button" size="sm" onClick={() => onStatusChange("in_progress")}>
              <Play className="size-3.5" />
              착수
            </Button>
          )}
          {workOrder.status === "in_progress" && (
            <Button type="button" size="sm" onClick={() => onStatusChange("done")}>
              <CheckCircle2 className="size-3.5" />
              완료
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="size-3.5" />
            복제
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            <MoreHorizontal className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* 정보 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">기본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList
              columns={2}
              items={[
                { label: "품목명", value: workOrder.productName },
                { label: "수량", value: `${workOrder.quantity.toLocaleString()}개` },
                {
                  label: "납기",
                  value: (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      {workOrder.dueDate}
                    </span>
                  ),
                },
                { label: "우선순위", value: getPriorityLabel(workOrder.priority) },
                { label: "담당 팀", value: workOrder.team },
                { label: "담당자", value: workOrder.assigneeName },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">기준본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList
              columns={2}
              items={[
                {
                  label: "BOM",
                  value: (
                    <span className="inline-flex items-center gap-1">
                      <FileText className="size-3 text-muted-foreground" />
                      {workOrder.bom.bomCode}
                    </span>
                  ),
                },
                {
                  label: "도면",
                  value: `${workOrder.bom.drawingCode} ${workOrder.bom.drawingRevision}`,
                },
                { label: "릴리스 일시", value: workOrder.bom.releasedAt },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">진행 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList
              columns={2}
              items={[
                { label: "시작 시각", value: workOrder.progress.startedAt ?? "-" },
                { label: "종료 시각", value: workOrder.progress.completedAt ?? "-" },
                { label: "누적 양품", value: `${workOrder.progress.goodQuantity.toLocaleString()}개` },
                { label: "불량", value: `${workOrder.progress.defectQuantity.toLocaleString()}개` },
              ]}
            />
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>달성률</span>
                <span>{progressRate}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(progressRate, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">연결 정보</CardTitle>
          </CardHeader>
          <CardContent>
            {workOrder.links.length === 0 ? (
              <p className="text-sm text-muted-foreground">연결된 항목이 없습니다</p>
            ) : (
              <div className="space-y-2">
                {workOrder.links.map((link) => (
                  <button
                    key={link.id}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/50"
                    type="button"
                    onClick={link.onClick}
                  >
                    <Badge variant={link.type === "production" ? "success" : link.type === "defect" ? "danger" : "warning"} className="text-[10px]">
                      {link.type === "production" ? "실적" : link.type === "defect" ? "불량" : "ECO"}
                    </Badge>
                    <span>{link.label}</span>
                  </button>
                ))}
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
          onChange={(key) => onTabChange(key as WorkOrderDetailTab)}
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
