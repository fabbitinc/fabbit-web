import { j as e } from "./index-B4avf9CM.js";
import {
  e as o,
  L as i,
  F as n,
  G as c,
  P as p,
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
const D = {
    title: "Components/AppSidebar",
    component: o,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
  },
  t = [
    {
      id: "main",
      items: [
        {
          id: "dashboard",
          label: "대시보드",
          icon: i,
          active: !0,
          onClick: () => {},
        },
        { id: "projects", label: "프로젝트", icon: n, onClick: () => {} },
        { id: "changes", label: "변경 관리", icon: c, onClick: () => {} },
        { id: "parts", label: "부품 관리", icon: p, onClick: () => {} },
      ],
    },
  ],
  s = {
    render: () =>
      e.jsx("div", {
        className: "h-[520px]",
        children: e.jsx(o, { isDesktop: !0, sections: t }),
      }),
  },
  r = {
    render: () =>
      e.jsx("div", {
        className: "h-[520px]",
        children: e.jsx(o, { isDesktop: !0, collapsed: !0, sections: t }),
      }),
  },
  a = {
    render: () =>
      e.jsx("div", {
        className: "h-[520px]",
        children: e.jsx(o, {
          isDesktop: !0,
          sections: t,
          statusIndicator: { count: 3 },
        }),
      }),
  };
s.parameters = {
  ...s.parameters,
  docs: {
    ...s.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <div className="h-[520px]">
      <AppSidebar isDesktop sections={sections} />
    </div>
}`,
      ...s.parameters?.docs?.source,
    },
  },
};
r.parameters = {
  ...r.parameters,
  docs: {
    ...r.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <div className="h-[520px]">
      <AppSidebar isDesktop collapsed sections={sections} />
    </div>
}`,
      ...r.parameters?.docs?.source,
    },
  },
};
a.parameters = {
  ...a.parameters,
  docs: {
    ...a.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <div className="h-[520px]">
      <AppSidebar isDesktop sections={sections} statusIndicator={{
      count: 3
    }} />
    </div>
}`,
      ...a.parameters?.docs?.source,
    },
  },
};
const C = ["Default", "Collapsed", "WithStatus"];
export {
  r as Collapsed,
  s as Default,
  a as WithStatus,
  C as __namedExportsOrder,
  D as default,
};
