import{j as e}from"./index-B4avf9CM.js";import{S as t,K as a}from"./production-result-detail-screen-kTjdDYfl.js";import"./iframe-DjFiVPSj.js";import"./user-avatar-CJtlkw0_.js";import"./index-CqusOY6v.js";import"./circle-alert-7HBXfu_Z.js";import"./chevrons-up-down-cjEB4Cse.js";import"./settings-BbypiVPi.js";import"./sparkles-BrCodocr.js";import"./tag-BpztlO3h.js";import"./preload-helper-PPVm8Dsz.js";const b={title:"Components/StatGroup",component:t,tags:["autodocs"],parameters:{layout:"padded"}},r={render:()=>e.jsxs(t,{children:[e.jsx(a,{label:"가동률",value:"94.2%",change:"+2.1%",changePositive:!0}),e.jsx(a,{label:"불량률",value:"0.6%",change:"-0.2%",changePositive:!0}),e.jsx(a,{label:"일일 생산량",value:"1,248개",change:"+48",changePositive:!0}),e.jsx(a,{label:"설비 가용률",value:"87.5%",change:"-1.3%",changePositive:!1})]})},s={render:()=>e.jsxs(t,{columns:3,children:[e.jsx(a,{label:"진행중 작업지시",value:"12건"}),e.jsx(a,{label:"금일 완료",value:"8건",change:"+3",changePositive:!0}),e.jsx(a,{label:"지연 건수",value:"2건",change:"+1",changePositive:!1})]})},o={render:()=>e.jsxs(t,{columns:2,children:[e.jsx(a,{label:"수입 검사 합격률",value:"98.4%",change:"+0.5%",changePositive:!0}),e.jsx(a,{label:"출하 검사 합격률",value:"99.1%",change:"+0.2%",changePositive:!0})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <StatGroup>
      <KpiCard label="가동률" value="94.2%" change="+2.1%" changePositive />
      <KpiCard label="불량률" value="0.6%" change="-0.2%" changePositive />
      <KpiCard label="일일 생산량" value="1,248개" change="+48" changePositive />
      <KpiCard label="설비 가용률" value="87.5%" change="-1.3%" changePositive={false} />
    </StatGroup>
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <StatGroup columns={3}>
      <KpiCard label="진행중 작업지시" value="12건" />
      <KpiCard label="금일 완료" value="8건" change="+3" changePositive />
      <KpiCard label="지연 건수" value="2건" change="+1" changePositive={false} />
    </StatGroup>
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <StatGroup columns={2}>
      <KpiCard label="수입 검사 합격률" value="98.4%" change="+0.5%" changePositive />
      <KpiCard label="출하 검사 합격률" value="99.1%" change="+0.2%" changePositive />
    </StatGroup>
}`,...o.parameters?.docs?.source}}};const x=["Default","ThreeColumns","TwoColumns"];export{r as Default,s as ThreeColumns,o as TwoColumns,x as __namedExportsOrder,b as default};
