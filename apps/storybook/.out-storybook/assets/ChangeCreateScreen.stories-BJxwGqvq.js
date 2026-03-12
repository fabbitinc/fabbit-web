import{h as t}from"./gltf-viewer-screen-BDJMhtPo.js";import"./index-DRJbD1WP.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const a=[{id:"user-1",name:"김태현",email:"taehyun.kim@fabbit.io",profileImageUrl:null},{id:"user-2",name:"이수진",email:"soojin.lee@fabbit.io",profileImageUrl:null},{id:"user-3",name:"박준서",email:"junseo.park@fabbit.io",profileImageUrl:null}],s=[{id:"label-1",name:"긴급",colorHex:"#ef4444"},{id:"label-2",name:"설계검토",colorHex:"#3b82f6"},{id:"label-3",name:"양산대응",colorHex:"#10b981"}],r=[{id:"part-1",partNumber:"MC-2048-A",name:"모터 컨트롤러 하우징"},{id:"part-2",partNumber:"BT-1024-C",name:"배터리 팩 브래킷"},{id:"part-3",partNumber:"CN-7781-B",name:"커넥터 핀 어셈블리"}],C={title:"Components/ChangeCreateScreen",component:t,tags:["autodocs"],parameters:{layout:"fullscreen"}},e={args:{backLabel:"이슈 목록",description:"문제, 검토 대상, 후속 작업을 이슈로 등록합니다.",heading:"새 이슈",titlePlaceholder:"이슈 제목을 입력하세요",editorPlaceholder:"이슈 설명을 입력하세요",submitLabel:"이슈 생성",assigneeOptions:a,labelOptions:s,partOptions:r,onBack:()=>{},onRequestAssignees:()=>{},onRequestLabels:()=>{},onRequestParts:()=>{},onPartSearchChange:()=>{},onSubmit:async()=>{}}},n={args:{backLabel:"변경 요청 목록",description:"설계 변경 내용을 등록하고 검토자를 지정합니다.",heading:"새 변경 요청",titlePlaceholder:"변경 요청 제목을 입력하세요",editorPlaceholder:"변경 요청 설명을 입력하세요",submitLabel:"변경 요청 생성",includeReviewers:!0,linkedIssueNumber:42,linkedIssueTitle:"센서 브래킷 간섭 확인",assigneeOptions:a,reviewerOptions:a,labelOptions:s,partOptions:r,onBack:()=>{},onRequestAssignees:()=>{},onRequestReviewers:()=>{},onRequestLabels:()=>{},onRequestParts:()=>{},onPartSearchChange:()=>{},onSubmit:async()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    backLabel: "이슈 목록",
    description: "문제, 검토 대상, 후속 작업을 이슈로 등록합니다.",
    heading: "새 이슈",
    titlePlaceholder: "이슈 제목을 입력하세요",
    editorPlaceholder: "이슈 설명을 입력하세요",
    submitLabel: "이슈 생성",
    assigneeOptions: members,
    labelOptions: labels,
    partOptions: parts,
    onBack: () => {},
    onRequestAssignees: () => {},
    onRequestLabels: () => {},
    onRequestParts: () => {},
    onPartSearchChange: () => {},
    onSubmit: async () => {}
  }
}`,...e.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    backLabel: "변경 요청 목록",
    description: "설계 변경 내용을 등록하고 검토자를 지정합니다.",
    heading: "새 변경 요청",
    titlePlaceholder: "변경 요청 제목을 입력하세요",
    editorPlaceholder: "변경 요청 설명을 입력하세요",
    submitLabel: "변경 요청 생성",
    includeReviewers: true,
    linkedIssueNumber: 42,
    linkedIssueTitle: "센서 브래킷 간섭 확인",
    assigneeOptions: members,
    reviewerOptions: members,
    labelOptions: labels,
    partOptions: parts,
    onBack: () => {},
    onRequestAssignees: () => {},
    onRequestReviewers: () => {},
    onRequestLabels: () => {},
    onRequestParts: () => {},
    onPartSearchChange: () => {},
    onSubmit: async () => {}
  }
}`,...n.parameters?.docs?.source}}};const q=["IssueCreate","ChangeRequestCreate"];export{n as ChangeRequestCreate,e as IssueCreate,q as __namedExportsOrder,C as default};
