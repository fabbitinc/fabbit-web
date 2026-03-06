import { Badge } from "@fabbit/ui";

export interface OrganizationAdvancedPolicyCard {
  title: string;
  description: string;
  badge: string;
}

export interface OrganizationAdvancedTabProps {
  cards?: OrganizationAdvancedPolicyCard[];
}

const defaultCards: OrganizationAdvancedPolicyCard[] = [
  {
    title: "감사 로그 보관 기간",
    description: "기본값 180일",
    badge: "180일",
  },
  {
    title: "자동 비활성화 규칙",
    description: "90일 미접속 계정 비활성화",
    badge: "사용 중",
  },
  {
    title: "웹훅 이벤트 발행",
    description: "설정 변경 이벤트 외부 전송",
    badge: "준비 중",
  },
  {
    title: "프로비저닝 정책",
    description: "SCIM 기반 계정 동기화",
    badge: "Enterprise",
  },
];

export function OrganizationAdvancedTab({ cards = defaultCards }: OrganizationAdvancedTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">운영 정책</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="rounded-[24px] border border-border/70 bg-card p-4">
            <p className="text-sm font-medium text-foreground">{card.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
            <Badge className="mt-3" variant="outline">
              {card.badge}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
