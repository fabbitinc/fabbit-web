import{j as t}from"./index-B4avf9CM.js";import{l as i}from"./production-result-detail-screen-kTjdDYfl.js";import"./iframe-DjFiVPSj.js";import"./user-avatar-CJtlkw0_.js";import"./index-CqusOY6v.js";import"./circle-alert-7HBXfu_Z.js";import"./chevrons-up-down-cjEB4Cse.js";import"./settings-BbypiVPi.js";import"./sparkles-BrCodocr.js";import"./tag-BpztlO3h.js";import"./preload-helper-PPVm8Dsz.js";const a={crState:"SUBMITTED",commentsCount:18,createdAt:"2026-03-05T10:40:00Z",updatedAt:"2026-03-07T03:15:00Z",mergedAt:null,mergedBy:null,assignees:[{userId:"user-1",fullName:"문서연",email:"seoyeon.moon@fabbit.dev",phone:null,profileImageUrl:null}],reviewers:[{userId:"user-2",fullName:"박시우",email:"siwoo.park@fabbit.dev",phone:null,profileImageUrl:null,reviewStatus:"APPROVED",reviewedAt:"2026-03-07T01:20:00Z"},{userId:"user-3",fullName:"김하준",email:"hajun.kim@fabbit.dev",phone:null,profileImageUrl:null,reviewStatus:"PENDING",reviewedAt:null}],labels:[{id:"label-1",name:"승인 필요",color:"#f97316"},{id:"label-2",name:"제조 영향",color:"#2563eb"}],parts:[{id:"part-1",partNumber:"DRV-PLATE-0142",name:"드라이브 유닛 베이스 플레이트"}],files:[{fileId:"file-1",originalName:"change-summary.pdf",contentType:"application/pdf",fileSize:204800,fileUrl:"https://example.com/change-summary.pdf",createdAt:"2026-03-06T13:25:00Z"}],linkedIssues:[{id:"issue-1",number:187,title:"인버터 하우징 간섭",state:"OPEN"}]},R={title:"Components/ChangeRequestSidebar",component:i,tags:["autodocs"],parameters:{layout:"padded"},args:{changeRequest:a,isAttachingFiles:!1,onAttachFiles:async()=>{},onDeleteFile:async()=>{},onEditAssignees:()=>{},onEditIssues:()=>{},onEditLabels:()=>{},onEditParts:()=>{},onEditReviewers:()=>{},onNavigateToIssue:()=>{}}},e={},s={args:{changeRequest:{...a,assignees:[],files:[],labels:[],linkedIssues:[],parts:[],reviewers:[]}}},r={render:n=>t.jsxs("div",{className:"grid gap-6 xl:grid-cols-2",children:[t.jsx(i,{...n}),t.jsx(i,{...n,changeRequest:{...a,crState:"MERGED",mergedAt:"2026-03-07T06:10:00Z",mergedBy:"박시우",reviewers:a.reviewers.map(o=>({...o,reviewStatus:"APPROVED",reviewedAt:o.reviewedAt??"2026-03-07T04:00:00Z"}))}})]})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    changeRequest: {
      ...sampleChangeRequest,
      assignees: [],
      files: [],
      labels: [],
      linkedIssues: [],
      parts: [],
      reviewers: []
    }
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-6 xl:grid-cols-2">
      <ChangeRequestSidebar {...args} />
      <ChangeRequestSidebar {...args} changeRequest={{
      ...sampleChangeRequest,
      crState: "MERGED",
      mergedAt: "2026-03-07T06:10:00Z",
      mergedBy: "박시우",
      reviewers: sampleChangeRequest.reviewers.map(reviewer => ({
        ...reviewer,
        reviewStatus: "APPROVED",
        reviewedAt: reviewer.reviewedAt ?? "2026-03-07T04:00:00Z"
      }))
    }} />
    </div>
}`,...r.parameters?.docs?.source}}};const E=["Default","EmptyState","Showcase"];export{e as Default,s as EmptyState,r as Showcase,E as __namedExportsOrder,R as default};
