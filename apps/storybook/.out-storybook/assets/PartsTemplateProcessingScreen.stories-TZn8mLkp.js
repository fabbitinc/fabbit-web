import{_ as n}from"./change-request-detail-screen-BB3V5S0M.js";import"./index-BC33NHKD.js";import"./iframe-BDY6rKdT.js";import"./preload-helper-PPVm8Dsz.js";import"./index-C3SxMwu4.js";import"./user-avatar-Cz1MQ_Sd.js";import"./circle-alert-Df3U-mR7.js";import"./chevrons-up-down-BJxNzKgS.js";import"./sparkles-CdpkT6Re.js";import"./settings-CQ3R25cq.js";import"./tag-gRIXPjqS.js";const t=[{key:"parsing",label:"파일 구조 파싱",status:"completed"},{key:"normalizing",label:"헤더/컬럼 정규화",status:"completed"},{key:"analyzing",label:"속성 후보 분석",status:"in_progress"},{key:"finalizing",label:"템플릿 버전 생성",status:"pending"}],o=[{key:"parsing",label:"파일 구조 파싱",status:"completed"},{key:"normalizing",label:"헤더/컬럼 정규화",status:"completed"},{key:"analyzing",label:"속성 후보 분석",status:"completed"},{key:"finalizing",label:"템플릿 버전 생성",status:"completed"}],f={title:"Components/PartsTemplateProcessingScreen",component:n,tags:["autodocs"],parameters:{layout:"fullscreen"},args:{canProceed:!1,canRetry:!0,error:null,fileName:"모터_서브어셈블리_템플릿.xlsx",hasUpload:!0,logs:["분석 대상 파일 확인: 모터_서브어셈블리_템플릿.xlsx","파일 구조와 시트를 파싱하고 있습니다...","컬럼명 표준화를 진행합니다...","속성 후보와 데이터 타입을 추론합니다..."],progress:68,steps:t,onProceed:()=>{},onRetry:()=>{}}},e={},s={args:{canProceed:!0,logs:["분석 대상 파일 확인: 모터_서브어셈블리_템플릿.xlsx","파일 구조와 시트를 파싱하고 있습니다...","원본 컬럼 헤더 추출 완료","속성 분석이 완료되었습니다. 매핑 검토 단계로 이동할 수 있습니다."],progress:100,steps:o}},a={args:{error:"속성 분석 처리 중 오류가 발생했습니다. 파일 형식을 다시 확인해주세요."}},r={args:{canRetry:!1,hasUpload:!1,logs:["업로드 정보가 없어 분석을 시작하지 못했습니다."],progress:0,steps:[{key:"parsing",label:"파일 구조 파싱",status:"pending"},{key:"normalizing",label:"헤더/컬럼 정규화",status:"pending"},{key:"analyzing",label:"속성 후보 분석",status:"pending"},{key:"finalizing",label:"템플릿 버전 생성",status:"pending"}]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    canProceed: true,
    logs: ["분석 대상 파일 확인: 모터_서브어셈블리_템플릿.xlsx", "파일 구조와 시트를 파싱하고 있습니다...", "원본 컬럼 헤더 추출 완료", "속성 분석이 완료되었습니다. 매핑 검토 단계로 이동할 수 있습니다."],
    progress: 100,
    steps: completedSteps
  }
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    error: "속성 분석 처리 중 오류가 발생했습니다. 파일 형식을 다시 확인해주세요."
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    canRetry: false,
    hasUpload: false,
    logs: ["업로드 정보가 없어 분석을 시작하지 못했습니다."],
    progress: 0,
    steps: [{
      key: "parsing",
      label: "파일 구조 파싱",
      status: "pending"
    }, {
      key: "normalizing",
      label: "헤더/컬럼 정규화",
      status: "pending"
    }, {
      key: "analyzing",
      label: "속성 후보 분석",
      status: "pending"
    }, {
      key: "finalizing",
      label: "템플릿 버전 생성",
      status: "pending"
    }]
  }
}`,...r.parameters?.docs?.source}}};const z=["Default","Completed","ErrorState","MissingUpload"];export{s as Completed,e as Default,a as ErrorState,r as MissingUpload,z as __namedExportsOrder,f as default};
