import { Navigate, useParams } from "react-router-dom";
import { IssueDetailScreen } from "@/features/issue";

export function IssueDetailPage() {
  const { issueId } = useParams<{ issueId: string }>();

  if (!issueId) {
    return <Navigate replace to="/changes?view=issues" />;
  }

  return <IssueDetailScreen issueId={issueId} />;
}
