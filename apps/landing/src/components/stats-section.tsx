const stats = [
  { num: "95", unit: "%", label: "AI BOM 매핑 정확도", desc: "평균 컬럼 식별 신뢰도" },
  { num: "10", unit: "분", label: "평균 도입 시간", desc: "엑셀 업로드 → 첫 BOM" },
  { num: "73", unit: "%", label: "버전 사고 감소", desc: "도면 오기재 사례 기준" },
  { num: "5", unit: "시간", label: "주당 절약 시간", desc: "사용자 1인당 평균" },
];

export function StatsSection() {
  return (
    <section className="lp2-section tinted">
      <div className="wrap">
        <div className="lp2-eyebrow">BY THE NUMBERS</div>
        <h2 className="lp2-title">
          데이터로 증명되는
          <br />
          도입 효과
        </h2>
        <p className="lp2-lead">하드웨어 스타트업 47곳, 중소 제조사 130곳의 운영 데이터 기준. (2024년)</p>
        <div className="lp2-stats">
          {stats.map((s) => (
            <div key={s.label} className="lp2-stat">
              <div className="sn">
                {s.num}
                <span className="unit">{s.unit}</span>
              </div>
              <div className="sl">{s.label}</div>
              <div className="sd">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
