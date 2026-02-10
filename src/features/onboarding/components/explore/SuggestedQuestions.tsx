import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SuggestedQuestion } from "@/features/onboarding/types/onboarding.types";

interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onSelectQuestion: (question: string) => void;
}

export function SuggestedQuestions({
  questions,
  onSelectQuestion,
}: SuggestedQuestionsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#0f172a]">추천 질문</h3>
      <div className="space-y-2">
        {questions.map((q) => (
          <button
            key={q.id}
            type="button"
            className="w-full text-left p-3 rounded-lg border border-[#e2e8f0] hover:border-[#3b82f6] hover:bg-[#3b82f6]/5 cursor-pointer transition-all"
            onClick={() => onSelectQuestion(q.question)}
          >
            <div className="flex items-start gap-2">
              <MessageSquare className="size-4 shrink-0 text-[#94a3b8] mt-0.5" />
              <div className="flex-1 min-w-0">
                <Badge variant="secondary" className="text-xs mb-1">
                  {q.category}
                </Badge>
                <p className="text-sm text-[#0f172a]">{q.question}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
