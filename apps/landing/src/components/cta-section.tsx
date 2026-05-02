import { ArrowRight, Check } from "lucide-react";
import { APP_SIGNUP_URL } from "@/constants/urls";
import { usePilotModal } from "@/app";

export function CtaSection() {
  const openPilot = usePilotModal();
  return (
    <div className="wrap">
      <div className="lp2-final-cta">
        <div className="lp2-final-cta-inner">
          <h2>
            10분 안에 첫 BOM을
            <br />
            올려보세요
          </h2>
          <p>설치도, 교육도, 컨설턴트도 필요 없습니다. 쓰시던 엑셀 파일 한 개면 시작입니다.</p>
          <div className="lp2-hero-cta">
            <a className="lp2-btn primary lg" href={APP_SIGNUP_URL}>
              무료로 시작하기
              <ArrowRight size={14} className="arrow" />
            </a>
            <button type="button" className="lp2-btn outline lg" onClick={openPilot}>
              영업팀과 상담
            </button>
          </div>
          <div className="lp2-final-cta-note">
            <span>
              <Check size={14} /> 신용카드 등록 불필요
            </span>
            <span>
              <Check size={14} /> 5명까지 무료
            </span>
            <span>
              <Check size={14} /> 정부 바우처 지원
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
