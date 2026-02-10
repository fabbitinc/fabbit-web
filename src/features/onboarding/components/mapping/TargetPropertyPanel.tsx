import { useState } from "react";
import { Check, CircleDot, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type {
  TargetProperty,
  MappingConnection,
} from "@/features/onboarding/types/onboarding.types";

interface TargetPropertyPanelProps {
  properties: TargetProperty[];
  connections: MappingConnection[];
  selectedTargetId: string | null;
  onSelectTarget: (id: string | null) => void;
  itemRefs: Map<string, HTMLElement>;
}

// 카테고리 표시 순서
const CATEGORY_ORDER = ["Part", "BOM", "Supplier", "Drawing", "확장 속성"];

export function TargetPropertyPanel({
  properties,
  connections,
  selectedTargetId,
  onSelectTarget,
  itemRefs,
}: TargetPropertyPanelProps) {
  const connectedTargetIds = new Set(connections.map((c) => c.targetId));

  // 카테고리별 그룹화
  const grouped = CATEGORY_ORDER.reduce<Record<string, TargetProperty[]>>(
    (acc, category) => {
      const items = properties.filter((p) => p.category === category);
      if (items.length > 0) {
        acc[category] = items;
      }
      return acc;
    },
    {}
  );

  // 모든 카테고리 기본 열림 상태
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () =>
      Object.keys(grouped).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<string, boolean>
      )
  );

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="w-80 border-l border-[#e2e8f0] bg-white flex flex-col shrink-0">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e2e8f0]">
        <h4 className="text-sm font-semibold text-[#0f172a]">표준 속성</h4>
        <Badge variant="secondary" className="text-xs">
          {properties.length}
        </Badge>
      </div>

      {/* 속성 목록 (카테고리별) */}
      <ScrollArea className="flex-1">
        <div className="py-1.5">
          {Object.entries(grouped).map(([category, items]) => (
            <Collapsible
              key={category}
              open={openCategories[category]}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer">
                <span>{category}</span>
                <ChevronRight
                  className={cn(
                    "size-4 text-[#94a3b8] transition-transform",
                    openCategories[category] && "rotate-90"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                {items.map((property) => {
                  const isSelected = selectedTargetId === property.id;
                  const isConnected = connectedTargetIds.has(property.id);

                  return (
                    <div
                      key={property.id}
                      ref={(el) => {
                        if (el) itemRefs.set(property.id, el);
                        else itemRefs.delete(property.id);
                      }}
                      className={cn(
                        "p-3 mx-3 my-1.5 rounded-lg border cursor-pointer transition-all",
                        isSelected &&
                          "border-[#3b82f6] bg-[#3b82f6]/5 ring-2 ring-[#3b82f6]/20",
                        !isSelected &&
                          isConnected &&
                          "border-[#22c55e]/50 bg-[#22c55e]/5",
                        !isSelected &&
                          !isConnected &&
                          "border-[#e2e8f0] hover:border-[#94a3b8]"
                      )}
                      onClick={() =>
                        onSelectTarget(isSelected ? null : property.id)
                      }
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-[#0f172a]">
                            {property.name}
                          </span>
                          {property.required && (
                            <Badge
                              variant="destructive"
                              className="text-[10px] px-1 py-0"
                            >
                              필수
                            </Badge>
                          )}
                        </div>
                        {isConnected && (
                          <Check className="size-3.5 text-[#22c55e]" />
                        )}
                        {isSelected && !isConnected && (
                          <CircleDot className="size-3.5 text-[#3b82f6]" />
                        )}
                      </div>
                      <p className="text-xs text-[#94a3b8]">
                        {property.description}
                      </p>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
