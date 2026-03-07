import{j as e}from"./index-B4avf9CM.js";import{r as m}from"./iframe-DjFiVPSj.js";import{W as j}from"./production-result-detail-screen-kTjdDYfl.js";import"./user-avatar-CJtlkw0_.js";import"./index-CqusOY6v.js";import"./preload-helper-PPVm8Dsz.js";import"./circle-alert-7HBXfu_Z.js";import"./chevrons-up-down-cjEB4Cse.js";import"./settings-BbypiVPi.js";import"./sparkles-BrCodocr.js";import"./tag-BpztlO3h.js";const y=[{id:"part-1",partNumber:"DRV-PLATE-0142",name:"드라이브 유닛 베이스 플레이트",category:"기구",revision:"C",lifecycleState:"양산",drawingNumber:"DWG-0142",childrenCount:14},{id:"part-2",partNumber:"CTRL-PCB-0207",name:"모터 제어 PCB",category:"전장",revision:"F",lifecycleState:"시제품",drawingNumber:null,childrenCount:0},{id:"part-3",partNumber:"HAR-CONN-0081",name:"메인 하네스 커넥터",category:"하네스",revision:"B",lifecycleState:"중단",drawingNumber:"DWG-0081",childrenCount:2}];function P(c,t,x){return[...c].sort((a,s)=>{const b=t==="partNumber"?a.partNumber:t==="name"?a.name??"":t==="category"?a.category??"":t==="revision"?a.revision:a.lifecycleState??"",f=t==="partNumber"?s.partNumber:t==="name"?s.name??"":t==="category"?s.category??"":t==="revision"?s.revision:s.lifecycleState??"",o=String(b).localeCompare(String(f),"ko");return x==="asc"?o:-o})}function i({initialItems:c=y,isLoading:t=!1,totalCount:x=y.length}){const[a,s]=m.useState(1),[b,f]=m.useState(20),[o,C]=m.useState("partNumber"),[v,L]=m.useState("asc"),[h,N]=m.useState(new Set),d=m.useMemo(()=>P(c,o,v),[c,o,v]);return e.jsx(j,{isLoading:t,items:d,page:a,pageSize:b,selectedIds:h,sortKey:o,sortOrder:v,totalCount:x,onPageChange:s,onPageSizeChange:f,onRowClick:()=>{},onSortChange:r=>{L(n=>o===r&&n==="asc"?"desc":"asc"),C(r)},onToggleSelectAll:()=>{N(r=>d.length>0&&d.every(n=>r.has(n.id))?new Set:new Set(d.map(n=>n.id)))},onToggleSelectOne:r=>{N(n=>{const u=new Set(n);return u.has(r)?u.delete(r):u.add(r),u})}})}const W={title:"Components/PartsListTable",component:i,tags:["autodocs"],parameters:{layout:"padded"}},l={render:()=>e.jsx(i,{})},p={render:()=>e.jsx(i,{isLoading:!0})},g={render:()=>e.jsx(i,{initialItems:[],totalCount:0})},S={render:()=>e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"기본 목록"}),e.jsx(i,{})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"로딩 상태"}),e.jsx(i,{isLoading:!0})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"빈 상태"}),e.jsx(i,{initialItems:[],totalCount:0})]})]})};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <PartsListTableStory />
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <PartsListTableStory isLoading />
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <PartsListTableStory initialItems={[]} totalCount={0} />
}`,...g.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-8">
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">기본 목록</p>
        <PartsListTableStory />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">로딩 상태</p>
        <PartsListTableStory isLoading />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">빈 상태</p>
        <PartsListTableStory initialItems={[]} totalCount={0} />
      </div>
    </div>
}`,...S.parameters?.docs?.source}}};const k=["Default","Loading","EmptyState","Showcase"];export{l as Default,g as EmptyState,p as Loading,S as Showcase,k as __namedExportsOrder,W as default};
