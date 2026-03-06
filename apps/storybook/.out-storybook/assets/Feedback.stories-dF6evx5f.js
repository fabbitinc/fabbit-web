import{j as e}from"./index-BC33NHKD.js";import{r as i}from"./iframe-BDY6rKdT.js";import{a6 as s,B as c,a7 as o,a8 as d,a9 as m,aa as x,ab as p,ac as u,ad as v,ae as g}from"./user-avatar-Cz1MQ_Sd.js";const f={component:s,tags:["autodocs"],parameters:{layout:"centered"}},n={render:()=>e.jsxs("div",{className:"flex min-w-[360px] flex-col gap-4 rounded-xl border p-5",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsx("span",{children:"도면 업로드"}),e.jsx("span",{className:"text-muted-foreground",children:"24%"})]}),e.jsx(s,{value:24})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsx("span",{children:"BOM 분석"}),e.jsx("span",{className:"text-muted-foreground",children:"66%"})]}),e.jsx(s,{value:66})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsx("span",{children:"검토 체크리스트"}),e.jsx("span",{className:"text-muted-foreground",children:"100%"})]}),e.jsx(s,{value:100})]})]})},a={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"360px"},children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsx("span",{children:"도면 업로드"}),e.jsx("span",{className:"text-muted-foreground",children:"24%"})]}),e.jsx(s,{value:24})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsx("span",{children:"BOM 분석"}),e.jsx("span",{className:"text-muted-foreground",children:"66%"})]}),e.jsx(s,{value:66})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsx("span",{children:"검토 체크리스트"}),e.jsx("span",{className:"text-muted-foreground",children:"100%"})]}),e.jsx(s,{value:100})]})]})},t={render:()=>{const[l,r]=i.useState(!1);return e.jsxs("div",{className:"flex flex-col items-center gap-4",children:[e.jsx(c,{variant:"outline",onClick:()=>r(!0),children:"위험 작업 확인"}),e.jsx(o,{open:l,onOpenChange:r,children:e.jsxs(d,{children:[e.jsxs(m,{children:[e.jsx(x,{children:"연동을 해제할까요?"}),e.jsx(p,{children:"해제하면 자동 동기화가 멈추고, 수동 업로드만 가능해집니다."})]}),e.jsxs(u,{children:[e.jsx(v,{children:"취소"}),e.jsx(g,{onClick:()=>r(!1),children:"해제"})]})]})})]})}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex min-w-[360px] flex-col gap-4 rounded-xl border p-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>도면 업로드</span>
          <span className="text-muted-foreground">24%</span>
        </div>
        <Progress value={24} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>BOM 분석</span>
          <span className="text-muted-foreground">66%</span>
        </div>
        <Progress value={66} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>검토 체크리스트</span>
          <span className="text-muted-foreground">100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "360px"
  }}>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>도면 업로드</span>
          <span className="text-muted-foreground">24%</span>
        </div>
        <Progress value={24} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>BOM 분석</span>
          <span className="text-muted-foreground">66%</span>
        </div>
        <Progress value={66} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>검토 체크리스트</span>
          <span className="text-muted-foreground">100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = React.useState(false);
    return <div className="flex flex-col items-center gap-4">
        <Button variant="outline" onClick={() => setOpen(true)}>
          위험 작업 확인
        </Button>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>연동을 해제할까요?</AlertDialogTitle>
              <AlertDialogDescription>
                해제하면 자동 동기화가 멈추고, 수동 업로드만 가능해집니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={() => setOpen(false)}>
                해제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>;
  }
}`,...t.parameters?.docs?.source}}};const j=["ProgressStates","Showcase","AlertDialogPreview"],D=Object.freeze(Object.defineProperty({__proto__:null,AlertDialogPreview:t,ProgressStates:n,Showcase:a,__namedExportsOrder:j,default:f},Symbol.toStringTag,{value:"Module"}));export{D as _};
