import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** 공백 기준 각 단어의 첫 글자를 조합하여 최대 2글자 이니셜 반환 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
  /** "circle"(기본값) | "rounded" */
  variant?: "circle" | "rounded";
}

/** 프로필 이미지가 있으면 이미지, 없으면 이니셜(최대 2글자) 표시 */
export function UserAvatar({
  name,
  imageUrl,
  className,
  variant = "circle",
}: UserAvatarProps) {
  const radius = variant === "rounded" ? "rounded-md" : "rounded-full";

  return (
    <Avatar className={cn(radius, className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback className={cn("text-xs font-medium", radius)}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
