import{j as r}from"./index-BC33NHKD.js";import{t}from"./change-request-detail-screen-BB3V5S0M.js";import"./iframe-BDY6rKdT.js";import"./preload-helper-PPVm8Dsz.js";import"./index-C3SxMwu4.js";import"./user-avatar-Cz1MQ_Sd.js";import"./circle-alert-Df3U-mR7.js";import"./chevrons-up-down-BJxNzKgS.js";import"./sparkles-CdpkT6Re.js";import"./settings-CQ3R25cq.js";import"./tag-gRIXPjqS.js";const o={assignees:[{id:"user-1",name:"문서연",profileImageUrl:null},{id:"user-2",name:"김하준",profileImageUrl:null}],labels:[{id:"label-1",name:"긴급",colorHex:"#ef4444"},{id:"label-2",name:"양산 영향",colorHex:"#2563eb"}],linkedChanges:[{id:"change-1",number:42,title:"인버터 하우징 간섭 수정",state:"open"}],linkedIssues:[],relatedParts:[{id:"part-1",partNumber:"DRV-PLATE-0142",name:"드라이브 유닛 베이스 플레이트"},{id:"part-2",partNumber:"CTRL-PCB-0207",name:"모터 제어 PCB"}],attachments:[{id:"file-1",name:"issue-evidence.png",size:"1 MB",type:"image",uploadedBy:"문서연",uploadedAt:"2026-03-06T09:10:00Z"}],onCreateLinkedChange:()=>{},onEditAssignees:()=>alert("담당자 편집"),onEditLabels:()=>alert("라벨 편집"),onEditParts:()=>alert("부품 편집"),onEditLinkedChanges:()=>alert("변경 요청 편집")},x={title:"Components/IssueSidebar",component:t,tags:["autodocs"],parameters:{layout:"padded"},args:o},e={},s={args:{assignees:[],labels:[],linkedChanges:[],linkedIssues:[],relatedParts:[],attachments:[]}},a={render:n=>r.jsxs("div",{className:"grid gap-6 xl:grid-cols-2",children:[r.jsx(t,{...n}),r.jsx(t,{...n,assignees:[],labels:[],linkedChanges:[],relatedParts:[],attachments:[]})]})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    assignees: [],
    labels: [],
    linkedChanges: [],
    linkedIssues: [],
    relatedParts: [],
    attachments: []
  }
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-6 xl:grid-cols-2">
      <IssueSidebar {...args} />
      <IssueSidebar {...args} assignees={[]} labels={[]} linkedChanges={[]} relatedParts={[]} attachments={[]} />
    </div>
}`,...a.parameters?.docs?.source}}};const S=["Default","EmptyState","Showcase"];export{e as Default,s as EmptyState,a as Showcase,S as __namedExportsOrder,x as default};
