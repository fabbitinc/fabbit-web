import{j as e}from"./index-DRJbD1WP.js";import{r as k}from"./iframe-1IsFew62.js";import{d as o,e as d,L as S,F as h,G as f,P as x,c as l,U as C,B as j,aO as c}from"./gltf-viewer-screen-BDJMhtPo.js";import{F as D}from"./factory-xMrVRG75.js";import"./index-DlmQN4rJ.js";import"./preload-helper-PPVm8Dsz.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const m=e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground",children:e.jsxs("svg",{className:"size-4",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M12 2L2 7l10 5 10-5-10-5z"}),e.jsx("path",{d:"M2 17l10 5 10-5"}),e.jsx("path",{d:"M2 12l10 5 10-5"})]})}),e.jsx("span",{className:"text-sm font-semibold",children:"Fabbit"})]}),u={name:"김태현",email:"taehyun@fabbit.io"},p=[{id:"profile",label:"개인 설정",icon:C,onClick:()=>{}},{id:"org",label:"조직 설정",icon:j,onClick:()=>{}}],g=[{id:"main",items:[{id:"dashboard",label:"대시보드",icon:S,onClick:()=>{}},{id:"projects",label:"프로젝트",icon:h,onClick:()=>{}},{id:"changes",label:"변경 관리",icon:f,onClick:()=>{}},{id:"parts",label:"부품 관리",icon:x,onClick:()=>{}},{id:"production",label:"생산",icon:D,active:!0,onClick:()=>{}}]}],b={id:"1",orderNumber:"WO-240301",productName:"본체 조립 (EV 모터 컨트롤러)",plannedQuantity:100,assigneeName:"박준서"},v={goodQuantity:"",defectQuantity:"",workStartTime:"",workEndTime:"",memo:""};function A(){const[r,a]=k.useState(v);return e.jsx(c,{workOrder:b,formValues:r,onBack:()=>{},onChange:a,onSubmit:()=>{},onSaveDraft:()=>{},onCreateDefectRecord:()=>{}})}function L(){const[r,a]=k.useState({goodQuantity:"40",defectQuantity:"2",workStartTime:"09:00",workEndTime:"12:20",memo:"조립 완료, 체결 불량 2건"});return e.jsx(c,{workOrder:b,formValues:r,onBack:()=>{},onChange:a,onSubmit:()=>{},onSaveDraft:()=>{},onCreateDefectRecord:()=>{}})}function P(){const[r,a]=k.useState({goodQuantity:"90",defectQuantity:"20",workStartTime:"08:00",workEndTime:"17:00",memo:""});return e.jsx(c,{workOrder:b,formValues:r,onBack:()=>{},onChange:a,onSubmit:()=>{},onSaveDraft:()=>{},onCreateDefectRecord:()=>{}})}const U={title:"Pages/ProductionResultCreate",component:o,tags:["autodocs"],parameters:{layout:"fullscreen"}},s={render:()=>e.jsx(o,{header:e.jsx(l,{brand:m,user:u,onToggleSidebar:()=>{},search:{triggerLabel:"검색",dialogPlaceholder:"작업번호, 품목명 검색..."},menuItems:p,onLogout:()=>{}}),sidebar:e.jsx(d,{isDesktop:!0,sections:g}),isDesktop:!0,mainClassName:"p-6",children:e.jsx(A,{})})},t={render:()=>e.jsx(o,{header:e.jsx(l,{brand:m,user:u,onToggleSidebar:()=>{},search:{triggerLabel:"검색",dialogPlaceholder:"작업번호, 품목명 검색..."},menuItems:p,onLogout:()=>{}}),sidebar:e.jsx(d,{isDesktop:!0,sections:g}),isDesktop:!0,mainClassName:"p-6",children:e.jsx(L,{})})},n={render:()=>e.jsx(o,{header:e.jsx(l,{brand:m,user:u,onToggleSidebar:()=>{},search:{triggerLabel:"검색",dialogPlaceholder:"작업번호, 품목명 검색..."},menuItems:p,onLogout:()=>{}}),sidebar:e.jsx(d,{isDesktop:!0,sections:g}),isDesktop:!0,mainClassName:"p-6",children:e.jsx(P,{})})},i={render:()=>e.jsx(o,{header:e.jsx(l,{brand:m,user:u,onToggleSidebar:()=>{},search:{triggerLabel:"검색",dialogPlaceholder:"작업번호, 품목명 검색..."},menuItems:p,onLogout:()=>{}}),sidebar:e.jsx(d,{isDesktop:!0,sections:g}),isDesktop:!0,mainClassName:"p-6",children:e.jsx(c,{workOrder:b,formValues:{goodQuantity:"40",defectQuantity:"2",workStartTime:"09:00",workEndTime:"12:20",memo:"조립 완료"},isSubmitting:!0,onBack:()=>{},onChange:()=>{},onSubmit:()=>{},onSaveDraft:()=>{},onCreateDefectRecord:()=>{}})})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "작업번호, 품목명 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-6">
      <InteractiveCreate />
    </AppShell>
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "작업번호, 품목명 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-6">
      <FilledCreate />
    </AppShell>
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "작업번호, 품목명 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-6">
      <OverPlanCreate />
    </AppShell>
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <AppShell header={<AppHeader brand={brand} user={mockUser} onToggleSidebar={() => {}} search={{
    triggerLabel: "검색",
    dialogPlaceholder: "작업번호, 품목명 검색..."
  }} menuItems={mockMenuItems} onLogout={() => {}} />} sidebar={<AppSidebar isDesktop sections={navSections} />} isDesktop mainClassName="p-6">
      <ProductionResultCreateScreen workOrder={mockWorkOrder} formValues={{
      goodQuantity: "40",
      defectQuantity: "2",
      workStartTime: "09:00",
      workEndTime: "12:20",
      memo: "조립 완료"
    }} isSubmitting onBack={() => {}} onChange={() => {}} onSubmit={() => {}} onSaveDraft={() => {}} onCreateDefectRecord={() => {}} />
    </AppShell>
}`,...i.parameters?.docs?.source}}};const H=["Default","Filled","OverPlan","Submitting"];export{s as Default,t as Filled,n as OverPlan,i as Submitting,H as __namedExportsOrder,U as default};
