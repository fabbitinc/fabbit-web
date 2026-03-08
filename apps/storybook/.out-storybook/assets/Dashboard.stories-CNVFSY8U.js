import { j as e } from "./index-B4avf9CM.js";
import {
  d as n,
  e as m,
  L as d,
  F as u,
  G as a,
  P as c,
  c as x,
  U as b,
  B as p,
  S as o,
  ag as i,
  C as s,
  b as h,
  K as l,
  an as r,
  H as g,
} from "./production-result-detail-screen-kTjdDYfl.js";
import "./iframe-DjFiVPSj.js";
import { B as j } from "./user-avatar-CJtlkw0_.js";
import { A as C } from "./arrow-right-C0DFpbbM.js";
import { S as f } from "./sparkles-BrCodocr.js";
import "./index-CqusOY6v.js";
import "./circle-alert-7HBXfu_Z.js";
import "./chevrons-up-down-cjEB4Cse.js";
import "./settings-BbypiVPi.js";
import "./tag-BpztlO3h.js";
import "./preload-helper-PPVm8Dsz.js";
const k = e.jsxs("div", {
    className: "flex items-center gap-2",
    children: [
      e.jsx("div", {
        className:
          "flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground",
        children: e.jsxs("svg", {
          className: "size-4",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          children: [
            e.jsx("path", { d: "M12 2L2 7l10 5 10-5-10-5z" }),
            e.jsx("path", { d: "M2 17l10 5 10-5" }),
            e.jsx("path", { d: "M2 12l10 5 10-5" }),
          ],
        }),
      }),
      e.jsx("span", { className: "text-sm font-semibold", children: "Fabbit" }),
    ],
  }),
  v = { name: "문성하", email: "seongha@fabbit.io" },
  N = [
    { id: "profile", label: "개인 설정", icon: b, onClick: () => {} },
    { id: "org", label: "조직 설정", icon: p, onClick: () => {} },
  ],
  S = [
    {
      id: "main",
      items: [
        {
          id: "dashboard",
          label: "대시보드",
          icon: d,
          active: !0,
          onClick: () => {},
        },
        { id: "projects", label: "프로젝트", icon: u, onClick: () => {} },
        { id: "changes", label: "변경 관리", icon: a, onClick: () => {} },
        { id: "parts", label: "부품 관리", icon: c, onClick: () => {} },
      ],
    },
  ];
function A() {
  return e.jsxs("div", {
    className: "space-y-6 p-6",
    children: [
      e.jsxs("section", {
        children: [
          e.jsx("h2", {
            className: "mb-3 text-sm font-semibold text-foreground",
            children: "내 현황",
          }),
          e.jsxs(o, {
            columns: 3,
            children: [
              e.jsx(i, {
                icon: s,
                label: "할당된 이슈",
                value: "3건",
                sub: "열린 이슈",
                onClick: () => {},
              }),
              e.jsx(i, {
                icon: a,
                label: "할당된 변경요청",
                value: "2건",
                sub: "진행 중인 CR",
                onClick: () => {},
              }),
              e.jsx(i, {
                icon: c,
                label: "관리 중인 부품",
                value: "1,234개",
                sub: "전체 부품 수",
                onClick: () => {},
              }),
            ],
          }),
        ],
      }),
      e.jsx(h, {
        title: "내 작업",
        action: e.jsxs(j, {
          variant: "ghost",
          size: "sm",
          className: "h-7 gap-1 text-xs text-muted-foreground",
          children: ["전체 보기 ", e.jsx(C, { className: "size-3" })],
        }),
        items: [
          {
            id: "1",
            icon: s,
            iconClassName: "text-emerald-500",
            number: "#42",
            title: "센서 모듈 하우징 간섭 이슈",
            subtitle: "EV 모터 컨트롤러 · 2시간 전",
            label: { name: "긴급", color: "#ef4444" },
            status: { text: "열림", variant: "outline" },
            author: "김태현",
            onClick: () => {},
          },
          {
            id: "2",
            icon: a,
            iconClassName: "text-blue-500",
            number: "#15",
            title: "PCB 커넥터 핀 배열 변경",
            subtitle: "EV 모터 컨트롤러 · 4시간 전",
            label: { name: "설계변경", color: "#3b82f6" },
            status: { text: "검토 중", variant: "outline" },
            author: "이수진",
            onClick: () => {},
          },
          {
            id: "3",
            icon: s,
            iconClassName: "text-emerald-500",
            number: "#78",
            title: "방열판 재질 SUS304 → AL6061 검토",
            subtitle: "배터리 팩 v2 · 1일 전",
            label: { name: "검토필요", color: "#f59e0b" },
            status: { text: "열림", variant: "outline" },
            author: "박준서",
            onClick: () => {},
          },
          {
            id: "4",
            icon: a,
            iconClassName: "text-blue-500",
            number: "#8",
            title: "메인 하우징 도면 Rev.C 반영",
            subtitle: "배터리 팩 v2 · 2일 전",
            status: { text: "초안", variant: "outline" },
            author: "최민정",
            onClick: () => {},
          },
          {
            id: "5",
            icon: s,
            iconClassName: "text-emerald-500",
            number: "#103",
            title: "볼트 체결 토크 규격 정의",
            subtitle: "EV 모터 컨트롤러 · 3일 전",
            label: { name: "규격", color: "#8b5cf6" },
            status: { text: "열림", variant: "outline" },
            author: "정하은",
            onClick: () => {},
          },
        ],
      }),
      e.jsxs("section", {
        children: [
          e.jsx("h2", {
            className: "mb-3 text-sm font-semibold text-foreground",
            children: "부품 현황",
          }),
          e.jsxs(o, {
            columns: 3,
            children: [
              e.jsx(l, {
                label: "관리 중인 부품",
                value: "1,234개",
                change: "+48",
                changePositive: !0,
                extra: e.jsx("span", {
                  className: "text-xs text-muted-foreground",
                  children: "이번 주",
                }),
                className: "sm:col-span-2",
              }),
              e.jsx(l, {
                label: "BOM 연결",
                value: "3,891개",
                extra: e.jsx("span", {
                  className: "text-xs text-muted-foreground",
                  children: "부품 간 구성 관계 수",
                }),
              }),
            ],
          }),
        ],
      }),
      e.jsxs("section", {
        children: [
          e.jsx("h2", {
            className: "mb-3 text-sm font-semibold text-foreground",
            children: "사용량",
          }),
          e.jsxs(o, {
            columns: 2,
            children: [
              e.jsx(r, {
                icon: g,
                label: "파일 저장 용량",
                used: 8.2,
                limit: 10,
                unit: "GB",
              }),
              e.jsx(r, {
                icon: f,
                label: "AI 크레딧",
                used: 620,
                limit: 1e3,
                unit: "크레딧",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
const H = {
    title: "Pages/Dashboard",
    component: n,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
  },
  t = {
    render: () =>
      e.jsx(n, {
        header: e.jsx(x, {
          brand: k,
          user: v,
          onToggleSidebar: () => {},
          search: {
            triggerLabel: "검색",
            dialogPlaceholder: "품목, 도면, BOM 검색...",
          },
          menuItems: N,
          onLogout: () => {},
        }),
        sidebar: e.jsx(m, { isDesktop: !0, sections: S }),
        isDesktop: !0,
        mainClassName: "p-0",
        children: e.jsx(A, {}),
      }),
  };
t.parameters = {
  ...t.parameters,
  docs: {
    ...t.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "품목, 도면, BOM 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-0">
      <DashboardContent />
    </AppShell>
}`,
      ...t.parameters?.docs?.source,
    },
  },
};
const O = ["Default"];
export { t as Default, O as __namedExportsOrder, H as default };
