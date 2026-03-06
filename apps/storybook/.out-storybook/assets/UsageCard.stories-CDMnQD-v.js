import{j as e}from"./index-BC33NHKD.js";import{am as i,an as t}from"./change-request-detail-screen-BB3V5S0M.js";import{S as o}from"./sparkles-CdpkT6Re.js";import"./iframe-BDY6rKdT.js";import"./preload-helper-PPVm8Dsz.js";import"./index-C3SxMwu4.js";import"./user-avatar-Cz1MQ_Sd.js";import"./circle-alert-Df3U-mR7.js";import"./chevrons-up-down-BJxNzKgS.js";import"./settings-CQ3R25cq.js";import"./tag-gRIXPjqS.js";const w={title:"Components/UsageCard",component:i,tags:["autodocs"],parameters:{layout:"centered"}},r={render:()=>e.jsx("div",{className:"w-[300px]",children:e.jsx(i,{icon:t,label:"파일 저장 용량",used:8.2,limit:10,unit:"GB"})})},a={render:()=>e.jsx("div",{className:"w-[300px]",children:e.jsx(i,{icon:o,label:"AI 크레딧",used:320,limit:1e3,unit:"크레딧"})})},s={render:()=>e.jsx("div",{className:"w-[300px]",children:e.jsx(i,{icon:t,label:"파일 저장 용량",used:9.5,limit:10,unit:"GB"})})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};const C=["Default","Low","Critical"];export{s as Critical,r as Default,a as Low,C as __namedExportsOrder,w as default};
