import{af as a}from"./change-request-detail-screen-BXoKcBb5.js";import"./index-QYnQWpJ5.js";import"./iframe-uSZs8WMR.js";import"./preload-helper-PPVm8Dsz.js";import"./index-D-xEXGrX.js";import"./user-avatar-DJpZquVq.js";import"./circle-alert-e60hHxQt.js";import"./chevrons-up-down-DeU1l3Vt.js";import"./sparkles-CZ0Co1E_.js";import"./settings-B-L1BAJU.js";import"./tag-YK-1BDS0.js";const C={title:"Components/StepIndicator",component:a,tags:["autodocs"],parameters:{layout:"centered"}},n=[{id:"incoming",label:"수입 검사"},{id:"cutting",label:"절단"},{id:"cnc",label:"CNC 가공"},{id:"finishing",label:"후처리"},{id:"final-qc",label:"최종 검사"}],e={args:{steps:n,currentStepId:"cnc"}},r={args:{steps:n,currentStepId:"incoming"}},t={args:{steps:n,currentStepId:"final-qc"}},s={args:{steps:[{id:"request",label:"변경 요청",description:"ECR 접수"},{id:"review",label:"기술 검토",description:"영향도 분석"},{id:"approve",label:"승인",description:"CCB 결재"},{id:"execute",label:"실행",description:"BOM/도면 반영"},{id:"close",label:"완료",description:"ECN 발행"}],currentStepId:"approve"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
