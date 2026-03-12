import{j as e}from"./index-DRJbD1WP.js";import{aC as i,H as t}from"./gltf-viewer-screen-BDJMhtPo.js";import{S as o}from"./sparkles-DR0EIcjG.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const w={title:"Components/UsageCard",component:i,tags:["autodocs"],parameters:{layout:"centered"}},r={render:()=>e.jsx("div",{className:"w-[300px]",children:e.jsx(i,{icon:t,label:"파일 저장 용량",used:8.2,limit:10,unit:"GB"})})},a={render:()=>e.jsx("div",{className:"w-[300px]",children:e.jsx(i,{icon:o,label:"AI 크레딧",used:320,limit:1e3,unit:"크레딧"})})},s={render:()=>e.jsx("div",{className:"w-[300px]",children:e.jsx(i,{icon:t,label:"파일 저장 용량",used:9.5,limit:10,unit:"GB"})})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[300px]">
      <UsageCard icon={HardDrive} label="파일 저장 용량" used={8.2} limit={10} unit="GB" />
    </div>
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[300px]">
      <UsageCard icon={Sparkles} label="AI 크레딧" used={320} limit={1000} unit="크레딧" />
    </div>
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[300px]">
      <UsageCard icon={HardDrive} label="파일 저장 용량" used={9.5} limit={10} unit="GB" />
    </div>
}`,...s.parameters?.docs?.source}}};const b=["Default","Low","Critical"];export{s as Critical,r as Default,a as Low,b as __namedExportsOrder,w as default};
