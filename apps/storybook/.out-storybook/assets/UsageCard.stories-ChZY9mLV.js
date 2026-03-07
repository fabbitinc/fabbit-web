import{j as e}from"./index-B4avf9CM.js";import{an as i,H as t}from"./production-result-detail-screen-kTjdDYfl.js";import"./iframe-DjFiVPSj.js";import"./user-avatar-CJtlkw0_.js";import{S as o}from"./sparkles-BrCodocr.js";import"./index-CqusOY6v.js";import"./circle-alert-7HBXfu_Z.js";import"./chevrons-up-down-cjEB4Cse.js";import"./settings-BbypiVPi.js";import"./tag-BpztlO3h.js";import"./preload-helper-PPVm8Dsz.js";const w={title:"Components/UsageCard",component:i,tags:["autodocs"],parameters:{layout:"centered"}},r={render:()=>e.jsx("div",{className:"w-[300px]",children:e.jsx(i,{icon:t,label:"파일 저장 용량",used:8.2,limit:10,unit:"GB"})})},a={render:()=>e.jsx("div",{className:"w-[300px]",children:e.jsx(i,{icon:o,label:"AI 크레딧",used:320,limit:1e3,unit:"크레딧"})})},s={render:()=>e.jsx("div",{className:"w-[300px]",children:e.jsx(i,{icon:t,label:"파일 저장 용량",used:9.5,limit:10,unit:"GB"})})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
