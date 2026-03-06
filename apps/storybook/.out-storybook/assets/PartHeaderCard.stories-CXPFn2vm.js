import{j as n}from"./index-QYnQWpJ5.js";import{Q as s}from"./change-request-detail-screen-BXoKcBb5.js";import"./iframe-uSZs8WMR.js";import"./preload-helper-PPVm8Dsz.js";import"./index-D-xEXGrX.js";import"./user-avatar-DJpZquVq.js";import"./circle-alert-e60hHxQt.js";import"./chevrons-up-down-DeU1l3Vt.js";import"./sparkles-CZ0Co1E_.js";import"./settings-B-L1BAJU.js";import"./tag-YK-1BDS0.js";const t={partNumber:"DRV-PLATE-0142",name:"드라이브 유닛 베이스 플레이트",revision:"C",material:"AL6061-T6",unit:"EA",category:"기구",lifecycleState:"양산",childrenCount:14,parentsCount:3,suppliersCount:2,filesCount:8,projectsCount:4},y={title:"Components/PartHeaderCard",component:s,tags:["autodocs"],parameters:{layout:"padded"}},e={args:{part:t}},r={args:{part:{...t,category:null,lifecycleState:null,material:null,name:null,unit:null}}},a={render:()=>n.jsxs("div",{className:"space-y-6",children:[n.jsx(s,{part:t}),n.jsx(s,{part:{...t,category:"전장",lifecycleState:"중단",name:"모터 제어 PCB",partNumber:"CTRL-PCB-0207",revision:"F"}})]})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    part: samplePart
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    part: {
      ...samplePart,
      category: null,
      lifecycleState: null,
      material: null,
      name: null,
      unit: null
    }
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6">
      <PartHeaderCard part={samplePart} />
      <PartHeaderCard part={{
      ...samplePart,
      category: "전장",
      lifecycleState: "중단",
      name: "모터 제어 PCB",
      partNumber: "CTRL-PCB-0207",
      revision: "F"
    }} />
    </div>
}`,...a.parameters?.docs?.source}}};const f=["Default","WithoutOptionalFields","Showcase"];export{e as Default,a as Showcase,r as WithoutOptionalFields,f as __namedExportsOrder,y as default};
