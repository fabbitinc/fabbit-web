// BACKLOG: 소셜 로그인 — OAuth 백엔드 연동 완료 후 주석 해제. Google/Naver/Kakao Provider 구현 필요.

// import { Button } from "@/components/ui/button";

// function GoogleIcon({ className }: { className?: string }) {
//   return (
//     <svg className={className} viewBox="0 0 24 24">
//       <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
//       <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
//       <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
//       <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
//     </svg>
//   );
// }

// function NaverIcon({ className }: { className?: string }) {
//   return (
//     <svg className={className} viewBox="0 0 24 24">
//       <path fill="#03C75A" d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
//     </svg>
//   );
// }

// function KakaoIcon({ className }: { className?: string }) {
//   return (
//     <svg className={className} viewBox="0 0 24 24">
//       <path fill="#000000" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
//     </svg>
//   );
// }

/** 소셜 로그인 구분선 + 버튼 영역. OAuth 미구현으로 전체 주석 처리. */
export function SocialLoginSection() {
  return null;

  // return (
  //   <>
  //     <div className="relative my-6">
  //       <div className="absolute inset-0 flex items-center">
  //         <div className="w-full border-t border-gray-200" />
  //       </div>
  //       <div className="relative flex justify-center text-xs uppercase">
  //         <span className="bg-white px-4 text-gray-500 font-medium">
  //           Social Login
  //         </span>
  //       </div>
  //     </div>
  //
  //     <div className="grid grid-cols-3 gap-3">
  //       <Button
  //         type="button"
  //         variant="outline"
  //         className="h-12 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
  //       >
  //         <GoogleIcon className="h-5 w-5" />
  //       </Button>
  //       <Button
  //         type="button"
  //         variant="outline"
  //         className="h-12 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
  //       >
  //         <NaverIcon className="h-4 w-4" />
  //       </Button>
  //       <Button
  //         type="button"
  //         variant="outline"
  //         className="h-12 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
  //       >
  //         <KakaoIcon className="h-5 w-5" />
  //       </Button>
  //     </div>
  //   </>
  // );
}
