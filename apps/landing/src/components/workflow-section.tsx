import { Upload, Sparkles, Check, Users, Factory } from "lucide-react";

const steps = [
  { num: "01", icon: <Upload size={16} />, title: "업로드", desc: "기존 엑셀 BOM을 그대로 끌어다 놓으면 됩니다." },
  { num: "02", icon: <Sparkles size={16} />, title: "AI 매핑", desc: "컬럼 의미를 LLM이 파악, 95% 정확도로 정리합니다.", featured: true },
  { num: "03", icon: <Check size={16} />, title: "검토 · 승인", desc: "매핑 결과를 한눈에 확인하고 클릭으로 확정합니다." },
  { num: "04", icon: <Users size={16} />, title: "팀 공유", desc: "구매·생산·품질이 같은 데이터를 같은 화면에서." },
  { num: "05", icon: <Factory size={16} />, title: "생산 연결", desc: "발주, 재고, 변경 이력이 BOM과 연결되어 흐릅니다." },
];

export function WorkflowSection() {
  return (
    <section className="lp2-section tinted" id="workflow">
      <div className="wrap">
        <div className="lp2-eyebrow">HOW IT WORKS</div>
        <h2 className="lp2-title">
          기존 엑셀에서 시스템으로,
          <br />
          10분이면 충분합니다
        </h2>
        <p className="lp2-lead">설치도, 컨설턴트도, 사전 교육도 없습니다. 쓰시던 엑셀 파일 하나로 시작하세요.</p>
        <div className="lp2-workflow">
          {steps.map((s) => (
            <div key={s.num} className={`lp2-wf-step ${s.featured ? "featured" : ""}`}>
              <div className="wf-num">{s.num}</div>
              <div className="wf-icon">{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
