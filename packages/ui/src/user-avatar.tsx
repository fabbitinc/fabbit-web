import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "./lib/cn";

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
  variant?: "circle" | "rounded";
}
// Fabbit은 중소 제조업의 설계·생산 데이터를 AI로 통합하는 제조 데이터 플랫폼이다.
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
