import { Navigate, useParams } from "react-router-dom";
import { IssueDetailScreen } from "@/features/issue";

export function IssueDetailPage() {
  const { issueNumber: issueNumberParam } = useParams<{ issueNumber: string }>();
  const issueNumber = issueNumberParam ? Number(issueNumberParam) : Number.NaN;

  if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
    return <Navigate replace to="/changes?view=issues" />;
  }

  return <IssueDetailScreen issueNumber={issueNumber} />;
}
