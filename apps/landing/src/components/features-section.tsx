import { Sparkles, GitBranch, Users, ShoppingCart } from "lucide-react";

const mappingRows = [
  { from: '"PART NO."', to: "품번", conf: "99%" },
  { from: '"품명 (KOR)"', to: "품명", conf: "100%" },
  { from: '"MATERIAL SPEC"', to: "규격", conf: "94%" },
  { from: '"Q\'TY (EA)"', to: "수량", conf: "98%" },
  { from: '"비고"', to: "메모", conf: "86%" },
];

const revisions = [
  { tag: "REV-03", text: "리어 커버 — 두께 변경", meta: "2025.04.18 김설계", current: true },
  { tag: "REV-02", text: "홀 위치 보정", meta: "2025.03.04 박엔지" },
  { tag: "REV-01", text: "최초 릴리스", meta: "2025.02.11 김설계" },
];

export function FeaturesSection() {
  return (
    <section className="lp2-section" id="features">
      <div className="wrap">
        <div className="lp2-eyebrow">FEATURES</div>
        <h2 className="lp2-title">
          엑셀처럼 가볍게,
          <br />
          PLM처럼 정확하게
        </h2>
        <p className="lp2-lead">현장에서 정말 필요한 것만 골라 담았습니다. 도입 첫날부터 효과가 보이도록.</p>

        <div className="lp2-features-grid">
          <div className="lp2-feat lp2-feat-large">
            <div className="lp2-feat-icon">
              <Sparkles size={18} />
            </div>
            <h3>AI BOM 자동 매핑</h3>
            <p>
              "PART NO", "품번", "P/N" — 어떤 컬럼명이든 LLM이 의미를 파악해 자동 정리합니다. 평균 정확도 95%, 검토는 클릭 한 번. 컬럼이 100개여도, 시트가 10개여도 한 번에.
            </p>
            <div className="lp2-feat-visual">
              <div className="lp2-mapping-demo">
                {mappingRows.map((r) => (
                  <div key={r.from} className="md-row">
                    <span className="md-from">{r.from}</span>
                    <span className="md-arrow">→</span>
                    <span className="md-to">{r.to}</span>
                    <span className="md-conf">{r.conf}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lp2-feat lp2-feat-side">
            <div className="lp2-feat-icon">
              <GitBranch size={18} />
            </div>
            <h3>도면 리비전이 한 줄로 보입니다</h3>
            <p>
              최신 리비전을 시스템이 보장합니다. 누가 언제 무엇을 승인했는지 자동 기록되어, 현장이 옛 도면을 잡을 일이 없습니다.
            </p>
            <div className="lp2-rev-tree">
              {revisions.map((r) => (
                <div key={r.tag} className={`lp2-rev-item ${r.current ? "current" : ""}`}>
                  <span className="rev-tag">{r.tag}</span>
                  <span>{r.text}</span>
                  <span className="rev-meta">{r.meta}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lp2-feat lp2-feat-third">
            <div className="lp2-feat-icon">
              <GitBranch size={18} />
            </div>
            <h3>설계 변경 (ECO)</h3>
            <p>요청, 검토, 승인, 배포까지 단일 워크플로우. 누가 언제 무엇을 승인했는지 감사 추적이 자동으로 남습니다.</p>
          </div>
          <div className="lp2-feat lp2-feat-third">
            <div className="lp2-feat-icon">
              <Users size={18} />
            </div>
            <h3>실무 부서별 권한</h3>
            <p>설계, 생산, 구매, 품질 — 각 부서가 같은 데이터를 보되, 필요한 만큼만. Viewer/Collaborator/Full 3단계 권한.</p>
          </div>
          <div className="lp2-feat lp2-feat-third">
            <div className="lp2-feat-icon">
              <ShoppingCart size={18} />
            </div>
            <h3>발주 자동 연동</h3>
            <p>BOM 한 번이면 거래처별 발주서가 자동 생성됩니다. 재고 임계치 알림으로 결품을 미리 방지합니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
