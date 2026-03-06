import{j as e}from"./index-BC33NHKD.js";import{f as s,F as d,G as l,P as p,L as m,g as u,W as x}from"./change-request-detail-screen-BB3V5S0M.js";import{L as c}from"./layout-dashboard-aoGwXBT-.js";import{c as b}from"./user-avatar-Cz1MQ_Sd.js";import{S as h}from"./settings-CQ3R25cq.js";import"./iframe-BDY6rKdT.js";import"./preload-helper-PPVm8Dsz.js";import"./index-C3SxMwu4.js";import"./circle-alert-Df3U-mR7.js";import"./chevrons-up-down-BJxNzKgS.js";import"./sparkles-CdpkT6Re.js";import"./tag-gRIXPjqS.js";const g=[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"m9 14 2 2 4-4",key:"df797q"}]],n=b("clipboard-check",g),_={title:"Components/AppSidebar",component:s,tags:["autodocs"],parameters:{layout:"fullscreen"}},t=[{id:"main",items:[{id:"dashboard",label:"대시보드",icon:c,active:!0,onClick:()=>{}},{id:"projects",label:"프로젝트",icon:d,onClick:()=>{}},{id:"changes",label:"변경 관리",icon:l,onClick:()=>{}},{id:"parts",label:"부품관리",icon:p,onClick:()=>{}}]}],f=[{id:"production",label:"생산",items:[{id:"dashboard",label:"대시보드",icon:c,active:!0,onClick:()=>{}},{id:"work-orders",label:"작업지시",icon:n,onClick:()=>{}},{id:"monitoring",label:"실시간 모니터링",icon:u,onClick:()=>{}}]},{id:"quality",label:"품질",items:[{id:"inspection",label:"검사 관리",icon:n,onClick:()=>{}},{id:"equipment",label:"설비 관리",icon:x,onClick:()=>{}}]},{id:"system",label:"시스템",items:[{id:"settings",label:"설정",icon:h,onClick:()=>{}}]}],a={render:()=>e.jsx("div",{className:"h-[500px]",children:e.jsx(s,{sections:t})})},r={render:()=>e.jsx("div",{className:"h-[500px]",children:e.jsx(s,{sections:t,collapsed:!0})})},i={render:()=>e.jsx("div",{className:"h-[600px]",children:e.jsx(s,{sections:f})})},o={render:()=>e.jsx("div",{className:"h-[500px]",children:e.jsx(s,{sections:t,footer:e.jsxs("div",{className:"flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2",children:[e.jsx(m,{className:"size-4 animate-spin text-sidebar-foreground/70"}),e.jsx("span",{className:"text-xs font-medium text-sidebar-foreground/70",children:"3개 파일 처리 중"})]})})})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[500px]">
      <AppSidebar sections={mainSections} />
    </div>
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[500px]">
      <AppSidebar sections={mainSections} collapsed />
    </div>
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[600px]">
      <AppSidebar sections={mesSections} />
    </div>
}`,...i.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[500px]">
      <AppSidebar sections={mainSections} footer={<div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2">
            <Loader2 className="size-4 animate-spin text-sidebar-foreground/70" />
            <span className="text-xs font-medium text-sidebar-foreground/70">
              3개 파일 처리 중
            </span>
          </div>} />
    </div>
}`,...o.parameters?.docs?.source}}};const w=["Default","Collapsed","WithSections","WithFooter"];export{r as Collapsed,a as Default,o as WithFooter,i as WithSections,w as __namedExportsOrder,_ as default};
