import{j as e}from"./index-DRJbD1WP.js";import{e as o,L as i,F as n,G as c,P as p}from"./gltf-viewer-screen-BDJMhtPo.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const C={title:"Components/AppSidebar",component:o,tags:["autodocs"],parameters:{layout:"fullscreen"}},t=[{id:"main",items:[{id:"dashboard",label:"대시보드",icon:i,active:!0,onClick:()=>{}},{id:"projects",label:"프로젝트",icon:n,onClick:()=>{}},{id:"changes",label:"변경 관리",icon:c,onClick:()=>{}},{id:"parts",label:"부품 관리",icon:p,onClick:()=>{}}]}],s={render:()=>e.jsx("div",{className:"h-[520px]",children:e.jsx(o,{isDesktop:!0,sections:t})})},r={render:()=>e.jsx("div",{className:"h-[520px]",children:e.jsx(o,{isDesktop:!0,collapsed:!0,sections:t})})},a={render:()=>e.jsx("div",{className:"h-[520px]",children:e.jsx(o,{isDesktop:!0,sections:t,statusIndicator:{count:3}})})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[520px]">
      <AppSidebar isDesktop sections={sections} />
    </div>
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[520px]">
      <AppSidebar isDesktop collapsed sections={sections} />
    </div>
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[520px]">
      <AppSidebar isDesktop sections={sections} statusIndicator={{
      count: 3
    }} />
    </div>
}`,...a.parameters?.docs?.source}}};const f=["Default","Collapsed","WithStatus"];export{r as Collapsed,s as Default,a as WithStatus,f as __namedExportsOrder,C as default};
