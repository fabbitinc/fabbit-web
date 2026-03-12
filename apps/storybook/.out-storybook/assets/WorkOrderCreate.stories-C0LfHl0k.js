import{j as e}from"./index-DRJbD1WP.js";import{r as h}from"./iframe-1IsFew62.js";import{d as s,e as i,L as k,F as S,G as x,P as C,c as l,U as j,B as f,aR as m}from"./gltf-viewer-screen-BDJMhtPo.js";import{F as B}from"./factory-xMrVRG75.js";import"./index-DlmQN4rJ.js";import"./preload-helper-PPVm8Dsz.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const d=e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground",children:e.jsxs("svg",{className:"size-4",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M12 2L2 7l10 5 10-5-10-5z"}),e.jsx("path",{d:"M2 17l10 5 10-5"}),e.jsx("path",{d:"M2 12l10 5 10-5"})]})}),e.jsx("span",{className:"text-sm font-semibold",children:"Fabbit"})]}),c={name:"김태현",email:"taehyun@fabbit.io"},p=[{id:"profile",label:"개인 설정",icon:j,onClick:()=>{}},{id:"org",label:"조직 설정",icon:f,onClick:()=>{}}],u=[{id:"main",items:[{id:"dashboard",label:"대시보드",icon:k,onClick:()=>{}},{id:"projects",label:"프로젝트",icon:S,onClick:()=>{}},{id:"changes",label:"변경 관리",icon:x,onClick:()=>{}},{id:"parts",label:"부품 관리",icon:C,onClick:()=>{}},{id:"production",label:"생산",icon:B,active:!0,onClick:()=>{}}]}],b=[{id:"bom-1",code:"BOM-AX-003",label:"본체 조립 BOM Rev.C"},{id:"bom-2",code:"BOM-CV-012",label:"커버 가공 BOM Rev.A"},{id:"bom-3",code:"BOM-PCB-007",label:"PCB 모듈 BOM Rev.B"},{id:"bom-4",code:"BOM-HS-015",label:"방열판 BOM Rev.B"},{id:"bom-5",code:"BOM-MT-002",label:"모터 조립 BOM Rev.A"}],g=[{id:"team-1",name:"1팀"},{id:"team-2",name:"2팀"},{id:"team-3",name:"3팀"},{id:"team-4",name:"품질팀"}],I={productName:"",bomId:null,quantity:"",dueDate:"",priority:"medium",teamId:null,note:""};function O(){const[t,n]=h.useState(I);return e.jsx(m,{formValues:t,bomOptions:b,teamOptions:g,onBack:()=>{},onChange:n,onSubmit:()=>{}})}function A(){const[t,n]=h.useState({productName:"본체 조립",bomId:"bom-1",quantity:"100",dueDate:"2026-03-15",priority:"high",teamId:"team-1",note:"긴급 납기 건. 기준본 변경 금지."});return e.jsx(m,{formValues:t,bomOptions:b,teamOptions:g,onBack:()=>{},onChange:n,onSubmit:()=>{}})}const H={title:"Pages/WorkOrderCreate",component:s,tags:["autodocs"],parameters:{layout:"fullscreen"}},a={render:()=>e.jsx(s,{header:e.jsx(l,{brand:d,user:c,onToggleSidebar:()=>{},search:{triggerLabel:"검색",dialogPlaceholder:"작업번호, 품목명 검색..."},menuItems:p,onLogout:()=>{}}),sidebar:e.jsx(i,{isDesktop:!0,sections:u}),isDesktop:!0,mainClassName:"p-6",children:e.jsx(O,{})})},o={render:()=>e.jsx(s,{header:e.jsx(l,{brand:d,user:c,onToggleSidebar:()=>{},search:{triggerLabel:"검색",dialogPlaceholder:"작업번호, 품목명 검색..."},menuItems:p,onLogout:()=>{}}),sidebar:e.jsx(i,{isDesktop:!0,sections:u}),isDesktop:!0,mainClassName:"p-6",children:e.jsx(A,{})})},r={render:()=>e.jsx(s,{header:e.jsx(l,{brand:d,user:c,onToggleSidebar:()=>{},search:{triggerLabel:"검색",dialogPlaceholder:"작업번호, 품목명 검색..."},menuItems:p,onLogout:()=>{}}),sidebar:e.jsx(i,{isDesktop:!0,sections:u}),isDesktop:!0,mainClassName:"p-6",children:e.jsx(m,{formValues:{productName:"본체 조립",bomId:"bom-1",quantity:"100",dueDate:"2026-03-15",priority:"high",teamId:"team-1",note:""},bomOptions:b,teamOptions:g,isSubmitting:!0,onBack:()=>{},onChange:()=>{},onSubmit:()=>{}})})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "작업번호, 품목명 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-6">
      <InteractiveCreate />
    </AppShell>
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "작업번호, 품목명 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-6">
      <FilledCreate />
    </AppShell>
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "작업번호, 품목명 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-6">
      <WorkOrderCreateScreen formValues={{
      productName: "본체 조립",
      bomId: "bom-1",
      quantity: "100",
      dueDate: "2026-03-15",
      priority: "high",
      teamId: "team-1",
      note: ""
    }} bomOptions={bomOptions} teamOptions={teamOptions} isSubmitting onBack={() => {}} onChange={() => {}} onSubmit={() => {}} />
    </AppShell>
}`,...r.parameters?.docs?.source}}};const W=["Default","Filled","Submitting"];export{a as Default,o as Filled,r as Submitting,W as __namedExportsOrder,H as default};
