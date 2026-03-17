import { useNavigate } from "react-router-dom";
import { PartCreateScreen } from "@/features/parts/components/part-create-screen";
import { buildPartDetailPath } from "@/features/parts/lib/part-route";

export function PartCreatePage() {
  const navigate = useNavigate();

  return (
    <PartCreateScreen
      onBack={() => navigate("/parts")}
      onCreated={(part) => navigate(buildPartDetailPath(part.routeId))}
    />
  );
}
