import { useSearchParams } from "react-router-dom";
import { AcceptInviteScreen } from "@/features/auth/components/accept-invite-screen";

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return <AcceptInviteScreen token={token} />;
}
