import{j as e}from"./index-B4avf9CM.js";import{d as n,aB as o,e as s,L as p,F as g,G as C,P as h,c as i,U as b,B as y}from"./production-result-detail-screen-kTjdDYfl.js";import"./iframe-DjFiVPSj.js";import"./user-avatar-CJtlkw0_.js";import{F as k}from"./factory-DN9g8WId.js";import"./index-CqusOY6v.js";import"./circle-alert-7HBXfu_Z.js";import"./chevrons-up-down-cjEB4Cse.js";import"./settings-BbypiVPi.js";import"./sparkles-BrCodocr.js";import"./tag-BpztlO3h.js";import"./preload-helper-PPVm8Dsz.js";const l=e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground",children:e.jsxs("svg",{className:"size-4",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M12 2L2 7l10 5 10-5-10-5z"}),e.jsx("path",{d:"M2 17l10 5 10-5"}),e.jsx("path",{d:"M2 12l10 5 10-5"})]})}),e.jsx("span",{className:"text-sm font-semibold",children:"Fabbit"})]}),m={name:"김태현",email:"taehyun@fabbit.io"},u=[{id:"profile",label:"개인 설정",icon:b,onClick:()=>{}},{id:"org",label:"조직 설정",icon:y,onClick:()=>{}}],d=[{id:"main",items:[{id:"dashboard",label:"대시보드",icon:p,onClick:()=>{}},{id:"projects",label:"프로젝트",icon:g,onClick:()=>{}},{id:"changes",label:"변경 관리",icon:C,onClick:()=>{}},{id:"parts",label:"부품관리",icon:h,onClick:()=>{}},{id:"production",label:"생산",icon:k,active:!0,onClick:()=>{}}]}],c=[{id:"1",orderNumber:"WO-240301",productName:"본체 조립",quantity:100,dueDate:"2026-03-10",priority:"high",status:"in_progress",assignee:{name:"박준서",profileImageUrl:null},team:"1팀",commentsCount:3,bomReference:"BOM-AX-003"},{id:"2",orderNumber:"WO-240302",productName:"커버 가공",quantity:50,dueDate:"2026-03-11",priority:"medium",status:"released",assignee:{name:"이수진",profileImageUrl:null},team:"2팀",commentsCount:0,bomReference:"BOM-CV-012"},{id:"3",orderNumber:"WO-240303",productName:"최종 검사",quantity:30,dueDate:"2026-03-05",priority:"high",status:"in_progress",assignee:{name:"정하은",profileImageUrl:null},team:"품질팀",commentsCount:5,bomReference:"BOM-QC-001"},{id:"4",orderNumber:"WO-240304",productName:"PCB 납땜",quantity:200,dueDate:"2026-03-12",priority:"low",status:"draft",assignee:{name:"최민정",profileImageUrl:null},team:"3팀",commentsCount:0,bomReference:"BOM-PCB-007"},{id:"5",orderNumber:"WO-240305",productName:"방열판 CNC 가공",quantity:80,dueDate:"2026-03-08",priority:"medium",status:"done",assignee:{name:"김태현",profileImageUrl:null},team:"1팀",commentsCount:2,bomReference:"BOM-HS-015"},{id:"6",orderNumber:"WO-240306",productName:"하우징 사출",quantity:150,dueDate:"2026-03-09",priority:"high",status:"cancelled",assignee:{name:"박준서",profileImageUrl:null},team:"2팀",commentsCount:1,bomReference:"BOM-HS-018"},{id:"7",orderNumber:"WO-240307",productName:"모터 조립",quantity:60,dueDate:"2026-03-15",priority:"medium",status:"released",assignee:{name:"이수진",profileImageUrl:null},team:"1팀",commentsCount:0,bomReference:"BOM-MT-002"}],M={title:"Pages/WorkOrderList",component:n,tags:["autodocs"],parameters:{layout:"fullscreen"}},a={render:()=>e.jsx(n,{header:e.jsx(i,{brand:l,user:m,onToggleSidebar:()=>{},search:{triggerLabel:"검색",dialogPlaceholder:"작업번호, 품목명 검색..."},menuItems:u,onLogout:()=>{}}),sidebar:e.jsx(s,{isDesktop:!0,sections:d}),isDesktop:!0,mainClassName:"p-6",children:e.jsx(o,{items:c,queryState:{query:"",page:1,pageSize:20,status:"all",team:null,priority:null},totalCount:c.length,teams:["1팀","2팀","3팀","품질팀"],onCreateClick:()=>{},onItemClick:()=>{},onPageChange:()=>{},onQueryChange:()=>{},onStatusChange:()=>{},onTeamChange:()=>{},onPriorityChange:()=>{}})})},r={render:()=>e.jsx(n,{header:e.jsx(i,{brand:l,user:m,onToggleSidebar:()=>{},search:{triggerLabel:"검색",dialogPlaceholder:"작업번호, 품목명 검색..."},menuItems:u,onLogout:()=>{}}),sidebar:e.jsx(s,{isDesktop:!0,sections:d}),isDesktop:!0,mainClassName:"p-6",children:e.jsx(o,{items:[],queryState:{query:"",page:1,pageSize:20,status:"all",team:null,priority:null},totalCount:0,teams:["1팀","2팀","3팀","품질팀"],isLoading:!0,onCreateClick:()=>{},onItemClick:()=>{},onPageChange:()=>{},onQueryChange:()=>{},onStatusChange:()=>{},onTeamChange:()=>{},onPriorityChange:()=>{}})})},t={render:()=>e.jsx(n,{header:e.jsx(i,{brand:l,user:m,onToggleSidebar:()=>{},search:{triggerLabel:"검색",dialogPlaceholder:"작업번호, 품목명 검색..."},menuItems:u,onLogout:()=>{}}),sidebar:e.jsx(s,{isDesktop:!0,sections:d}),isDesktop:!0,mainClassName:"p-6",children:e.jsx(o,{items:[],queryState:{query:"",page:1,pageSize:20,status:"all",team:null,priority:null},totalCount:0,teams:["1팀","2팀","3팀","품질팀"],onCreateClick:()=>{},onItemClick:()=>{},onPageChange:()=>{},onQueryChange:()=>{},onStatusChange:()=>{},onTeamChange:()=>{},onPriorityChange:()=>{}})})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "작업번호, 품목명 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-6">
      <WorkOrderListScreen items={mockItems} queryState={{
      query: "",
      page: 1,
      pageSize: 20,
      status: "all",
      team: null,
      priority: null
    }} totalCount={mockItems.length} teams={["1팀", "2팀", "3팀", "품질팀"]} onCreateClick={() => {}} onItemClick={() => {}} onPageChange={() => {}} onQueryChange={() => {}} onStatusChange={() => {}} onTeamChange={() => {}} onPriorityChange={() => {}} />
    </AppShell>
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "작업번호, 품목명 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-6">
      <WorkOrderListScreen items={[]} queryState={{
      query: "",
      page: 1,
      pageSize: 20,
      status: "all",
      team: null,
      priority: null
    }} totalCount={0} teams={["1팀", "2팀", "3팀", "품질팀"]} isLoading onCreateClick={() => {}} onItemClick={() => {}} onPageChange={() => {}} onQueryChange={() => {}} onStatusChange={() => {}} onTeamChange={() => {}} onPriorityChange={() => {}} />
    </AppShell>
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "작업번호, 품목명 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-6">
      <WorkOrderListScreen items={[]} queryState={{
      query: "",
      page: 1,
      pageSize: 20,
      status: "all",
      team: null,
      priority: null
    }} totalCount={0} teams={["1팀", "2팀", "3팀", "품질팀"]} onCreateClick={() => {}} onItemClick={() => {}} onPageChange={() => {}} onQueryChange={() => {}} onStatusChange={() => {}} onTeamChange={() => {}} onPriorityChange={() => {}} />
    </AppShell>
}`,...t.parameters?.docs?.source}}};const B=["Default","Loading","Empty"];export{a as Default,t as Empty,r as Loading,B as __namedExportsOrder,M as default};
