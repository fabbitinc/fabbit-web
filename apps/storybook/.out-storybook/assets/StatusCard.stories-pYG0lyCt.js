import{j as s}from"./index-DRJbD1WP.js";import{as as n}from"./gltf-viewer-screen-BDJMhtPo.js";import{aq as c}from"./user-avatar-DUF4fm1-.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const S={title:"Components/StatusCard",component:n,tags:["autodocs"],args:{name:"CNC-001",status:"가동",statusVariant:"success",progress:78},parameters:{layout:"centered"}},a={args:{className:"w-[240px]"}},e={args:{name:"PRESS-003",status:"정비중",statusVariant:"warning",progress:0,className:"w-[240px]"}},r={args:{name:"LATHE-002",status:"고장",statusVariant:"danger",progress:45,className:"w-[240px]"}},t={args:{name:"CNC-005",status:"가동",statusVariant:"success",progress:92,className:"w-[260px]"},render:o=>s.jsxs(n,{...o,children:[s.jsx(c,{className:"my-2"}),s.jsxs("div",{className:"space-y-1 text-xs text-muted-foreground",children:[s.jsxs("div",{className:"flex justify-between",children:[s.jsx("span",{children:"현재 작업"}),s.jsx("span",{className:"text-foreground",children:"WO-2401"})]}),s.jsxs("div",{className:"flex justify-between",children:[s.jsx("span",{children:"라인"}),s.jsx("span",{className:"text-foreground",children:"A동 1라인"})]})]})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    className: "w-[240px]"
  }
}`,...a.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    name: "PRESS-003",
    status: "정비중",
    statusVariant: "warning",
    progress: 0,
    className: "w-[240px]"
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    name: "LATHE-002",
    status: "고장",
    statusVariant: "danger",
    progress: 45,
    className: "w-[240px]"
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    name: "CNC-005",
    status: "가동",
    statusVariant: "success",
    progress: 92,
    className: "w-[260px]"
  },
  render: args => <StatusCard {...args}>
      <Separator className="my-2" />
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>현재 작업</span>
          <span className="text-foreground">WO-2401</span>
        </div>
        <div className="flex justify-between">
          <span>라인</span>
          <span className="text-foreground">A동 1라인</span>
        </div>
      </div>
    </StatusCard>
}`,...t.parameters?.docs?.source}}};const C=["Default","Maintenance","Broken","WithChildren"];export{r as Broken,a as Default,e as Maintenance,t as WithChildren,C as __namedExportsOrder,S as default};
