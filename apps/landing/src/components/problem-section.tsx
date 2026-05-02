import { AlertTriangle } from "lucide-react";

const problems = [
  {
    label: "도면 버전 사고",
    title: "현장이 옛날 도면으로 가공한 적이 있습니다",
    body: "NAS에 도면이 _final_v3, _진짜최종 식으로 쌓이면서, 누가 어떤 버전을 봤는지 추적이 불가능해집니다.",
    quote: "\"도면 한 장 바뀐 걸 모르고 50개 가공이 들어갔습니다. 손실이 800만 원이었습니다.\"",
  },
  {
    label: "BOM 동기화 실패",
    title: "설계, 구매, 생산이 각자의 엑셀을 봅니다",
    body: "설계가 BOM을 수정해도 구매팀 엑셀에는 반영이 안 됩니다. 발주는 옛날 BOM으로 나가고, 부품은 안 맞고, 일정은 밀립니다.",
    quote: "\"같은 부품인데 부서마다 품번이 달라서, 발주서 확인하는 데만 하루가 걸립니다.\"",
  },
  {
    label: "변경 이력의 부재",
    title: "\"이거 누가, 언제, 왜 바꿨지?\"",
    body: "설계 변경(ECO)이 메신저로 오갑니다. 6개월 후 같은 문제가 재발했을 때, 그때 무엇을 결정했는지 아무도 기억하지 못합니다.",
    quote: "\"감사 받을 때 변경 근거를 못 찾아서 며칠씩 메신저를 뒤졌습니다.\"",
  },
  {
    label: "기존 PLM의 진입 장벽",
    title: "도입 비용 수억 원, 도입 기간 6개월",
    body: "대기업용 PLM은 우리 같은 30~100인 제조사에는 과합니다. 컨설턴트와 6개월을 보내고도, 결국 엑셀로 돌아오는 경우가 많습니다.",
    quote: "\"PLM 도입했다가 한 달 만에 다시 엑셀로 갔습니다. 그게 더 빨랐습니다.\"",
  },
];

export function ProblemSection() {
  return (
    <section className="lp2-section tinted" id="problem">
      <div className="wrap">
        <div className="lp2-eyebrow">PROBLEM</div>
        <h2 className="lp2-title">
          엑셀과 NAS, 메신저로
          <br />
          관리하던 시간이 누적되고 있습니다
        </h2>
        <p className="lp2-lead">
          기존 PLM은 도입에만 6개월, 비용은 수억 원. 그렇다고 엑셀을 계속 쓸 수도 없습니다. 이 사이의 빈 공간을 Fabbit이 메웁니다.
        </p>
        <div className="lp2-problem-grid">
          {problems.map((p) => (
            <div key={p.label} className="lp2-problem-cell">
              <div className="pc-label">
                <AlertTriangle size={12} /> {p.label}
              </div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              <div className="pc-quote">{p.quote}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
