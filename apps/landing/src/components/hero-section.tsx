import {
  ArrowRight,
  Lock,
  Home,
  Activity,
  Box,
  FileText,
  Layers,
  GitBranch,
  ShoppingCart,
  Shield,
  Upload,
  Plus,
  Sparkles,
  Check,
} from "lucide-react";
import { APP_SIGNUP_URL } from "@/constants/urls";

export function HeroSection() {
  return (
    <section className="lp2-hero">
      <div className="wrap lp2-hero-inner">
        <a className="lp2-eyebrow-pill" href="#features">
          <span className="ep-tag">NEW</span>
          AI BOM 자동 매핑이 출시되었습니다
          <span className="ep-arrow">
            <ArrowRight size={12} />
          </span>
        </a>
        <h1 className="lp2-hero-title">
          엑셀 BOM에서 시작하는
          <br />
          <span className="accent">가장 쉬운 PLM 도입</span>
        </h1>
        <p className="lp2-hero-sub">
          도면, BOM, 발주, 설계 변경까지 한 시스템에서. 기존에 쓰시던 엑셀 파일을 그대로 올리시면 AI가 구조를 이해하고 정리합니다.
        </p>
        <div className="lp2-hero-cta">
          <a className="lp2-btn brand lg" href={APP_SIGNUP_URL}>
            무료로 시작하기
            <ArrowRight size={14} className="arrow" />
          </a>
        </div>
        <div className="lp2-hero-trust">
          <span className="dot" />
          신용카드 등록 없이 5명까지 무료
        </div>
        <HeroMockup />
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="lp2-mockup">
      <div className="lp2-mockup-chrome">
        <div className="traffic">
          <span />
          <span />
          <span />
        </div>
        <div className="url-bar">
          <Lock size={11} />
          app.fabbit.io / parts / BOM-0451
        </div>
      </div>
      <div className="lp2-mockup-body">
        <aside className="lp2-mock-sidebar">
          <div className="lp2-mock-sb-section">메인</div>
          <div className="lp2-mock-sb-item">
            <Home size={14} /> 대시보드
          </div>
          <div className="lp2-mock-sb-item">
            <Activity size={14} /> 활동
          </div>
          <div className="lp2-mock-sb-section" style={{ marginTop: 16 }}>
            설계
          </div>
          <div className="lp2-mock-sb-item active">
            <Box size={14} /> 부품 <span className="badge">312</span>
          </div>
          <div className="lp2-mock-sb-item">
            <FileText size={14} /> 도면
          </div>
          <div className="lp2-mock-sb-item">
            <Layers size={14} /> BOM
          </div>
          <div className="lp2-mock-sb-item">
            <GitBranch size={14} /> 변경 (ECO)
          </div>
          <div className="lp2-mock-sb-section" style={{ marginTop: 16 }}>
            운영
          </div>
          <div className="lp2-mock-sb-item">
            <ShoppingCart size={14} /> 발주
          </div>
          <div className="lp2-mock-sb-item">
            <Shield size={14} /> 품질
          </div>
        </aside>
        <main className="lp2-mock-main">
          <div className="lp2-mock-main-head">
            <div className="lp2-mock-bc">
              부품 / <b>BOM-0451</b>
            </div>
            <div className="lp2-mock-actions">
              <button className="lp2-mock-mini-btn" type="button">
                <Upload size={11} /> 내보내기
              </button>
              <button className="lp2-mock-mini-btn primary" type="button">
                <Plus size={11} /> 항목 추가
              </button>
            </div>
          </div>
          <div className="lp2-mock-title-row">
            <h3 className="lp2-mock-title">리어 커버 어셈블리</h3>
            <span className="lp2-mock-rev">REV-03</span>
            <span className="lp2-status-pill ok">
              <Check size={10} /> 승인됨
            </span>
          </div>
          <div className="lp2-mock-tabs">
            <div className="lp2-mock-tab active">BOM</div>
            <div className="lp2-mock-tab">도면</div>
            <div className="lp2-mock-tab">변경 이력</div>
            <div className="lp2-mock-tab">발주 현황</div>
            <div className="lp2-mock-tab">첨부</div>
          </div>
          <table className="lp2-mock-table">
            <thead>
              <tr>
                <th>품번</th>
                <th>품명</th>
                <th>규격</th>
                <th style={{ textAlign: "right" }}>수량</th>
                <th>재고</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pn">P-04510</td>
                <td>
                  <span className="name">
                    베어링{" "}
                    <span className="lp2-ai-pill">
                      <Sparkles size={9} /> AI 95%
                    </span>
                  </span>
                </td>
                <td>6204-2RS</td>
                <td className="num">120</td>
                <td>
                  <span className="lp2-status-pill ok">충분</span>
                </td>
              </tr>
              <tr>
                <td className="pn">P-04511</td>
                <td>
                  <span className="name">샤프트</span>
                </td>
                <td>SCM440 Ø20</td>
                <td className="num">8</td>
                <td>
                  <span className="lp2-status-pill low">부족</span>
                </td>
              </tr>
              <tr>
                <td className="pn">P-04512</td>
                <td>
                  <span className="name">
                    오링{" "}
                    <span className="lp2-ai-pill">
                      <Sparkles size={9} /> AI 88%
                    </span>
                  </span>
                </td>
                <td>NBR 30×2</td>
                <td className="num">450</td>
                <td>
                  <span className="lp2-status-pill ok">충분</span>
                </td>
              </tr>
              <tr>
                <td className="pn">P-04513</td>
                <td>
                  <span className="name">커버 플레이트</span>
                </td>
                <td>SS400 t3.0</td>
                <td className="num">36</td>
                <td>
                  <span className="lp2-status-pill ok">충분</span>
                </td>
              </tr>
              <tr>
                <td className="pn">P-04514</td>
                <td>
                  <span className="name">
                    볼트 M6×20{" "}
                    <span className="lp2-ai-pill">
                      <Sparkles size={9} /> AI 72%
                    </span>
                  </span>
                </td>
                <td>SUS304</td>
                <td className="num">144</td>
                <td>
                  <span className="lp2-status-pill review">검토</span>
                </td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>
      <div className="lp2-ai-overlay">
        <div className="lp2-ai-overlay-head">
          <div className="lp2-ai-overlay-icon">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="lp2-ai-overlay-title">AI 컬럼 매핑 결과</div>
            <div className="lp2-ai-overlay-sub">엑셀 헤더 → Fabbit 필드</div>
          </div>
        </div>
        {[
          { from: '"PART NO."', to: "품번", conf: "99%" },
          { from: '"품명"', to: "품명", conf: "100%" },
          { from: '"MATERIAL"', to: "규격", conf: "88%" },
          { from: '"Q\'TY"', to: "수량", conf: "95%" },
        ].map((row) => (
          <div key={row.from} className="lp2-ai-mapping-row">
            <span className="lp2-ai-from">{row.from}</span>
            <span className="lp2-ai-arrow">→</span>
            <span className="lp2-ai-to">{row.to}</span>
            <span className="lp2-ai-conf">{row.conf}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
