import{j as n}from"./index-DRJbD1WP.js";import{Z as s}from"./gltf-viewer-screen-BDJMhtPo.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const t={partNumber:"DRV-PLATE-0142",name:"드라이브 유닛 베이스 플레이트",revision:"C",material:"AL6061-T6",unit:"EA",category:"기구",lifecycleState:"양산",childrenCount:14,parentsCount:3,suppliersCount:2,filesCount:8,projectsCount:4},f={title:"Components/PartHeaderCard",component:s,tags:["autodocs"],parameters:{layout:"padded"}},e={args:{part:t}},r={args:{part:{...t,category:null,lifecycleState:null,material:null,name:null,unit:null}}},a={render:()=>n.jsxs("div",{className:"space-y-6",children:[n.jsx(s,{part:t}),n.jsx(s,{part:{...t,category:"전장",lifecycleState:"중단",name:"모터 제어 PCB",partNumber:"CTRL-PCB-0207",revision:"F"}})]})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};const S=["Default","WithoutOptionalFields","Showcase"];export{e as Default,a as Showcase,r as WithoutOptionalFields,S as __namedExportsOrder,f as default};
