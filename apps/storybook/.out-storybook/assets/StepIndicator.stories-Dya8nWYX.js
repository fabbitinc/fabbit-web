import{at as o}from"./gltf-viewer-screen-BDJMhtPo.js";import"./index-DRJbD1WP.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const I={title:"Components/StepIndicator",component:o,tags:["autodocs"],parameters:{layout:"centered"}},n=[{id:"incoming",label:"수입 검사"},{id:"cutting",label:"절단"},{id:"cnc",label:"CNC 가공"},{id:"finishing",label:"후처리"},{id:"final-qc",label:"최종 검사"}],e={args:{steps:n,currentStepId:"cnc"}},r={args:{steps:n,currentStepId:"incoming"}},t={args:{steps:n,currentStepId:"final-qc"}},s={args:{steps:[{id:"request",label:"변경 요청",description:"ECR 접수"},{id:"review",label:"기술 검토",description:"영향도 분석"},{id:"approve",label:"승인",description:"CCB 결재"},{id:"execute",label:"실행",description:"BOM/도면 반영"},{id:"close",label:"완료",description:"ECN 발행"}],currentStepId:"approve"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    steps: processSteps,
    currentStepId: "cnc"
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    steps: processSteps,
    currentStepId: "incoming"
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    steps: processSteps,
    currentStepId: "final-qc"
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    steps: [{
      id: "request",
      label: "변경 요청",
      description: "ECR 접수"
    }, {
      id: "review",
      label: "기술 검토",
      description: "영향도 분석"
    }, {
      id: "approve",
      label: "승인",
      description: "CCB 결재"
    }, {
      id: "execute",
      label: "실행",
      description: "BOM/도면 반영"
    }, {
      id: "close",
      label: "완료",
      description: "ECN 발행"
    }],
    currentStepId: "approve"
  }
}`,...s.parameters?.docs?.source}}};const f=["Default","FirstStep","LastStep","WithDescription"];export{e as Default,r as FirstStep,t as LastStep,s as WithDescription,f as __namedExportsOrder,I as default};
