import { Link } from "react-router-dom";
import { usePilotModal } from "@/app";

export function Footer() {
  const openPilot = usePilotModal();

  return (
    <footer className="lp2-foot">
      <div className="wrap">
        <div className="lp2-foot-grid">
          <div className="lp2-foot-brand">
            <div className="lp2-brand">
              <div className="lp2-brand-mark">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="lp2-brand-wm">Fabbit</div>
            </div>
            <p>
              엑셀에서 시스템으로, 가장 쉬운 첫 걸음. 하드웨어 스타트업과 중소 제조사를 위한 클라우드 PLM.
            </p>
          </div>
          <div className="lp2-foot-col">
            <h5>제품</h5>
            <ul>
              <li>
                <a href="/#features">기능</a>
              </li>
              <li>
                <Link to="/pricing">요금제</Link>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openPilot();
                  }}
                >
                  파일럿 신청
                </a>
              </li>
              <li>
                <a href="#">로드맵</a>
              </li>
            </ul>
          </div>
          <div className="lp2-foot-col">
            <h5>리소스</h5>
            <ul>
              <li>
                <a href="#">도입 가이드</a>
              </li>
              <li>
                <a href="#">API 문서</a>
              </li>
              <li>
                <a href="#">고객 사례</a>
              </li>
              <li>
                <a href="#">블로그</a>
              </li>
            </ul>
          </div>
          <div className="lp2-foot-col">
            <h5>회사</h5>
            <ul>
              <li>
                <a href="#">소개</a>
              </li>
              <li>
                <a href="#">채용</a>
              </li>
              <li>
                <a href="#">문의</a>
              </li>
              <li>
                <a href="#">파트너</a>
              </li>
            </ul>
          </div>
          <div className="lp2-foot-col">
            <h5>지원</h5>
            <ul>
              <li>
                <a href="#">도움말</a>
              </li>
              <li>
                <a href="#">상태</a>
              </li>
              <li>
                <a href="#">정부 바우처</a>
              </li>
              <li>
                <a href="#">보안</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="lp2-foot-bottom">
          <div>© 2026 Fabbit Inc. · 사업자등록번호 000-00-00000</div>
          <div className="legal-links">
            <a href="#">개인정보처리방침</a>
            <a href="#">이용약관</a>
            <a href="#">한국어 ▾</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
