import { useState } from "react";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, CheckCircle2, Building2, Users } from "lucide-react";

interface PilotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const industryOptions = [
  { key: "metal", label: "금속가공" },
  { key: "machinery", label: "기계장비" },
  { key: "electrical", label: "전기장비" },
  { key: "other-mfg", label: "기타 제조업" },
  { key: "other", label: "기타" },
];

const employeeOptions = [
  { key: "1-9", label: "1~9명" },
  { key: "10-49", label: "10~49명" },
  { key: "50-299", label: "50~299명" },
  { key: "300+", label: "300명 이상" },
];

const roleOptions = [
  { key: "ceo", label: "대표" },
  { key: "design", label: "설계" },
  { key: "production", label: "생산" },
  { key: "purchase", label: "구매" },
  { key: "quality", label: "품질" },
  { key: "other", label: "기타" },
];

const managementOptions = [
  { key: "excel", label: "엑셀" },
  { key: "folder", label: "폴더" },
  { key: "erp", label: "ERP" },
  { key: "other", label: "기타" },
];

const erpOptions = [
  { key: "yes", label: "사용 중" },
  { key: "no", label: "미사용" },
  { key: "planned", label: "도입 예정" },
];

const painOptions = [
  { key: "bom-manual", label: "BOM 수동 입력" },
  { key: "drawing-version", label: "도면 검색/버전 혼선" },
  { key: "change-delay", label: "설계 변경 반영 지연" },
  { key: "production-gap", label: "생산 연결/피드백 단절" },
];

export function PilotFormModal({ isOpen, onClose }: PilotFormModalProps) {
  const [step, setStep] = useState<1 | 2 | "done">(1);
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    employees: "",
    role: "",
    management: new Set<string>(),
    erp: "",
    pain: "",
    contactName: "",
    email: "",
    phone: "",
  });

  const isStep1Valid =
    form.companyName.trim() !== "" &&
    form.industry !== "" &&
    form.employees !== "" &&
    form.role !== "";

  const isStep2Valid =
    form.management.size > 0 &&
    form.erp !== "" &&
    form.pain !== "" &&
    form.contactName.trim() !== "" &&
    form.email.trim() !== "";

  function handleSubmit() {
    // TODO: 실제 API 연동
    setStep("done");
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep(1);
      setForm({
        companyName: "",
        industry: "",
        employees: "",
        role: "",
        management: new Set(),
        erp: "",
        pain: "",
        contactName: "",
        email: "",
        phone: "",
      });
    }, 300);
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-2xl border border-[var(--lp-border-hover)] bg-[var(--lp-bg)] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--lp-text-dim)] hover:bg-[var(--lp-border-hover)] hover:text-[var(--lp-text-strong)] transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="p-6 md:p-8">
              {step === "done" ? (
                /* 완료 화면 */
                <div className="py-8 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="font-[Outfit,sans-serif] text-xl font-semibold text-[var(--lp-text-strong)]">
                    신청이 접수되었습니다
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--lp-text-tertiary)]">
                    파일럿 적합 여부를 확인한 뒤 연락드리겠습니다.
                  </p>
                  <Button
                    className="mt-8 bg-[var(--lp-brand)] font-[Outfit,sans-serif] font-medium text-[var(--lp-on-brand)]"
                    onPress={handleClose}
                  >
                    확인
                  </Button>
                </div>
              ) : (
                <>
                  {/* 헤더 */}
                  <div className="mb-6">
                    <h3 className="font-[Outfit,sans-serif] text-lg font-semibold text-[var(--lp-text-strong)]">
                      무료 파일럿 신청
                    </h3>
                    <p className="mt-1 text-sm text-[var(--lp-text-muted)]">
                      파일럿 적합 여부를 빠르게 확인하고 다음 미팅을 준비하기 위해 필요한 정보만 받습니다.
                    </p>

                    {/* 단계 표시 */}
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${step === 1 ? "bg-[var(--lp-brand)] text-[var(--lp-on-brand)]" : "bg-[var(--lp-border)] text-[var(--lp-text-dim)]"}`}>
                          1
                        </div>
                        <span className={`text-xs ${step === 1 ? "text-[var(--lp-text-strong)]" : "text-[var(--lp-text-dim)]"}`}>
                          회사 정보
                        </span>
                      </div>
                      <div className="h-px flex-1 bg-[var(--lp-border)]" />
                      <div className="flex items-center gap-2">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${step === 2 ? "bg-[var(--lp-brand)] text-[var(--lp-on-brand)]" : "bg-[var(--lp-border)] text-[var(--lp-text-dim)]"}`}>
                          2
                        </div>
                        <span className={`text-xs ${step === 2 ? "text-[var(--lp-text-strong)]" : "text-[var(--lp-text-dim)]"}`}>
                          운영·연락처
                        </span>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-4"
                      >
                        <Input
                          label="회사명"
                          placeholder="회사명을 입력하세요"
                          isRequired
                          value={form.companyName}
                          onValueChange={(v) => setForm({ ...form, companyName: v })}
                          startContent={<Building2 size={16} className="text-[var(--lp-text-dim)]" />}
                          classNames={{ inputWrapper: "border-[var(--lp-border)] bg-[var(--lp-surface)]" }}
                        />
                        <Select
                          label="업종"
                          placeholder="업종을 선택하세요"
                          isRequired
                          selectedKeys={form.industry ? [form.industry] : []}
                          onSelectionChange={(keys) => setForm({ ...form, industry: [...keys][0] as string })}
                          classNames={{ trigger: "border-[var(--lp-border)] bg-[var(--lp-surface)]" }}
                        >
                          {industryOptions.map((o) => (
                            <SelectItem key={o.key}>{o.label}</SelectItem>
                          ))}
                        </Select>
                        <Select
                          label="직원 수"
                          placeholder="직원 수를 선택하세요"
                          isRequired
                          selectedKeys={form.employees ? [form.employees] : []}
                          onSelectionChange={(keys) => setForm({ ...form, employees: [...keys][0] as string })}
                          classNames={{ trigger: "border-[var(--lp-border)] bg-[var(--lp-surface)]" }}
                        >
                          {employeeOptions.map((o) => (
                            <SelectItem key={o.key}>{o.label}</SelectItem>
                          ))}
                        </Select>
                        <Select
                          label="역할"
                          placeholder="역할을 선택하세요"
                          isRequired
                          selectedKeys={form.role ? [form.role] : []}
                          onSelectionChange={(keys) => setForm({ ...form, role: [...keys][0] as string })}
                          classNames={{ trigger: "border-[var(--lp-border)] bg-[var(--lp-surface)]" }}
                        >
                          {roleOptions.map((o) => (
                            <SelectItem key={o.key}>{o.label}</SelectItem>
                          ))}
                        </Select>

                        {/* 파일럿 우선 대상 안내 */}
                        <div className="rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface)] p-3">
                          <p className="mb-2 text-xs font-medium text-[var(--lp-text-tertiary)]">
                            <Users size={12} className="mr-1 inline" />
                            파일럿 우선 대상
                          </p>
                          <ul className="space-y-1 text-xs text-[var(--lp-text-muted)]">
                            <li>• 10~49명 제조팀</li>
                            <li>• ERP는 있거나 도입 예정</li>
                            <li>• 도면과 BOM을 엑셀 또는 폴더로 관리하는 팀</li>
                          </ul>
                        </div>

                        <div className="flex justify-end pt-2">
                          <Button
                            isDisabled={!isStep1Valid}
                            className="bg-[var(--lp-brand)] font-[Outfit,sans-serif] font-medium text-[var(--lp-on-brand)]"
                            endContent={<ArrowRight size={16} />}
                            onPress={() => setStep(2)}
                          >
                            다음
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-4"
                      >
                        <Select
                          label="현재 관리 방식"
                          placeholder="현재 관리 방식을 선택하세요 (복수 선택)"
                          isRequired
                          selectionMode="multiple"
                          selectedKeys={form.management}
                          onSelectionChange={(keys) => setForm({ ...form, management: keys as Set<string> })}
                          classNames={{ trigger: "border-[var(--lp-border)] bg-[var(--lp-surface)]" }}
                        >
                          {managementOptions.map((o) => (
                            <SelectItem key={o.key}>{o.label}</SelectItem>
                          ))}
                        </Select>
                        <Select
                          label="ERP 사용 여부"
                          placeholder="선택하세요"
                          isRequired
                          selectedKeys={form.erp ? [form.erp] : []}
                          onSelectionChange={(keys) => setForm({ ...form, erp: [...keys][0] as string })}
                          classNames={{ trigger: "border-[var(--lp-border)] bg-[var(--lp-surface)]" }}
                        >
                          {erpOptions.map((o) => (
                            <SelectItem key={o.key}>{o.label}</SelectItem>
                          ))}
                        </Select>
                        <Select
                          label="가장 큰 문제"
                          placeholder="가장 큰 문제를 선택하세요"
                          isRequired
                          selectedKeys={form.pain ? [form.pain] : []}
                          onSelectionChange={(keys) => setForm({ ...form, pain: [...keys][0] as string })}
                          classNames={{ trigger: "border-[var(--lp-border)] bg-[var(--lp-surface)]" }}
                        >
                          {painOptions.map((o) => (
                            <SelectItem key={o.key}>{o.label}</SelectItem>
                          ))}
                        </Select>

                        <div className="border-t border-[var(--lp-border)] pt-4">
                          <p className="mb-3 text-xs font-medium text-[var(--lp-text-tertiary)]">연락처</p>
                          <div className="space-y-3">
                            <Input
                              label="담당자명"
                              placeholder="이름"
                              isRequired
                              value={form.contactName}
                              onValueChange={(v) => setForm({ ...form, contactName: v })}
                              classNames={{ inputWrapper: "border-[var(--lp-border)] bg-[var(--lp-surface)]" }}
                            />
                            <Input
                              type="email"
                              label="이메일"
                              placeholder="work@company.com"
                              isRequired
                              value={form.email}
                              onValueChange={(v) => setForm({ ...form, email: v })}
                              classNames={{ inputWrapper: "border-[var(--lp-border)] bg-[var(--lp-surface)]" }}
                            />
                            <Input
                              type="tel"
                              label="전화번호"
                              placeholder="010-0000-0000"
                              value={form.phone}
                              onValueChange={(v) => setForm({ ...form, phone: v })}
                              classNames={{ inputWrapper: "border-[var(--lp-border)] bg-[var(--lp-surface)]" }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between pt-2">
                          <Button
                            variant="light"
                            className="text-[var(--lp-text-tertiary)]"
                            startContent={<ArrowLeft size={16} />}
                            onPress={() => setStep(1)}
                          >
                            이전
                          </Button>
                          <Button
                            isDisabled={!isStep2Valid}
                            className="bg-[var(--lp-brand)] font-[Outfit,sans-serif] font-medium text-[var(--lp-on-brand)]"
                            onPress={handleSubmit}
                          >
                            신청하기
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
