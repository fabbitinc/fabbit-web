import { Check, X } from "lucide-react";

type CellValue = string | boolean;

const rows: { label: string; values: [CellValue, CellValue, CellValue] }[] = [
  { label: "도입 기간", values: ["10분", "3-6개월", "10분"] },
  { label: "초기 비용", values: ["없음", "수천만~수억 원", "없음"] },
  { label: "버전 사고 위험", values: ["높음", "낮음", "0"] },
  { label: "감사 추적", values: [false, true, true] },
  { label: "AI 자동 매핑", values: [false, false, true] },
  { label: "실시간 협업", values: [false, true, true] },
  { label: "한국 제조 특화", values: [true, false, true] },
  { label: "ERP/MES 연동", values: [false, true, true] },
];

function Cell({ value, isFeature }: { value: CellValue; isFeature: boolean }) {
  let content: React.ReactNode = value;
  if (typeof value === "boolean") {
    content = value ? <Check className="ic-yes" /> : <X className="ic-no" />;
  }
  return <div className={`lp2-compare-cell ${isFeature ? "feature" : ""}`}>{content}</div>;
}

export function ComparisonSection() {
  return (
    <section className="lp2-section">
      <div className="wrap">
        <div className="lp2-eyebrow">COMPARISON</div>
        <h2 className="lp2-title">
          엑셀과 엔터프라이즈 PLM
          <br />
          그 사이의 균형점
        </h2>
        <p className="lp2-lead">큰 PLM의 무게 없이, 엑셀의 위험 없이. 30~100인 제조 환경에 맞춘 딱 그만큼.</p>
        <div className="lp2-compare">
          <div className="lp2-compare-row head">
            <div className="lp2-compare-cell" />
            <div className="lp2-compare-cell">엑셀 + NAS</div>
            <div className="lp2-compare-cell">엔터프라이즈 PLM</div>
            <div className="lp2-compare-cell feature">Fabbit</div>
          </div>
          {rows.map((r) => (
            <div key={r.label} className="lp2-compare-row">
              <div className="lp2-compare-cell label">{r.label}</div>
              {r.values.map((v, i) => (
                <Cell key={i} value={v} isFeature={i === 2} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
