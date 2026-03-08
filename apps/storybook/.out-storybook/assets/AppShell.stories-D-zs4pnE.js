import { j as e } from "./index-B4avf9CM.js";
import {
  d as n,
  e as t,
  L as p,
  F as u,
  G as g,
  P as x,
  c as l,
  U as c,
  B as d,
  S as h,
  K as a,
} from "./production-result-detail-screen-kTjdDYfl.js";
import "./iframe-DjFiVPSj.js";
import "./user-avatar-CJtlkw0_.js";
import "./index-CqusOY6v.js";
import "./circle-alert-7HBXfu_Z.js";
import "./chevrons-up-down-cjEB4Cse.js";
import "./settings-BbypiVPi.js";
import "./sparkles-BrCodocr.js";
import "./tag-BpztlO3h.js";
import "./preload-helper-PPVm8Dsz.js";
const N = {
    title: "Components/AppShell",
    component: n,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
  },
  m = [
    {
      id: "main",
      items: [
        {
          id: "dashboard",
          label: "대시보드",
          icon: p,
          active: !0,
          onClick: () => {},
        },
        { id: "projects", label: "프로젝트", icon: u, onClick: () => {} },
        { id: "changes", label: "변경 관리", icon: g, onClick: () => {} },
        { id: "parts", label: "부품 관리", icon: x, onClick: () => {} },
      ],
    },
  ];
function b({ collapsed: i = !1 }) {
  return e.jsx(n, {
    header: e.jsx(l, {
      onToggleSidebar: () => {},
      primaryAction: { label: "생성" },
      organizationMenu: {
        current: {
          id: "org-1",
          slug: "fabbit",
          name: "Fabbit",
          roleLabel: "소유자",
        },
        items: [
          { id: "org-1", slug: "fabbit", name: "Fabbit", roleLabel: "소유자" },
          {
            id: "org-2",
            slug: "factory-lab",
            name: "Factory Lab",
            roleLabel: "관리자",
          },
        ],
        onSelect: () => {},
      },
      user: { name: "문성하", email: "seongha@fabbit.io" },
      menuItems: [
        { id: "profile", label: "개인 설정", icon: c, onClick: () => {} },
        { id: "organization", label: "조직 설정", icon: d, onClick: () => {} },
      ],
      onLogout: () => {},
    }),
    sidebar: e.jsx(t, {
      isDesktop: !0,
      collapsed: i,
      sections: m,
      statusIndicator: { count: 2 },
    }),
    isDesktop: !0,
    isSidebarCollapsed: i,
    children: e.jsxs("div", {
      children: [
        e.jsx("h1", {
          className: "mb-6 text-2xl font-semibold",
          children: "대시보드",
        }),
        e.jsxs(h, {
          children: [
            e.jsx(a, {
              label: "가동률",
              value: "94.2%",
              change: "+2.1%",
              changePositive: !0,
            }),
            e.jsx(a, {
              label: "불량률",
              value: "0.6%",
              change: "-0.2%",
              changePositive: !0,
            }),
            e.jsx(a, {
              label: "일일 생산량",
              value: "1,248개",
              change: "+48",
              changePositive: !0,
            }),
            e.jsx(a, {
              label: "설비 가용률",
              value: "87.5%",
              change: "-1.3%",
              changePositive: !1,
            }),
          ],
        }),
      ],
    }),
  });
}
const r = { render: () => e.jsx(b, {}) },
  s = { render: () => e.jsx(b, { collapsed: !0 }) },
  o = {
    render: () =>
      e.jsx(n, {
        header: e.jsx(l, {
          onToggleSidebar: () => {},
          primaryAction: { label: "생성" },
          user: { name: "문성하", email: "seongha@fabbit.io" },
          menuItems: [
            { id: "profile", label: "개인 설정", icon: c, onClick: () => {} },
            {
              id: "organization",
              label: "조직 설정",
              icon: d,
              onClick: () => {},
            },
          ],
          onLogout: () => {},
        }),
        sidebar: e.jsx(t, { isDesktop: !0, sections: m }),
        banner: e.jsx("div", {
          className:
            "flex items-center justify-between border-b border-blue-200 bg-blue-50 px-4",
          children: e.jsx("p", {
            className: "truncate text-sm text-blue-900",
            children:
              "임시 배너입니다. 공지/안내 용도로 사용하고 나중에 삭제할 수 있습니다.",
          }),
        }),
        isDesktop: !0,
        children: e.jsx("div", {
          className: "text-sm text-muted-foreground",
          children: "배너가 포함된 앱 셸입니다.",
        }),
      }),
  };
r.parameters = {
  ...r.parameters,
  docs: {
    ...r.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <ShellFrame />
}`,
      ...r.parameters?.docs?.source,
    },
  },
};
s.parameters = {
  ...s.parameters,
  docs: {
    ...s.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <ShellFrame collapsed />
}`,
      ...s.parameters?.docs?.source,
    },
  },
};
o.parameters = {
  ...o.parameters,
  docs: {
    ...o.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <AppShell header={<AppHeader onToggleSidebar={() => {}} primaryAction={{
    label: "생성"
  }} user={{
    name: "문성하",
    email: "seongha@fabbit.io"
  }} menuItems={[{
    id: "profile",
    label: "개인 설정",
    icon: User,
    onClick: () => {}
  }, {
    id: "organization",
    label: "조직 설정",
    icon: Building2,
    onClick: () => {}
  }]} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={sections} />} banner={<div className="flex items-center justify-between border-b border-blue-200 bg-blue-50 px-4">
          <p className="truncate text-sm text-blue-900">
            임시 배너입니다. 공지/안내 용도로 사용하고 나중에 삭제할 수 있습니다.
          </p>
        </div>} isDesktop>
      <div className="text-sm text-muted-foreground">배너가 포함된 앱 셸입니다.</div>
    </AppShell>
}`,
      ...o.parameters?.docs?.source,
    },
  },
};
const P = ["Default", "CollapsedSidebar", "WithBanner"];
export {
  s as CollapsedSidebar,
  r as Default,
  o as WithBanner,
  P as __namedExportsOrder,
  N as default,
};
