import{j as r}from"./index-DRJbD1WP.js";import{r as s}from"./iframe-1IsFew62.js";import{Y as F}from"./gltf-viewer-screen-BDJMhtPo.js";import"./index-DlmQN4rJ.js";import"./preload-helper-PPVm8Dsz.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const x=[{value:"mechanical",label:"기구"},{value:"electrical",label:"전장"},{value:"purchase",label:"구매품"},{value:"assy",label:"조립품"}],y=[{value:"draft",label:"초안"},{value:"development",label:"개발"},{value:"mass-production",label:"양산"},{value:"hold",label:"보류"}],D=[{value:"ea",label:"EA"},{value:"set",label:"SET"},{value:"assy",label:"ASSY"},{value:"m",label:"M"}],f=[{value:"me-team",label:"기구설계팀"},{value:"ee-team",label:"전장설계팀"},{value:"quality-team",label:"품질기획팀"},{value:"sourcing-team",label:"구매운영팀"}],h={category:"mechanical",description:"",isPhantom:!1,leadTimeDays:"14",lifecycleState:"draft",material:"AL6061-T6",name:"드라이브 유닛 베이스 플레이트",ownerTeamId:"me-team",partNumber:"DRV-BASE-0142",revision:"A",unit:"ea"},n={category:"assy",description:"모터 하우징과 센서 브래킷의 체결 기준이 되는 상위 조립품입니다. 양산 치공구 기준 홀 간격이 변경되어 리비전 업데이트가 필요합니다.",isPhantom:!0,leadTimeDays:"3",lifecycleState:"mass-production",material:"복합 조립품",name:"드라이브 모듈 메인 어셈블리",ownerTeamId:"quality-team",partNumber:"DRV-ASSY-0104",revision:"D",unit:"assy"},w=[{id:"surface",label:"표면 처리",placeholder:"예: 샌드블라스트 + 아노다이징",value:""},{id:"spec",label:"규격 키",helperText:"공급사 검색과 템플릿 매핑에서 재사용됩니다.",placeholder:"예: BASE-AL-6T",value:"BASE-AL-6T"}],o=[{id:"surface",label:"표면 처리",placeholder:"표면 처리 정보를 입력하세요",value:"흑색 아노다이징"},{id:"tolerance",label:"주요 공차",helperText:"가공 기준과 검사 항목을 묶는 키입니다.",placeholder:"예: +/-0.05",value:"+/-0.05"},{id:"tooling",label:"치공구 번호",placeholder:"예: JIG-DRV-22",value:"JIG-DRV-22"},{id:"erp",label:"ERP 코드",placeholder:"예: ERP-700184",value:"ERP-700184"}],V={drawingNumber:"DWG-DRV-0104-D",fileName:"drv-assy-main-revD.pdf",note:"도면 PDF와 3D 뷰어가 모두 최신 리비전으로 변환 완료된 상태입니다.",revision:"D",statusLabel:"검토 준비 완료",statusTone:"success",updatedAtLabel:"2026년 3월 7일 14:20 업데이트"},P={drawingNumber:"DWG-DRV-0104-E",fileName:"drv-assy-main-revE.pdf",note:"센서 브래킷 간섭 수정본이 반영됐지만, 공급사 공유 전에 최종 릴리즈 승인 확인이 필요합니다.",revision:"E",statusLabel:"승인 대기",statusTone:"warning",updatedAtLabel:"2026년 3월 9일 09:30 업데이트"},R={attachments:0,childParts:0,linkedProjects:0,linkedSuppliers:0},d={attachments:8,childParts:12,linkedProjects:4,linkedSuppliers:2};function l({initialDrawing:e=null,initialExtendedFields:c,initialFormValues:m,initialStats:u,lastSavedLabel:p,mode:v}){const[S,E]=s.useState(m),[b,g]=s.useState(c);return r.jsx(F,{categoryOptions:x,drawing:e,extendedFields:b,formValues:S,lastSavedLabel:p,lifecycleOptions:y,mode:v,ownerTeamOptions:f,referenceStats:u,unitOptions:D,onBack:()=>{},onChange:E,onExtendedFieldsChange:g,onSaveDraft:()=>{},onSubmit:()=>{}})}const q={title:"Components/PartEditorScreen",component:l,tags:["autodocs"],parameters:{layout:"fullscreen"}},a={args:{initialExtendedFields:w,initialFormValues:h,initialStats:R,mode:"create"},render:e=>r.jsx(l,{...e})},t={args:{initialDrawing:V,initialExtendedFields:o,initialFormValues:n,initialStats:d,lastSavedLabel:"마지막 저장 12분 전",mode:"edit"},render:e=>r.jsx(l,{...e})},i={args:{initialDrawing:P,initialExtendedFields:o,initialFormValues:{...n,lifecycleState:"development",revision:"E"},initialStats:d,lastSavedLabel:"변경 초안 저장됨",mode:"edit"},render:e=>r.jsx(l,{...e})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    initialExtendedFields: createExtendedFields,
    initialFormValues: createFormValues,
    initialStats: createStats,
    mode: "create"
  },
  render: args => <PartEditorScreenStory {...args} />
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    initialDrawing: editDrawing,
    initialExtendedFields: editExtendedFields,
    initialFormValues: editFormValues,
    initialStats: editStats,
    lastSavedLabel: "마지막 저장 12분 전",
    mode: "edit"
  },
  render: args => <PartEditorScreenStory {...args} />
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    initialDrawing: reviewDrawing,
    initialExtendedFields: editExtendedFields,
    initialFormValues: {
      ...editFormValues,
      lifecycleState: "development",
      revision: "E"
    },
    initialStats: editStats,
    lastSavedLabel: "변경 초안 저장됨",
    mode: "edit"
  },
  render: args => <PartEditorScreenStory {...args} />
}`,...i.parameters?.docs?.source}}};const J=["Create","Edit","ReviewReady"];export{a as Create,t as Edit,i as ReviewReady,J as __namedExportsOrder,q as default};
