import type { TargetProperty } from "@/features/onboarding/types/onboarding.types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TargetSelectorProps {
  value?: string;
  targets: TargetProperty[];
  onChange: (targetId: string) => void;
  placeholder?: string;
  className?: string;
}

const categoryOrder = ["Part", "BOM", "Supplier", "Drawing", "확장 속성"];

export function TargetSelector({
  value,
  targets,
  onChange,
  placeholder = "타겟 선택",
  className,
}: TargetSelectorProps) {
  const grouped = targets.reduce<Record<string, TargetProperty[]>>(
    (acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    },
    {}
  );

  const sortedCategories = categoryOrder.filter((cat) => grouped[cat]);

  if (targets.length === 0) return null;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-7 text-xs", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {sortedCategories.map((category) => (
          <SelectGroup key={category}>
            <SelectLabel className="pl-3 text-[11px] font-normal text-gray-400">
              {category}
            </SelectLabel>
            {grouped[category].map((target) => (
              <SelectItem key={target.id} value={target.id} className="text-xs">
                {target.description}
                {target.required ? " *" : ""}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
