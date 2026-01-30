import { useMemo } from "react";
import type { Milestone } from "../types/dashboard.types";

interface MilestoneWarning {
  milestone: Milestone;
  daysUntil: number;
  isWarning: boolean; // 7일 이내
  isOverdue: boolean; // 지난 날짜
}

export function useMilestoneWarning(milestones: Milestone[]) {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return milestones.map((milestone): MilestoneWarning => {
      const milestoneDate = new Date(milestone.date);
      milestoneDate.setHours(0, 0, 0, 0);

      const diffTime = milestoneDate.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        milestone,
        daysUntil,
        isWarning: daysUntil > 0 && daysUntil <= 7,
        isOverdue: daysUntil < 0 && milestone.status !== "completed",
      };
    });
  }, [milestones]);
}

export function getDaysUntilText(daysUntil: number): string {
  if (daysUntil === 0) return "오늘";
  if (daysUntil === 1) return "내일";
  if (daysUntil < 0) return `${Math.abs(daysUntil)}일 지남`;
  return `${daysUntil}일 남음`;
}
