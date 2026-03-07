import{j as e}from"./index-B4avf9CM.js";import{r as l}from"./iframe-DjFiVPSj.js";import{_ as i,B as c}from"./user-avatar-CJtlkw0_.js";const u={component:i,tags:["autodocs"],args:{title:"프로젝트를 삭제할까요?",description:"삭제 후에는 연결된 활동 내역과 초대 링크를 복구할 수 없습니다.",confirmLabel:"삭제",cancelLabel:"취소",variant:"destructive"},parameters:{layout:"centered"}},a={render:()=>{const[r,t]=l.useState(!1),[n,p]=l.useState(!1);return e.jsxs("div",{style:{display:"flex",gap:"12px",alignItems:"center"},children:[e.jsx(c,{variant:"destructive",onClick:()=>t(!0),children:"위험 작업"}),e.jsx(c,{variant:"outline",onClick:()=>p(!0),children:"일반 확인"}),e.jsx(i,{open:r,onOpenChange:t,onConfirm:()=>t(!1),title:"프로젝트를 삭제할까요?",description:"삭제 후에는 복구할 수 없습니다.",confirmLabel:"삭제",variant:"destructive"}),e.jsx(i,{open:n,onOpenChange:p,onConfirm:()=>p(!1),title:"멤버를 제거할까요?",description:"접근 권한이 즉시 해제됩니다.",confirmLabel:"제거",variant:"default"})]})}},s={render:r=>{const[t,n]=l.useState(!1);return e.jsxs("div",{className:"flex flex-col items-center gap-4",children:[e.jsx(c,{variant:"outline",onClick:()=>n(!0),children:"다이얼로그 열기"}),e.jsx(i,{...r,open:t,onOpenChange:n,onConfirm:()=>n(!1)})]})}},o={args:{title:"멤버를 제거할까요?",description:"멤버를 제거하면 프로젝트 접근 권한이 즉시 해제됩니다.",confirmLabel:"제거",variant:"default"},render:r=>{const[t,n]=l.useState(!1);return e.jsxs("div",{className:"flex flex-col items-center gap-4",children:[e.jsx(c,{variant:"outline",onClick:()=>n(!0),children:"다이얼로그 열기"}),e.jsx(i,{...r,open:t,onOpenChange:n,onConfirm:()=>n(!1)})]})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [openDestructive, setOpenDestructive] = React.useState(false);
    const [openDefault, setOpenDefault] = React.useState(false);
    return <div style={{
      display: "flex",
      gap: "12px",
      alignItems: "center"
    }}>
        <Button variant="destructive" onClick={() => setOpenDestructive(true)}>위험 작업</Button>
        <Button variant="outline" onClick={() => setOpenDefault(true)}>일반 확인</Button>
        <ConfirmDialog open={openDestructive} onOpenChange={setOpenDestructive} onConfirm={() => setOpenDestructive(false)} title="프로젝트를 삭제할까요?" description="삭제 후에는 복구할 수 없습니다." confirmLabel="삭제" variant="destructive" />
        <ConfirmDialog open={openDefault} onOpenChange={setOpenDefault} onConfirm={() => setOpenDefault(false)} title="멤버를 제거할까요?" description="접근 권한이 즉시 해제됩니다." confirmLabel="제거" variant="default" />
      </div>;
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [open, setOpen] = React.useState(false);
    return <div className="flex flex-col items-center gap-4">
        <Button variant="outline" onClick={() => setOpen(true)}>
          다이얼로그 열기
        </Button>
        <ConfirmDialog {...args} open={open} onOpenChange={setOpen} onConfirm={() => setOpen(false)} />
      </div>;
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    title: "멤버를 제거할까요?",
    description: "멤버를 제거하면 프로젝트 접근 권한이 즉시 해제됩니다.",
    confirmLabel: "제거",
    variant: "default"
  },
  render: args => {
    const [open, setOpen] = React.useState(false);
    return <div className="flex flex-col items-center gap-4">
        <Button variant="outline" onClick={() => setOpen(true)}>
          다이얼로그 열기
        </Button>
        <ConfirmDialog {...args} open={open} onOpenChange={setOpen} onConfirm={() => setOpen(false)} />
      </div>;
  }
}`,...o.parameters?.docs?.source}}};const f=["Showcase","Preview","DefaultTone"],g=Object.freeze(Object.defineProperty({__proto__:null,DefaultTone:o,Preview:s,Showcase:a,__namedExportsOrder:f,default:u},Symbol.toStringTag,{value:"Module"}));export{g as _};
