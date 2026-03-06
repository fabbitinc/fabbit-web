import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Plus,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Play,
} from "lucide-react";

import { TimelineList } from "@fabbit/components";

const meta = {
  title: "Components/TimelineList",
  component: TimelineList,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof TimelineList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[400px]">
      <TimelineList
        items={[
          {
            id: "1",
            icon: CheckCircle,
            title: "최종 검사 완료",
            description: "LOT-2026-0042 전량 합격 처리",
            timestamp: "2026-03-07 14:30",
            badge: "완료",
            badgeVariant: "success",
          },
          {
            id: "2",
            icon: Play,
            title: "가공 공정 시작",
            description: "CNC-003 설비 배정, 작업자: 박기계",
            timestamp: "2026-03-07 09:15",
            badge: "진행중",
            badgeVariant: "info",
          },
          {
            id: "3",
            icon: AlertTriangle,
            title: "자재 입고 지연",
            description: "AL-6061 원자재 납기 1일 지연 통보",
            timestamp: "2026-03-06 16:45",
            badge: "지연",
            badgeVariant: "warning",
          },
          {
            id: "4",
            icon: Wrench,
            title: "설비 정비 완료",
            description: "CNC-003 정기 점검 및 공구 교체",
            timestamp: "2026-03-06 08:00",
          },
          {
            id: "5",
            icon: Plus,
            title: "작업지시 생성",
            description: "WO-2026-0198 생성, 목표 수량 500개",
            timestamp: "2026-03-05 11:20",
            badge: "생성",
            badgeVariant: "secondary",
          },
        ]}
      />
    </div>
  ),
};

export const Simple: Story = {
  render: () => (
    <div className="w-[400px]">
      <TimelineList
        items={[
          {
            id: "1",
            title: "ECR-0045 변경 요청 승인",
            timestamp: "2026-03-07 10:00",
            badge: "승인",
            badgeVariant: "success",
          },
          {
            id: "2",
            title: "ECR-0045 기술 검토 완료",
            description: "구조 강도 시뮬레이션 통과",
            timestamp: "2026-03-06 15:30",
          },
          {
            id: "3",
            title: "ECR-0045 변경 요청 접수",
            description: "브래킷 두께 2mm → 3mm 변경",
            timestamp: "2026-03-05 09:00",
          },
        ]}
      />
    </div>
  ),
};
