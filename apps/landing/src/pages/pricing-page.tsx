import { useState } from "react";
import { Button, Select, SelectItem, Accordion, AccordionItem } from "@heroui/react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Mail, Sparkles, Calculator, Minus, Plus } from "lucide-react";
import { plans, planSpecs, STORAGE_OVERAGE_PER_GB } from "@/constants/plans";
import { APP_SIGNUP_URL } from "@/constants/urls";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

/* ───────── 요금 계산기 ───────── */

function PricingCalculator() {
  const [selectedPlan, setSelectedPlan] = useState("Team");
  const [viewers, setViewers] = useState(0);
  const [collaborators, setCollaborators] = useState(0);
  const [fulls, setFulls] = useState(1);
  const [extraStorageGB, setExtraStorageGB] = useState(0);

  const spec = planSpecs.find((s) => s.name === selectedPlan);
  const seatPrice = spec?.seatPrice;

  const seatTotal = seatPrice
    ? viewers * seatPrice.viewer +
      collaborators * seatPrice.collaborator +
      fulls * seatPrice.full
    : 0;
  const storageTotal = extraStorageGB * STORAGE_OVERAGE_PER_GB;
  const monthlyTotal = seatTotal + storageTotal;

  function Counter({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--lp-text-tertiary)]">{label}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(Math.max(0, value - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--lp-border)] text-[var(--lp-text-dim)] hover:border-[var(--lp-brand)]/30 hover:text-[var(--lp-text-strong)] transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center font-[Outfit,sans-serif] text-sm font-medium tabular-nums text-[var(--lp-text-strong)]">
            {value}
          </span>
          <button
            onClick={() => onChange(value + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--lp-border)] text-[var(--lp-text-dim)] hover:border-[var(--lp-brand)]/30 hover:text-[var(--lp-text-strong)] transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[Outfit,sans-serif] text-2xl font-semibold tracking-tight text-[var(--lp-text-strong)] md:text-3xl">
            <Calculator size={24} className="mr-2 inline text-[var(--lp-brand)]" />
            요금 계산기
          </h2>
          <p className="mt-3 text-sm text-[var(--lp-text-muted)]">
            좌석 수와 스토리지 가정을 넣고 예상 월 비용을 확인하세요.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-[var(--lp-border-hover)] bg-[var(--lp-surface)] p-6 md:p-8">
          {/* 플랜 선택 */}
          <Select
            label="플랜 선택"
            selectedKeys={[selectedPlan]}
            onSelectionChange={(keys) => {
              const key = [...keys][0] as string;
              if (key) setSelectedPlan(key);
            }}
            classNames={{ trigger: "border-[var(--lp-border)] bg-[var(--lp-surface-dim)]" }}
          >
            {planSpecs
              .filter((s) => s.seatPrice)
              .map((s) => (
                <SelectItem key={s.name}>
                  {s.name}
                  {!s.active ? " (비활성)" : ""}
                </SelectItem>
              ))}
          </Select>

          {seatPrice && (
            <>
              <div className="mt-6 space-y-4">
                <Counter label={`Viewer (${seatPrice.viewer.toLocaleString()}원)`} value={viewers} onChange={setViewers} />
                <Counter label={`Collaborator (${seatPrice.collaborator.toLocaleString()}원)`} value={collaborators} onChange={setCollaborators} />
                <Counter label={`Full (${seatPrice.full.toLocaleString()}원)`} value={fulls} onChange={setFulls} />
              </div>

              <div className="mt-6 border-t border-[var(--lp-border)] pt-4">
                <Counter label={`추가 스토리지 (${STORAGE_OVERAGE_PER_GB}원/GB)`} value={extraStorageGB} onChange={setExtraStorageGB} />
              </div>

              {/* 결과 */}
              <div className="mt-6 rounded-xl bg-[var(--lp-surface-dim)] p-5">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[var(--lp-text-tertiary)]">
                    <span>좌석 비용</span>
                    <span className="font-[Outfit,sans-serif] tabular-nums text-[var(--lp-text-secondary)]">
                      {seatTotal.toLocaleString()}원
                    </span>
                  </div>
                  {storageTotal > 0 && (
                    <div className="flex justify-between text-[var(--lp-text-tertiary)]">
                      <span>스토리지 초과</span>
                      <span className="font-[Outfit,sans-serif] tabular-nums text-[var(--lp-text-secondary)]">
                        {storageTotal.toLocaleString()}원
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[var(--lp-border)] pt-2 text-base font-medium">
                    <span className="text-[var(--lp-text-strong)]">월 예상 비용</span>
                    <span className="font-[Outfit,sans-serif] tabular-nums text-[var(--lp-brand)]">
                      {monthlyTotal.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-xs text-[var(--lp-text-dim)]">
                실제 청구는 워크스페이스 구성과 사용량에 따라 달라질 수 있습니다.
              </p>

              {!spec?.active && (
                <p className="mt-2 text-center text-xs text-amber-400">
                  {spec?.name}은 현재 비활성 상태입니다. 계산은 가능하지만 가입 CTA는 비활성입니다.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────── 비교표 ───────── */

function ComparisonTable() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mx-auto max-w-2xl text-center font-[Outfit,sans-serif] text-2xl font-semibold tracking-tight text-[var(--lp-text-strong)] md:text-3xl">
          플랜 비교
        </h2>
        <div className="mx-auto mt-10 max-w-4xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--lp-border)]">
                <th className="py-3 pr-4 text-left text-xs font-medium text-[var(--lp-text-muted)]">항목</th>
                {planSpecs.map((s) => (
                  <th
                    key={s.name}
                    className={`px-4 py-3 text-center text-xs font-medium ${s.active ? "text-[var(--lp-text-strong)]" : "text-[var(--lp-text-dim)]"}`}
                  >
                    {s.name}
                    {!s.active && <span className="ml-1 text-[10px] text-amber-400">(비활성)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lp-border)]">
              <Row label="멤버" values={planSpecs.map((s) => s.maxMembers)} />
              <Row
                label="Viewer 좌석"
                values={planSpecs.map((s) => (s.seatPrice ? `${s.seatPrice.viewer.toLocaleString()}원` : "—"))}
              />
              <Row
                label="Collaborator 좌석"
                values={planSpecs.map((s) => (s.seatPrice ? `${s.seatPrice.collaborator.toLocaleString()}원` : "—"))}
              />
              <Row
                label="Full 좌석"
                values={planSpecs.map((s) => (s.seatPrice ? `${s.seatPrice.full.toLocaleString()}원` : "—"))}
              />
              <Row label="기본 스토리지" values={planSpecs.map((s) => s.baseStorage)} />
              <Row label="Full당 추가 스토리지" values={planSpecs.map((s) => s.storagePerFull)} />
              <Row
                label="스토리지 초과"
                values={planSpecs.map((s) => (s.seatPrice ? `${STORAGE_OVERAGE_PER_GB}원/GB` : "—"))}
              />
              <Row label="AI 정책" values={planSpecs.map((s) => s.aiPolicy)} />
              <Row
                label="활성 여부"
                values={planSpecs.map((s) => (s.active ? "활성" : "비활성"))}
              />
            </tbody>
          </table>
          <p className="mt-4 text-xs text-[var(--lp-text-dim)]">
            현재 공개 페이지에서는 플랜, 좌석 단가, 스토리지, AI 정책처럼 시작 판단에 필요한 기준과 예상 비용 계산기를 함께 안내합니다. 실제 좌석 조합과 추후 업그레이드 경로는 앱 내부 구독 흐름에서 이어집니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <td className="py-3 pr-4 text-xs font-medium text-[var(--lp-text-tertiary)]">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-3 text-center text-xs text-[var(--lp-text-secondary)]">
          {v}
        </td>
      ))}
    </tr>
  );
}

/* ───────── 도입 방식 ───────── */

function AdoptionSteps() {
  const steps = [
    {
      num: "1",
      title: "가입",
      desc: "이메일로 바로 가입하고 워크스페이스를 만듭니다.",
    },
    {
      num: "2",
      title: "워크스페이스 생성과 플랜 선택",
      desc: "팀 정보를 입력하고 Starter 또는 Team을 선택합니다.",
    },
    {
      num: "3",
      title: "Starter 시작 또는 Team 선택",
      desc: "Starter는 상시 무료, Team은 좌석 타입별 비용을 확인한 뒤 선택하는 유료 플랜입니다.",
    },
  ];

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mx-auto max-w-2xl text-center font-[Outfit,sans-serif] text-2xl font-semibold tracking-tight text-[var(--lp-text-strong)] md:text-3xl">
          도입 방식
        </h2>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.num} className="rounded-xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lp-brand)]/10 font-[Outfit,sans-serif] text-sm font-bold text-[var(--lp-brand)]">
                {s.num}
              </div>
              <h3 className="font-[Outfit,sans-serif] text-sm font-semibold text-[var(--lp-text-strong)]">
                {s.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--lp-text-muted)]">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-[var(--lp-text-dim)]">
          파일럿이 필요한 팀은 보조 파일럿 신청 경로로 문의할 수 있습니다. Organization과 Enterprise는 현재 노출만 하고 가입 CTA는 비활성으로 둡니다.
        </p>
      </div>
    </section>
  );
}

/* ───────── FAQ ───────── */

const faqItems = [
  {
    q: "ERP를 이미 쓰고 있어도 필요한가요?",
    a: "네. Fabbit은 ERP를 대체하는 것이 아니라, ERP에 없는 도면·BOM 관리와 설계 변경 추적을 보완합니다. ERP와 함께 사용할 때 가장 효과적입니다.",
  },
  {
    q: "PLM이나 MES를 몰라도 쓸 수 있나요?",
    a: "네. Fabbit은 엑셀과 폴더로 도면·BOM을 관리하는 팀을 위해 설계되었습니다. PLM이나 MES 경험 없이도 바로 시작할 수 있습니다.",
  },
  {
    q: "Starter 무료 플랜으로 어디까지 사용할 수 있나요?",
    a: "Starter는 최대 5명, 스토리지 250MB, AI 크레딧 월 100회를 포함하는 상시 무료 플랜입니다. 기본 도면·BOM 관리를 제한 없이 사용할 수 있습니다.",
  },
  {
    q: "유료 플랜은 사람 수가 아니라 좌석 타입으로 과금되나요?",
    a: "맞습니다. 유료 플랜은 Viewer, Collaborator, Full 좌석 타입별 단가를 조합하는 구조입니다. 팀 내 역할에 맞는 좌석을 배정해 비용을 최적화할 수 있습니다.",
  },
  {
    q: "스토리지는 어떻게 계산되고 언제 추가 과금이 붙나요?",
    a: "각 플랜에는 기본 스토리지가 포함되고, Full 좌석 수에 따라 추가 스토리지가 제공됩니다. 기본 + Full 추가분을 초과하면 1GB당 월 200원이 과금됩니다.",
  },
  {
    q: "AI 사용량은 어떤 방식으로 과금되나요?",
    a: "Starter는 월 100 크레딧이 포함되며 포함형만 사용 가능합니다. Team 이상의 유료 플랜은 사용량 기반 과금으로, 실제 사용한 만큼만 청구됩니다.",
  },
  {
    q: "요금 계산기 금액과 실제 청구 금액은 왜 다를 수 있나요?",
    a: "계산기는 입력한 좌석 수와 스토리지 기준의 예상 금액입니다. 실제 청구는 월별 좌석 변동, 스토리지 사용량, AI 사용량에 따라 달라질 수 있습니다.",
  },
  {
    q: "파일럿 신청은 어떤 경우에 필요한가요?",
    a: "대부분은 바로 가입해서 Starter로 시작할 수 있습니다. 도입 전 운영 범위를 함께 확인하거나 맞춤 지원이 필요한 팀은 파일럿 신청을 통해 문의하실 수 있습니다.",
  },
  {
    q: "Organization과 Enterprise는 왜 보이지만 바로 가입할 수 없나요?",
    a: "Organization과 Enterprise는 가격과 과금 구조를 공개하지만, 현재 공개 사이트에서는 비활성 상태입니다. 준비가 완료되면 가입이 가능해집니다.",
  },
];

function PricingFaq() {
  return (
    <section id="faq" className="section-padding">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mx-auto max-w-2xl text-center font-[Outfit,sans-serif] text-2xl font-semibold tracking-tight text-[var(--lp-text-strong)] md:text-3xl">
          자주 묻는 질문
        </h2>
        <div className="mx-auto mt-10 max-w-2xl">
          <Accordion variant="splitted" className="gap-3">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                title={<span className="text-sm font-medium text-[var(--lp-text-strong)]">{item.q}</span>}
                classNames={{
                  base: "border border-[var(--lp-border)] bg-[var(--lp-surface)] rounded-xl px-4",
                  trigger: "py-4",
                  content: "pb-4 text-sm leading-relaxed text-[var(--lp-text-tertiary)]",
                }}
              >
                {item.a}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

/* ───────── 플랜 카드 (pricing-section 재활용) ───────── */

function PlanCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 md:p-7 ${
            plan.highlighted
              ? "border border-[var(--lp-brand)]/30 bg-gradient-to-b from-[var(--lp-brand)]/[0.08] to-transparent shadow-xl shadow-[var(--lp-brand)]/10"
              : "glass-card"
          }`}
        >
          {plan.badge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--lp-brand)] px-3 py-1 text-xs font-semibold text-[var(--lp-on-brand)] shadow-lg">
                <Sparkles size={10} />
                {plan.badge}
              </span>
            </div>
          )}

          <div>
            <h3 className="font-[Outfit,sans-serif] text-base font-medium text-[var(--lp-text-strong)]">{plan.name}</h3>
            <p className="mt-1 text-xs text-[var(--lp-text-muted)]">{plan.description}</p>
          </div>

          <div className="mt-5">
            <div className="flex items-baseline gap-1">
              <span className="font-[Outfit,sans-serif] text-2xl font-bold tabular-nums text-[var(--lp-text-strong)] md:text-3xl">
                {plan.price}
              </span>
              {plan.priceUnit && (
                <span className="text-sm text-[var(--lp-text-muted)]">{plan.priceUnit}</span>
              )}
            </div>
          </div>

          <ul className="mt-6 flex-1 space-y-3">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--lp-text-tertiary)]">
                <Check
                  size={16}
                  className={`mt-0.5 flex-shrink-0 ${plan.highlighted ? "text-[var(--lp-brand)]" : "text-[var(--lp-text-dim)]"}`}
                />
                {f}
              </li>
            ))}
          </ul>

          <Button
            as={!plan.disabled ? "a" : undefined}
            href={!plan.disabled ? APP_SIGNUP_URL : undefined}
            isDisabled={plan.disabled}
            className={`mt-8 w-full font-[Outfit,sans-serif] font-medium transition-all duration-200 ${
              plan.disabled
                ? "border border-[var(--lp-border)] bg-transparent text-[var(--lp-text-dim)] cursor-not-allowed opacity-60"
                : plan.highlighted
                  ? "bg-[var(--lp-brand)] text-[var(--lp-on-brand)] shadow-lg shadow-[var(--lp-brand)]/20 hover:shadow-[var(--lp-brand)]/40"
                  : "border border-[var(--lp-border)] bg-transparent text-[var(--lp-text-secondary)] hover:border-[var(--lp-brand)]/30 hover:text-[var(--lp-text-strong)]"
            }`}
            endContent={!plan.disabled ? <ArrowRight size={16} /> : undefined}
          >
            {plan.cta}
          </Button>
        </div>
      ))}
    </div>
  );
}

/* ───────── 페이지 본체 ───────── */

export function PricingPage({ onPilotClick }: { onPilotClick: () => void }) {
  return (
    <div className="noise-overlay min-h-screen bg-[var(--lp-bg)] font-[DM_Sans,sans-serif] text-[var(--lp-text)]">
      <Header />
      <main>
        {/* 히어로 */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl text-center"
            >
              <h1 className="font-[Outfit,sans-serif] text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                무료로 시작하고,
                <br />
                <span className="text-[var(--lp-brand)]">역할별 좌석으로 확장하는</span>
                <br />
                제조 데이터 워크스페이스
              </h1>
              <p className="mt-6 text-base leading-relaxed text-[var(--lp-text-tertiary)] md:text-lg">
                Starter는 최대 5명까지 무료로 시작하고, Team·Organization·Enterprise는
                <br className="hidden md:block" />
                Viewer, Collaborator, Full 좌석 조합으로 운영 범위를 확장합니다.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[var(--lp-brand)]/10 px-3 py-1 text-xs text-[var(--lp-brand)]">Starter 무료</span>
                  <span className="rounded-full bg-[var(--lp-border)] px-3 py-1 text-xs text-[var(--lp-text-muted)]">좌석 기반 과금</span>
                  <span className="rounded-full bg-[var(--lp-border)] px-3 py-1 text-xs text-[var(--lp-text-muted)]">전체 요금 공개</span>
                </div>
              </div>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  as="a"
                  href={APP_SIGNUP_URL}
                  size="lg"
                  className="bg-[var(--lp-brand)] px-8 font-[Outfit,sans-serif] font-semibold text-[var(--lp-on-brand)] shadow-xl shadow-[var(--lp-brand)]/25"
                  endContent={<ArrowRight size={18} />}
                >
                  가입
                </Button>
                <Button
                  size="lg"
                  variant="bordered"
                  className="border-[var(--lp-border-hover)] px-8 font-[Outfit,sans-serif] text-[var(--lp-text-secondary)]"
                  startContent={<Mail size={16} className="text-[var(--lp-brand)]" />}
                  onPress={onPilotClick}
                >
                  파일럿 신청
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 플랜 카드 */}
        <section className="section-padding">
          <div className="mx-auto max-w-7xl px-6">
            <PlanCards />
            <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-[var(--lp-text-dim)]">
              Organization과 Enterprise는 가격과 과금 구조를 공개하지만, 현재 공개 사이트에서는 비활성 상태로만 노출합니다.
            </p>
          </div>
        </section>

        {/* 요금 계산기 */}
        <PricingCalculator />

        {/* 과금 철학 */}
        <section className="section-padding">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mx-auto max-w-2xl text-center font-[Outfit,sans-serif] text-2xl font-semibold tracking-tight text-[var(--lp-text-strong)] md:text-3xl">
              과금 구조
            </h2>
            <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
              {[
                { title: "Starter 무료 진입", desc: "최대 5명까지 상시 무료로 시작하는 진입 플랜" },
                { title: "좌석 타입 조합", desc: "유료 플랜은 Viewer·Collaborator·Full 좌석 단가를 조합하는 구조" },
                { title: "스토리지 규칙", desc: "플랜 기본 제공량 + Full 좌석 수에 따라 자동 증가. 초과 시 1GB당 월 200원" },
                { title: "AI 과금", desc: "Starter는 월 100 크레딧 포함. 유료 플랜은 사용량 기반 과금" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-5">
                  <h3 className="font-[Outfit,sans-serif] text-sm font-semibold text-[var(--lp-text-strong)]">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--lp-text-muted)]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 비교표 */}
        <ComparisonTable />

        {/* 도입 방식 */}
        <AdoptionSteps />

        {/* FAQ */}
        <PricingFaq />

        {/* 마지막 CTA */}
        <section className="section-padding">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-[Outfit,sans-serif] text-2xl font-semibold tracking-tight text-[var(--lp-text-strong)] md:text-3xl">
              우리 팀에 맞는 시작 플랜을 바로 확인해보세요
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                as="a"
                href={APP_SIGNUP_URL}
                size="lg"
                className="bg-[var(--lp-brand)] px-8 font-[Outfit,sans-serif] font-semibold text-[var(--lp-on-brand)] shadow-xl shadow-[var(--lp-brand)]/25"
                endContent={<ArrowRight size={18} />}
              >
                가입
              </Button>
              <Button
                size="lg"
                variant="bordered"
                className="border-[var(--lp-border-hover)] px-8 font-[Outfit,sans-serif] text-[var(--lp-text-secondary)]"
                startContent={<Mail size={16} className="text-[var(--lp-brand)]" />}
                onPress={onPilotClick}
              >
                파일럿 신청
              </Button>
            </div>
            <p className="mt-4 text-xs text-[var(--lp-text-dim)]">
              Starter와 Team은 지금 구조를 확인하고 가입할 수 있으며, 파일럿이 필요한 팀은 별도 문의로 이어집니다.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
