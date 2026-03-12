import{j as e}from"./index-DRJbD1WP.js";import{d as t,aQ as n,e as s,L as p,F as g,G as h,P as C,c as i,U as b,B as k}from"./gltf-viewer-screen-BDJMhtPo.js";import{F as y}from"./factory-xMrVRG75.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const d=e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground",children:e.jsxs("svg",{className:"size-4",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M12 2L2 7l10 5 10-5-10-5z"}),e.jsx("path",{d:"M2 17l10 5 10-5"}),e.jsx("path",{d:"M2 12l10 5 10-5"})]})}),e.jsx("span",{className:"text-sm font-semibold",children:"Fabbit"})]}),l={name:"김태현",email:"taehyun@fabbit.io"},c=[{id:"profile",label:"개인 설정",icon:b,onClick:()=>{}},{id:"org",label:"조직 설정",icon:k,onClick:()=>{}}],m=[{id:"main",items:[{id:"dashboard",label:"대시보드",icon:p,onClick:()=>{}},{id:"projects",label:"프로젝트",icon:g,onClick:()=>{}},{id:"changes",label:"변경 관리",icon:h,onClick:()=>{}},{id:"parts",label:"부품 관리",icon:C,onClick:()=>{}},{id:"production",label:"생산",icon:y,active:!0,onClick:()=>{}}]}],u=[{id:"1",orderNumber:"WO-240301",productName:"본체 조립",goodQuantity:40,defectQuantity:2,plannedQuantity:100,workDuration:"03:20",recordedAt:"2026-03-07 14:30",recorder:{name:"김현장",profileImageUrl:null},team:"1팀",hasDefectRecord:!0},{id:"2",orderNumber:"WO-240302",productName:"커버 가공",goodQuantity:50,defectQuantity:0,plannedQuantity:50,workDuration:"02:10",recordedAt:"2026-03-07 12:00",recorder:{name:"박리더",profileImageUrl:null},team:"2팀",hasDefectRecord:!1},{id:"3",orderNumber:"WO-240303",productName:"PCB 납땜",goodQuantity:180,defectQuantity:5,plannedQuantity:200,workDuration:"05:40",recordedAt:"2026-03-07 17:00",recorder:{name:"이수진",profileImageUrl:null},team:"3팀",hasDefectRecord:!0},{id:"4",orderNumber:"WO-240304",productName:"방열판 CNC 가공",goodQuantity:80,defectQuantity:0,plannedQuantity:80,workDuration:"04:15",recordedAt:"2026-03-07 16:20",recorder:{name:"정하은",profileImageUrl:null},team:"1팀",hasDefectRecord:!1},{id:"5",orderNumber:"WO-240305",productName:"하우징 사출",goodQuantity:60,defectQuantity:3,plannedQuantity:150,workDuration:"02:50",recordedAt:"2026-03-07 11:30",recorder:{name:"최민정",profileImageUrl:null},team:"2팀",hasDefectRecord:!0},{id:"6",orderNumber:"WO-240306",productName:"모터 조립",goodQuantity:30,defectQuantity:1,plannedQuantity:60,workDuration:"01:45",recordedAt:"2026-03-07 10:00",recorder:{name:"김태현",profileImageUrl:null},team:"1팀",hasDefectRecord:!1}],T={title:"Pages/ProductionResultList",component:t,tags:["autodocs"],parameters:{layout:"fullscreen"}},a={render:()=>e.jsx(t,{header:e.jsx(i,{brand:d,user:l,onToggleSidebar:()=>{},search:{triggerLabel:"검색",dialogPlaceholder:"작업번호, 품목명 검색..."},menuItems:c,onLogout:()=>{}}),sidebar:e.jsx(s,{isDesktop:!0,sections:m}),isDesktop:!0,mainClassName:"p-6",children:e.jsx(n,{items:u,queryState:{query:"",page:1,pageSize:20,period:"today",team:null},totalCount:u.length,teams:["1팀","2팀","3팀","품질팀"],onCreateClick:()=>{},onItemClick:()=>{},onPageChange:()=>{},onQueryChange:()=>{},onPeriodChange:()=>{},onTeamChange:()=>{}})})},r={render:()=>e.jsx(t,{header:e.jsx(i,{brand:d,user:l,onToggleSidebar:()=>{},search:{triggerLabel:"검색",dialogPlaceholder:"작업번호, 품목명 검색..."},menuItems:c,onLogout:()=>{}}),sidebar:e.jsx(s,{isDesktop:!0,sections:m}),isDesktop:!0,mainClassName:"p-6",children:e.jsx(n,{items:[],queryState:{query:"",page:1,pageSize:20,period:"today",team:null},totalCount:0,teams:["1팀","2팀","3팀","품질팀"],isLoading:!0,onCreateClick:()=>{},onItemClick:()=>{},onPageChange:()=>{},onQueryChange:()=>{},onPeriodChange:()=>{},onTeamChange:()=>{}})})},o={render:()=>e.jsx(t,{header:e.jsx(i,{brand:d,user:l,onToggleSidebar:()=>{},search:{triggerLabel:"검색",dialogPlaceholder:"작업번호, 품목명 검색..."},menuItems:c,onLogout:()=>{}}),sidebar:e.jsx(s,{isDesktop:!0,sections:m}),isDesktop:!0,mainClassName:"p-6",children:e.jsx(n,{items:[],queryState:{query:"",page:1,pageSize:20,period:"today",team:null},totalCount:0,teams:["1팀","2팀","3팀","품질팀"],onCreateClick:()=>{},onItemClick:()=>{},onPageChange:()=>{},onQueryChange:()=>{},onPeriodChange:()=>{},onTeamChange:()=>{}})})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "작업번호, 품목명 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-6">
      <ProductionResultListScreen items={mockItems} queryState={{
      query: "",
      page: 1,
      pageSize: 20,
      period: "today",
      team: null
    }} totalCount={mockItems.length} teams={["1팀", "2팀", "3팀", "품질팀"]} onCreateClick={() => {}} onItemClick={() => {}} onPageChange={() => {}} onQueryChange={() => {}} onPeriodChange={() => {}} onTeamChange={() => {}} />
    </AppShell>
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "작업번호, 품목명 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-6">
      <ProductionResultListScreen items={[]} queryState={{
      query: "",
      page: 1,
      pageSize: 20,
      period: "today",
      team: null
    }} totalCount={0} teams={["1팀", "2팀", "3팀", "품질팀"]} isLoading onCreateClick={() => {}} onItemClick={() => {}} onPageChange={() => {}} onQueryChange={() => {}} onPeriodChange={() => {}} onTeamChange={() => {}} />
    </AppShell>
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "작업번호, 품목명 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-6">
      <ProductionResultListScreen items={[]} queryState={{
      query: "",
      page: 1,
      pageSize: 20,
      period: "today",
      team: null
    }} totalCount={0} teams={["1팀", "2팀", "3팀", "품질팀"]} onCreateClick={() => {}} onItemClick={() => {}} onPageChange={() => {}} onQueryChange={() => {}} onPeriodChange={() => {}} onTeamChange={() => {}} />
    </AppShell>
}`,...o.parameters?.docs?.source}}};const U=["Default","Loading","Empty"];export{a as Default,o as Empty,r as Loading,U as __namedExportsOrder,T as default};
