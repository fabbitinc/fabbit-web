import{j as n}from"./index-QYnQWpJ5.js";import{ai as d}from"./change-request-detail-screen-BXoKcBb5.js";import"./iframe-uSZs8WMR.js";import"./preload-helper-PPVm8Dsz.js";import"./index-D-xEXGrX.js";import"./user-avatar-DJpZquVq.js";import"./circle-alert-e60hHxQt.js";import"./chevrons-up-down-DeU1l3Vt.js";import"./sparkles-CZ0Co1E_.js";import"./settings-B-L1BAJU.js";import"./tag-YK-1BDS0.js";const i={acceptedCount:3,pendingCount:1,processingCount:1,completedCount:1,failedJobCount:0,failed:[],items:[{jobId:"job-1",fileId:"file-1",status:"completed",totalRows:128,processedRows:128,nodesCreated:84,relationshipsCreated:42,errorCount:0,startedAt:"2026-03-06T08:00:00Z",completedAt:"2026-03-06T08:01:00Z"},{jobId:"job-2",fileId:"file-2",status:"processing",totalRows:220,processedRows:88,nodesCreated:41,relationshipsCreated:19,errorCount:2,startedAt:"2026-03-06T08:02:00Z",completedAt:null},{jobId:"job-3",fileId:"file-3",status:"pending",totalRows:56,processedRows:0,nodesCreated:0,relationshipsCreated:0,errorCount:0,startedAt:null,completedAt:null}]},c={acceptedCount:2,pendingCount:0,processingCount:0,completedCount:2,failedJobCount:0,failed:[],items:[{jobId:"job-4",fileId:"file-1",status:"completed",totalRows:128,processedRows:128,nodesCreated:84,relationshipsCreated:42,errorCount:0,startedAt:"2026-03-06T08:00:00Z",completedAt:"2026-03-06T08:01:00Z"},{jobId:"job-5",fileId:"file-2",status:"completed",totalRows:220,processedRows:220,nodesCreated:102,relationshipsCreated:61,errorCount:0,startedAt:"2026-03-06T08:02:00Z",completedAt:"2026-03-06T08:05:00Z"}]},l={acceptedCount:3,pendingCount:0,processingCount:0,completedCount:1,failedJobCount:1,failed:[{fileId:"file-3",reason:"필수 헤더 `part_number`를 찾지 못했습니다."}],items:[{jobId:"job-6",fileId:"file-1",status:"completed",totalRows:128,processedRows:128,nodesCreated:84,relationshipsCreated:42,errorCount:0,startedAt:"2026-03-06T08:00:00Z",completedAt:"2026-03-06T08:01:00Z"},{jobId:"job-7",fileId:"file-2",status:"failed",totalRows:220,processedRows:124,nodesCreated:41,relationshipsCreated:19,errorCount:7,startedAt:"2026-03-06T08:02:00Z",completedAt:"2026-03-06T08:03:00Z"}]},e={"file-1":"drive-unit-v3.xlsx","file-2":"motor-controller-bom.csv","file-3":"supplier-mapping.xlsx"},I={title:"Components/SynthesisProgressPanel",component:d,tags:["autodocs"],parameters:{layout:"padded"}},t={args:{batchStatus:null,fileNames:e}},s={args:{batchStatus:i,fileNames:e}},o={args:{batchStatus:c,fileNames:e}},a={args:{batchStatus:l,fileNames:e}},r={render:()=>n.jsxs("div",{className:"space-y-8",children:[n.jsx(d,{batchStatus:i,fileNames:e}),n.jsx(d,{batchStatus:l,fileNames:e})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    batchStatus: null,
    fileNames
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    batchStatus: processingStatus,
    fileNames
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    batchStatus: completeStatus,
    fileNames
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    batchStatus: failedStatus,
    fileNames
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-8">
      <SynthesisProgressPanel batchStatus={processingStatus} fileNames={fileNames} />
      <SynthesisProgressPanel batchStatus={failedStatus} fileNames={fileNames} />
    </div>
}`,...r.parameters?.docs?.source}}};const R=["Loading","Processing","Complete","PartialFailure","Showcase"];export{o as Complete,t as Loading,a as PartialFailure,s as Processing,r as Showcase,R as __namedExportsOrder,I as default};
