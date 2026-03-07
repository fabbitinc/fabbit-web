import{ae as a}from"./production-result-detail-screen-kTjdDYfl.js";import"./index-B4avf9CM.js";import"./iframe-DjFiVPSj.js";import"./user-avatar-CJtlkw0_.js";import"./circle-alert-7HBXfu_Z.js";import"./chevrons-up-down-cjEB4Cse.js";import"./settings-BbypiVPi.js";import"./sparkles-BrCodocr.js";import"./tag-BpztlO3h.js";import"./index-CqusOY6v.js";import"./preload-helper-PPVm8Dsz.js";const C={title:"Components/StepIndicator",component:a,tags:["autodocs"],parameters:{layout:"centered"}},n=[{id:"incoming",label:"수입 검사"},{id:"cutting",label:"절단"},{id:"cnc",label:"CNC 가공"},{id:"finishing",label:"후처리"},{id:"final-qc",label:"최종 검사"}],e={args:{steps:n,currentStepId:"cnc"}},r={args:{steps:n,currentStepId:"incoming"}},t={args:{steps:n,currentStepId:"final-qc"}},s={args:{steps:[{id:"request",label:"변경 요청",description:"ECR 접수"},{id:"review",label:"기술 검토",description:"영향도 분석"},{id:"approve",label:"승인",description:"CCB 결재"},{id:"execute",label:"실행",description:"BOM/도면 반영"},{id:"close",label:"완료",description:"ECN 발행"}],currentStepId:"approve"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};const I=["Default","FirstStep","LastStep","WithDescription"];export{e as Default,r as FirstStep,t as LastStep,s as WithDescription,I as __namedExportsOrder,C as default};
