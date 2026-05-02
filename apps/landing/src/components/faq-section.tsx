import { useState } from "react";
import { Plus } from "lucide-react";

const items = [
  {
    q: "기존 엑셀 BOM은 어떻게 옮기나요?",
    a: "현재 쓰고 계신 엑셀 파일을 그대로 업로드하시면 됩니다. AI가 컬럼 의미(품번, 품명, 수량 등)를 자동으로 파악합니다. 평균 95% 정확도로 매핑되며, 잘못된 부분은 클릭 한 번으로 수정 가능합니다.",
  },
  {
    q: "정부 바우처 사업으로 결제할 수 있나요?",
    a: "네, K-비대면 바우처 등 주요 정부 바우처 사업의 공식 공급기업으로 등록되어 있습니다. 바우처 발급 후 사업자등록증으로 결제 처리되며, 별도 안내 자료를 제공해드립니다.",
  },
  {
    q: "사내 보안 정책 때문에 클라우드를 쓸 수 없습니다.",
    a: "Enterprise 플랜은 온프레미스(자체 서버) 설치를 지원합니다. AWS/NCP 프라이빗 환경 또는 사내 IDC에 설치 가능하며, 보안 검토용 기술 자료를 별도로 제공합니다.",
  },
  {
    q: "기존 ERP나 MES와 연동되나요?",
    a: "Growth 플랜부터 발주·재고 시스템 연동이 가능합니다. Enterprise 플랜에서는 SAP, 더존, 영림원 등 국내 주요 ERP/MES와의 표준 커넥터를 제공하며, 커스텀 연동도 지원합니다.",
  },
  {
    q: "도입에 IT 인력이 필요한가요?",
    a: "별도 IT 인력 없이도 도입 가능합니다. 클라우드 기반이라 설치가 필요 없고, 기존 엑셀 사용자라면 평균 30분 이내에 핵심 기능을 익힐 수 있도록 설계되었습니다.",
  },
  {
    q: "Starter 플랜에서 Growth로 언제든 전환할 수 있나요?",
    a: "네. 데이터는 그대로 유지되며 결제만 추가됩니다. 반대로 Growth에서 Starter로 다운그레이드도 가능합니다 (단, 사용자 수와 BOM 수가 Starter 한도 이내여야 합니다).",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section className="lp2-section" id="faq">
      <div className="wrap">
        <div className="lp2-eyebrow">FAQ</div>
        <h2 className="lp2-title">자주 묻는 질문</h2>
        <div className="lp2-faq-list">
          {items.map((item, i) => (
            <div key={item.q} className={`lp2-faq-item ${open === i ? "open" : ""}`}>
              <button className="lp2-faq-q" onClick={() => setOpen(open === i ? -1 : i)} type="button">
                <span>{item.q}</span>
                <span className="lp2-faq-toggle">
                  <Plus size={12} />
                </span>
              </button>
              <div className="lp2-faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
