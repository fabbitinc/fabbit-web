import { j as t } from "./index-B4avf9CM.js";
import { r as d } from "./iframe-DjFiVPSj.js";
import { a1 as j } from "./production-result-detail-screen-kTjdDYfl.js";
import {
  E as g,
  F as S,
  G as f,
  J as x,
  a as y,
} from "./user-avatar-CJtlkw0_.js";
import "./index-CqusOY6v.js";
import "./preload-helper-PPVm8Dsz.js";
import "./circle-alert-7HBXfu_Z.js";
import "./chevrons-up-down-cjEB4Cse.js";
import "./settings-BbypiVPi.js";
import "./sparkles-BrCodocr.js";
import "./tag-BpztlO3h.js";
const h = [
  {
    description:
      "모터 제어기와 연계되는 전장/기구 부품을 묶어 관리하는 프로젝트입니다.",
    id: "project-1",
    isArchived: !1,
    name: "EV 모터 컨트롤러",
    partCount: 128,
    updatedAt: "2026-03-05T14:20:00.000Z",
  },
  {
    description: "배터리 하우징과 냉각 모듈 변경 흐름을 추적합니다.",
    id: "project-2",
    isArchived: !1,
    name: "배터리 팩 하우징",
    partCount: 76,
    updatedAt: "2026-03-04T09:10:00.000Z",
  },
  {
    description: null,
    id: "project-3",
    isArchived: !0,
    name: "레거시 인버터 플랫폼",
    partCount: 43,
    updatedAt: "2026-02-21T03:35:00.000Z",
  },
];
function D(a, n) {
  return [...a].sort((c, o) => {
    if (n.sortKey === "part-count")
      return n.sortDirection === "asc"
        ? c.partCount - o.partCount
        : o.partCount - c.partCount;
    const s = c.name.localeCompare(o.name, "ko");
    return n.sortDirection === "asc" ? s : -s;
  });
}
function m({ initialItems: a = h }) {
  const [n, c] = d.useState(!1),
    [o, s] = d.useState({
      page: 1,
      pageSize: 15,
      query: "",
      sortDirection: "asc",
      sortKey: "name",
    }),
    u = d.useMemo(() => {
      const e = o.query.trim().toLowerCase(),
        r = e ? a.filter((C) => C.name.toLowerCase().includes(e)) : a;
      return D(r, o);
    }, [a, o]),
    l = {
      createDialogContent: n
        ? t.jsxs(g, {
            className: "border-border/70",
            children: [
              t.jsx(S, { children: t.jsx(f, { children: "프로젝트 생성" }) }),
              t.jsxs(x, {
                className: "space-y-3",
                children: [
                  t.jsx("p", {
                    className: "text-sm text-muted-foreground",
                    children:
                      "생성 다이얼로그는 `web`에서 연결하고, screen은 위치만 제공합니다.",
                  }),
                  t.jsx(y, { variant: "secondary", children: "Dialog Slot" }),
                ],
              }),
            ],
          })
        : null,
      isError: !1,
      isLoading: !1,
      onCreateClick: () => c(!0),
      onPageChange: (e) => s((r) => ({ ...r, page: e })),
      onPageSizeChange: (e) => s((r) => ({ ...r, page: 1, pageSize: e })),
      onQueryChange: (e) => s((r) => ({ ...r, page: 1, query: e })),
      onRetry: () => {},
      onRowClick: () => {},
      onSortChange: (e) =>
        s((r) => ({
          ...r,
          sortDirection:
            r.sortKey === e && r.sortDirection === "asc" ? "desc" : "asc",
          sortKey: e,
        })),
      projects: u,
      queryState: o,
      totalCount: u.length,
    };
  return t.jsx(j, { ...l });
}
const O = {
    title: "Components/ProjectListScreen",
    component: m,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
  },
  i = { render: () => t.jsx(m, {}) },
  p = { render: () => t.jsx(m, { initialItems: [] }) };
i.parameters = {
  ...i.parameters,
  docs: {
    ...i.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <ProjectListScreenStory />
}`,
      ...i.parameters?.docs?.source,
    },
  },
};
p.parameters = {
  ...p.parameters,
  docs: {
    ...p.parameters?.docs,
    source: {
      originalSource: `{
  render: () => <ProjectListScreenStory initialItems={[]} />
}`,
      ...p.parameters?.docs?.source,
    },
  },
};
const Q = ["Default", "EmptyState"];
export {
  i as Default,
  p as EmptyState,
  Q as __namedExportsOrder,
  O as default,
};
