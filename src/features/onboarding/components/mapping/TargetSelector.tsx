import { useTranslation } from "react-i18next";
import type { TargetPropertyOption } from "@/features/onboarding/types/onboarding.types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, withOriginal } from "@/lib/utils";

interface TargetSelectorProps {
  value?: string;
  targets: TargetPropertyOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const labelOrder = ["Part", "Supplier", "Drawing"];

export function TargetSelector({
  value,
  targets,
  onChange,
  placeholder = "타겟 선택",
  className,
}: TargetSelectorProps) {
  const { t } = useTranslation(["mapping"]);

  const grouped = targets.reduce<Record<string, TargetPropertyOption[]>>(
    (acc, tp) => {
      if (!acc[tp.label]) acc[tp.label] = [];
      acc[tp.label].push(tp);
      return acc;
    },
    {}
  );

  const groupedLabels = Object.keys(grouped);
  const sortedLabels = [
    ...labelOrder.filter((label) => grouped[label]),
    ...groupedLabels
      .filter((label) => !labelOrder.includes(label))
      .sort((a, b) => a.localeCompare(b)),
  ];

  if (targets.length === 0) return null;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-7 text-xs", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {sortedLabels.map((label) => {
          const localLabel = t(`mapping:nodeLabel.${label}`, label);
          return (
            <SelectGroup key={label}>
              <SelectLabel className="pl-3 text-[11px] font-normal text-gray-400">
                {withOriginal(localLabel, label)}
              </SelectLabel>
              {grouped[label].map((target) => {
                const localProp = t(`mapping:property.${target.property}`, target.property);
                return (
                  <SelectItem
                    key={`${target.label}.${target.property}`}
                    value={`${target.label}.${target.property}`}
                    className="text-xs"
                  >
                    {withOriginal(localProp, target.property)}
                    {target.required ? " *" : ""}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          );
        })}
      </SelectContent>
    </Select>
  );
}
