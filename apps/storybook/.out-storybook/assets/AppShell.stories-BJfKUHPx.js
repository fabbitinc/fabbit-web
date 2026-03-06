import{j as e}from"./index-QYnQWpJ5.js";import{d as s,e as m,L as h,F as u,G as x,P as b,c as i,U as g,B as v,S as j,K as a}from"./change-request-detail-screen-BXoKcBb5.js";import{T as S,B as f,X as N}from"./user-avatar-DJpZquVq.js";import"./iframe-uSZs8WMR.js";import"./preload-helper-PPVm8Dsz.js";import"./index-D-xEXGrX.js";import"./circle-alert-e60hHxQt.js";import"./chevrons-up-down-DeU1l3Vt.js";import"./sparkles-CZ0Co1E_.js";import"./settings-B-L1BAJU.js";import"./tag-YK-1BDS0.js";const T={title:"Components/AppShell",component:s,tags:["autodocs"],parameters:{layout:"fullscreen"}},p=[{id:"main",items:[{id:"dashboard",label:"대시보드",icon:h,active:!0,onClick:()=>{}},{id:"projects",label:"프로젝트",icon:u,onClick:()=>{}},{id:"changes",label:"변경 관리",icon:x,onClick:()=>{}},{id:"parts",label:"부품관리",icon:b,onClick:()=>{}}]}],l={name:"문성하",email:"seongha@fabbit.io"},c=[{id:"profile",label:"개인 설정",icon:g,onClick:()=>{}},{id:"org",label:"조직 설정",icon:v,onClick:()=>{}}],d=e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground",children:e.jsxs("svg",{className:"size-4",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M12 2L2 7l10 5 10-5-10-5z"}),e.jsx("path",{d:"M2 17l10 5 10-5"}),e.jsx("path",{d:"M2 12l10 5 10-5"})]})}),e.jsx("span",{className:"text-sm font-semibold",children:"Fabbit"})]}),n={render:()=>e.jsx(s,{header:e.jsx(i,{brand:d,user:l,onToggleSidebar:()=>{},onSearchClick:()=>{},searchPlaceholder:"품목, 도면, BOM 검색...",onNotificationClick:()=>{},notificationCount:2,menuItems:c,onLogout:()=>{}}),sidebar:e.jsx(m,{sections:p}),children:e.jsxs("div",{className:"p-6",children:[e.jsx("h1",{className:"mb-6 text-2xl font-semibold",children:"대시보드"}),e.jsxs(j,{children:[e.jsx(a,{label:"가동률",value:"94.2%",change:"+2.1%",changePositive:!0}),e.jsx(a,{label:"불량률",value:"0.6%",change:"-0.2%",changePositive:!0}),e.jsx(a,{label:"일일 생산량",value:"1,248개",change:"+48",changePositive:!0}),e.jsx(a,{label:"설비 가용률",value:"87.5%",change:"-1.3%",changePositive:!1})]})]})})},r={render:()=>e.jsx(s,{header:e.jsx(i,{brand:d,user:l,onToggleSidebar:()=>{},onSearchClick:()=>{},menuItems:c,onLogout:()=>{}}),sidebar:e.jsx(m,{sections:p,collapsed:!0}),sidebarCollapsed:!0,children:e.jsxs("div",{className:"p-6",children:[e.jsx("h1",{className:"text-2xl font-semibold",children:"대시보드"}),e.jsx("p",{className:"mt-2 text-muted-foreground",children:"사이드바가 접힌 상태입니다."})]})})},o={render:()=>e.jsx(s,{header:e.jsx(i,{brand:d,user:l,onToggleSidebar:()=>{},onSearchClick:()=>{},menuItems:c,onLogout:()=>{}}),sidebar:e.jsx(m,{sections:p}),banner:e.jsxs("div",{className:"flex items-center justify-between border-b bg-warning/10 px-4 py-2",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm text-warning",children:[e.jsx(S,{className:"size-4"}),"시스템 점검 예정: 03/10(월) 02:00~06:00 서비스 일시 중단"]}),e.jsx(f,{variant:"ghost",size:"icon",className:"size-6",children:e.jsx(N,{className:"size-3"})})]}),children:e.jsx("div",{className:"p-6",children:e.jsx("h1",{className:"text-2xl font-semibold",children:"대시보드"})})})},t={render:()=>e.jsx(s,{header:e.jsx(i,{brand:d,user:l,menuItems:c,onLogout:()=>{}}),children:e.jsxs("div",{className:"mx-auto max-w-3xl p-6",children:[e.jsx("h1",{className:"text-2xl font-semibold",children:"온보딩"}),e.jsx("p",{className:"mt-2 text-muted-foreground",children:"사이드바 없는 전체 너비 레이아웃입니다."})]})})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} onSearchClick={() => {}} searchPlaceholder="품목, 도면, BOM 검색..." onNotificationClick={() => {}} notificationCount={2} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar sections={navSections} />}>
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-semibold">대시보드</h1>
        <StatGroup>
          <KpiCard label="가동률" value="94.2%" change="+2.1%" changePositive />
          <KpiCard label="불량률" value="0.6%" change="-0.2%" changePositive />
          <KpiCard label="일일 생산량" value="1,248개" change="+48" changePositive />
          <KpiCard label="설비 가용률" value="87.5%" change="-1.3%" changePositive={false} />
        </StatGroup>
      </div>
    </AppShell>
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} onSearchClick={() => {}} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar sections={navSections} collapsed />} sidebarCollapsed>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">대시보드</h1>
        <p className="mt-2 text-muted-foreground">사이드바가 접힌 상태입니다.</p>
      </div>
    </AppShell>
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} onSearchClick={() => {}} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar sections={navSections} />} banner={<div className="flex items-center justify-between border-b bg-warning/10 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-warning">
            <AlertTriangle className="size-4" />
            시스템 점검 예정: 03/10(월) 02:00~06:00 서비스 일시 중단
          </div>
          <Button variant="ghost" size="icon" className="size-6">
            <X className="size-3" />
          </Button>
        </div>}>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">대시보드</h1>
      </div>
    </AppShell>
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} menuItems={mockMenuItems} onLogout={() => {}} />}>
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">온보딩</h1>
        <p className="mt-2 text-muted-foreground">
          사이드바 없는 전체 너비 레이아웃입니다.
        </p>
      </div>
    </AppShell>
}`,...t.parameters?.docs?.source}}};const K=["Default","CollapsedSidebar","WithBanner","NoSidebar"];export{r as CollapsedSidebar,n as Default,t as NoSidebar,o as WithBanner,K as __namedExportsOrder,T as default};
