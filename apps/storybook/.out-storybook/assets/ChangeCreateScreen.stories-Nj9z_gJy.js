import{h as t}from"./production-result-detail-screen-kTjdDYfl.js";import"./index-B4avf9CM.js";import"./iframe-DjFiVPSj.js";import"./user-avatar-CJtlkw0_.js";import"./circle-alert-7HBXfu_Z.js";import"./chevrons-up-down-cjEB4Cse.js";import"./settings-BbypiVPi.js";import"./sparkles-BrCodocr.js";import"./tag-BpztlO3h.js";import"./index-CqusOY6v.js";import"./preload-helper-PPVm8Dsz.js";const a=[{id:"user-1",name:"김태현",email:"taehyun.kim@fabbit.io",profileImageUrl:null},{id:"user-2",name:"이수진",email:"soojin.lee@fabbit.io",profileImageUrl:null},{id:"user-3",name:"박준서",email:"junseo.park@fabbit.io",profileImageUrl:null}],s=[{id:"label-1",name:"긴급",colorHex:"#ef4444"},{id:"label-2",name:"설계검토",colorHex:"#3b82f6"},{id:"label-3",name:"양산대응",colorHex:"#10b981"}],r=[{id:"part-1",partNumber:"MC-2048-A",name:"모터 컨트롤러 하우징"},{id:"part-2",partNumber:"BT-1024-C",name:"배터리 팩 브래킷"},{id:"part-3",partNumber:"CN-7781-B",name:"커넥터 핀 어셈블리"}],R={title:"Components/ChangeCreateScreen",component:t,tags:["autodocs"],parameters:{layout:"fullscreen"}},e={args:{backLabel:"이슈 목록",description:"문제, 검토 대상, 후속 작업을 이슈로 등록합니다.",heading:"새 이슈",titlePlaceholder:"이슈 제목을 입력하세요",editorPlaceholder:"이슈 설명을 입력하세요",submitLabel:"이슈 생성",assigneeOptions:a,labelOptions:s,partOptions:r,onBack:()=>{},onRequestAssignees:()=>{},onRequestLabels:()=>{},onRequestParts:()=>{},onPartSearchChange:()=>{},onSubmit:async()=>{}}},n={args:{backLabel:"변경 요청 목록",description:"설계 변경 내용을 등록하고 검토자를 지정합니다.",heading:"새 변경 요청",titlePlaceholder:"변경 요청 제목을 입력하세요",editorPlaceholder:"변경 요청 설명을 입력하세요",submitLabel:"변경 요청 생성",includeReviewers:!0,linkedIssueNumber:42,linkedIssueTitle:"센서 브래킷 간섭 확인",assigneeOptions:a,reviewerOptions:a,labelOptions:s,partOptions:r,onBack:()=>{},onRequestAssignees:()=>{},onRequestReviewers:()=>{},onRequestLabels:()=>{},onRequestParts:()=>{},onPartSearchChange:()=>{},onSubmit:async()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};const C=["IssueCreate","ChangeRequestCreate"];export{n as ChangeRequestCreate,e as IssueCreate,C as __namedExportsOrder,R as default};
