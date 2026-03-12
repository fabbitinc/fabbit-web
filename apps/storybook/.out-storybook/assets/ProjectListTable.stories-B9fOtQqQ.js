import{j as e}from"./index-DRJbD1WP.js";import{r as j}from"./iframe-1IsFew62.js";import{ah as y}from"./gltf-viewer-screen-BDJMhtPo.js";import"./index-DlmQN4rJ.js";import"./preload-helper-PPVm8Dsz.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const m=[{id:"p-1",name:"인버터 모듈 개선",description:"양산 전 BOM과 도면 정합성을 재검토하는 프로젝트입니다.",partCount:148,isArchived:!1,updatedAt:"2026-03-02T09:30:00Z"},{id:"p-2",name:"프레스 금형 전환",description:"프레스 라인 금형 교체와 부품 승인 플로우를 정리합니다.",partCount:86,isArchived:!1,updatedAt:"2026-02-25T14:10:00Z"},{id:"p-3",name:"공급사 이관 검토",description:null,partCount:42,isArchived:!0,updatedAt:"2026-01-18T03:20:00Z"}];function o({initialQueryState:d,totalCount:p=m.length,projects:u=m,isError:l=!1,isLoading:x=!1}){const[S,s]=j.useState(d??{query:"",page:1,pageSize:15,sortKey:"name",sortDirection:"asc"});return e.jsx(y,{isError:l,isLoading:x,projects:u,queryState:S,totalCount:p,onCreateClick:()=>{},onPageChange:r=>s(t=>({...t,page:r})),onPageSizeChange:r=>s(t=>({...t,page:1,pageSize:r})),onQueryChange:r=>s(t=>({...t,query:r})),onRetry:()=>{},onRowClick:()=>{},onSortChange:r=>s(t=>({...t,sortDirection:t.sortKey===r&&t.sortDirection==="asc"?"desc":"asc",sortKey:r}))})}const q={title:"Components/ProjectListTable",component:o,tags:["autodocs"],parameters:{layout:"padded"}},a={render:()=>e.jsx(o,{})},n={render:()=>e.jsx(o,{initialQueryState:{query:"",page:1,pageSize:15,sortKey:"name",sortDirection:"asc"},projects:[],totalCount:0})},i={render:()=>e.jsx(o,{isError:!0})},c={render:()=>e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"기본 목록"}),e.jsx(o,{})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"검색 결과 없음"}),e.jsx(o,{initialQueryState:{query:"서보",page:1,pageSize:15,sortKey:"name",sortDirection:"asc"},projects:[],totalCount:0})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"에러 상태"}),e.jsx(o,{isError:!0})]})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <ProjectListTableStory />
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <ProjectListTableStory initialQueryState={{
    query: "",
    page: 1,
    pageSize: 15,
    sortKey: "name",
    sortDirection: "asc"
  }} projects={[]} totalCount={0} />
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <ProjectListTableStory isError />
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-8">
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">기본 목록</p>
        <ProjectListTableStory />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">검색 결과 없음</p>
        <ProjectListTableStory initialQueryState={{
        query: "서보",
        page: 1,
        pageSize: 15,
        sortKey: "name",
        sortDirection: "asc"
      }} projects={[]} totalCount={0} />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">에러 상태</p>
        <ProjectListTableStory isError />
      </div>
    </div>
}`,...c.parameters?.docs?.source}}};const z=["Default","EmptyState","ErrorState","Showcase"];export{a as Default,n as EmptyState,i as ErrorState,c as Showcase,z as __namedExportsOrder,q as default};
