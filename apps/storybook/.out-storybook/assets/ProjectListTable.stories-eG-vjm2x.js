import{j as e}from"./index-BC33NHKD.js";import{r as y}from"./iframe-BDY6rKdT.js";import{a3 as S}from"./change-request-detail-screen-BB3V5S0M.js";import"./index-C3SxMwu4.js";import"./preload-helper-PPVm8Dsz.js";import"./user-avatar-Cz1MQ_Sd.js";import"./circle-alert-Df3U-mR7.js";import"./chevrons-up-down-BJxNzKgS.js";import"./sparkles-CdpkT6Re.js";import"./settings-CQ3R25cq.js";import"./tag-gRIXPjqS.js";const m=[{id:"p-1",name:"인버터 모듈 개선",description:"양산 전 BOM과 도면 정합성을 재검토하는 프로젝트입니다.",partCount:148,isArchived:!1,updatedAt:"2026-03-02T09:30:00Z"},{id:"p-2",name:"프레스 금형 전환",description:"프레스 라인 금형 교체와 부품 승인 플로우를 정리합니다.",partCount:86,isArchived:!1,updatedAt:"2026-02-25T14:10:00Z"},{id:"p-3",name:"공급사 이관 검토",description:null,partCount:42,isArchived:!0,updatedAt:"2026-01-18T03:20:00Z"}];function r({initialQueryState:d,totalCount:p=m.length,projects:u=m,isError:l=!1,isLoading:x=!1}){const[j,c]=y.useState(d??{query:"",page:1,pageSize:15,sortKey:"name",sortDirection:"asc"});return e.jsx(S,{isError:l,isLoading:x,projects:u,queryState:j,totalCount:p,onCreateClick:()=>{},onPageChange:o=>c(t=>({...t,page:o})),onQueryChange:o=>c(t=>({...t,query:o})),onRetry:()=>{},onRowClick:()=>{},onSortChange:o=>c(t=>({...t,sortDirection:t.sortKey===o&&t.sortDirection==="asc"?"desc":"asc",sortKey:o}))})}const N={title:"Components/ProjectListTable",component:r,tags:["autodocs"],parameters:{layout:"padded"}},s={render:()=>e.jsx(r,{})},a={render:()=>e.jsx(r,{initialQueryState:{query:"",page:1,pageSize:15,sortKey:"name",sortDirection:"asc"},projects:[],totalCount:0})},n={render:()=>e.jsx(r,{isError:!0})},i={render:()=>e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"기본 목록"}),e.jsx(r,{})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"검색 결과 없음"}),e.jsx(r,{initialQueryState:{query:"서보",page:1,pageSize:15,sortKey:"name",sortDirection:"asc"},projects:[],totalCount:0})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"에러 상태"}),e.jsx(r,{isError:!0})]})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <ProjectListTableStory />
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <ProjectListTableStory initialQueryState={{
    query: "",
    page: 1,
    pageSize: 15,
    sortKey: "name",
    sortDirection: "asc"
  }} projects={[]} totalCount={0} />
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <ProjectListTableStory isError />
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};const q=["Default","EmptyState","ErrorState","Showcase"];export{s as Default,a as EmptyState,n as ErrorState,i as Showcase,q as __namedExportsOrder,N as default};
