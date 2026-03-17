import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Clock, FileEdit, Upload, UserCheck, AlertCircle } from "lucide-react";

interface Change {
  type: string;
  label: string;
  file: string;
  detail?: string;
}

const revisions: {
  rev: string;
  date: string;
  author: string;
  status: "approved" | "pending";
  statusLabel: string;
  changes: Change[];
  approver?: string;
  approvedAt?: string;
  reviewer?: string;
}[] = [
  {
    rev: "Rev 1",
    date: "2026.01.10",
    author: "김설계",
    status: "approved" as const,
    statusLabel: "승인 완료",
    changes: [
      { type: "create", label: "초기 도면 등록", file: "SH-A100 하우징.dwg" },
      { type: "create", label: "BOM 업로드", file: "BOM_자동화기기_v1.xlsx" },
    ],
    approver: "박과장",
    approvedAt: "2026.01.11",
  },
  {
    rev: "Rev 2",
    date: "2026.02.03",
    author: "이생산",
    status: "approved" as const,
    statusLabel: "승인 완료",
    changes: [
      { type: "modify", label: "규격 변경", file: "SH-A100 하우징.dwg", detail: "φ45×30 → φ48×32" },
      { type: "modify", label: "재질 변경", file: "BOM 수량 2행", detail: "SUS304 → SUS316L" },
    ],
    approver: "박과장",
    approvedAt: "2026.02.04",
  },
  {
    rev: "Rev 3",
    date: "2026.03.12",
    author: "김설계",
    status: "pending" as const,
    statusLabel: "검토 중",
    changes: [
      { type: "modify", label: "베어링 사양 변경", file: "SH-C300 베어링", detail: "6205ZZ → 6206ZZ" },
      { type: "create", label: "조립도 추가", file: "SH-ASM-001 조립도.pdf" },
      { type: "modify", label: "BOM 수량 변경", file: "샤프트 수량", detail: "1 → 2" },
    ],
    reviewer: "박과장",
  },
];

function StatusBadge({ status, label }: { status: "approved" | "pending" | "rejected"; label: string }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-500">
        <Check size={12} />
        {label}
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-500">
        <Clock size={12} />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-500">
      <AlertCircle size={12} />
      {label}
    </span>
  );
}

function ChangeIcon({ type }: { type: string }) {
  if (type === "create") return <Upload size={14} className="text-[var(--lp-brand)]" />;
  return <FileEdit size={14} className="text-amber-500" />;
}

export function BeforeAfterSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding relative" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[var(--lp-text-muted)]">
            Revision History
          </p>
          <h2 className="section-heading font-[Outfit,sans-serif] text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.75rem]">
            모든 변경은
            <br />
            <span className="text-[var(--lp-brand)]">리비전으로 기록</span>됩니다
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--lp-text-tertiary)] md:text-lg">
            누가, 언제, 무엇을, 왜 바꿨는지 — 검토와 승인까지 한 화면에서 추적합니다.
          </p>
        </motion.div>

        {/* Revision timeline mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-16 max-w-3xl"
        >
          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-px bg-[var(--lp-border)] md:left-[27px]" />

            <div className="space-y-6">
              {revisions.map((rev, ri) => (
                <motion.div
                  key={rev.rev}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + ri * 0.15 }}
                >
                  {/* Rev header */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl md:h-14 md:w-14 ${
                        rev.status === "pending"
                          ? "border-2 border-amber-500/30 bg-[var(--lp-surface)]"
                          : "bg-[var(--lp-brand)] shadow-md shadow-[var(--lp-brand)]/20"
                      }`}
                    >
                      <span
                        className={`font-[Outfit,sans-serif] text-xs font-bold ${
                          rev.status === "pending"
                            ? "text-amber-500"
                            : "text-[var(--lp-on-brand)]"
                        }`}
                      >
                        {rev.rev.replace("Rev ", "R")}
                      </span>
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <span className="font-[Outfit,sans-serif] text-base font-semibold text-[var(--lp-text-strong)]">
                          {rev.rev}
                        </span>
                        <span className="ml-2 text-sm text-[var(--lp-text-muted)]">
                          {rev.date}
                        </span>
                        <span className="ml-2 text-sm text-[var(--lp-text-tertiary)]">
                          {rev.author}
                        </span>
                      </div>
                      <StatusBadge status={rev.status} label={rev.statusLabel} />
                    </div>
                  </div>

                  {/* Changes */}
                  <div className="ml-[23px] border-l border-transparent pl-8 md:ml-[27px]">
                    <div className="mt-3 space-y-2">
                      {rev.changes.map((change, ci) => (
                        <motion.div
                          key={ci}
                          initial={{ opacity: 0, x: -8 }}
                          animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ duration: 0.3, delay: 0.5 + ri * 0.15 + ci * 0.06 }}
                          className="glass-card rounded-lg px-4 py-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <ChangeIcon type={change.type} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[var(--lp-text-strong)]">
                                  {change.label}
                                </span>
                              </div>
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--lp-text-muted)]">
                                <span className="truncate">{change.file}</span>
                                {change.detail && (
                                  <>
                                    <span className="text-[var(--lp-text-dim)]">·</span>
                                    <span className="font-mono text-[var(--lp-brand)]">{change.detail}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Approval info */}
                    {rev.status === "approved" && rev.approver && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/[0.05] px-4 py-2.5">
                        <UserCheck size={14} className="text-emerald-500" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                          {rev.approver} 승인
                        </span>
                        <span className="text-xs text-[var(--lp-text-dim)]">{rev.approvedAt}</span>
                      </div>
                    )}

                    {rev.status === "pending" && rev.reviewer && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/[0.05] px-4 py-2.5">
                        <Clock size={14} className="text-amber-500" />
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          {rev.reviewer} 검토 대기 중
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
