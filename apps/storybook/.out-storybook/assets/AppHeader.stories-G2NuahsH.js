import{j as e}from"./index-BC33NHKD.js";import"./iframe-BDY6rKdT.js";import{U as i,B as c,d as a}from"./change-request-detail-screen-BB3V5S0M.js";import{B as m}from"./user-avatar-Cz1MQ_Sd.js";import{S as l}from"./settings-CQ3R25cq.js";import"./index-C3SxMwu4.js";import"./preload-helper-PPVm8Dsz.js";import"./circle-alert-Df3U-mR7.js";import"./chevrons-up-down-BJxNzKgS.js";import"./sparkles-CdpkT6Re.js";import"./tag-gRIXPjqS.js";const j={title:"Components/AppHeader",component:a,tags:["autodocs"],parameters:{layout:"fullscreen"}},t={name:"문성하",email:"seongha@fabbit.io"},r=[{id:"profile",label:"개인 설정",icon:i,onClick:()=>{}},{id:"org",label:"조직 설정",icon:c,onClick:()=>{}},{id:"system",label:"시스템 설정",icon:l,onClick:()=>{}}],s={args:{brand:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground",children:e.jsxs("svg",{className:"size-4",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M12 2L2 7l10 5 10-5-10-5z"}),e.jsx("path",{d:"M2 17l10 5 10-5"}),e.jsx("path",{d:"M2 12l10 5 10-5"})]})}),e.jsx("span",{className:"text-sm font-semibold",children:"Fabbit"})]}),user:t,onToggleSidebar:()=>{},onSearchClick:()=>{},searchPlaceholder:"품목, 도면, BOM 검색...",onNotificationClick:()=>{},notificationCount:3,menuItems:r,onLogout:()=>{}}},o={args:{brand:e.jsx("span",{className:"text-sm font-semibold",children:"Fabbit"}),user:t,onLogout:()=>{}}},n={render:()=>e.jsx(a,{brand:e.jsx("span",{className:"text-sm font-semibold",children:"Fabbit MES"}),user:t,onToggleSidebar:()=>{},onSearchClick:()=>{},onNotificationClick:()=>{},menuItems:r,onLogout:()=>{},actions:e.jsx(m,{variant:"outline",size:"sm",children:"+ 작업지시 생성"})})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    brand: <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-sm font-semibold">Fabbit</span>
      </div>,
    user: mockUser,
    onToggleSidebar: () => {},
    onSearchClick: () => {},
    searchPlaceholder: "품목, 도면, BOM 검색...",
    onNotificationClick: () => {},
    notificationCount: 3,
    menuItems: mockMenuItems,
    onLogout: () => {}
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    brand: <span className="text-sm font-semibold">Fabbit</span>,
    user: mockUser,
    onLogout: () => {}
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <AppHeader brand={<span className="text-sm font-semibold">Fabbit MES</span>} user={mockUser} onToggleSidebar={() => {}} onSearchClick={() => {}} onNotificationClick={() => {}} menuItems={mockMenuItems} onLogout={() => {}} actions={<Button variant="outline" size="sm">
          + 작업지시 생성
        </Button>} />
}`,...n.parameters?.docs?.source}}};const M=["Default","Minimal","WithActions"];export{s as Default,o as Minimal,n as WithActions,M as __namedExportsOrder,j as default};
