import { useState, useEffect, useRef } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  ChatMessage,
  SuggestedQuestion,
} from "@/features/onboarding/types/onboarding.types";

interface AIQueryInterfaceProps {
  messages: ChatMessage[];
  suggestedQuestions: SuggestedQuestion[];
  onSendMessage: (message: string) => void;
}

export function AIQueryInterface({
  messages,
  suggestedQuestions,
  onSendMessage,
}: AIQueryInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasUserMessages = messages.some((m) => m.role === "user");

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    );
    if (viewport) {
      viewport.scrollTo({ top: 99999, behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] flex flex-col h-[600px]">
      {/* 헤더 */}
      <div className="flex items-center gap-3 p-4 border-b border-[#e2e8f0]">
        <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center">
          <Bot className="size-4 text-[#3b82f6]" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#0f172a]">
            AI 어시스턴트
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span className="text-xs text-[#64748b]">온라인</span>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#3b82f6]/10 flex items-center justify-center shrink-0">
                    <Bot className="size-3.5 text-[#3b82f6]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#3b82f6] text-white rounded-2xl rounded-br-md"
                      : "bg-[#f1f5f9] text-[#0f172a] rounded-2xl rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* 대화 시작 전: 추천 질문을 채팅 영역 안에 카드로 표시 */}
            {!hasUserMessages && suggestedQuestions.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                  <Sparkles className="size-3" />
                  <span>이런 질문을 해보세요</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {suggestedQuestions.slice(0, 4).map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      className="text-left px-3 py-2 rounded-lg border border-[#e2e8f0] hover:border-[#3b82f6] hover:bg-[#3b82f6]/5 transition-all text-xs text-[#334155] leading-snug"
                      onClick={() => onSendMessage(q.question)}
                    >
                      {q.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 하단 영역 */}
      <div className="border-t border-[#e2e8f0]">
        {/* 대화 시작 후: 남은 추천 질문을 수평 칩으로 표시 */}
        {hasUserMessages && suggestedQuestions.length > 0 && (
          <div className="px-4 pt-3 flex gap-1.5 overflow-x-auto scrollbar-none">
            {suggestedQuestions.slice(0, 3).map((q) => (
              <button
                key={q.id}
                type="button"
                className="shrink-0 px-2.5 py-1 rounded-full border border-[#e2e8f0] hover:border-[#3b82f6] hover:bg-[#3b82f6]/5 transition-all text-[11px] text-[#64748b] hover:text-[#3b82f6] whitespace-nowrap"
                onClick={() => onSendMessage(q.question)}
              >
                {q.question.length > 20
                  ? q.question.slice(0, 20) + "..."
                  : q.question}
              </button>
            ))}
          </div>
        )}

        {/* 입력 */}
        <div className="p-4 flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="질문을 입력하세요..."
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
